import { PrismaClient } from '@prisma/client';
import { signCertificate, CertificateData, AlgorithmType, generateKeyPair } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing records
  await prisma.verification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.institution.deleteMany({});

  // 1. Generate Ed25519 Root Key Pair for IIT Delhi
  const { publicKey, privateKey } = generateKeyPair('ed25519');

  const institution = await prisma.institution.create({
    data: {
      name: 'Indian Institute of Technology Delhi',
      email: 'registrar@iitd.ac.in',
      publicKey,
      algorithm: 'ed25519',
      apiKey: 'crdf_live_iitd_demo_key_994a2b1c8e7f',
      contactName: 'Office of Academic Affairs',
      website: 'https://home.iitd.ac.in',
    },
  });

  console.log(`✅ Created Institution: ${institution.name} (${institution.id})`);

  // 2. Create sample signed certificates using the SAME pipeline as runtime issuance
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
    // Use the exact same CertificateData shape and signing pipeline as runtime
    const certData: CertificateData = {
      studentName: s.studentName,
      rollNo: s.rollNo,
      degree: s.degree,
      cgpa: s.cgpa,
      issueDate: s.issueDate.toISOString().split('T')[0],
      institutionId: institution.id,
    };

    const { signature, dataHash } = signCertificate(certData, privateKey, 'ed25519' as AlgorithmType);

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

    console.log(`📜 Issued Certificate (IITD): ${s.studentName} [${s.rollNo}] -> ID: ${cert.id}`);
  }

  // 3. Generate Bhavan's College Institution & Multi-Credential Sample Data
  const { publicKey: bhavansPublic, privateKey: bhavansPrivate } = generateKeyPair('ed25519');

  const bhavans = await prisma.institution.create({
    data: {
      name: "Bhavan's College (Empowered Autonomous)",
      email: 'controller.exams@bhavans.ac.in',
      publicKey: bhavansPublic,
      algorithm: 'ed25519',
      apiKey: 'crdf_live_a56a853dd93d34af2f01decd81e1568c1ff5f534528c081d',
      contactName: 'Controller of Examinations',
      website: 'https://bhavans.ac.in',
    },
  });

  console.log(`✅ Created Institution: ${bhavans.name} (${bhavans.id})`);

  const bhavansStudents = [
    {
      studentName: 'Aarav Sharma',
      rollNo: '2021CS10234',
      degree: 'B.Sc Computer Science',
      cgpa: 9.45,
      issueDate: new Date('2025-06-15'),
    },
    {
      studentName: 'Priya Patel',
      rollNo: 'INT-2025-089',
      degree: 'Full Stack Engineering Intern',
      cgpa: 9.80,
      issueDate: new Date('2025-06-15'),
    },
    {
      studentName: 'Rohan Verma',
      rollNo: 'TEAM-HACK-442',
      degree: '1st Place Winner - AI Track',
      cgpa: 10.00,
      issueDate: new Date('2025-06-10'),
    },
  ];

  for (const s of bhavansStudents) {
    const certData: CertificateData = {
      studentName: s.studentName,
      rollNo: s.rollNo,
      degree: s.degree,
      cgpa: s.cgpa,
      issueDate: s.issueDate.toISOString().split('T')[0],
      institutionId: bhavans.id,
    };

    const { signature, dataHash } = signCertificate(certData, bhavansPrivate, 'ed25519' as AlgorithmType);

    const cert = await prisma.certificate.create({
      data: {
        studentName: s.studentName,
        rollNo: s.rollNo,
        degree: s.degree,
        cgpa: s.cgpa,
        issueDate: s.issueDate,
        dataHash,
        signature,
        institutionId: bhavans.id,
        status: 'active',
      },
    });

    await prisma.verification.create({
      data: {
        certificateId: cert.id,
        result: 'authentic',
        method: 'api_pdf_upload',
      },
    });

    console.log(`📜 Issued Certificate (Bhavan's): ${s.studentName} [${s.rollNo}] -> ID: ${cert.id}`);
  }

  console.log('\n🎉 Database successfully seeded with IIT Delhi & Bhavan\'s College multi-credential certificates!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
