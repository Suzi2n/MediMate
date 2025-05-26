import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserPlus } from "lucide-react";

const schema = z
  .object({
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .max(20, { message: "비밀번호는 20자 이하여야 합니다." }),
    passwordCheck: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .max(20, { message: "비밀번호는 20자 이하여야 합니다." }),
    name: z.string().min(1, { message: "이름을 입력해주세요." }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "가입 약관에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.passwordCheck, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordCheck"],
  });

type FormFields = z.infer<typeof schema>;

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role ?? "user";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormFields> = async ({ email, password, name }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const userData: any = {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      };

      if (role === "user") {
        const generateCode = () =>
          Array.from({ length: 5 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
        userData.patientCode = generateCode();
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      alert("회원가입에 성공했습니다!");
      navigate("/");
    } catch (error: any) {
      let msg = "회원가입에 실패했습니다.";
      if (error.code === "auth/email-already-in-use") msg = "이미 사용 중인 이메일입니다.";
      else if (error.code === "auth/weak-password") msg = "비밀번호가 너무 약합니다.";
      else if (error.code === "auth/invalid-email") msg = "이메일 형식이 잘못되었습니다.";
      else msg += ` (${error.message})`;
      alert(msg);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-100">
      <div className="bg-white border border-gray-200 shadow-md p-14 w-full max-w-xl rounded-md">
        <div className="flex flex-col items-center mb-10">
          <UserPlus className="w-12 h-12 mb-3 text-[#007AFF]" />
          <div className="text-3xl font-bold text-gray-800 mb-2">회원가입</div>
          <div className="text-base text-gray-500 text-center">Medimate 서비스 가입을 환영합니다.</div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          {[
            { name: "email", type: "email", placeholder: "이메일" },
            { name: "password", type: "password", placeholder: "비밀번호" },
            { name: "passwordCheck", type: "password", placeholder: "비밀번호 확인" },
            { name: "name", type: "text", placeholder: "이름" },
          ].map(({ name, type, placeholder }) => (
            <div key={name}>
              <input
                type={type}
                placeholder={placeholder}
                {...register(name as keyof FormFields)}
                className={`w-full border px-4 py-3 text-base rounded focus:outline-none focus:ring-2 focus:ring-[#807bff] ${
                  errors[name as keyof typeof errors]
                    ? "border-red-500 bg-red-100"
                    : "border-gray-300"
                }`}
              />
              {errors[name as keyof typeof errors] && (
                <div className="text-red-500 text-sm mt-1">
                  {errors[name as keyof typeof errors]?.message as string}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-start gap-2">
            <input type="checkbox" {...register("agreeTerms")} className="mt-1 w-5 h-5 accent-blue-600" />
            <span className="text-md text-gray-700 leading-5">
              가입을 위해 <strong>약관</strong>과 <strong>개인정보 보호정책</strong>에 동의합니다.
            </span>
          </div>
          {errors.agreeTerms && (
            <div className="text-red-500 text-sm">{errors.agreeTerms.message}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#007AFF] text-white py-3 text-lg font-bold rounded hover:bg-[#0066d6] active:bg-[#0055bb] disabled:bg-[#d0d0d0] disabled:cursor-not-allowed transition"
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
