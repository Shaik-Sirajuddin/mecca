import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./style.css";
import { formatBalance } from "../../utils/helper";
import Decimal from "decimal.js";
import { splToken } from "../../utils/constants";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StakingDoughnutChartProps {
  stakedAmount: Decimal;
}
const StakingDoughnutChart: React.FC<StakingDoughnutChartProps> = ({
  stakedAmount,
}) => {
  const maxStakeAmount = new Decimal(1_000_000_000).mul(
    Math.pow(10, splToken.decimals)
  );
  const usedPercentage = stakedAmount.div(maxStakeAmount).mul(100);

  const data = {
    datasets: [
      {
        data: [
          stakedAmount.div(Math.pow(10, splToken.decimals)).toNumber(),
          maxStakeAmount
            .sub(stakedAmount)
            .div(Math.pow(10, splToken.decimals))
            .toNumber(),
        ],
        backgroundColor: ["#3c731e", "#d3d3d3"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "65%",
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
  };
  return (
    <div className="doughnut-cotainer">
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <p
          className="total-value"
          style={{
            margin: 0,
            fontSize: "38px",
            fontWeight: "bold",
            color: "#9807b5",
          }}
        >
          {formatBalance(stakedAmount)}
        </p>
        <p
          className="value-percentage"
          style={{ margin: 0, fontSize: "20px", color: "#fff" }}
        >
          ({usedPercentage.toFixed()}%)
        </p>
        <p
          className="value-max"
          style={{ margin: 0, fontSize: "22px", color: "#fff" }}
        >
          Maximum 1 Billion
        </p>
      </div>
    </div>
  );
};

export default StakingDoughnutChart;
