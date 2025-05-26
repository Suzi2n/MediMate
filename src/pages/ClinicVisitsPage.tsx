// ClinicVisitsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Box,
  Divider,
} from "@mui/material";
import {
  getClinicVisits,
  addClinicVisit,
  deleteClinicVisit,
  updateClinicVisit,
} from "../types/clinicVisitService";
import { useUser } from "../contexts/UserContext";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface ClinicVisit {
  id: string;
  date: string;
  note: string;
}

export default function ClinicVisitsPage() {
  const { user } = useUser();
  const isDoctor = user?.role === "doctor";
  const { id: patientId } = useParams();
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [form, setForm] = useState({ date: "", note: "" });
  const [editTarget, setEditTarget] = useState<ClinicVisit | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      const visits = await getClinicVisits(patientId);
      setVisits(visits);

      const existingNotes = visits.map((v) => v.note);

      // AI 요약 가져오기
      const q = query(
        collection(db, "ai_summaries"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const latest = snap.docs[0].data();
        const { summary, date } = latest;

        if (!existingNotes.includes(summary)) {
          const newVisit = await addClinicVisit(patientId, date, summary);
          setVisits((prev) => [...prev, newVisit]);
          console.log("✅ AI 요약 자동 등록 완료");
        } else {
          console.log("⚠️ 이미 등록된 AI 요약입니다");
        }
      }
    };

    fetchData();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.note || !patientId) return;

    if (editTarget) {
      await updateClinicVisit(editTarget.id, form.date, form.note);
      setVisits((prev) =>
        prev.map((v) => (v.id === editTarget.id ? { ...v, ...form } : v))
      );
      setEditTarget(null);
    } else {
      const newVisit = await addClinicVisit(patientId, form.date, form.note);
      setVisits((prev) => [...prev, newVisit]);
    }
    setForm({ date: "", note: "" });
  };

  const handleEdit = (visit: ClinicVisit) => {
    setEditTarget(visit);
    setForm({ date: visit.date, note: visit.note });
  };

  const handleDelete = async (id: string) => {
    await deleteClinicVisit(id);
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🏥 진료 기록
      </Typography>

      <List>
        {visits.map((visit) => (
          <ListItem
            key={visit.id}
            divider
            secondaryAction={
              isDoctor && (
                <>
                  <Button onClick={() => handleEdit(visit)}>수정</Button>
                  <Button color="error" onClick={() => handleDelete(visit.id)}>
                    삭제
                  </Button>
                </>
              )
            }
          >
            <ListItemText primary={visit.date} secondary={visit.note} />
          </ListItem>
        ))}
      </List>

      {isDoctor && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            {editTarget ? "기록 수정" : "새 기록 추가"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="날짜"
              type="date"
              fullWidth
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained">
              {editTarget ? "수정" : "추가"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
