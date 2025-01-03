// Import necessary libraries and components
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { AirdropConfig } from "../../schema/AirdropConfig";
import { airdropBaseUrl } from "../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Decimal from "decimal.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { tokenHolderAta, tokenHolderOwner } from "./utils/constants";
import { getSPlTokenBalance } from "../../utils/web3";
import { convertToLocalISOString, formatBalance } from "../../utils/utils";
import { AidropRequest } from "../../schema/AirdropRequest";

const AirdropAdmin: React.FC = () => {
  const [airdropConfig, setAirdropConfig] = useState<AirdropConfig>(
    AirdropConfig.dummy()
  );

  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState(new Decimal("0"));
  const [solBalance, setSolBalance] = useState(new Decimal("0"));
  const navigate = useNavigate();
  const [claims, setClaims] = useState<AidropRequest[]>([]);
  const [claimsDate, setClaimsDate] = useState(new Date());
  const [totalClaimsToday, setTotalClaimsToday] = useState(0);

  const fetchBalance = useCallback(async () => {
    const balance = await connection.getBalance(tokenHolderOwner);
    setSolBalance(new Decimal(balance));

    setTokenBalance(await getSPlTokenBalance(connection, tokenHolderAta));
  }, [connection]);

  const fetchClaimsByDate = async () => {
    try {
      const response = await fetch(`${airdropBaseUrl}/admin/claims`, {
        method: "POST",
        headers: {
          authorization: localStorage.getItem("auth-key")!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: claimsDate.getTime(),
        }),
      });
      console.log(claimsDate);
      const data = await response.json();
      console.log(data);
      const _claims: AidropRequest[] = [];
      data.body.forEach((item: any) => {
        _claims.push(new AidropRequest(item));
      });
      setClaims(_claims);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    // Fetch airdrop config
    axios
      .get(`${airdropBaseUrl}/public/config`)
      .then((response) => setAirdropConfig(response.data.body))
      .catch((error) => {
        console.log(error);
        toast.error(error.toString());
      });
    axios
      .get(`${airdropBaseUrl}/admin/total-claims`, {
        headers: {
          authorization: localStorage.getItem("auth-key"),
        },
      })
      .then((res) => {
        setTotalClaimsToday(res.data.body.count);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.toString());
      });
  }, []);

  const handleConfigUpdate = () => {
    axios
      .post(`${airdropBaseUrl}/admin/update-config`, airdropConfig, {
        headers: {
          authorization: localStorage.getItem("auth-key"),
        },
      })
      .then(() => {
        toast.success("Airdrop configuration updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.toString());
      });
  };

  useEffect(() => {
    if (!localStorage.getItem("auth-key")) {
      navigate("/login");
    }
  }, [navigate]);

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
                <Row>
                  <Col>
                    <strong>Airdrop Amount:</strong>

                    <p className="fs-3"> {airdropConfig.amount} MEA</p>
                  </Col>
                  <Col>
                    <strong>Sol Balance:</strong>

                    <p className="fs-3"> {formatBalance(solBalance, 9)} Sol</p>
                  </Col>
                  <Col>
                    <strong>MEA Balance:</strong>

                    <p className="fs-3"> {formatBalance(tokenBalance)} MEA</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <strong>Claims Today :</strong>

                    <p className="fs-3"> {totalClaimsToday}</p>
                  </Col>
                  <Col>
                    <strong>Token Holder :</strong>
                    <Form.Control
                      type="text"
                      readOnly={true}
                      value={tokenHolderOwner.toString()}
                    />
                  </Col>
                </Row>
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
                value={convertToLocalISOString(new Date(airdropConfig.endTime))}
                type="datetime-local"
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

      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Filter Claims by Date</h2>
          <Form>
            <Form.Group
              controlId="claimsDate"
              className="d-flex align-items-center mb-3"
            >
              <Form.Label className="me-2">Select Date:</Form.Label>
              <Form.Control
                type="date"
                value={claimsDate.toISOString().split("T")[0]} // Format to YYYY-MM-DD
                onChange={(e) => setClaimsDate(new Date(e.target.value))}
                style={{ maxWidth: "200px" }}
              />
              <Button
                variant="primary"
                className="ms-3"
                onClick={fetchClaimsByDate}
              >
                Fetch Claims
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Claims</h2>
          {claims.length > 0 ? (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Address</th>
                    <th>IP</th>
                    <th>Under Process</th>
                    <th>Success</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.id}</td>
                      <td>{claim.address}</td>
                      <td>{claim.ip}</td>
                      <td>{claim.underProcess ? "Yes" : "No"}</td>
                      <td>{claim.success ? "Yes" : "No"}</td>
                      <td>{claim.createdAt?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No claims found for the selected date.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AirdropAdmin;
