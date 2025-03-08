import { describe, it, expect } from 'vitest';
import { GET } from '../../../app/api/health/route';

describe('Health API Route', () => {
  it('should return a 200 status with health information', async () => {
    // Call the GET handler directly
    const response = await GET();

    // Parse the response JSON
    const data = await response.json();

    // Verify the response status
    expect(response.status).toBe(200);

    // Verify the response body structure and values
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message', 'API is running');
    expect(data).toHaveProperty('timestamp');

    // Verify the timestamp is a valid ISO date string
    expect(() => new Date(data.timestamp)).not.toThrow();
  });
});
