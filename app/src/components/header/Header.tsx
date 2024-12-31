import "./style.css";

import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand href="#">
          <img
            src="/wp-includes/images/logo.png"
            alt="Logo"
            className="img-fluid"
          />
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-4">
          <Nav.Link href="#" className="nav-link d-block d-lg-none">
            <img src="/wp-includes/images/globe-earth.svg" alt="Globe" />
          </Nav.Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav">
            <img src="/wp-includes/images/hamburger.svg" alt="Menu" />
          </Navbar.Toggle>
        </div>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Link to={"/airdrop"}>
              <Nav.Link href="/airdrop" className="nav-link active">
                Airdrop
              </Nav.Link>
            </Link>

            <Link to={"/presale"}>
              <Nav.Link href="/airdrop" className="nav-link active">
                Public Sale
              </Nav.Link>
            </Link>
            <Link to={"/community"}>
              <Nav.Link href="/airdrop" className="nav-link active">
                Community
              </Nav.Link>
            </Link>
            <Nav.Link href="#" className="nav-link d-lg-block d-none">
              <img src="/wp-includes/images/globe-earth.svg" alt="Globe" />
            </Nav.Link>
            <Nav.Link href="#" className="nav-link btn-staking">
              Staking
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
