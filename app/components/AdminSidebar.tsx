"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ImageIcon,
    ThumbsUp,
} from "lucide-react";

const navigation = [
    {
        name: "Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Users",
        href: "/users",
        icon: Users,
    },
    {
        name: "Media",
        href: "/media",
        icon: ImageIcon,
    },
    {
        name: "Votes",
        href: "/votes",
        icon: ThumbsUp,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 shrink-0 border-r border-white/10 bg-[#111113] p-6">
            <div className="mb-12">
                <h1 className="text-lg font-bold">🥊 Caption Fight Club</h1>
                <p className="mt-1 text-sm text-gray-400">Control Room</p>
            </div>

            <nav aria-label="Admin navigation" className="space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                                active
                                    ? "bg-white/10 font-medium text-white"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}