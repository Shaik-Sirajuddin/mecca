import { useEffect, useState } from "react";
import { formatBalance, formatNum, updateIfValid } from "../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../app/store";
import { BN } from "@coral-xyz/anchor";
import {
  appStateId,
  appTokenStoreAtaId,
  appTokenStoreOwnerId,
  splToken,
  stakeProgramId,
  tokenMint,
  tokenProgramId,
} from "../../utils/constants";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./DepositBox.css";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { deriveUserPDA, getATA } from "../../utils/web3";
import { AmountInstructionSchema } from "../../schema/instruction/amount_instruction";
import Decimal from "decimal.js";
import { User } from "../../schema/user";
import syncUserState from "../../features/user/syncUserState";
import { AppState } from "../../schema/app_state_schema";
import { Config } from "../../schema/config";

interface Props {
  onStake: () => void;
}
const DepositBox = ({ onStake }: Props) => {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const dispatch = useDispatch();
  const interestRate = useSelector(
    (state: IRootState) => state.global.state.cur_interest_rate
  );
  const config: Config = useSelector(
    (state: IRootState) => new AppState(state.global.state).config
  );

  const [depositAmount, setDepositAmount] = useState("1000");
  const [expectedInterest, setExcpectedInterest] = useState(0);
  const [txLoading, setTxLoading] = useState(false);


  const user = useSelector((state: IRootState) => new User(state.user.data));
  const userPDAExists = useSelector(
    (state: IRootState) => state.user.dataAccExists
  );

  const tokenBalance = useSelector(
    (state: IRootState) => new Decimal(state.user.tokenBalance)
  );

  useEffect(() => {
    setExcpectedInterest(
      (parseFloat(depositAmount) * interestRate) /
        Math.pow(10, splToken.decimals + 2)
    );
  }, [depositAmount, interestRate]);

  const enrollStaking = async (instruction_id: number) => {
    try {
      if (txLoading) return;
      const _purchaseAmount = new Decimal(depositAmount).mul(
        Math.pow(10, splToken.decimals)
      );
      if (_purchaseAmount.lt(config.min_deposit_user)) {
        toast.info(
          `Amount is less than minimum ${formatBalance(
            config.min_deposit_user
          )}`
        );
        return;
      }
      if (
        _purchaseAmount.add(user.principal_in_stake).gt(config.max_deposit_user)
      ) {
        console.log(
          "max deposit",
          config.max_deposit_user.toString(),
          _purchaseAmount.toString(),
          user.principal_in_stake.toString()
        );
        toast.info(`Amount exceeds max deposit possible`);
        return;
      }
      setTxLoading(true);
      let instruction_data = Buffer.alloc(200);

      AmountInstructionSchema.encode(
        {
          amount: new BN(
            new Decimal(depositAmount)
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
            //app token account (pda)
            pubkey: appTokenStoreAtaId,
            isWritable: true,
            isSigner: false,
          },
          {
            //app token owner pda
            pubkey: appTokenStoreOwnerId,
            isSigner: false,
            isWritable: false,
          },
          {
            //user token account
            pubkey: getATA(publicKey!),
            isSigner: false,
            isWritable: true,
          },
          {
            //mint account
            pubkey: new PublicKey(tokenMint),
            isSigner: false,
            isWritable: false,
          },
          {
            //token program
            pubkey: tokenProgramId,
            isSigner: false,
            isWritable: false,
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

      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          minContextSlot,
          signature,
        },
        "confirmed"
      );

      toast.success("Transaction confirmed");
      syncUserState(connection, publicKey, dispatch);
      onStake();
    } catch (error: any) {
      console.log("Enroll error ", error);
      toast.error(error.toString());
    } finally {
      setTxLoading(false);
    }
  };

  const handleStakeClick = () => {
    try {
      if (!publicKey) {
        //show toast
        toast.info("Please connect your wallet");
        return;
      }
      if (
        tokenBalance.lessThan(
          new Decimal(depositAmount).mul(Math.pow(10, splToken.decimals))
        )
      ) {
        toast.info("Insufficient token balance");
        return;
      }
      if (tokenBalance.lte(0)) {
        toast.info("Enter valid amount");
        return;
      }
      enrollStaking(userPDAExists ? 2 : 1);
    } catch (error: any) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  const maxClick = () => {
    setDepositAmount(tokenBalance.div(10 ** splToken.decimals).toString());
  };

  useEffect(() => {
    syncUserState(connection, publicKey, dispatch);
  }, [publicKey, connected, connection, dispatch]);

  return (
    <div className="my-wallet-box bg-white-2 mb-3">
      <h2 className="text-24 text-green-1 font-medium mb-4">Deposit</h2>
      <div className="flex justify-content-center">
        <WalletMultiButton
          style={{
            width: "100%",
            background: "rgb(152 7 181 / 100%)",
          }}
        />
      </div>
      <ul>
        <li className="mb-3 mt-3">
          <div className="wallet-staking bg-white rounded-3 p-3 wallet-box-textbox">
            <div className="flex wallet-staking-box  gap-2">
              <h4 className="text-14 text-gray-1">MECCA</h4>

              <input
                style={{
                  textAlign: "right",
                  border: "0",
                  // border: "1px solid",
                  padding: "4px",
                  // borderRadius: "3px",
                  width: "100%",
                }}
                placeholder="100"
                type="text"
                value={depositAmount}
                onChange={(event) => {
                  updateIfValid(event.target.value, setDepositAmount);
                }}
                className="text-18 text-green-1 wallet-funds font-bold"
              />
              <button
                className="bt-primary ml-auto max-btn bg-purple-1 text-white px-2 rounded-1 text-14 but-primary"
                onClick={maxClick}
              >
                Max
              </button>
            </div>
          </div>
        </li>
        <li>
          <div className="wallet-staking bg-white rounded-3 p-3 wallet-box-textbox">
            <div className="flex align-items-center gap-2 mb-3">
              <h4 className="text-16 text-gray-1">Annual expected interest</h4>
              {/* <img src="/images/question-mark.png" /> */}
            </div>

            <div className="w-100 wallet-staking-box flex align-items-center gap-2 justify-content-end">
              <h3 className="text-22 text-green-1 font-bold">
                {formatNum(expectedInterest.toString())}
              </h3>
              <p className="text-14 text-gray-1">MECCA</p>
            </div>
          </div>
        </li>
      </ul>
      <button
        id="connect-wallet"
        onClick={handleStakeClick}
        disabled={!connected}
        className="mt-3 connect-wallet bg-purple-1 text-white w-100 py-3 text-24 font-bold rounded-3 but-primary"
      >
        <div
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            display: "flex",
          }}
        >
          <div
            style={{
              display: txLoading ? "inline-block" : "none",
              width: "24px",
              height: "24px",
            }}
            id="loader"
            className="btn-sky text-xl"
          />
          Stake
        </div>
      </button>
    </div>
  );
};

export default DepositBox;
