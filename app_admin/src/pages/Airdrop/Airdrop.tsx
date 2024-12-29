// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { AirdropConfig } from "../../schema/AirdropConfig";
import { airdropBaseUrl } from "../../utils/constants";
import toast from "react-hot-toast";

const AirdropAdmin: React.FC = () => {
  const [airdropConfig, setAirdropConfig] = useState<AirdropConfig>(
    AirdropConfig.dummy()
  );

  useEffect(() => {
    // Fetch airdrop config
    axios
      .get(`${airdropBaseUrl}/public/config`)
      .then((response) => setAirdropConfig(response.data.body))
      .catch((error) => {
        console.log(error);
        toast.error(error.toString());
      });
  }, []);

  const handleConfigUpdate = () => {
    axios
      .post(`${airdropBaseUrl}/admin/update-config`, airdropConfig)
      .then(() => {
        toast.success("Airdrop configuration updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.toString());
      });
  };

  if (!airdropConfig) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Airdrop Admin Panel</h1>

      {/* Current Config Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Current Airdrop Configuration</Card.Title>
              <Card.Text>
                <Row>
                  <Col>
                    <strong>Minimum SOL Amount:</strong>{" "}
                    <p className="fs-3"> {airdropConfig.minSolAmount} SOL</p>
                  </Col>
                  <Col>
                    <strong>Paused:</strong>
                    <p className="fs-3">
                      {" "}
                      {airdropConfig.paused ? "Yes" : "No"}{" "}
                    </p>
                  </Col>
                  <Col>
                    <strong>End Time:</strong>{" "}
                    <p className="fs-3">
                      {" "}
                      {new Date(airdropConfig.endTime).toLocaleString()}{" "}
                    </p>
                  </Col>
                </Row>
                <strong>Airdrop Amount:</strong>

                <p className="fs-3"> {airdropConfig.amount} MEA</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Config Section */}
      <Row className="mb-4">
        <Col>
          <h2>Update Airdrop Configuration</h2>
          <Form>
            <Form.Group controlId="minSolAmount" className="mb-3">
              <Form.Label>Minimum SOL Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter minimum SOL amount"
                value={airdropConfig.minSolAmount}
                onChange={(e) =>
                  setAirdropConfig({
                    ...airdropConfig,
                    minSolAmount: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="paused" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Paused"
                checked={airdropConfig.paused ?? airdropConfig.paused}
                onChange={(e) =>
                  setAirdropConfig({
                    ...airdropConfig,
                    paused: e.target.checked,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="endTime" className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={new Date(airdropConfig.endTime)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setAirdropConfig({
                    ...airdropConfig,
                    endTime: new Date(e.target.value),
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="amount" className="mb-3">
              <Form.Label>Airdrop Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter airdrop amount"
                value={airdropConfig.amount}
                onChange={(e) =>
                  setAirdropConfig({
                    ...airdropConfig,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>
            <Button variant="primary" onClick={handleConfigUpdate}>
              Update Configuration
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AirdropAdmin;
