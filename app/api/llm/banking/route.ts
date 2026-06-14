import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_BANKING,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are AnchorProof Bank AI Assistant, a helpful banking professional representing AnchorProof Bank.

CRITICAL RULES:
- Return ONLY plain text. NEVER use Markdown, bold, italics, asterisks, underscores, or any formatting.
- NEVER use ** or * for emphasis.
- NEVER use HTML tags, images, or videos.
- Use simple line breaks with new lines.
- Use hyphens (-) for bullet points, NOT asterisks.
- Just give clean, readable plain text responses.

Be specific and helpful with loan questions. Provide actual numbers and percentages.

For mortgage questions:
- Give specific interest rates (e.g., "6.2% - 6.8% for excellent credit")
- Provide monthly payment examples
- List credit score requirements

For personal loans:
- Give rate ranges (8-25% depending on credit)
- Provide loan amount limits ($1,000-$50,000)

For auto loans:
- Give rate ranges (5.5-15% depending on credit)
- Provide loan amount limits

Always be conversational, helpful, and specific with numbers. Never give generic responses.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    const lastUserMessage = messages
      .filter((m: Message) => m.role === 'user')
      .pop();
    const question = lastUserMessage?.content?.toLowerCase() || '';

    if (question.includes('help') || question.includes('what can you')) {
      const helpReply = `I CAN HELP YOU WITH:

LOANS & MORTGAGES:
- Mortgage rates and qualifications
- Personal loan amounts and terms
- Auto loan financing options
- How much you can borrow

BANKING SERVICES:
- Interest rates for different credit scores
- Down payment requirements
- Debt-to-income ratio calculations
- Monthly payment estimates

EXAMPLE QUESTIONS YOU CAN ASK:
- What mortgage rate can I get with 720 credit score?
- How much personal loan can I get with $60k income?
- What's the interest rate for auto loans?
- Do I qualify for a $300,000 mortgage?

Just ask me anything about loans, mortgages, or banking! What would you like to know?`;

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
      "I'm here to help with your banking questions. Could you please rephrase?";

    reply = reply.replace(/\*\*/g, '');
    reply = reply.replace(/\*/g, '-');
    reply = reply.replace(/_/g, '');

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (error: unknown) {
    console.error('Banking LLM Error:', error);

    let fallbackMessage = '';

    const errorMessage = error instanceof Error ? error.message : '';

    if (errorMessage.includes('rate limit')) {
      fallbackMessage =
        "I'm experiencing high traffic right now. Here's what I can tell you:\n\nMortgage rates: 6.2% - 7.5% depending on credit\nPersonal loans: 8% - 18% APR\nAuto loans: 5.5% - 9.5% APR\n\nPlease try again in a moment for personalized rates!";
    } else {
      fallbackMessage = `ANCHORPROOF BANK RATES

Mortgage Rates (30-year fixed):
- Excellent credit (740+): 6.2% - 6.8%
- Good credit (680-739): 6.9% - 7.5%

Personal Loans:
- Excellent credit: 8% - 12% APR
- Good credit: 13% - 18% APR

Auto Loans (60-month):
- Excellent credit: 5.5% - 7%
- Good credit: 7% - 9.5%

What specific loan are you interested in?`;
    }

    return NextResponse.json({
      success: true,
      message: fallbackMessage,
    });
  }
}
