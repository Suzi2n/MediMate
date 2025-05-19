// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "react-router-dom";
// import { decodeJWT } from "../utils/jwt";
// import {EmergencyInfo} from "../types/auth.ts";


// const EmergencyView = () => {
//   const { id } = useParams(); // /emergency/:id
//   const [searchParams] = useSearchParams();
//   const token = searchParams.get("token");

//   const [info, setInfo] = useState<EmergencyInfo | null>(null);

//   useEffect(() => {
//     if (!token) 
//         return;

//     try {
//       const data = decodeJWT(token); // JWT 디코딩
//       setInfo(data);
//     } catch (e) {
//       console.error("잘못된 토큰입니다.");
//     }
//   }, [token]);

//   if (!info) 
//     return <p>환자 정보를 불러오는 중입니다...</p>;

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold">🆘 응급 환자 정보</h2>
//       <ul className="mt-4 space-y-2">
//         <li>👤 이름: {info.name}</li>
//         <li>🎂 생년월일: {info.birth}</li>
//         <li>❤️ 혈액형: {info.bloodType}</li>
//         <li>🚫 알레르기: {info.allergies?.join(", ")}</li>
//         <li>💊 복용 약물: {info.medications?.join(", ")}</li>
//         <li>📄 기저질환: {info.conditions?.join(", ")}</li>
//         <li>📞 보호자 연락처: <a href={`tel:${info.emergencyContact}`}>{info.emergencyContact}</a></li>
//       </ul>
//     </div>
//   );
// };

// export default EmergencyView;
