// main.js

const { Command } = require('commander');
const inquirer = require('inquirer');
const bip39 = require('bip39');
const { processNote, processFile } = require('./models/encryptionModel');
const { processMnemonic } = require('./models/decryptionModel');
const { mnemonicExists } = require('./utils/utils');

const program = new Command();

program
    .name('disappear-cli')
    .description('CLI for Disappear.net - Mnemonic Ephemeral Messaging')
    .version('0.1.0');

program
    .command('put')
    .description('Encrypt and store a note or file')
    .option('-t, --text <text>', 'Text note to encrypt')
    .option('-f, --file <path>', 'File path to encrypt')
    .option('-e, --expiration <hours>', 'Hours until expiration', parseInt)
    .option('-m, --mnemonic <mnemonic>', 'Custom mnemonic (optional)')
    .action(async (options) => {
        let { text, file, expiration, mnemonic } = options;

        if (!text && !file) {
            console.error('Error: You must provide either a text note or a file to encrypt.');
            return;
        }

        if (!expiration) {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'expiration',
                    message: 'Select expiration time in hours:',
                    choices: [1, 2, 4, 8, 12, 24, 48],
                },
            ]);
            expiration = answers.expiration;
        }

        if (!mnemonic) {
            const generateMnemonic = bip39.generateMnemonic();
            console.log('Generated Mnemonic Phrase:');
            console.log('--------------------------');
            console.log(generateMnemonic);
            mnemonic = generateMnemonic;
        } else {
            if (await mnemonicExists(mnemonic)) {
                console.error('This mnemonic has been used before. Please use a unique mnemonic.');
                return;
            }
        }

        if (text) {
            await processNote(text, mnemonic, expiration);
        } else if (file) {
            await processFile(file, mnemonic, expiration);
        }
    });

program
    .command('get')
    .description('Decrypt and retrieve a note or file using a mnemonic')
    .option('-m, --mnemonic <mnemonic>', 'Mnemonic to decrypt the content')
    .action(async (options) => {
        let { mnemonic } = options;

        if (!mnemonic) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'mnemonic',
                    message: 'Enter your mnemonic:',
                },
            ]);
            mnemonic = answers.mnemonic;
        }

        await processMnemonic(mnemonic);
    });

program.parse(process.argv);
