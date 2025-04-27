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
import { formatNumber, formatPercentage } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function NetworkStatsChart() {
  // Generate some simulated historical data
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })

  const totalStakeData = Array.from({ length: 30 }, (_, i) => {
    // Start with base value and add progressive growth
    const base = 150000000
    const growth = i * 200000
    const variance = Math.random() * 300000 - 150000
    return base + growth + variance
  })

  const stakingRatioData = Array.from({ length: 30 }, (_, i) => {
    // Simulated staking ratio with small fluctuations
    const base = 70
    const trend = i * 0.1
    const variance = Math.random() * 1.5 - 0.75
    return Math.min(100, Math.max(60, base + trend + variance))
  })

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Total Staked SOL",
        data: totalStakeData,
        borderColor: "rgba(124, 58, 237, 1)",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        yAxisID: "y",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Staking Ratio %",
        data: stakingRatioData,
        borderColor: "rgba(34, 211, 238, 1)",
        backgroundColor: "rgba(34, 211, 238, 0.1)",
        yAxisID: "y1",
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.raw
            if (label === "Total Staked SOL") {
              return `${label}: ${formatNumber(value)} SOL`
            } else if (label === "Staking Ratio %") {
              return `${label}: ${formatPercentage(value)}%`
            }
            return `${label}: ${value}`
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
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: (value: any) => formatNumber(value) + " SOL",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value: any) => value + "%",
        },
      },
    },
  }

  return <Line options={options} data={data} />
}
