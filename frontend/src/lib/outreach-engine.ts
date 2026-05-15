/**
 * AI Outreach Generation Engine
 *
 * Generates personalized outreach messages using AI provider,
 * candidate intelligence, and recruiter memory.
 */

import { createProvider, type AIMessage, type AIProvider } from "./ai-provider";
import type {
  OutreachChannel,
  OutreachTone,
  OutreachDraft,
  OutreachSequence,
} from "@/types/workflows";
import { api, type Candidate, type Memory } from "./api";

/**
 * Generate a personalized outreach message for a candidate
 */
export async function generateOutreach(
  candidate: Candidate,
  channel: OutreachChannel,
  tone: OutreachTone,
  memoryContext?: Memory[],
  additionalContext?: string
): Promise<OutreachDraft> {
  const provider = createProvider("mimo");

  const systemPrompt = buildOutreachSystemPrompt(channel, tone, memoryContext);
  const userPrompt = buildOutreachUserPrompt(candidate, additionalContext);

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await provider.sendMessage(messages);

  return {
    id: `outreach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    candidateId: candidate.id,
    candidateName: candidate.full_name,
    channel,
    subject: extractSubject(response.content, channel),
    body: extractBody(response.content),
    tone,
    personalizations: extractPersonalizations(candidate),
    generatedAt: new Date().toISOString(),
    status: "draft",
  };
}

/**
 * Generate a multi-channel outreach sequence
 */
export async function generateOutreachSequence(
  candidate: Candidate,
  channels: OutreachChannel[],
  memoryContext?: Memory[]
): Promise<OutreachSequence> {
  const steps = await Promise.all(
    channels.map(async (channel, index) => {
      const draft = await generateOutreach(
        candidate,
        channel,
        "professional",
        memoryContext
      );
      return {
        id: `seq-step-${index}`,
        order: index + 1,
        channel,
        delayDays: index === 0 ? 0 : index * 2,
        template: draft.body,
        status: "pending" as const,
      };
    })
  );

  return {
    id: `seq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `Outreach sequence for ${candidate.full_name}`,
    candidateId: candidate.id,
    steps,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Build system prompt for outreach generation
 */
function buildOutreachSystemPrompt(
  channel: OutreachChannel,
  tone: OutreachTone,
  memoryContext?: Memory[]
): string {
  const channelInstructions: Record<OutreachChannel, string> = {
    email:
      "Write a professional recruiting email. Include a compelling subject line. Keep it concise (150-200 words). Highlight relevant experience and explain why this opportunity is a great fit.",
    linkedin:
      "Write a LinkedIn InMail message. Be concise and professional. Reference specific aspects of their profile. Include a clear call to action.",
    whatsapp:
      "Write a brief WhatsApp message. Keep it under 100 words. Be friendly and direct. Include a simple question to start conversation.",
    sms: "Write an SMS message under 160 characters. Be extremely concise. Include only the most essential information.",
  };

  const toneInstructions: Record<OutreachTone, string> = {
    professional: "Use formal business language. Be respectful and polished.",
    friendly:
      "Use warm, approachable language. Be personable while maintaining professionalism.",
    casual: "Use relaxed, conversational tone. Be approachable and genuine.",
    formal:
      "Use very formal language. Be highly professional and corporate in tone.",
  };

  let prompt = `You are an expert recruiting outreach specialist at Fintelos.

${channelInstructions[channel]}

Tone: ${toneInstructions[tone]}

Personalization rules:
- Reference the candidate's specific skills, experience, or achievements
- Mention their current company or role if relevant
- Explain why this opportunity specifically fits their background
- Include a clear, specific call to action
- Avoid generic templates - make each message unique`;

  if (memoryContext && memoryContext.length > 0) {
    prompt += `\n\nRecruiter preferences (from memory):\n${memoryContext.map((m) => `- ${m.content}`).join("\n")}`;
  }

  prompt += `\n\nFormat your response as:
SUBJECT: [subject line for email, omit for other channels]
BODY: [the outreach message]`;

  return prompt;
}

/**
 * Build user prompt with candidate details
 */
function buildOutreachUserPrompt(
  candidate: Candidate,
  additionalContext?: string
): string {
  let prompt = `Generate a personalized outreach message for this candidate:

Name: ${candidate.full_name}
${candidate.current_title ? `Title: ${candidate.current_title}` : ""}
${candidate.current_company ? `Company: ${candidate.current_company}` : ""}
${candidate.location ? `Location: ${candidate.location}` : ""}
${candidate.experience_years ? `Experience: ${candidate.experience_years} years` : ""}
Skills: ${candidate.skills.join(", ") || "Not specified"}
AI Score: ${Math.round(candidate.ai_score * 100)}%
Response Likelihood: ${Math.round(candidate.response_likelihood * 100)}%`;

  if (additionalContext) {
    prompt += `\n\nAdditional context: ${additionalContext}`;
  }

  return prompt;
}

/**
 * Extract subject line from AI response
 */
function extractSubject(content: string, channel: OutreachChannel): string | undefined {
  if (channel !== "email") return undefined;

  const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
  return subjectMatch ? subjectMatch[1].trim() : undefined;
}

/**
 * Extract body from AI response
 */
function extractBody(content: string): string {
  const bodyMatch = content.match(/BODY:\s*([\s\S]+?)(?:\n\n|$)/i);
  if (bodyMatch) return bodyMatch[1].trim();

  // Fallback: use the entire content if no BODY: marker
  return content
    .replace(/SUBJECT:\s*.+/i, "")
    .trim();
}

/**
 * Extract personalization points from candidate data
 */
function extractPersonalizations(candidate: Candidate): string[] {
  const personalizations: string[] = [];

  if (candidate.current_title) {
    personalizations.push(`Role: ${candidate.current_title}`);
  }
  if (candidate.current_company) {
    personalizations.push(`Company: ${candidate.current_company}`);
  }
  if (candidate.skills.length > 0) {
    personalizations.push(`Skills: ${candidate.skills.slice(0, 3).join(", ")}`);
  }
  if (candidate.experience_years) {
    personalizations.push(`Experience: ${candidate.experience_years}y`);
  }
  if (candidate.ai_score >= 0.8) {
    personalizations.push("High AI match score");
  }

  return personalizations;
}

/**
 * Generate outreach via backend API
 */
export async function generateOutreachViaAPI(
  candidateId: string,
  channel: OutreachChannel,
  tone: OutreachTone,
  context?: string
): Promise<OutreachDraft> {
  const result = await api.outreach.generate({
    candidate_id: candidateId,
    channel,
    tone,
    context,
  });
  return result as unknown as OutreachDraft;
}

/**
 * Generate outreach sequence via backend API
 */
export async function generateSequenceViaAPI(
  candidateId: string,
  channels: OutreachChannel[]
): Promise<OutreachSequence> {
  const result = await api.outreach.generateSequence({
    candidate_id: candidateId,
    channels,
  });
  return result as unknown as OutreachSequence;
}
