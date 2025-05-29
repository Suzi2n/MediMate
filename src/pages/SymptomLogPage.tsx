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
  Avatar,
  Chip,
  LinearProgress,
  Rating,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Search } from "@mui/icons-material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 아이콘 import 추가
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SpeedIcon from "@mui/icons-material/Speed";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListIcon from "@mui/icons-material/List";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { useUser } from "../contexts/UserContext";
import {
  addSymptomRecord,
  deleteSymptomRecord,
  getSymptomRecords,
  updateSymptomRecord,
} from "../types/symptomLogService";

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

export default function SymptomLogPage() {
  const { user } = useUser();
  const isUser = user?.role === "user";
  const { customId } = useParams();
  const [records, setRecords] = useState<SymptomRecord[]>([]);
  const [filtered, setFiltered] = useState<SymptomRecord[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");
  const navigate = useNavigate();

  // 통계 상태
  const [recentCount, setRecentCount] = useState(0);
  const [averageIntensity, setAverageIntensity] = useState(0);

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
    const fetchData = async () => {
      if (!customId) return;
      const data = await getSymptomRecords(customId);
      setRecords(data);
      setFiltered(data);
    };
    fetchData();
  }, [customId]);

  useEffect(() => {
    const f = records.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, records]);

  // 통계 계산 useEffect 수정
  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recent = records.filter((r) => new Date(r.date) >= sevenDaysAgo);
    setRecentCount(recent.length);

    const avg = recent.length
      ? recent.reduce((sum, r) => sum + r.intensity, 0) / recent.length
      : 0;
    setAverageIntensity(Number(avg.toFixed(1)));
  }, [records]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date || !customId) return;

    if (editTarget) {
      await updateSymptomRecord(customId, editTarget.id, form);
      setRecords((prev) =>
        prev.map((r) => (r.id === editTarget.id ? { ...r, ...form } : r))
      );
    } else {
      const newRecord = await addSymptomRecord(customId, form);
      setRecords((prev) => [...prev, newRecord]);
    }

    setForm({
      name: "",
      intensity: 0,
      duration: "",
      note: "",
      action: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setEditTarget(null);
    setShowForm(false);
  };

  const handleEdit = (record: SymptomRecord) => {
    setEditTarget(record);
    setForm({ ...record });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!customId) return;
    await deleteSymptomRecord(customId, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setEditTarget(null);
  };

  return (
  <Box sx={{ 
    px: 4, 
    py: 3, 
    height: "100vh", 
    overflow: "auto",
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  }}>
    {/* 상단 네비게이션 */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 3,
      p: 2,
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
    }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        variant="outlined"
        sx={{ 
          borderRadius: 2,
          borderColor: '#3b82f6',
          color: '#3b82f6',
          '&:hover': {
            borderColor: '#2563eb',
            backgroundColor: '#eff6ff'
          }
        }}
      >
        대시보드 메인으로 돌아가기
      </Button>
      
      <Chip 
        label={new Date().toLocaleDateString('ko-KR')}
        color="primary"
        variant="outlined"
        icon={<CalendarTodayIcon />}
        sx={{
          borderColor: '#3b82f6',
          color: '#1e40af'
        }}
      />
    </Box>

    {/* 헤더 섹션 */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      mb: 4,
      p: 3,
      backgroundColor: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
    }}>
      

      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'black' }}>
          📈 증상 기록 
        </Typography>
        
      </Box>
    </Box>

    {/* 개선된 통계 카드 섹션 */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* 최근 7일 증상 수 */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: 'white',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.9 }} />
              <Chip 
                label="7일간" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }} 
              />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              최근 증상 기록
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {recentCount}건
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 평균 강도 */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <SpeedIcon sx={{ fontSize: 40, opacity: 0.9 }} />
              <Rating value={averageIntensity} readOnly size="small" 
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: 'white'
                  }
                }}
              />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              평균 강도
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {averageIntensity}/5
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(averageIntensity / 5) * 100}
              sx={{ 
                mt: 1,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* 총 기록 수 */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: 'white',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(6, 182, 212, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <AssessmentIcon sx={{ fontSize: 40, opacity: 0.9 }} />
              <Chip 
                label="전체" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }} 
              />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              총 기록 수
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {records.length}건
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* 뷰 모드 및 액션 버튼 */}
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 3,
      p: 2,
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
    }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, next) => next && setViewMode(next)}
        sx={{
          '& .MuiToggleButton-root': {
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&.Mui-selected': {
              backgroundColor: '#3b82f6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }
          }
        }}
      >
        <ToggleButton value="list">
          <ListIcon sx={{ mr: 1 }} />
          목록
        </ToggleButton>
        <ToggleButton value="chart">
          <BarChartIcon sx={{ mr: 1 }} />
          차트
        </ToggleButton>
      </ToggleButtonGroup>

      {isUser && (
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)'
            }
          }}
        >
          새 증상 기록
        </Button>
      )}
    </Box>

    {/* 목록 뷰 */}
    {viewMode === "list" && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((r) => (
          <Card key={r.id} sx={{ 
            transition: 'transform 0.2s ease-in-out',
            border: '1px solid #e2e8f0',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
              borderColor: '#3b82f6'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e40af' }}>
                  {r.name}
                </Typography>
                <Chip 
                  label={`강도: ${r.intensity}/5`}
                  color={r.intensity >= 4 ? 'error' : r.intensity >= 2 ? 'warning' : 'success'}
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ color: '#64748b' }} />
                    <Typography variant="body2" color="text.secondary">
                      지속시간: {r.duration}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: '#64748b' }} />
                    <Typography variant="body2" color="text.secondary">
                      날짜: {r.date}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {r.note && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f1f5f9', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" color="text.secondary">
                    💬 {r.note}
                  </Typography>
                </Box>
              )}

              {r.action && (
                <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: 1, border: '1px solid #bfdbfe' }}>
                  <Typography variant="body2" sx={{ color: '#1e40af' }}>
                    🩺 대응: {r.action}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            {isUser && (
              <CardActions sx={{ px: 3, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(r)}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: '#eff6ff'
                    }
                  }}
                >
                  수정
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(r.id)}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  삭제
                </Button>
              </CardActions>
            )}
          </Card>
        ))}
      </Box>
    )}

    {/* 차트 뷰 */}
    {viewMode === "chart" && (
      <Card sx={{ 
        p: 3, 
        backgroundColor: 'white', 
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
          증상 강도 변화 추이
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={records.map((r) => ({
              date: r.date,
              intensity: r.intensity,
            }))}
          >
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            />
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              domain={[0, 5]} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    )}

    {/* 폼 섹션 */}
    {showForm && isUser && (
      <Card sx={{ 
        mt: 4, 
        backgroundColor: 'white',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
            {editTarget ? "✏️ 증상 기록 수정" : "➕ 새 증상 기록"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="증상명"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  label="강도 (0~5)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: 5 }}
                  value={form.intensity}
                  onChange={(e) =>
                    setForm({ ...form, intensity: parseInt(e.target.value) })
                  }
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
                  label="지속 시간"
                  fullWidth
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
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
                  label="날짜"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                  label="상세 설명"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
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
                  label="대응 조치"
                  fullWidth
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value })}
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
                  setForm({
                    name: "",
                    intensity: 0,
                    duration: "",
                    note: "",
                    action: "",
                    date: new Date().toISOString().slice(0, 10),
                  });
                  setEditTarget(null);
                }}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  borderRadius: 2,
                  px: 3,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                {editTarget ? "수정 완료" : "저장"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);
}