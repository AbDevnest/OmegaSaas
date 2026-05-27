import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MdGridView,
  MdOutlineTune,
  MdSearch,
  MdViewList,
} from "react-icons/md";
import ProductCard from "../components/ProductCard";
import AppContext from "../components/AppContext";
import {
  formatCategoryLabel,
  getAllProducts,
  getCategories,
} from "../api/dummyProductsApi";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "price_low", label: "Price: Low -> High" },
  { key: "price_high", label: "Price: High -> Low" },
  { key: "top_rated", label: "Top Rated" },
  { key: "name_asc", label: "Name: A -> Z" },
  { key: "name_desc", label: "Name: Z -> A" },
];

export default function Product() {
  const appState = useContext(AppContext);
  const role = appState?.role || "user";

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") || "",
  );
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "featured",
  );
  const [view, setView] = useState(() =>
    searchParams.get("view") === "list" ? "list" : "grid",
  );
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const val = searchParams.get("category");
    return val && val !== "all" ? val.split(",").filter(Boolean) : [];
  });

  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // useCallback
  const updateUrl = useCallback(
    (params) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(params).forEach(([key, value]) => {
            const remove =
              !value ||
              (key === "category" && value === "all") ||
              (key === "sort" && value === "featured") ||
              (key === "view" && value === "grid") ||
              (key === "page" && Number(value) === 1);
            if (remove) next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  async function loadData(force = false) {
    try {
      setLoading(true);
      setError("");
      const [productList, categoryList] = await Promise.all([
        getAllProducts(force),
        getCategories(force),
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
        updateUrl({ q: searchInput, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateUrl]);

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();

    const list = products.filter((item) => {
      if (role === "user" && !appState.isPublished(item.id)) return false;

      const matchesSearch =
        !text ||
        item.title.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text) ||
        item.brand.toLowerCase().includes(text);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      return matchesSearch && matchesCategory;
    });

    return list.sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "top_rated") return b.rating - a.rating;
      if (sortBy === "name_asc") return a.title.localeCompare(b.title);
      if (sortBy === "name_desc") return b.title.localeCompare(a.title);
      return a.id - b.id;
    });
  }, [products, search, selectedCategories, sortBy, role, appState]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleCategory(category) {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(next);
    setPage(1);
    updateUrl({ category: next.length ? next.join(",") : "all", page: 1 });
  }

  function clearCategories() {
    setSelectedCategories([]);
    setPage(1);
    updateUrl({ category: "all", page: 1 });
  }

  function changeSort(val) {
    setSortBy(val);
    setSortOpen(false);
    setPage(1);
    updateUrl({ sort: val, page: 1 });
  }

  function changeView(val) {
    setView(val);
    updateUrl({ view: val });
  }

  function changePage(next) {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    updateUrl({ page: next });
  }

  function togglePublish(productId) {
    if (role !== "admin") return;
    appState.togglePublished(productId);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">
        Loading products...
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
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <MdSearch className="text-slate-400" size={20} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, category, brand..."
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>

          <div className="relative">
            <button
              onClick={() => setSortOpen((prev) => !prev)}
              className="flex w-full min-w-[220px] items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <span>
                {SORT_OPTIONS.find((s) => s.key === sortBy)?.label ||
                  "Featured"}
              </span>
              <span className="text-slate-400">▾</span>
            </button>

            {sortOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Sort
                </p>
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => changeSort(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                      sortBy === item.key
                        ? "bg-amber-50 text-amber-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.key && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCategoryOpen((prev) => !prev)}
              className={`flex min-w-[160px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-semibold ${
                categoryOpen
                  ? "border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <MdOutlineTune size={16} /> Categories
              </span>
              <span className="text-slate-400">▾</span>
            </button>

            <div className="flex items-center rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => changeView("grid")}
                className={`rounded-lg px-2 py-1.5 ${view === "grid" ? "bg-[#f59e0b] text-[#0f172a]" : "text-slate-400"}`}
              >
                <MdGridView size={18} />
              </button>
              <button
                onClick={() => changeView("list")}
                className={`rounded-lg px-2 py-1.5 ${view === "list" ? "bg-[#f59e0b] text-[#0f172a]" : "text-slate-400"}`}
              >
                <MdViewList size={18} />
              </button>
            </div>
          </div>
        </div>

        {categoryOpen && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Categories:
              </p>
              <button
                onClick={clearCategories}
                className="text-xs font-semibold text-rose-500"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      active
                        ? "border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p>
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {visibleProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {filteredProducts.length}
          </span>{" "}
          products
        </p>
        {role === "admin" && (
          <p className="font-semibold text-slate-700">
            Admin view: full product list + publish control
          </p>
        )}
      </div>

      {view === "grid" ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              role={role}
              published={appState.isPublished(product.id)}
              onTogglePublished={togglePublish}
            />
          ))}
        </section>
      ) : (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-w-[980px] grid-cols-[100px_1.6fr_1fr_1fr_1fr_1fr_0.9fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            <p>Image</p>
            <p>Product</p>
            <p>Category</p>
            <p>Price</p>
            <p>Stock</p>
            <p>Rating</p>
            <p>Action</p>
          </div>

          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="grid min-w-[980px] grid-cols-[100px_1.6fr_1fr_1fr_1fr_1fr_0.9fr] items-center gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <div className="mx-auto h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mx-auto text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {product.title}
                </p>
                <p className="text-xs text-slate-400">{product.brand}</p>
              </div>

              <p className="mx-auto text-sm text-slate-500">
                {product.categoryLabel}
              </p>
              <p className="mx-auto text-base font-bold text-slate-800">
                ${product.price.toFixed(2)}
              </p>

              <span
                className={`mx-auto inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  product.stock > 20
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {product.stock > 20
                  ? `In Stock (${product.stock})`
                  : `Low Stock (${product.stock})`}
              </span>

              <p className="mx-auto text-base font-semibold text-[#f59e0b]">
                ★ {product.rating}
              </p>

              {role === "admin" ? (
                <div className="mx-auto flex flex-col items-center gap-1.5">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-xs font-semibold text-[#f59e0b]"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => togglePublish(product.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      appState.isPublished(product.id)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {appState.isPublished(product.id) ? "Published" : "Hidden"}
                  </button>
                </div>
              ) : (
                <Link
                  to={`/products/${product.id}`}
                  className="mx-auto text-sm font-semibold text-[#f59e0b]"
                >
                  View
                </Link>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
        >
          Prev
        </button>
        <p className="text-sm text-slate-600">
          Page <span className="font-semibold">{currentPage}</span> /{" "}
          {totalPages}
        </p>
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
