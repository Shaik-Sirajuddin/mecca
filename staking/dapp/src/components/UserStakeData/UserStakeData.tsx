import { useSelector } from "react-redux";
import { IRootState } from "../../app/store";
import { User } from "../../schema/user";
import { formatBalance } from "../../utils/helper";
import { AppState } from "../../schema/app_state_schema";
import { splToken } from "../../utils/constants";

const UserStakeData = () => {
  const appState = useSelector(
    (state: IRootState) => new AppState(state.global.state)
  );
  const user = useSelector((state: IRootState) => new User(state.user.data));

  return (
    <div className="my-wallet-box bg-wallet mb-3">
      <h2 className="text-24 text-white font-bold mb-4">My wallet</h2>
      <ul>
        <li className="mb-3">
          <div className="wallet-staking bg-white rounded-3 p-3 wallet-box-textbox">
            <h4 className="text-16 text-gray-1 mb-3 fw-bold">My Staking</h4>
            <div className="w-100 flex wallet-staking-box justify-content-between">
              <h3 className="text-22 text-green-1 font-bold fw-bolder">
                {formatBalance(user.principal_in_stake)}
              </h3>
              <p className="text-14 text-gray-1">{splToken.symbol}</p>
            </div>
          </div>
        </li>
        <li
          style={{
            marginTop: "24px",
          }}
        >
          <div className="wallet-staking bg-white rounded-3 p-3 wallet-box-textbox">
            <h4 className="text-16 text-gray-1 mb-3 fw-bold">Interest held</h4>
            <div
              className="w-100 flex wallet-staking-box justify-content-between fw-bolder"
              style={{
                marginTop: "24px",
              }}
            >
              <h3 className="text-22 text-green-1 font-bold">
                {" "}
                {formatBalance(user.availableInterest(appState))}
              </h3>
              <p className="text-14 text-gray-1">{splToken.symbol}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default UserStakeData;
