import { MdMenu, MdNotificationsNone } from "react-icons/md";

export default function Header({
  title,
  subtitle,
  onToggleSidebar,
  role,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between md:w-auto w-full gap-2 md:items-baseline md:justify-start">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-base text-slate-400 md:block hidden">{subtitle}</p>

          <button
            onClick={onToggleSidebar}
            className="rounded-lg bg-[#0f172a] p-2 text-white md:hidden"
          >
            <MdMenu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
            Live
          </span>

          <button className="relative rounded-full bg-amber-50 p-2 text-amber-500">
            <MdNotificationsNone size={20} />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
          </button>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f59e0b] font-semibold text-[#0f172a] text-xs">
              {role === "admin" ? "A" : "U"}
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {role === "admin" ? "Admin" : "User"}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#f59e0b] hover:text-[#0f172a]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
