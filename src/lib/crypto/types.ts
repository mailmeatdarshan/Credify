export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SignatureResult {
  signature: string;
  dataHash: string;
}

export interface VerificationResult {
  isValid: boolean;
  dataHash: string;
  algorithm: AlgorithmType;
  message: string;
}

export type AlgorithmType = 'rsa' | 'ecc' | 'ed25519';

export interface CryptoEngine {
  algorithm: AlgorithmType;
  generateKeyPair(): KeyPair;
  sign(data: string, privateKey: string): SignatureResult;
  verify(data: string, signature: string, publicKey: string): VerificationResult;
}
