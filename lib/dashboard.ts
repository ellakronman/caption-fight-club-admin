import "server-only";

import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardStats() {
    // Every privileged database operation must verify authorization.
    const user = await getAdminUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const supabase = createAdminClient();

    // Fetch exact database counts.
    const [
        profiles,
        images,
        captions,
        votes,
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("images").select("*", { count: "exact", head: true }),
        supabase.from("captions").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
    ]);

    for (const result of [profiles, images, captions, votes]) {
        if (result.error) {
            throw new Error("Failed to load dashboard statistics");
        }
    }

    // Fetch recent images for the gallery.
    const { data: recentImages, error: imagesError } = await supabase
        .from("images")
        .select("id, image_url, description, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

    if (imagesError) {
        throw new Error("Failed to load recent images");
    }

    // Fetch captions and votes for analytics.
    // Paginate so results are not silently truncated by Supabase's
    // default maximum rows per response.
    async function fetchAllRows<T>(
        table: "captions" | "votes",
        columns: string
    ): Promise<T[]> {
        const allRows: T[] = [];
        const pageSize = 1000;

        for (let start = 0; ; start += pageSize) {
            const { data, error } = await supabase
                .from(table)
                .select(columns)
                .range(start, start + pageSize - 1);

            if (error) {
                console.error(`Analytics query failed for ${table}:`, error);
                throw new Error("Failed to load analytics data");
            }

            const rows = (data ?? []) as T[];
            allRows.push(...rows);

            if (rows.length < pageSize) {
                break;
            }
        }

        return allRows;
    }

    type CaptionRow = {
        id: string;
        text: string;
    };

    type VoteRow = {
        caption_id: string;
        value: number;
    };

    const [allCaptions, allVotes] = await Promise.all([
        fetchAllRows<CaptionRow>("captions", "id, text"),
        fetchAllRows<VoteRow>("votes", "caption_id, value"),
    ]);

    // Calculate positive and negative vote totals.
    const positiveVotes = allVotes.filter(
        (vote) => vote.value === 1
    ).length;

    const negativeVotes = allVotes.filter(
        (vote) => vote.value === -1
    ).length;

    // Calculate score and vote count for each caption.
    const captionScores = new Map<
        string,
        { score: number; voteCount: number }
    >();

    for (const vote of allVotes) {
        const existing = captionScores.get(vote.caption_id) ?? {
            score: 0,
            voteCount: 0,
        };

        existing.score += vote.value;
        existing.voteCount += 1;

        captionScores.set(vote.caption_id, existing);
    }

    // Rank captions by score, then vote count.
    const topCaptions = allCaptions
        .map((caption) => {
            const result = captionScores.get(caption.id) ?? {
                score: 0,
                voteCount: 0,
            };

            return {
                id: caption.id,
                text: caption.text,
                score: result.score,
                voteCount: result.voteCount,
            };
        })
        .sort(
            (a, b) =>
                b.score - a.score ||
                b.voteCount - a.voteCount ||
                a.id.localeCompare(b.id)
        )
        .slice(0, 5);

    const totalImages = images.count ?? 0;
    const totalCaptions = captions.count ?? 0;
    const totalVotes = votes.count ?? 0;

    const averageVotesPerImage =
        totalImages > 0 ? totalVotes / totalImages : 0;

    const averageCaptionsPerImage =
        totalImages > 0 ? totalCaptions / totalImages : 0;

    const positiveVotePercentage =
        totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;

    return {
        totalUsers: profiles.count ?? 0,
        totalImages,
        totalCaptions,
        totalVotes,

        positiveVotes,
        negativeVotes,

        averageVotesPerImage,
        averageCaptionsPerImage,
        positiveVotePercentage,

        topCaptions,
        recentImages: recentImages ?? [],
    };
}