import { useEffect, useState } from "react";
import { Col, Container, Row, Form, Button } from "react-bootstrap";
import { apiBaseUrl, authKey, tokenHolder } from "./utils/constants";
import Decimal from "decimal.js";
import { formatBalance } from "../../utils/utils";
import { splToken } from "../staking/utils/constants";
import { useConnection } from "@solana/wallet-adapter-react";
import { getSPlTokenBalance } from "../../utils/web3";
import { getUserTokenAta } from "../Ico/utils/web3";
import toast from "react-hot-toast";
import AdminVariants from "./Variants";
import { Link } from "react-router-dom";

const Game: React.FC = () => {
  const [stats, setStats] = useState({
    dau: 0,
    holdingsValue: "0",
    totalCoins: "0",
    totalUsers: 0,
    totalWithdrawn: "0",
    exportInProgress: true,
  });
  const { connection } = useConnection();

  const [holderSolBalance, setHolderSolBalance] = useState("0");
  const [holderTokenBalance, setHolderTokenBalance] = useState("0");

  const fetchRpcData = async () => {
    try {
      const balance = await connection.getBalance(tokenHolder);
      setHolderSolBalance(balance.toString());
      const tokenBalance = await getSPlTokenBalance(
        connection,
        getUserTokenAta(tokenHolder)
      );
      setHolderTokenBalance(tokenBalance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchApiData = async () => {
    const statsResponse = await fetch(`${apiBaseUrl}/admin/stats`, {
      headers: {
        Authorization: authKey,
      },
    });
    setStats((await statsResponse.json()).data);
  };

  const downloadUserSheet = () => {
    const a = document.createElement("A");
    a.setAttribute("href", `${apiBaseUrl}/assets/users.xlsx`);
    a.setAttribute("download", "users.xlsx");
    document.body.appendChild(a);
    a.click();
  };

  const exportUsers = async () => {
    try {
      if (stats.exportInProgress) {
        toast.error("Export is in progress");
        return;
      }
      fetch(`${apiBaseUrl}/admin/export-users`, {
        headers: {
          Authorization: authKey,
        },
      }).then(() => {
        fetch(`${apiBaseUrl}/assets/users.xlsx`);
        downloadUserSheet();
        fetchApiData();
      });
      toast.success("Export started");
      fetchApiData();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  useEffect(() => {
    fetchRpcData();
  }, [connection]);

  return (
    <div>
      <Container className="py-4">
        <h1 className="mb-4 text-center">Game</h1>
        <Row className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-4">Overview</h2>
          </div>
          <Col>
            <p>
              <strong>Daily Active Users</strong>{" "}
              <p className="fs-3">{stats.dau}</p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Total Users:</strong>{" "}
              <p className="fs-3">{stats.totalUsers}</p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Users Accumulated Balance</strong>{" "}
              <p className="fs-3">
                {formatBalance(
                  new Decimal(stats.holdingsValue)
                    .add(stats.totalCoins)
                    .mul(Math.pow(10, splToken.decimals))
                )}{" "}
                {splToken.symbol}
              </p>
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>
              <strong>Sol Balance</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(holderSolBalance), 9)} SOL
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>MEA Balance</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(holderTokenBalance))} MEA
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Total Withdrawn</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(stats.totalWithdrawn))} MEA
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Export status</strong>{" "}
              <p className="d-flex align-items-center" style={{ gap: "10px" }}>
                <Button
                  style={{
                    background: stats.exportInProgress ? "darkred" : "green",
                    width: "fit-content",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={exportUsers}
                  disabled={stats.exportInProgress}
                >
                  {stats.exportInProgress ? "Under Progress" : "Restart"}
                </Button>
                {!stats.exportInProgress && (
                  <img
                    src="/download.png"
                    alt="this"
                    onClick={downloadUserSheet}
                    style={{
                      height: "24px",
                      cursor: "pointer",
                    }}
                  />
                )}
              </p>
            </p>
          </Col>
        </Row>
        <Row>
          <Form.Group controlId="depositAddress" className="mb-3">
            <Form.Label>
              <strong> Token Holder </strong>
            </Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={tokenHolder.toString() || "N/A"}
            />
          </Form.Group>
          <Row className="justify-content-center align-items-center">
            <Link to={"/game/users"} style={{'width' : 'fit-content' }}>
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
          <AdminVariants />
        </Row>
      </Container>
    </div>
  );
};

export default Game;
