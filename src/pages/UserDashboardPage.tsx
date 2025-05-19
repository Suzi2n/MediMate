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
  Card,
  CardContent,
  TextField,
  IconButton,
  InputAdornment,
  Grid,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  List as MUIList,
  ListItem as MUIListItem,
  ListItemText as MUIListItemText,
  Skeleton,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLogout } from "../hooks/useLogout";
import {
  addClinicVisit,
  deleteClinicVisit,
  getClinicVisits,
  updateClinicVisit,
} from "../types/clinicVisitService";

const drawerWidth = 240;

interface ClinicVisit {
  id: string;
  date: string;
  note: string;
}

export default function UserDashboard() {
  const { user } = useUser();
  const handleLogout = useLogout();

  const isGuardian = user?.role === "user";
  const readOnly = isGuardian;

  if (!user || !isGuardian) {
    return <Navigate to="/" replace />;
  }

  const [searchValue, setSearchValue] = useState("");
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "symptoms" | "medications" | "clinicVisits" | "healthRecords" | null
  >(null);

  const [clinicVisits, setClinicVisits] = useState<ClinicVisit[]>([]);
  const [editTarget, setEditTarget] = useState<ClinicVisit | null>(null);
  const [form, setForm] = useState({ date: "", note: "" });


   const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [recordEditTarget, setRecordEditTarget] = useState<{
    idx: number;
    date: string;
    content: string;
  } | null>(null);
   const [recordForm, setRecordForm] = useState({ date: "", content: "" });

   
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
      setDashboardData(data);
      const visits = await getClinicVisits(data.patientId);
      setClinicVisits(visits);
    setHealthRecords(data.healthRecords || []);
    } catch (err) {
      console.error("조회 오류:", err);
      alert("데이터 조회 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (
    type: "symptoms" | "medications" | "clinicVisits" | "healthRecords"
  ) => {
    setSelectedType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedType(null);
    setForm({ date: "", note: "" });
    setEditTarget(null);
  };

  const handleEdit = (visit: ClinicVisit) => {
    setEditTarget(visit);
    setForm({ date: visit.date, note: visit.note });
  };

  const handleDelete = async (id: string) => {
    await deleteClinicVisit(id);
    setClinicVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.note || !dashboardData?.patientId) return;

    if (editTarget) {
      await updateClinicVisit(editTarget.id, form.date, form.note);
      setClinicVisits((prev) =>
        prev.map((v) => (v.id === editTarget.id ? { ...v, ...form } : v))
      );
    } else {
      const newVisit = await addClinicVisit(
        dashboardData.patientId,
        form.date,
        form.note
      );
      setClinicVisits((prev) => [...prev, newVisit]);
    }
    setForm({ date: "", note: "" });
    setEditTarget(null);
  };
// 없어도 되나?
  const renderList = (
    type: "symptoms" | "medications" | "clinicVisits" | "healthRecords"
  ) => {
    if (!dashboardData) return "데이터가 없습니다.";
    const items = dashboardData[type] || [];
    return (
      <ul>
        {items.map((item: any, idx: number) => (
          <li key={idx}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#A71963" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">
            Medimate 대시보드{" "}
            <Box
              component="span"
              sx={{
                bgcolor: "#EC407A",
                color: "#fff",
                px: 1.5,
                py: 0.5,
                ml: 2,
                borderRadius: "8px",
                fontSize: "0.8rem",
              }}
            >
              보호자용 (읽기 전용)
            </Box>
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
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
              <ListItemText primary="환자 검색" />
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
                "&.Mui-focused fieldset": { borderColor: "#A71963" },
              },
              "& label.Mui-focused": { color: "#A71963" },
            }}
          />
        </Box>

        {loading ? (
          <>
            <Skeleton
              variant="text"
              width={300}
              height={40}
              sx={{ mx: "auto", my: 5 }}
            />
            <Grid container spacing={2} gap={10} justifyContent="center">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Skeleton variant="rectangular" width={650} height={270} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          dashboardData && (
            <>
              <Typography variant="h5" align="center" margin={5}>
                📋{" "}
                {patientName ? (
                  <>
                    <Box component="span" fontWeight="bold">
                      {patientName}님
                    </Box>{" "}
                    건강 정보
                  </>
                ) : (
                  "건강 정보"
                )}
              </Typography>

              <Grid container spacing={2} gap={10} justifyContent="center">
                {["symptoms", "medications", "clinicVisits", "healthRecords"].map((type) => (
                  <Grid item xs={12} md={4} key={type}>
                    <Card sx={{ minWidth: 250 }}>
                      <CardActionArea onClick={() => handleOpen(type as any)}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ width: 650, height: 270 }}
                          >
                            {type === "symptoms" && "📈 증상 기록"}
                            {type === "medications" && "💊 약물 복용 이력"}
                            {type === "clinicVisits" && "🏥 진료 기록"}
                            {type === "healthRecords" && "📝 건강 일지"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            클릭하여 상세보기
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                  {selectedType === "symptoms" && "📈 증상 기록 상세"}
                  {selectedType === "medications" && "💊 약물 복용 이력 상세"}
                  {selectedType === "clinicVisits" && "🏥 진료 기록"}
                  {selectedType === "healthRecords" && "📝 건강 일지 상세"}
                </DialogTitle>
                <DialogContent>
                  {selectedType === "clinicVisits" ? (
                    <>
                      <MUIList>
                        {clinicVisits.map((visit) => (
                          <MUIListItem
                            key={visit.id}
                            divider
                            secondaryAction={
                              !readOnly && (
                                <>
                                  <IconButton onClick={() => handleEdit(visit)}>
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => handleDelete(visit.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </>
                              )
                            }
                          >
                            <MUIListItemText
                              primary={visit.date}
                              secondary={visit.note}
                            />
                          </MUIListItem>
                        ))}
                      </MUIList>

                      {!readOnly && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1">
                            {editTarget ? "진료 기록 수정" : "새 진료 기록 추가"}
                          </Typography>
                          <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ mt: 2 }}
                          >
                            <TextField
                              label="진료 날짜"
                              type="date"
                              fullWidth
                              value={form.date}
                              onChange={(e) =>
                                setForm({ ...form, date: e.target.value })
                              }
                              InputLabelProps={{ shrink: true }}
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="진료 내용"
                              multiline
                              fullWidth
                              rows={3}
                              value={form.note}
                              onChange={(e) =>
                                setForm({ ...form, note: e.target.value })
                              }
                              sx={{ mb: 2 }}
                            />
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                            >
                              {editTarget ? "수정" : "추가"}
                            </Button>
                          </Box>
                        </>
                      )
                      
                      }
                    </>
                    ) : selectedType === "healthRecords" ? ( <>
                      <MUIList>
                        {healthRecords.map((record, idx) => (
                          <MUIListItem
                            key={idx}
                            divider
                            secondaryAction={
                              readOnly && (
                                <IconButton
                                  onClick={() => {
                                    setRecordEditTarget({ idx, ...record });
                                    setRecordForm({ date: record.date, content: record.content });
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              )
                            }
                          >
                            <MUIListItemText primary={record.date} secondary={record.content} />
                          </MUIListItem>
                        ))}
                      </MUIList>

                      {readOnly && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1">
                            {recordEditTarget ? "건강일지 수정" : "건강일지 추가"}
                          </Typography>
                          <Box
                            component="form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const updated = [...healthRecords];
                              if (recordEditTarget) {
                                updated[recordEditTarget.idx] = { ...recordForm };
                              } else {
                                updated.push({ ...recordForm });
                              }
                              setHealthRecords(updated);
                              setDashboardData((prev: any) => ({
                                ...prev,
                                healthRecords: updated,
                              }));
                              setRecordForm({ date: "", content: "" });
                              setRecordEditTarget(null);
                            }}
                            sx={{ mt: 2 }}
                          >
                            <TextField
                              label="날짜"
                              type="date"
                              fullWidth
                              value={recordForm.date}
                              onChange={(e) =>
                                setRecordForm({ ...recordForm, date: e.target.value })
                              }
                              InputLabelProps={{ shrink: true }}
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="내용"
                              multiline
                              fullWidth
                              rows={3}
                              value={recordForm.content}
                              onChange={(e) =>
                                setRecordForm({ ...recordForm, content: e.target.value })
                              }
                              sx={{ mb: 2 }}
                            />
                            <Button type="submit" variant="contained" color="primary">
                              {recordEditTarget ? "수정" : "추가"}
                            </Button>
                          </Box>
                        </>
                      )}
                    </>
                    
                  ) : (
                    <DialogContent>
                      {selectedType && renderList(selectedType)}
                    </DialogContent>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )
        )}
      </Box>
    </Box>
  );
}
