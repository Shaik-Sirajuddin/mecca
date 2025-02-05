import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { apiBaseUrl, tokenHolderId } from "./utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getSPlTokenBalance } from "../../utils/web3";
import { formatBalance } from "../../utils/utils";
import Decimal from "decimal.js";
import {
  fetchAppState,
  getUpdateOwnerTransaction,
  getUpdateStateInstruction,
  getUserTokenAta,
} from "./utils/web3";
import { splToken } from "../staking/utils/constants";
import { parsePubKey } from "../Ico/utils/web3";
import toast from "react-hot-toast";
import { AppState } from "../../schema/multilevel/app_state";
import { Link } from "react-router-dom";
const MultiLevel: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [paused, setPaused] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [contractBalance, setContractBalance] = useState("0");
  const [userStats, setUserStats] = useState({
    participants: [0, 0, 0],
    userClaimable: "0",
    accDailyReward: "0",
    accReferralReward: "0",
    accFee: "0",
  });
  const [, setAppState] = useState(AppState.dummy());

  const fetchApiData = async () => {
    const response = await fetch(`${apiBaseUrl}/public/user-stats`, {
      method: "GET",
    });
    const data = (await response.json()).body;
    setUserStats(data);
  };
  const fetchNodeData = async () => {
    const userATA = getUserTokenAta(tokenHolderId);
    const balance = await getSPlTokenBalance(connection, userATA);
    setContractBalance(balance.toString());

    const _appState = await fetchAppState(connection);
    setAppState(_appState);
  };

  const updateState = async () => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }
      const tx = await getUpdateStateInstruction(publicKey, paused);
      await sendTransaction(tx, connection);
      toast.success("State updated");
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  const updateOwner = async () => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }
      const parsedOwnerAcc = parsePubKey(ownerAddress);
      if (!parsedOwnerAcc) {
        toast.error("Invalid Owner Address");
        return;
      }
      const tx = await getUpdateOwnerTransaction(publicKey, parsedOwnerAcc);
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success("Owner updated");
      //   delayedUpdate(syncData);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  useEffect(() => {
    fetchApiData();
    fetchNodeData();
  }, []);
  return (
    <div>
      <Container className="py-4">
        <h1 className="mb-4 text-center">Mecca Crypto</h1>
        <Row className="mb-4">
          <h2 className="mb-4">Mecca Crypto Contract State</h2>
          <Col>
            <p>
              <strong>Total Participants:</strong>{" "}
              <p className="fs-3">
                {userStats.participants.reduce((prev, cur) => prev + cur)}
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Stage A :</strong>{" "}
              <p className="fs-3">{userStats.participants[0]}</p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Stage B :</strong>{" "}
              <p className="fs-3">{userStats.participants[1]}</p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Stage C :</strong>{" "}
              <p className="fs-3">{userStats.participants[2]}</p>
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>
              <strong>Contract Balance:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(contractBalance))} {splToken.symbol}
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>User Claimable:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(userStats.userClaimable))}{" "}
                {splToken.symbol}
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Acc Daily Reward:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(userStats.accDailyReward))}{" "}
                {splToken.symbol}
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Acc Referral Reward:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(userStats.accReferralReward))}{" "}
                {splToken.symbol}
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Acc Fee:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(userStats.accFee))} {splToken.symbol}
              </p>
            </p>
          </Col>
        </Row>
      </Container>
      <Row className="justify-content-center align-items-center">
        <Link to={"./users"} style={{ width: "fit-content" }}>
          <Button
            style={{
              width: "fit-content",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            User List
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="white"
            >
              <path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" />
            </svg>
          </Button>
        </Link>
      </Row>
      <Row>
        <Form.Group controlId="depositAddress" className="mb-3">
          <Form.Label>
            <strong> Token Holder </strong>
          </Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={tokenHolderId.toString() || "N/A"}
          />
        </Form.Group>
      </Row>
      <Row className="mb-4">
        <Col>
          <Form>
            <Form.Group controlId="paused" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enrollment,Upgrades Paused"
                checked={paused}
                onChange={(e) => {
                  setPaused(e.target.checked);
                }}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={() => {
                updateState();
              }}
            >
              Update State
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>Owner Address</h2>
          <Form>
            <Form.Group controlId="ownerAddress" className="mb-3">
              <Form.Label>Owner Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter owner address"
                value={ownerAddress}
                onChange={(e) => {
                  setOwnerAddress(e.target.value.toString());
                }}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={() => {
                updateOwner();
              }}
            >
              Update Owner
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default MultiLevel;
