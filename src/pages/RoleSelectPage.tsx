import { useNavigate } from "react-router-dom";

const RoleSelectPage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: "user" | "doctor") => {
    navigate("/signup", { state: { role } }); // 🔁 role 값을 signup 페이지로 전달
  };

  return (
    <div className="flex flex-col items-center min-h-screen gap-6 bg-gray-50 px-4">
        <div className="mt-10 items-center mt-70 flex flex-col gap-4 border-2 border-none rounded-xl p-8 shadow-md bg-white w-full max-w-md">
            <h1 className="text-3xl font-bold text-[#A71963]">
               회원가입 유형을 선택하세요
            </h1>
            <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
            <button
            onClick={() => handleRoleSelect("user")}
            className="px-8 py-4 rounded-xl bg-white border-2 border-[#A71963] text-[#A71963] font-semibold text-lg shadow-md hover:shadow-lg hover:bg-[#fef2f7] transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
        >
          👤 일반 사용자 회원가입
            </button>

            <button
            onClick={() => handleRoleSelect("doctor")}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#A71963] to-pink-500 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
        >
          🩺 의료진 회원가입
            </button>
        </div>
        </div>

    </div>
  );
};

export default RoleSelectPage;
