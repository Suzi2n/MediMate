// import React, { useState } from "react";
// import {
//   AppBar,
//   Box,
//   CssBaseline,
//   Drawer,
//   Toolbar,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Divider,
//   Button,
//   TextField,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import PeopleIcon from "@mui/icons-material/People";
// import LogoutIcon from "@mui/icons-material/Logout";
// import SearchIcon from "@mui/icons-material/Search";
// import { Outlet, useNavigate } from "react-router-dom";
// import { useUser } from "../contexts/UserContext";
// import { useLogout } from "../hooks/useLogout";
// import { db } from "../firebase";
// import {
//   getDocs,
//   query,
//   where,
//   collection,
//   orderBy,
//   limit,
// } from "firebase/firestore";

// const drawerWidth = 240;

// const checkApproval = async (searcherId, patientId, searcherNickname) => {
//   const q = query(
//     collection(db, "access_logs"),
//     where("searcherId", "==", searcherId),
//     where("targetPatientId", "==", patientId),
//     where("searcherNickname", "==", searcherNickname),
//     where("status", "in", ["pending", "notified", "rejected"]),
//     where("timestamp", "!=", null),
//     orderBy("timestamp", "desc"),
//     limit(5)
//   );
//   const snap = await getDocs(q);
//   if (snap.empty) return null;
//   const sorted = snap.docs
//     .filter((doc) => doc.data().timestamp)
//     .sort(
//       (a, b) => b.data().timestamp.toMillis() - a.data().timestamp.toMillis()
//     );
//   return sorted[0]?.data().status;
// };

// export default function DashboardLayout() {
//   const { user } = useUser();
//   const handleLogout = useLogout();
//   const navigate = useNavigate();
//   const role = user?.role;

//   const [searchValue, setSearchValue] = useState("");
//   const [dashboardData, setDashboardData] = useState(null);
//   const [patientName, setPatientName] = useState<string | null>(null);

//   const [loading, setLoading] = useState(false);

//   const handleSearch = async () => {
//     if (!searchValue.includes("#")) {
//       alert("형식: 이름#식별번호 로 입력하세요.");
//       return;
//     }
//     const [name, code] = searchValue.split("#");
//     setPatientName(name.trim());

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:8001/api/patient-dashboard?name=${name}&code=${code}`
//       );
//       if (!res.ok) {
//         alert("환자를 찾을 수 없습니다.");
//         return;
//       }
//       const data = await res.json();
//       const patientId = data.patientId;

//       /*
//       // 동의 로직
//       // 2️⃣ Firestore에 access_log를 pending 상태로 기록
//       await requestAccessLog(user.uid, patientId, user.name);

//       // 3️⃣ 보호자 승인 polling
//       let finalStatus: string | null = null;
//       for (let i = 0; i < 10; i++) {
//         const status = await checkApproval(user.uid, patientId, user.name);
//         if (status === "notified" || status === "rejected") {
//           finalStatus = status;
//           break;
//         }
//         await new Promise((r) => setTimeout(r, 10000));
//       }

//       if (finalStatus === "rejected") {
//         alert("대상자가 접근을 거절했습니다.");
//         return;
//       }
     
//       // 4️⃣ 승인 완료되면 대시보드 표시
//       if (finalStatus === "notified") {
//       */

//       setDashboardData(data);
//       navigate("/dashboard"); // 기본 카드 대시보드로 이동
//     } catch (err) {
//       console.error("검색 오류:", err);
//       alert("검색 중 오류 발생");
//     }
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       <CssBaseline />
//       <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#007AFF" }}>
//         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//           {role === "doctor" ? (
//             <Typography variant="h6">Medimate 대시보드</Typography>
//           ) : role === "user" ? (
//             <Typography variant="h6">
//               Medimate 회원용 대시보드
//             </Typography>
//           ) : null}

//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {user && (
//               <span className="text-gray-200 font-semibold">{user.name}님</span>
//             )}
//             <Button
//               color="inherit"
//               startIcon={<LogoutIcon />}
//               onClick={handleLogout}
//             >
//               로그아웃
//             </Button>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: {
//             width: drawerWidth,
//             boxSizing: "border-box",
//           },
//         }}
//       >
//         <Toolbar />
//         <Box sx={{ overflow: "auto" }}>
//           <List>
//             <ListItem>
//               <ListItemIcon>
//                 <PeopleIcon />
//               </ListItemIcon>
//               <ListItemText primary="환자 목록" />
//             </ListItem>
//           </List>
//           <Divider />
//         </Box>
//       </Drawer>

//       <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3 }}>
//         <Toolbar />

//         <Box sx={{ mb: 3 }}>
//   <TextField
//     label="환자 검색 (예: 김철수#1234)"
//     variant="outlined"
//     fullWidth
//     value={searchValue}
//     onChange={(e) => setSearchValue(e.target.value)}
//     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//     InputProps={{
//       endAdornment: (
//         <InputAdornment position="end">
//           <IconButton onClick={handleSearch}>
//             <SearchIcon />
//           </IconButton>
//         </InputAdornment>
//       ),
//       sx: {
//         fontSize: "1.2rem",
//         height: "60px",
//       },
//     }}
//     InputLabelProps={{
//       sx: { fontSize: "1.1rem" }, 
//     }}
//     sx={{
//       "& .MuiOutlinedInput-root": {
//         "&.Mui-focused fieldset": { borderColor: "#007AFF" },
//         fontSize: "1.2rem",
//       },
//       "& label.Mui-focused": { color: "#007AFF" },
//     }}
//   />
// </Box>


//         {/* 하위 콘텐츠 렌더 */}
//         <Outlet context={{ dashboardData, setDashboardData, patientName }} />
//       </Box>
//     </Box>
//   );
// }




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
  Avatar,
  Chip,
  Card,
  CardContent,
  Badge,
  Tooltip,
  Paper,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLogout } from "../hooks/useLogout";
import { db } from "../firebase";
import {
  getDocs,
  query,
  where,
  collection,
  orderBy,
  limit,
} from "firebase/firestore";

const drawerWidth = 280;

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

      setDashboardData(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("검색 오류:", err);
      alert("검색 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { 
      text: "대시보드", 
      icon: <DashboardIcon />, 
      path: "/dashboard",
      color: "#3b82f6"
    },
    { 
      text: "환자 목록", 
      icon: <PeopleIcon />, 
      path: "/patients",
      color: "#06b6d4"
    },
    
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      
      {/* 상단 앱바 */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1201, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          py: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'white', 
              color: '#3b82f6',
              width: 40,
              height: 40
            }}>
              <LocalHospitalIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {role === "doctor" ? "Medimate 의료진 대시보드" : "Medimate 사용자 대시보드"}
              </Typography>
             
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="알림">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {user && (
              <Chip
                avatar={
                  <Avatar sx={{ 
                    bgcolor: 'white', 
                    color: '#3b82f6',
                    width: 24,
                    height: 24
                  }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                }
                label={`${user.name}님`}
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .MuiChip-label': {
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            )}
            
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              로그아웃
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 사이드바 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRight: '1px solid #cbd5e1'
          },
        }}
      >
        <Toolbar />
        
        {/* 사용자 정보 카드 */}
        <Box sx={{ p: 2 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'white', 
                  color: '#3b82f6',
                  width: 48,
                  height: 48
                }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  
                  
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ mx: 2, borderColor: '#cbd5e1' }} />

        {/* 메뉴 리스트 */}
        <Box sx={{ overflow: "auto", p: 1 }}>
          <List sx={{ px: 1 }}>
            {menuItems.map((item, index) => (
              <ListItem 
                key={index}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                  }
                }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: item.color
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: '#374151'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 하단 정보 */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 2
          }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Medimate v2.0
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              © 2025 Healthcare Solutions
            </Typography>
          </Paper>
        </Box>
      </Drawer>

      {/* 메인 콘텐츠 영역 */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        
        {/* 검색 영역 */}
        <Box sx={{ p: 3 }}>
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e40af' }}>
                🔍 환자 검색
              </Typography>
              <TextField
                label="환자 검색 (예: 김철수#1234)"
                variant="outlined"
                fullWidth
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleSearch}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#2563eb'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#cbd5e1'
                          }
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "1.1rem",
                    height: "56px",
                    borderRadius: 2
                  },
                }}
                InputLabelProps={{
                  sx: { fontSize: "1rem" }, 
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { 
                      borderColor: "#3b82f6",
                      borderWidth: 2
                    },
                    "&:hover fieldset": {
                      borderColor: "#60a5fa"
                    }
                  },
                  "& label.Mui-focused": { 
                    color: "#3b82f6",
                    fontWeight: 'bold'
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                환자의 이름과 식별번호를 #으로 구분하여 입력해주세요
              </Typography>
            </CardContent>
          </Card>

          {/* 하위 콘텐츠 렌더 */}
          <Box sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
            border: '1px solid #e2e8f0',
            minHeight: '60vh'
          }}>
            <Outlet context={{ dashboardData, setDashboardData, patientName }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
