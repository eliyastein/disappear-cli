// models/encryption.js

const {
    deriveKeyFromMnemonic,
    hashMnemonic,
    TextEncoder
} = require('../utils/utils');
const { postEncryptedPayload } = require('../utils/api');
const crypto = require('crypto');
const fs = require('fs');

async function processNote(payload, mnemonic, hours) {
    try {
        const key = await deriveKeyFromMnemonic(mnemonic);
        const iv = crypto.randomBytes(12);
        const encoder = new TextEncoder();
        const encodedPayload = encoder.encode(payload);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(encodedPayload), cipher.final()]);
        const tag = cipher.getAuthTag();

        const ivBase64 = iv.toString('base64');
        const ciphertextBase64 = Buffer.concat([encrypted, tag]).toString('base64');

        const encryptedData = {
            iv: ivBase64,
            content: ciphertextBase64,
            expiration: hours,
            hash: await hashMnemonic(mnemonic)
        };

        await postEncryptedPayload(encryptedData);
    } catch (error) {
        console.error("Error encrypting note:", error);
    }
}

async function processFile(filePath, mnemonic, hours) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > 10485760) {
            console.error('File size must be less than 10MB.');
            return;
        }
        const key = await deriveKeyFromMnemonic(mnemonic);
        const iv = crypto.randomBytes(12);
        const fileName = require('path').basename(filePath);
        const fileContent = fs.readFileSync(filePath);

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(fileContent), cipher.final()]);
        const tag = cipher.getAuthTag();

        const ivBase64 = iv.toString('base64');
        const ciphertextBase64 = Buffer.concat([encrypted, tag]).toString('base64');

        const encryptedData = {
            iv: ivBase64,
            content: ciphertextBase64,
            expiration: hours,
            isFile: true,
            fileName: fileName,
            hash: await hashMnemonic(mnemonic)
        };

        await postEncryptedPayload(encryptedData);
    } catch (error) {
        console.error("Error encrypting file:", error);
    }
}

module.exports = {
    processNote,
    processFile
};
