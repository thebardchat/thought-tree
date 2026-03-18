import weaviate
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import MetadataQuery
from datetime import datetime, timezone


COLLECTION = 'ThoughtTree'
KNOWLEDGE_COLLECTION = 'LegacyKnowledge'


def get_client():
    return weaviate.connect_to_local(port=8080)


def ensure_collection():
    with get_client() as client:
        if not client.collections.exists(COLLECTION):
            client.collections.create(
                name=COLLECTION,
                vectorizer_config=Configure.Vectorizer.text2vec_ollama(
                    model='nomic-embed-text',
                    api_endpoint='http://172.18.0.1:11434',
                ),
                properties=[
                    Property(name='title', data_type=DataType.TEXT),
                    Property(name='nodes', data_type=DataType.TEXT),
                    Property(name='description', data_type=DataType.TEXT),
                    Property(name='tags', data_type=DataType.TEXT_ARRAY),
                    Property(name='created_at', data_type=DataType.DATE),
                    Property(name='updated_at', data_type=DataType.DATE),
                ],
            )
            print(f'Created {COLLECTION} collection')
        else:
            print(f'{COLLECTION} collection exists')


def insert_map(title, nodes_json, description='', tags=None):
    now = datetime.now(timezone.utc).isoformat()
    with get_client() as client:
        col = client.collections.get(COLLECTION)
        uuid = col.data.insert({
            'title': title,
            'nodes': nodes_json,
            'description': description,
            'tags': tags or [],
            'created_at': now,
            'updated_at': now,
        })
        return str(uuid)


def get_map(uuid):
    with get_client() as client:
        col = client.collections.get(COLLECTION)
        obj = col.query.fetch_object_by_id(uuid)
        if not obj:
            return None
        return {'id': str(obj.uuid), **obj.properties}


def list_maps():
    with get_client() as client:
        col = client.collections.get(COLLECTION)
        results = []
        for obj in col.iterator(include_vector=False):
            results.append({
                'id': str(obj.uuid),
                'title': obj.properties.get('title', ''),
                'updated_at': obj.properties.get('updated_at', ''),
            })
        results.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
        return results


def update_map(uuid, title=None, nodes_json=None, description=None, tags=None):
    now = datetime.now(timezone.utc).isoformat()
    with get_client() as client:
        col = client.collections.get(COLLECTION)
        props = {'updated_at': now}
        if title is not None:
            props['title'] = title
        if nodes_json is not None:
            props['nodes'] = nodes_json
        if description is not None:
            props['description'] = description
        if tags is not None:
            props['tags'] = tags
        col.data.update(uuid=uuid, properties=props)


def delete_map(uuid):
    with get_client() as client:
        col = client.collections.get(COLLECTION)
        col.data.delete_by_id(uuid)


def search_knowledge(query, limit=5):
    with get_client() as client:
        col = client.collections.get(KNOWLEDGE_COLLECTION)
        results = col.query.near_text(
            query=query,
            limit=limit,
            return_metadata=MetadataQuery(distance=True),
        )
        return [
            {
                'text': obj.properties.get('content', obj.properties.get('text', '')),
                'source': obj.properties.get('source', obj.properties.get('category', 'knowledge')),
                'distance': obj.metadata.distance if obj.metadata else None,
            }
            for obj in results.objects
        ]
