import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MdRefresh } from "react-icons/md";
import { useProductsData } from "../hooks/useProductsData";
import { buildDashboardData } from "../utils/metrics";

export default function Dashboard() {
  const { products, loading, error, refresh } = useProductsData();
  const data = useMemo(() => buildDashboardData(products), [products]);

  const getViewportMode = () => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 640) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  };

  const [viewportMode, setViewportMode] = useState(getViewportMode);

  useEffect(() => {
    const handleResize = () => setViewportMode(getViewportMode());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportMode === "mobile";
  const isTablet = viewportMode === "tablet";
  const isCompact = isMobile || isTablet;
  const categoryNameLimit = isMobile ? 9 : isTablet ? 11 : 14;

  const categoryChartData = useMemo(
    () =>
      data.categories.map((item) => ({
        ...item,
        chartName: item.name.length > categoryNameLimit ? `${item.name.slice(0, categoryNameLimit)}...` : item.name,
      })),
    [data.categories, categoryNameLimit]
  );

  const categoryChartHeight = isCompact
    ? Math.max(360, categoryChartData.length * (isMobile ? 28 : 24))
    : 340;
  const quickActions = [
    { label: "📦 Browse All Products", to: "/products" },
    { label: "📊 View Analytics", to: "/analytics" },
    { label: "🌟 Top Rated", to: "/products?sort=top_rated" },
    { label: "⚠️ Low Stock Alert", to: "/products?sort=low_stock" },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="text-lg text-slate-400">Real-time product analytics</p>
        </div>

        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#f59e0b] hover:text-[#0f172a]"
        >
          <MdRefresh size={20} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center"
          >
            
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full text-center bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                  {item.delta}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {item.value} 
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {item.label}
              </p>
              <p className="text-sm text-slate-400">{item.hint}</p>
           
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Category Distribution
            </h3>
            <p className="text-base text-slate-400">
              {data.categories.length} categories
            </p>
          </div>

          <div className="m-0 w-full p-0" style={{ height: `${categoryChartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout={isCompact ? "vertical" : "horizontal"}
                margin={isCompact ? { top: 8, right: 8, left: 0, bottom: 6 } : { top: 8, right: 8, left: 0, bottom: 6 }}
              >
                {isCompact ? (
                  <>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="chartName"
                      width={isMobile ? 86 : 106}
                      tick={{ fontSize: isMobile ? 10 : 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                  </>
                ) : (
                  <>
                    <XAxis
                      dataKey="chartName"
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  </>
                )}
                <Tooltip />
                <Bar dataKey="products" barSize={isMobile ? 12 : 15} radius={isCompact ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Price Ranges</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.priceRanges}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={82}
                >
                  {data.priceRanges.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.priceRanges.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-base"
              >
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Top Rated Products
            </h3>
          </div>

          <div className="space-y-3">
            {data.topRated.map((item) => (
              <Link
                key={item.rank}
                to={`/products/${item.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 transition hover:border-amber-200 hover:bg-amber-50/40"
              >
                <div>
                  <p className="text-sm text-slate-400">#{item.rank}</p>
                  <p className="text-base font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-sm text-slate-400">{item.category}</p>
                </div>
                <p className="text-xl font-semibold text-[#f59e0b]">
                  🌟 {item.rating}
                </p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-slate-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50/40"
              >
                <p className="text-base font-semibold text-slate-700">
                  {action.label}
                </p>
                <span className="text-slate-300">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-base font-semibold text-emerald-700">
              Live updates active
            </p>
            <p className="text-sm text-emerald-700/80">
              Data refreshes from API on demand
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
