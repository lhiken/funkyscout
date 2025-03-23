import { ResponsiveLine } from "@nivo/line";
import { NivoChartTheme } from "../../../../../lib/nivo/theme";

interface PicklistLineGraphProps {
   valueArray: number[];
   axisTicks: number;
}

export default function PicklistLineGraph({
   valueArray,
   axisTicks,
}: PicklistLineGraphProps) {
   console.log(valueArray);
   if (valueArray.length === 0) return <div>No data</div>;

   const valueObject = [{
      id: "Match Values",
      data: valueArray.map((value, index) => ({
         x: `Match #${index + 1}`,
         y: value,
      })),
   }];

   const maxValue = valueArray.reduce(
      (max, val) => (val > max ? val : max),
      valueArray[0],
   );

   const gridYlist: number[] = [maxValue];
   const gridCount = axisTicks > 0 ? axisTicks : 3;

   for (let i = 0; i < gridCount; i++) {
      gridYlist.push(gridYlist[i] - maxValue / gridCount);
   }

   return (
      <>
         <ResponsiveLine
            data={valueObject}
            margin={{
               top: 0,
               right: 0,
               bottom: 5,
               left: 22,
            }}
            yScale={{ type: "linear", max: maxValue + maxValue * 0.25 }}
            xScale={{ type: "point" }}
            theme={NivoChartTheme}
            colors={(d) => {
               return d.id === "Match Values"
                  ? "var(--primary)"
                  : "var(--primary-dark)";
            }}
            axisLeft={axisTicks > 0
               ? {
                  tickSize: 4,
                  tickPadding: 3,
                  legend: "",
                  tickValues: 4,
               }
               : null}
            axisBottom={null}
            enableGridX={true}
            gridYValues={gridYlist}
            curve="catmullRom"
         />
      </>
   );
}
