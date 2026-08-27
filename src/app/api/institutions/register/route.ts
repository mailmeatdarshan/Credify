import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateKeyPair, AlgorithmType } from '@/lib/crypto';
import { registerInstitutionSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const POST = apiHandler(async (request: NextRequest) => {
  const ip = getClientIp(request);
  const rateLimitResult = await rateLimit(ip, 'register');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  const body = await request.json();
  const { name, email, algorithm } = registerInstitutionSchema.parse(body);

  const existing = await prisma.institution.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Institution with this email already exists' },
      { status: 409 }
    );
  }

  const alg = algorithm as AlgorithmType;
  const { publicKey, privateKey } = generateKeyPair(alg);

  const institution = await prisma.institution.create({
    data: { name, email, algorithm: alg, publicKey },
  });

  return NextResponse.json({
    id: institution.id,
    name: institution.name,
    email: institution.email,
    algorithm: institution.algorithm,
    publicKey: institution.publicKey,
    privateKey,
  });
});
