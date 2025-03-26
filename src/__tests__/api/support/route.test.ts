import { NextRequest } from 'next/server';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/support/route';
import { CONTACT_EMAIL } from '@/constants/contact';

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'test-id' }));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

interface SupportRequestData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

describe('Support Route Handler', () => {
  const validRequestData: SupportRequestData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
  };

  const createRequest = (data: Partial<SupportRequestData>) => {
    return new NextRequest('http://localhost:3000/api/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('successfully sends email with valid input', async () => {
    const request = createRequest(validRequestData);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    expect(mockSend).toHaveBeenCalledWith({
      from: `${validRequestData.name} <support@support.emoji-map.com>`,
      to: [CONTACT_EMAIL],
      subject: `Support Request: ${validRequestData.subject}`,
      html: expect.stringContaining(validRequestData.message),
    });
  });

  test('returns 400 with invalid input', async () => {
    const invalidData = {
      name: '', // Invalid: too short
      email: 'invalid-email', // Invalid: not an email
      subject: '',
      message: '',
    };

    const request = createRequest(invalidData);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid input' });
  });

  test('returns 500 when email sending fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('Failed to send'));

    const request = createRequest(validRequestData);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send email' });
  });
});
