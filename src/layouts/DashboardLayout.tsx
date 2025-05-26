import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLogout } from "../hooks/useLogout";
import { requestAccessLog } from "../apis/logAccessRequest";
import { db } from "../firebase";
import {
  getDocs,
  query,
  where,
  collection,
  orderBy,
  limit,
} from "firebase/firestore";

const drawerWidth = 240;

const checkApproval = async (searcherId, patientId, searcherNickname) => {
  const q = query(
    collection(db, "access_logs"),
    where("searcherId", "==", searcherId),
    where("targetPatientId", "==", patientId),
    where("searcherNickname", "==", searcherNickname),
    where("status", "in", ["pending", "notified", "rejected"]),
    where("timestamp", "!=", null),
    orderBy("timestamp", "desc"),
    limit(5)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const sorted = snap.docs
    .filter((doc) => doc.data().timestamp)
    .sort(
      (a, b) => b.data().timestamp.toMillis() - a.data().timestamp.toMillis()
    );
  return sorted[0]?.data().status;
};

export default function DashboardLayout() {
  const { user } = useUser();
  const handleLogout = useLogout();
  const navigate = useNavigate();
  const role = user?.role;

  const [searchValue, setSearchValue] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [patientName, setPatientName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.includes("#")) {
      alert("형식: 이름#식별번호 로 입력하세요.");
      return;
    }
    const [name, code] = searchValue.split("#");
    setPatientName(name.trim());

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8001/api/patient-dashboard?name=${name}&code=${code}`
      );
      if (!res.ok) {
        alert("환자를 찾을 수 없습니다.");
        return;
      }
      const data = await res.json();
      const patientId = data.patientId;

      /*
      // 동의 로직
      // 2️⃣ Firestore에 access_log를 pending 상태로 기록
      await requestAccessLog(user.uid, patientId, user.name);

      // 3️⃣ 보호자 승인 polling
      let finalStatus: string | null = null;
      for (let i = 0; i < 10; i++) {
        const status = await checkApproval(user.uid, patientId, user.name);
        if (status === "notified" || status === "rejected") {
          finalStatus = status;
          break;
        }
        await new Promise((r) => setTimeout(r, 10000));
      }

      if (finalStatus === "rejected") {
        alert("대상자가 접근을 거절했습니다.");
        return;
      }
     
      // 4️⃣ 승인 완료되면 대시보드 표시
      if (finalStatus === "notified") {
      */

      setDashboardData(data);
      navigate("/dashboard"); // 기본 카드 대시보드로 이동
    } catch (err) {
      console.error("검색 오류:", err);
      alert("검색 중 오류 발생");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#007AFF" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {role === "doctor" ? (
            <Typography variant="h6">Medimate 대시보드</Typography>
          ) : role === "user" ? (
            <Typography variant="h6">
              Medimate 회원용 대시보드 (읽기용)
            </Typography>
          ) : null}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user && (
              <span className="text-gray-200 font-semibold">{user.name}님</span>
            )}
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="환자 목록" />
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3 }}>
        <Toolbar />

        <Box sx={{ mb: 3 }}>
          <TextField
            label="환자 검색 (예: 김철수#1234)"
            variant="outlined"
            fullWidth
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#007AFF" },
              },
              "& label.Mui-focused": { color: "#007AFF" },
            }}
          />
        </Box>

        {/* 하위 콘텐츠 렌더 */}
        <Outlet context={{ dashboardData, setDashboardData, patientName }} />
      </Box>
    </Box>
  );
}
