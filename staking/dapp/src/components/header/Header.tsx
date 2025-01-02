import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./styls.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function Header() {
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);

  const path = useLocation().pathname;

  return (
    <>
      <Navbar expand="lg" className="navbar">
        <div className="container">
          <div className="nav-wrapper">
            <div className="brand-wrap">
              <button
                onClick={() => setToggleMenu((pre) => !pre)}
                className="p-2 hamburger-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100%"
                  height="100%"
                  viewBox="0 0 50 50"
                >
                  <path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"></path>
                </svg>
              </button>
              <Navbar.Brand href="/staking">
                <img
                  alt="logo"
                  src="/images/logo.png"
                  width="180"
                  height="50"
                  className="d-inline-block logo-img"
                />
              </Navbar.Brand>
            </div>

            <Nav className={`${toggleMenu && "show"}` + " nav-list"}>
              <Nav.Link
                href="/staking"
                className={`${path === "/staking" && "active"}`}
              >
                {/* <div className="active-state"></div> */}
                <span>Staking</span>
              </Nav.Link>
              <Nav.Link
                className={`${path === "/withdrawal" && "active"}`}
                href="/withdrawal"
              >
                {/* <div className="active-state"></div> */}
                Withdrawal
              </Nav.Link>

              <WalletMultiButton style={{}} />
            </Nav>

            {/* <ul className="auth-links-list">
              <li>
                <Link to="#" className="login">
                  <span>Login </span>
                </Link>
              </li>
              <li>ㅣ</li>
              <li>
                <Link to="#" className="signup">
                  <span>Sign up</span>
                </Link>
              </li>
            </ul> */}
          </div>
        </div>
      </Navbar>
    </>
  );
}

export default Header;
