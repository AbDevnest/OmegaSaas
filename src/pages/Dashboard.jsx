import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdRefresh } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { MdInventory2 } from "react-icons/md";
import { getAllProducts } from "../api/dummyProductsApi";
import { buildDashboardData } from "../utils/metrics";

function getDonutGradient(ranges) {
  const total = ranges.reduce((sum, item) => sum + item.value, 0);
  if (!total) return "conic-gradient(#e2e8f0 0deg 360deg)";

  let current = 0;
  const parts = ranges.map((item) => {
    const angle = (item.value / total) * 360;
    const start = current;
    const end = current + angle;
    current = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${parts.join(",")})`;
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(force = false) {
    try {
      setLoading(true);
      setError("");
      const list = await getAllProducts(force);
      setProducts(list);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const data = buildDashboardData(products);
  const maxCategoryCount = Math.max(
    ...data.categories.map((item) => item.products),
    1,
  );
  const donutBackground = getDonutGradient(data.priceRanges);

  const quickActions = [
    { label: "Browse All Products", to: "/products" },
    { label: "View Analytics", to: "/analytics" },
    { label: "Top Rated", to: "/products?sort=top_rated" },
    { label: "Price Low to High", to: "/products?sort=price_low" },
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

  const STAT_ICONS = [
    <FiPackage size={18} />,
    <FaStar size={18} />,
    <MdInventory2 size={18} />,
    <BiCategory size={18} />,
  ];

  return (
    <div className="space-y-6">
      <section className="text-end">
        <button
          onClick={() => loadData(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#f59e0b] hover:text-[#0f172a]"
        >
          <MdRefresh size={20} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item, index) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                {item.delta}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
            <p className="mt-2 text-sm flex items-center justify-center gap-2 font-semibold text-slate-700">
              {item.label}{" "}
              <span className="text-[#f59e0b]">{STAT_ICONS[index]}</span>
            </p>
            <p className="text-sm text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3 items-start">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Category Distribution
            </h3>
            <p className="text-base text-slate-400">
              {data.categories.length} categories
            </p>
          </div>

          <div className="space-y-3">
            {data.categories.map((item) => {
              const width = Math.max(
                (item.products / maxCategoryCount) * 100,
                3,
              );
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="font-medium text-slate-700">{item.name}</p>
                    <p className="font-semibold text-slate-500">
                      {item.products}
                    </p>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Price Ranges</h3>

          <div className="my-6 flex justify-center">
            <div
              className=" h-44 w-44 rounded-full "
              style={{ background: donutBackground }}
            ></div>
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
          <h3 className="mb-4 text-xl font-bold text-slate-900">
            Top Rated Products
          </h3>
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
                  ★ {item.rating}
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
        </article>
      </section>
    </div>
  );
}
