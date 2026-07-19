import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    requireSupabaseConfig()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) throw error

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  },

  async uploadDocument(
    bucket: string,
    path: string,
    file: File,
  ): Promise<string> {
    requireSupabaseConfig()
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
}
