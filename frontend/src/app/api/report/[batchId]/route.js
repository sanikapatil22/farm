import { NextResponse } from 'next/server';

function getBackendBase() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || null;
}

export async function GET(request, context) {
  try {
    const { batchId } = await context.params;
    const url = new URL(request.url);
    const download = url.searchParams.get('download') === 'true';
    const backendBase = getBackendBase();

    if (!backendBase) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend URL is not configured on frontend deployment'
        },
        { status: 500 }
      );
    }

    const backendUrl = `${backendBase}/api/report/${batchId}${download ? '?download=true' : ''}`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: text || 'Backend report request failed'
        },
        { status: response.status }
      );
    }

    if (download) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="batch-report-${batchId}.pdf"`
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Report proxy failed'
      },
      { status: 500 }
    );
  }
}
