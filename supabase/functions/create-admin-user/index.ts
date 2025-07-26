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

    // Verificar se o usuário admin já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById("00000000-0000-0000-0000-000000000001");
    
    if (existingUser.user) {
      return new Response(
        JSON.stringify({ message: "Admin user already exists" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Criar usuário admin no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@envialead.com.br",
      password: "Admin123!",
      email_confirm: true,
      user_metadata: {
        full_name: "Desenvolvedor Sistema",
        company_id: "00000000-0000-0000-0000-000000000001",
      }
    });

    if (authError) {
      throw authError;
    }

    // Atualizar o perfil com os dados corretos
    if (authData.user) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: "Desenvolvedor Sistema",
          role: "admin",
          company_id: "00000000-0000-0000-0000-000000000001",
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        message: "Admin user created successfully. Email: admin@envialead.com.br, Password: Admin123!"
      }),
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