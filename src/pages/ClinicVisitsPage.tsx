import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Box,
  Divider,
  Card,
  CardContent,
  Skeleton,
  Paper,
  Chip,
  Grid,
} from "@mui/material";
import {
  getClinicVisits,
  addClinicVisit,
  deleteClinicVisit,
  updateClinicVisit,
} from "../types/clinicVisitService";
import { useUser } from "../contexts/UserContext";
import { Timestamp } from "firebase/firestore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import MicButton from "../components/MicButton";
import { DeleteIcon, EditIcon } from "lucide-react";

interface ClinicVisit {
  id: string;
  clinicDate: Timestamp | string;
  //  doctorName: string;
  summaryText: string;
  createdAt: Timestamp | string;
  type: string;
}

export default function ClinicVisitsPage() {
  const { user } = useUser();
  const isDoctor = user?.role === "doctor";
  const { customId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<ClinicVisit | null>(null);
  const [formMode, setFormMode] = useState<
    "none" | "record" | "manual" | "select"
  >("none");
  const [form, setForm] = useState({
    clinicDate: "",
    // doctorName: "",
    summaryText: "",
  });
  const [editTarget, setEditTarget] = useState<ClinicVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!customId) return;
    const fetchData = async () => {
      const visits = await getClinicVisits(customId);
      setVisits(visits);
      if (visits.length > 0) setSelectedVisit(visits[0]);
      setLoading(false);
    };
    fetchData();
  }, [customId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clinicDate || !form.summaryText || !customId) return;

    const safeForm = {
      ...form,
      clinicDate: Timestamp.fromDate(new Date(form.clinicDate)),
      type: "manual_entry",
    };

    if (editTarget) {
      await updateClinicVisit(customId, editTarget.id, safeForm);
      setVisits((prev) =>
        prev.map((v) => (v.id === editTarget.id ? { ...v, ...safeForm } : v))
      );
      setEditTarget(null);
    } else {
      const newVisit = await addClinicVisit(customId, safeForm);
      setVisits((prev) => [...prev, newVisit]);
      setSelectedVisit(newVisit);
    }

    setForm({
      clinicDate: "",
      // doctorName: "",
      summaryText: "",
    });
    setFormMode("none");
  };

  const handleEdit = (visit: ClinicVisit) => {
    setEditTarget(visit);
    setFormMode("manual");
    setForm({
      clinicDate:
        visit.clinicDate instanceof Timestamp
          ? visit.clinicDate.toDate().toISOString().slice(0, 10)
          : visit.clinicDate,
      // doctorName: visit.doctorName,
      summaryText: visit.summaryText,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteClinicVisit(customId!, id);
    setVisits((prev) => prev.filter((v) => v.id !== id));
    if (selectedVisit?.id === id) setSelectedVisit(null);
  };

  /*
  // 테스트용 코드
  const handleRecord = async () => {
    setRecording(true); // 로딩 시작
  const summary = {
    gpt_summary:
      "당뇨병은 인슐린 생산 부족이나 반응 문제로 혈당 수치가 높아지는 질환입니다. 이로 인해 배뇨와 갈증이 늘어나거나 체중이 줄 수 있습니다. 또한 신경 손상과 같은 건강 문제를 일으킬 수 있습니다.",
  };

  try {
    const newVisit: ClinicVisit = {
      id: crypto.randomUUID(), // 실제 Firestore id와 달라도 UI 렌더링용이면 무방
       clinicDate: new Date().toISOString().slice(0, 10),
     // doctorName: user?.name || "",
      summaryText: summary.gpt_summary,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // 폼 자동 채움 (수정 가능하도록)
     // 2초 지연 후에 처리
    setTimeout(() => {
      setForm({
        clinicDate: new Date().toISOString().slice(0, 10),
      //  doctorName: newVisit.doctorName,
        summaryText: newVisit.summaryText,
      });

      setSelectedVisit(newVisit);
      setVisits((prev) => [...prev, newVisit]);
      setFormMode("none");
     
    }, 3000);

    
    // Flask가 DB에도 저장하므로 추가 작업 없음
    // 우측 카드에 표시
    setSelectedVisit(newVisit);

    // 목록에도 바로 추가
    setVisits((prev) => [...prev, newVisit]);

    // 추가 화면UI 닫기
    setFormMode("none");
  } catch (err: any) {
    alert("에러 발생: " + err.message);
  }finally {
      setRecording(false); // 로딩 종료
    }
};
*/

  /*
 //진료 기록 AI 연동
  const handleRecord = async () => {
    setRecording(true); // 로딩 시작
    try {
      const res = await fetch(
        "https://medimate-rrzze.onrender.com/start-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ custom_id: customId }),
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "서버 응답 실패");

      alert("진료기록 요약 저장 완료");

      // 새로 저장된 데이터를 다시 불러와서 화면 반영
      const refreshed = await getClinicVisits(customId!);
      setVisits(refreshed); // 진료기록 리렌더링
      if (refreshed.length > 0)
        setSelectedVisit(refreshed[refreshed.length - 1]); // 최신 것 선택
      setFormMode("none");
    } catch (err: any) {
      alert("진료기록 요약 요청 실패: " + err.message);
    } finally {
      setRecording(false); // 로딩 종료
    }
  };
  */

  //   return (
  //     <Box sx={{ display: "flex", gap: 8, p: 2 }}>
  //       <Box sx={{ minWidth: 300 }}>
  //         <Button
  //           variant="text"
  //           startIcon={<ArrowBackIcon />}
  //           onClick={() => navigate(-1)}
  //           sx={{ mb: 2 }}
  //         >
  //           대시보드 메인으로 돌아가기
  //         </Button>
  //         <Typography variant="h4" fontWeight="bold" gutterBottom>
  //           🗂️ 진료 기록
  //         </Typography>

  //         <List
  //           sx={{
  //             maxHeight: "60vh",
  //             overflowY: "auto",
  //             border: "1px solid #ddd",
  //             borderRadius: 1,
  //              backgroundColor: "#fff",
  //           }}
  //         >
  //           {loading
  //             ? Array.from({ length: 4 }).map((_, i) => (
  //                 <Box key={i} sx={{ p: 1 }}>
  //                   <Skeleton
  //                     variant="rectangular"
  //                     height={60}
  //                     sx={{ borderRadius: 1 }}

  //                   />
  //                 </Box>
  //               ))
  //             : visits.map((visit) => (
  //                 <ListItem
  //                   button
  //                   selected={selectedVisit?.id === visit.id}
  //                   onClick={() => setSelectedVisit(visit)}
  //                   key={visit.id}
  //                 >
  //                   <ListItemText
  //                     primary={
  //                       visit.clinicDate instanceof Timestamp
  //                         ? visit.clinicDate.toDate().toLocaleDateString()
  //                         : new Date(visit.clinicDate).toLocaleDateString()
  //                     }
  //                     //secondary={`👨‍⚕️ ${visit.doctorName}`}
  //                     primaryTypographyProps={{
  //                       fontSize: "1.1rem",
  //                       fontWeight: "bold",
  //                       textAlign: "center",
  //                       width: "100%",
  //                     }}
  //                     secondaryTypographyProps={{
  //                       fontSize: "0.95rem",
  //                       color: "text.secondary",
  //                     }}
  //                   />
  //                 </ListItem>
  //               ))}
  //         </List>
  //         {isDoctor && (
  //           <Box sx={{ mt: 3 }}>
  //             {formMode === "none" ? (
  //               <button
  //                 onClick={() => setFormMode("select")}
  //                 className="w-full px-6 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-lg font-semibold shadow-sm transition duration-200 cursor-pointer"
  //               >
  //                 ➕ 새 기록 추가
  //               </button>
  //             ) : null}
  //           </Box>
  //         )}
  //       </Box>

  //       <Box sx={{ flex: 1, height: "100vh", overflowY: "auto" }}>
  //         {loading ? (
  //           <Card sx={{ mb: 2, p: 2 }}>
  //             <CardContent>
  //               <Skeleton
  //                 variant="rectangular"
  //                 height={250}
  //                 sx={{ borderRadius: 2 }}
  //               />
  //             </CardContent>
  //           </Card>
  //         ) : formMode === "select" ? (
  //           <Card sx={{ p: 4, mt: 2 }}>
  //             <Typography
  //               variant="h6"
  //               textAlign="center"
  //               fontSize="22px"
  //               sx={{
  //                 color: "#4a4a4a",
  //                 fontWeight: "bold",
  //                 mb: 2,
  //               }}
  //             >
  //               ✨ 새 기록 추가 방식을 선택해주세요!
  //             </Typography>

  //             <Box
  //               sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}
  //             >
  //               <div className="flex justify-center gap-4 mt-4">
  //                 <button
  //                   onClick={() => setFormMode("record")}
  //                   className="flex-1 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold text-lg shadow
  //              transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50 cursor-pointer"
  //                 >
  //                   🎙️ 음성 인식
  //                 </button>

  //                 <button
  //                   onClick={() => setFormMode("manual")}
  //                   className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-semibold text-lg shadow
  //              transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:brightness-110 cursor-pointer"
  //                 >
  //                   ✍️ 직접 입력
  //                 </button>
  //               </div>
  //             </Box>
  //             <Box textAlign="center" mt={3}>
  //               <Button
  //                 variant="text"
  //                 color="error"
  //                 onClick={() => setFormMode("none")}
  //               >
  //                 취소
  //               </Button>
  //             </Box>
  //           </Card>
  //         ) : formMode === "manual" ? (
  //   <Card sx={{ p: 4, backgroundColor: "#fff" }}>
  //     <Typography variant="h6" gutterBottom>
  //       {editTarget ? "기록 수정" : "직접 입력"}
  //     </Typography>
  //     <Box component="form" onSubmit={handleSubmit}>
  //       <TextField
  //         label="진료 날짜"
  //         type="date"
  //         fullWidth
  //         value={form.clinicDate}
  //         onChange={(e) =>
  //           setForm({ ...form, clinicDate: e.target.value })
  //         }
  //         InputLabelProps={{ shrink: true }}
  //         sx={{ mb: 2 }}
  //       />
  //       <TextField
  //         label="요약"
  //         fullWidth
  //         multiline
  //         rows={2}
  //         value={form.summaryText}
  //         onChange={(e) =>
  //           setForm({ ...form, summaryText: e.target.value })
  //         }
  //         sx={{ mb: 2 }}
  //       />
  //       <Button type="submit" variant="contained">
  //         {editTarget ? "수정" : "추가"}
  //       </Button>
  //     </Box>
  //   </Card>
  // ) : formMode === "record" ? (
  //           <Card sx={{ p: 3 }}>
  //             <Typography variant="h6">🎤 음성 인식</Typography>
  //             {/* {recording ? (
  //               <Box
  //                 sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}
  //               >
  //                 <CircularProgress size={24} />
  //                 <Typography>음식 인식 및 진료 기록 요약중입니다...</Typography>
  //               </Box>
  //             ) : (
  //               <Button variant="contained" sx={{ mt: 2 }} onClick={handleRecord}>
  //                 음성 인식 시작
  //               </Button>
  //             )} */}
  //             <MicButton
  //               onTranscriptComplete={(text) => {
  //                 setForm({
  //                   clinicDate: new Date().toISOString().slice(0, 10),
  //                   summaryText: text,
  //                 });
  //               }}
  //             />
  //           </Card>
  //         ) : selectedVisit ? (
  //           <Card sx={{ mb: 2, p: 2, height: "70%" }}>
  //             <CardContent>
  //               <Typography variant="h5">
  //                 📅{" "}
  //                 {selectedVisit.clinicDate instanceof Timestamp
  //                   ? selectedVisit.clinicDate.toDate().toLocaleDateString()
  //                   : new Date(
  //                       selectedVisit.clinicDate
  //                     ).toLocaleDateString()}{" "}
  //                 {/* | 👨‍⚕️ {selectedVisit.doctorName} */}
  //               </Typography>
  //               <Typography
  //                 variant="body1"
  //                 color="textSecondary"
  //                 sx={{ mt: 2, fontSize: "20px" }}
  //               >
  //                 생성일:{" "}
  //                 {(() => {
  //                   try {
  //                     return selectedVisit.createdAt instanceof Timestamp
  //                       ? selectedVisit.createdAt.toDate().toLocaleString()
  //                       : new Date(selectedVisit.createdAt).toLocaleString();
  //                   } catch {
  //                     return "날짜 없음";
  //                   }
  //                 })()}
  //               </Typography>
  //               <Typography variant="body1" sx={{ mt: 5, fontSize: "25px" }}>
  //                 <strong>요약:</strong> {selectedVisit.summaryText}
  //               </Typography>
  //               {isDoctor && (
  //                 <Box sx={{ mt: 2 }}>
  //                   <Button
  //                     sx={{ fontSize: "20px" }}
  //                     onClick={() => handleEdit(selectedVisit)}
  //                   >
  //                     수정
  //                   </Button>
  //                   <Button
  //                     color="error"
  //                     sx={{ fontSize: "20px" }}
  //                     onClick={() => handleDelete(selectedVisit.id)}
  //                   >
  //                     삭제
  //                   </Button>
  //                 </Box>
  //               )}
  //             </CardContent>
  //           </Card>
  //         ) : null}
  //       </Box>
  //     </Box>
  //   );
  // }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 3,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* 왼쪽 사이드바 */}
      <Box sx={{ minWidth: 320 }}>
        {/* 상단 네비게이션 */}
        <Paper sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: "#3b82f6",
              color: "#3b82f6",
              "&:hover": {
                borderColor: "#2563eb",
                backgroundColor: "#eff6ff",
              },
            }}
          >
            대시보드로 돌아가기
          </Button>
        </Paper>

        {/* 헤더 */}
        <Paper sx={{ p: 3, mb: 3, border: "1px solid #e2e8f0" }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#1e40af", mb: 1 }}
          >
            🗂️ 진료 기록
          </Typography>
        </Paper>

        {/* 진료 기록 목록 */}
        <Paper sx={{ border: "1px solid #e2e8f0" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "#374151" }}
            >
              진료 기록 목록 ({visits.length}건)
            </Typography>
          </Box>

          <List sx={{ maxHeight: "400px", overflowY: "auto", p: 0 }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i} sx={{ p: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      height={60}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))
              : visits.map((visit) => (
                  <ListItem
                    button
                    selected={selectedVisit?.id === visit.id}
                    onClick={() => setSelectedVisit(visit)}
                    key={visit.id}
                    sx={{
                      borderBottom: "1px solid #f1f5f9",
                      "&.Mui-selected": {
                        backgroundColor: "#eff6ff",
                        borderLeft: "4px solid #3b82f6",
                      },
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        visit.clinicDate instanceof Timestamp
                          ? visit.clinicDate
                              .toDate()
                              .toLocaleDateString("ko-KR")
                          : new Date(visit.clinicDate).toLocaleDateString(
                              "ko-KR"
                            )
                      }
                      primaryTypographyProps={{
                        fontWeight:
                          selectedVisit?.id === visit.id ? "bold" : "normal",
                        color:
                          selectedVisit?.id === visit.id
                            ? "#1e40af"
                            : "#374151",
                      }}
                    />
                  </ListItem>
                ))}
          </List>
        </Paper>

        {/* 새 기록 추가 버튼 */}
        {isDoctor && (
          <Box sx={{ mt: 3 }}>
            {formMode === "none" ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFormMode("select")}
                sx={{
                  backgroundColor: "#3b82f6",
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                새 기록 추가
              </Button>
            ) : null}
          </Box>
        )}
      </Box>

      {/* 오른쪽 메인 콘텐츠 */}
      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
            <Skeleton
              variant="rectangular"
              height={300}
              sx={{ borderRadius: 2 }}
            />
          </Paper>
        ) : formMode === "select" ? (
          <Paper sx={{ p: 4, border: "1px solid #e2e8f0" }}>
            <Typography
              variant="h6"
              sx={{ color: "#1e40af", mb: 3, textAlign: "center" }}
            >
              새 기록 추가 방식 선택
            </Typography>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setFormMode("record")}
                className="w-40 px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-medium text-base shadow transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md hover:bg-blue-50"
              >
                🎙️ 음성 인식
              </button>

              <button
                onClick={() => setFormMode("manual")}
                className="w-40 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg font-medium text-base shadow transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md hover:brightness-110"
              >
                ✍️ 직접 입력
              </button>
            </div>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="text"
                color="error"
                onClick={() => setFormMode("none")}
              >
                취소
              </Button>
            </Box>
          </Paper>
        ) : formMode === "manual" ? (
          <Paper sx={{ p: 4, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" sx={{ color: "#1e40af", mb: 3 }}>
              {editTarget ? "기록 수정" : "직접 입력"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="진료 날짜"
                type="date"
                fullWidth
                value={form.clinicDate}
                onChange={(e) =>
                  setForm({ ...form, clinicDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#3b82f6",
                    },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#3b82f6",
                  },
                }}
              />
              <TextField
                label="진료 내용"
                fullWidth
                multiline
                rows={6}
                value={form.summaryText}
                onChange={(e) =>
                  setForm({ ...form, summaryText: e.target.value })
                }
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#3b82f6",
                    },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#3b82f6",
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
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
                <Button
                  variant="outlined"
                  onClick={() => setFormMode("none")}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#64748b",
                  }}
                >
                  취소
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : formMode === "record" ? (
          <Paper sx={{ p: 4, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" sx={{ color: "#1e40af", mb: 3 }}>
              음성 인식
            </Typography>
            <MicButton
              onTranscriptComplete={(text) => {
                setForm({
                  clinicDate: new Date().toISOString().slice(0, 10),
                  summaryText: text,
                });
              }}
            />
          </Paper>
        ) : selectedVisit ? (
          <Paper sx={{ p: 4, border: "1px solid #e2e8f0" }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: "#1e40af", mb: 2 }}>
                진료 기록 상세
              </Typography>
              <Chip
                label={
                  selectedVisit.clinicDate instanceof Timestamp
                    ? selectedVisit.clinicDate
                        .toDate()
                        .toLocaleDateString("ko-KR")
                    : new Date(selectedVisit.clinicDate).toLocaleDateString(
                        "ko-KR"
                      )
                }
                color="primary"
                variant="outlined"
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                생성일시
              </Typography>
              <Typography variant="body1">
                {(() => {
                  try {
                    return selectedVisit.createdAt instanceof Timestamp
                      ? selectedVisit.createdAt.toDate().toLocaleString("ko-KR")
                      : new Date(selectedVisit.createdAt).toLocaleString(
                          "ko-KR"
                        );
                  } catch {
                    return "날짜 없음";
                  }
                })()}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                진료 내용
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {selectedVisit.summaryText}
              </Typography>
            </Box>

            {isDoctor && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(selectedVisit)}
                  sx={{
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                  }}
                >
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(selectedVisit.id)}
                >
                  삭제
                </Button>
              </Box>
            )}
          </Paper>
        ) : (
          <Paper
            sx={{ p: 4, textAlign: "center", border: "1px solid #e2e8f0" }}
          >
            <Typography color="text.secondary">
              진료 기록을 선택해주세요
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
