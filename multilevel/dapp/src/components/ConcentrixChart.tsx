interface Props {
  stage: string;
  chartData: chartData; 
}

interface chartData {
  title: string;
  stage: string;
  level: string;
}

export const ConcentrixChart = ({ chartData }: Props) => {
  if (!chartData) {
    return <p className="text-gray2 text-sm text-center">No chart data available</p>;
  }

  return (
    <div>
      <h5 className="text-magenta1 text-xs uppercase font-semibold my-3">
        {chartData.stage}
      </h5>
      <div className="flex items-center justify-center px-5 py-3 md:w-[300px] md:h-[300px] mx-auto">
        <div className="circle-wrap">
          <div className="_20-30">
            <div className="_30"></div>
            <div className="_29"></div>
            <div className="_28"></div>
            <div className="_27"></div>
            <div className="_26"></div>
            <div className="_25"></div>
            <div className="_24"></div>
            <div className="_23"></div>
            <div className="_22"></div>
            <div className="_21"></div>
            <div className="level-30">
              <div className="level-21-30">Level 21 -30</div>
              <div className="_302">30%</div>
            </div>
          </div>
          <div className="_11-20">
            <div className="_19 c-fill"></div>
            <div className="_18 c-fill"></div>
            <div className="_17 c-fill"></div>
            <div className="_16 c-fill"></div>
            <div className="_15 c-fill"></div>
            <div className="_14 c-fill"></div>
            <div className="_13 c-fill"></div>
            <div className="_12 c-fill"></div>
            <div className="_11 c-fill"></div>
            <div className="level-20 fill-text">
              <div className="level-11-20">Level 11 -20</div>
              <div className="_20">20%</div>
            </div>
          </div>
          <div className="_1-10">
            <div className="_10 c-fill"></div>
            <div className="_9 c-fill"></div>
            <div className="_8 c-fill"></div>
            <div className="_7 c-fill"></div>
            <div className="_6 c-fill"></div>
            <div className="_5 c-fill"></div>
            <div className="_4 c-fill"></div>
            <div className="_3 c-fill"></div>
            <div className="_2 c-fill"></div>
            <div className="_1 c-fill"></div>

            <div className="level-10 fill-text">
              <div className="level-7-10">Level 7 -10</div>
              <div className="_102">10%</div>
            </div>

            <div className="center-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
