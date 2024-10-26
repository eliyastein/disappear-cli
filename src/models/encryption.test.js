const { processFile } = require('./encryption');
const { postEncryptedPayload } = require('../utils/api');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
    deriveKeyFromMnemonic,
    hashMnemonic
} = require('../utils/utils');

jest.mock('../utils/utils');
jest.mock('../utils/api');
jest.mock('crypto');
jest.mock('fs');
jest.mock('path');

describe('processFile', () => {
    const mnemonic = 'test mnemonic';
    const hash = 'test hash';
    const filePath = 'test.txt';
    const fileName = 'test.txt';
    const fileContent = Buffer.from('file content');
    const key = Buffer.alloc(32, 'a');
    const iv = Buffer.alloc(12, 'b');
    const encrypted = Buffer.alloc(32, 'c');
    const tag = Buffer.alloc(16, 'd');
    const hours = 24;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should log error if file size exceeds 10MB', async () => {
        fs.statSync.mockReturnValue({ size: 10485761 });

        console.error = jest.fn();

        await processFile(filePath, mnemonic, hours);

        expect(console.error).toHaveBeenCalledWith('File size must be less than 10MB.');
    });

    test('should encrypt file and post encrypted payload', async () => {
        fs.statSync.mockReturnValue({ size: 1048576 });
        fs.readFileSync.mockReturnValue(fileContent);
        path.basename.mockReturnValue(fileName);
        deriveKeyFromMnemonic.mockResolvedValue(key);
        hashMnemonic.mockResolvedValue(hash);
        crypto.randomBytes.mockReturnValue(iv);
        crypto.createCipheriv.mockReturnValue({
            update: jest.fn().mockReturnValue(encrypted),
            final: jest.fn().mockReturnValue(Buffer.alloc(0)),
            getAuthTag: jest.fn().mockReturnValue(tag)
        });

        await processFile(filePath, mnemonic, hours);

        expect(postEncryptedPayload).toHaveBeenCalledWith({
            iv: iv.toString('base64'),
            content: Buffer.concat([encrypted, tag]).toString('base64'),
            expiration: hours,
            isFile: true,
            fileName: fileName,
            hash: hash
        });
    });

    test('should log error if encryption fails', async () => {
        fs.statSync.mockReturnValue({ size: 1048576 });
        fs.readFileSync.mockReturnValue(fileContent);
        path.basename.mockReturnValue(fileName);
        deriveKeyFromMnemonic.mockResolvedValue(key);
        hashMnemonic.mockResolvedValue(hash);
        crypto.randomBytes.mockReturnValue(iv);
        crypto.createCipheriv.mockImplementation(() => {
            throw new Error('encryption error');
        });

        console.error = jest.fn();

        await processFile(filePath, mnemonic, hours);

        expect(console.error).toHaveBeenCalledWith("Error encrypting file:", expect.any(Error));
    });
});