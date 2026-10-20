import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/app/components/AdminSidebar";
import SignOutButton from "@/app/components/SignOutButton";
import VotesTable from "./VotesTable";

export default async function VotesPage() {
    const admin = await getAdminUser();

    if (!admin) {
        redirect("/login");
    }

    const supabase = createAdminClient();

    const { data: votes, error } = await supabase
        .from("votes")
        .select("id, user_id, caption_id, value, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Failed to load votes");
    }

    const captionIds = [
        ...new Set((votes ?? []).map((vote) => vote.caption_id)),
    ];

    const { data: captions, error: captionsError } =
        captionIds.length > 0
            ? await supabase
                .from("captions")
                .select("id, text")
                .in("id", captionIds)
            : { data: [], error: null };

    if (captionsError) {
        throw new Error("Failed to load captions");
    }

    const captionMap = new Map(
        (captions ?? []).map((caption) => [caption.id, caption.text])
    );

    const enrichedVotes = (votes ?? []).map((vote) => ({
        ...vote,
        caption_text: captionMap.get(vote.caption_id) ?? "Unknown caption",
    }));

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
                            Votes
                        </h2>

                        <p className="mt-2 text-gray-400">
                            Explore voting activity across all captions.
                        </p>
                    </div>

                    <VotesTable votes={enrichedVotes} />
                </div>
            </main>
        </div>
    );
}