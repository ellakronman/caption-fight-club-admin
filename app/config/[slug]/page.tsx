import { notFound, redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { entities } from "@/lib/config-entities";
import AdminSidebar from "@/app/components/AdminSidebar";
import SignOutButton from "@/app/components/SignOutButton";
import EntityManager from "@/app/components/EntityManager";
export default async function ConfigPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const config=entities[slug];if(!config)notFound();if(!await getAdminUser())redirect("/login");const {data,error}=await createAdminClient().from(config.table).select("*").order("created_at",{ascending:false}).limit(500);return <div className="flex min-h-screen bg-[#09090b] text-white"><AdminSidebar/><main className="min-w-0 flex-1"><header className="flex items-center justify-between border-b border-white/10 px-8 py-5"><div><h1 className="font-bold">🥊 Caption Fight Club</h1><p className="text-sm text-gray-400">Control Room</p></div><SignOutButton/></header><div className="mx-auto max-w-7xl px-8 py-12">{error?<div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">Could not load {config.title}: {error.message}. Apply the included SQL migration first.</div>:<EntityManager slug={slug} config={config} rows={data??[]}/>}</div></main></div>}
