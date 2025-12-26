import * as crypto from 'node:crypto';

// 模拟 SystemConfigService 中的加密/解密逻辑
const algorithm = 'aes-256-cbc';
const secret = process.env.APP_SECRET || 'default-secret-key-must-be-changed';
const encryptionKey = crypto.scryptSync(secret, 'salt', 32);

function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
    const textParts = text.split(':');
    if (textParts.length !== 2)
        throw new Error('Invalid encrypted text format');

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// 测试
const originalText = 'my-secret-value-123';
console.log('Original:', originalText);

const encrypted = encrypt(originalText);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);

if (originalText === decrypted) {
    console.log('✅ Encryption/Decryption verification successful!');
} else {
    console.log('❌ Encryption/Decryption verification failed!');
}
