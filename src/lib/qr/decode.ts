import jsQR from 'jsqr';
import { QRPayload } from './generate';

/**
 * Decodes base64 string and parses JSON payload.
 * @param rawData - The base64-encoded JSON string.
 * @returns The parsed QRPayload, or null if parsing fails.
 */
export function parseQRPayload(rawData: string): QRPayload | null {
  try {
    const jsonString = Buffer.from(rawData, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonString) as QRPayload;
    
    // Basic validation
    if (payload && typeof payload.v === 'number' && typeof payload.id === 'string') {
      return payload;
    }
    return null;
  } catch (error) {
    console.error('Error parsing QR payload:', error);
    return null;
  }
}

/**
 * Takes raw RGBA pixel data buffer and dimensions, decodes QR code, and parses the payload.
 * @param imageBuffer - The RGBA pixel data.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @returns The decoded QRPayload, or null if decoding fails.
 */
export function decodeQRFromImage(
  imageBuffer: Buffer,
  width: number,
  height: number
): QRPayload | null {
  try {
    // Convert Buffer to Uint8ClampedArray as required by jsQR
    const clampedArray = new Uint8ClampedArray(imageBuffer.buffer, imageBuffer.byteOffset, imageBuffer.byteLength);
    const code = jsQR(clampedArray, width, height);

    if (code) {
      return parseQRPayload(code.data);
    }
    return null;
  } catch (error) {
    console.error('Error decoding QR from image:', error);
    return null;
  }
}
