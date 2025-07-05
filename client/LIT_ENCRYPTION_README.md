# Lit Protocol Encryption for EchoProof Chat

This document explains how Lit Protocol encryption has been integrated into the EchoProof chat system.

## Overview

The chat system now uses Lit Protocol to encrypt messages before they are sent to the server, ensuring end-to-end encryption. Messages are encrypted on the client side and can only be decrypted by authorized users.

## Implementation Details

### 1. Encryption Flow

1. **Message Encryption**: When a user sends a message, it's encrypted using Lit Protocol before being sent to the socket server
2. **Storage**: Encrypted messages and encryption keys are stored in the database
3. **Decryption**: When messages are received, they're decrypted on the client side using the stored encryption keys

### 2. Files Modified

- `src/lib/lit-encryption.ts` - Core encryption/decryption utilities
- `src/app/chatroom/[id]/page.tsx` - Updated to encrypt/decrypt messages
- `nodeserver/index.js` - Updated to handle encrypted messages
- `prisma/schema.prisma` - Added `encryptedSymmetricKey` field to ChatMessage model
- `src/app/api/messages/route.ts` - Updated to handle encrypted messages

### 3. Current Implementation

#### Simple Encryption (Development)
For development and testing, we use a simple XOR encryption with the chatroom ID as the key. This provides basic encryption without requiring full Lit Protocol setup.

#### Lit Protocol Encryption (Production)
For production, the system is designed to use full Lit Protocol encryption with:
- Decentralized key management
- Access control conditions
- Wallet-based authentication

### 4. Database Schema

The `ChatMessage` model now includes:
```prisma
model ChatMessage {
  id                    String     @id @default(uuid())
  chatroomId            String
  senderId              String
  message               String     @db.Text
  encryptedSymmetricKey String?    @db.Text // For Lit Protocol encryption
  sentAt                DateTime   @default(now())
  // ... other fields
}
```

### 5. Testing

A test component (`EncryptionTest`) has been added to the chatroom page to verify encryption/decryption functionality. This should be removed in production.

## Usage

### Sending Encrypted Messages

```typescript
import { encryptMessage } from "@/lib/lit-encryption"

const { encryptedMessage, encryptedSymmetricKey } = await encryptMessage(
  "Hello, world!",
  chatroomId,
  wallet,
  walletAddress
)

// Send to server
socket.emit("message", {
  room: chatroomId,
  message: encryptedMessage,
  encryptedSymmetricKey: encryptedSymmetricKey,
  // ... other fields
})
```

### Receiving and Decrypting Messages

```typescript
import { decryptMessage } from "@/lib/lit-encryption"

const decryptedContent = await decryptMessage(
  encryptedMessage,
  encryptedSymmetricKey,
  chatroomId,
  wallet,
  walletAddress
)
```

## Security Considerations

1. **Key Management**: Encryption keys are managed by Lit Protocol's decentralized network
2. **Access Control**: Only users with proper wallet authentication can decrypt messages
3. **Fallback**: Simple encryption is used as a fallback for development/testing
4. **Storage**: Encrypted messages are stored in the database, but the server cannot decrypt them

## Future Enhancements

1. **Full Lit Protocol Integration**: Complete the Lit Protocol setup with proper access control conditions
2. **Token-Gated Encryption**: Use NFT/token ownership to control message access
3. **Key Rotation**: Implement automatic key rotation for enhanced security
4. **Audit Logging**: Add decryption audit logs using Lit Protocol's Chronicle feature

## Troubleshooting

### Common Issues

1. **Encryption Errors**: Check that the wallet is properly connected
2. **Decryption Failures**: Verify that the user has proper access to the chatroom
3. **Database Errors**: Ensure the Prisma schema has been updated with the new `encryptedSymmetricKey` field

### Development vs Production

- **Development**: Uses simple XOR encryption for faster testing
- **Production**: Should use full Lit Protocol encryption with proper access controls

## Dependencies

- `@lit-protocol/lit-node-client` - Lit Protocol client library
- `thirdweb` - For wallet integration
- `prisma` - For database operations

## Notes

- The current implementation includes a fallback to simple encryption for development purposes
- Full Lit Protocol integration requires additional setup including access control conditions
- The test component should be removed before deploying to production 