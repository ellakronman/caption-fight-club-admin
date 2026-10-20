export function checkSupabaseConfig() {
    const required = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
    ];

    const missing = required.filter(
        (name) => !process.env[name]
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing environment variables: ${missing.join(", ")}`
        );
    }

    return true;
}