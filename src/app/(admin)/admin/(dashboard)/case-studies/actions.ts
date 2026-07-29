'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'

export async function addCaseStudy(data: any) {
  const supabase = await createClient()

  const { gallery, metrics, insights, recommendations, challenges, learnings, ...mainData } = data;

  // Auto-generate slug if not provided
  if (!mainData.slug) {
    mainData.slug = generateSlug(mainData.title || '');
  }

  // 1. Check for duplicate slug
  const { data: existing } = await supabase.from('case_studies').select('id').eq('slug', mainData.slug).single();
  if (existing) {
    mainData.slug = `${mainData.slug}-${Math.floor(Math.random() * 10000)}`;
  }

  // 2. Insert into main table
  const { data: insertedStudy, error: studyError } = await supabase
    .from('case_studies')
    .insert([mainData])
    .select()
    .single();

  if (studyError) throw new Error(studyError.message);

  const studyId = insertedStudy.id;

  // 3. Insert related data
  await insertRelatedData(supabase, studyId, { gallery, metrics, insights, recommendations, challenges, learnings });

  revalidatePath('/admin/case-studies', 'layout');
  revalidatePath('/');
  if (mainData.slug) revalidatePath(`/case-studies/${mainData.slug}`);
  return { success: true, slug: mainData.slug }
}

export async function updateCaseStudy(id: string, data: any) {
  const supabase = await createClient()

  const { gallery, metrics, insights, recommendations, challenges, learnings, ...mainData } = data;

  // If slug is somehow empty, generate it
  if (!mainData.slug && mainData.title) {
    mainData.slug = generateSlug(mainData.title);
  }

  // Check for duplicate slug
  const { data: existingDup } = await supabase.from('case_studies').select('id').eq('slug', mainData.slug).neq('id', id).single();
  if (existingDup) {
    mainData.slug = `${mainData.slug}-${Math.floor(Math.random() * 10000)}`;
  }

  // Pre-fetch existing data to find orphaned files
  const { data: existingStudy } = await supabase.from('case_studies').select('cover_image_path, og_image').eq('id', id).single();
  const { data: existingGallery } = await supabase.from('case_study_gallery').select('image_path').eq('case_study_id', id);

  // 1. Update main table
  const { error: studyError } = await supabase
    .from('case_studies')
    .update(mainData)
    .eq('id', id);

  if (studyError) {
    console.error(`[updateCaseStudy] Database update failed for case study ID: ${id}`, studyError);
    throw new Error(studyError.message);
  }

  // 2. Delete existing related data (simplest way to update lists)
  await deleteRelatedData(supabase, id);

  // 3. Re-insert related data
  await insertRelatedData(supabase, id, { gallery, metrics, insights, recommendations, challenges, learnings });

  // 4. Transaction Safe: Cleanup orphaned files in storage AFTER successful DB update
  const filesToDelete: string[] = [];

  if (existingStudy) {
    if (existingStudy.cover_image_path && existingStudy.cover_image_path !== mainData.cover_image_path) {
      filesToDelete.push(existingStudy.cover_image_path);
    }
    if (existingStudy.og_image && existingStudy.og_image !== mainData.og_image) {
      filesToDelete.push(existingStudy.og_image);
    }
  }

  if (existingGallery && existingGallery.length > 0) {
    // Find images that were in the old gallery but are NOT in the new gallery
    const newGalleryPaths = gallery?.map((g: any) => g.image_path || g.image_url || g) || [];
    existingGallery.forEach((g: any) => {
      if (g.image_path && !newGalleryPaths.includes(g.image_path)) {
        filesToDelete.push(g.image_path);
      }
    });
  }

  if (filesToDelete.length > 0) {
    console.log(`[updateCaseStudy] Cleaning up ${filesToDelete.length} orphaned files:`, filesToDelete);
    const { error: storageError } = await supabase.storage.from('portfolio-media').remove(filesToDelete);
    if (storageError) {
      console.error(`[updateCaseStudy] Storage cleanup failed for orphaned files`, storageError);
    }
  }

  revalidatePath('/admin/case-studies', 'layout');
  revalidatePath('/');
  if (mainData.slug) revalidatePath(`/case-studies/${mainData.slug}`);
  return { success: true, slug: mainData.slug }
}

export async function deleteCaseStudy(id: string) {
  try {
    console.log(`[deleteCaseStudy] Starting permanent delete for case study ID: ${id}`);
    const supabase = await createClient()
    
    // 1. Fetch case study details (cover_image_path, og_image)
    const { data: study, error: fetchError } = await supabase
      .from('case_studies')
      .select('slug, cover_image_path, og_image')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`[deleteCaseStudy] Failed to fetch case study details: ${fetchError.message}`);
      throw new Error(`Failed to fetch case study: ${fetchError.message}`);
    }

    // 2. Fetch gallery images
    const { data: gallery, error: galleryError } = await supabase
      .from('case_study_gallery')
      .select('image_path')
      .eq('case_study_id', id);

    if (galleryError) {
      console.error(`[deleteCaseStudy] Failed to fetch gallery images: ${galleryError.message}`);
      throw new Error(`Failed to fetch gallery images: ${galleryError.message}`);
    }

    // 3. Delete the case study record FIRST (cascading deletes handle child records)
    const { error: deleteError } = await supabase
      .from('case_studies')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      console.error(`[deleteCaseStudy] Database deletion failed: ${deleteError.message}`);
      throw new Error(`Failed to delete case study record: ${deleteError.message}`);
    }

    // 4. Transaction Safe: Collect and delete storage paths AFTER successful DB deletion
    const pathsToDelete: string[] = [];
    if (study?.cover_image_path) pathsToDelete.push(study.cover_image_path);
    if (study?.og_image) pathsToDelete.push(study.og_image);
    
    if (gallery && gallery.length > 0) {
      gallery.forEach((g: any) => {
        if (g.image_path) pathsToDelete.push(g.image_path);
      });
    }

    if (pathsToDelete.length > 0) {
      console.log(`[deleteCaseStudy] Deleting ${pathsToDelete.length} files from storage:`, pathsToDelete);
      const { error: storageError } = await supabase.storage
        .from('portfolio-media')
        .remove(pathsToDelete);
        
      if (storageError) {
        console.error(`[deleteCaseStudy] Storage cleanup failed (DB delete was successful): ${storageError.message}`);
      }
    }

    console.log(`[deleteCaseStudy] Successfully deleted case study ID: ${id}`);
    revalidatePath('/admin/case-studies', 'layout');
    revalidatePath('/');
    if (study?.slug) revalidatePath(`/case-studies/${study.slug}`);
    return { success: true }
  } catch (err: any) {
    console.error(`[deleteCaseStudy] Error: ${err.message}`);
    return { success: false, error: err.message }
  }
}

export async function updateCaseStudyOrder(id: string, order: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('case_studies')
    .update({ order })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/case-studies', 'layout');
  revalidatePath('/');
  return { success: true }
}

async function insertRelatedData(supabase: any, studyId: string, { gallery, metrics, insights, recommendations, challenges, learnings }: any) {
  if (gallery && gallery.length > 0) {
    const records = gallery.map((g: any, i: number) => ({ case_study_id: studyId, image_path: g.image_path || g.image_url || (typeof g === 'string' ? g : ''), display_order: i }));
    await supabase.from('case_study_gallery').insert(records);
  }
  
  if (metrics && metrics.length > 0) {
    const records = metrics.map((m: any, i: number) => ({ case_study_id: studyId, label: m.label, value: m.value, display_order: i }));
    await supabase.from('case_study_metrics').insert(records);
  }
  
  if (insights && insights.length > 0) {
    const records = insights.map((insight: any, i: number) => ({ case_study_id: studyId, description: insight.description || insight, display_order: i }));
    await supabase.from('case_study_insights').insert(records);
  }

  if (recommendations && recommendations.length > 0) {
    const records = recommendations.map((r: any, i: number) => ({ case_study_id: studyId, description: r.description || r, display_order: i }));
    await supabase.from('case_study_recommendations').insert(records);
  }

  if (challenges && challenges.length > 0) {
    const records = challenges.map((c: any, i: number) => ({ case_study_id: studyId, description: c.description || c, display_order: i }));
    await supabase.from('case_study_challenges').insert(records);
  }

  if (learnings && learnings.length > 0) {
    const records = learnings.map((l: any, i: number) => ({ case_study_id: studyId, description: l.description || l, display_order: i }));
    await supabase.from('case_study_learnings').insert(records);
  }
}

async function deleteRelatedData(supabase: any, studyId: string) {
  await supabase.from('case_study_gallery').delete().eq('case_study_id', studyId);
  await supabase.from('case_study_metrics').delete().eq('case_study_id', studyId);
  await supabase.from('case_study_insights').delete().eq('case_study_id', studyId);
  await supabase.from('case_study_recommendations').delete().eq('case_study_id', studyId);
  await supabase.from('case_study_challenges').delete().eq('case_study_id', studyId);
  await supabase.from('case_study_learnings').delete().eq('case_study_id', studyId);
}
