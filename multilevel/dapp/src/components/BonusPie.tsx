import { useMemo, useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { useSelector } from "react-redux";
import { IRootState } from "../app/store";
import { AppState } from "../schema/app_state";
import { PlanID } from "../enums/plan";

interface Props {
  plan_id: PlanID;
}

const BonusPie: React.FC<Props> = ({ plan_id }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const appStateRaw = useSelector((state: IRootState) => state.global.state);
  const plan = useMemo(() => {
    return AppState.fromJSON(appStateRaw).getPlan(plan_id)!;
  }, [appStateRaw, plan_id]);

  const data = [
    {
      title: `If your direct\nsubordinates join\nby your invitation,\nyou will receive\na percentage of\nthe initial payment\ncost of the stage\nparticipant`,
      value: plan.direct_referral_percentage,
      color: "#D107FB",
      label: "DIRECT BONUS",
    },
    {
      title: `If users in\nthe lower 2~6 stages\nparticipate in the stage,\nthey can get a team\nbonus according to\nthe payment amount\nof the participant's\nparticipation in\nthe first stage`,
      value: plan.active_referral_percentage,
      color: "#313136",
      label: "ACTIVE BONUS",
    },
    {
      title: `If users in\nthe lower 7~30 stages\nparticipate in the first\nstage, they can get\na team bonus according\nto the participant's\nstage participation\npayment amount.`,
      value: plan.deep_referral_percentage,
      color: "#313136",
      label: "DEEP BONUS",
    },
  ];
  return (
    <div>
      <h5 className="text-magenta1 text-xs uppercase font-semibold my-3">
        STAGE-{String.fromCharCode(65 + plan_id)} REVENUE
      </h5>
      <PieChart
        viewBoxSize={[120, 120]}
        style={{
          height: "350px",
          position: "relative",
          left: "30px",
        }}
        data={data.map((entry, index) => ({
          ...entry,
          title: "",
          key: `slice-${index}`,
        }))}
        label={({ dataEntry }) => `${dataEntry.value}%`}
        labelPosition={50} // Controls how far from the center the label appears
        labelStyle={{
          fontSize: "5px",
          fill: "#fff", // Text color
          pointerEvents: "none", // Prevent text from capturing mouse events
        }}
        // onClick={(_, index) => setSelected(index)}
        onMouseOver={(_, index) => {
          setSelected(index);
        }}
        onMouseOut={() => {
          setSelected(null);
        }}
        segmentsShift={(index) => (selected === index ? 2 : 1)} // Move segments slightly outward to create gaps
      />

      {selected !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#38383E",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 10,
            color: "#FFFFFF",
          }}
        >
          <h3>{data[selected].label}</h3>
          <p
            style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}
            className="mt-1"
          >
            {data[selected].title}
          </p>
        </div>
      )}
    </div>
  );
};

export default BonusPie;
