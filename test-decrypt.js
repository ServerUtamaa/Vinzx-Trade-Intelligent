
import CryptoJS from 'crypto-js';
import fs from 'fs';

const masterKey = "3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a85a";
const encryptedData = JSON.parse(fs.readFileSync('encrypted_codes.json', 'utf8'));

try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData.membership, masterKey).toString(CryptoJS.enc.Utf8);
    console.log("Decrypted membership:", decrypted.substring(0, 100));
} catch (e) {
    console.log("Decryption failed with Master Key");
}
