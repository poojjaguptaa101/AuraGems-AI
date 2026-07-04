import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Gift, Send, RefreshCw, Check, Copy, User, Mic, MicOff } from 'lucide-react';
import { sendChatMessage, getStyleRecommendations, getGiftRecommendations } from '../api';
import ProductCard from '../components/ProductCard';

export default function AIAssistantPage({ onViewProductDetails, setCurrentPage, setSelectedProductId }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'quiz', 'gift'
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceWave, setVoiceWave] = useState([4, 15, 8, 12, 5, 18, 9, 14, 6, 11]);

  useEffect(() => {
    let interval = null;
    if (voiceActive) {
      interval = setInterval(() => {
        setVoiceWave(prev => prev.map(() => Math.floor(Math.random() * 20) + 4));
      }, 100);
      
      const timeout = setTimeout(() => {
        setVoiceActive(false);
        handleSendMessage("Show me gold necklaces.");
      }, 3500);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [voiceActive]);

  // ==========================================
  // TAB 1: CHAT BOT STATE
  // ==========================================
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      content: "Hello, I am **AuraGems AI**, your personal digital jewellery concierge. How can I help you find your signature sparkle today?\n\nYou can ask me styling advice, how to measure your ring size, gemstone cleaning instructions, or questions about our lifetime warranty!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    if (!textToSend) setChatInput('');

    const newMessages = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const data = await sendChatMessage(newMessages);
      if (data && data.response) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.response }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to my styling engine. Please ask me again in a moment!" }]);
    }
    setChatLoading(false);
  };

  // Helper to render markdown-like structures safely in react (tables and formatting)
  const formatChatMessage = (text) => {
    // Process tables
    if (text.includes('|')) {
      const lines = text.split('\n');
      const tableRows = [];
      let isTable = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('|')) {
          if (lines[i].includes('---')) continue; // Skip divider row
          isTable = true;
          const cells = lines[i].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableRows.push(cells);
        } else {
          if (isTable) break; // End of table
        }
      }

      if (tableRows.length > 0) {
        return (
          <div style={{ margin: '1rem 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--accent-gold)' }}>
                  {tableRows[0].map((cell, idx) => (
                    <th key={idx} style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} style={{ padding: '0.5rem' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Process basic paragraphs, bold text, bullet points
    return text.split('\n').map((line, idx) => {
      let formattedLine = line;
      
      // Bold text **word**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} style={{ color: '#ffffff' }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      // Check header
      if (line.startsWith('###')) {
        return <h4 key={idx} style={{ color: 'var(--accent-gold)', fontSize: '1.15rem', marginTop: '1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>{parts.length > 1 ? parts : line.replace('###', '').trim()}</h4>;
      }
      if (line.startsWith('##')) {
        return <h3 key={idx} style={{ color: 'white', fontSize: '1.3rem', marginTop: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>{parts.length > 1 ? parts : line.replace('##', '').trim()}</h3>;
      }
      
      // Check list
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const bulletText = line.replace(/^[\s-*]+/, '');
        return (
          <ul key={idx} style={{ marginLeft: '1.5rem', listStyleType: 'circle', marginBottom: '0.25rem' }}>
            <li>{parts.length > 1 ? parts : bulletText}</li>
          </ul>
        );
      }
      
      if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
        const orderedText = line.replace(/^\d+\.\s*/, '');
        return (
          <ol key={idx} style={{ marginLeft: '1.5rem', listStyleType: 'decimal', marginBottom: '0.25rem' }}>
            <li>{parts.length > 1 ? parts : orderedText}</li>
          </ol>
        );
      }

      if (line.trim() === '') return <div key={idx} style={{ height: '0.75rem' }}></div>;

      return <p key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{parts.length > 1 ? parts : line}</p>;
    });
  };

  // ==========================================
  // TAB 2: STYLE QUIZ STATE
  // ==========================================
  const [quizStep, setQuizStep] = useState(1); // 1: Undertone, 2: Style, 3: Occasion, 4: Stone, 5: Budget, 6: Results
  const [skinTone, setSkinTone] = useState('');
  const [statementPref, setStatementPref] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [gemstonePref, setGemstonePref] = useState('');
  const [budgetLimit, setBudgetLimit] = useState(1500);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const handleQuizSubmit = async () => {
    setQuizLoading(true);
    setQuizStep(6);
    try {
      const data = await getStyleRecommendations(skinTone, lifestyle, gemstonePref, statementPref, budgetLimit);
      setQuizResults(data);
    } catch (err) {
      console.error(err);
    }
    setQuizLoading(false);
  };

  const resetQuiz = () => {
    setSkinTone('');
    setStatementPref('');
    setLifestyle('');
    setGemstonePref('');
    setBudgetLimit(1500);
    setQuizResults(null);
    setQuizStep(1);
  };

  // ==========================================
  // TAB 3: GIFT FINDER STATE
  // ==========================================
  const [giftStep, setGiftStep] = useState(1); // 1: Recipient & Occasion, 2: Budget, 3: Results
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftOccasion, setGiftOccasion] = useState('');
  const [giftBudget, setGiftBudget] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftResults, setGiftResults] = useState(null);
  const [noteCopied, setNoteCopied] = useState(false);

  const handleGiftSubmit = async () => {
    setGiftLoading(true);
    setGiftStep(3);
    try {
      const data = await getGiftRecommendations(giftRecipient, giftOccasion, giftBudget);
      setGiftResults(data);
    } catch (err) {
      console.error(err);
    }
    setGiftLoading(false);
  };

  const resetGift = () => {
    setGiftRecipient('');
    setGiftOccasion('');
    setGiftBudget('');
    setGiftResults(null);
    setGiftStep(1);
    setNoteCopied(false);
  };

  const handleCopyNote = () => {
    if (giftResults && giftResults.gift_card_note) {
      navigator.clipboard.writeText(giftResults.gift_card_note);
      setNoteCopied(true);
      setTimeout(() => setNoteCopied(false), 2500);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>
          Atelier Intelligence
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
          AI Personal Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto', fontSize: '0.9rem' }}>
          Consult our styling chatbot, build a personalized coordinate jewellery profile, or plan the ultimate gift package.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="glass-panel" style={{
        display: 'flex',
        padding: '0.5rem',
        borderRadius: '8px',
        marginBottom: '3rem',
        maxWidth: '650px',
        margin: '0 auto 3rem auto',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
            backgroundColor: activeTab === 'chat' ? 'var(--accent-gold-muted)' : 'transparent',
            color: activeTab === 'chat' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            border: activeTab === 'chat' ? '1px solid var(--border-gold)' : '1px solid transparent'
          }}
        >
          <MessageSquare className="w-4 h-4" /> Styling Chat
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
            backgroundColor: activeTab === 'quiz' ? 'var(--accent-gold-muted)' : 'transparent',
            color: activeTab === 'quiz' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            border: activeTab === 'quiz' ? '1px solid var(--border-gold)' : '1px solid transparent'
          }}
        >
          <Sparkles className="w-4 h-4" /> Style Matchmaker
        </button>
        <button
          onClick={() => setActiveTab('gift')}
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
            backgroundColor: activeTab === 'gift' ? 'var(--accent-gold-muted)' : 'transparent',
            color: activeTab === 'gift' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            border: activeTab === 'gift' ? '1px solid var(--border-gold)' : '1px solid transparent'
          }}
        >
          <Gift className="w-4 h-4" /> Gift Finder
        </button>
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: STYLING CHAT WINDOW */}
      {/* ======================================================================= */}
      {activeTab === 'chat' && (
        <div className="glass-panel" style={{
          maxWidth: '850px',
          margin: '0 auto',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '12px'
        }}>
          {/* Chat Messages Log */}
          <div style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {chatMessages.length === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', animation: 'fadeIn var(--transition-normal)' }}>
                {[
                  { label: "✨ Sizing Guide", text: "How do I measure my ring size?" },
                  { label: "💍 Show Gold Necklaces", text: "Show me gold necklaces." },
                  { label: "🎁 Recommend Gifts", text: "Recommend a gift." },
                  { label: "💎 Luxury under $1,000", text: "Show me gold rings under $1000." }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip.text)}
                    className="glass-panel"
                    style={{
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-gold)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  maxWidth: '80%',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #aa7c11 0%, #d4af37 100%)',
                  border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                  boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow-gold)',
                  color: msg.role === 'user' ? 'var(--text-secondary)' : '#070709',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : "AG"}
                </div>

                {/* Message Body */}
                <div className="glass-panel animate-fade-in" style={{
                  padding: '1rem 1.25rem',
                  background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'rgba(27, 27, 34, 0.4)',
                  borderColor: msg.role === 'user' ? 'var(--border-color)' : 'var(--border-color)',
                  borderRadius: msg.role === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {formatChatMessage(msg.content)}
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #aa7c11 0%, #d4af37 100%)',
                  boxShadow: 'var(--shadow-gold)',
                  color: '#070709',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  AG
                </div>
                <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', borderRadius: '0 12px 12px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ 
            padding: '0.75rem 2rem', 
            background: 'var(--bg-secondary)', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {[
              "How do I find my ring size?",
              "Tell me about your return policy.",
              "Show me gold rings.",
              "Jewellery care tips."
            ].map((faq, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(faq)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  transition: 'border-color var(--transition-fast), color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--accent-gold)';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {faq}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            {voiceActive ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '44px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '4px',
                padding: '0 1rem',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mic className="w-4 h-4 text-accent-gold" style={{ animation: 'bounce 0.8s infinite' }} />
                  <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '500' }}>AI Voice Assistant listening...</span>
                </div>
                
                {/* Waveform graphic */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
                  {voiceWave.map((h, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: '3px', 
                        height: `${h}px`, 
                        backgroundColor: 'var(--accent-gold)',
                        borderRadius: '1px',
                        transition: 'height 0.1s ease'
                      }} 
                    />
                  ))}
                </div>

                <button 
                  onClick={() => setVoiceActive(false)} 
                  style={{ color: '#ff4d4d', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                style={{ display: 'flex', gap: '0.75rem' }}
              >
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AuraGems AI about styling, measurements, or products..."
                    className="form-input"
                    style={{ height: '44px', paddingRight: '45px' }}
                    disabled={chatLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setVoiceActive(true)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Mock Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  className="gold-btn" 
                  style={{ width: '44px', height: '44px', padding: 0, justifyContent: 'center', borderRadius: '4px' }}
                  disabled={chatLoading}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: STYLE PROFILE BUILDER (QUIZ) */}
      {/* ======================================================================= */}
      {activeTab === 'quiz' && (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2.5rem', borderRadius: '12px' }}>
          
          {/* STEP 1: SKIN UNDERTONE */}
          {quizStep === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Step 1: Discover Your Undertone</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>1 / 5</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-1rem' }}>
                Vein coloration on your wrist can help determine which precious metal glows best against your skin.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {[
                  { id: 'Warm', title: 'Warm Undertone', desc: 'Veins appear greenish. Gold jewellery ilauragems_aites your skin.', bg: 'rgba(212, 175, 55, 0.05)' },
                  { id: 'Cool', title: 'Cool Undertone', desc: 'Veins appear blue or purple. Platinum and silver look majestic.', bg: 'rgba(113, 113, 122, 0.05)' },
                  { id: 'Neutral', title: 'Neutral Undertone', desc: 'A mix of blue/green. Both gold and white metals look stunning.', bg: 'rgba(255, 255, 255, 0.02)' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setSkinTone(item.id); setQuizStep(2); }}
                    className="glass-panel"
                    style={{
                      padding: '2rem 1.5rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderColor: skinTone === item.id ? 'var(--accent-gold)' : 'var(--border-color)',
                      background: item.bg,
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = skinTone === item.id ? 'var(--accent-gold)' : 'var(--border-color)'}
                  >
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: STATEMENT PREFERENCE */}
          {quizStep === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Step 2: Choose Your Statement Level</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>2 / 5</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {[
                  { id: 'Minimalist', title: 'Minimalist & Subtle', desc: 'Delicate chains, tiny studs, stackable bands. Understated everyday wear.' },
                  { id: 'Classic', title: 'Classic Elegance', desc: 'Traditional solitaire diamonds, matching pearls, clean symmetrical settings.' },
                  { id: 'Bold', title: 'Bold Statement', desc: 'Large vibrant gemstones, unique sculptural metalwork, thick link chains.' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setStatementPref(item.id); setQuizStep(3); }}
                    className="glass-panel"
                    style={{
                      padding: '2rem 1.5rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderColor: statementPref === item.id ? 'var(--accent-gold)' : 'var(--border-color)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = statementPref === item.id ? 'var(--accent-gold)' : 'var(--border-color)'}
                  >
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <button onClick={() => setQuizStep(1)} className="outline-btn" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Back</button>
            </div>
          )}

          {/* STEP 3: LIFESTYLE / OCCASION */}
          {quizStep === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Step 3: Define the Primary Purpose</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>3 / 5</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {[
                  { id: 'daily-wear', title: 'Daily Wear', desc: 'Resilient and comfortable designs that seamlessly fit business and casual attire.' },
                  { id: 'evening-wear', title: 'Elegant Evening', desc: 'High-polish, radiant diamonds and gemstones that look spectacular under evening lights.' },
                  { id: 'bold-trendy', title: 'Bold & Trendy', desc: 'Unique contemporary designs to express individuality and capture notice.' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setLifestyle(item.id); setQuizStep(4); }}
                    className="glass-panel"
                    style={{
                      padding: '2rem 1.5rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderColor: lifestyle === item.id ? 'var(--accent-gold)' : 'var(--border-color)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = lifestyle === item.id ? 'var(--accent-gold)' : 'var(--border-color)'}
                  >
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <button onClick={() => setQuizStep(2)} className="outline-btn" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Back</button>
            </div>
          )}

          {/* STEP 4: GEMSTONE PREFERENCE */}
          {quizStep === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Step 4: Pick a Favorite Gemstone</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>4 / 5</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { id: 'Diamond', label: 'Brilliant Diamond' },
                  { id: 'Sapphire', label: 'Velvet Sapphire' },
                  { id: 'Emerald', label: 'Forest Emerald' },
                  { id: 'Pearl', label: 'Akoya Pearl' },
                  { id: 'None', label: 'Plain Metal (No stones)' },
                  { id: 'Any', label: 'Surprise Me / Any' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setGemstonePref(item.id); setQuizStep(5); }}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem 1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderColor: gemstonePref === item.id ? 'var(--accent-gold)' : 'var(--border-color)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = gemstonePref === item.id ? 'var(--accent-gold)' : 'var(--border-color)'}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              
              <button onClick={() => setQuizStep(3)} className="outline-btn" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Back</button>
            </div>
          )}

          {/* STEP 5: BUDGET LIMIT */}
          {quizStep === 5 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Step 5: Set Your Maximum Budget</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>5 / 5</span>
              </div>
              
              <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--accent-gold)' }}>
                  ${budgetLimit.toLocaleString()}
                </span>
                
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: '450px',
                    accentColor: 'var(--accent-gold)'
                  }}
                />
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  AuraGems AI will filter and coordinate a full wardrobe set within this total budget limit.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setQuizStep(4)} className="outline-btn">Back</button>
                <button onClick={handleQuizSubmit} className="gold-btn" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Generate Styling Profile
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: QUIZ RESULTS */}
          {quizStep === 6 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {quizLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '1.5rem' }}>
                  <RefreshCw className="w-8 h-8 text-accent-gold" style={{ animation: 'spin 2s linear infinite' }} />
                  <span style={{ fontSize: '0.95rem' }}>Coordinating colors and styles...</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Curated Results</span>
                      <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginTop: '0.25rem' }}>Your Coordinate Jewellery Set</h2>
                    </div>
                    <button onClick={resetQuiz} className="outline-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Retake Quiz
                    </button>
                  </div>

                  {quizResults && (
                    <>
                      {/* Explanation Banner */}
                      <div className="glass-panel gold-border" style={{ padding: '1.5rem', background: 'var(--accent-gold-muted)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <Sparkles className="w-5 h-5 text-accent-gold" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>AI Styling Rationale</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{quizResults.style_explanation}</p>
                          </div>
                        </div>
                      </div>

                      {/* Set Total Details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Combined Set Price:</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'white' }}>${quizResults.total_price.toLocaleString()}</span>
                      </div>

                      {/* Product Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {quizResults.recommended_set.map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onViewDetails={(id) => {
                              setSelectedProductId(id);
                              setCurrentPage('product-details');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: GIFT RECOMMENDATIONS */}
      {/* ======================================================================= */}
      {activeTab === 'gift' && (
        <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 2.5rem', borderRadius: '12px' }}>
          
          {/* STEP 1: FORM SELECTIONS */}
          {giftStep === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Gift Planner Questionnaire</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Specify the gift context, and AuraGems AI will recommend ideal items and write an elegant personalized card message.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Who is the Recipient?</label>
                  <select 
                    value={giftRecipient} 
                    onChange={(e) => setGiftRecipient(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select recipient...</option>
                    <option value="Partner">Significant Partner (Wife/Husband/Fiancé)</option>
                    <option value="Mother">Dear Mother</option>
                    <option value="Friend">Dearest Friend / Bridesmaid</option>
                    <option value="Self">Myself (Self-celebration)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">What is the Occasion?</label>
                  <select 
                    value={giftOccasion} 
                    onChange={(e) => setGiftOccasion(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select occasion...</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding Milestone</option>
                    <option value="Graduation">Graduation / Achievement</option>
                    <option value="just_because">Just Because (No Occasion)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="form-label">What is Your Budget Tier?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  {[
                    { id: 'tier1', label: 'Under $500' },
                    { id: 'tier2', label: '$500 - $1,000' },
                    { id: 'tier3', label: '$1,000 - $2,000' },
                    { id: 'tier4', label: 'Unlimited luxury' }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setGiftBudget(tier.id)}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid ' + (giftBudget === tier.id ? 'var(--accent-gold)' : 'var(--border-color)'),
                        borderRadius: '4px',
                        color: giftBudget === tier.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGiftSubmit} 
                className="gold-btn" 
                style={{ alignSelf: 'flex-end', marginTop: '1.5rem', justifyContent: 'center' }}
                disabled={!giftRecipient || !giftOccasion || !giftBudget}
              >
                Find Gifts & Draft Card
              </button>
            </div>
          )}

          {/* STEP 3: RESULTS & CARD */}
          {giftStep === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              
              {giftLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '1.5rem' }}>
                  <RefreshCw className="w-8 h-8 text-accent-gold" style={{ animation: 'spin 2s linear infinite' }} />
                  <span style={{ fontSize: '0.95rem' }}>Searching and generating card text...</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}>Gift Package</span>
                      <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginTop: '0.25rem' }}>Curated Recommendations</h2>
                    </div>
                    <button onClick={resetGift} className="outline-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Reset Planner
                    </button>
                  </div>

                  {giftResults && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                      {/* AI Gift Note Card */}
                      <div className="glass-panel gold-border" style={{
                        padding: '2.5rem',
                        backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.05) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        borderRadius: '8px',
                        position: 'relative'
                      }}>
                        <span style={{
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          color: 'var(--accent-gold)',
                          display: 'block',
                          marginBottom: '1rem',
                          fontWeight: 'bold'
                        }}>
                          AI-Generated Gift Card Message
                        </span>
                        
                        <p style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.15rem',
                          fontStyle: 'italic',
                          color: '#ffffff',
                          lineHeight: '1.8',
                          marginRight: '2rem'
                        }}>
                          "{giftResults.gift_card_note}"
                        </p>

                        <button 
                          onClick={handleCopyNote}
                          style={{
                            position: 'absolute',
                            right: '20px',
                            top: '20px',
                            color: 'var(--text-secondary)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {noteCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-accent-gold" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Message
                            </>
                          )}
                        </button>
                      </div>

                      {/* Gift products */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Matching Pieces</h3>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '1.5rem'
                        }}>
                          {giftResults.gifts.map(product => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onViewDetails={(id) => {
                                setSelectedProductId(id);
                                setCurrentPage('product-details');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
