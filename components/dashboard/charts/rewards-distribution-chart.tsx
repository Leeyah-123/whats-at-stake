"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export function RewardsDistributionChart() {
  const data = {
    labels: ["6.0-6.5%", "6.5-7.0%", "7.0-7.5%", "7.5-8.0%"],
    datasets: [
      {
        data: [15, 45, 30, 10],
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)",
          "rgba(124, 58, 237, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(34, 197, 94, 0.7)",
        ],
        borderColor: [
          "rgba(245, 158, 11, 1)",
          "rgba(124, 58, 237, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw
            return `${label} APY: ${value}% of validators`
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  }

  return <Doughnut data={data} options={options} />
}
