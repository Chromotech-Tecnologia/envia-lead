
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

    // Criar ou atualizar usuário admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@envialead.com.br',
      password: 'admin',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Master',
        company_name: 'Envia Lead Master',
      }
    });

    if (authError && authError.message !== "User already registered") {
      console.error('Erro ao criar usuário admin:', authError);
      throw authError;
    }

    // Se usuário já existe, apenas atualizar a senha
    if (authError?.message === "User already registered") {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const adminUser = users.users.find(u => u.email === 'admin@envialead.com.br');
      
      if (adminUser) {
        await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
          password: 'admin'
        });
      }
    }

    console.log('Admin criado/atualizado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin password reset to 'admin'" 
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
