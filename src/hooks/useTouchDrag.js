import { useRef, useCallback } from 'react';

export function useTouchDrag(nodes, setNodes, onContextMenu) {
  const touchRef = useRef(null);
  const longPressRef = useRef(null);

  const onTouchStart = useCallback((e, nodeId) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    touchRef.current = {
      id: nodeId,
      ox: touch.clientX - node.x,
      oy: touch.clientY - node.y,
      moved: false,
    };

    longPressRef.current = setTimeout(() => {
      if (touchRef.current && !touchRef.current.moved) {
        onContextMenu?.({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {}, stopPropagation: () => {} }, nodeId);
        touchRef.current = null;
      }
    }, 500);
  }, [nodes, onContextMenu]);

  const onTouchMove = useCallback((e) => {
    if (!touchRef.current) return;
    e.preventDefault();
    touchRef.current.moved = true;
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    const touch = e.touches[0];
    const { id, ox, oy } = touchRef.current;
    setNodes(p => p.map(n => n.id === id ? { ...n, x: touch.clientX - ox, y: touch.clientY - oy } : n));
  }, [setNodes]);

  const onTouchEnd = useCallback(() => {
    touchRef.current = null;
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
