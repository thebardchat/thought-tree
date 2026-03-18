import { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import { expandNode } from '../api/ai';

const itemStyle = {
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 11,
  color: COLORS.text,
  fontFamily: FONTS.mono,
  letterSpacing: 0.5,
  borderBottom: `1px solid ${COLORS.border}`,
  transition: 'background 0.1s',
};

export default function ContextMenu({ menu, onClose, nodes, setNodes, onBranch, onEdit, onDelete }) {
  const [loading, setLoading] = useState(false);

  if (!menu) return null;

  const node = nodes.find(n => n.id === menu.nodeId);
  if (!node) return null;

  const handleExpand = async () => {
    if (!node.text || node.text === '...') return;
    setLoading(true);
    try {
      const data = await expandNode(node.text);
      const suggestions = data.suggestions || [];

      // Find depth of this node to calculate ring distance
      let depth = 0;
      let walk = node;
      while (walk.parentId) { depth++; walk = nodes.find(n => n.id === walk.parentId) || { parentId: null }; }
      const ringDist = 200 + (depth + 1) * 40;

      // Find parent angle to fan outward from it
      const parent = node.parentId ? nodes.find(n => n.id === node.parentId) : null;
      const baseAngle = parent
        ? Math.atan2(node.y - parent.y, node.x - parent.x)
        : -Math.PI / 2;

      const spread = Math.PI * 0.8;
      const newNodes = suggestions.map((text, i) => {
        const angle = baseAngle - spread / 2 + (spread / (suggestions.length + 1)) * (i + 1);
        return {
          id: `n${Date.now()}_${i}`,
          x: node.x + Math.cos(angle) * ringDist,
          y: node.y + Math.sin(angle) * ringDist,
          text,
          parentId: node.id,
        };
      });
      setNodes(p => [...p, ...newNodes]);
    } catch (e) {
      console.error('Expand failed:', e);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'fixed', left: menu.x, top: menu.y,
      background: '#111', border: `1px solid ${COLORS.accent}`,
      borderRadius: 3, zIndex: 5000, minWidth: 180,
      boxShadow: `0 4px 20px #000, 0 0 10px ${COLORS.accentGlow}`,
    }}>
      <div onClick={handleExpand}
        onMouseEnter={e => e.target.style.background = '#1a1200'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
        style={{ ...itemStyle, color: COLORS.accent, fontWeight: 'bold' }}>
        {loading ? 'THINKING...' : 'ASK SHANEBRAIN'}
      </div>
      <div onClick={() => { onBranch(menu.nodeId); onClose(); }}
        onMouseEnter={e => e.target.style.background = '#1a1200'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
        style={itemStyle}>
        + BRANCH
      </div>
      <div onClick={() => { onEdit(menu.nodeId); onClose(); }}
        onMouseEnter={e => e.target.style.background = '#1a1200'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
        style={itemStyle}>
        EDIT
      </div>
      {node.id !== 'root' && (
        <div onClick={() => { onDelete(menu.nodeId); onClose(); }}
          onMouseEnter={e => e.target.style.background = '#200'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
          style={{ ...itemStyle, color: COLORS.danger, borderBottom: 'none' }}>
          DELETE
        </div>
      )}
    </div>
  );
}
