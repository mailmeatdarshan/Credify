/**
 * PDF Forensic Analysis Engine for Unsigned & Legacy Academic Documents
 * Inspects PDF binary structure, metadata streams, revision history, and editing tool signatures.
 */

export interface PDFForensicReport {
  isLegacyUnsigned: boolean;
  producer: string | null;
  creator: string | null;
  creationDate: string | null;
  modificationDate: string | null;
  revisionCount: number;
  editingToolDetected: string | null;
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  riskScore: number; // 0 to 100
  riskSummary: string;
  observations: string[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    pdfVersion?: string;
    hasXMP: boolean;
  };
}

/**
 * Parses PDF date strings like "D:20240315143000Z" or standard ISO dates
 */
function parsePDFDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Clean string
  const clean = dateStr.replace(/^D:/, '').replace(/'/g, '').trim();
  
  // Format: YYYYMMDDHHmmSS
  if (/^\d{4}/.test(clean)) {
    const year = parseInt(clean.substring(0, 4), 10);
    const month = parseInt(clean.substring(4, 6) || '1', 10) - 1;
    const day = parseInt(clean.substring(6, 8) || '1', 10);
    const hour = parseInt(clean.substring(8, 10) || '0', 10);
    const min = parseInt(clean.substring(10, 12) || '0', 10);
    const sec = parseInt(clean.substring(12, 14) || '0', 10);
    const d = new Date(Date.UTC(year, month, day, hour, min, sec));
    if (!isNaN(d.getTime())) return d;
  }

  const direct = new Date(dateStr);
  return isNaN(direct.getTime()) ? null : direct;
}

/**
 * Extracts a metadata field value from PDF raw binary string
 */
function extractPDFField(raw: string, fieldName: string): string | null {
  // Check /FieldName (Value)
  const regexLiteral = new RegExp(`/${fieldName}\\s*\\(([^)]+)\\)`, 'i');
  const matchLiteral = raw.match(regexLiteral);
  if (matchLiteral && matchLiteral[1]) {
    return matchLiteral[1].trim();
  }

  // Check /FieldName <HEX>
  const regexHex = new RegExp(`/${fieldName}\\s*<([0-9a-fA-F]+)>`, 'i');
  const matchHex = raw.match(regexHex);
  if (matchHex && matchHex[1]) {
    try {
      return Buffer.from(matchHex[1], 'hex').toString('utf8').replace(/\0/g, '').trim();
    } catch {
      return null;
    }
  }

  // Check XMP Tag <pdf:Producer>, <xmp:CreatorTool>, etc.
  const xmpRegex = new RegExp(`<(?:pdf|xmp|dc|xap):${fieldName}[^>]*>([^<]+)<`, 'i');
  const matchXMP = raw.match(xmpRegex);
  if (matchXMP && matchXMP[1]) {
    return matchXMP[1].trim();
  }

  return null;
}

/**
 * Analyzes PDF buffer for forensic anomalies, image editing software traces, and structural revisions.
 */
export function analyzePDFForensics(buffer: Buffer): PDFForensicReport {
  const raw = buffer.toString('binary');
  const rawUtf8 = buffer.toString('utf8');

  // 1. PDF Version
  const versionMatch = raw.match(/^%PDF-(\d+\.\d+)/m);
  const pdfVersion = versionMatch ? versionMatch[1] : '1.4';

  // 2. Extract Metadata Fields
  const producer = extractPDFField(raw, 'Producer') || extractPDFField(rawUtf8, 'Producer');
  const creator = extractPDFField(raw, 'Creator') || extractPDFField(raw, 'CreatorTool') || extractPDFField(rawUtf8, 'Creator');
  const creationDateRaw = extractPDFField(raw, 'CreationDate') || extractPDFField(rawUtf8, 'CreateDate');
  const modDateRaw = extractPDFField(raw, 'ModDate') || extractPDFField(rawUtf8, 'ModifyDate');
  const title = extractPDFField(raw, 'Title');
  const author = extractPDFField(raw, 'Author');
  const subject = extractPDFField(raw, 'Subject');

  const creationDate = parsePDFDate(creationDateRaw || '');
  const modDate = parsePDFDate(modDateRaw || '');

  // 3. Count Incremental Revisions
  // In PDF structure, multiple %%EOF and startxref indicate post-generation alteration sessions
  const eofMatches = raw.match(/%%EOF/g) || [];
  const startXrefMatches = raw.match(/startxref/g) || [];
  const revisionCount = Math.max(1, eofMatches.length, startXrefMatches.length);

  // 4. Detect Graphic & PDF Editing Software Signatures
  const allSoftwareString = `${producer || ''} ${creator || ''} ${rawUtf8.substring(0, 4000)}`.toLowerCase();
  
  let editingToolDetected: string | null = null;
  const observations: string[] = [];
  let riskScore = 15; // Baseline risk for unsigned legacy doc

  // Photoshop / Raster Graphics
  if (allSoftwareString.includes('photoshop') || allSoftwareString.includes('imageready')) {
    editingToolDetected = 'Adobe Photoshop';
    riskScore += 55;
    observations.push('Document was generated or altered using Adobe Photoshop (Raster Graphics Editor).');
  } else if (allSoftwareString.includes('canva')) {
    editingToolDetected = 'Canva Design Platform';
    riskScore += 45;
    observations.push('Document was designed or modified using Canva (Online Design Editor).');
  } else if (allSoftwareString.includes('illustrator')) {
    editingToolDetected = 'Adobe Illustrator';
    riskScore += 40;
    observations.push('Vector graphic editing traces detected (Adobe Illustrator).');
  } else if (allSoftwareString.includes('gimp') || allSoftwareString.includes('paint.net')) {
    editingToolDetected = 'GIMP / Raster Editor';
    riskScore += 50;
    observations.push('Open-source image editing software signatures detected.');
  } else if (
    allSoftwareString.includes('sejda') ||
    allSoftwareString.includes('pdfescape') ||
    allSoftwareString.includes('ilovepdf') ||
    allSoftwareString.includes('smallpdf') ||
    allSoftwareString.includes('wondershare') ||
    allSoftwareString.includes('nitro')
  ) {
    editingToolDetected = 'Online PDF Alteration Tool';
    riskScore += 35;
    observations.push('Document was processed through an online/commercial PDF modification utility.');
  } else if (allSoftwareString.includes('acrobat pro') || allSoftwareString.includes('acrobat distiller')) {
    editingToolDetected = 'Adobe Acrobat Pro';
    if (revisionCount > 1) {
      riskScore += 25;
      observations.push('Document contains secondary revision layers saved with Adobe Acrobat.');
    }
  } else if (producer || creator) {
    editingToolDetected = producer || creator;
    observations.push(`Original creation software identified as: ${editingToolDetected}`);
  }

  // 5. Check Incremental Revision Anomaly
  if (revisionCount > 1) {
    riskScore += Math.min(25, (revisionCount - 1) * 15);
    observations.push(`Multiple modification layers (${revisionCount} revisions) detected. Document was edited after initial generation.`);
  }

  // 6. Check Creation vs Modification Date Delta
  if (creationDate && modDate) {
    const timeDeltaMs = modDate.getTime() - creationDate.getTime();
    const timeDeltaMinutes = Math.floor(timeDeltaMs / (1000 * 60));
    
    if (timeDeltaMinutes > 60) {
      const days = Math.floor(timeDeltaMinutes / (60 * 24));
      if (days > 1) {
        riskScore += 20;
        observations.push(`Modification timestamp is ${days} days after initial creation date.`);
      } else {
        riskScore += 10;
        observations.push(`Document was re-saved ${timeDeltaMinutes} minutes after initial creation.`);
      }
    } else {
      observations.push('Creation and modification timestamps are closely synchronized.');
    }
  }

  // 7. Check Font & Stream Manipulations
  const fontCount = (raw.match(/\/Type\s*\/Font\b/g) || []).length;
  if (fontCount > 0) {
    observations.push(`Document contains ${fontCount} embedded font dictionary definitions.`);
  }

  // Cap risk score between 5 and 99
  riskScore = Math.min(99, Math.max(5, riskScore));

  let riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' = 'LOW_RISK';
  let riskSummary = 'Document shows clean single-pass generation with standard structure.';

  if (riskScore >= 60) {
    riskLevel = 'HIGH_RISK';
    riskSummary = 'High probability of document modification or graphical tampering detected.';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM_RISK';
    riskSummary = 'Moderate anomalies or secondary edit sessions detected in document metadata.';
  }

  return {
    isLegacyUnsigned: true,
    producer: producer || 'Standard PDF Engine',
    creator: creator || 'Desktop Publisher',
    creationDate: creationDate ? creationDate.toISOString() : null,
    modificationDate: modDate ? modDate.toISOString() : null,
    revisionCount,
    editingToolDetected,
    riskLevel,
    riskScore,
    riskSummary,
    observations,
    metadata: {
      title: title || undefined,
      author: author || undefined,
      subject: subject || undefined,
      pdfVersion,
      hasXMP: raw.includes('<?xpacket') || raw.includes('<x:xmpmeta'),
    },
  };
}
