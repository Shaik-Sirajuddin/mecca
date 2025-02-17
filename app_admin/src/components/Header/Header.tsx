import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { airdropBaseUrl } from "../../utils/constants";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const logout = async () => {
    await fetch(airdropBaseUrl + "/admin/logout", {
      credentials: "include",
    });
    navigate("/login");
  };
  return (
    <Navbar
      bg="light"
      variant="light"
      expand="lg"
      className="mb-4 border-bottom d-md-none"
    >
      <Container>
        <Navbar.Brand href="/" className="fs-3 fw-bold">
          MEA Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/" className="fs-5">
              ICO
            </Nav.Link>
            <Nav.Link href="/airdrop" className="fs-5">
              Airdrop
            </Nav.Link>
            <Nav.Link href="/staking" className="fs-5">
              Staking
            </Nav.Link>
            <Nav.Link href="/multilevel" className="fs-5">
              Mecca Crypto
            </Nav.Link>
            <Nav.Link href="/game" className="fs-5">
              Game
            </Nav.Link>
            <div
              className="fs-5"
              style={{ cursor: "pointer !important" }}
              onClick={logout}
            >
              Logout
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
