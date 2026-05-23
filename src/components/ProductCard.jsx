import { memo } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const title = product.title || product.name;
  const category = product.categoryLabel || product.category;
  const image = product.thumbnail || product.image || product.images?.[0];
  const discount = Math.round(product.discountPercentage ?? product.discount ?? 0);
  const stockLabel = product.stock > 20 ? "In Stock" : "Low Stock";
  const stockClass =
    product.stock > 20
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-52 bg-slate-50">
        <span className="absolute left-3 top-3 rounded-full bg-[#f59e0b] px-2.5 py-1 text-xs font-semibold text-[#0f172a]">
          -{discount}%
        </span>
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${stockClass}`}>
          {stockLabel}
        </span>
        <img src={image} alt={title} className="h-full w-full object-contain p-5" />
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="truncate text-xl font-semibold text-slate-900 group-hover:text-[#0f172a]">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{category}</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
          <p className="text-base font-semibold text-[#f59e0b]">🌟 {product.rating}</p>
        </div>
        <p className="text-sm text-slate-400">{product.stock} in stock</p>
      </div>
    </Link>
  );
};

export default memo(ProductCard);
