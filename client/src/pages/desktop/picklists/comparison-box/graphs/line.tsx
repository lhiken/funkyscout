import { ResponsiveLine } from "@nivo/line";
import { NivoChartTheme } from "../../../../../lib/nivo/theme";
import { parseMatchKey } from "../../../../../utils/logic/app";

interface PicklistLineGraphProps {
   valueArray: {
      matchKey: string;
      value: number;
   }[];
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
      data: valueArray.map((value) => ({
         x: parseMatchKey(value.matchKey, "number"),
         y: value.value, // Ensures zero values show up
      })),
   }];

   const maxValue = valueArray.reduce(
      (max, val) => (val.value > max.value ? val : max),
      valueArray[0],
   );

   const gridYlist: number[] = [maxValue.value];
   const gridCount = axisTicks > 0 ? axisTicks : 3;

   for (let i = 0; i < gridCount; i++) {
      gridYlist.push(gridYlist[i] - maxValue.value / gridCount);
   }

   return (
      <>
         <ResponsiveLine
            data={valueObject}
            margin={{
               top: 0,
               right: 12,
               bottom: 20,
               left: 28,
            }}
            yScale={{
               type: "linear",
               min: 0,
               max: maxValue.value + maxValue.value * 0.25,
            }}
            xScale={{ type: "point" }}
            theme={NivoChartTheme}
            colors={(d) => {
               return d.id === "Match Values"
                  ? "var(--primary)"
                  : "var(--primary-dark)";
            }}
            enableArea={true}
            areaOpacity={0.1}
            defs={[
               {
                  id: "gradientA",
                  type: "linearGradient",
                  colors: [
                     { offset: 0, color: "var(--primary)" },
                     { offset: 100, color: "#000010" },
                  ],
               },
            ]}
            fill={[
               { match: "*", id: "gradientA" },
            ]}
            axisLeft={axisTicks > 0
               ? {
                  tickSize: 4,
                  tickPadding: 3,
                  legend: "",
                  tickValues: 6,
               }
               : null}
            axisBottom={axisTicks > 0
               ? {
                  tickSize: 4,
                  tickPadding: 3,
                  legend: "",
               }
               : null}
            enableGridX={true}
            gridYValues={gridYlist}
            curve="catmullRom"
            isInteractive={true}
            enablePointLabel={true}
            legends={[
               {
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                     {
                        on: "hover",
                        style: {
                           itemBackground: "rgba(0, 0, 0, .03)",
                           itemOpacity: 1,
                        },
                     },
                  ],
               },
            ]}
         />
      </>
   );
}
