import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";

import { MdDashboard, MdInventory, MdAnalytics, MdClose } from "react-icons/md";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={22} />,
    roles: ["admin"],
  },

  {
    path: "/products",
    label: "Products",
    icon: <MdInventory size={22} />,
    roles: ["admin", "user"],
  },

  {
    path: "/analytics",
    label: "Analytics",
    icon: <MdAnalytics size={22} />,
    roles: ["admin"],
  },
];

export default function Sidebar({ open, onClose, role }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!open || !isMobile) return;

    const handleOutsideClick = (event) => {
      if (!sidebarRef.current?.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="
            cursor-pointer
            fixed
            inset-0
            bg-black/50
            z-40
            md:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#0f172a]
          border-r border-[#37311d]
          h-screen
          lg:w-64
          md:w-56
          p-5
          flex
          flex-col
          justify-between
          transition-all
          duration-300
          z-50

          fixed top-0 left-0

          ${open ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
        ref={sidebarRef}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-bold text-white">Omega SaaS</h1>

            <button onClick={onClose} className="md:hidden text-gray-300">
              <MdClose size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? "bg-[#f59e0b] text-[#0f172a] font-semibold"
                      : "text-gray-300 hover:bg-[#37311d] hover:text-white"
                  }
                  `
                  }
                >
                  {item.icon}

                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
          </nav>
        </div>

        <div
          className="
            bg-[#111827]
            border border-[#37311d]
            rounded-xl
            p-3
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-[#f59e0b]
              text-[#0f172a]
              flex
              items-center
              justify-center
              font-bold
            "
          >
            {role === "admin" ? "A" : "U"}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {role === "admin" ? "Admin" : "User"}
            </h3>

            <p className="text-xs text-gray-400">
              {role === "admin" ? "admin@omega.com" : "user@omega.com"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
