import { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Pagination,
  Table,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import { apiBaseUrl, authKey, tokenHolder } from "./utils/constants";
import Decimal from "decimal.js";
import { formatBalance } from "../../utils/utils";
import { splToken } from "../staking/utils/constants";
import { UserResponseItem } from "../../interface/game/UserItem";
import { useConnection } from "@solana/wallet-adapter-react";
import { getSPlTokenBalance } from "../../utils/web3";
import { getUserTokenAta } from "../Ico/utils/web3";
import toast from "react-hot-toast";

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

  const [users, setUsers] = useState<UserResponseItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [holdings, setHoldings] = useState([]);
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

  const fetchUsersData = async (page: number) => {
    setLoading(true);
    const response = await fetch(
      `${apiBaseUrl}/admin/users?page=${page}&limit=10`,
      {
        headers: {
          Authorization: authKey,
        },
      }
    );
    const data = await response.json();
    setUsers(data.data.users);
    console.log(data.data.users);
    setTotalPages(Math.ceil(data.data.totalUsers / 10));
    setLoading(false);
  };

  const fetchUserHoldings = async (userId: number) => {
    setShowModal(true);
    const response = await fetch(
      `${apiBaseUrl}/admin/user-holding?userId=${userId}`,
      {
        headers: {
          Authorization: authKey,
        },
      }
    );
    const data = await response.json();
    setHoldings(data.data.holdings);
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
    fetchUsersData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchRpcData();
  }, [connection]);

  return (
    <div>
      <Container className="py-4">
        <h1 className="mb-4 text-center">Game</h1>
        <Row className="mb-4">
          <h2 className="mb-4">Overview</h2>
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
                <div
                  style={{
                    background: stats.exportInProgress ? "darkred" : "greenp",
                    width: "fit-content",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {stats.exportInProgress ? "Under Progress" : "Completed"}
                </div>
                {!stats.exportInProgress && (
                  <img
                    src="./download.png"
                    alt=""
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
        </Row>

        {/* Users Table */}
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="mb-4">Users</h2>
          <Button
            variant="primary"
            onClick={() => exportUsers()}
            disabled={stats.exportInProgress}
          >
            Export
          </Button>
        </div>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Wallet Address</th>
                <th>Total Referrals</th>
                <th>Holding Value</th>
                <th>Coins</th>
                <th>Withdrawn</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: UserResponseItem) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.wallet_address}</td>
                  <td>{user.total_referrals}</td>
                  <td>
                    {user.holding_value} {splToken.symbol}
                  </td>
                  <td>
                    {user.coins} {splToken.symbol}
                  </td>
                  <td>
                    {user.claimed_coins} {splToken.symbol}
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => fetchUserHoldings(user.id)}
                    >
                      Holdings
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Pagination Controls */}
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      </Container>
      {/* Holdings Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Holdings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {holdings.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Quantity</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding: any, index) => (
                  <tr key={index}>
                    <td>{holding.level}</td>
                    <td>{holding.quantity}</td>
                    <td>
                      {holding.value.toString()} {splToken.symbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No holdings found for this user.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Game;
