import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Header: React.FC = () => {
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
