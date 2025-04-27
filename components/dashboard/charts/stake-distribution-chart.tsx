"use client"
import type { StakeDistribution } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface StakeDistributionChartProps {
  data: StakeDistribution[]
}

export function StakeDistributionChart({ data }: StakeDistributionChartProps) {
  const chartData = {
    labels: data.slice(0, 25).map((item) => item.name),
    datasets: [
      {
        label: "Stake Amount (SOL)",
        data: data.slice(0, 25).map((item) => item.stakeAmount),
        backgroundColor: "rgba(147, 51, 234, 0.7)",
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: "rgba(167, 139, 250, 1)",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${formatNumber(context.raw)} SOL`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatNumber(value) + " SOL",
        },
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
