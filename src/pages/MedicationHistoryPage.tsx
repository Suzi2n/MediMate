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
// } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import { useUser } from "../contexts/UserContext";
// import { Timestamp } from "firebase/firestore";
// import {
//   getMedicationHistory,
//   addMedicationRecord,
//   deleteMedicationRecord,
//   updateMedicationRecord,
// } from "../types/medicationHistoryService.ts";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";

// interface Medication {
//   id: string;
//   name: string;
//   dosage: string;
//   time: string;
//   notes: string;
//   createdAt: Timestamp;
// }
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// export default function MedicationHistoryPage() {
//   const { user } = useUser();
//   const { customId } = useParams();
//   const navigate = useNavigate();
//   const isUser = user?.role === "user";
//   const [records, setRecords] = useState<Medication[]>([]);
//   const [form, setForm] = useState({
//     name: "",
//     dosage: "",
//     time: "",
//     notes: "",
//   });
//   const [editTarget, setEditTarget] = useState<Medication | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!customId) return;
//     const fetchData = async () => {
//       const data = await getMedicationHistory(customId);
//       setRecords(data);
//       setLoading(false);
//     };
//     fetchData();
//   }, [customId]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.name || !form.dosage || !form.time || !customId) return;

//     const safeForm = {
//       name: form.name,
//       dosage: form.dosage,
//       time: new Date(form.time).toISOString(),
//       notes: form.notes,
//     };

//     if (editTarget) {
//       await updateMedicationRecord(customId, editTarget.id, safeForm);
//       setRecords((prev) =>
//         prev.map((r) => (r.id === editTarget.id ? { ...r, ...safeForm } : r))
//       );
//       setEditTarget(null);
//     } else {
//       const newRecord = await addMedicationRecord(customId, safeForm);
//       setRecords((prev) => [...prev, newRecord]);
//     }

//     setForm({ name: "", dosage: "", time: "", notes: "" });
//     setShowForm(false);
//   };

//   const handleEdit = (record: Medication) => {
//     setEditTarget(record);
//     setForm({
//       name: record.name,
//       dosage: record.dosage,
//       time: new Date(record.time).toISOString().slice(0, 16),
//       notes: record.notes || "",
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!customId) return;
//     await deleteMedicationRecord(customId, id);
//     setRecords((prev) => prev.filter((r) => r.id !== id));
//     if (editTarget?.id === id) {
//       setEditTarget(null);
//       setForm({ name: "", dosage: "", time: "", notes: "" });
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
//         💊 약물 복약 이력
//       </Typography>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3}}>
//         {loading
//           ? Array.from({ length: 3 }).map((_, idx) => (
//               <Skeleton key={idx} variant="rectangular" height={100} />
//             ))
//           : records.map((record) => (
//               <Card key={record.id} variant="outlined">
//                 <CardContent>
//                   <Typography variant="h5">{record.name}</Typography>
//                   <Typography variant="body1" sx={{ fontSize: "17px" }}>
//                     복용량: {record.dosage}
//                   </Typography>
//                   <Typography variant="body1" color="text.secondary">
//                     복용 시간: {new Date(record.time).toLocaleString("ko-KR")}
//                   </Typography>
//                   {record.notes && (
//                     <Typography sx={{ mt: 1 }}>{record.notes}</Typography>
//                   )}
//                 </CardContent>
//                 <CardActions sx={{ justifyContent: "flex-end" }}>
//                   {isUser && (
//                     <>
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
//                     </>
//                   )}
//                 </CardActions>
//               </Card>
//             ))}

//         {isUser && !showForm && (
//           <Button
//             startIcon={<AddIcon />}
//             variant="contained"
//             sx={{ fontSize: "1.1rem", width: 100 }}
//             onClick={() => setShowForm(true)}
//           >
//             추가
//           </Button>
//         )}

//         {isUser && showForm && (
//           <Card sx={{ mt: 2 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 {editTarget ? "복약 기록 수정" : "새 복약 기록 추가"}
//               </Typography>
//               <Box component="form" onSubmit={handleSubmit}>
//                 <TextField
//                   label="약물명"
//                   fullWidth
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   sx={{ mb: 2 }}
//                 />
//                 <TextField
//                   label="복용량"
//                   fullWidth
//                   value={form.dosage}
//                   onChange={(e) => setForm({ ...form, dosage: e.target.value })}
//                   sx={{ mb: 2 }}
//                 />
//                 <TextField
//                   label="복용 시간"
//                   type="datetime-local"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   value={form.time}
//                   onChange={(e) => setForm({ ...form, time: e.target.value })}
//                   sx={{ mb: 2 }}
//                 />
//                 <TextField
//                   label="메모"
//                   fullWidth
//                   multiline
//                   rows={3}
//                   value={form.notes}
//                   onChange={(e) => setForm({ ...form, notes: e.target.value })}
//                   sx={{ mb: 2 }}
//                 />
//                 <Box sx={{ display: "flex", gap: 2 }}>
//                   <Button type="submit" variant="contained">
//                     {editTarget ? "수정" : "저장"}
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     onClick={() => {
//                       setShowForm(false);
//                       setEditTarget(null);
//                       setForm({ name: "", dosage: "", time: "", notes: "" });
//                     }}
//                   >
//                     취소
//                   </Button>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         )}
//       </Box>
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
  Grid,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { Timestamp } from "firebase/firestore";
import {
  getMedicationHistory,
  addMedicationRecord,
  deleteMedicationRecord,
  updateMedicationRecord,
} from "../types/medicationHistoryService.ts";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicationIcon from "@mui/icons-material/Medication";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotesIcon from "@mui/icons-material/Notes";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}

export default function MedicationHistoryPage() {
  const { user } = useUser();
  const { customId } = useParams();
  const navigate = useNavigate();
  const isUser = user?.role === "user";
  const [records, setRecords] = useState<Medication[]>([]);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    time: "",
    notes: "",
  });
  const [editTarget, setEditTarget] = useState<Medication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customId) return;
    const fetchData = async () => {
      const data = await getMedicationHistory(customId);
      setRecords(data);
      setLoading(false);
    };
    fetchData();
  }, [customId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.time || !customId) return;

    const safeForm = {
      name: form.name,
      dosage: form.dosage,
      time: new Date(form.time).toISOString(),
      notes: form.notes,
    };

    if (editTarget) {
      await updateMedicationRecord(customId, editTarget.id, safeForm);
      setRecords((prev) =>
        prev.map((r) => (r.id === editTarget.id ? { ...r, ...safeForm } : r))
      );
      setEditTarget(null);
    } else {
      const newRecord = await addMedicationRecord(customId, safeForm);
      setRecords((prev) => [...prev, newRecord]);
    }

    setForm({ name: "", dosage: "", time: "", notes: "" });
    setShowForm(false);
  };

  const handleEdit = (record: Medication) => {
    setEditTarget(record);
    setForm({
      name: record.name,
      dosage: record.dosage,
      time: new Date(record.time).toISOString().slice(0, 16),
      notes: record.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!customId) return;
    await deleteMedicationRecord(customId, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editTarget?.id === id) {
      setEditTarget(null);
      setForm({ name: "", dosage: "", time: "", notes: "" });
    }
  };

  return (
    <Box sx={{ 
      px: 4, 
      py: 3, 
      height: "100vh", 
      overflow: "auto",
      backgroundColor: '#f8fafc'
    }}>
      {/* 상단 네비게이션 */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        backgroundColor: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{ 
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            대시보드로 돌아가기
          </Button>
          
          <Chip 
            label={`총 ${records.length}건의 복약 기록`}
            color="primary"
            variant="outlined"
            icon={<MedicationIcon />}
          />
        </Box>
      </Paper>

      {/* 헤더 섹션 */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#black' }}>
              💊 약물 복용 이력
            </Typography>
          
          </Box>
        </Box>
      </Paper>

      {/* 액션 버튼 */}
      {isUser && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setShowForm(true)}
            sx={{
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                backgroundColor: '#2563eb',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }
            }}
          >
            새 복약 기록 추가
          </Button>
        </Box>
      )}

      {/* 복약 기록 목록 */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Grid item xs={12} key={idx}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          records.map((record) => (
            <Grid item xs={12} md={6} lg={4} key={record.id}>
              <Card sx={{ 
                height: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                  borderColor: '#3b82f6'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* 약물명 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <MedicationIcon sx={{ color: '#3b82f6' }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e40af' }}>
                      {record.name}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* 복용량 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      복용량:
                    </Typography>
                    <Chip 
                      label={record.dosage}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: '#10b981',
                        color: '#059669',
                        backgroundColor: '#ecfdf5'
                      }}
                    />
                  </Box>

                  {/* 복용 시간 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(record.time).toLocaleString("ko-KR", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>

                  {/* 메모 */}
                  {record.notes && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <NotesIcon sx={{ fontSize: 16, color: '#64748b', mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                          {record.notes}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>

                {isUser && (
                  <CardActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
                    <Tooltip title="수정">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(record)}
                        sx={{
                          color: '#3b82f6',
                          '&:hover': {
                            backgroundColor: '#eff6ff'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(record.id)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': {
                            backgroundColor: '#fef2f2'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 폼 섹션 */}
      {isUser && showForm && (
        <Paper sx={{ 
          mt: 4, 
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          backgroundColor: 'white'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
              {editTarget ? "복약 기록 수정" : "새 복약 기록 추가"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="약물명"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="복용량"
                    fullWidth
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="복용 시간"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="메모 (선택사항)"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    setEditTarget(null);
                    setForm({ name: "", dosage: "", time: "", notes: "" });
                  }}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{
                    backgroundColor: '#3b82f6',
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: '#2563eb'
                    }
                  }}
                >
                  {editTarget ? "수정 완료" : "저장"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>
      )}
    </Box>
  );
}
