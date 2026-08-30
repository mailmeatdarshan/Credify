import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/benchmark';
import { benchmarkSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (request: NextRequest) => {
  const ip = getClientIp(request);
  const rateLimitResult = await rateLimit(ip, 'benchmark');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many benchmark requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { sampleSize } = benchmarkSchema.parse(body);

  const result = await runBenchmark(sampleSize);

  return NextResponse.json(result);
});
