import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminUser() {
    const supabase = await createClient();

    // Verify the session with Supabase Auth.
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    // Confirm this is a Google-authenticated account.
    const googleIdentity = user.identities?.some(
        (identity) => identity.provider === "google"
    );

    if (!googleIdentity) {
        return null;
    }

    // Check the administrator flag using a server-only client.
    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.is_superadmin !== true) {
        return null;
    }

    return user;
}