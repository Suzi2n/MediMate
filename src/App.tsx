import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomeLayout from "./layouts/HomeLayout";
import { UserProvider, useUser } from "./contexts/UserContext";
import LoadingSpinner from "./components/LoadingSpinner";
import RoleSelectPage from "./pages/RoleSelectPage";

import UserDashboardPage from "./pages/UserDashboardPage";
import Redirector from "./pages/Redirector";
import ClinicVisitsPage from "./pages/ClinicVisitsPage";
import DoctorDashboardLayout from "./layouts/DoctorDashboardLayout";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { loading, user } = useUser();

  if (loading) return <LoadingSpinner />; // 로딩 스피너

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout />}>
          {/* <Route index element={<HomePage />} /> */}
          <Route path="/" element={<Redirector />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="role-select" element={<RoleSelectPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* 의사 및 보호자 공통 레이아웃 */}
        <Route path="/dashboard" element={<DoctorDashboardLayout />}>
          {/* 역할에 따라 내부에서 검사 */}
          <Route index element={<DoctorDashboard />} />
          <Route
            path="patient/:id/clinic-visits"
            element={<ClinicVisitsPage />}
          />
        </Route>

        {/* 보호자 대시보드 별도 */}
        {user?.role === "user" && (
          <Route path="/user-dashboard" element={<UserDashboardPage />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
