import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./RoutLayout/RootLayout";

// 1. Premium loader fallbacks for code splitting transitions
const PageLoader = () => (
  <div className="h-[65vh] w-full flex flex-col items-center justify-center gap-3 backdrop-blur-[1px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Screen...</p>
  </div>
);

const FullScreenLoader = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Corporate Portal...</p>
  </div>
);

// 2. Lazy imports of dynamic pages
const EMPDashBord = lazy(() => import("./pages/EMPDashBord").then(m => ({ default: m.EMPDashBord })));
const Leaves = lazy(() => import("./pages/Leaves").then(m => ({ default: m.Leaves })));
const Events = lazy(() => import("./pages/Events").then(m => ({ default: m.Events })));
const Payroll = lazy(() => import("./pages/Payroll").then(m => ({ default: m.Payroll })));
const Tasks = lazy(() => import("./pages/Tasks").then(m => ({ default: m.Tasks })));
const LoginPage = lazy(() => import("./Auth/LoginPage").then(m => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import("./pages/Profilepage/profilepage").then(m => ({ default: m.ProfilePage })));
// const Department = lazy(() => import("./pages/Department").then(m => ({ default: m.Department })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/EmployeeManagement" replace />
      },
      {
        path: "EmployeeManagement",
        element: (
          <Suspense fallback={<PageLoader />}>
            <EMPDashBord />
          </Suspense>
        )
      },
      {
        path: "leaves",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Leaves />
          </Suspense>
        )
      },
      {
        path: "events",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Events />
          </Suspense>
        )
      },
      {
        path: "payroll",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Payroll />
          </Suspense>
        )
      },
      {
        path: "tasks",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tasks />
          </Suspense>
        )
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        )
      },
      {
        path: "*",
        element: <Navigate to="/EmployeeManagement" replace />
      }
    ]
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<FullScreenLoader />}>
        <LoginPage />
      </Suspense>
    )
  }
]);
