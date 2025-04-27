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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function DelinquencyChart() {
  // Generate simulated historical data for delinquency rate
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })

  // Simulate delinquency rate with a spike in the middle
  const delinquencyRate = Array.from({ length: 30 }, (_, i) => {
    let base = 1.5 // Base delinquency rate

    // Add a spike around day 15
    if (i >= 12 && i <= 18) {
      const spikeIntensity = 4 - Math.abs(i - 15)
      base += spikeIntensity
    }

    // Add some random variation
    const variance = Math.random() * 0.8 - 0.4
    return Math.max(0.2, base + variance)
  })

  const data = {
    labels: days,
    datasets: [
      {
        label: "Delinquency Rate (%)",
        data: delinquencyRate,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
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
          label: (context: any) => `Delinquency Rate: ${context.raw.toFixed(2)}%`,
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
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: (value: any) => value + "%",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
  }

  return <Line options={options} data={data} />
}
