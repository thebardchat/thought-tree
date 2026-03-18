import { useState, useRef, useCallback } from 'react';
import { COLORS, FONTS, NODE_WIDTH, NODE_HEIGHT } from '../styles/theme';
import { useTouchDrag } from '../hooks/useTouchDrag';

let _id = 2;
const gid = () => `n${_id++}`;

export default function ThoughtTree({ nodes, setNodes, onContextMenu }) {
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [drag, setDrag] = useState(null);
  const containerRef = useRef(null);

  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchDrag(nodes, setNodes, onContextMenu);

  const getDepth = (nodeId, allNodes) => {
    let depth = 0;
    let current = allNodes.find(n => n.id === nodeId);
    while (current?.parentId) {
      depth++;
      current = allNodes.find(n => n.id === current.parentId);
    }
    return depth;
  };

  const addChild = (parentId, px, py, e) => {
    e?.stopPropagation();
    setNodes(p => {
      const siblings = p.filter(n => n.parentId === parentId);
      const siblingCount = siblings.length;
      const depth = getDepth(parentId, p) + 1;
      const dist = 180 + depth * 40;

      // Find angle of parent relative to its parent (or use 0 for root)
      const parent = p.find(n => n.id === parentId);
      const grandparent = parent?.parentId ? p.find(n => n.id === parent.parentId) : null;
      let baseAngle = 0;
      if (grandparent) {
        baseAngle = Math.atan2(parent.y - grandparent.y, parent.x - grandparent.x);
      }

      // Spread children in a fan from the parent's outward direction
      const spread = Math.PI * 0.8;
      const step = siblingCount > 0 ? spread / (siblingCount + 1) : 0;
      const angle = baseAngle - spread / 2 + step * (siblingCount + 1);

      const nx = { id: gid(), x: px + Math.cos(angle) * dist, y: py + Math.sin(angle) * dist, text: '', parentId };
      setTimeout(() => { setEditing(nx.id); setEditText(''); }, 30);
      return [...p, nx];
    });
  };

  const deleteNode = (id, e) => {
    e?.stopPropagation();
    setNodes(p => {
      const kill = new Set();
      const walk = (nid) => { kill.add(nid); p.filter(n => n.parentId === nid).forEach(n => walk(n.id)); };
      walk(id);
      return p.filter(n => !kill.has(n.id));
    });
  };

  const commitEdit = () => {
    if (!editing) return;
    setNodes(p => p.map(n => n.id === editing ? { ...n, text: editText.trim() || '...' } : n));
    setEditing(null);
  };

  const onMouseDown = (e, id) => {
    if (['BUTTON', 'TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;
    e.preventDefault(); e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    setDrag({ id, ox: e.clientX - node.x, oy: e.clientY - node.y });
  };

  const onMouseMove = useCallback((e) => {
    if (!drag) return;
    setNodes(p => p.map(n => n.id === drag.id ? { ...n, x: e.clientX - drag.ox, y: e.clientY - drag.oy } : n));
  }, [drag, setNodes]);

  const onDblClickCanvas = (e) => {
    if (e.target !== containerRef.current && !e.target.tagName?.match(/^(svg|SVG)$/)) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = { id: gid(), x: e.clientX - rect.left - NODE_WIDTH / 2, y: e.clientY - rect.top - NODE_HEIGHT / 2, text: '', parentId: null };
    setNodes(p => [...p, nx]);
    setTimeout(() => { setEditing(nx.id); setEditText(''); }, 30);
  };

  return (
    <div ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        fontFamily: FONTS.mono, cursor: 'crosshair' }}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDrag(null)}
      onDoubleClick={onDblClickCanvas}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>

      {/* Grid texture */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.accent} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 56, left: 16, color: COLORS.textMuted, fontSize: 10, lineHeight: 2, zIndex: 100, pointerEvents: 'none', letterSpacing: 1 }}>
        DBL-CLICK CANVAS → NEW NODE &nbsp;·&nbsp; + → BRANCH &nbsp;·&nbsp; DRAG → MOVE &nbsp;·&nbsp; DBL-CLICK NODE → EDIT &nbsp;·&nbsp; RIGHT-CLICK → AI
      </div>

      {/* Connectors */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {nodes.filter(n => n.parentId).map(n => {
          const p = nodes.find(x => x.id === n.parentId);
          if (!p) return null;
          const x1 = p.x + NODE_WIDTH / 2, y1 = p.y + NODE_HEIGHT / 2, x2 = n.x + NODE_WIDTH / 2, y2 = n.y + NODE_HEIGHT / 2;
          const mx = (x1 + x2) / 2;
          return (
            <g key={n.id}>
              <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                fill="none" stroke={COLORS.accent} strokeWidth={1} strokeOpacity={0.25} strokeDasharray="5 3" />
              <circle cx={x2} cy={y2} r={2} fill={COLORS.accent} opacity={0.4} />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const isRoot = node.id === 'root';
        const isDragging = drag?.id === node.id;
        return (
          <div key={node.id}
            onMouseDown={e => onMouseDown(e, node.id)}
            onContextMenu={e => onContextMenu?.(e, node.id)}
            onTouchStart={e => onTouchStart(e, node.id)}
            onDoubleClick={e => { e.stopPropagation(); setEditing(node.id); setEditText(node.text === '...' ? '' : node.text); }}
            style={{
              position: 'absolute', left: node.x, top: node.y, width: NODE_WIDTH, zIndex: isDragging ? 999 : 10,
              background: isRoot ? COLORS.nodeRoot : COLORS.node,
              border: `1px solid ${isRoot ? COLORS.borderRoot : COLORS.border}`,
              borderRadius: 3, padding: '10px 12px 8px',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none', touchAction: 'none',
              boxShadow: isRoot ? `0 0 30px ${COLORS.accentGlow}, inset 0 0 20px ${COLORS.accentGlow}` : isDragging ? '0 8px 30px #000' : 'none',
              transition: isDragging ? 'none' : 'box-shadow 0.2s'
            }}>
            {editing === node.id ? (
              <textarea autoFocus value={editText}
                onChange={e => setEditText(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); } if (e.key === 'Escape') setEditing(null); }}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: COLORS.accent,
                  fontFamily: 'inherit', fontSize: 12, width: '100%', resize: 'none', minHeight: 30, lineHeight: 1.5 }}
                rows={2} />
            ) : (
              <div style={{ color: isRoot ? COLORS.accent : COLORS.text, fontSize: 12,
                fontWeight: isRoot ? 'bold' : 'normal', letterSpacing: isRoot ? 3 : 0.5,
                lineHeight: 1.5, minHeight: 20, wordBreak: 'break-word' }}>
                {node.text || <span style={{ opacity: 0.2 }}>...</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={e => addChild(node.id, node.x, node.y, e)}
                style={{ background: '#1a1200', border: `1px solid ${COLORS.accentDim}`, color: COLORS.accent,
                  fontSize: 12, padding: '1px 7px', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', lineHeight: 1.6 }}>
                +</button>
              {!isRoot && (
                <button onClick={e => deleteNode(node.id, e)}
                  style={{ background: '#111', border: `1px solid ${COLORS.border}`, color: '#333',
                    fontSize: 12, padding: '1px 6px', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', lineHeight: 1.6 }}>
                  ×</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
