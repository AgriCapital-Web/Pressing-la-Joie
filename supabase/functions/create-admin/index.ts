import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("Create-admin function called, method:", req.method);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin secret from environment variable
    const expectedSecret = Deno.env.get("ADMIN_INIT_SECRET");
    const authHeader = req.headers.get("x-admin-secret");
    
    console.log("Auth header received:", authHeader ? "present" : "missing");
    console.log("Expected secret configured:", expectedSecret ? "yes" : "no");
    
    if (!expectedSecret) {
      console.log("ADMIN_INIT_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Admin initialization not configured", success: false }),
        { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (authHeader !== expectedSecret) {
      console.log("Unauthorized access attempt - secrets don't match");
      return new Response(
        JSON.stringify({ error: "Unauthorized", success: false }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL:", supabaseUrl ? "configured" : "missing");
    console.log("Service role key:", supabaseServiceRoleKey ? "configured" : "missing");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get admin credentials from environment variables
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    
    if (!adminEmail || !adminPassword) {
      console.log("Admin credentials not configured");
      return new Response(
        JSON.stringify({ error: "Admin credentials not configured", success: false }),
        { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if admin user exists
    console.log("Checking if admin exists...");
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const existingAdmin = existingUsers?.users?.find(
      (user) => user.email === adminEmail
    );

    if (existingAdmin) {
      console.log("Admin user exists, checking role and profile...");
      
      // Check if role exists
      const { data: roleData, error: roleCheckError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleCheckError) {
        console.error("Error checking role:", roleCheckError);
      }

      if (!roleData) {
        console.log("Adding admin role to existing user...");
        const { error: roleInsertError } = await supabase
          .from("user_roles")
          .insert({
            user_id: existingAdmin.id,
            role: "admin",
          });

        if (roleInsertError) {
          console.error("Error inserting role:", roleInsertError);
        }
      }

      // Check if profile exists
      const { data: profileData, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", existingAdmin.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error("Error checking profile:", profileCheckError);
      }

      if (!profileData) {
        console.log("Creating profile for existing user...");
        const { error: profileInsertError } = await supabase
          .from("profiles")
          .insert({
            user_id: existingAdmin.id,
            first_name: "Inocent",
            last_name: "KOFFI",
            phone: "0759566087",
          });

        if (profileInsertError) {
          console.error("Error inserting profile:", profileInsertError);
        }
      }

      return new Response(
        JSON.stringify({ 
          message: "Admin already exists", 
          success: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new admin user
    console.log("Creating new admin user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: "Inocent",
        last_name: "KOFFI",
      }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }

    console.log("Admin user created successfully");

    // Add admin role and profile
    if (newUser?.user) {
      console.log("Adding admin role...");
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: newUser.user.id,
        role: "admin",
      });

      if (roleError) {
        console.error("Error adding role:", roleError);
        throw roleError;
      }
      console.log("Admin role added successfully");

      // Create profile
      console.log("Creating admin profile...");
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: newUser.user.id,
        first_name: "Inocent",
        last_name: "KOFFI",
        phone: "0759566087",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't throw, profile creation is not critical
      } else {
        console.log("Admin profile created successfully");
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin created successfully", 
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred", success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
