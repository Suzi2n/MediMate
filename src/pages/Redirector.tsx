
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const Redirector = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "doctor") {
      navigate("/dashboard");
    } else if (user.role === "user") {
      navigate("/dashboard");
    } else {
      navigate("/login"); // fallback
    }
  }, [user, navigate]);

  return null; // 화면에 아무것도 안 보여줌
};

export default Redirector;
