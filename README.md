# @alarife/tools - Command line functionalities for plugin management in Alarife.

<div align="center">

[![NPM Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/@alarife/tools)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

**Alarife CLI toolset for plugin development**

</div>

## 📋 Table of Contents

- [Installation](#-installation)
- [Commands](#-commands)
- [Basic Usage](#-basic-usage)
- [License](#-license)

## 🚀 Installation

```bash
npm install @alarife/tools --save-dev
```

## ⚙️ Commands

| Command | Description |
|---|---|
| `add-license` | Add the license paragraph to the beginning of each file. |
| `copy` | Copy files from source to target. |
| `generate-key` | Generate a random key pair (public/private). |
| `encrypt` | Encrypt a value with a public key. |
| `decrypt` | Decrypt a value with a private key. |
| `new-plugin` | Generate a new plugin from the Alarife skeleton. |

## 📦 Basic Usage

### `add-license`

Adds a license header to all matching files in a directory. Files that already contain a license header are skipped.

```bash
alarife-tools add-license ./src \
  --extensions ts js \
  --project-name=@alarife/tools \
  --project-author="Soria Garcia Jose Eduardo" \
  --project-license=Apache-2.0
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `path` | argument | ✅ | — | Path to the directory to process. |
| `--extensions` | option | ❌ | `js` | File extensions to include (variadic). |
| `--project-name` | option | ✅ | — | Name of the project. |
| `--project-author` | option | ✅ | — | Author of the project. |
| `--project-license` | option | ❌ | `Apache-2.0` | License identifier. |

---

### `copy`

Copies files or directories from a source path to a target path.

```bash
alarife-tools copy ./src ./dist --deep
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `source` | argument | ✅ | — | Path to the source file or directory. |
| `target` | argument | ✅ | — | Path to the target location. |
| `--deep`, `-d` | option | ❌ | `false` | Copy directories recursively. |

---

### `generate-key`

Generates a cryptographic key pair and saves the private key to the specified path. The public key is printed to stdout.

```bash
alarife-tools generate-key ./keys/private.pem \
  --key-type=ed25519 \
  --key-format=pem
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `target` | argument | ✅ | — | Path to save the generated private key. |
| `--key-type` | option | ❌ | `ed25519` | Type of key to generate. |
| `--private-export-type` | option | ❌ | `pkcs8` | Private key export type. |
| `--public-export-type` | option | ❌ | `spki` | Public key export type. |
| `--key-format` | option | ❌ | `pem` | Key export format. |

---

### `encrypt`

Encrypts a value using a public key. The output is prefixed with `{cipher}`.

```bash
alarife-tools encrypt "my-secret-value" ./keys/public.pem --encoding=base64
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | argument | ✅ | — | Value to encrypt. |
| `key-path` | argument | ✅ | — | Path to the public key file. |
| `--encoding` | option | ❌ | `base64` | Encoding for the encrypted output. |

---

### `decrypt`

Decrypts a `{cipher}` prefixed value using a private key.

```bash
alarife-tools decrypt "{cipher}encrypted-value" ./keys/private.pem --encoding=base64
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | argument | ✅ | — | Encrypted value to decrypt (with or without `{cipher}` prefix). |
| `key-path` | argument | ✅ | — | Path to the private key file. |
| `--encoding` | option | ❌ | `base64` | Input encoding of the encrypted value. |

---

### `new-plugin`

Scaffolds a new Alarife plugin from the official skeleton repository.

```bash
alarife-tools new-plugin ./my-plugin \
  --author-name="Soria Garcia Jose Eduardo" \
  --author-email="alarifeproyect@gmail.com" \
  --library-name=alarife-my-plugin \
  --package-name=@alarife/my-plugin \
  --package-description="My custom Alarife plugin" \
  --plugin-resume="A brief description of the plugin"
```

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `target` | argument | ✅ | — | Path to generate the plugin. |
| `--author-name` | option | ✅ | — | Plugin author name. |
| `--author-email` | option | ✅ | — | Plugin author email. |
| `--library-name` | option | ✅ | — | Library name for the plugin. |
| `--package-name` | option | ✅ | — | NPM package name. |
| `--package-description` | option | ✅ | — | Package description. |
| `--plugin-resume` | option | ✅ | — | Short plugin summary. |

## 📄 License

This project is licensed under Apache-2.0. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Jose Eduardo Soria Garcia](mailto:alarifeproyect@gmail.com)**

<sub>🌍 Product developed in Andalucia, España 🇪🇸</sub>

*Part of the Alarife ecosystem*

</div>

