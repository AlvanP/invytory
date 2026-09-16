import { supabase } from './supabaseClient'

const BUCKET = 'invitation-photos'

/** Uploads a photo to Supabase Storage and returns its public URL. */
export const storageService = {
  async uploadImage(file: File, folder: 'hero' | 'gallery'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  },
}