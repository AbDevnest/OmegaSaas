import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AppContext from "../components/AppContext";

export default function RoleHome() {
  const appState = useContext(AppContext);

  if (appState?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/products" replace />;
}
