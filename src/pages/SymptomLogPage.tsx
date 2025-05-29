// 증상 기록 페이지 with 작성/수정/삭제 + 필터/검색 + 달력/차트 뷰 + 증상 강도 그래프 추가
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
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useParams , useNavigate} from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Search } from "@mui/icons-material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface SymptomRecord {
  id: string;
  name: string;
  intensity: number;
  duration: string;
  note: string;
  action: string;
  date: string;
  createdAt: Timestamp | string;
}

export default function SymptomHistoryPage() {
  const { customId } = useParams();
  const [records, setRecords] = useState<SymptomRecord[]>([]);
  const [filtered, setFiltered] = useState<SymptomRecord[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'chart'>('list');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    intensity: 0,
    duration: "",
    note: "",
    action: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [editTarget, setEditTarget] = useState<SymptomRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // 임시 데이터
    const dummy = [
      {
        id: "1",
        name: "두통",
        intensity: 3,
        duration: "2시간",
        note: "스트레스 후 발생",
        action: "휴식",
        date: "2025-05-26",
        createdAt: Timestamp.now(),
      },
      {
        id: "2",
        name: "복통",
        intensity: 4,
        duration: "1시간",
        note: "점심 이후",
        action: "온찜질",
        date: "2025-05-27",
        createdAt: Timestamp.now(),
      },
    ];
    setRecords(dummy);
    setFiltered(dummy);
  }, []);

  useEffect(() => {
    const f = records.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) return;

    if (editTarget) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editTarget.id ? { ...r, ...form } : r))
      );
    } else {
      setRecords((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form, createdAt: Timestamp.now() },
      ]);
    }

    setForm({ name: "", intensity: 0, duration: "", note: "", action: "", date: new Date().toISOString().slice(0, 10) });
    setEditTarget(null);
    setShowForm(false);
  };

  const handleEdit = (record: SymptomRecord) => {
    setEditTarget(record);
    setForm({ ...record });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setEditTarget(null);
  };

  return (
    <Box sx={{ px: 4, py: 3 , height: "100vh", overflow: "auto" }}>
         <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
              >
                대시보드 메인으로 돌아가기
              </Button>
      <Typography variant="h4" fontWeight="bold"  gutterBottom>
        🤒 증상 기록
      </Typography>

      <ToggleButtonGroup value={viewMode} exclusive onChange={(_, next) => next && setViewMode(next)}>
        <ToggleButton value="list">목록</ToggleButton>
    
        <ToggleButton value="chart">차트</ToggleButton>
      </ToggleButtonGroup>

      {/* <TextField
        placeholder="증상명 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ my: 2 }}
        InputProps={{ endAdornment: <InputAdornment position="end"><IconButton><Search /></IconButton></InputAdornment> }}
      /> */}

      {viewMode === 'list' && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 5 }}>
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent>
                <Typography variant="h5">{r.name} ({r.intensity}/5)</Typography>
                <Typography variant="body1">🕒 지속시간 : {r.duration}, 📅 날짜 : {r.date}</Typography>
                <Typography variant="body1">💬 {r.note}</Typography>
                <Typography variant="body1">🩺 대응: {r.action}</Typography>
              </CardContent>
              <CardActions>
               <Button size="large" startIcon={<EditIcon />} onClick={() => handleEdit(record)}>
                        수정</Button>
                  <Button size="large" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(record.id)}>
                        삭제
                      </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {viewMode === 'chart' && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={records.map((r) => ({
              date: r.date,
              intensity: r.intensity,
            }))}
          >
            <Line type="monotone" dataKey="intensity" stroke="#f06292" strokeWidth={2} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}

      {showForm ? (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6">{editTarget ? "수정" : "새 증상 기록"}</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="증상명" fullWidth sx={{ my: 1 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="강도 (0~5)" type="number" fullWidth sx={{ my: 1 }} inputProps={{ min: 0, max: 5 }} value={form.intensity} onChange={(e) => setForm({ ...form, intensity: parseInt(e.target.value) })} />
              <TextField label="지속 시간" fullWidth sx={{ my: 1 }} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <TextField label="상세 설명" fullWidth multiline rows={2} sx={{ my: 1 }} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <TextField label="대응 조치" fullWidth sx={{ my: 1 }} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} />
              <TextField label="날짜" type="date" fullWidth sx={{ my: 1 }} InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained">{editTarget ? "수정" : "저장"}</Button>
                <Button variant="outlined" onClick={() => { setShowForm(false); setForm({ name: "", intensity: 0, duration: "", note: "", action: "", date: new Date().toISOString().slice(0, 10) }); setEditTarget(null); }}>취소</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Button sx={{ mt: 3 ,fontSize: "1.1rem", width: 100  }}  startIcon={<AddIcon />}
            variant="contained"
          onClick={() => setShowForm(true)}
          >
             추가</Button>
      )}
    </Box>
  );
}
