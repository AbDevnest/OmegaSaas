import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MdArrowBack, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useProductDetail } from "../hooks/useProductDetail";

export default function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error } = useProductDetail(id);
  const [imageIndex, setImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
  }, [product]);

  useEffect(() => {
    setImageIndex(0);
  }, [id]);

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-600">{error || "Product not found"}</div>;
  }

  const nextImage = () => setImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-400">
        Dashboard / Products / {product.categoryLabel} / <span className="font-semibold text-slate-700">{product.title}</span>
      </p>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative rounded-2xl bg-slate-50 p-4">
            <span className="absolute left-4 top-4 rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-semibold text-[#0f172a]">
              -{Math.round(product.discountPercentage || 0)}% OFF
            </span>

            {images.length > 1 ? (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600"
                >
                  <MdChevronLeft size={20} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600"
                >
                  <MdChevronRight size={20} />
                </button>
              </>
            ) : null}

            <img src={images[imageIndex]} alt={product.title} className="mx-auto h-[320px] w-full object-contain" />
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-3">
              {images.map((img, index) => (
                <button
                  key={img}
                  onClick={() => setImageIndex(index)}
                  className={`overflow-hidden rounded-xl border p-1 ${
                    imageIndex === index ? "border-[#f59e0b]" : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={product.title} className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </article>

        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#f59e0b]">{product.categoryLabel}</p>
          <h2 className="text-3xl font-bold text-slate-900">{product.title}</h2>
          <p className="text-sm text-slate-500">by {product.brand}</p>
          <p className="text-xl font-semibold text-[#f59e0b]">🌟 {Number(product.rating || 0).toFixed(1)} ({product.reviews?.length || 0} reviews)</p>

          <div className="flex items-center gap-3">
            <p className="text-4xl font-bold text-slate-900">${Number(product.price || 0).toFixed(2)}</p>
            <p className="text-xl text-slate-300 line-through">${(Number(product.price || 0) * 1.18).toFixed(2)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {product.stock > 20 ? "In Stock" : "Low Stock"}
            </span>
            <p className="text-base text-slate-500">{product.stock} units available</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Description</h3>
            <p className="text-base leading-7 text-slate-500">{product.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-400">Category</p>
              <p className="text-base font-semibold text-slate-800">{product.categoryLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-400">Brand</p>
              <p className="text-base font-semibold text-slate-800">{product.brand}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 rounded-xl bg-[#f59e0b] px-4 py-3 text-base font-semibold text-[#0f172a]">Add to Cart</button>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
              <MdArrowBack size={18} /> Back
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
