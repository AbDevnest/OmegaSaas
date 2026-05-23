import { useCallback, useEffect, useState } from "react";
import { getAllProducts, getCategories } from "../api/dummyProductsApi";

export function useProductsData() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (force = false) => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    categories,
    loading,
    error,
    refresh: () => fetchData(true),
    setProducts,
  };
}
