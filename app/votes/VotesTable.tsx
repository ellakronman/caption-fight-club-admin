"use client";

import { useMemo, useState } from "react";
import { Search, ThumbsDown, ThumbsUp } from "lucide-react";

type Vote = {
    id: string;
    user_id: string;
    caption_id: string;
    caption_text: string;
    value: number;
    created_at: string;
};

export default function VotesTable({ votes }: { votes: Vote[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "positive" | "negative">(
        "all"
    );

    const positiveVotes = votes.filter((vote) => vote.value === 1).length;
    const negativeVotes = votes.filter((vote) => vote.value === -1).length;

    const filteredVotes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return votes.filter((vote) => {
            const matchesSearch =
                vote.caption_text.toLowerCase().includes(query) ||
                vote.user_id.toLowerCase().includes(query);

            const matchesFilter =
                filter === "all" ||
                (filter === "positive" && vote.value === 1) ||
                (filter === "negative" && vote.value === -1);

            return matchesSearch && matchesFilter;
        });
    }, [votes, search, filter]);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
                    <p className="text-sm text-gray-400">Total Votes</p>
                    <p className="mt-3 text-3xl font-bold">{votes.length}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
                    <div className="flex items-center gap-2 text-green-400">
                        <ThumbsUp size={17} />
                        <p className="text-sm">FUNNIER Votes</p>
                    </div>
                    <p className="mt-3 text-3xl font-bold">
                        {positiveVotes}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
                    <div className="flex items-center gap-2 text-red-400">
                        <ThumbsDown size={17} />
                        <p className="text-sm">NOT IT Votes</p>
                    </div>
                    <p className="mt-3 text-3xl font-bold">
                        {negativeVotes}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Voting History
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                            {filteredVotes.length} of {votes.length} votes
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filter}
                            onChange={(event) =>
                                setFilter(
                                    event.target.value as
                                        | "all"
                                        | "positive"
                                        | "negative"
                                )
                            }
                            aria-label="Filter votes"
                            className="rounded-lg border border-white/10 bg-[#09090b] px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Votes</option>
                            <option value="positive">FUNNIER</option>
                            <option value="negative">NOT IT</option>
                        </select>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search votes..."
                                aria-label="Search votes"
                                className="rounded-lg border border-white/10 bg-[#09090b] py-2 pl-10 pr-4 text-sm text-white outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Caption</th>
                            <th className="px-6 py-4">Vote</th>
                            <th className="px-6 py-4">Voter ID</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                        {filteredVotes.map((vote) => (
                            <tr
                                key={vote.id}
                                className="hover:bg-white/5"
                            >
                                <td className="max-w-md px-6 py-4 text-gray-200">
                                    {vote.caption_text}
                                </td>

                                <td className="px-6 py-4">
                                    {vote.value === 1 ? (
                                        <span className="inline-flex items-center gap-2 text-green-400">
                                                <ThumbsUp size={15} />
                                                FUNNIER
                                            </span>
                                    ) : vote.value === -1 ? (
                                        <span className="inline-flex items-center gap-2 text-red-400">
                                                <ThumbsDown size={15} />
                                                NOT IT
                                            </span>
                                    ) : (
                                        <span className="text-gray-400">
                                                Unknown ({vote.value})
                                            </span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <code className="text-xs text-gray-500">
                                        {vote.user_id.slice(0, 8)}...
                                    </code>
                                </td>

                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(
                                        vote.created_at
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {filteredVotes.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No matching votes found.
                    </div>
                )}
            </div>
        </div>
    );
}