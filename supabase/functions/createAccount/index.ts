import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
   "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
   if (req.method == "OPTIONS") {
      return new Response("ok", { status: 200, headers: corsHeaders });
   }

   try {
      const { email, password, username } = await req.json();

      console.log(`Creating account ${email}/${username}`);

      const supabase = createClient(
         Deno.env.get("SUPABASE_URL")!,
         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      // Step 1: Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
         email,
         password,
         options: {
            emailRedirectTo: `https://funkyscout.vercel.app/auth/verify`,
         },
      });

      if (signUpError) {
         console.log("Signup Error: " + signUpError.message);
         return new Response(
            JSON.stringify({ error: signUpError.message }),
            {
               headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
               },
               status: 400,
            },
         );
      }

      const uid = data?.user?.id;

      if (!uid) {
         console.log("Could not get UUID");
         return new Response(
            JSON.stringify({ error: "Could not find your UUID" }),
            {
               headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
               },
               status: 400,
            },
         );
      }

      console.log(`Using UUID ${uid}`);

      // Step 2: Insert username into the user_profiles table
      const { error: profileError } = await supabase
         .from("user_profiles")
         .update({ name: username })
         .eq("uid", uid)
         .select();

      if (profileError) {
         console.log("Username Assignment Error: " + profileError.message);
         return new Response(
            JSON.stringify({ error: profileError.message }),
            {
               headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
               },
               status: 400,
            },
         );
      }

      // Respond with success
      return new Response(
         JSON.stringify({
            message: "User created and profile inserted successfully.",
         }),
         {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
         },
      );
   } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 500,
      });
   }
});
