import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthRoute({ children, isAuthenticated }) {
  const { user, userLoading } = useAuth();
  const token = localStorage.getItem("token");

  // If still loading user data, don't redirect yet
  if (userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Check both the prop and also direct token/user existence
  if (!isAuthenticated && !token && !user) {
    // Store the intended destination
    const currentPath = window.location.pathname;
    localStorage.setItem("redirectPath", currentPath);
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AuthRoute;
