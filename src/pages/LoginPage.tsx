import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import useForm from "../hooks/useForm";
import { UserSigninInformation, validateSignin } from "../utils/validate";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

import { doc, getDoc } from "firebase/firestore";

const LoginPage = () => {
  const navigate = useNavigate();

  const { values, errors, touched, getInputProps } =
    useForm<UserSigninInformation>({
      initialValue: {
        email: "",
        password: "",
      },
      validate: validateSignin,
    });

  const handleSubmit = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      console.log("로그인 성공! 유저 정보:", user.uid, user.displayName);
      alert("로그인에 성공했습니다!");

      // Firestore에서 유저 정보 가져오기
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("유저 정보가 존재하지 않습니다.");
        return;
      }

      const userData = userSnap.data();
      // role 기준으로 이동
      if (userData.role === "doctor") {
        navigate("/dashboard", { replace: true });
      } else if (userData.role === "user") {
        navigate("/user-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: Error) {
      console.error("로그인 실패", error);
      let message = "로그인에 실패했습니다.";
      switch (error.code) {
        case "auth/user-not-found":
          message = "존재하지 않는 사용자입니다.";
          break;
        case "auth/wrong-password":
          message = "비밀번호가 올바르지 않습니다.";
          break;
        case "auth/invalid-email":
          message = "이메일 형식이 잘못되었습니다.";
          break;
        default:
          message += ` (${error.message})`;
          break;
      }
      alert(message);
    }
  };

  const isDisabled =
    Object.values(errors || {}).some((error) => error.length > 0) ||
    Object.values(values).some((value) => value === "");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-100">
      <div className="bg-white border border-gray-200 shadow-md p-14 w-full max-w-xl rounded-md">
        <div className="flex flex-col items-center mb-10">
          <User className="w-12 h-12 mb-3 text-[#007AFF]" strokeWidth={2} />
          <div className="text-3xl font-bold text-gray-800 mb-2">로그인</div>
          <div className="text-base text-gray-500 text-center">
            Medimate 홈페이지 회원 서비스는
          </div>
          <div className="text-base text-gray-500 text-center">
            로그인 후 이용하실 수 있습니다.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* 이메일 입력 */}
          <input
            {...getInputProps("email")}
            name="email"
            type="email"
            placeholder="이메일"
            className={`w-full border px-4 py-3 text-base rounded focus:outline-none focus:ring-2 focus:ring-[#807bff] ${
              errors?.email && touched?.email
                ? "border-red-500 bg-red-100"
                : "border-gray-300"
            }`}
          />
          {errors?.email && touched?.email && (
            <div className="text-red-500 text-sm">{errors.email}</div>
          )}

          {/* 비밀번호 입력 */}
          <input
            {...getInputProps("password")}
            name="password"
            type="password"
            placeholder="비밀번호"
            className={`w-full border px-4 py-3 text-base rounded focus:outline-none focus:ring-2 focus:ring-[#807bff] ${
              errors?.password && touched?.password
                ? "border-red-500 bg-red-100"
                : "border-gray-300"
            }`}
          />
          {errors?.password && touched?.password && (
            <div className="text-red-500 text-sm">{errors.password}</div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full bg-[#007AFF] text-white py-3 text-lg font-bold rounded hover:bg-[#0066d6] active:bg-[#0055bb] disabled:bg-[#d0d0d0] disabled:cursor-not-allowed transition"
          >
            로그인
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
