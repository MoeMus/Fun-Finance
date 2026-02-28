import { Navigate, useLocation } from "react-router-dom";


function ProtectedRoute({isLoggedIn, protected_component}) {
  const location = useLocation();
  if(!isLoggedIn) {
    return <Navigate to={"/login"}  state={{ from: location }} replace />
  }

  return protected_component;

}

export default ProtectedRoute;