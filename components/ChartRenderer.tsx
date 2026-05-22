// ChartRenderer.tsx
import React, { useMemo } from "react";

/* =========================================================
   TYPES
========================================================= */

type ThemeMode = "light" | "dark";

type BaseChartProps = {
  className?: string;
  theme?: ThemeMode;
};

export type LineChartData = {
  type: "line";
  title?: string;
  labels: string[];
  series: {
    name: string;
    values: number[];
  }[];
};

export type BarChartData = {
  type: "bar";
  title?: string;
  labels: string[];
  series: {
    name: string;
    values: number[];
  }[];
};

export type ClusteredBarChartData = {
  type: "clustered-bar";
  title?: string;
  labels: string[];
  series: {
    name: string;
    values: number[];
  }[];
};

export type PieChartData = {
  type: "pie";
  title?: string;
  charts: {
    title?: string;
    segments: {
      label: string;
      value: number;
    }[];
  }[];
};

export type TableChartData = {
  type: "table";
  title?: string;
  columns: string[];
  rows: (string | number)[][];
};

export type ChartData =
  | LineChartData
  | BarChartData
  | ClusteredBarChartData
  | PieChartData
  | TableChartData;

export type ChartRendererProps = BaseChartProps & {
  data: ChartData;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ChartRenderer({
  data,
  className,
  theme,
}: ChartRendererProps) {
  const resolvedTheme =
    theme ??
    (typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

const colors = useMemo(() => {
  // Google-style palette
  const palette = [
    "#4285F4", // blue
    "#EA4335", // red
    "#FBBC05", // yellow
    "#34A853", // green
    "#A142F4", // purple
    "#00ACC1", // cyan
    "#FF6D01", // orange
    "#7CB342", // lime
  ];

  if (resolvedTheme === "dark") {
    return {
      bg: "#111111",
      text: "#f5f5f5",
      line: "#eaeaea",
      grid: "#3a3a3a",
      fill: palette,
    };
  }

  return {
    bg: "#ffffff",
    text: "#111111",
    line: "#222222",
    grid: "#dddddd",
    fill: palette,
  };
}, [resolvedTheme]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.grid}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {data.type === "line" && (
        <>
            <ChartLegend
            items={data.series.map((s) => s.name)}
            colors={colors.fill}
            />

            <div style={{ flex: 1 }}>
            <LineChart data={data} colors={colors} />
            </div>
        </>
        )}

      {data.type === "bar" && (
        <BarChart data={data} colors={colors} />
      )}

        {data.type === "clustered-bar" && (
        <>
            <ChartLegend
            items={data.series.map((s) => s.name)}
            colors={colors.fill}
            />

            <div style={{ flex: 1 }}>
            <ClusteredBarChart
                data={data}
                colors={colors}
            />
            </div>
        </>
        )}

      {data.type === "pie" && (
        
        <PieChart data={data} colors={colors} />
      )}

      {data.type === "table" && (
        <TableChart data={data} colors={colors} />
      )}
    </div>
  );
}

/* =========================================================
   LINE CHART
========================================================= */

function LineChart({
  data,
  colors,
}: {
  data: LineChartData;
  colors: any;
}) {
  const width = 800;
  const height = 400;

  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 50;

  const maxValue = Math.max(
    ...data.series.flatMap((s) => s.values)
  );

  const { ticks, maxScale } =
    generateYAxisScale(maxValue);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Y AXIS */}
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={height - paddingBottom}
        stroke={colors.line}
        strokeWidth={1.5}
      />

      {/* X AXIS */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        stroke={colors.line}
        strokeWidth={1.5}
      />

      {/* GRID + Y LABELS */}
      {ticks.map((tick) => {
        const ratio = tick / maxScale;

        const y =
          height -
          paddingBottom -
          ratio *
            (height -
              paddingTop -
              paddingBottom);

        return (
          <g key={tick}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
              stroke={colors.grid}
              strokeWidth={1}
            />

            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fill={colors.text}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* X LABELS */}
      {data.labels.map((label, i) => {
        const x =
          paddingLeft +
          (i / (data.labels.length - 1 || 1)) *
            (width -
              paddingLeft -
              paddingRight);

        return (
          <text
            key={label}
            x={x}
            y={height - 15}
            fill={colors.text}
            textAnchor="middle"
            fontSize={12}
          >
            {label}
          </text>
        );
      })}

      {/* LINES */}
      {data.series.map((series, sIndex) => {
        const path = series.values
          .map((value, i) => {
            const x =
              paddingLeft +
              (i /
                (series.values.length - 1 || 1)) *
                (width -
                  paddingLeft -
                  paddingRight);

            const y =
              height -
              paddingBottom -
              (value / maxScale) *
                (height -
                  paddingTop -
                  paddingBottom);

            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ");

        return (
          <g key={series.name}>
            <path
              d={path}
              fill="none"
              stroke={
                colors.fill[sIndex % colors.fill.length]
              }
              strokeWidth={3}
            />

            {/* POINTS */}
            {series.values.map((value, i) => {
              const x =
                paddingLeft +
                (i /
                  (series.values.length - 1 ||
                    1)) *
                  (width -
                    paddingLeft -
                    paddingRight);

              const y =
                height -
                paddingBottom -
                (value / maxScale) *
                  (height -
                    paddingTop -
                    paddingBottom);

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4}
                  fill={
                    colors.fill[
                      sIndex % colors.fill.length
                    ]
                  }
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   BAR CHART
========================================================= */

function BarChart({
  data,
  colors,
}: {
  data: BarChartData;
  colors: any;
}) {
  const width = 800;
  const height = 400;

  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 50;

  const values = data.series[0]?.values ?? [];

  const maxValue = Math.max(...values, 1);

  const { ticks, maxScale } =
    generateYAxisScale(maxValue);

  const barWidth =
    (width - paddingLeft - paddingRight) /
    values.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Y AXIS */}
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={height - paddingBottom}
        stroke={colors.line}
      />

      {/* X AXIS */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        stroke={colors.line}
      />

      {/* GRID + Y LABELS */}
      {ticks.map((tick) => {
        const ratio = tick / maxScale;

        const y =
          height -
          paddingBottom -
          ratio *
            (height -
              paddingTop -
              paddingBottom);

        return (
          <g key={tick}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
              stroke={colors.grid}
              strokeWidth={1}
            />

            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fill={colors.text}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* BARS */}
      {values.map((value, i) => {
        const h =
          (value / maxScale) *
          (height -
            paddingTop -
            paddingBottom);

        const x =
          paddingLeft + i * barWidth + 10;

        const y = height - paddingBottom - h;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth - 20}
              height={h}
              fill={colors.fill[0]}
            />

            <text
              x={x + (barWidth - 20) / 2}
              y={height - 15}
              textAnchor="middle"
              fontSize={12}
              fill={colors.text}
            >
              {data.labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   CLUSTERED BAR CHART
========================================================= */

function ClusteredBarChart({
  data,
  colors,
}: {
  data: ClusteredBarChartData;
  colors: any;
}) {
  const width = 800;
  const height = 400;

  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 50;

  // ALL VALUES
  const allValues = data.series.flatMap(
    (s) => s.values
  );

  const maxValue = Math.max(...allValues, 1);

  // AUTO SCALE
  const { ticks, maxScale } =
    generateYAxisScale(maxValue);

  // GROUP WIDTH
  const groupWidth =
    (width - paddingLeft - paddingRight) /
    data.labels.length;

  // BAR WIDTH
  const innerGroupPadding = 20;

  const availableGroupWidth =
    groupWidth - innerGroupPadding;

  const barWidth =
    availableGroupWidth / data.series.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
    >
      {/* Y AXIS */}
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={height - paddingBottom}
        stroke={colors.line}
        strokeWidth={1.5}
      />

      {/* X AXIS */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        stroke={colors.line}
        strokeWidth={1.5}
      />

      {/* GRID + Y LABELS */}
      {ticks.map((tick) => {
        const ratio = tick / maxScale;

        const y =
          height -
          paddingBottom -
          ratio *
            (height -
              paddingTop -
              paddingBottom);

        return (
          <g key={tick}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
              stroke={colors.grid}
              strokeWidth={1}
            />

            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fill={colors.text}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* BAR GROUPS */}
      {data.labels.map((label, groupIndex) => {
        const groupX =
          paddingLeft + groupIndex * groupWidth;

        return (
          <g key={label}>
            {/* GROUP LABEL */}
            <text
              x={groupX + groupWidth / 2}
              y={height - 15}
              textAnchor="middle"
              fontSize={12}
              fill={colors.text}
            >
              {label}
            </text>

            {/* BARS */}
            {data.series.map((series, seriesIndex) => {
              const value =
                series.values[groupIndex];

              const barHeight =
                (value / maxScale) *
                (height -
                  paddingTop -
                  paddingBottom);

              const x =
                groupX +
                innerGroupPadding / 2 +
                seriesIndex * barWidth;

              const y =
                height -
                paddingBottom -
                barHeight;

              return (
                <g
                  key={`${series.name}-${groupIndex}`}
                >
                  <rect
                    x={x + 4}
                    y={y}
                    width={barWidth - 8}
                    height={barHeight}
                    fill={
                      colors.fill[
                        seriesIndex %
                          colors.fill.length
                      ]
                    }
                  />

                  {/* OPTIONAL VALUE LABEL */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fill={colors.text}
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   PIE CHART
========================================================= */

function PieChart({
  data,
  colors,
}: {
  data: PieChartData;
  colors: any;
}) {
  const pieCount = data.charts.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${pieCount}, 1fr)`,
        width: "100%",
        height: "100%",
      }}
    >
      {data.charts.map((chart, index) => (
        <SinglePie
          key={index}
          chart={chart}
          colors={colors}
        />
      ))}
    </div>
  );
}

function SinglePie({
  chart,
  colors,
}: {
  chart: PieChartData["charts"][0];
  colors: any;
}) {
  const size = 240;
  const radius = 80;
  const cx = 120;
  const cy = 120;


  // IMPORTANT:
  // sort smallest -> largest
  // so all pie charts follow identical visual ordering
  const segments = [...chart.segments].sort(
    (a, b) => a.value - b.value
  );

  const total = segments.reduce(
    (sum, s) => sum + s.value,
    0
  );

  // Start at 12 o'clock
  // SVG circle starts at 3 o'clock by default,
  // so rotate by -90 degrees
  let currentAngle = -Math.PI / 2;

  return (
    <div className="">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          height="100%"
        >
          {segments.map((segment, index) => {
            const angle =
              (segment.value / total) * Math.PI * 2;

            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 =
              cx + radius * Math.cos(startAngle);

            const y1 =
              cy + radius * Math.sin(startAngle);

            const x2 =
              cx + radius * Math.cos(endAngle);

            const y2 =
              cy + radius * Math.sin(endAngle);

            const largeArc = angle > Math.PI ? 1 : 0;

            const path = `
              M ${cx} ${cy}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;

            currentAngle = endAngle;

            return (
              <path
                key={segment.label}
                d={path}
                fill={
                  colors.fill[
                    index % colors.fill.length
                  ]
                }
                stroke={colors.bg}
                strokeWidth={1}
              />
            );
          })}
        </svg>
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 11,
            marginTop: 8,
        }}
        >
        {chart.segments.map((segment, index) => (
            <div
            key={segment.label}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}
            >
              <div
                  style={{
                  width: 10,
                  height: 10,
                  background:
                      colors.fill[index % colors.fill.length],
                  }}
              />

              <span>{segment.label}</span>
            </div>
        ))}
        </div>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TableChart({
  data,
  colors,
}: {
  data: TableChartData;
  colors: any;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: colors.text,
        }}
      >
        <thead>
          <tr>
            {data.columns.map((col) => (
              <th
                key={col}
                style={{
                  border: `1px solid ${colors.grid}`,
                  padding: 8,
                  textAlign: "left",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    border: `1px solid ${colors.grid}`,
                    padding: 8,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/*
chart legend
*/

function ChartLegend({
  items,
  colors,
}: {
  items: string[];
  colors: string[];
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        padding: "8px 12px",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              background: colors[index % colors.length],
              border: "1px solid currentColor",
            }}
          />

          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

// =========================================================
// AXIS SCALE UTILS
// =========================================================

type ScaleResult = {
  ticks: number[];
  maxScale: number;
  step: number;
};

function generateYAxisScale(maxValue: number): ScaleResult {
  // divide into roughly 4 sections
  const roughStep = maxValue / 4;

  // get magnitude
  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(roughStep))
  );

  // normalize
  const normalized = roughStep / magnitude;

  // choose rounded normalized step
  let roundedNormalized: number;

  if (normalized < 1.5) {
    roundedNormalized = 1;
  } else if (normalized < 3.5) {
    roundedNormalized = 2;
  } else if (normalized < 7.5) {
    roundedNormalized = 5;
  } else {
    roundedNormalized = 10;
  }

  const step = roundedNormalized * magnitude;

  const maxScale =
    Math.ceil(maxValue / step) * step;

  const ticks: number[] = [];

  for (let i = 0; i <= maxScale; i += step) {
    ticks.push(i);
  }

  return {
    ticks,
    maxScale,
    step,
  };
}