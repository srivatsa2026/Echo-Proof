# 🔐 Lit Protocol – The Complete Guide (Markdown Documentation)

---

## 📌 What is Lit Protocol?

Lit Protocol is a **decentralized key management network** that provides encryption, decryption, and access control based on **blockchain identities** and smart contract logic.

Think of it as:
- 🔑 A decentralized AWS KMS
- 🪪 A Web3-native Auth + Access Control system
- 🔒 End-to-end encryption powered by wallet/NFT/token ownership

---

## 🚀 Why Use Lit Protocol?

| Feature                 | Why It’s Useful                                                                 |
|-------------------------|----------------------------------------------------------------------------------|
| 🔐 Decentralized Keys   | No centralized key server, so no single point of failure                         |
| 🧱 Fine-grained Access  | Control decryption via wallet address, token balance, NFT ownership, DAO roles   |
| 👛 Wallet-Based Auth    | Sign messages instead of using passwords                                         |
| 🌐 Multi-Chain Support  | Access rules can span Ethereum, Polygon, Optimism, Avalanche, etc.              |
| 📜 Decryption Auditing  | Track who accessed what (via Chronicle)                                          |
| 💾 IPFS Friendly        | Store encrypted data on decentralized storage easily                            |

---

## 🛠️ Core Concepts

### 🔑 Authentication with `authSig`

- Lit uses `authSig` — a message signed by the user's wallet — to verify identity.
- This avoids passwords, logins, or centralized authentication services.

### 🔐 Symmetric Encryption

- Encrypt messages using AES (symmetric key encryption)
- Then encrypt that key using Lit, with an access policy

### 🧱 Access Control Conditions (ACC)

You can define complex access logic such as:

- Must own a specific NFT
- Must have a token balance > 1 MATIC
- Must be part of a DAO
- Must pass multiple conditions (AND/OR logic)

```js
const accessControlConditions = [
  {
    contractAddress: "0xABC...",
    standardContractType: "ERC721",
    chain: "ethereum",
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">",
      value: "0"
    }
  }
];
```

---

## ⛓ Supported Blockchains

Lit Protocol supports multiple EVM-compatible blockchains:

- Ethereum (mainnet, Sepolia)
- Polygon (mainnet, Mumbai)
- Avalanche
- Optimism
- Arbitrum
- Cronos

Each access condition includes the `chain` field to specify the blockchain.

---

## 🌐 Lit Testnet — Yellowstone

**Yellowstone** is the decentralized network of Lit nodes used for testnet deployments.

### Features:
- Free to use for developers
- Used for encryption key sharing, ACL enforcement, and decryption validation
- Powers development + testing of your dApp before mainnet

### How It Works:
- Developers send `saveEncryptionKey()` and `getEncryptionKey()` requests
- Lit testnet nodes validate access based on ACLs
- If user satisfies conditions, the decryption key is released

---

## 🪙 Lit Protocol Tokens

### 1. `LPX` (Mainnet Token - Coming Soon)

- Governance token of the Lit ecosystem
- Will be used for node staking, protocol fees, governance voting
- Still in test/development phase

### 2. `tstLPX` (Testnet Token)

- Free token for testing on Yellowstone testnet
- Used for testing access rules, interactions, encryption, and decryption
- Available via [Testnet Faucet](https://developer.litprotocol.com/getting-started/testnet-tokens)

---

## 🧾 Chronicle (Audit Layer)

Chronicle is Lit’s decentralized logging system for:
- Tracking who requested decryption
- When it was requested
- Whether it was allowed

Useful for audit logs and compliance systems.

---

## 🧰 Code Examples

### Install SDK

```bash
npm install lit-protocol
```

### Initialize

```js
import { LitNodeClient } from 'lit-protocol';

const litNodeClient = new LitNodeClient();
await litNodeClient.connect();
```

### Encrypt & Save Key

```js
const { encryptedString, symmetricKey } = await LitJsSdk.encryptString("Secret message");

const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
  accessControlConditions,
  symmetricKey,
  chain: 'mumbai',
  authSig
});
```

### Decrypt

```js
const decryptedSymmetricKey = await litNodeClient.getEncryptionKey({
  accessControlConditions,
  toDecrypt: encryptedSymmetricKey,
  chain: 'mumbai',
  authSig
});

const decryptedString = await LitJsSdk.decryptString(
  encryptedString,
  decryptedSymmetricKey
);
```

---

## 📦 Useful Links

- Docs: https://developer.litprotocol.com
- SDK Playground: https://developer.litprotocol.com/playground
- Faucet for tstLPX: https://developer.litprotocol.com/getting-started/testnet-tokens
- GitHub: https://github.com/LIT-Protocol

---

## ✅ Summary

| Concept           | Explanation                                      |
|------------------|--------------------------------------------------|
| Wallet Auth       | Sign with wallet, no passwords                  |
| Access Control    | NFT/Token/DAO rules for decryption              |
| AES Encryption    | Message encryption before sharing               |
| Lit Node Network  | Decentralized key sharing                       |
| tstLPX Token      | Used for testing access control                 |
| Chronicle         | Decryption log auditing                         |
| Yellowstone       | Lit's decentralized testnet network             |

---

## 💬 Use Case Example: Encrypted Messaging dApp

1. Encrypt message using AES
2. Save encrypted message to IPFS
3. Encrypt AES key using Lit + access rules
4. Store encrypted AES key
5. On read, user proves identity via wallet (`authSig`)
6. If access rule passes → decrypt AES key → decrypt message

---

## ⚠️ What Can Be Ignored for Now

| Feature           | Skip Unless…                                       |
|------------------|-----------------------------------------------------|
| LPX Tokenomics    | You're buying/staking tokens                       |
| Chronicle Logs    | You need audit/compliance                          |
| Custom Nodes      | You're contributing to protocol                    |
| Pay-Per-Decrypt   | You're monetizing your data                        |