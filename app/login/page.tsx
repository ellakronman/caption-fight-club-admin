import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import GoogleLoginButton from "./GoogleLoginButton";

export default async function LoginPage() {
    const admin = await getAdminUser();

    if (admin) {
        redirect("/");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-4 text-5xl">🥊</div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Caption Fight Club
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Control Room
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#18181b] p-8 shadow-2xl">
                    <h2 className="mb-2 text-xl font-semibold">
                        Administrator Sign In
                    </h2>

                    <p className="mb-6 text-sm leading-relaxed text-gray-400">
                        Sign in with your authorized Google account to
                        access the admin dashboard.
                    </p>

                    <GoogleLoginButton />
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Restricted access · Authorized administrators only
                </p>
            </div>
        </main>
    );
}