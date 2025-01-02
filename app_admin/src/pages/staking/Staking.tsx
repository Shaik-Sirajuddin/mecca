import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  AppState,
  AppStateSchema,
} from "../../schema/staking/app_state_schema";
import { PublicKey } from "@solana/web3.js";
import {
  appStateId,
  appTokenStoreAtaId,
  appTokenStoreOwnerId,
  baseUrl,
} from "./utils/constants";
import { IStats } from "../../interface/IStats";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { token } from "../../utils/constants";
import {
  deci,
  formatBalance,
  updateIfValid,
  updateIfValidNoDecimal,
} from "../../utils/utils";
import Decimal from "decimal.js";
import toast from "react-hot-toast";
import { Config } from "../../schema/staking/config";
import {
  getUpdateConfigInstruction,
  getUpdateOwnerTransaction,
  getWithdrawTokensTransaction,
  parsePubKey,
} from "./utils/web3";
import { getSPlTokenBalance } from "../../utils/web3";

const Staking: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [appState, setAppState] = useState(AppState.dummy());
  const [stats, setStats] = useState<IStats>({
    day: "0",
    standy: "0",
  });

  const [ownerAddress, setOwnerAddress] = useState("");
  const [lockTimeInterest, setLockTimeInterest] = useState("0");
  const [lockTimePrincipal, setLockTimePrincipal] = useState("0");
  const [minDepositAmount, setMinDepositAmount] = useState("0");
  const [maxDepositAmount, setMaxDepositAmount] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [holderBalance, setHolderBalance] = useState(new Decimal(0));

  const fetchAppState = useCallback(async () => {
    try {
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(appStateId)
      );
      if (!accountInfo || !accountInfo?.data) {
        console.log("no account info");
        return;
      }
      console.log(accountInfo.data);
      const deserializedData = AppStateSchema.decode(accountInfo?.data);
      const app_state = new AppState(deserializedData);
      setAppState(app_state);
      setMinDepositAmount(
        app_state.config.min_deposit_user
          .div(Math.pow(10, token.decimals))
          .toString()
      );
      setMaxDepositAmount(
        app_state.config.max_deposit_user
          .div(Math.pow(10, token.decimals))
          .toString()
      );
      setLockTimeInterest(app_state.config.lock_time_interest.toString());
      setLockTimePrincipal(app_state.config.lock_time_principal.toString());

      const holder_balance = await getSPlTokenBalance(
        connection,
        appTokenStoreAtaId
      );
      setHolderBalance(holder_balance);
      setOwnerAddress(app_state.authority.toString());
      // console.log(data);
    } catch (error: unknown) {
      console.log(error);
    }
  }, [connection]);

  const syncStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/public/stats`);
      const data = await response.json();
      setStats(data.body.interest);
    } catch (error) {
      console.log(error);
    }
  };

  const updateConfig = async () => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }
      if (deci(lockTimePrincipal) == null) {
        toast.error("Invalid Lock time");
        return;
      }
      if (deci(lockTimeInterest) == null) {
        toast.error("Invalid lock time");
        return;
      }

      let parsedMinDeposit = deci(minDepositAmount);
      let parsedMaxDeposit = deci(maxDepositAmount);

      if (!parsedMinDeposit) {
        toast.error("Invalid min amount");
        return;
      }
      if (!parsedMaxDeposit) {
        toast.error("Invalid max amount");
        return;
      }
      parsedMinDeposit = new Decimal(
        parsedMinDeposit.mul(Math.pow(10, token.decimals)).toFixed(0)
      );
      parsedMaxDeposit = new Decimal(
        parsedMaxDeposit.mul(Math.pow(10, token.decimals)).toFixed(0)
      );

      const _config = new Config({
        lock_time_interest: new Decimal(lockTimeInterest),
        lock_time_principal: new Decimal(lockTimePrincipal),
        min_deposit_user: parsedMinDeposit,
        max_deposit_user: parsedMaxDeposit,
      });

      const tx = getUpdateConfigInstruction(publicKey, _config);
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success("Config Updated");
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
      amount = new Decimal(amount.mul(Math.pow(10, token.decimals)).toFixed(0));
      if (amount.gt(holderBalance)) {
        toast.error("Amount exceeds tokens in program");
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
      //   delayedUpdate(syncData);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  useEffect(() => {
    fetchAppState();
    syncStats();
  }, [fetchAppState]);

  return (
    <div>
      <Container className="py-4">
        <h1 className="mb-4 text-center">Staking Admin Panel</h1>

        {/* Staking Contract State Section */}
        <Row className="mb-4">
          <h2 className="mb-4">Staking Contract State</h2>
          <Col>
            <p>
              <strong>Deposit APY:</strong>{" "}
              <p className="fs-3">
                {appState.cur_interest_rate / Math.pow(10, token.decimals) || 0}
                <span className="fs-5">%</span>
              </p>
            </p>
          </Col>

          <Col>
            <p>
              <strong>Current Users:</strong>{" "}
              <p className="fs-3">
                {appState.user_count || 0}
                <span className="fs-5"></span>
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Total Registered:</strong>{" "}
              <p className="fs-3">
                {appState.total_registered}
                <span className="fs-5"> </span>
              </p>
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>
              <strong>Staking Pool:</strong>{" "}
              <p className="fs-3">
                {formatBalance(appState.staked_amount)}
                <span className="fs-5"> MECCA</span>
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Interest Paid Today:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(stats.day))}
                <span className="fs-5"> MECCA</span>
              </p>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Standby Interest:</strong>{" "}
              <p className="fs-3">
                {formatBalance(new Decimal(stats.standy))}
                <span className="fs-5"> MECCA</span>
              </p>
            </p>
          </Col>
        </Row>
      </Container>
      <Row>
        <Form.Group controlId="depositAddress" className="mb-3">
          <Form.Label>
            <strong> Token Holder </strong>
          </Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={appTokenStoreOwnerId.toString() || "N/A"}
          />
        </Form.Group>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>Staking Config</h2>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="lockTimePrincipal" className="mb-3">
                  <Form.Label>Lock Time Seconds (Principal)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter lock time for principal in seconds"
                    value={lockTimePrincipal}
                    onChange={(e) =>
                      updateIfValidNoDecimal(
                        e.target.value.toString(),
                        setLockTimePrincipal
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                {/* Lock Time Interest */}
                <Form.Group controlId="lockTimeInterest" className="mb-3">
                  <Form.Label>Lock Time Seconds (Interest)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter lock time for interest in seconds"
                    value={lockTimeInterest}
                    onChange={(e) =>
                      updateIfValidNoDecimal(
                        e.target.value.toString(),
                        setLockTimeInterest
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                {/* Minimum Deposit per User */}
                <Form.Group controlId="minDepositUser" className="mb-3">
                  <Form.Label>Minimum Deposit (per User)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter minimum deposit per user"
                    value={minDepositAmount}
                    onChange={(e) =>
                      updateIfValid(
                        e.target.value.toString(),
                        setMinDepositAmount
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                {/* Maximum Deposit per User */}
                <Form.Group controlId="maxDepositUser" className="mb-3">
                  <Form.Label>Maximum Deposit (per User)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter maximum deposit per user"
                    value={maxDepositAmount}
                    onChange={(e) =>
                      updateIfValid(
                        e.target.value.toString(),
                        setMaxDepositAmount
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Lock Time Principal */}

            {/* Update Config Button */}
            <Button variant="primary" onClick={updateConfig}>
              Update Config
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
                      holderBalance.div(Math.pow(10, token.decimals)).toString()
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
    </div>
  );
};

export default Staking;
