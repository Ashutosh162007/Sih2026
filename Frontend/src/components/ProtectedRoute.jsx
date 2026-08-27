import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ roles }) {
  const user = useAuthStore((s) => s.user);
  const homeForRole = useAuthStore((s) => s.homeForRole);

  if (!user) return <Navigate to="/login" replace />;
  if (user.status === "pending") return <Navigate to="/signup/pending" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeForRole(user)} replace />;
  return <Outlet />;
}
