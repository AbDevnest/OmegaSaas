import './App.css';
import { lazy, Suspense } from "react";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Layout
import MainLayout from "./components/MainLayout";

// Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Product = lazy(() => import("./pages/Product"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));

const withSuspense = (component) => (
  <Suspense
    fallback={
      <div className="p-6 text-sm text-slate-500">Loading...</div>
    }
  >
    {component}
  </Suspense>
);

// Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

    children: [

      // Dashboard
      {
        path: "/",
        element: withSuspense(<Dashboard />)
      },

      // Analytics
      {
        path: "/analytics",
        element: withSuspense(<Analytics />)
      },

      // Products
      {
        path: "/products",
        element: withSuspense(<Product />)
      },

      // Product Details
      {
        path: "/products/:id",
        element: withSuspense(<ProductDetail />)
      },

      // 404 Page
      {
        path: "*",
        element: (
          <h1 className="text-5xl text-center mt-20 text-red-500 font-bold">
            404 Page Not Found
          </h1>
        )
      }

    ]
  }
]);

// App Component
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
