import { useEffect, useState } from "react";
import { Button, Modal, Pagination, Table } from "react-bootstrap";
import { UserResponseItem } from "../../interface/game/UserItem";
import { apiBaseUrl, authKey } from "./utils/constants";
import { splToken } from "../staking/utils/constants";
import { Link } from "react-router-dom";

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserResponseItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const searchUser = async (key: string) => {
    if (!key) {
      fetchUsersData(currentPage);
      return;
    }
    setLoading(true);
    const response = await fetch(`${apiBaseUrl}/admin/users?key=${key}`, {
      headers: {
        Authorization: authKey,
      },
    });
    const data = await response.json();
    setUsers(data.data.users ?? []);
    console.log(data.data.users);
    setLoading(false);
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
      `${apiBaseUrl}/admin/user-holding?userId=${userId+183}`,
      {
        headers: {
          Authorization: authKey,
        },
      }
    );
    const data = await response.json();
    setHoldings(data.data.holdings);
  };

  useEffect(() => {
    fetchUsersData(currentPage);
  }, [currentPage]);
  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link to={"/game"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 25 25"
            fill="black"
            height={30}
            style={{
              cursor: "pointer",
            }}
          >
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h2 className="ms-3">Users</h2>
        <div
          className="d-flex align-items-center"
          style={{
            flex: "1",
            justifyContent: "end",
          }}
        >
          <input
            type="text"
            style={{
              width: "200px",
            }}
            className="form-control me-2"
            placeholder="Enter Address or ID"
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
              searchUser(e.target.value);
            }}
          />
          {/* <button className="btn btn-primary">Search</button> */}
        </div>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div>
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
        </div>
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

export default Users;
