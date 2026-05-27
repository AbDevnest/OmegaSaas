import { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { MdInventory2 } from "react-icons/md";
import { getAllProducts } from "../api/dummyProductsApi";
import { buildAnalyticsData } from "../utils/metrics";

function getDonutGradient(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!total) return "conic-gradient(#e2e8f0 0deg 360deg)";

  let current = 0;
  const parts = items.map((item) => {
    const angle = (item.value / total) * 360;
    const start = current;
    const end = current + angle;
    current = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${parts.join(",")})`;
}

function truncateText(text, max = 12) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export default function Analytics() {
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
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const data = buildAnalyticsData(products);
  const maxProducts = Math.max(
    ...data.categories.map((item) => item.products),
    1,
  );
  const maxRating = Math.max(...data.categories.map((item) => item.rating), 1);
  const maxValue = Math.max(...data.categories.map((item) => item.value), 1);
  const maxRatingCount = Math.max(
    ...data.ratingDistribution.map((item) => item.value),
    1,
  );
  const stockDonutBackground = getDonutGradient(data.stockHealth);

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

  const STAT_ICONS = [
    <FiPackage size={18} />,
    <FaStar size={18} />,
    <MdInventory2 size={18} />,
    <BiCategory size={18} />,
  ];

  return (
    <div className="space-y-6">
      <section className="text-end ">
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
            <h3 className="text-3xl font-bold text-slate-900">{item.value}</h3>
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
          <h3 className="text-xl font-bold text-slate-900">
            Products per Category
          </h3>
          <p className="mb-3 text-base text-slate-400">
            All {data.categories.length} categories
          </p>

          <div className="space-y-3">
            {data.categories.map((item) => (
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
                      width: `${Math.max((item.products / maxProducts) * 100, 3)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Stock Health</h3>
          <p className="mb-2 text-base text-slate-400">
            Inventory status breakdown
          </p>

          <div className="my-6 flex justify-center">
            <div
              className="relative h-44 w-44 rounded-full"
              style={{ background: stockDonutBackground }}
            ></div>
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

      <section className="grid gap-4 xl:grid-cols-2 items-start">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 min-h-84  shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Rating Distribution
          </h3>
          <p className="mb-3 text-base text-slate-400">
            How products are rated by customers
          </p>

          <div className="space-y-3">
            {data.ratingDistribution.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-700">{item.name}</p>
                  <p className="font-semibold text-slate-500">{item.value}</p>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-[#f59e0b]"
                    style={{
                      width: `${Math.max((item.value / maxRatingCount) * 100, 3)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border overflow-y-auto overflow-x-hidden max-h-84 border-slate-200 bg-white  shadow-sm">
          <div className="sticky top-0 bg-white px-5 pt-3">
            <h3 className="text-xl font-bold text-slate-900">
              Category Summary
            </h3>
            <p className="mb-3 text-base text-slate-400">
              Detailed breakdown per category
            </p>
          </div>

          <div className="rounded-xl border border-slate-100">
            <table className="w-full border-collapse text-left p-5">
              <thead className="sticky top-16 rounded-t-lg bg-slate-50 sm:text-sm text-xs text-center text-slate-400">
                <tr>
                  <th className="py-2">Category</th>
                  <th className="py-2">Products</th>
                  <th className="py-2">Rating</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((item) => (
                  <tr
                    key={item.name}
                    className="border-t border-slate-100 sm:text-sm text-xs text-center"
                  >
                    <td className="px-3 py-2 font-medium text-slate-700">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {item.products}
                    </td>
                    <td className="px-3 py-2 text-[#f59e0b]">
                      ★ {item.rating}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
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
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Inventory Value by Category
          </h3>
          <p className="mb-3 text-base text-slate-400">
            All categories by total stock value
          </p>

          <div className="space-y-3">
            {data.categories.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-700">
                    {truncateText(item.name, 24)}
                  </p>
                  <p className="font-semibold text-slate-500">
                    ${Math.round(item.value).toLocaleString()}
                  </p>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Avg Rating by Category
          </h3>
          <p className="mb-3 text-base text-slate-400">
            Quality score per category
          </p>

          <div className="space-y-3">
            {data.categories.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-700">
                    {truncateText(item.name, 24)}
                  </p>
                  <p className="font-semibold text-slate-500">{item.rating}</p>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-[#7c5ce0]"
                    style={{
                      width: `${Math.max((item.rating / maxRating) * 100, 3)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
