import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppContext from "../components/AppContext";

const pageHeaderConfig = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back, Admin",
  },
  "/products": {
    title: "Products",
    subtitle: "Manage inventory, pricing, and product listings.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Track performance metrics",
  },
};

function MainLayout() {
  const { pathname } = useLocation();
  const appState = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerData =
    pageHeaderConfig[pathname] ??
    (pathname.startsWith("/products/")
      ? { title: "Product Detail", subtitle: "Viewing product information" }
      : {
          title: "Omega SaaS",
          subtitle: "Manage your workspace efficiently.",
        });

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} role={appState.role} />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64 md:ml-56">
        <Header
          title={headerData.title}
          subtitle={headerData.subtitle}
          onToggleSidebar={toggleSidebar}
          role={appState.role}
          onLogout={appState.logout}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
