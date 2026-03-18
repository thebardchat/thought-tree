import { useState, useEffect, useCallback } from 'react';
import { COLORS } from './styles/theme';
import ThoughtTree from './components/ThoughtTree';
import Toolbar from './components/Toolbar';
import ContextMenu from './components/ContextMenu';
import SearchBar from './components/SearchBar';
import { useMapPersistence } from './hooks/useMapPersistence';
import { useContextMenu } from './hooks/useContextMenu';

const centerX = () => Math.round(window.innerWidth / 2 - 85);
const centerY = () => Math.round((window.innerHeight - 44) / 2 - 26);
const makeRoot = () => [{ id: 'root', x: centerX(), y: centerY(), text: 'BRAIN DUMP', parentId: null }];

export default function App() {
  const [nodes, setNodes] = useState(makeRoot);
  const [title, setTitle] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { menu, openMenu, closeMenu } = useContextMenu();
  const { mapId, saving, lastSaved, save, newMap, loadMap } = useMapPersistence(nodes, title);

  const handleNew = () => {
    setNodes(makeRoot());
    setTitle('');
    newMap();
  };

  const handleLoad = (id, loadedTitle, loadedNodes) => {
    setNodes(loadedNodes);
    setTitle(loadedTitle);
    loadMap(id);
  };

  const handleBranch = useCallback((nodeId) => {
    setNodes(p => {
      const node = p.find(n => n.id === nodeId);
      if (!node) return p;

      const siblings = p.filter(n => n.parentId === nodeId);
      let depth = 0;
      let walk = node;
      while (walk.parentId) { depth++; walk = p.find(n => n.id === walk.parentId) || { parentId: null }; }
      const dist = 200 + (depth + 1) * 40;

      const parent = node.parentId ? p.find(n => n.id === node.parentId) : null;
      const baseAngle = parent
        ? Math.atan2(node.y - parent.y, node.x - parent.x)
        : -Math.PI / 2;

      const spread = Math.PI * 0.8;
      const count = siblings.length;
      const angle = baseAngle - spread / 2 + (spread / (count + 2)) * (count + 1);

      const newNode = {
        id: `n${Date.now()}`,
        x: node.x + Math.cos(angle) * dist,
        y: node.y + Math.sin(angle) * dist,
        text: '',
        parentId: nodeId,
      };
      return [...p, newNode];
    });
  }, []);

  const handleEdit = useCallback(() => {}, []);

  const handleDelete = useCallback((nodeId) => {
    setNodes(p => {
      const kill = new Set();
      const walk = (nid) => { kill.add(nid); p.filter(n => n.parentId === nid).forEach(n => walk(n.id)); };
      walk(nodeId);
      return p.filter(n => !kill.has(n.id));
    });
  }, []);

  const handleCreateNodeFromSearch = useCallback((text) => {
    const newNode = {
      id: `n${Date.now()}`,
      x: 300 + Math.random() * 400,
      y: 200 + Math.random() * 300,
      text: text.slice(0, 100),
      parentId: null,
    };
    setNodes(p => [...p, newNode]);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: COLORS.bg,
      backgroundImage: COLORS.bgGrad,
    }}>
      <Toolbar
        title={title}
        setTitle={setTitle}
        onNew={handleNew}
        onLoad={handleLoad}
        saving={saving}
        lastSaved={lastSaved}
        onSearch={() => setSearchOpen(true)}
      />
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0 }}>
        <ThoughtTree
          nodes={nodes}
          setNodes={setNodes}
          onContextMenu={openMenu}
        />
      </div>
      <ContextMenu
        menu={menu}
        onClose={closeMenu}
        nodes={nodes}
        setNodes={setNodes}
        onBranch={handleBranch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SearchBar
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onCreateNode={handleCreateNodeFromSearch}
      />
    </div>
  );
}
