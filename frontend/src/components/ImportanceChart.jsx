import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function ImportanceChart({ data }){
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(()=>{
    if(!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 300, 0)
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)')
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label:'Importance', data: [], backgroundColor: gradient, borderRadius: 6, borderSkipped: false }] },
      options: { 
        indexAxis: 'y', 
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
              label: (context) => context.raw + '%'
            }
          }
        }, 
        scales: { 
          x: { display: false, grid: { display: false } }, 
          y: { 
            grid: { display: false },
            ticks: { color: '#94A3B8', font: { family: 'Inter', size: 12 } },
            border: { display: false }
          } 
        } 
      }
    })
    return ()=> chartRef.current && chartRef.current.destroy()
  }, [])

  useEffect(()=>{
    if(!data || !chartRef.current) return
    const entries = Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,6)
    
    // Clean up labels
    const formatLabel = (str) => {
      if(str === 'max_power') return 'Max Power'
      if(str === 'km_driven') return 'KM Driven'
      if(str === 'car_age') return 'Car Age'
      if(str.includes('mileage')) return 'Mileage'
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const labels = entries.map(e=> formatLabel(e[0]))
    const values = entries.map(e=> +(e[1]*100).toFixed(1))
    
    chartRef.current.data.labels = labels
    chartRef.current.data.datasets[0].data = values
    chartRef.current.update()
  }, [data])

  return <div className="chart-wrap" style={{height:'220px'}}><canvas ref={canvasRef} /></div>
}
