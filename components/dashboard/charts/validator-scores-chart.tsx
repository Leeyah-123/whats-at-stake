"use client"

import { formatNumber } from "@/lib/utils"
import { Scatter } from "react-chartjs-2"
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, LogarithmicScale } from "chart.js"
import type { ValidatorScore } from "@/lib/types"

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, LogarithmicScale)

interface ValidatorScoresChartProps {
  data: ValidatorScore[]
}

export function ValidatorScoresChart({ data }: ValidatorScoresChartProps) {
  const chartData = {
    datasets: [
      {
        label: "Validators",
        data: data.map((item) => ({
          x: item.stake,
          y: item.score,
          r: Math.sqrt(item.stake) / 100 + 4, // Bubble size based on stake size
          validator: item.name,
          commission: item.commission,
          delinquent: item.delinquent,
        })),
        backgroundColor: data.map((item) =>
          item.delinquent
            ? "rgba(239, 68, 68, 0.6)"
            : item.score > 80
              ? "rgba(34, 197, 94, 0.6)"
              : "rgba(249, 115, 22, 0.6)",
        ),
        borderColor: data.map((item) =>
          item.delinquent ? "rgba(239, 68, 68, 1)" : item.score > 80 ? "rgba(34, 197, 94, 1)" : "rgba(249, 115, 22, 1)",
        ),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw
            return [
              `Validator: ${point.validator}`,
              `Score: ${point.y}`,
              `Stake: ${formatNumber(point.x)} SOL`,
              `Commission: ${point.commission}%`,
              point.delinquent ? "Status: Delinquent" : "Status: Active",
            ]
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Score",
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Stake Size (SOL)",
        },
        type: "logarithmic",
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: (value: any) => {
            if ([1, 10, 100, 1000, 10000, 100000, 1000000].includes(value)) {
              return formatNumber(value)
            }
            return ""
          },
        },
      },
    },
  }

  return <Scatter data={chartData} options={options} />
}
