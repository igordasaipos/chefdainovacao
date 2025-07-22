
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password } = await req.json()

    console.log(`Tentativa de registro admin para email: ${email}`)

    // Verificar se o email está na lista de admins permitidos
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single()

    if (adminError || !adminData) {
      console.log(`Email ${email} não está na lista de admins`)
      return new Response(
        JSON.stringify({ error: 'Email não autorizado para acesso administrativo' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Tentar registrar o usuário usando o Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.log(`Erro ao criar usuário admin: ${authError.message}`)
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Usuário admin criado com sucesso: ${email}`)

    return new Response(
      JSON.stringify({ 
        message: 'Usuário admin criado com sucesso',
        user: authData.user 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro na função register-admin:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
