"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import type { APYHistory } from "@/lib/types"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface RewardsOverTimeChartProps {
  data: APYHistory[]
}

export function RewardsOverTimeChart({ data }: RewardsOverTimeChartProps) {
  // Generate simulated historical data for inflation rate
  const inflationRate = data.map((_, i) => {
    // Simulate decreasing inflation rate over time
    const base = 8.0 // Starting inflation rate
    const decrease = i * 0.05 // Gradual decrease
    const variance = Math.random() * 0.1 - 0.05 // Small random variance
    return Math.max(1.5, base - decrease + variance) // Minimum 1.5%
  })

  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Average APY (%)",
        data: data.map((item) => item.averageAPY),
        borderColor: "rgba(124, 58, 237, 1)",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Inflation Rate (%)",
        data: inflationRate,
        borderColor: "rgba(34, 211, 238, 1)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        yAxisID: "y",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.raw
            return `${label}: ${value.toFixed(2)}%`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: (value: any) => value + "%",
        },
      },
    },
  }

  return <Line options={options} data={chartData} />
}
