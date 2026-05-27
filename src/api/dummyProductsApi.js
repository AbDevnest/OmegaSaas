const API_BASE = "https://dummyjson.com";
const PAGE_LIMIT = 100;

let productsCache = null;
let categoriesCache = null;
let productsPromise = null;
let categoriesPromise = null;

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export function formatCategoryLabel(category = "") {
  return category
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeProduct(product) {
  return {
    ...product,
    title: product.title ?? "Untitled Product",
    brand: product.brand ?? "Generic Brand",
    images: product.images?.length
      ? product.images
      : [product.thumbnail].filter(Boolean),
    thumbnail: product.thumbnail || product.images?.[0] || " ",
    categoryLabel: formatCategoryLabel(product.category),
  };
}

export async function getAllProducts(force = false) {
  if (!force && productsCache) return productsCache;
  if (!force && productsPromise) return productsPromise;

  productsPromise = (async () => {
    let skip = 0;
    let total = 0;
    const allProducts = [];

    do {
      const data = await fetchJson(
        `/products?limit=${PAGE_LIMIT}&skip=${skip}`,
      );
      total = data.total ?? data.products.length;
      allProducts.push(...(data.products ?? []));
      skip += PAGE_LIMIT;
    } while (skip < total);

    productsCache = allProducts.map(normalizeProduct);
    productsPromise = null;
    return productsCache;
  })();

  return productsPromise;
}

export async function getCategories(force = false) {
  if (!force && categoriesCache) return categoriesCache;
  if (!force && categoriesPromise) return categoriesPromise;

  categoriesPromise = (async () => {
    const list = await fetchJson("/products/category-list");
    categoriesCache = Array.isArray(list) ? list : [];
    categoriesPromise = null;
    return categoriesCache;
  })();

  return categoriesPromise;
}

export async function getProductById(productId) {
  const data = await fetchJson(`/products/${productId}`);
  return normalizeProduct(data);
}
