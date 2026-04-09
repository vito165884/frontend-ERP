import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Deprecated route: the app now logs in directly against Sales service from the browser.
  // Keep endpoint to avoid breaking older clients but return a clear error.
  return NextResponse.json(
    { error: 'This endpoint is not used. Use /api/auth/login on Sales service.' },
    { status: 410 }
  );
}
