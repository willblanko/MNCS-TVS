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
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const body = await req.json()
    const { action, email, password, name, userId } = body

    let result
    if (action === 'create') {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })
      if (error) throw error
      result = data.user

      if (result) {
        await supabase.from('profiles').update({ name }).eq('id', result.id)
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

      if (name !== undefined) {
        await supabase.from('profiles').update({ name }).eq('id', userId)
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
