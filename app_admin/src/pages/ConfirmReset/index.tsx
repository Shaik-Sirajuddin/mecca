import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingWrapper from "../../components/LoadingWrapper";
import { airdropBaseUrl } from "../../utils/constants";

const ConfirmResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    try {
      if (loading) return;
      setLoading(true);

      const resetToken = searchParams.get("token");
      if (!resetToken) {
        toast.error("Invalid or missing reset token.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }

      const response = await fetch(
        `${airdropBaseUrl}/admin/confirm-reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: resetToken,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw data.message;
      }

      toast.success("Password reset successful.");
      navigate("/login");
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
            <h2>Confirm Password Reset</h2>
            <p className="text-muted">Enter your new password below.</p>
          </div>
          <Form>
            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="button"
              onClick={handlePasswordReset}
              className="w-100"
            >
              <LoadingWrapper loading={loading}>Reset Password</LoadingWrapper>
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmResetPassword;
