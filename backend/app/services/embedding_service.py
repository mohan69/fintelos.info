from typing import List, Optional
from app.core.config import settings


class EmbeddingService:
    """Service for generating and managing embeddings using AI providers"""

    def __init__(self):
        self.dimension = 1536
        self._client = None

    def _get_client(self):
        if self._client is None:
            import openai
            self._client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def generate_embedding(self, text: str, model: Optional[str] = None) -> List[float]:
        """Generate embedding for text using OpenAI"""
        client = self._get_client()
        response = await client.embeddings.create(
            model=model or settings.EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding

    async def generate_batch_embeddings(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        client = self._get_client()
        response = await client.embeddings.create(
            model=model or settings.EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]

    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)


embedding_service = EmbeddingService()
