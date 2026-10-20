"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSignOut() {
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Sign-out failed:", error.message);
            setLoading(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        >
            {loading ? "Signing out..." : "Sign Out"}
        </button>
    );
}