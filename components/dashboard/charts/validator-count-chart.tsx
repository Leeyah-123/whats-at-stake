"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { formatNumber } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function ValidatorCountChart() {
  // Generate simulated historical data for validator growth
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Starting with ~1000 validators in January and growing
  const activeValidators = Array.from({ length: 12 }, (_, i) => {
    const baseGrowth = 1000 + i * 80
    const variance = Math.floor(Math.random() * 50)
    return baseGrowth + variance
  })

  const totalValidators = activeValidators.map((active) => {
    const inactive = Math.floor(active * (Math.random() * 0.1 + 0.05)) // 5-15% inactive
    return active + inactive
  })

  const data = {
    labels: months,
    datasets: [
      {
        label: "Total Validators",
        data: totalValidators,
        backgroundColor: "rgba(168, 85, 247, 0.6)",
        borderColor: "rgba(168, 85, 247, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Active Validators",
        data: activeValidators,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
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
            return `${label}: ${formatNumber(value)}`
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
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: (value: any) => formatNumber(value),
        },
      },
    },
  }

  return <Bar options={options} data={data} />
}
