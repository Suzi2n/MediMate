import { useNavigate } from "react-router-dom";
import { UserPlus, Stethoscope } from "lucide-react";

const RoleSelectPage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: "user" | "doctor") => {
    navigate("/signup", { state: { role } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white border border-gray-200 shadow-md p-14 w-full max-w-xl rounded-md text-center h-[450px]">
        <div className="mb-10 ">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">회원가입 유형 선택</h1>
          <p className="text-base text-gray-500">
            Medimate 서비스에 가입하실 유형을 선택해주세요.
          </p>


        </div>

        <div className="flex flex-col gap-6 items-center w-full max-w-xs mx-auto">
          <button
            onClick={() => handleRoleSelect("user")}

           className="w-full flex items-center justify-center gap-2 px-8 py-5 rounded-xl bg-white border-2 border-[#007AFF] text-[#007AFF] font-semibold text-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer mt-5"
        >
            <UserPlus className="w-6 h-6" /> 일반 사용자 회원가입
          </button>

          <button
            onClick={() => handleRoleSelect("doctor")}

               className="w-full flex items-center justify-center gap-2 px-8 py-5 rounded-xl bg-gradient-to-r from-[#007AFF] to-blue-400 text-white font-semibold text-xl shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
        >
            <Stethoscope className="w-6 h-6" /> 의료진 회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;