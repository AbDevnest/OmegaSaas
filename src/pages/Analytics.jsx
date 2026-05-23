import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { buildAnalyticsData } from "../utils/metrics";

export default function Analytics() {
  const { products, loading, error, refresh } = useProductsData();
  const data = useMemo(() => buildAnalyticsData(products), [products]);

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

  const categoryChartData = useMemo(() => {
    const sorted = [...data.categories].sort((a, b) => b.products - a.products);
    return sorted.map((item) => ({
      ...item,
      chartName:
        item.name.length > categoryNameLimit
          ? `${item.name.slice(0, categoryNameLimit)}...`
          : item.name,
    }));
  }, [data.categories, categoryNameLimit]);

  const avgRatingChartData = useMemo(() => {
    const sorted = [...data.categories].sort((a, b) => b.rating - a.rating);
    return sorted.map((item) => ({
      ...item,
      chartName:
        item.name.length > categoryNameLimit
          ? `${item.name.slice(0, categoryNameLimit)}...`
          : item.name,
    }));
  }, [data.categories, categoryNameLimit]);

  const topValueChartData = useMemo(() => {
    const topValueCategories = [...data.categories].sort(
      (a, b) => b.value - a.value,
    );
    return topValueCategories
      .slice()
      .reverse()
      .map((item) => ({
        name:
          item.name.length > categoryNameLimit
            ? `${item.name.slice(0, categoryNameLimit)}...`
            : item.name,
        value: Math.round(item.value),
        fill: item.color,
      }));
  }, [data.categories, categoryNameLimit]);

  const productsPerCategoryHeight = isCompact
    ? Math.max(360, categoryChartData.length * (isMobile ? 28 : 24))
    : 340;
  const inventoryValueHeight = isCompact
    ? Math.max(360, topValueChartData.length * (isMobile ? 28 : 24))
    : 320;
  const avgRatingHeight = isCompact
    ? Math.max(360, avgRatingChartData.length * (isMobile ? 28 : 24))
    : 320;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">
        Loading analytics...
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
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-lg text-slate-400">
            Product performance & inventory insights
          </p>
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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
                  item.delta.startsWith("-")
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {item.delta}
              </span>
            </div>
            <h3 className="text-4xl font-bold text-slate-900">{item.value}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {item.label}
            </p>
            <p className="text-sm text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-xl font-bold text-slate-900">
            Products per Category
          </h3>
          <p className="mb-2 text-base text-slate-400">
            All {data.categories.length} categories
          </p>
          <div style={{ height: `${productsPerCategoryHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout={isCompact ? "vertical" : "horizontal"}
                margin={
                  isCompact
                    ? { top: 6, right: 8, left: 0, bottom: 6 }
                    : { top: 6, right: 8, left: 0, bottom: 6 }
                }
              >
                {isCompact ? (
                  <>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="chartName"
                      width={isMobile ? 78 : 96}
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
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                  </>
                )}
                <Tooltip />
                <Bar
                  dataKey="products"
                  barSize={isMobile ? 12 : 16}
                  radius={isCompact ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                >
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Stock Health</h3>
          <p className="mb-2 text-base text-slate-400">
            Inventory status breakdown
          </p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.stockHealth}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={82}
                >
                  {data.stockHealth.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.stockHealth.map((item) => (
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
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Rating Distribution
          </h3>
          <p className="mb-3 text-base text-slate-400">
            How products are rated by customers
          </p>
          <div className={isMobile ? "h-[260px]" : "h-[320px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ratingDistribution}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: isMobile ? 10 : 12, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: isMobile ? 10 : 12, fill: "#64748b" }}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#f59e0b"
                  barSize={isMobile ? 20 : 28}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Category Summary</h3>
          <p className="mb-3 text-base text-slate-400">
            Detailed breakdown per category
          </p>
          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-100">
            <table
              className="w-full border-collapse text-left"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "26%" }} />
              </colgroup>
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="px-1.5 py-2 text-[11px] text-slate-400 font-medium">
                    Category
                  </th>
                  <th className="px-1.5 py-2 text-[11px] text-slate-400 font-medium">
                    Products
                  </th>
                  <th className="px-1.5 py-2 text-[11px] text-slate-400 font-medium">
                    Rating
                  </th>
                  <th className="px-1.5 py-2 text-[11px] text-slate-400 font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((item) => (
                  <tr key={item.name} className="border-t border-slate-100">
                    <td className="px-1.5 py-2 text-[11px] font-medium text-slate-700 truncate">
                      {item.name}
                    </td>
                    <td className="px-1.5 py-2 text-[11px] text-slate-600">
                      {item.products}
                    </td>
                    <td className="px-1.5 py-2 text-[11px] text-[#f59e0b]">
                      ⭐ {item.rating}
                    </td>
                    <td className="px-1.5 py-2 text-[11px] font-semibold text-slate-800">
                      $
                      {item.value.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Inventory Value by Category
          </h3>
          <p className="mb-3 text-base text-slate-400">
            All categories by total stock value
          </p>
          <div style={{ height: `${inventoryValueHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topValueChartData}
                layout="vertical"
                margin={
                  isMobile
                    ? { top: 8, right: 6, left: 0, bottom: 8 }
                    : { top: 8, right: 16, left: 8, bottom: 8 }
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={isMobile ? 78 : 120}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: "#475569" }}
                />
                <Tooltip
                  formatter={(value) =>
                    `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  }
                />
                <Bar
                  dataKey="value"
                  barSize={isMobile ? 12 : 18}
                  radius={[0, 8, 8, 0]}
                >
                  {topValueChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Avg Rating by Category
          </h3>
          <p className="mb-3 text-base text-slate-400">
            Quality score per category
          </p>
          <div style={{ height: `${avgRatingHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={avgRatingChartData}
                layout={isCompact ? "vertical" : "horizontal"}
                margin={
                  isCompact
                    ? { top: 6, right: 8, left: 0, bottom: 6 }
                    : { top: 6, right: 8, left: 0, bottom: 6 }
                }
              >
                {isCompact ? (
                  <>
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="chartName"
                      width={isMobile ? 78 : 96}
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
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                  </>
                )}
                <Tooltip />
                <Bar
                  dataKey="rating"
                  fill="#7c5ce0"
                  barSize={isMobile ? 12 : 16}
                  radius={isCompact ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}
