import { NextResponse } from 'next/server';

function getBackendBase() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(`${getBackendBase()}/api/certification/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Certification request proxy failed'
      },
      { status: 500 }
    );
  }
}
