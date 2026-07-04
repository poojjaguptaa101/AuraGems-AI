import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Download, Sparkles, AlertCircle } from 'lucide-react';
import { getProducts } from '../api';

export default function TryOn() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Image & Video Feed State
  const [useWebcam, setUseWebcam] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Canvas Transform state
  const [scale, setScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0.85);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Dragging coordinates
  const [overlayPos, setOverlayPos] = useState({ x: 150, y: 150 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    async function loadProducts() {
      const all = await getProducts();
      setProducts(all);
      if (all.length > 0) {
        setSelectedProduct(all[0]);
      }
    }
    loadProducts();
  }, []);

  // Handle Webcam activation
  useEffect(() => {
    let stream = null;
    if (useWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Camera access failed", err);
          alert("Could not access camera. Please check your browser permissions or upload a photo instead!");
          setUseWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Background Image
    if (useWebcam && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw placeholder box
      ctx.fillStyle = '#1b1b22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText("Upload a photo or activate webcam to start try-on", canvas.width / 2, canvas.height / 2);
    }

    // 2. Draw selected jewellery overlay
    if (selectedProduct) {
      const img = new Image();
      img.src = selectedProduct.image_url;
      img.onload = () => {
        ctx.save();
        
        // Translate to overlay position
        ctx.translate(overlayPos.x, overlayPos.y);
        
        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Apply opacity
        ctx.globalAlpha = opacity;
        
        // Compute scale size
        const baseSize = 150;
        const width = baseSize * scale;
        const height = baseSize * scale;
        
        // Draw centered on translates coordinates
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        
        ctx.restore();
      };
    }
  }, [selectedProduct, useWebcam, uploadedImage, overlayPos, scale, rotation, opacity]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
          setUseWebcam(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Mouse Dragging Event Listeners
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Standard scale math conversion from client Rect bounds to local Canvas bounds (640x480)
    const x = (clientX / rect.width) * canvas.width;
    const y = (clientY / rect.height) * canvas.height;

    // Check if mouse click is near the overlay center (within a boundary radius)
    const clickRadius = 80 * scale;
    const dist = Math.sqrt((x - overlayPos.x) ** 2 + (y - overlayPos.y) ** 2);

    if (dist < clickRadius) {
      isDragging.current = true;
      dragStart.current = { x: x - overlayPos.x, y: y - overlayPos.y };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = (clientX / rect.width) * canvas.width;
    const y = (clientY / rect.height) * canvas.height;

    setOverlayPos({
      x: x - dragStart.current.x,
      y: y - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `AuraGems_TryOn_${selectedProduct ? selectedProduct.name.replace(/\s+/g, '_') : 'snapshot'}.png`;
    link.href = url;
    link.click();
  };

  const resetOverlay = () => {
    setOverlayPos({ x: 320, y: 240 });
    setScale(0.5);
    setRotation(0);
    setOpacity(0.85);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>
          Virtual Atelier
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
          Interactive AI Try-On Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>
          Upload a photo or activate your camera, select a fine jewellery piece, and drag/transform it to see how it complements your look.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        
        {/* Left Column: Try-On Video/Canvas Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel gold-border" style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/3',
            overflow: 'hidden',
            borderRadius: '8px',
            backgroundColor: '#0a0a0c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Hidden Video element for webcam capture stream */}
            {useWebcam && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ display: 'none' }}
              />
            )}

            {/* Interactive Canvas */}
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '100%',
                height: '100%',
                cursor: isDragging.current ? 'grabbing' : 'grab',
                display: 'block'
              }}
            />
            
            {/* Canvas Hint */}
            {(useWebcam || uploadedImage) && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10,10,12,0.85)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <AlertCircle className="w-3.5 h-3.5 text-accent-gold" />
                <span>Drag the jewellery item directly on the canvas</span>
              </div>
            )}
          </div>

          {/* Capture Feed Trigger Bars */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setUseWebcam(!useWebcam); setUploadedImage(null); }}
              className="outline-btn"
              style={{ flexGrow: 1, height: '44px', justifyContent: 'center' }}
            >
              <Camera className="w-4 h-4" /> {useWebcam ? "Deactivate Webcam" : "Activate Webcam"}
            </button>

            <button 
              onClick={() => fileInputRef.current.click()}
              className="outline-btn"
              style={{ flexGrow: 1, height: '44px', justifyContent: 'center' }}
            >
              <Upload className="w-4 h-4" /> Upload Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
        </div>

        {/* Right Column: Interaction & Customiser Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Item Selector */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>
              1. Choose Jewellery Item
            </h3>
            <select
              value={selectedProduct ? selectedProduct.id : ''}
              onChange={(e) => {
                const prod = products.find(p => p.id === parseInt(e.target.value));
                setSelectedProduct(prod);
              }}
              className="form-select"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ({p.category})</option>
              ))}
            </select>

            {selectedProduct && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white' }}>{selectedProduct.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>${selectedProduct.price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transformation Sliders */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>
              2. Align & Customise
            </h3>

            {/* Scale */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label">Scale size</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.5" 
                step="0.05"
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Rotation */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label">Rotation Angle</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{rotation}°</span>
              </div>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                step="5"
                value={rotation} 
                onChange={(e) => setRotation(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Opacity */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label">Blending Opacity</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{Math.round(opacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.2" 
                max="1.0" 
                step="0.05"
                value={opacity} 
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Action control buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <button 
                onClick={resetOverlay}
                className="outline-btn"
                style={{ flexGrow: 1, height: '40px', justifyContent: 'center' }}
              >
                <RotateCcw className="w-4 h-4" /> Reset Item
              </button>
              
              <button 
                onClick={handleDownload}
                className="gold-btn"
                style={{ flexGrow: 1, height: '40px', justifyContent: 'center' }}
                disabled={!useWebcam && !uploadedImage}
              >
                <Download className="w-4 h-4" /> Download Snapshot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
