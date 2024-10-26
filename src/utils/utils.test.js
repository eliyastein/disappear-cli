// utils/utils.test.js

const crypto = require('crypto');
const bip39 = require('bip39');
const { deriveKeyFromMnemonic } = require('./utils');

jest.mock('bip39');
jest.mock('crypto');

describe('deriveKeyFromMnemonic', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should derive key from valid mnemonic', async () => {
        const mnemonic = 'valid mnemonic';
        const seed = Buffer.alloc(64, 'a');
        const keyMaterial = seed.slice(0, 32);
        const secretKey = crypto.createSecretKey(keyMaterial);

        bip39.validateMnemonic.mockReturnValue(true);
        bip39.mnemonicToSeedSync.mockReturnValue(seed);
        crypto.createSecretKey.mockReturnValue(secretKey);

        const result = await deriveKeyFromMnemonic(mnemonic);

        expect(bip39.validateMnemonic).toHaveBeenCalledWith(mnemonic);
        expect(bip39.mnemonicToSeedSync).toHaveBeenCalledWith(mnemonic);
        expect(crypto.createSecretKey).toHaveBeenCalledWith(keyMaterial);
        expect(result).toBe(secretKey);
    });

    test('should derive key from invalid mnemonic using pbkdf2', async () => {
        const mnemonic = 'invalid mnemonic';
        const salt = Buffer.alloc(32, 'b');
        const derivedKey = Buffer.alloc(32, 'c');
        const secretKey = crypto.createSecretKey(derivedKey);

        bip39.validateMnemonic.mockReturnValue(false);
        crypto.createHash.mockReturnValue({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue(salt),
        });
        crypto.pbkdf2.mockImplementation((mnemonic, salt, iterations, keylen, digest, callback) => {
            callback(null, derivedKey);
        });
        crypto.createSecretKey.mockReturnValue(secretKey);

        const result = await deriveKeyFromMnemonic(mnemonic);

        expect(bip39.validateMnemonic).toHaveBeenCalledWith(mnemonic);
        expect(crypto.createHash).toHaveBeenCalledWith('sha256');
        expect(crypto.createHash().update).toHaveBeenCalledWith(mnemonic);
        expect(crypto.createHash().digest).toHaveBeenCalledWith();
        expect(crypto.pbkdf2).toHaveBeenCalledWith(mnemonic, salt, 100000, 32, 'sha256', expect.any(Function));
        expect(crypto.createSecretKey).toHaveBeenCalledWith(derivedKey);
        expect(result).toBe(secretKey);
    });

    test('should throw error if pbkdf2 fails', async () => {
        const mnemonic = 'invalid mnemonic';
        const salt = Buffer.alloc(32, 'b');
        const error = new Error('pbkdf2 error');

        bip39.validateMnemonic.mockReturnValue(false);
        crypto.createHash.mockReturnValue({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue(salt),
        });
        crypto.pbkdf2.mockImplementation((mnemonic, salt, iterations, keylen, digest, callback) => {
            callback(error);
        });

        await expect(deriveKeyFromMnemonic(mnemonic)).rejects.toThrow('pbkdf2 error');

        expect(bip39.validateMnemonic).toHaveBeenCalledWith(mnemonic);
        expect(crypto.createHash).toHaveBeenCalledWith('sha256');
        expect(crypto.createHash().update).toHaveBeenCalledWith(mnemonic);
        expect(crypto.createHash().digest).toHaveBeenCalledWith();
        expect(crypto.pbkdf2).toHaveBeenCalledWith(mnemonic, salt, 100000, 32, 'sha256', expect.any(Function));
    });
});