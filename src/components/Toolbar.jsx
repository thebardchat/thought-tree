import { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import { listMaps, getMap, deleteMap } from '../api/maps';

const btnStyle = {
  background: 'transparent',
  border: `1px solid ${COLORS.border}`,
  color: COLORS.textDim,
  fontSize: 10,
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: FONTS.mono,
  letterSpacing: 1,
};

export default function Toolbar({ title, setTitle, onNew, onLoad, saving, lastSaved, onSearch }) {
  const [maps, setMaps] = useState([]);
  const [showList, setShowList] = useState(false);

  const refreshMaps = async () => {
    try {
      const data = await listMaps();
      setMaps(data.maps || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (showList) refreshMaps();
  }, [showList]);

  const handleLoad = async (id) => {
    try {
      const data = await getMap(id);
      onLoad(id, data.title, JSON.parse(data.nodes));
      setShowList(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteMap(id);
      refreshMaps();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 44,
      background: '#0a0a0a', borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      zIndex: 1000, fontFamily: FONTS.mono,
    }}>
      <span style={{ color: COLORS.accent, fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }}>THOUGHT TREE</span>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="untitled map"
        style={{
          background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.text,
          fontSize: 11, padding: '4px 8px', fontFamily: FONTS.mono, width: 200, outline: 'none',
          borderRadius: 2,
        }}
      />

      <button onClick={onNew} style={btnStyle}>NEW</button>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowList(!showList)} style={btnStyle}>LOAD</button>
        {showList && (
          <div style={{
            position: 'absolute', top: 30, left: 0, background: '#111', border: `1px solid ${COLORS.border}`,
            borderRadius: 3, minWidth: 250, maxHeight: 300, overflowY: 'auto', zIndex: 2000,
          }}>
            {maps.length === 0 ? (
              <div style={{ padding: 12, color: COLORS.textDim, fontSize: 10 }}>No saved maps</div>
            ) : maps.map(m => (
              <div key={m.id}
                onClick={() => handleLoad(m.id)}
                style={{
                  padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                <span style={{ color: COLORS.text, fontSize: 11 }}>{m.title || 'untitled'}</span>
                <button onClick={e => handleDelete(m.id, e)}
                  style={{ ...btnStyle, color: COLORS.danger, border: 'none', fontSize: 10, padding: '2px 6px' }}>
                  DEL
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onSearch} style={btnStyle}>SEARCH (Ctrl+K)</button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {saving && <span style={{ color: COLORS.accent, fontSize: 10, opacity: 0.6 }}>SAVING...</span>}
        {lastSaved && !saving && (
          <span style={{ color: COLORS.textMuted, fontSize: 10 }}>
            saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
