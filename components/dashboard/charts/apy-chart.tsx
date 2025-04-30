'use client';

import type { APYHistory } from '@/lib/types';
import { formatPercentage } from '@/lib/utils';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface APYChartProps {
  data: APYHistory[];
}

export function APYChart({ data }: APYChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: 'Average APY (%)',
        data: data.map((item) => item.averageAPY),
        borderColor: 'rgba(124, 58, 237, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        fill: 'start',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `APY: ${formatPercentage(context.raw)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => formatPercentage(value) + '%',
        },
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
