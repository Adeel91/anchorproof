import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_GOVERNMENT,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are AnchorProof Government AI Assistant, representing AnchorProof Government Solutions.

CRITICAL RULES:
- Return ONLY plain text. NEVER use Markdown, bold, italics, asterisks, underscores, or any formatting.
- NEVER use ** or * for emphasis.
- Use simple line breaks with new lines.
- Use hyphens (-) for bullet points.

You specialize in:
- FOIA (Freedom of Information Act) compliance
- FISMA (Federal Information Security Modernization Act)
- FedRAMP authorization
- NIST cybersecurity framework
- Public records management
- Government audit trails
- Cryptographic verification for public sector

Be specific and helpful with government compliance questions. Provide actual requirements and guidelines.

Always be professional, accurate, and authoritative. Never give generic responses.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    const lastUserMessage = messages
      .filter((m: Message) => m.role === 'user')
      .pop();
    const question = lastUserMessage?.content?.toLowerCase() || '';

    if (question.includes('help') || question.includes('what can you')) {
      const helpReply = `I CAN HELP YOU WITH:

GOVERNMENT COMPLIANCE:
- FOIA request management and compliance
- FISMA security requirements
- FedRAMP authorization process
- NIST cybersecurity framework
- Public records immutable storage

SECURITY & AUDIT:
- Cryptographic verification for government systems
- Immutable audit trails for public sector
- Chain of custody for government records
- Court-admissible documentation

EXAMPLE QUESTIONS:
- What are FOIA compliance requirements?
- How do I achieve FedRAMP authorization?
- What are NIST 800-53 controls?
- How does cryptographic verification work for public records?

What government compliance question can I answer for you?`;

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
      "I'm here to help with government compliance questions. Could you please rephrase?";

    reply = reply.replace(/\*\*/g, '');
    reply = reply.replace(/\*/g, '-');
    reply = reply.replace(/_/g, '');

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (error: unknown) {
    console.error('Government LLM Error:', error);

    const fallbackMessage = `ANCHORPROOF GOVERNMENT SOLUTIONS

Key Compliance Frameworks:

FOIA (Freedom of Information Act):
- 20-day response requirement
- Exemption categories for sensitive records
- Immutable audit trails required

FISMA (Federal Information Security Modernization Act):
- Risk management framework
- Continuous monitoring requirements
- Annual security reviews

FedRAMP:
- 3-step authorization process
- Continuous monitoring
- Annual assessments

NIST Cybersecurity Framework:
- Identify, Protect, Detect, Respond, Recover
- 800-53 control families
- Risk assessment requirements

What specific compliance area would you like to explore?`;

    return NextResponse.json({
      success: true,
      message: fallbackMessage,
    });
  }
}
