import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AppContext from "../components/AppContext";

export default function RequireAdmin({ children }) {
  const appState = useContext(AppContext);

  if (appState?.role !== "admin") {
    return <Navigate to="/products" replace />;
  }

  return children;
}
