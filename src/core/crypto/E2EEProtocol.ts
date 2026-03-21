import nacl from 'tweetnacl';

export type KeyPair = {
  publicKey: string;  // Base64 encoded
  privateKey: string; // Base64 encoded
};

// ==========================================
// PURE REACT NATIVE POLYFILLS (NUCLEAR OPTION)
// No NodeJS dependencies allowed. Period.
// ==========================================
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64lookup = new Uint8Array(256);
for (let i = 0; i < b64chars.length; i++) b64lookup[b64chars.charCodeAt(i)] = i;

export const encodeBase64 = (array: Uint8Array): string => {
  let base64 = '';
  const len = array.length;
  for (let i = 0; i < len; i += 3) {
    base64 += b64chars[array[i] >> 2];
    base64 += b64chars[((array[i] & 3) << 4) | (array[i + 1] >> 4)];
    base64 += b64chars[((array[i + 1] & 15) << 2) | (array[i + 2] >> 6)];
    base64 += b64chars[array[i + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + '==';
  }
  return base64;
};

export const decodeBase64 = (base64: string): Uint8Array => {
  let bufferLength = base64.length * 0.75;
  let len = base64.length;
  let i;
  let p = 0;
  let e1, e2, e3, e4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }
  const bytes = new Uint8Array(bufferLength);
  for (i = 0; i < len; i += 4) {
    e1 = b64lookup[base64.charCodeAt(i)];
    e2 = b64lookup[base64.charCodeAt(i + 1)];
    e3 = b64lookup[base64.charCodeAt(i + 2)];
    e4 = b64lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
};

export const decodeUTF8 = (array: Uint8Array): string => {
  let s = '';
  // Convert 8-bit bytes to a JS string, then properly URI decode it to support emoji/unicode natively
  for (let i = 0; i < array.length; i++) {
    s += String.fromCharCode(array[i]);
  }
  try {
    return decodeURIComponent(escape(s));
  } catch (e) {
    return s;
  }
};

export const encodeUTF8 = (str: string): Uint8Array => {
  // Convert JS string containing emoji/unicode to properly sized 8-bit payload
  str = unescape(encodeURIComponent(str));
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
};
// ==========================================


class E2EEProtocol {
  public generateIdentity(): KeyPair {
    const keypair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keypair.publicKey),
      privateKey: encodeBase64(keypair.secretKey),
    };
  }

  public encryptForUser(
    messageOrPayload: string, 
    receiverPublicKeyBase64: string, 
    senderPrivateKeyBase64: string
  ): { encryptedMessage: string; nonce: string } {
    
    const receiverPublicKey = decodeBase64(receiverPublicKeyBase64);
    const senderPrivateKey = decodeBase64(senderPrivateKeyBase64);
    
    const messageUint8 = decodeUTF8(messageOrPayload);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    const encryptedBox = nacl.box(
        messageUint8, 
        nonce, 
        receiverPublicKey, 
        senderPrivateKey
    );

    return {
      encryptedMessage: encodeBase64(encryptedBox),
      nonce: encodeBase64(nonce)
    };
  }

  public decryptFromUser(
    encryptedMessageBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
    myPrivateKeyBase64: string
  ): string | null {
    
    const encryptedBox = decodeBase64(encryptedMessageBase64);
    const nonce = decodeBase64(nonceBase64);
    const senderPublicKey = decodeBase64(senderPublicKeyBase64);
    const myPrivateKey = decodeBase64(myPrivateKeyBase64);

    const decryptedUint8 = nacl.box.open(
        encryptedBox, 
        nonce, 
        senderPublicKey, 
        myPrivateKey
    );

    if (!decryptedUint8) {
      console.error("[E2EE Protocol] 🚨 Critical Error: Message tampered or invalid keys!");
      return null;
    }

    return encodeUTF8(decryptedUint8);
  }

  public hashString(input: string): string {
    const inputUint8 = decodeUTF8(input);
    const hash = nacl.hash(inputUint8);
    return encodeBase64(hash);
  }
}

export default new E2EEProtocol();
