import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/app/components/AdminSidebar";
import SignOutButton from "@/app/components/SignOutButton";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
    const admin = await getAdminUser();

    if (!admin) {
        redirect("/login");
    }

    const supabase = createAdminClient();

    const { data: users, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, created_at, is_superadmin")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Failed to load users");
    }

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <AdminSidebar />

            <main className="min-w-0 flex-1">
                <header className="border-b border-white/10 px-8 py-5">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                🥊 Caption Fight Club
                            </h1>
                            <p className="text-sm text-gray-400">
                                Control Room
                            </p>
                        </div>

                        <SignOutButton />
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-8 py-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Users
                        </h2>

                        <p className="mt-2 text-gray-400">
                            View and explore registered members.
                        </p>
                    </div>

                    <UsersTable users={users ?? []} />
                </div>
            </main>
        </div>
    );
}