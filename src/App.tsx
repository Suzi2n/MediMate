import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomeLayout from "./layouts/HomeLayout";
import SchedulePage from "./pages/SchedulePage";
import ScheduleDetailPage from "./pages/ScheduleDetailPage";
import { UserProvider, useUser } from "./contexts/UserContext";
import LoadingSpinner from "./components/LoadingSpinner";
import RoleSelectPage from "./pages/RoleSelectPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { loading , user } = useUser();

  if (loading) return <LoadingSpinner />; // 로딩 스피너

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="role-select" element={<RoleSelectPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="schedule/:id" element={<ScheduleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {user?.role === "doctor" && (
          <Route path="/dashboard" element={<DoctorDashboardPage />} />
        )}

        {user?.role === "user" && (
          <Route path="/user-dashboard/" element={<UserDashboardPage />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
