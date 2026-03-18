import { useState, useCallback, useEffect } from 'react';

export function useContextMenu() {
  const [menu, setMenu] = useState(null);

  const openMenu = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, nodeId });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    const handler = () => closeMenu();
    window.addEventListener('click', handler);
    window.addEventListener('contextmenu', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('contextmenu', handler);
    };
  }, [closeMenu]);

  return { menu, openMenu, closeMenu };
}
