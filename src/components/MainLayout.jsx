import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const pageHeaderConfig = {
  "/": {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerData = pageHeaderConfig[pathname] ?? {
    title: "Omega SaaS",
    subtitle: "Manage your workspace efficiently.",
  };

  
  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64 md:ml-54">
        <Header
          title={headerData.title}
          subtitle={headerData.subtitle}
          onToggleSidebar={toggleSidebar}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
