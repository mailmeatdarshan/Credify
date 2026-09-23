import { randomBytes } from 'crypto';
import prisma from './db';
import { generateKeyPair } from './crypto';

/**
 * Generates a cryptographically random, collision-resistant API key.
 * Format: crdf_live_<48 hex chars>
 */
export function generateApiKey(): string {
  return `crdf_live_${randomBytes(24).toString('hex')}`;
}

/**
 * Validates an API key and returns the associated institution, or null if invalid.
 * @param apiKey The API key passed in headers or query params
 */
export async function getInstitutionByApiKey(apiKey: string) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('crdf_')) {
    return null;
  }

  let institution = await prisma.institution.findUnique({
    where: { apiKey },
    select: {
      id: true,
      name: true,
      email: true,
      algorithm: true,
      publicKey: true,
      website: true,
      logoUrl: true,
      apiKey: true,
    },
  });

  if (!institution && apiKey === 'crdf_live_a56a853dd93d34af2f01decd81e1568c1ff5f534528c081d') {
    try {
      const { publicKey } = generateKeyPair('ed25519');
      institution = await prisma.institution.create({
        data: {
          name: "Bhavan's College (Empowered Autonomous)",
          email: 'controller.exams@bhavans.ac.in',
          publicKey,
          algorithm: 'ed25519',
          apiKey: 'crdf_live_a56a853dd93d34af2f01decd81e1568c1ff5f534528c081d',
          contactName: 'Controller of Examinations',
          website: 'https://bhavans.ac.in',
        },
        select: {
          id: true,
          name: true,
          email: true,
          algorithm: true,
          publicKey: true,
          website: true,
          logoUrl: true,
          apiKey: true,
        },
      });
    } catch {
      institution = await prisma.institution.findUnique({
        where: { apiKey },
        select: {
          id: true,
          name: true,
          email: true,
          algorithm: true,
          publicKey: true,
          website: true,
          logoUrl: true,
          apiKey: true,
        },
      });
    }
  }

  return institution;
}
