
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
import { fontSize } from "@mui/system";

interface ClinicVisit {
  id: string;
  clinicDate: Timestamp | string;
  doctorName: string;
  originalText: string;
  summaryText: string;
  translatedText: string;
  createdAt: Timestamp | string;
}

export default function ClinicVisitsPage() {
  const { user } = useUser();
  const isDoctor = user?.role === "doctor";
  const { customId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<ClinicVisit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clinicDate: "",
    doctorName: "",
    originalText: "",
    summaryText: "",
    translatedText: "",
  });
  const [editTarget, setEditTarget] = useState<ClinicVisit | null>(null);

  useEffect(() => {
    if (!customId) return;
    const fetchData = async () => {
      const visits = await getClinicVisits(customId);
      setVisits(visits);
      if (visits.length > 0) setSelectedVisit(visits[0]);
    };
    fetchData();
  }, [customId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clinicDate || !form.originalText || !customId) return;

    const safeForm = {
      ...form,
      clinicDate: Timestamp.fromDate(new Date(form.clinicDate)),
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
      doctorName: "",
      originalText: "",
      summaryText: "",
      translatedText: "",
    });
    setShowForm(false);
  };

  const handleEdit = (visit: ClinicVisit) => {
    setEditTarget(visit);
    setShowForm(true);
    setForm({
      clinicDate:
        visit.clinicDate instanceof Timestamp
          ? visit.clinicDate.toDate().toISOString().slice(0, 10)
          : visit.clinicDate,
      doctorName: visit.doctorName,
      originalText: visit.originalText,
      summaryText: visit.summaryText,
      translatedText: visit.translatedText,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteClinicVisit(customId!, id);
    setVisits((prev) => prev.filter((v) => v.id !== id));
    if (selectedVisit?.id === id) setSelectedVisit(null);
  };

  return (
    <Box sx={{ display: "flex", gap: 8, p: 2 }}>
      <Box sx={{ minWidth: 500 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          대시보드 메인으로 돌아가기
        </Button>
        <Typography variant="h4" gutterBottom>
          🗂️ 진료 기록 목록
        </Typography>
        <List>
          {visits.map((visit) => (
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
                secondary={`👨‍⚕️ ${visit.doctorName}`}
              />
            </ListItem>
          ))}
        </List>

        {isDoctor && (
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, height: "50px", fontSize: "20px" }}
            onClick={() => {
              setEditTarget(null);
              setShowForm((prev) => !prev);
              setForm({
                clinicDate: "",
                doctorName: "",
                originalText: "",
                summaryText: "",
                translatedText: "",
              });
            }}
          >
            ➕ 새 기록 추가
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {selectedVisit && !showForm && (
          <Card sx={{ mb: 2, p: 2, height: "70%" }}>
            <CardContent>
              <Typography variant="h5">
                📅{" "}
                {selectedVisit.clinicDate instanceof Timestamp
                  ? selectedVisit.clinicDate.toDate().toLocaleDateString()
                  : new Date(
                      selectedVisit.clinicDate
                    ).toLocaleDateString()}{" "}
                | 👨‍⚕️ {selectedVisit.doctorName}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mt: 5, fontSize: "30px" }}
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
              <Typography variant="body1" sx={{ mt: 3, fontSize: "25px" }}>
                🧠 <strong>요약:</strong> {selectedVisit.summaryText}
              </Typography>
              <Typography variant="body1" sx={{ mt: 3, fontSize: "25px" }}>
                💬 <strong>쉽게 풀이:</strong>
              </Typography>
              <ul>
                {selectedVisit.translatedText
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <li key={i}>
                      <Typography variant="body1">{line}</Typography>
                    </li>
                  ))}
              </ul>
              <Typography variant="body1" sx={{ mt: 3, color: "gray", fontSize: "25px"}}>
                🗣️ <strong>진료 중 설명:</strong> {selectedVisit.originalText}
              </Typography>
              {isDoctor && (
                <Box sx={{ mt: 2}}>
                  <Button sx={{fontSize: "20px"}} onClick={() => handleEdit(selectedVisit)}>
                    수정
                  </Button>
                  <Button
                    color="error"
                    sx={{fontSize: "20px"}}
                    onClick={() => handleDelete(selectedVisit.id)}
                  >
                    삭제
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {isDoctor && showForm && (
          <>
            <Typography variant="h6" gutterBottom>
              {editTarget ? "기록 수정" : "새 기록 추가"}
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
              <TextField
                label="의사 이름"
                fullWidth
                value={form.doctorName}
                onChange={(e) =>
                  setForm({ ...form, doctorName: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="원문"
                fullWidth
                multiline
                rows={3}
                value={form.originalText}
                onChange={(e) =>
                  setForm({ ...form, originalText: e.target.value })
                }
                sx={{ mb: 2 }}
              />
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
              <TextField
                label="쉬운 표현"
                fullWidth
                multiline
                rows={2}
                value={form.translatedText}
                onChange={(e) =>
                  setForm({ ...form, translatedText: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">
                {editTarget ? "수정" : "추가"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
