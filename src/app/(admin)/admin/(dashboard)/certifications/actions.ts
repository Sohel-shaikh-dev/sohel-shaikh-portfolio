'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function deleteStorageFile(path: string | null | undefined) {
  if (!path) return;
  const supabase = await createClient()
  const { error } = await supabase.storage.from('portfolio-media').remove([path])
  if (error) {
    console.error(`[deleteStorageFile] Failed to delete file: ${path}`, error);
  }
}

export async function addCertification(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').insert([data])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}

export async function deleteCertification(id: string) {
  try {
    const supabase = await createClient()
    
    // Fetch existing certification to find files to delete
    const { data: cert } = await supabase.from('certifications').select('thumbnail_path, organization_logo_path, pdf_file_path').eq('id', id).single()
    
    const { error } = await supabase.from('certifications').delete().eq('id', id)
    if (error) {
      console.error(`[deleteCertification] Database deletion failed for certification ID: ${id}`, error);
      throw new Error(error.message)
    }

    // Transaction safe: cleanup storage AFTER DB deletion
    if (cert) {
      await deleteStorageFile(cert.thumbnail_path)
      await deleteStorageFile(cert.organization_logo_path)
      await deleteStorageFile(cert.pdf_file_path)
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateCertification(id: string, data: any) {
  const supabase = await createClient()
  
  // Fetch existing certification to check for replaced files
  const { data: cert } = await supabase.from('certifications').select('thumbnail_path, organization_logo_path, pdf_file_path').eq('id', id).single()
  
  const { error } = await supabase.from('certifications').update(data).eq('id', id)
  if (error) {
    console.error(`[updateCertification] Database update failed for certification ID: ${id}`, error);
    throw new Error(error.message)
  }

  // Transaction safe: cleanup storage AFTER DB update
  if (cert) {
    if (cert.thumbnail_path && cert.thumbnail_path !== data.thumbnail_path) {
      await deleteStorageFile(cert.thumbnail_path)
    }
    if (cert.organization_logo_path && cert.organization_logo_path !== data.organization_logo_path) {
      await deleteStorageFile(cert.organization_logo_path)
    }
    if (cert.pdf_file_path && cert.pdf_file_path !== data.pdf_file_path) {
      await deleteStorageFile(cert.pdf_file_path)
    }
  }

  revalidatePath('/')
}
