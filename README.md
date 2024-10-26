# Disappear CLI

Disappear CLI is a command-line interface for Disappear.net, enabling users to securely share encrypted and ephemeral messages and files using mnemonic phrases.

## Table of Contents
- [About Disappear.net](#about-disappearnet)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Encrypting a Note](#encrypting-a-note)
    - [Encrypting a File](#encrypting-a-file)
    - [Decrypting Content](#decrypting-content)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## About Disappear.net

Disappear.net is a platform that offers secure, ephemeral messaging by utilizing mnemonic phrases for encryption and decryption. Messages and files encrypted through Disappear.net are stored temporarily and automatically expire after a specified duration.

## Features

- **Secure Encryption**: Uses mnemonic phrases to derive encryption keys.
- **Ephemeral Messaging**: Set expiration times for messages and files.
- **File Support**: Encrypt and decrypt files up to 10MB.
- **CLI Convenience**: Interact with Disappear.net directly from your terminal.

## Installation

### Prerequisites

- Node.js version 16 or higher.
- npm (Node Package Manager).

### Steps

1. Clone the Repository
        ```bash
        git clone https://github.com/yourusername/disappear-cli.git
        cd disappear-cli
        ```
2. Install Dependencies
        ```bash
        npm install
        ```
3. Build the Executable (Optional)

        If you want to build standalone executables for Linux and macOS:
        ```bash
        npm run build
        ```
        The executables will be located in the `build/` directory.

## Usage

You can use the CLI directly with Node.js or use the built executables.

### Using Node.js
```bash
node src/main.js [command] [options]
```

### Using the Executable (After Build)
```bash
./build/disappear-cli [command] [options]
```

### Commands

- `put`: Encrypt and store a note or file.
- `get`: Decrypt and retrieve a note or file using a mnemonic.

### Encrypting a Note
```bash
node src/main.js put --text "Your secret message here"
```
Example:
```bash
node src/main.js put --text "Hello, this is a secret note!"
```
Output:
```plaintext
Generated Mnemonic Phrase:
--------------------------
glove once frozen vendor among shrimp pilot ocean plug grid radar system
? Select expiration time in hours: (Use arrow keys)
❯ 1
    2
    4
    8
    12
    24
    48
```
After selecting the expiration time, your note will be encrypted and stored. Keep the mnemonic phrase safe; you'll need it to decrypt the note.

### Encrypting a File
```bash
node src/main.js put --file /path/to/your/file.txt
```
Example:
```bash
node src/main.js put --file ./secret.pdf
```
Output:
```plaintext
Generated Mnemonic Phrase:
--------------------------
float smart salad maze bonus picnic relief bus dinner giant concert buzz
? Select expiration time in hours: (Use arrow keys)
❯ 1
    2
    4
    8
    12
    24
    48
```

### Decrypting Content

Use the mnemonic phrase generated during encryption to decrypt and retrieve your note or file.
```bash
node src/main.js get --mnemonic "your mnemonic phrase here"
```
Example for Note:
```bash
node src/main.js get --mnemonic "glove once frozen vendor among shrimp pilot ocean plug grid radar system"
```
Output:
```plaintext
Decrypted Note:
----------------
Hello, this is a secret note!
```
Example for File:
```bash
node src/main.js get --mnemonic "float smart salad maze bonus picnic relief bus dinner giant concert buzz"
```
Output:
```plaintext
File saved as secret.pdf
```

## Testing

### Prerequisites

Jest is used as the testing framework.

### Running Tests
```bash
npm test
```
This command will run all test suites located alongside the source files, matching the pattern `*.test.js`.

### Test Structure

Tests are located next to their corresponding modules. For example:
```plaintext
src/
├── main.js
├── main.test.js
├── models
│   ├── encryption.js
│   └── encryption.test.js
└── utils
        ├── utils.js
        └── utils.test.js
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Repository
2. Create a Feature Branch
        ```bash
        git checkout -b feature/YourFeature
        ```
3. Commit Your Changes
        ```bash
        git commit -m "Add your feature"
        ```
4. Push to the Branch
        ```bash
        git push origin feature/YourFeature
        ```
5. Open a Pull Request

## License

disappear-cli © 2024 by @eliyastein is licensed under CC BY-NC 4.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc/4.0/

**Disclaimer**: This CLI is a tool to interact with Disappear.net. Please ensure you comply with all relevant laws and terms of service when using this application.