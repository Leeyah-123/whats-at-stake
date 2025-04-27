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
} from "chart.js"
import type { Validator } from "@/lib/types"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ValidatorPerformanceChartProps {
  validator: Validator
}

export function ValidatorPerformanceChart({ validator }: ValidatorPerformanceChartProps) {
  // Generate simulated historical data for skip rate and vote distance
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })

  // Simulate skip rate with some variance around the current value
  const skipRateData = Array.from({ length: 14 }, () => {
    const variance = Math.random() * 2 - 1 // -1 to +1
    return Math.max(0.1, Math.min(10, validator.skippedSlots + variance))
  })

  // Simulate vote distance with some variance
  const voteDistanceData = Array.from({ length: 14 }, () => {
    const base = validator.voteDistance
    const variance = Math.floor(Math.random() * 6) - 3 // -3 to +3
    return Math.max(0, base + variance)
  })

  const data = {
    labels: days,
    datasets: [
      {
        label: "Skip Rate (%)",
        data: skipRateData,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Vote Distance",
        data: voteDistanceData,
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
        yAxisID: "y1",
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
            if (label === "Skip Rate (%)") {
              return `${label}: ${value.toFixed(2)}%`
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
        title: {
          display: true,
          text: "Skip Rate (%)",
        },
        min: 0,
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
          text: "Vote Distance",
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return <Line options={options} data={data} />
}
