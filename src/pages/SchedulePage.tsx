// import { useState } from "react";
// import Calendar from "react-calendar";
// import 'react-calendar/dist/Calendar.css';
// import { CalendarDays, Heart, Edit2 } from "lucide-react";

// export default function SchedulePage() {
//   const [date, setDate] = useState<Date>(new Date());

//   const schedules = [
//     {
//       title: "팀프로젝트",
//       location: "산학협력센터 124호",
//       time: "9:00 AM",
//       range: "July 4 - July 7",
//       color: "bg-red-100",
//       icon: <Heart className="w-4 h-4 text-red-500" />,
//     },
//     {
//       title: "데이트",
//       location: "카페 드롭탑",
//       time: "3:00 PM",
//       range: "July 17",
//       color: "bg-green-100",
//       icon: <Heart className="w-4 h-4 text-green-500" />,
//     }
//   ];

//   return (
//     <div className="p-4 font-sans max-w-md mx-auto">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           {/* <img src="/profile.png" className="w-10 h-10 rounded-full" /> */}
//           <h2 className="text-lg font-semibold">July, {date.getFullYear()}</h2>
//         </div>
//         <button className="text-gray-500 text-2xl">☰</button>
//       </div>

//       <div className="mt-4">
//         <Calendar
//           value={date}
//           onChange={setDate}
//           className="rounded-lg p-2"
//         />
//       </div>

//       <h3 className="mt-6 text-md font-semibold">내가 등록한 좋아요</h3>

//       <div className="space-y-4 mt-2">
//         {schedules.map((s, idx) => (
//           <div key={idx} className={`rounded-xl p-3 shadow-md ${s.color} flex justify-between items-start`}>
//             <div>
//               <p className="text-sm font-semibold">{s.title}</p>
//               <p className="text-xs text-gray-600">{s.location}</p>
//               <p className="text-xs text-gray-500">{s.time} ・ {s.range}</p>
//             </div>
//             <div className="flex flex-col items-end gap-2">
//               {s.icon}
//               <Edit2 className="w-4 h-4 text-gray-500" />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around items-center">
//         <CalendarDays className="w-6 h-6 text-blue-500" />
//         <Heart className="w-6 h-6 text-gray-400" />
//         <div className="w-6 h-6"></div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScheduleItem } from "../types/schedule";
import { CalendarDays, User, Mail } from "lucide-react";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { ko } from "date-fns/locale/ko";
import "react-big-calendar/lib/css/react-big-calendar.css";



const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const SchedulePage = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      title: "의사 상담",
      startTime: "2025-04-28 10:00",
      endTime: "2025-04-28 11:00",
      doctorEmail: "doctor@example.com",
      patientProfile: "환자1",
    },
    {
      title: "건강검진 예약",
      startTime: "2025-05-01 09:00",
      endTime: "2025-05-01 10:30",
      doctorEmail: "clinic@example.com",
      patientProfile: "환자2",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = (index: number) => {
    navigate(`/schedule/${index}`, { state: { schedule: schedules[index] } });
  };

  const handleAddSchedule = () => {
    navigate("/schedule/add");
  };

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const events = schedules.map((item) => ({
    title: item.title,
    start: new Date(item.startTime),
    end: new Date(item.endTime),
  }));

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-[#A71963] text-white py-6 px-4 shadow-md">
        <h1 className="text-2xl font-bold">📅 메디메이트 스케줄</h1>
        <p className="text-sm mt-1">예정된 의료 일정들을 확인해보세요</p>
      </header>

      {/* 콘텐츠 영역 */}
      <main className="max-w-2xl mx-auto p-4 pb-24">

        {/* 캘린더 */}
        <section className="mb-8">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            defaultView="month"
            culture="ko"
            onSelectEvent={(event) => {
              const index = schedules.findIndex((s) => s.title === event.title);
              if (index !== -1) handleClick(index);
            }}
          />
        </section>

        {/* 검색 필드 */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="제목으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A71963]"
          />
        </div>

        {/* 스케줄 카드 목록 */}
        <div className="flex flex-col gap-4">
          {filteredSchedules.length === 0 ? (
            <p className="text-center text-gray-400">일정이 없습니다.</p>
          ) : (
            filteredSchedules.map((schedule, idx) => (
              <div
                key={idx}
                onClick={() => handleClick(idx)}
                className="bg-white p-4 rounded-2xl shadow-sm border hover:shadow-md transition cursor-pointer"
              >
                <h2 className="text-lg font-bold text-[#A71963] mb-2">
                  {schedule.title}
                </h2>
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                  {new Date(schedule.startTime).toLocaleString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  ~{" "}
                  {new Date(schedule.endTime).toLocaleString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {schedule.doctorEmail}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  {schedule.patientProfile}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 플로팅 추가 버튼 */}
      <button
        onClick={handleAddSchedule}
        className="fixed bottom-6 right-6 bg-[#A71963] hover:bg-[#8f135c] text-white px-6 py-3 rounded-full shadow-lg transition"
      >
        + 일정 추가
      </button>
    </div>
  );
};

export default SchedulePage;
