const API = '/api';

export async function listMaps() {
  const res = await fetch(`${API}/maps`);
  if (!res.ok) throw new Error('Failed to list maps');
  return res.json();
}

export async function getMap(id) {
  const res = await fetch(`${API}/maps/${id}`);
  if (!res.ok) throw new Error('Failed to load map');
  return res.json();
}

export async function createMap(title, nodes, description = '') {
  const res = await fetch(`${API}/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, nodes: JSON.stringify(nodes), description }),
  });
  if (!res.ok) throw new Error('Failed to create map');
  return res.json();
}

export async function updateMap(id, title, nodes, description = '') {
  const res = await fetch(`${API}/maps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, nodes: JSON.stringify(nodes), description }),
  });
  if (!res.ok) throw new Error('Failed to save map');
  return res.json();
}

export async function deleteMap(id) {
  const res = await fetch(`${API}/maps/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete map');
  return res.json();
}
