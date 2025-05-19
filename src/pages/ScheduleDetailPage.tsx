import { useLocation, useNavigate } from "react-router-dom";
import { ScheduleItem } from "../types/schedule";

const ScheduleDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { schedule } = location.state as { schedule: ScheduleItem };

  return (
    <div className="max-w-screen-md mx-auto p-6">
      {/* 상단 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-[#A71963] hover:underline text-sm"
      >
        ← 뒤로가기
      </button>

      {/* 카드 */}
      <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center text-[#A71963] mb-4">
          스케줄 상세보기
        </h1>

        <div className="flex flex-col gap-2">
          <div>
            <div className="text-gray-400 text-xs">제목</div>
            <div className="text-lg font-semibold">{schedule.title}</div>
          </div>

          <div>
            <div className="text-gray-400 text-xs">시작 시간</div>
            <div className="text-lg">{schedule.startTime}</div>
          </div>

          <div>
            <div className="text-gray-400 text-xs">마감 시간</div>
            <div className="text-lg">{schedule.endTime}</div>
          </div>

          <div>
            <div className="text-gray-400 text-xs">의사 이메일</div>
            <div className="text-lg">{schedule.doctorEmail}</div>
          </div>

          <div>
            <div className="text-gray-400 text-xs">환자 프로필</div>
            <div className="text-lg">{schedule.patientProfile}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailPage;
