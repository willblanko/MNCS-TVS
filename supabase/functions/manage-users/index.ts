import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    // Verify caller is admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Forbidden: admin access required')

    const body = await req.json()
    const { action, email, password, name, role, userId } = body

    let result

    if (action === 'list') {
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) throw listError

      const { data: profiles } = await supabase.from('profiles').select('id, name, role, avatar_url')
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

      result = (authUsers.users ?? []).map((u: any) => {
        const p = profileMap.get(u.id) ?? {}
        return {
          id: u.id,
          email: u.email,
          name: p.name ?? u.user_metadata?.name ?? '',
          role: p.role ?? 'user',
          avatar_url: p.avatar_url ?? '',
          created_at: u.created_at,
        }
      })
    } else if (action === 'create') {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })
      if (error) throw error
      result = data.user

      if (result) {
        await supabase.from('profiles').update({ name, role: role ?? 'user' }).eq('id', result.id)
      }
    } else if (action === 'update') {
      if (!userId) throw new Error('User ID is required for update')
      const updateData: any = {}
      if (password) updateData.password = password
      if (email) updateData.email = email
      if (name) updateData.user_metadata = { name }

      const { data, error } = await supabase.auth.admin.updateUserById(userId, updateData)
      if (error) throw error
      result = data.user

      const profileUpdate: any = {}
      if (name !== undefined) profileUpdate.name = name
      if (role !== undefined) profileUpdate.role = role
      if (Object.keys(profileUpdate).length > 0) {
        await supabase.from('profiles').update(profileUpdate).eq('id', userId)
      }
    } else if (action === 'delete') {
      if (!userId) throw new Error('User ID is required for deletion')
      const { data, error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      result = data.user
    } else {
      throw new Error('Invalid action')
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
