import { NextRequest, NextResponse } from 'next/server';
import { runBenchmark } from '@/lib/benchmark';
import { benchmarkSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));
  const { sampleSize } = benchmarkSchema.parse(body);

  const result = await runBenchmark(sampleSize);

  return NextResponse.json(result);
});
