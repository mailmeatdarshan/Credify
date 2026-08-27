import { PrismaClient } from '@prisma/client';
import { generateKeyPairSync, sign as cryptoSign, createHash } from 'crypto';

const prisma = new PrismaClient();

function canonicalize(data: Record<string, any>): string {
  const keys = Object.keys(data).sort();
  const sorted: Record<string, any> = {};
  for (const k of keys) sorted[k] = data[k];
  return JSON.stringify(sorted);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing records
  await prisma.verification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.institution.deleteMany({});

  // 1. Generate Ed25519 Root Key Pair for IIT Delhi
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const institution = await prisma.institution.create({
    data: {
      name: 'Indian Institute of Technology Delhi',
      email: 'registrar@iitd.ac.in',
      publicKey,
      algorithm: 'ed25519',
      contactName: 'Office of Academic Affairs',
      website: 'https://home.iitd.ac.in',
    },
  });

  console.log(`✅ Created Institution: ${institution.name} (${institution.id})`);

  // 2. Create sample signed certificates
  const students = [
    {
      studentName: 'Aarav Sharma',
      rollNo: '2021CS10234',
      degree: 'B.Tech in Computer Science and Engineering',
      cgpa: 9.45,
      issueDate: new Date('2025-06-15'),
    },
    {
      studentName: 'Priya Patel',
      rollNo: '2021EE10892',
      degree: 'B.Tech in Electrical Engineering',
      cgpa: 8.85,
      issueDate: new Date('2025-06-15'),
    },
    {
      studentName: 'Rohan Verma',
      rollNo: '2021ME10455',
      degree: 'B.Tech in Mechanical Engineering',
      cgpa: 9.12,
      issueDate: new Date('2025-06-15'),
    },
    {
      studentName: 'Ananya Gupta',
      rollNo: '2023AI20011',
      degree: 'M.Tech in Artificial Intelligence',
      cgpa: 9.80,
      issueDate: new Date('2025-06-20'),
    },
  ];

  for (const s of students) {
    const certPayload = {
      studentName: s.studentName,
      rollNo: s.rollNo,
      degree: s.degree,
      cgpa: s.cgpa,
      issueDate: s.issueDate.toISOString().split('T')[0],
      institutionId: institution.id,
    };

    const canonicalData = canonicalize(certPayload);
    const dataHash = createHash('sha256').update(canonicalData, 'utf8').digest('hex');
    const signature = cryptoSign(null, Buffer.from(canonicalData, 'utf8'), privateKey).toString('base64');

    const cert = await prisma.certificate.create({
      data: {
        studentName: s.studentName,
        rollNo: s.rollNo,
        degree: s.degree,
        cgpa: s.cgpa,
        issueDate: s.issueDate,
        dataHash,
        signature,
        institutionId: institution.id,
        status: 'active',
      },
    });

    // Record initial authentic verification
    await prisma.verification.create({
      data: {
        certificateId: cert.id,
        result: 'authentic',
        method: 'qr_scan',
      },
    });

    console.log(`📜 Issued Certificate: ${s.studentName} [${s.rollNo}] -> ID: ${cert.id}`);
  }

  console.log('\n🎉 Database successfully seeded with sample university & cryptographic certificates!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
