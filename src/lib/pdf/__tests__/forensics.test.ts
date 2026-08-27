import { describe, it, expect } from 'vitest';
import { analyzePDFForensics } from '../forensics';
import { generateCertificatePDF } from '../generate';

describe('PDF Forensics Engine', () => {
  it('analyzes a clean PDF document and flags low risk', async () => {
    const buffer = await generateCertificatePDF({
      institutionName: 'Indian Institute of Technology Delhi',
      studentName: 'Aarav Sharma',
      rollNo: '2021CS10234',
      degree: 'B.Tech Computer Science',
      cgpa: '9.45',
      issueDate: '2025-06-15',
      certificateId: 'e75a704c-aa84-431d-8013-a1d7840afa4f',
      qrCodeDataUrl: '',
      algorithm: 'ed25519',
      dataHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signature: 'test-signature',
    });

    const report = analyzePDFForensics(buffer);
    expect(report).toBeDefined();
    expect(report.isLegacyUnsigned).toBe(true);
    expect(report.riskScore).toBeLessThanOrEqual(40);
    expect(report.revisionCount).toBeGreaterThanOrEqual(1);
  });

  it('detects Adobe Photoshop signatures and flags high risk', () => {
    // Synthetic mock buffer simulating Photoshop output
    const mockPhotoshopPDF = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Producer (Adobe Photoshop CC 2024) /Creator (Adobe Photoshop) /CreationDate (D:20240101100000Z) /ModDate (D:20240501120000Z) >>\nendobj\n%%EOF\n',
      'utf8'
    );

    const report = analyzePDFForensics(mockPhotoshopPDF);
    expect(report.editingToolDetected).toBe('Adobe Photoshop');
    expect(report.riskLevel).toBe('HIGH_RISK');
    expect(report.riskScore).toBeGreaterThanOrEqual(60);
    expect(report.observations.some(o => o.includes('Photoshop'))).toBe(true);
  });

  it('detects Canva design platform traces', () => {
    const mockCanvaPDF = Buffer.from(
      '%PDF-1.5\n1 0 obj\n<< /Producer (Canva.com PDF Generator) /Creator (Canva) >>\nendobj\n%%EOF\n',
      'utf8'
    );

    const report = analyzePDFForensics(mockCanvaPDF);
    expect(report.editingToolDetected).toBe('Canva Design Platform');
    expect(report.riskScore).toBeGreaterThanOrEqual(50);
  });

  it('detects incremental revisions from multiple save sessions', () => {
    const mockMultiRevisionPDF = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Producer (Office) >>\nendobj\n%%EOF\n2 0 obj\n<< /Producer (Editor) >>\nendobj\n%%EOF\n3 0 obj\n<< /Producer (Modifier) >>\nendobj\n%%EOF\n',
      'utf8'
    );

    const report = analyzePDFForensics(mockMultiRevisionPDF);
    expect(report.revisionCount).toBe(3);
    expect(report.observations.some(o => o.includes('3 revisions'))).toBe(true);
  });
});
