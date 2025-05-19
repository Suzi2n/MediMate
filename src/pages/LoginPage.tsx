import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // ✅ Firebase 초기화한 auth 객체
import useForm from "../hooks/useForm";
import { UserSigninInformation, validateSignin } from "../utils/validate";
import { useNavigate } from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";
import { use } from "react";

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

      // ✅ Firestore에서 유저 정보 가져오기
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("유저 정보가 존재하지 않습니다.");
        return;
      }

      const userData = userSnap.data();
      // ✅ role 기준으로 이동
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
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-2xl font-bold">로그인</div>
      <div className="flex flex-col gap-4">
        <input
          {...getInputProps("email")}
          name="email"
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm
            ${
              errors?.email && touched?.email
                ? "border-red-500 bg-red-200"
                : "border-gray-300"
            }`}
          type={"email"}
          placeholder="이메일"
        />
        {errors?.email && touched?.email && (
          <div className="text-red-500 text-sm">{errors.email}</div>
        )}

        <input
          {...getInputProps("password")}
          name="password"
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm
            ${
              errors?.password && touched?.password
                ? "border-red-500 bg-red-200"
                : "border-gray-300"
            }`}
          type="password"
          placeholder="비밀번호"
        />
        {errors?.password && touched?.password && (
          <div className="text-red-500 text-sm">{errors.password}</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-[#A71963] text-white p-[10px] rounded-sm hover:bg-[#931454] active:bg-[#7a1045] disabled:bg-[#d0d0d0] disabled:cursor-not-allowed"
        >
          로그인
        </button>

        {/* <div className="flex justify-center text-sm text-gray-500 mt-4 space-x-2">
          <a href="/find-id" className="hover:underline">아이디 찾기</a>
          <span className="text-gray-300">|</span>
          <a href="/find-password" className="hover:underline">비밀번호 찾기</a>
          <span className="text-gray-300">|</span>
          <a href="/signup" className="hover:underline">회원가입</a>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
