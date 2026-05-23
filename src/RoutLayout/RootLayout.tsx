import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useUser } from "../Context/UserContext";

export const RootLayout = () => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();
  const hideSidebarRoutes: string[] = [];
  const isSelectionPage = hideSidebarRoutes.includes(location.pathname);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (

    <div className="h-screen w-full flex flex-col overflow-hidden">

      <Navbar />

      {/* 2. This container holds the Sidebar and Main content side-by-side */}
      <div className="flex flex-1 overflow-hidden">

        {!isSelectionPage && <Sidebar />}

        <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-bg">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};