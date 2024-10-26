// models/decryption.test.js

const { processMnemonic } = require('./decryption');
const { getEncryptedPayload } = require('../utils/api');
const crypto = require('crypto');
const fs = require('fs');

const {
    mnemonicExists,
    hashMnemonic,
    deriveKeyFromMnemonic,
    base64ToUint8Array
} = require('../utils/utils');

jest.mock('../utils/utils');
jest.mock('../utils/api');
jest.mock('crypto');
jest.mock('fs');

describe('processMnemonic', () => {
    const mnemonic = 'test mnemonic';
    const hash = 'test hash';
    const payload = {
        iv: 'test iv',
        content: 'test content',
        isFile: false,
        fileName: 'test.txt'
    };
    const key = Buffer.alloc(32, 'a');
    const iv = Buffer.alloc(12, 'b');
    const ciphertext = Buffer.alloc(32, 'c');
    const tag = Buffer.alloc(16, 'd');
    const decrypted = Buffer.from('decrypted content');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should log error if mnemonic does not exist', async () => {
        mnemonicExists.mockResolvedValue(false);

        console.error = jest.fn();

        await processMnemonic(mnemonic);

        expect(console.error).toHaveBeenCalledWith('Invalid mnemonic.');
    });

    test('should log error if no data found for mnemonic', async () => {
        mnemonicExists.mockResolvedValue(true);
        hashMnemonic.mockResolvedValue(hash);
        getEncryptedPayload.mockResolvedValue(null);

        console.error = jest.fn();

        await processMnemonic(mnemonic);

        expect(console.error).toHaveBeenCalledWith('No data found for this mnemonic.');
    });


    test('should save decrypted file', async () => {
        payload.isFile = true;
        mnemonicExists.mockResolvedValue(true);
        hashMnemonic.mockResolvedValue(hash);
        getEncryptedPayload.mockResolvedValue(payload);
        deriveKeyFromMnemonic.mockResolvedValue(key);
        base64ToUint8Array.mockImplementation((str) => Buffer.from(str, 'base64'));
        crypto.createDecipheriv.mockReturnValue({
            update: jest.fn().mockReturnValue(decrypted),
            final: jest.fn().mockReturnValue(Buffer.alloc(0)),
            setAuthTag: jest.fn()
        });

        console.log = jest.fn();

        await processMnemonic(mnemonic);

        expect(fs.writeFileSync).toHaveBeenCalledWith(payload.fileName, decrypted);
        expect(console.log).toHaveBeenCalledWith(`File saved as ${payload.fileName}`);
    });

    test('should log error if decryption fails', async () => {
        mnemonicExists.mockResolvedValue(true);
        hashMnemonic.mockResolvedValue(hash);
        getEncryptedPayload.mockResolvedValue(payload);
        deriveKeyFromMnemonic.mockResolvedValue(key);
        base64ToUint8Array.mockImplementation((str) => Buffer.from(str, 'base64'));
        crypto.createDecipheriv.mockReturnValue({
            update: jest.fn().mockImplementation(() => { throw new Error('decryption error'); }),
            final: jest.fn(),
            setAuthTag: jest.fn()
        });

        console.error = jest.fn();

        await processMnemonic(mnemonic);

        expect(console.error).toHaveBeenCalledWith('Error decrypting data:', 'decryption error');
    });
});