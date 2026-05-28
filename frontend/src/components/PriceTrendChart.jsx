import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function PriceTrendChart({ center }){
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(()=>{
    if(!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')

    // Create line gradient
    const strokeGradient = ctx.createLinearGradient(0, 0, 400, 0)
    strokeGradient.addColorStop(0, '#06B6D4')
    strokeGradient.addColorStop(1, '#4F46E5')

    // Create fill gradient
    const fillGradient = ctx.createLinearGradient(0, 0, 0, 200)
    fillGradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)')
    fillGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { 
        labels: [], 
        datasets: [{ 
          label: 'Estimated Price', 
          data: [], 
          borderColor: strokeGradient, 
          backgroundColor: fillGradient, 
          fill: true, 
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#080B13',
          pointBorderColor: '#06B6D4',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }] 
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display:false },
          tooltip: {
            backgroundColor: 'rgba(8, 11, 19, 0.9)',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
            padding: 10,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => '₹' + context.raw.toLocaleString('en-IN')
            }
          }
        }, 
        scales: { 
          y: { 
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { 
              color: '#94A3B8', 
              font: { family: 'Inter', size: 11 },
              callback: v => '₹' + (v/100000).toFixed(1) + 'L' 
            },
            border: { display: false }
          }, 
          x: { 
            grid: { display: false },
            ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
            border: { display: false }
          } 
        } 
      }
    })
    return ()=> chartRef.current && chartRef.current.destroy()
  }, [])

  useEffect(()=>{
    if(!chartRef.current) return
    const months = 12; const labels = []; const now = new Date()
    for(let i=months-1;i>=0;i--){ 
      const d = new Date(now.getFullYear(), now.getMonth()-i,1); 
      labels.push(d.toLocaleString('default',{month:'short'})) 
    }
    const centerVal = center || 300000
    const series = labels.map((_,idx)=>{ 
      const swing = Math.sin(idx/2)*0.06 + (Math.random()*0.04-0.02); 
      return Math.max(0, Math.round(centerVal*(1+swing))) 
    })
    chartRef.current.data.labels = labels
    chartRef.current.data.datasets[0].data = series
    chartRef.current.update()
  }, [center])

  return <div className="chart-wrap" style={{height:'220px'}}><canvas ref={canvasRef} /></div>
}
