// utils/utils.js

const bip39 = require('bip39');
const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

async function deriveKeyFromMnemonic(mnemonic) {
    if (bip39.validateMnemonic(mnemonic)) {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const keyMaterial = seed.slice(0, 32);

        return crypto.createSecretKey(keyMaterial);
    } else {
        const salt = crypto.createHash('sha256').update(mnemonic).digest();

        const keyMaterial = await new Promise((resolve, reject) => {
            crypto.pbkdf2(mnemonic, salt, 100000, 32, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(crypto.createSecretKey(derivedKey));
            });
        });

        return keyMaterial;
    }
}

async function hashMnemonic(mnemonic) {
    const hash = crypto.createHash('sha256').update(mnemonic).digest('hex');
    return hash;
}

function arrayBufferToBase64(buffer) {
    return buffer.toString('base64');
}

function base64ToUint8Array(base64) {
    return Buffer.from(base64, 'base64');
}

function uint8ArrayToBase64(u8Arr) {
    return Buffer.from(u8Arr).toString('base64');
}

async function mnemonicExists(mnemonic) {
    const hash = await hashMnemonic(mnemonic);
    const { checkHash } = require('./api');
    const exists = await checkHash(hash);
    return exists;
}

module.exports = {
    deriveKeyFromMnemonic,
    hashMnemonic,
    arrayBufferToBase64,
    base64ToUint8Array,
    uint8ArrayToBase64,
    mnemonicExists,
    TextEncoder,
    TextDecoder
};
