import { Helmet } from "react-helmet-async";
import RootLayout from "../layout/RootLayout";
import "./style.css";
import StakingDoughnutChart from "../../../components/withdrawal-chart/StakingDoughnutChart";
import WithdrawlBox from "../../../components/WithdrawlBox/WithdrawlBox";
import Decimal from "decimal.js";
import { useTranslation } from "react-i18next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../schema/app_state_schema";
import { IRootState } from "../../../app/store";
import { User } from "../../../schema/user";
import syncUserState from "../../../features/user/syncUserState";
import { useCallback, useEffect, useState } from "react";
import { formatBalance } from "../../../utils/helper";
import { toast } from "react-toastify";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { InterestWithdrawItnSchema } from "../../../schema/instruction/interest_withdraw_instruction";
import { appStateId, splToken, stakeProgramId } from "../../../utils/constants";
import { BN } from "@coral-xyz/anchor";
import {
  deriveUserPDA,
  getAppState,
  getClaimInstruction,
} from "../../../utils/web3";
import { InstructionID } from "../../../interface/InstructionId";
import { AmountInstructionSchema } from "../../../schema/instruction/amount_instruction";
import { setAppState } from "../../../features/globalData/globalDataSlice";
import PopUpModal, {
  PopUpProps,
} from "../../../components/PopUpModal/PopUpModal";

const Withdrawal = () => {
  const { t } = useTranslation();
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();

  const [, setTxLoading] = useState(false);
  const dispatch = useDispatch();
  const appState = useSelector(
    (state: IRootState) => new AppState(state.global.state)
  );
  const [showModal, setShowModal] = useState(false);

  const [modalDate, setModalDate] = useState<PopUpProps>({
    type: "success",
    title: "Message from",
    message: "this is details text",
    onClose: () => {},
    show: false,
  });
  const user = useSelector((state: IRootState) => new User(state.user.data));

  const fetchAppState = useCallback(async () => {
    try {
      const deserializedData = await getAppState(connection);
      dispatch(setAppState(deserializedData));
      // console.log(data);
    } catch (error: unknown) {
      console.log(error);
    }
  }, [connection, dispatch]);

  useEffect(() => {
    fetchAppState();
  }, [fetchAppState]);

  const claim = async () => {
    try {
      if (!publicKey) {
        return;
      }
      setTxLoading(true);

      const claim_instruction = getClaimInstruction(publicKey);
      const tx = new Transaction();
      tx.add(claim_instruction);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      // tx.recentBlockhash = blockhash;
      // tx.feePayer = publicKey;
      // const transaction = await signTransaction!(tx);
      // const res = await connection.sendRawTransaction(transaction.serialize());
      // console.log(res);
      const signature = await sendTransaction(tx, connection, {
        minContextSlot,
      });
      console.log(signature);
      const result = await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          minContextSlot,
          signature,
        },
        "confirmed"
      );
      console.log(result);
      setModalDate({
        ...modalDate,
        title: "Claim Succefull",
        // message: "Succefully claimed",
        type: "success",
      });
      setShowModal(true);
      toast.success("Transaction confirmed");

      syncUserState(connection, publicKey, dispatch);
    } catch (error: any) {
      console.log("Enroll error ", error);
      setModalDate({
        ...modalDate,
        title: "Claim Failed",
        message: error.toString(),
        type: "error",
      });
      setShowModal(true);
    } finally {
      setTxLoading(false);
    }
  };
  const intiateWithdraw = async (instruction_id: number, amount: Decimal) => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }

      if (amount.eq(0)) {
        toast.error("Amount should be grater than 0");
        return;
      }

      setTxLoading(true);
      let instruction_data = Buffer.alloc(200);

      if (instruction_id === InstructionID.INIT_WITHDRAW_PRINCIPAL) {
        AmountInstructionSchema.encode(
          {
            amount: new BN(
              new Decimal(amount)
                .mul(Math.pow(10, splToken.decimals))
                .toNumber()
            ),
          },
          instruction_data
        );

        instruction_data = instruction_data.subarray(
          0,
          AmountInstructionSchema.getSpan(instruction_data)
        );
      } else if (instruction_id === InstructionID.INIT_WITHDRAW_INTEREST) {
        InterestWithdrawItnSchema.encode(
          {
            amount: new BN(
              new Decimal(amount)
                .mul(Math.pow(10, splToken.decimals))
                .toNumber()
            ),
            //99.5 amount as base for complete interest withdraw request
            is_complete_withdrawl: amount
              .div(user.availableInterest(appState))
              .mul(100)
              .gte(99.5),
          },
          instruction_data
        );

        instruction_data = instruction_data.subarray(
          0,
          InterestWithdrawItnSchema.getSpan(instruction_data)
        );
      } else {
        throw "Invalid instruction id ";
      }

      const instructionIdBuffer = new Uint8Array([instruction_id]);

      //TODO : verify user ata exists and has balance
      const intiate_withdraw_instruction = new TransactionInstruction({
        programId: new PublicKey(stakeProgramId),
        keys: [
          {
            //user account
            pubkey: publicKey!,
            isWritable: true,
            isSigner: true,
          },
          {
            //user data account (pda)
            pubkey: deriveUserPDA(publicKey!),
            isWritable: true,
            isSigner: false,
          },
          {
            //app state
            pubkey: appStateId,
            isWritable: true,
            isSigner: false,
          },
          {
            //system program
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.concat([instructionIdBuffer, instruction_data]),
      });

      const tx = new Transaction();
      tx.add(intiate_withdraw_instruction);
      const interestWithdrawl =
        instruction_id === InstructionID.INIT_WITHDRAW_INTEREST;
      if (interestWithdrawl) {
        const claim_instruction = getClaimInstruction(publicKey);
        tx.add(claim_instruction);
      }

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(tx, connection, {
        minContextSlot,
      });
      console.log(signature);
      const result = await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          minContextSlot,
          signature,
        },
        "confirmed"
      );
      console.log(result);
      setModalDate({
        ...modalDate,
        title: interestWithdrawl
          ? `Withdrawl Successful`
          : `Withdrawl Initiated`,
        type: "success",
      });
      setShowModal(true);
      syncUserState(connection, publicKey, dispatch);
    } catch (error: any) {
      console.log("Enroll error ", error);
      setModalDate({
        ...modalDate,
        title: "Withdrawl Failed",
        message: error.toString(),
        type: "error",
      });
      setShowModal(true);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    syncUserState(connection, publicKey, dispatch);
  }, [publicKey, connected, connection, dispatch]);

  return (
    <RootLayout>
      <Helmet>
        <title>Withdrawal Page</title>
        <meta
          name="description"
          content="Welcome to the Presale page of my application."
        />
      </Helmet>
      <div className="wrapper withdrawal-bg">
        <section className="withdrawal-banner-sec">
          <div className="container" style={{ maxWidth: "1100px" }}>
            <div className="withdrawal-banner-wrap">
              <div className="row">
                <div className="col-md-12">
                  <div className="withdrawal-banner-box">
                    <div className="d-flex withdrawal-box-gap">
                      <div className="withdrawal-box">
                        <h1 className="hero-title">Staking</h1>
                        <div className="dtRab-box">
                          <h2>
                            {formatBalance(
                              user.principal_in_stake.add(
                                user.availableInterest(appState)
                              )
                            )}
                          </h2>
                          <p>{splToken.symbol}</p>
                        </div>

                        <ul className="withdrawal-list">
                          <li className="withdrawal-list-item">
                            <h3>{t("withdrawal.principalInStake")}</h3>
                            <p className="fw-bold">
                              {formatBalance(user.principal_in_stake)}
                            </p>
                          </li>
                          <li className="withdrawal-list-item">
                            <h3>{t("withdrawal.accumulatedInterest")}</h3>
                            <p className="fw-bold">
                              {formatBalance(user.availableInterest(appState))}
                            </p>
                          </li>
                          <li className="withdrawal-list-item">
                            <h3>{t("withdrawal.lockedAmount")}</h3>
                            <p className="fw-bold">
                              {formatBalance(
                                user.withdraw_request.is_under_progress
                                  ? user.withdraw_request.amount
                                  : new Decimal(0)
                              )}
                            </p>
                          </li>
                          <li className="withdrawal-list-item">
                            <h3>{t("withdrawal.withdrawn_interest")}</h3>
                            <p className="fw-bold">
                              {formatBalance(user.withdrawn_interest)}
                            </p>
                          </li>
                        </ul>
                      </div>
                      <div className="chart-wrap">
                        <StakingDoughnutChart
                          stakedAmount={user.principal_in_stake}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="unstaking-sec">
          <div className="container" style={{ maxWidth: "1100px" }}>
            <div className="unstaking-grid">
              <WithdrawlBox
                availableQuantity={user.principal_in_stake}
                buttonLabel={t("withdrawal.unstake")}
                type="unstaking"
                color={"purple-1"}
                has_amount_selection={false}
                is_withdraw_under_progress={
                  user.withdraw_request.is_under_progress
                }
                lockUpTime={appState.config.lock_time_principal.toNumber()}
                request_time_s={user.withdraw_request.request_time_ms.toNumber()}
                hasLockUp={
                  user.withdraw_request.is_under_progress &&
                  user.withdraw_request.is_principal &&
                  user.principal_in_stake.eq(0)
                }
                onClaimClick={claim}
                onWithdrawClick={async () => {
                  await intiateWithdraw(
                    InstructionID.INIT_WITHDRAW_PRINCIPAL,
                    user.principal_in_stake.div(Math.pow(10, splToken.decimals))
                  );
                }}
                title={t("withdrawal.allUnstakingTitle")}
                key={1}
              />
              <WithdrawlBox
                availableQuantity={user.principal_in_stake}
                is_withdraw_under_progress={
                  user.withdraw_request.is_under_progress
                }
                buttonLabel={t("withdrawal.unstake")}
                type="partial"
                color={"purple-1"}
                has_amount_selection={true}
                lockUpTime={appState.config.lock_time_principal.toNumber()}
                request_time_s={user.withdraw_request.request_time_ms.toNumber()}
                hasLockUp={
                  user.withdraw_request.is_under_progress &&
                  user.withdraw_request.is_principal &&
                  user.principal_in_stake.gt(0)
                }
                onClaimClick={claim}
                onWithdrawClick={async (amount) => {
                  await intiateWithdraw(
                    InstructionID.INIT_WITHDRAW_PRINCIPAL,
                    amount
                  );
                }}
                title={t("withdrawal.partialUnstakingTitle")}
                key={2}
              />
              <WithdrawlBox
                availableQuantity={user.availableInterest(appState)}
                is_withdraw_under_progress={
                  user.withdraw_request.is_under_progress
                }
                buttonLabel={t("withdrawal.withdraw")}
                type="interest"
                color={"purple-1"}
                hasLockUp={
                  user.withdraw_request.is_under_progress &&
                  !user.withdraw_request.is_principal
                }
                has_amount_selection={true}
                lockUpTime={appState.config.lock_time_interest.toNumber()}
                request_time_s={user.withdraw_request.request_time_ms.toNumber()}
                onClaimClick={claim}
                onWithdrawClick={async (amount) => {
                  await intiateWithdraw(
                    InstructionID.INIT_WITHDRAW_INTEREST,
                    amount
                  );
                }}
                title={t("withdrawal.interestWithdrawalTitle")}
                key={3}
              />
            </div>
          </div>
        </section>
      </div>
      <PopUpModal
        {...modalDate}
        onClose={() => {
          setShowModal(false);
        }}
        show={showModal}
      />
    </RootLayout>
  );
};

export default Withdrawal;
