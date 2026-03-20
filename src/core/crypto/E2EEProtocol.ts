import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

export type KeyPair = {
  publicKey: string;  // Base64 encoded
  privateKey: string; // Base64 encoded
};

/**
 * E2EEProtocol Engine
 * 
 * In a Mesh Network, messages route through intermediate devices (hops).
 * To ensure absolute privacy, we use Elliptic-curve Diffie-Hellman (ECDH) 
 * via Curve25519 to establish a secure shared secret, and XSalsa20-Poly1305 
 * to encrypt the actual message/media payload.
 * 
 * This makes it mathematically impossible for 'hops' to read the data.
 */
class E2EEProtocol {
  /**
   * 1. GENERATE IDENTITY
   * Creates a brand new Ed25519 KeyPair for the user.
   * In Gorakh Chat, the Public Key ITSELF acts as the User ID/Phone Number.
   */
  public generateIdentity(): KeyPair {
    // Generate a secure ed25519 key pair using TweetNaCl
    const keypair = nacl.box.keyPair();
    
    return {
      publicKey: util.encodeBase64(keypair.publicKey),
      privateKey: util.encodeBase64(keypair.secretKey),
    };
  }

  /**
   * 2. ENCRYPT DATA TO A SPECIFIC USER
   * We use `nacl.box` which authenticates and encrypts the message.
   * Only the targeted receiver (who holds the matching private key) can open it.
   */
  public encryptForUser(
    messageOrPayload: string, 
    receiverPublicKeyBase64: string, 
    senderPrivateKeyBase64: string
  ): { encryptedMessage: string; nonce: string } {
    
    const receiverPublicKey = util.decodeBase64(receiverPublicKeyBase64);
    const senderPrivateKey = util.decodeBase64(senderPrivateKeyBase64);
    
    // Convert string message to Uint8Array
    const messageUint8 = util.decodeUTF8(messageOrPayload);

    // Generate a unique 24-byte nonce (Number Used Once) for this specific message
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // Encrypt the message (XSalsa20-Poly1305 + Curve25519 ECDH)
    const encryptedBox = nacl.box(
        messageUint8, 
        nonce, 
        receiverPublicKey, 
        senderPrivateKey
    );

    return {
      encryptedMessage: util.encodeBase64(encryptedBox),
      nonce: util.encodeBase64(nonce)
    };
  }

  /**
   * 3. DECRYPT DATA RECEIVED FROM A USER
   * We need the sender's public key (to verify it was really them) 
   * and our private key (to unlock the box).
   */
  public decryptFromUser(
    encryptedMessageBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
    myPrivateKeyBase64: string
  ): string | null {
    
    const encryptedBox = util.decodeBase64(encryptedMessageBase64);
    const nonce = util.decodeBase64(nonceBase64);
    const senderPublicKey = util.decodeBase64(senderPublicKeyBase64);
    const myPrivateKey = util.decodeBase64(myPrivateKeyBase64);

    // Attempt to open the box
    const decryptedUint8 = nacl.box.open(
        encryptedBox, 
        nonce, 
        senderPublicKey, 
        myPrivateKey
    );

    // If verification fails or key is wrong, this returns null 
    // (This automatically protects against tampering by intermediate hops!)
    if (!decryptedUint8) {
      console.error("[E2EE Protocol] 🚨 Critical Error: Message tampered or invalid keys!");
      return null;
    }

    // Convert back to string (JSON payload or Text Message)
    return util.encodeUTF8(decryptedUint8);
  }

  /**
   * 4. HASHING (Optional Utility)
   * Create a safe room ID or Hash for device discovery matching.
   */
  public hashString(input: string): string {
    const inputUint8 = util.decodeUTF8(input);
    const hash = nacl.hash(inputUint8);
    return util.encodeBase64(hash);
  }
}

export default new E2EEProtocol();
