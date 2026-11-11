import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceChart({ symbol, currentPrice, previousPrice }) {
  const [timeframe, setTimeframe] = useState('1D');

  const isBullish = currentPrice >= previousPrice;
  const lineColor = isBullish ? '#10b981' : '#ef4444';
  const fillColor = isBullish ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  // Generate realistic historical points for demo chart visualization
  const chartData = useMemo(() => {
    const points = timeframe === '1D' ? 12 : timeframe === '1W' ? 7 : 30;
    const labels = [];
    const prices = [];

    const base = previousPrice || currentPrice;
    let temp = base;

    for (let i = points; i >= 1; i--) {
      if (timeframe === '1D') {
        const h = 9 + Math.floor((12 - i) * 0.5);
        const m = ((12 - i) % 2) * 30;
        labels.push(`${h}:${m === 0 ? '00' : m}`);
      } else if (timeframe === '1W') {
        labels.push(`Day ${8 - i}`);
      } else {
        labels.push(`Day ${31 - i}`);
      }

      if (i === 1) {
        prices.push(currentPrice);
      } else {
        const delta = (Math.sin(i) * 0.015 + (Math.random() * 0.01 - 0.005)) * base;
        temp += delta;
        prices.push(+temp.toFixed(2));
      }
    }

    return {
      labels,
      datasets: [
        {
          label: `${symbol} Price (₹)`,
          data: prices,
          borderColor: lineColor,
          backgroundColor: fillColor,
          fill: true,
          tension: 0.35,
          pointRadius: points > 15 ? 1 : 3,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    };
  }, [symbol, currentPrice, previousPrice, timeframe]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (val) => `₹${val}`
        }
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Timeframe selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Historical Price Movement
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['1D', '1W', '1M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? 'var(--bg-tertiary)' : 'transparent',
                border: '1px solid var(--border-color)',
                color: timeframe === tf ? '#fff' : 'var(--text-muted)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '320px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
