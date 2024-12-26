import React, { useState } from "react";
import "./style.css";
import Decimal from "decimal.js";

interface props {
  soldAmount: Decimal;
  amountInSale: Decimal;
}
const TokenProgress: React.FC<props> = (props: props) => {
  const soldPercentage = props.soldAmount
    .div(props.amountInSale)
    .mul(100)
    .toFixed(2);

  return (
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          id="slider"
          type="range"
          min={0}
          max={100}
          readOnly={true}
          value={soldPercentage}
          className="single-thumb"
          style={{
            width: "100%",
            height: "10px",
            background: `linear-gradient(to right, #922AAF ${soldPercentage}%, #f0f0f0 ${soldPercentage}%)`, // Dynamic fill
            borderRadius: "50px",
            outline: "none",
          }}
        />
      </div>

      <div>
        <p className="token-sold-text">
          Tokens Sold: {props.soldAmount.toLocaleString()} /{" "}
          {props.amountInSale.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TokenProgress;
