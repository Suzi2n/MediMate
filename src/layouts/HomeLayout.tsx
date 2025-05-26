import { Outlet, useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useUser } from "../contexts/UserContext";
import { useLogout } from "../hooks/useLogout";

const HomeLayout = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = useLogout();

  return (
    <div className="min-h-screen flex flex-col bg-gray-20">
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* 로고 */}
          <div
            className="text-2xl font-bold text-[#001F54] cursor-pointer"
            onClick={() => navigate("/")}
          >
            Medimate
          </div>
          {/* 메뉴 */}
          <div className="hidden md:flex gap-8 text-gray-700 text-base font-medium">
            {user?.role === "user" && (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-[#A71963] transition"
                >
                  대시보드
                </Link>
              </>
            )}
            {user?.role === "doctor" && (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-[#A71963] transition"
                >
                  대시보드
                </Link>
              </>
            )}
          </div>

          {/* 로그인/회원 or 유저 이름 */}
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <span className="text-gray-700 font-semibold">
                  {user.name}님
                </span>
                <Link
                  to="/mypage"
                  className="text-sm px-4 py-2 text-[#A71963] bg-white hover:bg-gray-200 rounded border border-[#A71963] transition"
                >
                  내 정보
                </Link>
                <button
                  className="text-sm px-4 py-2 text-[#A71963] bg-white hover:bg-gray-200 rounded border border-[#A71963] transition cursor-pointer"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-md text-black hover:underline"
                >
                  로그인
                </Link>
                <Link
                  to="/role-select"
                  className="text-md text-black hover:underline ml-4"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 pt-24">
        <Outlet />
      </main>

      <footer className="w-full bg-white mt-auto shadow-inner">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          ⓒ 2025 Medimate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;
