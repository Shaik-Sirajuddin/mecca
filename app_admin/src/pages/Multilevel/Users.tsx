import { useEffect, useState } from "react";
import { Table, Pagination, Spinner } from "react-bootstrap";
import { apiBaseUrl } from "./utils/constants";
import { Link, useFetcher } from "react-router-dom";
import { Plan } from "../../schema/multilevel/plan";
import { copyToClipboard, shortenAddress } from "../../utils/utils";
import toast from "react-hot-toast";

interface User {
  address: string;
  id: string;
  plan_id: number;
  enrolled_at: string;
  referrer: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const searchUser = async (key: string) => {
    setLoading(true);
    if (!key) {
      fetchUsers(currentPage);
      return;
    }
    try {
      const response = await fetch(
        `${apiBaseUrl}/public/search-user?key=${key}`
      );
      const data = await response.json();
      if (data.body) {
        setUsers(data.body);
      } else {
        setUsers([]);
      }
      // setTotalPages(data.body.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/public/users?page=${page}&limit=10`
      );
      const data = await response.json();
      setUsers(data.body.users);
      setTotalPages(data.body.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const performCopy = async (text: string) => {
    const res = await copyToClipboard(text);
    if (res) {
      toast.success("Copied to cliboard");
    } else {
      toast.error("Failed to copy");
    }
  };
  useEffect(() => {
    console.log("users here", users);
  }, [users]);

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link to={"/mecca"}>
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
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>SNO</th>
                <th>ID</th>
                <th>Address</th>
                <th>Plan</th>
                <th>Enrolled At</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id}>
                  <td>{(currentPage - 1) * 10 + idx + 1}</td>
                  <td>{user.id}</td>
                  <td className="d-flex justify-content-between">
                    {shortenAddress(user.address)}
                    <img
                      src="/copy-file-icon.svg"
                      height={18}
                      width={18}
                      style={{ cursor: "pointer" }}
                      alt=""
                      onClick={() => {
                        performCopy(user.address);
                      }}
                    />
                  </td>
                  <td>{Plan.getPlanCode(user.plan_id)}</td>
                  <td>
                    {new Date(Number(user.enrolled_at) * 1000).toLocaleString()}
                  </td>
                  <td className="d-flex justify-content-between">
                    {shortenAddress(user.referrer)}
                    <img
                      src="/copy-file-icon.svg"
                      height={18}
                      width={18}
                      style={{ cursor: "pointer" }}
                      alt=""
                      onClick={() => {
                        performCopy(user.referrer);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <Pagination className="justify-content-center">
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </>
      )}
    </div>
  );
};

export default UsersPage;
