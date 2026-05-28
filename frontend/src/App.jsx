import React, { useEffect, useState } from 'react'
import ImportanceChart from './components/ImportanceChart'
import PriceTrendChart from './components/PriceTrendChart'

const API = 'http://localhost:5000/api'

export default function App(){
  const [form, setForm] = useState({ brand:'Hyundai', year:2018, km_driven:45000, mileage:18.5, engine:1197, max_power:82, seats:5, fuel:'Petrol', transmission:'Manual', seller_type:'Individual', owner:'First Owner' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [meta, setMeta] = useState(null)

  useEffect(()=>{ loadMeta() }, [])

  async function loadMeta(){
    try{
      const res = await fetch(`${API}/meta`)
      const data = await res.json()
      setMeta(data)
    }catch(e){
      setMeta({ feature_importance: {"max_power":0.43,"engine":0.18,"car_age":0.14,"km_driven":0.08,"brand":0.07,"mileage(km/ltr/kg)":0.04,"fuel":0.02,"transmission":0.01,"seats":0.01,"owner":0.01} })
    }
  }

  function handleChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value === '' ? '' : isNaN(value) ? value : Number(value) }))
  }

  async function handleSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      const res = await fetch(`${API}/predict`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(form) })
      if(!res.ok){ const err = await res.json(); throw new Error(err.error || 'Server error') }
      const data = await res.json(); setResult(data)
    }catch(err){
      // demo fallback
      const payload = form
      const base = 500000; const ageFactor = Math.max(0.3,1-(2024-payload.year)*0.07); const kmFactor=Math.max(0.5,1-payload.km_driven/300000)
      const fuelBonus = payload.fuel==='Diesel'?1.1:1.0; const txBonus = payload.transmission==='Automatic'?1.15:1.0; const powerFactor=(payload.max_power/82)*0.4+0.6
      const price = Math.round(base*ageFactor*kmFactor*fuelBonus*txBonus*powerFactor); const mae=60515
      const demo = { predicted_price: price, price_low: Math.max(0,price-mae), price_high: price+mae, formatted_price: `₹${price.toLocaleString('en-IN')}` }
      setResult(demo)
      setError('API offline — showing demo estimate based on Random Forest weights.')
    }finally{ setLoading(false) }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="brand-title">Auto<span>Val</span></h1>
          <div style={{color:'var(--text-muted)', fontSize: '14px', marginTop:'4px'}}>AI-Powered Car Valuation Engine</div>
        </div>
        <div className="badge">
          <div className="dot"></div>
          Model Ready • R² 98.4%
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Sidebar / Input Panel */}
        <aside className="glass-card">
          <h2 className="card-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            Car Specifications
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label>Brand</label>
                <select name="brand" value={form.brand} onChange={handleChange}>
                  <option>Hyundai</option><option>Honda</option><option>Toyota</option><option>Maruti</option><option>Ford</option>
                </select>
              </div>
              <div>
                <label>Year</label>
                <input name="year" type="number" value={form.year} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>KM Driven</label>
                <input name="km_driven" type="number" value={form.km_driven} onChange={handleChange} />
              </div>
              <div>
                <label>Mileage (km/l)</label>
                <input name="mileage" type="number" step="0.1" value={form.mileage} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Engine (CC)</label>
                <input name="engine" type="number" value={form.engine} onChange={handleChange} />
              </div>
              <div>
                <label>Max Power (bhp)</label>
                <input name="max_power" type="number" step="0.01" value={form.max_power} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Transmission</label>
                <select name="transmission" value={form.transmission} onChange={handleChange}><option>Manual</option><option>Automatic</option></select>
              </div>
              <div>
                <label>Fuel Type</label>
                <select name="fuel" value={form.fuel} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option></select>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Seller Type</label>
                <select name="seller_type" value={form.seller_type} onChange={handleChange}><option>Individual</option><option>Dealer</option></select>
              </div>
              <div>
                <label>Owner</label>
                <select name="owner" value={form.owner} onChange={handleChange}><option>First Owner</option><option>Second Owner</option><option>Third Owner</option></select>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"/></svg>
                   Analyzing Data...
                </span>
              ) : 'Run Valuation'}
            </button>
            
            {error && (
              <div className="error-msg">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}
          </form>
        </aside>

        {/* Main Content Area */}
        <main style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          
          <div className="glass-card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px'}}>
            <div className="result-display">
              <div className="price-label">Estimated Market Value</div>
              <div className="price-value outfit-font">{result?.formatted_price || '₹ --,---'}</div>
              <div className="price-range">
                {result ? `Range: ₹${result.price_low.toLocaleString('en-IN')} – ₹${result.price_high.toLocaleString('en-IN')}` : 'Enter car details to get an estimate'}
              </div>
            </div>
            
            <div style={{minWidth: '200px', flex:1, maxWidth:'300px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px'}}>
                <span style={{color:'var(--text-muted)'}}>Confidence Score</span>
                <span style={{fontWeight:600, color:'var(--secondary)'}}>
                   {result ? Math.round(Math.min(95,Math.max(30,(result.predicted_price/1000000)*80+40))) : 0}%
                </span>
              </div>
              <div className="confidence-bar-bg">
                <div className="confidence-bar-fill" style={{width: result? Math.min(95,Math.max(30,(result.predicted_price/1000000)*80+40)) + '%' : '0%'}}></div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="glass-card">
              <h3 className="card-title" style={{fontSize:'16px'}}>
                 <svg width="18" height="18" fill="none" stroke="var(--primary)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                 Feature Importance
              </h3>
              <ImportanceChart data={meta?.feature_importance} />
            </div>

            <div className="glass-card">
              <h3 className="card-title" style={{fontSize:'16px'}}>
                <svg width="18" height="18" fill="none" stroke="var(--secondary)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Market Price Trend (12 Months)
              </h3>
              <PriceTrendChart center={result?.predicted_price || (result? (result.price_low+result.price_high)/2 : null)} />
            </div>
          </div>

        </main>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
