// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatBalance } from "../utils/utils";
import { ContractState } from "../schema/ContractState";
import { IcoState, Round } from "../schema/IcoState";
import { icoBaseUrl } from "../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminICOPage: React.FC = () => {
  const [contractState, setContractState] = useState<ContractState>(
    ContractState.dummy()
  );
  const [publicState, setPublicState] = useState<IcoState>(IcoState.dummy());
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const navigate = useNavigate();

  const syncData = () => {
    axios
      .get(`${icoBaseUrl}/admin/contract-state`, {
        headers: {
          authorization: localStorage.getItem("auth-key"),
        },
      })
      .then((response) =>
        setContractState(new ContractState(response.data.body))
      )
      .catch((error) => console.error("Error fetching contract state:", error));

    // Fetch public state
    axios
      .get(`${icoBaseUrl}/public/state`)
      .then((response) => setPublicState(response.data.body))
      .catch((error) => console.error("Error fetching public state:", error));
  };

  useEffect(() => {
    if (!localStorage.getItem("auth-key")) {
      navigate("/login");
    }
    syncData();
  }, [navigate]);

  const handleEditRound = (round: Round) => {
    setEditingRound(round);
  };

  const handleUpdateRound = () => {
    if (editingRound) {
      axios
        .post(`${icoBaseUrl}/admin/update-round/`, editingRound, {
          headers: {
            authorization: localStorage.getItem("auth-key"),
          },
        })
        .then(() => {
          toast.success("Round updated successfully!");
          setEditingRound(null);
          syncData();
        })
        .catch((error) => {
          toast.error(error.toString());
          console.error("Error updating round:", error);
        });
    }
  };

  const handleConfigUpdate = () => {
    axios
      .post(`${icoBaseUrl}/admin/update-config`, publicState.config, {
        headers: {
          authorization: localStorage.getItem("auth-key"),
        },
      })
      .then(() => {
        toast.success("Config updated successfully!");
        syncData();
      })
      .catch((error) => {
        toast.error(error.toString());
        console.error("Error updating config:", error);
      });
  };

  if (!contractState || !publicState) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">ICO Admin Panel</h1>

      {/* Contract State Section */}
      <Row className="mb-4">
        <h2 className="mb-4">Contract State</h2>
        <Col>
          <p>
            <strong>Tokens Sold:</strong>{" "}
            <p className="fs-3">
              {" "}
              {formatBalance(contractState.tokens_sold)} MEA
            </p>
          </p>
        </Col>
        <Col>
          <p>
            <strong>USDT Raised:</strong>{" "}
            <p className="fs-3"> {formatBalance(contractState.usdt_raised)}</p>
          </p>
        </Col>
        <Col>
          <p>
            <strong>SOL Raised:</strong>{" "}
            <p className="fs-3"> {formatBalance(contractState.sol_raised)}</p>
          </p>
        </Col>
      </Row>

      {/* Sales Table */}
      {/* <Row className="mb-4">
        <Col>
          <h2>Sales</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Token Amount</th>
                <th>Paid Amount</th>
                <th>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {contractState.sales.map((sale: any, index: number) => (
                <tr key={index}>
                  <td>{sale.user.username || "N/A"}</td>
                  <td>{sale.token_amount}</td>
                  <td>{sale.paid_amount}</td>
                  <td>{sale.is_usdt ? "USDT" : "SOL"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row> */}

      {/* Rounds Section */}
      <Row className="mb-4">
        <Col>
          <h2>Rounds</h2>
          <Row>
            {publicState.rounds.map((round: any) => (
              <Col key={round.id} sm={6} md={4} lg={3} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>Round {round.id}</Card.Title>
                    <Card.Text>
                      <strong>Token Price:</strong> {round.tokenPrice} $
                      <br />
                      <strong>End Time:</strong>{" "}
                      {new Date(round.endTime).toLocaleString()}
                    </Card.Text>
                    <Button
                      variant="primary"
                      onClick={() => handleEditRound(round)}
                    >
                      Edit
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Edit Round Section */}
      {editingRound && (
        <Row className="mb-4">
          <Col>
            <h2>Edit Round {editingRound.id}</h2>
            <Form>
              <Form.Group controlId="tokenPrice" className="mb-3">
                <Form.Label>Token Price</Form.Label>
                <Form.Control
                  type="text"
                  value={editingRound.tokenPrice}
                  onChange={(e) =>
                    setEditingRound({
                      ...editingRound,
                      tokenPrice: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="endTime" className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={new Date(editingRound.endTime)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    setEditingRound({
                      ...editingRound,
                      endTime: new Date(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Button variant="success" onClick={handleUpdateRound}>
                Save
              </Button>
            </Form>
          </Col>
        </Row>
      )}

      {/* Config Section */}
      <Row className="mb-4">
        <Col>
          <h2>Config</h2>
          <Form>
            <Form.Group controlId="startTime" className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={new Date(publicState.config.startTime)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) => {
                  console.log(e.target.value);
                  setPublicState({
                    ...publicState,
                    config: {
                      ...publicState.config,
                      startTime: new Date(e.target.value),
                    },
                  });
                }}
              />
            </Form.Group>
            <Form.Group controlId="paused" className="mb-3">
              <Form.Check
                type="switch"
                label="Paused"
                checked={publicState.config.paused}
                onChange={(e) => {
                  setPublicState({
                    ...publicState,
                    config: {
                      ...publicState.config,
                      paused: e.target.checked,
                    },
                  });
                }}
              />
            </Form.Group>
            <Button variant="warning" onClick={handleConfigUpdate}>
              Update Config
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminICOPage;
