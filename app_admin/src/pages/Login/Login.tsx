import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { airdropBaseUrl } from "../../utils/constants";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginValidated, setLoginValidated] = useState(false);

  const [totp, setTotp] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Hardcoded credentials
    try {
      //assuming same secret key for airdrop and ico
      const res = await fetch(`${airdropBaseUrl}/admin/login`, {
        method: "POST",
        headers: {
          // authorization: secretKey,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw data.message;
      }
      setLoginValidated(true);
    } catch (error: any) {
      setLoginValidated(false);
      console.log(error);
      toast.error(error.toString());
    }
  };

  const handleTwoFactorAuth = async () => {
    try {
      const res = await fetch(`${airdropBaseUrl}/admin/2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
          otp: totp,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw data.message;
      }
      navigate("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Row className="w-100">
        {!loginValidated ? (
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <div className="text-center mb-4">
              <h2>Login</h2>
              <p className="text-muted">
                Enter your credentials to access the admin panel.
              </p>
            </div>
            <Form>
              <Form.Group controlId="username" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group controlId="secretKey" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  value={totp}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="button"
                onClick={handleLogin}
                className="w-100"
              >
                Login
              </Button>

              <div className="text-center mt-3">
                <Button
                  variant="link"
                  className="p-0"
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    navigate("/reset-password");
                  }}
                >
                  Forgot password
                </Button>
              </div>
            </Form>
          </Col>
        ) : (
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <div className="text-center mb-4">
              <h2>Two Factor Authentication</h2>
              <p className="text-muted">Enter OTP From Authenticator App</p>
            </div>
            <Form>
              <Form.Group controlId="secretKey" className="mb-3">
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="------"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="button"
                onClick={handleTwoFactorAuth}
                className="w-100"
              >
                Confirm
              </Button>
            </Form>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Login;
