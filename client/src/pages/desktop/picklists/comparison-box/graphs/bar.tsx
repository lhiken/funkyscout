import { ResponsiveBar } from "@nivo/bar";
import { NivoChartTheme } from "../../../../../lib/nivo/theme";

interface PicklistBarGraphProps {
   valueObject: {
      teamKey: string;
      value: number;
   }[];
   indexByKey: string;
   keysOfSeries: string[];
   axisTicks: number;
   focusTeam: string | null; 
}

export default function PicklistBarGraph({
   valueObject,
   indexByKey,
   keysOfSeries,
   axisTicks,
   focusTeam, 
}: PicklistBarGraphProps) {

   if (valueObject.length === 0) return null;

   const maxValue = valueObject.reduce(
      (max, val) => (val.value > max.value ? val : max),
      valueObject[0]
   );

   const gridYlist: number[] = [maxValue.value];
   const gridCount = axisTicks > 0 ? axisTicks : 3;

   for (let i = 0; i < gridCount; i++) {
      gridYlist.push(gridYlist[i] - maxValue.value / gridCount);
   }

   return (
      <ResponsiveBar
         data={valueObject}
         keys={keysOfSeries}
         indexBy={indexByKey}
         margin={{
            top: 0,
            right: 0,
            bottom: 5,
            left: 22,
         }}
         maxValue={maxValue.value + maxValue.value * 0.25}
         valueScale={{ type: "linear" }}
         indexScale={{ type: "band", round: true }}
         theme={NivoChartTheme}
         colors={(d) => {
            return focusTeam && focusTeam === d.data.teamKey
               ? "var(--primary)"  // Highlight the focused team
               : "var(--primary-dark)";
         }}
         borderRadius={4}
         borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
         }}
         axisLeft={
            axisTicks > 0
               ? {
                    tickSize: 4,
                    tickPadding: 3,
                    legend: "",
                    tickValues: 4,
                 }
               : null
         }
         axisBottom={null}
         enableGridX={true}
         gridYValues={gridYlist}
         enableLabel={false}
         ariaLabel="Chart"
      />
   );
}
