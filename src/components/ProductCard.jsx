import { useNavigate } from "react-router-dom";
import { memo } from "react";

function ProductCard({ product, role, published, onTogglePublished }) {
  const navigate = useNavigate();
  const title = product.title || "Untitled Product";
  const image = product.thumbnail || product.images?.[0] || "";
  const category = product.categoryLabel || product.category || "Category";
  const rating = Number(product.rating || 0).toFixed(1);
  const discount = Math.round(product.discountPercentage || 0);
  const inStock = Number(product.stock || 0) > 20;

  function openProductDetail() {
    navigate(`/products/${product.id}`);
  }

  function handleToggleClick(event) {
    event.stopPropagation();
    onTogglePublished(product.id);
  }

  return (
    <article
      onClick={openProductDetail}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-52 bg-slate-50">
        <span className="absolute left-3 top-3 rounded-full bg-[#f59e0b] px-2.5 py-1 text-xs font-semibold text-[#0f172a]">
          -{discount}%
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            inStock
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {inStock ? "In Stock" : "Low Stock"}
        </span>

        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain p-5"
        />
      </div>

      <div className="space-y-2 p-4">
        <h3 className="truncate text-xl font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{category}</p>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">
            ${Number(product.price || 0).toFixed(2)}
          </p>
          <p className="text-base font-semibold text-[#f59e0b]">★ {rating}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {product.stock || 0} in stock
          </p>
          {role === "admin" ? (
            <button
              onClick={handleToggleClick}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                published
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {published ? "Published" : "Hidden"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
