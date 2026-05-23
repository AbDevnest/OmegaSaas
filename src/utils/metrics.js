const palette = [
  "#94a3b8",
  "#59b487",
  "#f59e0b",
  "#7c5ce0",
  "#e67c32",
  "#4f7ad8",
  "#4f99cf",
  "#90c83f",
  "#de534b",
  "#5ab2c3",
  "#556f95",
  "#8d59db",
];

function groupByCategory(products) {
  const map = new Map();

  products.forEach((product) => {
    const key = product.category;
    const current = map.get(key) || {
      name: product.categoryLabel,
      products: 0,
      stockUnits: 0,
      ratingSum: 0,
      value: 0,
    };

    current.products += 1;
    current.stockUnits += product.stock || 0;
    current.ratingSum += product.rating || 0;
    current.value += (product.price || 0) * (product.stock || 0);

    map.set(key, current);
  });

  return [...map.values()].map((item, index) => ({
    ...item,
    rating: Number((item.ratingSum / item.products).toFixed(2)),
    short: item.name.slice(0, 5) + (item.name.length > 5 ? "..." : ""),
    color: palette[index % palette.length],
  }));
}

function priceRanges(products) {
  const ranges = [
    { name: "$0-50", min: 0, max: 50, value: 0, color: "#e5a338" },
    { name: "$50-100", min: 50, max: 100, value: 0, color: "#4d78da" },
    { name: "$100-500", min: 100, max: 500, value: 0, color: "#59b487" },
    { name: "$500+", min: 500, max: Infinity, value: 0, color: "#7a59df" },
  ];

  products.forEach((product) => {
    const range = ranges.find((item) => product.price >= item.min && product.price < item.max);
    if (range) range.value += 1;
  });

  return ranges;
}

export function buildDashboardData(products) {
  const totalProducts = products.length;
  const totalCategories = new Set(products.map((item) => item.category)).size;
  const totalStock = products.reduce((acc, item) => acc + (item.stock || 0), 0);
  const avgRating =
    totalProducts > 0
      ? Number(
          (
            products.reduce((acc, item) => acc + (item.rating || 0), 0) / totalProducts
          ).toFixed(1)
        )
      : 0;
  const inventoryValue = products.reduce(
    (acc, item) => acc + (item.price || 0) * (item.stock || 0),
    0
  );

  const categories = groupByCategory(products).sort((a, b) => b.products - a.products);

  const topRated = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id,
      rank: index + 1,
      name: item.title,
      rating: Number((item.rating || 0).toFixed(1)),
      category: item.categoryLabel,
    }));

  return {
    stats: [
      {
        label: "Total Products 📦",
        value: totalProducts.toLocaleString(),
        hint: `${totalCategories} categories`,
        delta: "+Live",
      },
      {
        label: "Average Rating 🌟",
        value: avgRating.toString(),
        hint: "Across all products",
        delta: "+Stable",
      },
      {
        label: "Inventory Value 💰",
        value: `$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        hint: "Total stock value",
        delta: "+Stock",
      },
      {
        label: "Categories 🏷️",
        value: totalCategories.toString(),
        hint: `${totalStock.toLocaleString()} total units`,
        delta: "+Tracked",
      },
    ],
    categories,
    topRated,
    priceRanges: priceRanges(products),
  };
}

export function buildAnalyticsData(products) {
  const categories = groupByCategory(products).sort((a, b) => b.products - a.products);
  const totalProducts = products.length;
  const avgRating =
    totalProducts > 0
      ? Number(
          (
            products.reduce((acc, item) => acc + (item.rating || 0), 0) / totalProducts
          ).toFixed(1)
        )
      : 0;
  const inventoryValue = products.reduce(
    (acc, item) => acc + (item.price || 0) * (item.stock || 0),
    0
  );

  const stockHealth = [
    { name: "Healthy (50+)", value: 0, color: "#59b487" },
    { name: "Normal (10-49)", value: 0, color: "#e5a338" },
    { name: "Low (1-9)", value: 0, color: "#e67c32" },
    { name: "Out of Stock", value: 0, color: "#de534b" },
  ];

  const ratingDistribution = [
    { name: "1★", value: 0 },
    { name: "2★", value: 0 },
    { name: "3★", value: 0 },
    { name: "4★", value: 0 },
    { name: "5★", value: 0 },
  ];

  products.forEach((item) => {
    if (item.stock >= 50) stockHealth[0].value += 1;
    else if (item.stock >= 10) stockHealth[1].value += 1;
    else if (item.stock > 0) stockHealth[2].value += 1;
    else stockHealth[3].value += 1;

    const star = Math.max(1, Math.min(5, Math.round(item.rating || 0)));
    ratingDistribution[star - 1].value += 1;
  });

  const stockAlerts = products.filter((item) => item.stock < 10).length;

  return {
    stats: [
      {
        label: "Total Products",
        value: totalProducts.toLocaleString(),
        hint: `${categories.length} categories`,
        delta: "+Live",
      },
      {
        label: "Average Rating",
        value: avgRating.toString(),
        hint: "Across all products",
        delta: "+Stable",
      },
      {
        label: "Inventory Value",
        value: `$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        hint: "Total stock value",
        delta: "+Tracked",
      },
      {
        label: "Stock Alerts",
        value: stockAlerts.toString(),
        hint: "Products below 10 units",
        delta: stockAlerts > 0 ? "-Attention" : "+Healthy",
      },
    ],
    categories,
    stockHealth,
    ratingDistribution,
  };
}
