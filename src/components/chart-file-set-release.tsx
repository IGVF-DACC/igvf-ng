"use client";

// node_modules
import dynamic from "next/dynamic";
import { AxisTickProps } from "@nivo/axes";
// component
import { useGlobalContext } from "@/context/global";
// lib
import { abbreviateNumber } from "@/lib/general";

// Use a dynamic import to avoid an import error for nivo modules.
// https://github.com/plouc/nivo/issues/2310#issuecomment-1552663752
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false }
);

/**
 * Primary color used in the chart.
 */
const CHART_COLOR = "#00a651";

/**
 * Custom X-axis tick that works like the default but with dark-mode support.
 * @param {string} value Value to display
 * @param {number} x X coordinate of the tick
 * @param {number} y Y coordinate of the tick
 * @param {number} rotate Rotation angle for the tick
 */
function CustomXTick({ value, x, y, rotate }: AxisTickProps<any>) {
  return (
    <g transform={`translate(${x},${y + 10}) rotate(${rotate})`}>
      <text
        x={0}
        y={0}
        textAnchor="start"
        dominantBaseline="central"
        className="fill-black dark:fill-white"
        fontSize={10}
      >
        {value}
      </text>
    </g>
  );
}

type CustomYTickProps = {
  value: number;
  y: number;
};

/**
 * Custom Y-axis tick that displays abbreviated numbers (e.g. “550K”) and works with dark mode.
 * @param {number} value Value to display
 * @param {number} y Y coordinate of the tick
 */
function CustomYTick({ value, y }: CustomYTickProps) {
  return (
    <g transform={`translate(0,${y})`}>
      <text
        x={-8}
        y={-12}
        dy={16}
        fontSize={12}
        textAnchor="end"
        className="fill-black dark:fill-white"
      >
        {abbreviateNumber(value)}
      </text>
    </g>
  );
}

type ChartFileSetReleaseProps = {
  releaseData: {
    x: string;
    y: number;
  }[];
};

/**
 * Render a chart of file-set counts by release date. This appears as a cumulative line chart.
 */
export function ChartFileSetRelease({ releaseData }: ChartFileSetReleaseProps) {
  const data = [
    {
      id: "release-counts",
      data: releaseData,
    },
  ];

  // Get the dark-mode setting from the global context for cases we can't use Tailwind CSS.
  const { darkMode } = useGlobalContext();
  const legendColor = darkMode.enabled ? "#ffffff" : "#000000";
  const pointColor = darkMode.enabled ? "#000000" : "#ffffff";

  const lastRelease = releaseData.at(-1);
  const tickValues = lastRelease && lastRelease.y < 10 ? 4 : 10;

  return (
    <div className="h-96">
      <ResponsiveLine
        data={data}
        animate={false}
        areaBaselineValue={0}
        areaOpacity={0.2}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45,
          renderTick: CustomXTick,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Cumulative Released Data Sets",
          legendOffset: -60,
          legendPosition: "middle",
          renderTick: CustomYTick,
          tickValues,
        }}
        colors={[CHART_COLOR]}
        curve="linear"
        enableArea={true}
        enableGridX={false}
        margin={{
          top: 20,
          right: 50,
          bottom: 50,
          left: 70,
        }}
        pointSize={8}
        pointColor={pointColor}
        pointBorderWidth={2}
        pointBorderColor={CHART_COLOR}
        theme={{
          grid: { line: { stroke: "gray", strokeWidth: 1 } },
          axis: { legend: { text: { fill: legendColor } } },
        }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
          stacked: true,
          min: 0,
          max: "auto",
        }}
      />
    </div>
  );
}
