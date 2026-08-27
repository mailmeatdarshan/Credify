import { CryptoEngine, AlgorithmType, KeyPair, SignatureResult, VerificationResult } from './types';
import { RSAEngine } from './rsa';
import { ECCEngine } from './ecc';
import { Ed25519Engine } from './ed25519';
import { hashCertificateData, CertificateData } from './hash';

export * from './types';
export { hashCertificateData, type CertificateData };

/**
 * Creates and returns the appropriate crypto engine for the given algorithm
 * @param algorithm The cryptographic algorithm to use
 * @returns An instance of CryptoEngine
 */
export function createCryptoEngine(algorithm: AlgorithmType): CryptoEngine {
  switch (algorithm) {
    case 'rsa':
      return new RSAEngine();
    case 'ecc':
      return new ECCEngine();
    case 'ed25519':
      return new Ed25519Engine();
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

/**
 * Generates a key pair using the specified algorithm
 * @param algorithm The cryptographic algorithm to use
 * @returns KeyPair
 */
export function generateKeyPair(algorithm: AlgorithmType): KeyPair {
  const engine = createCryptoEngine(algorithm);
  return engine.generateKeyPair();
}

/**
 * Hashes and signs a certificate
 * @param data The certificate data to sign
 * @param privateKey The PEM encoded private key
 * @param algorithm The cryptographic algorithm to use
 * @returns SignatureResult
 */
export function signCertificate(data: CertificateData, privateKey: string, algorithm: AlgorithmType): SignatureResult {
  const engine = createCryptoEngine(algorithm);
  const dataString = JSON.stringify(data);
  // Optional: could hash dataString first or canonicalize
  // For the prompt requirement, let's use the hash of the certificate data or stringify it directly
  const hash = hashCertificateData(data);
  return engine.sign(hash, privateKey);
}

/**
 * Verifies a signed certificate
 * @param data The certificate data that was signed
 * @param signature The base64 encoded signature
 * @param publicKey The PEM encoded public key
 * @param algorithm The cryptographic algorithm to use
 * @returns VerificationResult
 */
export function verifyCertificate(
  data: CertificateData, 
  signature: string, 
  publicKey: string, 
  algorithm: AlgorithmType
): VerificationResult {
  const engine = createCryptoEngine(algorithm);
  const hash = hashCertificateData(data);
  return engine.verify(hash, signature, publicKey);
}
