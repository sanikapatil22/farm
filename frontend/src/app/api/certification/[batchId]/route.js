import { NextResponse } from 'next/server';

function getBackendBase() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

export async function GET(_, context) {
  try {
    const { batchId } = await context.params;
    const response = await fetch(`${getBackendBase()}/api/certification/${batchId}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Certification fetch proxy failed'
      },
      { status: 500 }
    );
  }
}
