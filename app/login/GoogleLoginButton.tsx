"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleLoginButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin() {
        setLoading(true);
        setError("");

        const supabase = createClient();
        console.log(
            "Google OAuth redirect:",
            `${window.location.origin}/auth/callback`
        );
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
                {loading ? "Redirecting to Google..." : "Continue with Google"}
            </button>

            {error && (
                <p role="alert" className="text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}