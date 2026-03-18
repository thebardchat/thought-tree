import httpx
import json
import re

OLLAMA_URL = 'http://localhost:11434/api/generate'
MODEL = 'shanebrain-3b'


async def expand_node(text: str) -> list[str]:
    prompt = f"""Given this mind map node: "{text}"

Suggest exactly 5 related ideas or subtopics that branch from this concept.
Return ONLY a JSON array of strings, nothing else.
Example: ["idea one", "idea two", "idea three", "idea four", "idea five"]"""

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(OLLAMA_URL, json={
            'model': MODEL,
            'prompt': prompt,
            'stream': False,
        })
        resp.raise_for_status()
        raw = resp.json().get('response', '')

    # Try JSON parse first
    try:
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            items = json.loads(match.group())
            if isinstance(items, list):
                return [str(s).strip() for s in items[:5] if str(s).strip()]
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback: split by newlines and numbered items
    lines = []
    for line in raw.strip().split('\n'):
        line = re.sub(r'^[\d\.\-\*\)\]]+\s*', '', line).strip()
        if line and len(line) > 2:
            lines.append(line)
    return lines[:5] if lines else ['expand this thought']
