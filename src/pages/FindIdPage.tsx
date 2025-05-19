
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { postFindId, FindIdResponse } from "../apis/auth";

// const schema = z.object({
//   name: z.string().min(1, "이름을 입력해주세요."),
//   email: z.string().email("올바른 이메일 형식이 아닙니다."),
// });
// type Form = z.infer<typeof schema>;

// const FindIdPage: React.FC = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<Form>({
//     resolver: zodResolver(schema),
//     mode: "onBlur",
//   });

//   const onSubmit = async (data: Form) => {
//     try {
//       const res: FindIdResponse = await postFindId(data);
//       alert(`회원님의 아이디는 "${res.username}" 입니다.`);
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err) && err.response?.data?.message) {
//         alert(err.response.data.message);
//       } else {
//         alert("일치하는 회원 정보를 찾을 수 없습니다.");
//       }
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="flex flex-col gap-4 w-[400px] mx-auto"
//     >
//       <h2 className="text-xl font-bold text-center">아이디 찾기</h2>

//       {/* 이름 */}
//       <div>
//         <label htmlFor="name" className="block mb-1">
//           이름
//         </label>
//         <input
//           id="name"
//           type="text"
//           placeholder="이름을 입력하세요"
//           {...register("name")}
//           aria-invalid={errors.name ? "true" : "false"}
//           aria-describedby={errors.name ? "name-error" : undefined}
//           className={`w-full p-2 border rounded focus:outline-none ${
//             errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
//           }`}
//         />
//         {errors.name && (
//           <p id="name-error" className="text-red-500 text-sm mt-1">
//             {errors.name.message}
//           </p>
//         )}
//       </div>

//       {/* 이메일 */}
//       <div>
//         <label htmlFor="email" className="block mb-1">
//           이메일
//         </label>
//         <input
//           id="email"
//           type="email"
//           placeholder="email@example.com"
//           {...register("email")}
//           aria-invalid={errors.email ? "true" : "false"}
//           aria-describedby={errors.email ? "email-error" : undefined}
//           className={`w-full p-2 border rounded focus:outline-none ${
//             errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
//           }`}
//         />
//         {errors.email && (
//           <p id="email-error" className="text-red-500 text-sm mt-1">
//             {errors.email.message}
//           </p>
//         )}
//       </div>

//       {/* 제출 버튼 */}
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className={`
//           mt-4 w-full p-2 rounded text-white
//           ${isSubmitting
//             ? "bg-gray-300 cursor-not-allowed"
//             : "bg-blue-600 hover:bg-blue-700"}
//         `}
//       >
//         {isSubmitting ? "잠시만 기다려주세요…" : "아이디 찾기"}
//       </button>
//     </form>
//   );
// };

// export default FindIdPage;

