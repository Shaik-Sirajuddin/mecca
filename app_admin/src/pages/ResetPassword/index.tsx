import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingWrapper from "../../components/LoadingWrapper";
import { airdropBaseUrl } from "../../utils/constants";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const response = await fetch(`${airdropBaseUrl}/admin/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw data.message;
      }
      toast.success("Password reset email has been sent.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.toString());
    } finally {
      setLoading(false);
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
            <h2>Request Password Reset</h2>
            <p className="text-muted">
              Enter your email to receive a reset link.
            </p>
          </div>
          <Form>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="button"
              onClick={handleRequestReset}
              className="w-100"
            >
              <LoadingWrapper loading={loading}>Send Reset Link</LoadingWrapper>
            </Button>
            <div className="text-center mt-3">
              <Button
                variant="link"
                className="p-0"
                style={{ textDecoration: "none" }}
                onClick={() => {
                  navigate("/login");
                }}
              >
                Back to Login
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
