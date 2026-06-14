import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_INSURANCE,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are AnchorProof Insurance AI Assistant, representing AnchorProof Insurance Solutions.

CRITICAL RULES:
- Return ONLY plain text. NEVER use Markdown, bold, italics, asterisks, underscores, or any formatting.
- NEVER use ** or * for emphasis.
- Use simple line breaks with new lines.
- Use hyphens (-) for bullet points.

You specialize in:
- Claims processing and verification
- Underwriting guidelines and risk assessment
- Fraud detection and prevention
- Insurance regulations (state and federal)
- Policy management and compliance
- Risk management frameworks
- Insurtech and digital transformation

Be specific and helpful with insurance questions. Provide actual guidelines, requirements, and examples.

Always be professional, accurate, and compliant with insurance regulations.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    const lastUserMessage = messages
      .filter((m: Message) => m.role === 'user')
      .pop();
    const question = lastUserMessage?.content?.toLowerCase() || '';

    if (question.includes('help') || question.includes('what can you')) {
      const helpReply = `I CAN HELP YOU WITH:

CLAIMS PROCESSING:
- Claims verification and validation
- Fraud detection algorithms
- Claims dispute resolution
- Immutable claims records

UNDERWRITING:
- Risk assessment guidelines
- Premium calculation factors
- Policy terms and conditions
- Regulatory compliance

INSURANCE REGULATIONS:
- State insurance department requirements
- NAIC model laws
- Consumer protection rules
- Data privacy compliance

RISK MANAGEMENT:
- Enterprise risk assessment
- Loss prevention strategies
- Compliance auditing
- Cryptographic verification

EXAMPLE QUESTIONS:
- How does AnchorProof verify insurance claims?
- What are the underwriting guidelines for property insurance?
- How can I prevent insurance fraud?
- What regulations apply to digital insurance products?

What insurance question can I answer for you?`;

      return NextResponse.json({
        success: true,
        message: helpReply,
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    let reply =
      completion.choices[0]?.message?.content ||
      "I'm here to help with insurance questions. Could you please rephrase?";

    reply = reply.replace(/\*\*/g, '');
    reply = reply.replace(/\*/g, '-');
    reply = reply.replace(/_/g, '');

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (error: unknown) {
    console.error('Insurance LLM Error:', error);

    const fallbackMessage = `ANCHORPROOF INSURANCE SOLUTIONS

Key Insurance Features:

CLAIMS VERIFICATION:
- Immutable claims records on blockchain
- Real-time fraud detection
- Automated claims validation
- Dispute resolution with cryptographic proof

UNDERWRITING GUIDELINES:
- Risk assessment factors: credit score, claims history, property type
- Premium calculation: location, coverage amount, deductible
- Policy terms: duration, exclusions, limits

REGULATORY COMPLIANCE:
- State insurance department reporting
- NAIC model law adherence
- Consumer data protection (GDPR/CCPA)
- Audit trail requirements

FRAUD PREVENTION:
- Pattern recognition algorithms
- Document verification
- Identity validation
- Claims history analysis

What specific insurance area would you like to explore?`;

    return NextResponse.json({
      success: true,
      message: fallbackMessage,
    });
  }
}
