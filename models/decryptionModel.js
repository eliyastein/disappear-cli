// models/decryptionModel.js

const {
    mnemonicExists,
    hashMnemonic,
    deriveKeyFromMnemonic,
    base64ToUint8Array,
    TextDecoder
} = require('../utils/utils');
const { getEncryptedPayload } = require('../utils/api');
const crypto = require('crypto');
const fs = require('fs');

async function processMnemonic(mnemonic) {
    if (!(await mnemonicExists(mnemonic))) {
        console.error('Invalid mnemonic.');
        return;
    }

    const hash = await hashMnemonic(mnemonic);
    const payload = await getEncryptedPayload(hash);

    if (!payload) {
        console.error('No data found for this mnemonic.');
        return;
    }

    const key = await deriveKeyFromMnemonic(mnemonic);
    const iv = base64ToUint8Array(payload.iv).slice(0, 12);
    const ciphertextWithTag = base64ToUint8Array(payload.content);
    const tag = ciphertextWithTag.slice(-16);
    const ciphertext = ciphertextWithTag.slice(0, -16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    try {
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

        if (payload.isFile) {
            const fileName = payload.fileName || 'downloaded_file';
            fs.writeFileSync(fileName, decrypted);
            console.log(`File saved as ${fileName}`);
        } else {
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decrypted);
            console.log('Decrypted Note:');
            console.log('----------------');
            console.log(decryptedText);
        }
    } catch (error) {
        console.error('Error decrypting data:', error.message);
    }
}

module.exports = {
    processMnemonic
};
