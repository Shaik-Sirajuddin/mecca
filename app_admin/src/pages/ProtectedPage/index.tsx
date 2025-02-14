import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { airdropBaseUrl } from "../../utils/constants";

interface ProtectedPageProps {
  children: ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const navigate = useNavigate();
  const verifyLogin = async () => {
    try {
      const res = await fetch(`${airdropBaseUrl}/admin/verify-login`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch {
      navigate("/login");
    }
  };
  useEffect(() => {
    verifyLogin();
  }, []);

  return <>{children}</>;
};

export default ProtectedPage;
