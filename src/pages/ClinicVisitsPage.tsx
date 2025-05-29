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

  return (
    <Box sx={{ display: "flex", gap: 8, p: 2 }}>
      <Box sx={{ minWidth: 300 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          대시보드 메인으로 돌아가기
        </Button>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🗂️ 진료 기록
        </Typography>

        <List
          sx={{
            maxHeight: "60vh",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 1,
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ p: 1 }}>
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
                >
                  <ListItemText
                    primary={
                      visit.clinicDate instanceof Timestamp
                        ? visit.clinicDate.toDate().toLocaleDateString()
                        : new Date(visit.clinicDate).toLocaleDateString()
                    }
                    //secondary={`👨‍⚕️ ${visit.doctorName}`}
                    primaryTypographyProps={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      width: "100%",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.95rem",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              ))}
        </List>
        {isDoctor && (
          <Box sx={{ mt: 3 }}>
            {formMode === "none" ? (
              <button
                onClick={() => setFormMode("select")}
                className="w-full px-6 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-lg font-semibold shadow-sm transition duration-200 cursor-pointer"
              >
                ➕ 새 기록 추가
              </button>
            ) : null}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {loading ? (
          <Card sx={{ mb: 2, p: 2 }}>
            <CardContent>
              <Skeleton
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        ) : formMode === "select" ? (
          <Card sx={{ p: 4, mt: 2 }}>
            <Typography
              variant="h6"
              textAlign="center"
              fontSize="22px"
              sx={{
                color: "#4a4a4a",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              ✨ 새 기록 추가 방식을 선택해주세요!
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}
            >
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setFormMode("record")}
                  className="flex-1 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold text-lg shadow
             transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50 cursor-pointer"
                >
                  🎙️ 음성 인식
                </button>

                <button
                  onClick={() => setFormMode("manual")}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-semibold text-lg shadow
             transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:brightness-110 cursor-pointer"
                >
                  ✍️ 직접 입력
                </button>
              </div>
            </Box>
            <Box textAlign="center" mt={3}>
              <Button
                variant="text"
                color="error"
                onClick={() => setFormMode("none")}
              >
                취소
              </Button>
            </Box>
          </Card>
        ) : formMode === "manual" ? (
          <>
            <Typography variant="h6" gutterBottom>
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
                sx={{ mb: 2 }}
              />
              {/* <TextField
                label="의사 이름"
                fullWidth
                value={form.doctorName}
                onChange={(e) =>
                  setForm({ ...form, doctorName: e.target.value })
                }
                sx={{ mb: 2 }}
              /> */}
              <TextField
                label="요약"
                fullWidth
                multiline
                rows={2}
                value={form.summaryText}
                onChange={(e) =>
                  setForm({ ...form, summaryText: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">
                {editTarget ? "수정" : "추가"}
              </Button>
            </Box>
          </>
        ) : formMode === "record" ? (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">🎤 음성 인식</Typography>
            {/* {recording ? (
              <Box
                sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}
              >
                <CircularProgress size={24} />
                <Typography>음식 인식 및 진료 기록 요약중입니다...</Typography>
              </Box>
            ) : (
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleRecord}>
                음성 인식 시작
              </Button>
            )} */}
            <MicButton
              onTranscriptComplete={(text) => {
                setForm({
                  clinicDate: new Date().toISOString().slice(0, 10),
                  summaryText: text,
                });
              }}
            />
          </Card>
        ) : selectedVisit ? (
          <Card sx={{ mb: 2, p: 2, height: "70%" }}>
            <CardContent>
              <Typography variant="h5">
                📅{" "}
                {selectedVisit.clinicDate instanceof Timestamp
                  ? selectedVisit.clinicDate.toDate().toLocaleDateString()
                  : new Date(
                      selectedVisit.clinicDate
                    ).toLocaleDateString()}{" "}
                {/* | 👨‍⚕️ {selectedVisit.doctorName} */}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mt: 2, fontSize: "20px" }}
              >
                생성일:{" "}
                {(() => {
                  try {
                    return selectedVisit.createdAt instanceof Timestamp
                      ? selectedVisit.createdAt.toDate().toLocaleString()
                      : new Date(selectedVisit.createdAt).toLocaleString();
                  } catch {
                    return "날짜 없음";
                  }
                })()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 5, fontSize: "25px" }}>
                🗣️ <strong>요약:</strong> {selectedVisit.summaryText}
              </Typography>
              {isDoctor && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    sx={{ fontSize: "20px" }}
                    onClick={() => handleEdit(selectedVisit)}
                  >
                    수정
                  </Button>
                  <Button
                    color="error"
                    sx={{ fontSize: "20px" }}
                    onClick={() => handleDelete(selectedVisit.id)}
                  >
                    삭제
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </Box>
  );
}
