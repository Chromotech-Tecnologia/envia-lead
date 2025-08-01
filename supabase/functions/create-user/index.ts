
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, role, company_id } = await req.json();

    // Validar entrada
    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Criar usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        company_id,
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado corretamente');
    }

    console.log('Usuário criado no auth:', authData.user.id);

    // Criar perfil usando a função do banco de dados
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .rpc('create_user_profile', {
        user_id: authData.user.id,
        user_email: email,
        user_full_name: full_name,
        user_role: role,
        user_company_id: company_id,
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Tentar deletar o usuário criado no auth se não conseguiu criar o perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao criar perfil do usuário: ${profileError.message}`);
    }

    if (!profileResult) {
      console.error('Função create_user_profile retornou false');
      // Tentar deletar o usuário criado no auth se não conseguiu criar o perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Falha ao criar perfil do usuário');
    }

    console.log('Perfil criado com sucesso para:', email);

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
