// Simple encryption utility for immediate testing
// This doesn't require Lit Protocol and can be used right away

// Simple encryption fallback (for development/testing)
export const simpleEncrypt = (message: string, key: string): string => {
    // This is a simple XOR encryption for development
    // In production, use proper encryption
    const keyBytes = new TextEncoder().encode(key);
    const messageBytes = new TextEncoder().encode(message);
    const encrypted = new Uint8Array(messageBytes.length);

    for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return btoa(String.fromCharCode(...encrypted));
};

// Simple decryption fallback (for development/testing)
export const simpleDecrypt = (encryptedMessage: string, key: string): string => {
    // This is a simple XOR decryption for development
    // In production, use proper decryption
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = new Uint8Array(
        atob(encryptedMessage).split('').map(char => char.charCodeAt(0))
    );
    const decrypted = new Uint8Array(encryptedBytes.length);

    for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decrypted);
};

// Simple encryption wrapper that mimics the Lit Protocol interface
export const encryptMessage = async (
    message: string,
    chatroomId: string,
    wallet: any,
    walletAddress: string
): Promise<{
    encryptedMessage: string;
    encryptedSymmetricKey: string;
}> => {
    try {
        console.log('🔐 SIMPLE ENCRYPTION STARTED');
        console.log('🔐 Input message:', message);
        console.log('🔐 Chatroom ID:', chatroomId);
        console.log('🔐 Wallet address:', walletAddress);

        const encryptedMessage = simpleEncrypt(message, chatroomId);
        const encryptedSymmetricKey = 'simple-encryption-key-' + Date.now(); // Make it unique

        console.log('🔐 Encryption completed:');
        console.log('🔐 Encrypted message length:', encryptedMessage.length);
        console.log('🔐 Encryption key:', encryptedSymmetricKey);

        const result = {
            encryptedMessage,
            encryptedSymmetricKey,
        };

        console.log('🔐 Returning result:', result);
        return result;
    } catch (error) {
        console.error('❌ Error in simple encryption:', error);
        throw error;
    }
};

// Test function to verify encryption is working
export const testEncryption = async () => {
    console.log('🧪 Testing encryption...');
    try {
        const result = await encryptMessage(
            'test message',
            'test-chatroom-id',
            null,
            'test-wallet-address'
        );
        console.log('🧪 Test encryption result:', result);
        return result;
    } catch (error) {
        console.error('🧪 Test encryption failed:', error);
        throw error;
    }
};

// Simple decryption wrapper that mimics the Lit Protocol interface
export const decryptMessage = async (
    encryptedMessage: string,
    encryptedSymmetricKey: string,
    chatroomId: string,
    wallet: any,
    walletAddress: string
): Promise<string> => {
    try {
        // Check if this is a simple encrypted message
        if (encryptedSymmetricKey === 'simple-encryption-key') {
            return simpleDecrypt(encryptedMessage, chatroomId);
        }

        // If not simple encryption, try to decrypt as simple anyway
        console.log('Attempting simple decryption');
        return simpleDecrypt(encryptedMessage, chatroomId);
    } catch (error) {
        console.error('Error in simple decryption:', error);
        throw error;
    }
}; 