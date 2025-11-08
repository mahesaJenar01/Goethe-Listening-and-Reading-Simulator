import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // NEW: Import ChartOptions for better typing
} from 'chart.js';
import { PerformanceTrendData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  trendData: PerformanceTrendData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ trendData }) => {
  // Use the imported ChartOptions type for stronger type safety
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Leistungstrend der letzten Prüfungen',
        font: {
            size: 18,
            // --- FIX: Cast 'bold' to a literal type ---
            weight: 'bold', 
        },
        color: '#1e293b', // slate-800
        padding: {
            bottom: 20,
        }
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: function(value: string | number) { // Add string type for safety
                    return value + '%';
                }
            }
        }
    }
  };

  const data = {
    labels: trendData.map(d => d.date),
    datasets: [
      {
        label: 'Hören',
        data: trendData.map(d => d.examType === 'listening' ? d.score : null),
        borderColor: '#0ea5e9', // sky-500
        backgroundColor: '#0ea5e9',
        spanGaps: true, 
        tension: 0.2
      },
      {
        label: 'Lesen',
        data: trendData.map(d => d.examType === 'reading' ? d.score : null),
        borderColor: '#10b981', // emerald-500
        backgroundColor: '#10b981',
        spanGaps: true,
        tension: 0.2
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default PerformanceChart;