// app/api/llm/healthcare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_HEALTHCARE,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are AnchorProof Healthcare AI Assistant, representing AnchorProof Healthcare Solutions.

CRITICAL RULES:
- Return ONLY plain text. NEVER use Markdown, bold, italics, asterisks, underscores, or any formatting.
- NEVER use ** or * for emphasis.
- Use simple line breaks with new lines.
- Use hyphens (-) for bullet points.

You specialize in:
- HIPAA compliance requirements
- Patient data protection and privacy
- FDA guidelines for AI in healthcare
- HITECH Act compliance
- Medical record security
- Telehealth regulations
- Clinical documentation standards

IMPORTANT DISCLAIMERS:
- Always state that you provide general information, not medical advice
- Never diagnose conditions or recommend specific treatments
- Always direct users to consult licensed healthcare providers for medical decisions
- For patient-specific questions, advise contacting their healthcare provider

Be specific and helpful with healthcare compliance questions. Provide actual requirements and guidelines.

Always be professional, accurate, and compliant with healthcare regulations.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    const lastUserMessage = messages
      .filter((m: Message) => m.role === 'user')
      .pop();
    const question = lastUserMessage?.content?.toLowerCase() || '';

    // Help response without API call
    if (question.includes('help') || question.includes('what can you')) {
      const helpReply = `I CAN HELP YOU WITH:

HIPAA COMPLIANCE:
- Privacy Rule requirements
- Security Rule controls
- Breach Notification Rule
- Patient rights and access

FDA GUIDELINES:
- AI/ML in healthcare regulations
- Software as a Medical Device (SaMD)
- Clinical decision support systems

HITECH ACT:
- Electronic health records (EHR)
- Meaningful use requirements
- Data breach notification

SECURITY & PRIVACY:
- Patient data protection
- Access controls and auditing
- Business associate agreements
- Encryption requirements

EXAMPLE QUESTIONS:
- What are HIPAA Privacy Rule requirements?
- How do I ensure FDA compliance for healthcare AI?
- What are the HITECH breach notification rules?
- How does cryptographic verification help with healthcare compliance?

DISCLAIMER: I provide general compliance information only. For medical advice, please consult a licensed healthcare provider.

What healthcare compliance question can I answer for you?`;

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
      "I'm here to help with healthcare compliance questions. Could you please rephrase?";

    // Remove any markdown
    reply = reply.replace(/\*\*/g, '');
    reply = reply.replace(/\*/g, '-');
    reply = reply.replace(/_/g, '');

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (error: unknown) {
    console.error('Healthcare LLM Error:', error);

    const fallbackMessage = `ANCHORPROOF HEALTHCARE SOLUTIONS

Key Healthcare Compliance Frameworks:

HIPAA (Health Insurance Portability and Accountability Act):
- Privacy Rule: Protects patient health information
- Security Rule: Administrative, physical, technical safeguards
- Breach Notification Rule: 60-day notification requirement

HITECH Act (Health Information Technology for Economic and Clinical Health):
- EHR meaningful use requirements
- Increased penalties for non-compliance
- Breach notification to patients

FDA Guidelines for Healthcare AI:
- Risk-based framework for AI/ML
- Software as a Medical Device (SaMD)
- Clinical decision support software

Patient Data Protection:
- Encryption requirements for PHI
- Access controls and audit trails
- Business Associate Agreements (BAAs)

DISCLAIMER: This is general compliance information only. For specific legal or medical advice, consult appropriate professionals.

What specific compliance area would you like to explore?`;

    return NextResponse.json({
      success: true,
      message: fallbackMessage,
    });
  }
}
