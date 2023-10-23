import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../stores/store";
import { useSelector } from "react-redux";
import { ReduxRootState } from "../store-redux/store";
import { IsUserLoggedIn } from "../store-redux/userSlice";

export default function RequireAuth() {
    const location = useLocation();

    if (!IsUserLoggedIn()) {
      return <Navigate to="/" state={{ from: location }} />;
    }

    return <Outlet />
}