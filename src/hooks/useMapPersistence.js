import { useState, useRef, useCallback, useEffect } from 'react';
import { createMap, updateMap } from '../api/maps';

export function useMapPersistence(nodes, title) {
  const [mapId, setMapId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const save = useCallback(async (forceNew = false) => {
    if (!title?.trim() || nodes.length === 0) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setSaving(true);
    try {
      let result;
      if (mapId && !forceNew) {
        result = await updateMap(mapId, title, nodes);
      } else {
        result = await createMap(title, nodes);
        setMapId(result.id);
      }
      setLastSaved(new Date());
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [mapId, title, nodes]);

  // Auto-save on changes (2s debounce)
  useEffect(() => {
    if (!title?.trim() || nodes.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(), 2000);
    return () => clearTimeout(timerRef.current);
  }, [nodes, title, save]);

  const newMap = useCallback(() => {
    setMapId(null);
    setLastSaved(null);
  }, []);

  const loadMap = useCallback((id, loadedNodes) => {
    setMapId(id);
    setLastSaved(new Date());
  }, []);

  return { mapId, saving, lastSaved, save, newMap, loadMap };
}
