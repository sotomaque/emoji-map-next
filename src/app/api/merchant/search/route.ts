import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/env';
import type { AdminSearchResponse } from '@/types/admin-search';
import type { ErrorResponse } from '@/types/error-response';

const FIELDS = [
  'places.id',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.displayName.text',
].join(',');
const GOOGLE_SEARCH_BASE_URL = `${env.GOOGLE_PLACES_URL}/places:searchText`;
const GOOGLE_API_KEY = env.GOOGLE_PLACES_API_KEY;
const searchUrl = `${GOOGLE_SEARCH_BASE_URL}?fields=${FIELDS}&key=${GOOGLE_API_KEY}`;

const MerchantSchema = z.object({
  name: z.string(),
  city: z.string(),
  state: z.string(),
});

const GoogleResponseSchema = z.object({
  places: z.array(
    z.object({
      id: z.string(),
      formattedAddress: z.string(),
      nationalPhoneNumber: z.string(),
      displayName: z.object({
        text: z.string(),
      }),
    })
  ),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<AdminSearchResponse | ErrorResponse>> {
  try {
    // get Name, City, State from request body
    const body = await request.json();

    // Validate with zod
    const validatedData = MerchantSchema.safeParse(body);

    if (!validatedData.success || !validatedData.data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { name, city, state } = validatedData.data;

    // Check for empty strings after trimming
    if (!name.trim() || !city.trim() || !state.trim()) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Format the text query
    const textQuery = `${name} in ${city}, ${state}`;

    // Make the API call
    const rawData = await fetch(searchUrl, {
      method: 'POST',
      body: JSON.stringify({
        textQuery,
      }),
    });

    // Validate the response
    const data = GoogleResponseSchema.safeParse(await rawData.json());

    if (!data.success || !data.data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return NextResponse.json(
      {
        data: data.data.places.map((place) => ({
          id: place.id,
          formattedAddress: place.formattedAddress,
          nationalPhoneNumber: place.nationalPhoneNumber,
          displayName: place.displayName.text,
        })),
        count: data.data.places.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
