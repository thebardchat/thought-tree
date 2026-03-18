const API = '/api';

export async function expandNode(text) {
  const res = await fetch(`${API}/ai/expand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to expand node');
  return res.json();
}

export async function searchKnowledge(query) {
  const res = await fetch(`${API}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}
