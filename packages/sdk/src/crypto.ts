import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64, toBase64 } from '@mysten/bcs';
import type { StoredKeyPair } from './types';

export class AnchorProofCrypto {
  private keypair: Ed25519Keypair;
  private storedPrivateKey: string;

  private constructor(keypair: Ed25519Keypair, privateKeyBase64: string) {
    this.keypair = keypair;
    this.storedPrivateKey = privateKeyBase64;
  }

  static generate(): StoredKeyPair {
    const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    const privateKeyBase64 = toBase64(privateKeyBytes);

    return {
      publicKey: toBase64(keypair.getPublicKey().toRawBytes()),
      privateKey: privateKeyBase64,
      suiAddress: keypair.getPublicKey().toSuiAddress(),
    };
  }

  static fromPrivateKey(privateKeyBase64: string): AnchorProofCrypto {
    const privateKeyBytes = fromBase64(privateKeyBase64);
    const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    return new AnchorProofCrypto(keypair, privateKeyBase64);
  }

  async signMessage(message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    const signature = await this.keypair.sign(messageBytes);
    return toBase64(signature);
  }

  getPublicKey(): string {
    return toBase64(this.keypair.getPublicKey().toRawBytes());
  }

  getSuiAddress(): string {
    return this.keypair.getPublicKey().toSuiAddress();
  }

  getPrivateKey(): string {
    return this.storedPrivateKey;
  }
}
