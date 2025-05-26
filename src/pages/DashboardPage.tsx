
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  Skeleton,
} from "@mui/material";

import { useOutletContext } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  
const [loading, setLoading] = useState(false);

  const { dashboardData, setDashboardData, patientName } = useOutletContext<{
    dashboardData: any;
    setDashboardData: React.Dispatch<React.SetStateAction<any>>;
    patientName: string | null;
  }>();

  console.log(dashboardData); // 테스트코드

  if (!dashboardData) return null;
  

   return (
    <>
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
        <>
          <Typography variant="h5" align="center" margin={5}>
            📋{" "}
            <Box component="span" fontWeight="bold">
              {patientName ?? dashboardData?.name}님
            </Box>{" "}
            건강 정보
          </Typography>

          <Grid container spacing={2} gap={10} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card sx={{ minWidth: 250 }}>
                <CardActionArea
                  onClick={() => {
              
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ width: 650, height: 270 }}>
                      📈 증상 기록
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      최근 증상 및 심각도 확인
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ minWidth: 250 }}>
                <CardActionArea
                  onClick={() => {
                   
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ width: 650, height: 270 }}>
                      💊 약물 복용 이력
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      처방된 약물 및 복용 기간
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ minWidth: 250 }}>
                <CardActionArea
                  onClick={() =>
                    navigate(
                      `/dashboard/clinic-visits/${dashboardData.customId}`
                    )}
                    
                    
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ width: 650, height: 270 }}>
                      🏥 진료 기록
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      병원 방문 이력 및 진단 내용
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ minWidth: 250 }}>
                <CardActionArea
                  onClick={() =>
                    navigate(
                      `/dashboard/patient/${dashboardData.patientId}/health-records`
                    )
                  }
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ width: 650, height: 270 }}>
                      📝 건강 일지
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      건강 상태 및 생활 습관 기록
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}