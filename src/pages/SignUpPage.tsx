import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useLocation } from "react-router-dom";

// ✅ 스키마에 userId 필드 추가
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
    userId: z.string().min(4, { message: "아이디는 최소 4자 이상이어야 합니다." }),
  })
  .refine((data) => data.password === data.passwordCheck, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordCheck"],
  });

type FormFields = z.infer<typeof schema>;

const SignUpPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const role = location.state?.role ?? "user"; // 기본값: user

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormFields> = async ({ email, password, name, userId }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Firebase Auth displayName 에 아이디 설정
      await updateProfile(userCredential.user, { displayName: userId });

      const userData: any = {
        name,
        userId,
        email,
        role,
        createdAt: serverTimestamp(),
      };

      const generatePatientCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // 예: A7F9Z2
      };
      
      // ✅ role이 환자일 경우에만 식별 코드 추가
      if (role === "user") {
        userData.patientCode = generatePatientCode();
      }
      
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      alert("회원가입에 성공했습니다!");
      navigate("/");
    } catch (error: unknown) {
      let msg = "회원가입에 실패했습니다.";
      if (error instanceof Error && "code" in error) {
        switch ((error as { code: string }).code) {
        case "auth/email-already-in-use":
          msg = "이미 사용 중인 이메일입니다.";
          break;
        case "auth/weak-password":
          msg = "비밀번호가 너무 약합니다.";
          break;
        case "auth/invalid-email":
          msg = "이메일 형식이 올바르지 않습니다.";
          break;
        default:
          msg += ` (${(error as Error).message})`;
          msg += ` (${error.message})`;
          break;
      }

      alert(msg);
        console.error(error);
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-2xl font-bold">회원가입</div>

      <form className="w-[430px] flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {[
          { name: "email", label: "이메일", type: "email", placeholder: "이메일을 입력하세요" },
          { name: "userId", label: "아이디", type: "text", placeholder: "사용할 아이디를 입력하세요" },
          { name: "password", label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하세요" },
          { name: "passwordCheck", label: "비밀번호 확인", type: "password", placeholder: "비밀번호를 다시 입력하세요" },
          { name: "name", label: "이름", type: "text", placeholder: "이름을 입력하세요" },
        ].map(({ name, label, type, placeholder }) => (
          <div key={name} className="flex flex-col">
            <div className="flex items-center">
              <label htmlFor={name} className="w-40 text-sm font-medium">
                {label}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id={name}
                type={type}
                placeholder={placeholder}
                {...register(name as keyof FormFields)}
                className={`flex-1 border p-2 rounded-sm focus:border-white focus:outline-none ${
                  errors[name as keyof typeof errors]
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
            </div>
            {errors[name as keyof typeof errors] && (
              <div className="text-red-500 text-xs ml-40 mt-1">
                {errors[name as keyof typeof errors]?.message as string}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full bg-[#A71963] text-white py-2 rounded hover:bg-pink-700 disabled:bg-gray-300 transition cursor-pointer"
        >
          가입하기
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;