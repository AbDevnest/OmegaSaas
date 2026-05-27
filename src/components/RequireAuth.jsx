import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AppContext from "../components/AppContext";

export default function RequireAuth({ children }) {
  const appState = useContext(AppContext);

  if (!appState?.role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
