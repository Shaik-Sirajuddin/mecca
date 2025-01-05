// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  convertToLocalISOString,
  deci,
  formatBalance,
  updateIfValid,
} from "../../utils/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AppConfig, AppConfigSchema } from "../../schema/ico/AppConfig";
import { Round } from "../../schema/ico/Round";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  appConfigPDA,
  token,
  tokenHoldingAta,
  tokenHoldingOwner,
} from "./utils/constants";
import {
  getSPlTokenBalance,
  getUpdateConfigTransaction,
  getUpdateOwnerTransaction,
  getUpdateRoundTransaction,
  getWithdrawTokensTransaction,
  parsePubKey,
} from "./utils/web3";
import Decimal from "decimal.js";

const AdminICOPage: React.FC = () => {
  const [appConfig, setAppConfig] = useState<AppConfig>(AppConfig.dummy());

  const [ownerAddress, setOwnerAddress] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [editRoundPrice, setEditRoundPrice] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [tokensInSale, setTokensInSale] = useState(new Decimal("0"));
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const delayedUpdate = (sync: () => any) => {
    setTimeout(sync, 2000);
    setTimeout(sync, 3000);
  };
  const updateRound = async () => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }
      if (!editingRound) return;
      const round = new Round({
        ...editingRound,
        end_time: Math.floor(editingRound!.end_time.getTime() / 1000),
        round_price: new Decimal(editRoundPrice)
          .mul(Math.pow(10, 3))
          .toFixed(0),
      });
      console.log(round.end_time.getTime());
      const tx = await getUpdateRoundTransaction(publicKey, round);
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success("Round Details updated");
      delayedUpdate(syncData);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };
  const updateConfig = async () => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }
      const parsedDepositAcc = parsePubKey(depositAddress);
      if (!parsedDepositAcc) {
        toast.error("Invalid Deposit Address");
        return;
      }
      const _appConfig = new AppConfig({
        ...appConfig,
        start_time: Math.floor(appConfig!.start_time.getTime() / 1000),
        deposit_acc: parsedDepositAcc,
      });

      const tx = await getUpdateConfigTransaction(publicKey, _appConfig);
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success("Config updated");
      delayedUpdate(syncData);
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
      delayedUpdate(syncData);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  const withdrawTokens = async () => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }
      let amount = deci(withdrawAmount);
      if (!amount) {
        toast.error("Invalid Amount");
        return;
      }
      amount = amount.mul(Math.pow(10, token.decimals));
      if (amount.gt(tokensInSale)) {
        toast.error("Amount exceeds tokens in sale");
        return;
      }

      const tx = await getWithdrawTokensTransaction(
        publicKey,
        connection,
        amount.toString()
      );
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success("Owner updated");
      delayedUpdate(syncData);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };
  const fetchIcoState = async () => {
    try {
      const accountInfo = await connection.getAccountInfo(
        appConfigPDA,
        "processed"
      );
      const deserializedData = AppConfigSchema.decode(accountInfo?.data);
      setAppConfig(new AppConfig(deserializedData));

      const balance = await getSPlTokenBalance(connection, tokenHoldingAta);
      setTokensInSale(balance);
    } catch (error: unknown) {
      console.log("Fetch Ico state", error);
    }
  };

  const syncData = () => {
    fetchIcoState();
  };

  useEffect(() => {
    console.log("here", appConfig.deposit_acc.toString());
    setDepositAddress(appConfig.deposit_acc.toString());
    setOwnerAddress(appConfig.owner.toString());
  }, [appConfig]);

  useEffect(() => {
    if (!localStorage.getItem("auth-key")) {
      navigate("/login");
    }
    syncData();
  }, [navigate]);

  const handleEditRound = (round: Round) => {
    setEditingRound(round);
    setEditRoundPrice(calculatePrice(round).toString());
  };

  const handleUpdateRound = () => {
    if (editingRound) {
      updateRound();
    }
  };

  const calculatePrice = (round: Round) => {
    return round.round_price.div(Math.pow(10, round.price_decimals));
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">ICO Admin Panel</h1>

      {/* Contract State Section */}
      <Row className="mb-4">
        <h2 className="mb-4">Contract State</h2>
        <Col>
          <p>
            <strong>Tokens Sold:</strong>{" "}
            <p className="fs-3"> {formatBalance(appConfig.tokens_sold)} MEA</p>
          </p>
        </Col>
        <Col>
          <p>
            <strong>USDT Raised:</strong>{" "}
            <p className="fs-3"> {formatBalance(appConfig.usdt_raised)}</p>
          </p>
        </Col>
        <Col>
          <p>
            <strong>SOL Raised:</strong>{" "}
            <p className="fs-3"> {formatBalance(appConfig.sol_raised , 9)}</p>
          </p>
        </Col>
        <Col>
          <p>
            <strong>Tokens In Sale:</strong>{" "}
            <p className="fs-3"> {formatBalance(tokensInSale)}</p>
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
            value={tokenHoldingOwner.toString() || "N/A"}
          />
        </Form.Group>
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
            {appConfig.rounds.map((round: Round) => (
              <Col key={round.idx} sm={6} md={4} lg={3} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>Round {round.idx + 1}</Card.Title>
                    <Card.Text>
                      <strong>Token Price:</strong>{" "}
                      {calculatePrice(round).toString()} $
                      <br />
                      <strong>End Time:</strong>{" "}
                      {new Date(round.end_time).toLocaleString()}
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
            <h2>Edit Round {editingRound.idx + 1}</h2>
            <Form>
              <Form.Group controlId="tokenPrice" className="mb-3">
                <Form.Label>Token Price</Form.Label>
                <Form.Control
                  type="text"
                  value={editRoundPrice}
                  onChange={(e) => {
                    setEditRoundPrice(e.target.value.toString());
                  }}
                />
              </Form.Group>
              <Form.Group controlId="endTime" className="mb-3">
                <Form.Label>End Time</Form.Label>

                <Form.Control
                  type="datetime-local"
                  value={convertToLocalISOString(
                    new Date(editingRound.end_time)
                  )}
                  onChange={(e) => {
                    console.log(e.target.value, new Date(e.target.value));
                    setEditingRound({
                      ...editingRound,
                      end_time: new Date(e.target.value),
                    });
                  }}
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
            <Form.Group controlId="depositAddress" className="mb-3">
              <Form.Label>Deposit Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter deposit address"
                value={depositAddress}
                onChange={(e) => {
                  setDepositAddress(e.target.value.toString());
                }}
              />
            </Form.Group>
            <Form.Group controlId="startTime" className="mb-3">
              <Form.Label>Start Time</Form.Label>

              <Form.Control
                type="datetime-local"
                value={convertToLocalISOString(new Date(appConfig.start_time))}
                onChange={(e) => {
                  setAppConfig({
                    ...appConfig,
                    start_time: new Date(e.target.value),
                  });
                }}
              />
              {/* <DateTimePicker
                onChange={(time) => {
                  if (time) {
                    setAppConfig({
                      ...appConfig,
                      start_time: new Date(time ?? ""),
                    });
                    console.log(time.toLocaleString())
                  }
                }}
                value={appConfig.start_time}
                // disableClock={true} // Removes the clock
              /> */}
              {/* <TimePicker
                value={secondsToTimeString(
                  appConfig.start_time.getTime() / 1000
                )}
                onChange={(time) => {
                  setAppConfig({
                    ...appConfig,
                    start_time: new Date(
                      timeStringToSeconds(time ?? "") * 1000
                    ),
                  });
                }}
                format={"h:mm a"}
              /> */}
            </Form.Group>
            <Form.Group controlId="paused" className="mb-3">
              <Form.Check
                type="switch"
                label="Paused"
                checked={appConfig.paused}
                onChange={(e) => {
                  appConfig.paused = e.target.checked;
                  setAppConfig({
                    ...appConfig,
                    paused: e.target.checked,
                  });
                }}
              />
            </Form.Group>
            <Button variant="warning" onClick={updateConfig}>
              Update Config
            </Button>
          </Form>
        </Col>
      </Row>
      {/* Withdraw Tokens Section */}
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
        <Col>
          <h2>Withdraw Tokens</h2>
          <Form>
            <Form.Group controlId="withdrawAmount" className="mb-3">
              <Form.Label>Withdraw Amount</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) =>
                    updateIfValid(e.target.value.toString(), setWithdrawAmount)
                  }
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    setWithdrawAmount(
                      tokensInSale.div(Math.pow(10, token.decimals)).toString()
                    );
                  }}
                  className="ms-2"
                >
                  Max
                </Button>
              </div>
            </Form.Group>
            <Button variant="success" onClick={withdrawTokens}>
              Withdraw
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminICOPage;
