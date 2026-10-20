import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import SignOutButton from "@/app/components/SignOutButton";
import AdminSidebar from "@/app/components/AdminSidebar";
import VotingDistribution from "@/app/components/analytics/VotingDistribution";
import TopCaptions from "@/app/components/analytics/TopCaptions";

export default async function HomePage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const stats = await getDashboardStats();

  const metrics = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥" },
    { label: "AI Images", value: stats.totalImages, icon: "🖼️" },
    { label: "Captions", value: stats.totalCaptions, icon: "💬" },
    { label: "Votes Cast", value: stats.totalVotes, icon: "🗳️" },
  ];

  const engagementMetrics = [
    {
      label: "Avg. Votes per Image",
      value: stats.averageVotesPerImage.toFixed(1),
      description: "Average engagement per uploaded image",
    },
    {
      label: "Avg. Captions per Image",
      value: stats.averageCaptionsPerImage.toFixed(1),
      description: "Average AI captions generated per image",
    },
    {
      label: "Positive Vote Rate",
      value: `${stats.positiveVotePercentage.toFixed(1)}%`,
      description: "Percentage of votes marked FUNNIER",
    },
  ];

  return (
      <div className="flex min-h-screen bg-[#09090b] text-white">
        {/* Sidebar navigation */}
        <AdminSidebar />

        {/* Main dashboard area */}
        <main className="min-w-0 flex-1">
          {/* Top header */}
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

          {/* Dashboard content */}
          <div className="mx-auto max-w-7xl px-8 py-12">
            {/* Page heading */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight">
                Overview
              </h2>

              <p className="mt-2 text-gray-400">
                Your platform at a glance.
              </p>
            </div>

            {/* Statistics cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                  <div
                      key={metric.label}
                      className="rounded-2xl border border-white/10 bg-[#18181b] p-6"
                  >
                    <div className="mb-5 text-2xl">
                      {metric.icon}
                    </div>

                    <p className="text-sm text-gray-400">
                      {metric.label}
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {metric.value.toLocaleString()}
                    </p>
                  </div>
              ))}
            </div>

            {/* Engagement metrics */}
            <div className="mt-10">
              <h3 className="mb-5 text-xl font-semibold">
                Engagement Insights
              </h3>

              <div className="grid gap-5 sm:grid-cols-3">
                {engagementMetrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-2xl border border-white/10 bg-[#18181b] p-6"
                    >
                      <p className="text-sm text-gray-400">
                        {metric.label}
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {metric.value}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        {metric.description}
                      </p>
                    </div>
                ))}
              </div>
            </div>

            {/* Analytics charts and leaderboard */}
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <VotingDistribution
                  positiveVotes={stats.positiveVotes}
                  negativeVotes={stats.negativeVotes}
              />

              <TopCaptions captions={stats.topCaptions} />
            </div>

            {/* Recent images section */}
            <div className="mt-12">
              <h3 className="mb-6 text-xl font-semibold">
                Recent AI Images
              </h3>

              {stats.recentImages.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#18181b] p-12 text-center text-gray-400">
                    No images have been generated yet.
                  </div>
              ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.recentImages.map((image) => (
                        <div
                            key={image.id}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                              src={image.image_url}
                              alt={
                                  image.description ||
                                  "AI-generated image"
                              }
                              className="h-56 w-full object-cover"
                          />

                          <div className="p-5">
                            <p className="line-clamp-2 text-sm text-gray-300">
                              {image.description ||
                                  "No description"}
                            </p>

                            <p className="mt-3 text-xs text-gray-500">
                              {new Date(
                                  image.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}