import React from "react";
import { Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("auth-key");
    navigate("/login");
  };
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#f8f9fa",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        padding: "20px 10px",
      }}
      className="d-none d-md-block"
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2>MEA Admin</h2>
      </div>
      <Nav className="flex-column">
        <div style={styles.navLink}>
          <WalletMultiButton />
        </div>
        <Nav.Link href="/" style={styles.navLink}>
          ICO
        </Nav.Link>
        <Nav.Link href="/airdrop" style={styles.navLink}>
          Airdrop
        </Nav.Link>
        <Nav.Link href="/staking" style={styles.navLink}>
          Staking
        </Nav.Link>
        <Nav.Link href="/multilevel" style={styles.navLink}>
          Multilevel
        </Nav.Link>
        <Nav.Link href="/game" style={styles.navLink}>
          Game
        </Nav.Link>
        <div style={styles.navLink} onClick={logout}>
          Logout
        </div>
      </Nav>
    </div>
  );
};

const styles = {
  sidebar: {},
  brand: {},
  navLink: {
    fontSize: "18px",
    padding: "10px 15px",
    color: "#333",
    textDecoration: "none",
    cursor: "pointer",
  },
};

export default Sidebar;
