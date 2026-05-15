from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Optional
from pydantic import BaseModel


class AIMessage(BaseModel):
    role: str
    content: str


class AIResponse(BaseModel):
    content: str
    model: str
    tokens_used: int = 0


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str
    tokens_used: int = 0


class AIProvider(ABC):
    @abstractmethod
    async def chat(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AIResponse:
        pass

    @abstractmethod
    async def chat_stream(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AsyncIterator[str]:
        pass

    @abstractmethod
    async def embed(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        pass


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        import openai
        kwargs = {"api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url
        self.client = openai.AsyncOpenAI(**kwargs)
        self.default_chat_model = "gpt-4o-mini"
        self.default_embed_model = "text-embedding-3-small"

    async def chat(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AIResponse:
        response = await self.client.chat.completions.create(
            model=model or self.default_chat_model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return AIResponse(
            content=response.choices[0].message.content or "",
            model=response.model,
            tokens_used=response.usage.total_tokens if response.usage else 0,
        )

    async def chat_stream(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AsyncIterator[str]:
        stream = await self.client.chat.completions.create(
            model=model or self.default_chat_model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def embed(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        response = await self.client.embeddings.create(
            model=model or self.default_embed_model,
            input=texts,
        )
        return [item.embedding for item in response.data]


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str):
        import anthropic
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.default_chat_model = "claude-3-5-sonnet-20241022"

    async def chat(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AIResponse:
        system_msg = None
        chat_messages = []
        for m in messages:
            if m.role == "system":
                system_msg = m.content
            else:
                chat_messages.append({"role": m.role, "content": m.content})

        kwargs = {
            "model": model or self.default_chat_model,
            "messages": chat_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if system_msg:
            kwargs["system"] = system_msg

        response = await self.client.messages.create(**kwargs)
        return AIResponse(
            content=response.content[0].text if response.content else "",
            model=response.model,
            tokens_used=response.usage.input_tokens + response.usage.output_tokens,
        )

    async def chat_stream(
        self,
        messages: List[AIMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AsyncIterator[str]:
        system_msg = None
        chat_messages = []
        for m in messages:
            if m.role == "system":
                system_msg = m.content
            else:
                chat_messages.append({"role": m.role, "content": m.content})

        kwargs = {
            "model": model or self.default_chat_model,
            "messages": chat_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if system_msg:
            kwargs["system"] = system_msg

        async with self.client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    async def embed(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        raise NotImplementedError("Anthropic does not provide embedding models. Use OpenAI for embeddings.")
