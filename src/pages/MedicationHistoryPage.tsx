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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
    <Box sx={{ px: 4, py: 2, height: "100vh", overflow: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        대시보드 메인으로 돌아가기
      </Button>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💊 약물 복약 이력
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3, boxShadow: 1 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={100} />
            ))
          : records.map((record) => (
              <Card key={record.id} variant="outlined">
                <CardContent>
                  <Typography variant="h5">{record.name}</Typography>
                  <Typography variant="body1" sx={{ fontSize: "17px" }}>
                    복용량: {record.dosage}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    복용 시간: {new Date(record.time).toLocaleString("ko-KR")}
                  </Typography>
                  {record.notes && (
                    <Typography sx={{ mt: 1 }}>{record.notes}</Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  {isUser && (
                    <>
                      <Button
                        size="large"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(record)}
                      >
                        수정
                      </Button>
                      <Button
                        size="large"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(record.id)}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            ))}

        {isUser && !showForm && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ fontSize: "1.1rem", width: 100 }}
            onClick={() => setShowForm(true)}
          >
            추가
          </Button>
        )}

        {isUser && showForm && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editTarget ? "복약 기록 수정" : "새 복약 기록 추가"}
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="약물명"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="복용량"
                  fullWidth
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="복용 시간"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="메모"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button type="submit" variant="contained">
                    {editTarget ? "수정" : "저장"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowForm(false);
                      setEditTarget(null);
                      setForm({ name: "", dosage: "", time: "", notes: "" });
                    }}
                  >
                    취소
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
