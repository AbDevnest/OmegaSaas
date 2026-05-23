import { useEffect, useState } from "react";
import { getProductById } from "../api/dummyProductsApi";

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!productId) return;

      try {
        setLoading(true);
        setError("");
        const data = await getProductById(productId);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading, error };
}
