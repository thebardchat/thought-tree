import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from schemas import MapCreate, MapUpdate, AiExpandRequest, SearchRequest
import weaviate_client as wv
import ollama_client as ai


@asynccontextmanager
async def lifespan(app):
    print('ThoughtTree starting...')
    wv.ensure_collection()
    print('ThoughtTree ready on port 4500')
    yield


app = FastAPI(title='ThoughtTree API', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


# --- Map CRUD ---

@app.post('/api/maps')
def create_map(data: MapCreate):
    map_id = wv.insert_map(data.title, data.nodes, data.description, data.tags)
    return {'id': map_id, 'status': 'created'}


@app.get('/api/maps')
def get_maps():
    maps = wv.list_maps()
    return {'maps': maps}


@app.get('/api/maps/{map_id}')
def get_map(map_id: str):
    result = wv.get_map(map_id)
    if not result:
        raise HTTPException(status_code=404, detail='Map not found')
    return result


@app.put('/api/maps/{map_id}')
def update_map(map_id: str, data: MapUpdate):
    wv.update_map(map_id, data.title, data.nodes, data.description, data.tags)
    return {'id': map_id, 'status': 'updated'}


@app.delete('/api/maps/{map_id}')
def delete_map(map_id: str):
    wv.delete_map(map_id)
    return {'id': map_id, 'status': 'deleted'}


# --- AI ---

@app.post('/api/ai/expand')
async def expand_node(data: AiExpandRequest):
    suggestions = await ai.expand_node(data.text)
    return {'suggestions': suggestions}


@app.post('/api/ai/search')
def search_knowledge(data: SearchRequest):
    results = wv.search_knowledge(data.query)
    return {'results': results}


# --- Health ---

@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'thought-tree'}


# Mount frontend static files (production)
dist_path = os.path.join(os.path.dirname(__file__), '..', 'dist')
if os.path.isdir(dist_path):
    app.mount('/', StaticFiles(directory=dist_path, html=True), name='frontend')
