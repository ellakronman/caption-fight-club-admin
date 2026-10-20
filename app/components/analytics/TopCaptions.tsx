import { Trophy } from "lucide-react";

type Caption = {
    id: string;
    text: string;
    score: number;
    voteCount: number;
};

export default function TopCaptions({
                                        captions,
                                    }: {
    captions: Caption[];
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
            <div className="mb-6 flex items-center gap-3">
                <Trophy size={20} className="text-yellow-400" />

                <div>
                    <h3 className="text-lg font-semibold">
                        Top Captions
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                        Highest-scoring captions across the platform
                    </p>
                </div>
            </div>

            {captions.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-gray-400">
                    No captions available yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {captions.map((caption, index) => (
                        <div
                            key={caption.id}
                            className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
                                #{index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm text-gray-200">
                                    {caption.text}
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    {caption.voteCount}{" "}
                                    {caption.voteCount === 1
                                        ? "vote"
                                        : "votes"}
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p
                                    className={`text-lg font-bold ${
                                        caption.score > 0
                                            ? "text-green-400"
                                            : caption.score < 0
                                                ? "text-red-400"
                                                : "text-gray-300"
                                    }`}
                                >
                                    {caption.score > 0 ? "+" : ""}
                                    {caption.score}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Score
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}