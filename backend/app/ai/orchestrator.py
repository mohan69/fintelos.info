from typing import AsyncIterator, List, Optional
from app.ai.providers import AIProvider, AIMessage, AIResponse, OpenAIProvider, AnthropicProvider
from app.core.config import settings


FINTELOS_SYSTEM_PROMPT = """You are Fintelos, an AI-native Talent Intelligence & Autonomous Recruiting Operating System.

Your capabilities:
- Find and evaluate candidates based on skills, experience, and cultural fit
- Analyze talent markets and compensation trends
- Generate personalized outreach messages
- Provide sourcing strategies and recommendations
- Answer questions about recruiting best practices
- Help with job descriptions and requirements

Guidelines:
- Be concise and actionable
- Provide specific recommendations when possible
- Use data-driven insights
- Focus on quality over quantity in candidate suggestions
- Consider both technical skills and soft factors
- When searching candidates, explain your reasoning

You have access to the recruiter's talent database and can perform semantic searches.
Always be helpful, professional, and focused on results."""


class AIOrchestrator:
    def __init__(self):
        self._providers: dict[str, AIProvider] = {}
        self._init_providers()

    def _init_providers(self):
        # OpenRouter (supports mimo-v2.5-pro and other models)
        if settings.OPENROUTER_API_KEY:
            self._providers["openrouter"] = OpenAIProvider(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1"
            )

        # Direct OpenAI
        if settings.OPENAI_API_KEY:
            self._providers["openai"] = OpenAIProvider(settings.OPENAI_API_KEY)

        # Anthropic
        if settings.ANTHROPIC_API_KEY:
            self._providers["anthropic"] = AnthropicProvider(settings.ANTHROPIC_API_KEY)

    def get_provider(self, name: Optional[str] = None) -> AIProvider:
        provider_name = name or settings.PRIMARY_AI_PROVIDER
        if provider_name not in self._providers:
            available = list(self._providers.keys())
            if not available:
                raise ValueError(
                    "No AI providers configured. Set OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in your .env file."
                )
            provider_name = available[0]
        return self._providers[provider_name]

    async def chat(
        self,
        user_message: str,
        conversation_history: Optional[List[AIMessage]] = None,
        context: Optional[dict] = None,
        provider: Optional[str] = None,
    ) -> AIResponse:
        messages = [AIMessage(role="system", content=FINTELOS_SYSTEM_PROMPT)]

        if context:
            context_str = self._build_context(context)
            if context_str:
                messages.append(AIMessage(role="system", content=context_str))

        if conversation_history:
            messages.extend(conversation_history)

        messages.append(AIMessage(role="user", content=user_message))

        ai_provider = self.get_provider(provider)
        return await ai_provider.chat(messages, model=settings.PRIMARY_AI_MODEL)

    async def chat_stream(
        self,
        user_message: str,
        conversation_history: Optional[List[AIMessage]] = None,
        context: Optional[dict] = None,
        provider: Optional[str] = None,
    ) -> AsyncIterator[str]:
        messages = [AIMessage(role="system", content=FINTELOS_SYSTEM_PROMPT)]

        if context:
            context_str = self._build_context(context)
            if context_str:
                messages.append(AIMessage(role="system", content=context_str))

        if conversation_history:
            messages.extend(conversation_history)

        messages.append(AIMessage(role="user", content=user_message))

        ai_provider = self.get_provider(provider)
        async for chunk in ai_provider.chat_stream(messages, model=settings.PRIMARY_AI_MODEL):
            yield chunk

    async def embed(self, texts: List[str], provider: Optional[str] = None) -> List[List[float]]:
        # Use OpenAI for embeddings (OpenRouter doesn't support embeddings)
        ai_provider = self.get_provider(provider or "openai")
        return await ai_provider.embed(texts)

    def _build_context(self, context: dict) -> str:
        parts = []
        if "candidates" in context:
            candidates = context["candidates"]
            candidate_strs = []
            for c in candidates[:5]:
                candidate_strs.append(
                    f"- {c.get('full_name', 'Unknown')}: {c.get('current_title', 'N/A')} at {c.get('current_company', 'N/A')}, "
                    f"Skills: {', '.join(c.get('skills', []))}, Location: {c.get('location', 'N/A')}"
                )
            parts.append("Relevant candidates from database:\n" + "\n".join(candidate_strs))

        if "memories" in context:
            memories = context["memories"]
            memory_strs = [f"- {m}" for m in memories[:5]]
            parts.append("Recruiter preferences and memories:\n" + "\n".join(memory_strs))

        return "\n\n".join(parts)


orchestrator = AIOrchestrator()
