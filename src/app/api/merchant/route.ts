import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        places: {
          include: {
            photos: true,
            ratings: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({ merchant });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
