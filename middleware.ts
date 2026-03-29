import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Fange HEAD-Anfragen (z.B. von PDF-Viewern, Link-Checkern oder Browser-Prefetching) ab.
  // Dies verhindert den ERR_HTTP_HEADERS_SENT Crash in Verbindung mit <Suspense>.
  if (request.method === 'HEAD') {
    return new NextResponse(null, { status: 200 });
  }

  return NextResponse.next();
}