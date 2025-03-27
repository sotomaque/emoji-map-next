import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { CONTACT_EMAIL } from '@/constants/contact';
import { env } from '@/env';
import type { ErrorResponse } from '@/types/error-response';

const resend = new Resend(env.RESEND_API_KEY);

type SupportResponse = {
  success: boolean;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<SupportResponse | ErrorResponse>> {
  try {
    const { name, email, subject, message } = await request.json();
    const { success } = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      })
      .safeParse({ name, email, subject, message });

    if (!success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await resend.emails.send({
      from: `${name} <support@support.emoji-map.com>`,
      to: [CONTACT_EMAIL],
      subject: `Support Request: ${subject}`,
      html: `
        <h2>Support Request from ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
