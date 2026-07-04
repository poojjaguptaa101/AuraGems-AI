import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, ChevronDown, ChevronUp, Cpu, Activity, Clock } from 'lucide-react';

export default function DevConsole({ isOpen, onClose }) {
  const [model, setModel] = useState('Local Matcher Engine');
  const [temperature, setTemperature] = useState(0.2);
  const [telemetry, setTelemetry] = useState({ logs: [], active_model: '', temperature: 0.2 });
  const [expandedLog, setExpandedLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dev/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
        setModel(data.active_model);
        setTemperature(data.temperature);
      }
    } catch (err) {
      console.warn("DevConsole API offline. Falling back to frontend simulated logs.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSaveConfig = async (newModel, newTemp) => {
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/dev/telemetry/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel, temperature: parseFloat(newTemp) })
      });
      fetchTelemetry();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '460px',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      zIndex: 1050,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideInRight var(--transition-normal) forwards'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings className="w-5 h-5 text-accent-gold" />
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>AI Developer Console</h3>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='var(--text-secondary)'}>
          Close
        </button>
      </div>

      {/* Configuration Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Cpu className="w-4 h-4 text-accent-gold" /> LLM Configurations
        </h4>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Active Model</label>
          <select 
            value={model} 
            onChange={(e) => { setModel(e.target.value); handleSaveConfig(e.target.value, temperature); }}
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.50rem' }}
          >
            <option value="Local Matcher Engine">Local NLP Matcher Engine</option>
            <option value="Gemini 1.5 Flash (Medium)">Gemini 1.5 Flash (Medium)</option>
            <option value="Gemini 1.5 Pro (Large)">Gemini 1.5 Pro (Large)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Temperature</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => { setTemperature(parseFloat(e.target.value)); handleSaveConfig(model, e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
          />
        </div>
      </div>

      {/* Telemetry Logs */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h4 style={{ fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
          <Activity className="w-4 h-4 text-accent-gold" /> Live AI Telemetry Logs
        </h4>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
          {telemetry.logs.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recent AI logs. Trigger a search or quiz recommendation to capture metrics!
            </div>
          ) : (
            telemetry.logs.map((log, index) => (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  borderColor: expandedLog === index ? 'var(--accent-gold)' : 'var(--border-color)'
                }}
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'white', fontWeight: '500' }}>{log.event}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock className="w-3.5 h-3.5 text-accent-gold" /> {log.latency_ms} ms
                  </span>
                  <span>Temperature: {telemetry.temperature}</span>
                </div>

                {/* Expanded Details */}
                {expandedLog === index && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    paddingTop: '0.75rem', 
                    borderTop: '1px solid var(--border-color)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    background: 'var(--bg-primary)',
                    padding: '0.5rem',
                    borderRadius: '2px',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--accent-gold)' }}>Prompt Log:</strong>
                      <div style={{ whiteSpace: 'pre-wrap', marginTop: '2px' }}>{log.prompt}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--accent-gold)' }}>Telemetry Response:</strong>
                      <div style={{ whiteSpace: 'pre-wrap', marginTop: '2px' }}>{log.response}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
