import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MdGridView,
  MdOutlineTune,
  MdSearch,
  MdViewList,
} from "react-icons/md";
import ProductCard from "../components/ProductCard";
import { formatCategoryLabel } from "../api/dummyProductsApi";
import { useProductsData } from "../hooks/useProductsData";

const PAGE_SIZE = 12;
const VALID_SORTS = new Set([
  "featured",
  "price_low",
  "price_high",
  "top_rated",
  "big_discount",
  "most_stock",
  "low_stock",
  "name_asc",
  "name_desc",
]);

const FEATURED_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "price_low", label: "Price: Low -> High" },
  { key: "price_high", label: "Price: High -> Low" },
  { key: "top_rated", label: "Top Rated" },
  { key: "big_discount", label: "Biggest Discount" },
  { key: "most_stock", label: "Most in Stock" },
  { key: "low_stock", label: "Low Stock First" },
  { key: "name_asc", label: "Name: A -> Z" },
  { key: "name_desc", label: "Name: Z -> A" },
];

function getInitialFromParams(searchParams) {
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "featured";
  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const page = Number(searchParams.get("page") || 1);

  return {
    q,
    category,
    sort: VALID_SORTS.has(sort) ? sort : "featured",
    view,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialState = useMemo(() => getInitialFromParams(searchParams), []);

  const [searchInput, setSearchInput] = useState(initialState.q);
  const [search, setSearch] = useState(initialState.q);
  const [selectedCategory, setSelectedCategory] = useState(
    initialState.category,
  );
  const [sortBy, setSortBy] = useState(initialState.sort);
  const [view, setView] = useState(initialState.view);
  const [page, setPage] = useState(initialState.page);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { products, categories, loading, error, refresh } = useProductsData();

  const updateUrlState = useCallback(
    (updates) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          Object.entries(updates).forEach(([key, value]) => {
            const shouldRemove =
              value === undefined ||
              value === null ||
              value === "" ||
              (key === "category" && value === "all") ||
              (key === "sort" && value === "featured") ||
              (key === "view" && value === "grid") ||
              (key === "page" && Number(value) === 1);

            if (shouldRemove) next.delete(key);
            else next.set(key, String(value));
          });

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput === search) return;
      setSearch(searchInput);
      setPage(1);
      updateUrlState({ q: searchInput, page: 1 });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateUrlState]);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    return () => clearInterval(interval);
  }, [refresh]);

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();

    const filtered = products.filter((item) => {
      const matchesSearch =
        !text ||
        item.title.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text) ||
        item.brand.toLowerCase().includes(text);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesLowStock = sortBy !== "low_stock" || item.stock < 20;

      return matchesSearch && matchesCategory && matchesLowStock;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "top_rated") return b.rating - a.rating;
      if (sortBy === "big_discount")
        return b.discountPercentage - a.discountPercentage;
      if (sortBy === "most_stock") return b.stock - a.stock;
      if (sortBy === "low_stock") return a.stock - b.stock;
      if (sortBy === "name_desc") return b.title.localeCompare(a.title);
      if (sortBy === "name_asc") return a.title.localeCompare(b.title);
      return a.id - b.id;
    });
  }, [products, search, selectedCategory, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateUrlState({ page: totalPages });
    }
  }, [page, totalPages, updateUrlState]);

  const visibleProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredProducts, currentPage],
  );

  const selectCategory = useCallback(
    (category) => {
      setSelectedCategory(category);
      setPage(1);
      updateUrlState({ category, page: 1 });
    },
    [updateUrlState],
  );

  const handleSortChange = useCallback(
    (nextSort) => {
      setSortBy(nextSort);
      setFeaturedOpen(false);
      setPage(1);
      updateUrlState({ sort: nextSort, page: 1 });
    },
    [updateUrlState],
  );

  const handleViewChange = useCallback(
    (nextView) => {
      setView(nextView);
      updateUrlState({ view: nextView });
    },
    [updateUrlState],
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage < 1 || nextPage > totalPages) return;
      setPage(nextPage);
      updateUrlState({ page: nextPage });
    },
    [totalPages, updateUrlState],
  );

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
              onClick={() => setFeaturedOpen((prev) => !prev)}
              className="flex w-full min-w-[220px] items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <span>
                ✨{" "}
                {FEATURED_OPTIONS.find((item) => item.key === sortBy)?.label ||
                  "Featured"}
              </span>
              <span className="text-slate-400">▾</span>
            </button>

            {featuredOpen ? (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Sort & Filter
                </p>
                {FEATURED_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSortChange(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                      sortBy === item.key
                        ? "bg-amber-50 text-amber-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.key ? <span>✓</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setCategoryOpen((prev) => !prev)}
                className={`flex min-w-[140px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-semibold ${
                  categoryOpen
                    ? "border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <MdOutlineTune size={16} /> Category
                </span>
                <span className="text-slate-400">▾</span>
              </button>
            </div>

            <div className="flex items-center overflow-auto rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => handleViewChange("grid")}
                className={`rounded-lg px-2 py-1.5 ${
                  view === "grid"
                    ? "bg-[#f59e0b] text-[#0f172a]"
                    : "text-slate-400"
                }`}
              >
                <MdGridView size={18} />
              </button>
              <button
                onClick={() => handleViewChange("list")}
                className={`rounded-lg px-2 py-1.5 ${
                  view === "list"
                    ? "bg-[#f59e0b] text-[#0f172a]"
                    : "text-slate-400"
                }`}
              >
                <MdViewList size={18} />
              </button>
            </div>
          </div>
        </div>

        {categoryOpen ? (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-600">
              Category:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => selectCategory("all")}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  selectedCategory === "all"
                    ? "border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                All
              </button>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => selectCategory(category)}
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
        ) : null}
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
      </div>

      {view === "grid" ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-w-[980px] grid-cols-[100px_1.6fr_1fr_1fr_1fr_1fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-center tracking-wide text-slate-500">
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
              className="grid min-w-[980px] grid-cols-[100px_1.6fr_1fr_1fr_1fr_1fr_0.7fr] items-center gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0"
            >

                
              <div className="h-14 w-14 mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  className="h-full w-full object-cover "
                />
              </div>
              <div className="mx-auto text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {product.title}
                </p>
                <p className="text-xs text-slate-400">{product.brand}</p>
              </div>
              <p className="text-sm mx-auto text-slate-500">{product.categoryLabel}</p>
              <p className="text-base mx-auto font-bold text-slate-800">
                ${product.price.toFixed(2)}
              </p>
              <span
                className={`mx-auto inline flex rounded-full px-3 py-1 text-xs font-semibold ${
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
                🌟 {product.rating}
              </p>
              <Link
                to={`/products/${product.id}`}
                className="mx-auto flex items-center gap-1 text-sm font-semibold text-[#f59e0b]"
              >
                
                👁️‍🗨️
                View
              </Link>
            </div>
          ))}
        </section>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
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
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
