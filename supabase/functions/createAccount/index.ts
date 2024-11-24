import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
    });

    if (signUpError) {
      console.log("Signup Error: " + signUpError.message);
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 400,
      });
    }

    const uid = data?.user?.id;

    if (!uid) {
      console.log("Could not get UUID");
      return new Response(
        JSON.stringify({ error: "Could not find your UUID" }),
        { status: 400 },
      );
    }

    console.log(`Using UUID ${uid}`)

    // Step 2: Insert username into the user_profiles table
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ name: username })
      .eq("uid", uid)
      .select();

    if (profileError) {
      console.log("Username Assignment Error: " + profileError.message);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
      });
    }

    // Respond with success
    return new Response(
      JSON.stringify({
        message: "User created and profile inserted successfully.",
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});