import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { airdropBaseUrl } from "../../utils/constants";

const Login: React.FC = () => {
  const [secretKey, setSecretKey] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Hardcoded credentials
    try {
      //assuming same secret key for airdrop and ico
      const res = await fetch(`${airdropBaseUrl}/admin/login`, {
        headers: {
          authorization: secretKey,
        },
      });
      const data = await res.json();
      if (!data.success) {
        throw data.message;
      }
      localStorage.setItem("auth-key", secretKey);
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
        <Col xs={12} md={6} lg={4} className="mx-auto">
          <div className="text-center mb-4">
            <h2>Login</h2>
            <p className="text-muted">
              Enter your credentials to access the admin panel.
            </p>
          </div>
          <Form>
            <Form.Group controlId="username" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                defaultValue={"admin"}
                readOnly={true}
              />
            </Form.Group>

            <Form.Group controlId="secretKey" className="mb-3">
              <Form.Label>Secret Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
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
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
