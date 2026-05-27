import "./App.css";
import { useMemo, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppContext from "./components/AppContext";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import RoleHome from "./pages/RoleHome";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <RoleHome /> },
      {
        path: "/dashboard",
        element: (
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        ),
      },
      { path: "/products", element: <Product /> },
      { path: "/products/:id", element: <ProductDetail /> },
      {
        path: "/analytics",
        element: (
          <RequireAdmin>
            <Analytics />
          </RequireAdmin>
        ),
      },
      {
        path: "*",
        element: (
          <h1 className="mt-20 text-center text-4xl font-bold text-rose-500">
            404 Page Not Found
          </h1>
        ),
      },
    ],
  },
]);

export default function App() {
  const [role, setRole] = useState(
    () => localStorage.getItem("omega_role") || "",
  );
  const [publishedMap, setPublishedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("omega_published_map");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  function login(nextRole) {
    localStorage.setItem("omega_role", nextRole);
    setRole(nextRole);
  }

  function logout() {
    localStorage.removeItem("omega_role");
    setRole("");
  }

  function isPublished(productId) {
    return publishedMap[String(productId)] !== false;
  }

  function togglePublished(productId) {
    setPublishedMap((prev) => {
      const key = String(productId);
      const next = { ...prev, [key]: !(prev[key] !== false) };
      localStorage.setItem("omega_published_map", JSON.stringify(next));
      return next;
    });
  }

  const appState = useMemo(
    () => ({ role, login, logout, isPublished, togglePublished }),
    [role, publishedMap],
  );

  return (
    <AppContext.Provider value={appState}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
