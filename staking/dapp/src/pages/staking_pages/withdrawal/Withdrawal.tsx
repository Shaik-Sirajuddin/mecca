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
import { useEffect, useState } from "react";
import { formatBalance } from "../../../utils/helper";
import { toast } from "react-toastify";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { InterestWithdrawItnSchema } from "../../../schema/instruction/interest_withdraw_instruction";
import {
  appStateId,
  appTokenStoreAtaId,
  appTokenStoreOwnerId,
  splToken,
  stakeProgramId,
  tokenMint,
  tokenProgramId,
} from "../../../utils/constants";
import { BN } from "@coral-xyz/anchor";
import { deriveUserPDA, getATA } from "../../../utils/web3";
import { InstructionID } from "../../../interface/InstructionId";
import { AmountInstructionSchema } from "../../../schema/instruction/amount_instruction";

const Withdrawal = () => {
  const { t } = useTranslation();
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } =
    useWallet();
  const [txLoading, setTxLoading] = useState(false);
  const dispatch = useDispatch();
  const appState = useSelector(
    (state: IRootState) => new AppState(state.global.state)
  );
  const user = useSelector((state: IRootState) => new User(state.user.data));

  const claim = async () => {
    try {
      if (!publicKey) {
        return;
      }
      const instruction_id = InstructionID.WITHDRAW;
      setTxLoading(true);
      const instructionIdBuffer = new Uint8Array([instruction_id]);

      //TODO : verify user ata exists and has balance
      const enroll_instruction = new TransactionInstruction({
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
            pubkey: getATA(publicKey),
            isWritable: true,
            isSigner: false,
          },
          {
            pubkey: appTokenStoreAtaId,
            isWritable: true,
            isSigner: false,
          },
          {
            pubkey: appTokenStoreOwnerId,
            isWritable: false,
            isSigner: false,
          },
          {
            pubkey: tokenMint,
            isWritable: false,
            isSigner: false,
          },
          {
            pubkey: tokenProgramId,
            isWritable: false,
            isSigner: false,
          },
          {
            //system program
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.concat([instructionIdBuffer]),
      });

      const tx = new Transaction();
      tx.add(enroll_instruction);

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
      toast.success("Transaction confirmed");
      syncUserState(connection, publicKey, dispatch);
    } catch (error: unknown) {
      console.log("Enroll error ", error);
      toast.error(error.toString());
    } finally {
      setTxLoading(false);
    }
  };
  const intiateWithdraw = async (instruction_id: number, amount: Decimal) => {
    try {
      setTxLoading(true);
      let instruction_data = Buffer.alloc(200);

      if (instruction_id == InstructionID.INIT_WITHDRAW_PRINCIPAL) {
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
      } else if (instruction_id == InstructionID.INIT_WITHDRAW_INTEREST) {
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
      const enroll_instruction = new TransactionInstruction({
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
      tx.add(enroll_instruction);

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
      toast.success("Transaction confirmed");
      syncUserState(connection, publicKey, dispatch);
    } catch (error: unknown) {
      console.log("Enroll error ", error);
      toast.error(error.toString());
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
          <div className="container">
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
                          <p>MECCA</p>
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
          <div className="container">
            <div className="unstaking-grid">
              <WithdrawlBox
                availableQuantity={user.principal_in_stake}
                buttonLabel={t("withdrawal.unstake")}
                type="unstaking"
                color={"purple-1"}
                has_amount_selection={false}
                is_withdraw_under_progress={user.withdraw_request.is_under_progress}
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
                is_withdraw_under_progress={user.withdraw_request.is_under_progress}
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
                is_withdraw_under_progress={user.withdraw_request.is_under_progress}
                buttonLabel={t("withdrawal.unstake")}
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
    </RootLayout>
  );
};

export default Withdrawal;
