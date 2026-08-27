import { generateKeyPairSync, sign as cryptoSign, verify as cryptoVerify, createHash } from 'crypto';
import { CryptoEngine, KeyPair, SignatureResult, VerificationResult, AlgorithmType } from './types';

/**
 * Ed25519 Crypto Engine
 */
export class Ed25519Engine implements CryptoEngine {
  public algorithm: AlgorithmType = 'ed25519';

  /**
   * Generates an Ed25519 key pair
   * @returns KeyPair containing PEM encoded public and private keys
   */
  public generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Signs data using Ed25519 private key
   * @param data The string data to sign
   * @param privateKey The PEM encoded private key
   * @returns SignatureResult containing base64 signature and hex data hash
   */
  public sign(data: string, privateKey: string): SignatureResult {
    const dataHash = createHash('sha256').update(data, 'utf8').digest('hex');
    const signature = cryptoSign(null, Buffer.from(data, 'utf8'), privateKey).toString('base64');
    
    return {
      signature,
      dataHash
    };
  }

  /**
   * Verifies an Ed25519 signature
   * @param data The string data that was signed
   * @param signature The base64 signature to verify
   * @param publicKey The PEM encoded public key
   * @returns VerificationResult
   */
  public verify(data: string, signature: string, publicKey: string): VerificationResult {
    try {
      const dataHash = createHash('sha256').update(data, 'utf8').digest('hex');
      const isValid = cryptoVerify(
        null,
        Buffer.from(data, 'utf8'),
        publicKey,
        Buffer.from(signature, 'base64')
      );

      return {
        isValid,
        dataHash,
        algorithm: this.algorithm,
        message: isValid ? 'Signature is valid' : 'Signature is invalid'
      };
    } catch (error) {
      return {
        isValid: false,
        dataHash: '',
        algorithm: this.algorithm,
        message: `Verification failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
