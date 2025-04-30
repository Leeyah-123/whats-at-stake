import bs58 from 'bs58';
import nacl from 'tweetnacl';

export class SigninMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;

  constructor(message: {
    domain: string;
    publicKey: string;
    nonce: string;
    statement: string;
  }) {
    this.domain = message.domain;
    this.publicKey = message.publicKey;
    this.nonce = message.nonce;
    this.statement = message.statement;
  }

  prepare() {
    return `${this.statement}\n\nDomain: ${this.domain}\nPublic Key: ${this.publicKey}\nNonce: ${this.nonce}`;
  }

  async validate(signature: string) {
    try {
      const message = this.prepare();
      const messageBytes = new TextEncoder().encode(message);
      const publicKeyBytes = bs58.decode(this.publicKey);
      const signatureBytes = bs58.decode(signature);

      const result = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      return result;
    } catch {
      return false;
    }
  }
}
