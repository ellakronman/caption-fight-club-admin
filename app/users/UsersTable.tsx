"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, UserRound } from "lucide-react";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at: string;
    is_superadmin: boolean;
};

export default function UsersTable({ users }: { users: Profile[] }) {
    const [search, setSearch] = useState("");

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const fullName =
                `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase();

            return (
                fullName.includes(query) ||
                user.id.toLowerCase().includes(query)
            );
        });
    }, [users, search]);

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
                <div>
                    <h3 className="text-lg font-semibold">
                        Member Directory
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {filteredUsers.length} of {users.length} users
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search members..."
                        aria-label="Search members"
                        className="w-full rounded-lg border border-white/10 bg-[#09090b] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/30"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Member</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4">User ID</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => {
                        const name =
                            [user.first_name, user.last_name]
                                .filter(Boolean)
                                .join(" ") || "Unnamed member";

                        return (
                            <tr
                                key={user.id}
                                className="transition hover:bg-white/5"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                                            {user.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={user.avatar_url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound
                                                    size={20}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </div>

                                        <span className="font-medium">
                                                {name}
                                            </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {user.is_superadmin ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                                                <ShieldCheck size={14} />
                                                Superadmin
                                            </span>
                                    ) : (
                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                                                Member
                                            </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4">
                                    <code className="text-xs text-gray-500">
                                        {user.id.slice(0, 8)}...
                                    </code>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    {users.length === 0
                        ? "No registered users yet."
                        : "No members match your search."}
                </div>
            )}
        </div>
    );
}