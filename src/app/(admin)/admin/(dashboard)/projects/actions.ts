'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'

export async function addProject(data: any) {
  const supabase = await createClient()

  // Separate main project data from relations
  const {
    project_gallery,
    project_statistics,
    project_insights,
    project_technologies,
    ...projectData
  } = data

  if (!projectData.slug && projectData.title) {
    projectData.slug = generateSlug(projectData.title);
  }

  // Check for duplicate slug
  const { data: existing } = await supabase.from('projects').select('id').eq('slug', projectData.slug).single();
  if (existing) {
    projectData.slug = `${projectData.slug}-${Math.floor(Math.random() * 10000)}`;
  }

  // 1. Insert main project
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const projectId = newProject.id

  // 2. Insert relations if any
  if (project_gallery && project_gallery.length > 0) {
    const galleryData = project_gallery.map((g: any, i: number) => ({
      project_id: projectId,
      image_url: g.image_url,
      sort_order: i
    }))
    await supabase.from('project_gallery').insert(galleryData)
  }

  if (project_statistics && project_statistics.length > 0) {
    const statsData = project_statistics.map((s: any, i: number) => ({
      project_id: projectId,
      label: s.label,
      value: s.value,
      sort_order: i
    }))
    await supabase.from('project_statistics').insert(statsData)
  }

  if (project_insights && project_insights.length > 0) {
    const insightsData = project_insights.map((ins: any, i: number) => ({
      project_id: projectId,
      insight: ins.insight,
      sort_order: i
    }))
    await supabase.from('project_insights').insert(insightsData)
  }

  if (project_technologies && project_technologies.length > 0) {
    const techData = project_technologies.map((t: any, i: number) => ({
      project_id: projectId,
      technology: t.technology,
      sort_order: i
    }))
    await supabase.from('project_technologies').insert(techData)
  }

  revalidatePath('/')
  if (projectData.slug) revalidatePath(`/projects/${projectData.slug}`)
  return { success: true, slug: projectData.slug }
}

export async function updateProject(id: string, data: any) {
  const supabase = await createClient()
  
  // Separate main project data from relations
  const {
    project_gallery,
    project_statistics,
    project_insights,
    project_technologies,
    ...projectData
  } = data

  if (!projectData.slug && projectData.title) {
    projectData.slug = generateSlug(projectData.title);
  }

  // Check for duplicate slug
  const { data: existingDup } = await supabase.from('projects').select('id').eq('slug', projectData.slug).neq('id', id).single();
  if (existingDup) {
    projectData.slug = `${projectData.slug}-${Math.floor(Math.random() * 10000)}`;
  }

  // 1. Fetch existing project to compare file paths for old legacy columns (optional cleanup)
  const { data: existing } = await supabase.from('projects').select('*').eq('id', id).single()
  const filesToDelete: string[] = []
  
  if (existing) {
    if (existing.thumbnail_path && projectData.thumbnail_path && existing.thumbnail_path !== projectData.thumbnail_path) {
      filesToDelete.push(existing.thumbnail_path)
    }
    if (existing.pdf_export_path && projectData.pdf_export_path && existing.pdf_export_path !== projectData.pdf_export_path) {
      filesToDelete.push(existing.pdf_export_path)
    }
    if (existing.pbix_file_path && projectData.pbix_file_path && existing.pbix_file_path !== projectData.pbix_file_path) {
      filesToDelete.push(existing.pbix_file_path)
    }
  }

  // 2. Update main project
  const { error } = await supabase.from('projects').update(projectData).eq('id', id)
  if (error) {
    console.error(`[updateProject] Database update failed for project ID: ${id}`, error);
    throw new Error(error.message)
  }

  // 3. Update relations (simplest way is to delete old and insert new)
  
  // Gallery
  if (project_gallery !== undefined) {
    await supabase.from('project_gallery').delete().eq('project_id', id)
    if (project_gallery.length > 0) {
      const galleryData = project_gallery.map((g: any, i: number) => ({
        project_id: id,
        image_url: g.image_url,
        sort_order: i
      }))
      await supabase.from('project_gallery').insert(galleryData)
    }
  }

  // Statistics
  if (project_statistics !== undefined) {
    await supabase.from('project_statistics').delete().eq('project_id', id)
    if (project_statistics.length > 0) {
      const statsData = project_statistics.map((s: any, i: number) => ({
        project_id: id,
        label: s.label,
        value: s.value,
        sort_order: i
      }))
      await supabase.from('project_statistics').insert(statsData)
    }
  }

  // Insights
  if (project_insights !== undefined) {
    await supabase.from('project_insights').delete().eq('project_id', id)
    if (project_insights.length > 0) {
      const insightsData = project_insights.map((ins: any, i: number) => ({
        project_id: id,
        insight: ins.insight,
        sort_order: i
      }))
      await supabase.from('project_insights').insert(insightsData)
    }
  }

  // Technologies
  if (project_technologies !== undefined) {
    await supabase.from('project_technologies').delete().eq('project_id', id)
    if (project_technologies.length > 0) {
      const techData = project_technologies.map((t: any, i: number) => ({
        project_id: id,
        technology: t.technology,
        sort_order: i
      }))
      await supabase.from('project_technologies').insert(techData)
    }
  }

  // Transaction Safe: Cleanup storage AFTER successful database update
  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage.from('portfolio-media').remove(filesToDelete)
    if (storageError) {
      console.error(`[updateProject] Storage cleanup failed for project ID: ${id}`, storageError);
    }
  }

  revalidatePath('/')
  if (projectData.slug) revalidatePath(`/projects/${projectData.slug}`)
  return { success: true, slug: projectData.slug }
}

export async function deleteProject(id: string) {
  try {
    const supabase = await createClient()
    
    // Fetch project to get slug and file paths
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    
    // Database delete first (This will cascade delete relations due to ON DELETE CASCADE)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      console.error(`[deleteProject] Database deletion failed for project ID: ${id}`, error);
      throw new Error(error.message)
    }
    
    // Transaction Safe: Cleanup storage AFTER successful database deletion
    if (project) {
      // Clean up legacy files
      const filesToDelete = []
      if (project.thumbnail_path) filesToDelete.push(project.thumbnail_path)
      if (project.pdf_export_path) filesToDelete.push(project.pdf_export_path)
      if (project.pbix_file_path) filesToDelete.push(project.pbix_file_path)
      
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage.from('portfolio-media').remove(filesToDelete)
        if (storageError) {
          console.error(`[deleteProject] Storage cleanup failed for files: ${filesToDelete.join(', ')}`, storageError);
        }
      }

      // Clean up the entire project folder if slug exists
      if (project.slug) {
        const folderPath = `project-images/${project.slug}`
        
        // Supabase requires listing all files in a folder before deleting them
        const { data: folderFiles } = await supabase.storage
          .from('portfolio-media')
          .list(folderPath)

        if (folderFiles && folderFiles.length > 0) {
          const filesToRemove = folderFiles.map(f => `${folderPath}/${f.name}`)
          const { error: folderStorageError } = await supabase.storage.from('portfolio-media').remove(filesToRemove)
          if (folderStorageError) {
            console.error(`[deleteProject] Folder storage cleanup failed for: ${folderPath}`, folderStorageError);
          }
        }
      }
    }
    
    revalidatePath('/')
    if (project?.slug) revalidatePath(`/projects/${project.slug}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
