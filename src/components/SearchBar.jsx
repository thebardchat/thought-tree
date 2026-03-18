import { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import { searchKnowledge } from '../api/ai';

export default function SearchBar({ open, onClose, onCreateNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchKnowledge(query);
      setResults(data.results || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 100, zIndex: 6000,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', border: `1px solid ${COLORS.accent}`,
        borderRadius: 4, width: 500, maxHeight: '60vh', overflow: 'hidden',
        boxShadow: `0 8px 40px #000, 0 0 20px ${COLORS.accentGlow}`,
        fontFamily: FONTS.mono,
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}` }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ShaneBrain knowledge..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: COLORS.text, fontSize: 13, padding: '14px 16px', fontFamily: FONTS.mono,
            }}
          />
          <button type="submit" style={{
            background: COLORS.accent, border: 'none', color: '#000',
            fontSize: 10, padding: '0 16px', cursor: 'pointer', fontFamily: FONTS.mono,
            fontWeight: 'bold', letterSpacing: 1,
          }}>
            {loading ? '...' : 'GO'}
          </button>
        </form>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {results.map((r, i) => (
            <div key={i} style={{
              padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
              onClick={() => { onCreateNode(r.text || r.content); onClose(); }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1200'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ color: COLORS.accent, fontSize: 10, marginBottom: 4 }}>
                {r.source || 'knowledge'}
              </div>
              <div style={{ color: COLORS.text, fontSize: 11, lineHeight: 1.5 }}>
                {(r.text || r.content || '').slice(0, 200)}
              </div>
            </div>
          ))}
          {results.length === 0 && !loading && query && (
            <div style={{ padding: 16, color: COLORS.textDim, fontSize: 11 }}>No results. Try different keywords.</div>
          )}
        </div>
      </div>
    </div>
  );
}
