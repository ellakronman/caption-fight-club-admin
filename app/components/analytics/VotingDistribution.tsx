"use client";

import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type VotingDistributionProps = {
    positiveVotes: number;
    negativeVotes: number;
};

export default function VotingDistribution({
                                               positiveVotes,
                                               negativeVotes,
                                           }: VotingDistributionProps) {
    const data = [
        {
            name: "FUNNIER",
            value: positiveVotes,
            color: "#4ade80",
        },
        {
            name: "NOT IT",
            value: negativeVotes,
            color: "#f87171",
        },
    ];

    const total = positiveVotes + negativeVotes;

    return (
        <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
            <h3 className="text-lg font-semibold">
                Voting Distribution
            </h3>

            <p className="mt-1 text-sm text-gray-400">
                How users rate AI-generated captions
            </p>

            {total === 0 ? (
                <div className="flex h-72 items-center justify-center text-gray-400">
                    No votes recorded yet.
                </div>
            ) : (
                <div className="relative mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #3f3f46",
                                    borderRadius: "8px",
                                    color: "#ffffff",
                                }}
                                itemStyle={{
                                    color: "#ffffff",
                                }}
                            />

                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                wrapperStyle={{
                                    color: "#d4d4d8",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-x-0 top-[37%] -translate-y-1/2 text-center">
                        <p className="text-3xl font-bold">
                            {total}
                        </p>
                        <p className="text-xs text-gray-400">
                            Total Votes
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}