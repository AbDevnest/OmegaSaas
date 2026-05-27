import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AppContext from "../components/AppContext";

export default function Login() {
  const appState = useContext(AppContext);

  if (appState?.role) {
    return (
      <Navigate
        to={appState.role === "admin" ? "/dashboard" : "/products"}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Omega SaaS</h1>
        <p className="mt-2 text-sm text-slate-500">
          Select profile to continue
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => appState.login("admin")}
            className="w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white"
          >
            Continue as Admin
          </button>

          <button
            onClick={() => appState.login("user")}
            className="w-full rounded-xl border border-[#f59e0b] bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-[#0f172a]"
          >
            Continue as User
          </button>
        </div>
      </div>
    </div>
  );
}
