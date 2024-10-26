const program = require('./main'); 
const inquirer = require('inquirer');
const bip39 = require('bip39');
const { processNote, processFile } = require('./models/encryption');
const { processMnemonic } = require('./models/decryption');
const { mnemonicExists } = require('./utils/utils');

jest.mock('inquirer');
jest.mock('bip39');
jest.mock('./models/encryption');
jest.mock('./models/decryption');
jest.mock('./utils/utils');

describe('disappear-cli', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should prompt for expiration if not provided', async () => {
    inquirer.prompt.mockResolvedValue({ expiration: 4 });
    mnemonicExists.mockResolvedValue(false);
    bip39.generateMnemonic.mockReturnValue('test mnemonic');
    processNote.mockResolvedValue();

    await program.parseAsync(['node', 'main.js', 'put', '--text', 'test note']);

    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'list',
        name: 'expiration',
        message: 'Select expiration time in hours:',
        choices: [1, 2, 4, 8, 12, 24, 48],
      },
    ]);
    expect(processNote).toHaveBeenCalledWith('test note', 'test mnemonic', 4);
  });

  test('should generate mnemonic if not provided', async () => {
    inquirer.prompt.mockResolvedValue({ expiration: 4 });
    mnemonicExists.mockResolvedValue(false);
    bip39.generateMnemonic.mockReturnValue('test mnemonic');
    processNote.mockResolvedValue();

    await program.parseAsync(['node', 'main.js', 'put', '--text', 'test note']);

    expect(bip39.generateMnemonic).toHaveBeenCalled();
    expect(processNote).toHaveBeenCalledWith('test note', 'test mnemonic', 4);
  });

  test('should prompt for mnemonic if not provided for get command', async () => {
    inquirer.prompt.mockResolvedValue({ mnemonic: 'test mnemonic' });
    processMnemonic.mockResolvedValue();

    await program.parseAsync(['node', 'main.js', 'get']);

    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'input',
        name: 'mnemonic',
        message: 'Enter your mnemonic:',
      },
    ]);
    expect(processMnemonic).toHaveBeenCalledWith('test mnemonic');
  });
});
