import QRCode from 'qrcode';

export interface QRPayload {
  /** Protocol version */
  v: number;
  /** Certificate ID */
  id: string;
  /** Signature (truncated for QR code) */
  sig: string;
  /** Hash of the data */
  hash: string;
  /** Algorithm used */
  alg: string;
}

/**
 * Creates the QR payload object.
 * @param certificateId - The ID of the certificate.
 * @param signature - The signature to embed.
 * @param dataHash - The hash of the data.
 * @param algorithm - The signature algorithm.
 * @returns The constructed QRPayload.
 */
export function createQRPayload(
  certificateId: string,
  signature: string,
  dataHash: string,
  algorithm: string
): QRPayload {
  return {
    v: 1,
    id: certificateId,
    sig: signature.substring(0, 128),
    hash: dataHash,
    alg: algorithm,
  };
}

/**
 * Encodes the payload as a compact JSON string, then base64-encodes it.
 * @param payload - The QR payload to encode.
 * @returns The base64-encoded JSON string.
 */
export function encodePayload(payload: QRPayload): string {
  const jsonString = JSON.stringify(payload);
  return Buffer.from(jsonString).toString('base64');
}

/**
 * Generates a base64-encoded PNG data URL of the QR code.
 * @param payload - The QR payload to encode into the QR code.
 * @returns A promise that resolves to the data URL.
 */
export async function generateQRCode(payload: QRPayload): Promise<string> {
  try {
    const encodedData = encodePayload(payload);
    const dataUrl = await QRCode.toDataURL(encodedData, {
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
