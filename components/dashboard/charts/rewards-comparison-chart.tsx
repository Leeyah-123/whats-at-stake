"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RewardsComparisonChartProps {
  compareBy?: "default" | "commission" | "size"
}

export function RewardsComparisonChart({ compareBy = "default" }: RewardsComparisonChartProps) {
  let labels: string[] = []
  let apyData: number[] = []
  let commissionData: number[] = []

  if (compareBy === "commission") {
    // Compare validators with different commission rates
    labels = ["0%", "1%", "3%", "5%", "8%", "10%"]
    apyData = [7.2, 7.1, 6.9, 6.7, 6.4, 6.2]
    commissionData = [0, 1, 3, 5, 8, 10]
  } else if (compareBy === "size") {
    // Compare validators by size
    labels = ["Small", "Medium", "Large", "Super", "Mega"]
    apyData = [7.1, 7.0, 6.9, 6.8, 6.7]
    commissionData = [2, 3, 4, 5, 5]
  } else {
    // Default: top validators
    labels = ["Validator A", "Validator B", "Validator C", "Validator D", "Validator E", "Validator F"]
    apyData = [7.1, 7.0, 6.9, 6.8, 6.7, 6.6]
    commissionData = [2, 3, 3, 4, 5, 5]
  }

  const data = {
    labels,
    datasets: [
      {
        label: "APY (%)",
        data: apyData,
        backgroundColor: "rgba(124, 58, 237, 0.7)",
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Commission (%)",
        data: commissionData,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "y1",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.raw
            return `${label}: ${value}%`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "APY (%)",
        },
        min: 6,
        max: 8,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Commission (%)",
        },
        min: 0,
        max: 12,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return <Bar options={options} data={data} />
}
