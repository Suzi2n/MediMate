import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomeLayout from "./layouts/HomeLayout";
import { UserProvider, useUser } from "./contexts/UserContext";
import LoadingSpinner from "./components/LoadingSpinner";
import RoleSelectPage from "./pages/RoleSelectPage";

import Redirector from "./pages/Redirector";
import ClinicVisitsPage from "./pages/ClinicVisitsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import HealthRecordPage from "./pages/HealthRecordPage";
import MedicationHistoryPage from "./pages/MedicationHistoryPage";
import SymptomLogPage from "./pages/SymptomLogPage";



function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { loading } = useUser();

  if (loading) return <LoadingSpinner />; // 로딩 스피너

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<Redirector />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="role-select" element={<RoleSelectPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* 의사 및 보호자 공통 레이아웃. 역할에 따라 내부에서 검사 */ }
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard/clinic-visits/:customId" element={<ClinicVisitsPage />} />
          <Route path="/dashboard/health-records/:customId" element={<HealthRecordPage />} />
          <Route path="/dashboard/medication-history/:customId" element={<MedicationHistoryPage />} />
          <Route path="/dashboard/symptom-log/:customId" element={<SymptomLogPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
