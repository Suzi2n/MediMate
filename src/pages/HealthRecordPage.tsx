// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardActions,
//   TextField,
//   Typography,
//   Skeleton,
//   ToggleButton,
//   ToggleButtonGroup,
// } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import { useUser } from "../contexts/UserContext";
// import {
//   getHealthRecords,
//   addHealthRecord,
//   updateHealthRecord,
//   deleteHealthRecord,
// } from "../types/healthRecordService";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";
// import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { Timestamp } from "firebase/firestore";
// import { isSameDay } from "date-fns";
// import { PickersDayProps } from "@mui/x-date-pickers/PickersDay";

// interface HealthRecord {
//   id: string;
//   date: Timestamp | string;
//   content: string;
//   createdAt: Timestamp | string;
// }

// export default function HealthRecordPage() {
//   const { user } = useUser();
//   const isUser = user?.role === "user";
//   const { customId } = useParams();
//   const navigate = useNavigate();

//   const [records, setRecords] = useState<HealthRecord[]>([]);
//   const [form, setForm] = useState({ date: "", content: "" });
//   const [editTarget, setEditTarget] = useState<HealthRecord | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
//   const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

//   useEffect(() => {
//     if (!customId) return;
//     const fetchData = async () => {
//       const data = await getHealthRecords(customId);
//       setRecords(data);
//       setLoading(false);
//     };
//     fetchData();
//   }, [customId]);

//   const filteredRecords = records.filter((record) => {
//     const recordDate =
//       record.date instanceof Timestamp
//         ? record.date.toDate().toDateString()
//         : new Date(record.date).toDateString();
//     return selectedDate && recordDate === selectedDate.toDateString();
//   });

//   const recordDates = records.map((record) =>
//     record.date instanceof Timestamp
//       ? record.date.toDate()
//       : new Date(record.date)
//   );

//   const renderDay = (
//     day: Date,
//     selectedDate: Date | null,
//     pickersDayProps: PickersDayProps<Date>
//   ) => {
//     const hasRecord = recordDates.some((date) => isSameDay(day, date));

//     return (
//       <PickersDay
//         {...pickersDayProps}
//         sx={{
//           ...(hasRecord && {
//             backgroundColor: "#90caf9",
//             borderRadius: "50%",
//             color: "white",
//           }),
//         }}
//       />
//     );
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.date || !form.content || !customId) return;

//     const safeForm = {
//       ...form,
//       date: Timestamp.fromDate(new Date(form.date)),
//     };

//     if (editTarget) {
//       await updateHealthRecord(customId, editTarget.id, safeForm);
//       setRecords((prev) =>
//         prev.map((v) => (v.id === editTarget.id ? { ...v, ...safeForm } : v))
//       );
//       setEditTarget(null);
//     } else {
//       const newRecord = await addHealthRecord(customId, safeForm);
//       setRecords((prev) => [...prev, newRecord]);
//     }

//     setForm({ date: "", content: "" });
//     setShowForm(false);
//   };

//   const handleEdit = (record: HealthRecord) => {
//     setEditTarget(record);
//     setForm({
//       date:
//         record.date instanceof Timestamp
//           ? record.date.toDate().toISOString().slice(0, 10)
//           : record.date,
//       content: record.content,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!customId) return;
//     await deleteHealthRecord(customId, id);
//     setRecords((prev) => prev.filter((r) => r.id !== id));
//     if (editTarget?.id === id) {
//       setEditTarget(null);
//       setForm({ date: "", content: "" });
//     }
//   };

//   return (
//     <Box sx={{ px: 4, py: 2, height: "100vh", overflow: "auto" }}>
//       <Button
//         startIcon={<ArrowBackIcon />}
//         onClick={() => navigate(-1)}
//         sx={{ mb: 2 }}
//       >
//         대시보드 메인으로 돌아가기
//       </Button>

//       <Typography variant="h4" fontWeight="bold" gutterBottom>
//         📝 건강 일지
//       </Typography>

//       <ToggleButtonGroup
//         value={viewMode}
//         exclusive
//         onChange={(_, next) => next && setViewMode(next)}
//         sx={{ mb: 2 }}
//       >
//         <ToggleButton value="calendar">달력 보기</ToggleButton>
//         <ToggleButton value="list">목록 보기</ToggleButton>
//       </ToggleButtonGroup>

//       {viewMode === "calendar" ? (
//         <Box sx={{ display: "flex", gap: 10, pl: 2, mt: 1 }}>
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <DateCalendar
//               value={selectedDate}
//               onChange={(newDate) => setSelectedDate(newDate)}
//               renderDay={renderDay}
//               sx={{
//                 bgcolor: "white",
//                 borderRadius: 4,
//                 boxShadow: 3,
//                 width: 500,
//                 "& .MuiPickersDay-root": {
//                   fontSize: "1.3rem",
//                   width: 45,
//                   height: 45,
//                 },
//               }}
//             />
//           </LocalizationProvider>

//           <Box
//             sx={{
//               flex: 1,
//               display: "flex",
//               flexDirection: "column",
//               gap: 2,
//               pl: 5,
//             }}
//           >
//             {loading ? (
//               Array.from({ length: 2 }).map((_, idx) => (
//                 <Skeleton key={idx} variant="rectangular" height={100} />
//               ))
//             ) : filteredRecords.length === 0 ? (
//               <Typography color="text.secondary">기록이 없습니다.</Typography>
//             ) : (
//               filteredRecords.map((record) => (
//                 <Card key={record.id} variant="outlined">
//                   <CardContent>
//                     <Typography variant="h5">
//                       📅{" "}
//                       {new Date(
//                         record.date instanceof Timestamp
//                           ? record.date.toDate()
//                           : record.date
//                       ).toLocaleDateString("ko-KR")}
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       color="textSecondary"
//                       sx={{ mt: 1, fontSize: "15px" }}
//                     >
//                       기록일:{" "}
//                       {new Date(
//                         record.createdAt instanceof Timestamp
//                           ? record.createdAt.toDate()
//                           : record.createdAt
//                       ).toLocaleString("ko-KR")}
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       sx={{ mt: 1, whiteSpace: "pre-wrap", fontSize: "20px" }}
//                     >
//                       {record.content}
//                     </Typography>
//                   </CardContent>
//                   {isUser && (
//                     <CardActions sx={{ justifyContent: "flex-end" }}>
//                       <Button
//                         size="large"
//                         startIcon={<EditIcon />}
//                         onClick={() => handleEdit(record)}
//                       >
//                         수정
//                       </Button>
//                       <Button
//                         size="large"
//                         color="error"
//                         startIcon={<DeleteIcon />}
//                         onClick={() => handleDelete(record.id)}
//                       >
//                         삭제
//                       </Button>
//                     </CardActions>
//                   )}
//                 </Card>
//               ))
//             )}

//             {isUser && !showForm && !editTarget && (
//               <Button
//                 startIcon={<AddIcon />}
//                 variant="contained"
//                 sx={{
//                   fontSize: "1.1rem",
//                   width: 100,
//                   backgroundColor: "blue.100",
//                   color: "blue.600",
//                   ":hover": {
//                     backgroundColor: "blue.200",
//                   },
//                 }}
//                 onClick={() => {
//                   setShowForm(true);
//                   setForm({
//                     date: selectedDate?.toISOString().slice(0, 10) || "",
//                     content: "",
//                   });
//                 }}
//               >
//                 추가
//               </Button>
//             )}

//             {isUser && (showForm || editTarget) && (
//               <Card sx={{ mt: 4 }}>
//                 <CardContent>
//                   <Typography variant="h6" sx={{ mb: 2 }}>
//                     {editTarget ? "✏️ 건강 기록 수정" : "✏️ 새 건강 기록"}
//                   </Typography>
//                   <Box component="form" onSubmit={handleSubmit}>
//                     <TextField
//                       label="날짜"
//                       type="date"
//                       fullWidth
//                       InputLabelProps={{ shrink: true }}
//                       value={form.date}
//                       onChange={(e) =>
//                         setForm({ ...form, date: e.target.value })
//                       }
//                       sx={{ mb: 2 }}
//                     />
//                     <TextField
//                       label="내용"
//                       fullWidth
//                       multiline
//                       rows={4}
//                       value={form.content}
//                       onChange={(e) =>
//                         setForm({ ...form, content: e.target.value })
//                       }
//                       sx={{ mb: 2 }}
//                     />
//                     <Box sx={{ display: "flex", gap: 2 }}>
//                       <Button type="submit" variant="contained">
//                         {editTarget ? "수정 완료" : "저장"}
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => {
//                           setShowForm(false);
//                           setEditTarget(null);
//                           setForm({ date: "", content: "" });
//                         }}
//                       >
//                         취소
//                       </Button>
//                     </Box>
//                   </Box>
//                 </CardContent>
//               </Card>
//             )}
//           </Box>
//         </Box>
//       ) : (
//         <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
//           {loading
//             ? Array.from({ length: 3 }).map((_, idx) => (
//                 <Skeleton key={idx} variant="rectangular" height={100} />
//               ))
//             : records.map((record) => (
//                 <Card sx={{boxShadow:1 }} key={record.id} variant="outlined">
//                   <CardContent>
//                     <Typography variant="h6">
//                       📅{" "}
//                       {new Date(
//                         record.date instanceof Timestamp
//                           ? record.date.toDate()
//                           : record.date
//                       ).toLocaleDateString("ko-KR")}
//                     </Typography>
//                     <Typography variant="body1" color="textSecondary">
//                       기록일:{" "}
//                       {new Date(
//                         record.createdAt instanceof Timestamp
//                           ? record.createdAt.toDate()
//                           : record.createdAt
//                       ).toLocaleString("ko-KR")}
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       sx={{ mt: 1, whiteSpace: "pre-wrap", fontSize: "20px" }}
//                     >
//                       {record.content}
//                     </Typography>
//                   </CardContent>
//                   {isUser && (
//                     <CardActions sx={{ justifyContent: "flex-end" }}>
//                       <Button
//                         size="large"
//                         startIcon={<EditIcon />}
//                         onClick={() => handleEdit(record)}
//                       >
//                         수정
//                       </Button>
//                       <Button
//                         size="large"
//                         color="error"
//                         startIcon={<DeleteIcon />}
//                         onClick={() => handleDelete(record.id)}
//                       >
//                         삭제
//                       </Button>
//                     </CardActions>
//                   )}
//                 </Card>
//               ))}

//           {isUser && !showForm && !editTarget && (
//             <Button
//               startIcon={<AddIcon />}
//               variant="contained"
//               sx={{ fontSize: "1.1rem", width: 100 }}
//               onClick={() => {
//                 setShowForm(true);
//                 setForm({
//                   date: selectedDate?.toISOString().slice(0, 10) || "",
//                   content: "",
//                 });
//               }}
//             >
//               추가
//             </Button>
//           )}

//           {isUser && (showForm || editTarget) && (
//             <Card sx={{ mt: 4 }}>
//               <CardContent>
//                 <Typography variant="h6" sx={{ mb: 2 }}>
//                   {editTarget ? "✏️ 건강 기록 수정" : "✏️ 새 건강 기록"}
//                 </Typography>
//                 <Box component="form" onSubmit={handleSubmit}>
//                   <TextField
//                     label="날짜"
//                     type="date"
//                     fullWidth
//                     InputLabelProps={{ shrink: true }}
//                     value={form.date}
//                     onChange={(e) => setForm({ ...form, date: e.target.value })}
//                     sx={{ mb: 2 }}
//                   />
//                   <TextField
//                     label="내용"
//                     fullWidth
//                     multiline
//                     rows={4}
//                     value={form.content}
//                     onChange={(e) =>
//                       setForm({ ...form, content: e.target.value })
//                     }
//                     sx={{ mb: 2 }}
//                   />
//                   <Box sx={{ display: "flex", gap: 2 }}>
//                     <Button type="submit" variant="contained">
//                       {editTarget ? "수정 완료" : "저장"}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={() => {
//                         setShowForm(false);
//                         setEditTarget(null);
//                         setForm({ date: "", content: "" });
//                       }}
//                     >
//                       취소
//                     </Button>
//                   </Box>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import {
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from "../types/healthRecordService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Timestamp } from "firebase/firestore";
import { isSameDay } from "date-fns";
import { PickersDayProps } from "@mui/x-date-pickers/PickersDay";

interface HealthRecord {
  id: string;
  date: Timestamp | string;
  content: string;
  createdAt: Timestamp | string;
}

export default function HealthRecordPage() {
  const { user } = useUser();
  const isUser = user?.role === "user";
  const { customId } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [form, setForm] = useState({ date: "", content: "" });
  const [editTarget, setEditTarget] = useState<HealthRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    if (!customId) return;
    const fetchData = async () => {
      const data = await getHealthRecords(customId);
      setRecords(data);
      setLoading(false);
    };
    fetchData();
  }, [customId]);

  const filteredRecords = records.filter((record) => {
    const recordDate =
      record.date instanceof Timestamp
        ? record.date.toDate().toDateString()
        : new Date(record.date).toDateString();
    return selectedDate && recordDate === selectedDate.toDateString();
  });

  const recordDates = records.map((record) =>
    record.date instanceof Timestamp
      ? record.date.toDate()
      : new Date(record.date)
  );

  const renderDay = (
    day: Date,
    selectedDate: Date | null,
    pickersDayProps: PickersDayProps<Date>
  ) => {
    const hasRecord = recordDates.some((date) => isSameDay(day, date));

    return (
      <PickersDay
        {...pickersDayProps}
        sx={{
          ...(hasRecord && {
            backgroundColor: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
          }),
        }}
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.content || !customId) return;

    const safeForm = {
      ...form,
      date: Timestamp.fromDate(new Date(form.date)),
    };

    if (editTarget) {
      await updateHealthRecord(customId, editTarget.id, safeForm);
      setRecords((prev) =>
        prev.map((v) => (v.id === editTarget.id ? { ...v, ...safeForm } : v))
      );
      setEditTarget(null);
    } else {
      const newRecord = await addHealthRecord(customId, safeForm);
      setRecords((prev) => [...prev, newRecord]);
    }

    setForm({ date: "", content: "" });
    setShowForm(false);
  };

  const handleEdit = (record: HealthRecord) => {
    setEditTarget(record);
    setForm({
      date:
        record.date instanceof Timestamp
          ? record.date.toDate().toISOString().slice(0, 10)
          : record.date,
      content: record.content,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!customId) return;
    await deleteHealthRecord(customId, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editTarget?.id === id) {
      setEditTarget(null);
      setForm({ date: "", content: "" });
    }
  };

  return (
    <Box
      sx={{
        px: 4,
        py: 3,
        height: "100vh",
        overflow: "auto",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* 상단 네비게이션 */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              borderColor: "#3b82f6",
              color: "#3b82f6",
            }}
          >
            대시보드로 돌아가기
          </Button>

          <Chip
            label={`총 ${records.length}건의 기록`}
            variant="outlined"
            color="primary"
            icon={<DescriptionIcon />}
          />
        </Box>
      </Paper>

      {/* 헤더 */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#black" }}>
            📝 건강 일지
          </Typography>
        </Box>
      </Paper>

      {/* 뷰 모드 선택 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, next) => next && setViewMode(next)}
          sx={{
            "& .MuiToggleButton-root": {
              borderColor: "#cbd5e1",
              color: "#64748b",
              "&.Mui-selected": {
                backgroundColor: "#3b82f6",
                color: "white",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
              },
            },
          }}
        >
          <ToggleButton value="calendar">달력 보기</ToggleButton>
          <ToggleButton value="list">목록 보기</ToggleButton>
        </ToggleButtonGroup>

        {isUser && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setShowForm(true);
              setForm({
                date: selectedDate?.toISOString().slice(0, 10) || "",
                content: "",
              });
            }}
            sx={{
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            새 기록 추가
          </Button>
        )}
      </Box>

      {viewMode === "calendar" ? (
        <Grid container spacing={3}>
          {/* 달력 */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, border: "1px solid #e2e8f0" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  renderDay={renderDay}
                  sx={{
                    width: "100%",
                    "& .MuiPickersDay-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>

          {/* 선택된 날짜의 기록 */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {selectedDate && (
                <Typography variant="h6" sx={{ color: "#1e40af", mb: 2 }}>
                  {selectedDate.toLocaleDateString("ko-KR")} 기록
                </Typography>
              )}

              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2 }}
                  />
                ))
              ) : filteredRecords.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography color="text.secondary">
                    선택된 날짜에 기록이 없습니다.
                  </Typography>
                </Paper>
              ) : (
                filteredRecords.map((record) => (
                  <Card key={record.id} sx={{ border: "1px solid #e2e8f0" }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <CalendarTodayIcon
                          sx={{ fontSize: 18, color: "#64748b" }}
                        />
                        <Typography variant="subtitle2" color="text.secondary">
                          기록일:{" "}
                          {new Date(
                            record.createdAt instanceof Timestamp
                              ? record.createdAt.toDate()
                              : record.createdAt
                          ).toLocaleString("ko-KR")}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {record.content}
                      </Typography>
                    </CardContent>
                    {isUser && (
                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(record)}
                          sx={{ color: "#3b82f6" }}
                        >
                          수정
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(record.id)}
                        >
                          삭제
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      ) : (
        /* 목록 뷰 */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              ))
            : records.map((record) => (
                <Card key={record.id} sx={{ border: "1px solid #e2e8f0" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justify: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "#1e40af" }}>
                        {new Date(
                          record.date instanceof Timestamp
                            ? record.date.toDate()
                            : record.date
                        ).toLocaleDateString("ko-KR")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        기록일:{" "}
                        {new Date(
                          record.createdAt instanceof Timestamp
                            ? record.createdAt.toDate()
                            : record.createdAt
                        ).toLocaleString("ko-KR")}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {record.content}
                    </Typography>
                  </CardContent>
                  {isUser && (
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(record)}
                        sx={{ color: "#3b82f6" }}
                      >
                        수정
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(record.id)}
                      >
                        삭제
                      </Button>
                    </CardActions>
                  )}
                </Card>
              ))}
        </Box>
      )}

      {/* 폼 섹션 */}
      {isUser && showForm && (
        <Paper
          sx={{
            mt: 4,
            p: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: "#1e40af" }}>
            {editTarget ? "건강 기록 수정" : "새 건강 기록"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="날짜"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#3b82f6",
                      },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#3b82f6",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="내용"
                  fullWidth
                  multiline
                  rows={4}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#3b82f6",
                      },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#3b82f6",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setShowForm(false);
                  setEditTarget(null);
                  setForm({ date: "", content: "" });
                }}
                sx={{
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                {editTarget ? "수정 완료" : "저장"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
