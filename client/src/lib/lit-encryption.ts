// Client-side only imports for Lit Protocol
let LitJsSdk: any = null;
let LIT_NETWORK: any = null;

// Initialize Lit Node Client
let litNodeClient: any = null;

const initializeLitClient = async () => {
    if (!litNodeClient) {
        // Only import on client side
        if (typeof window !== 'undefined') {
            if (!LitJsSdk) {
                LitJsSdk = await import("@lit-protocol/lit-node-client");
            }
            if (!LIT_NETWORK) {
                LIT_NETWORK = await import("@lit-protocol/constants");
            }

            litNodeClient = new LitJsSdk.LitNodeClient({
                litNetwork: LIT_NETWORK.LIT_NETWORK.DatilDev, // Use development network
            });
            await litNodeClient.connect();
        }
    }
    return litNodeClient;
};

// Access Control Conditions for chatroom encryption
export const createAccessControlConditions = (chatroomId: string) => {
    return [
        {
            contractAddress: '', // We'll use a simple condition for now
            standardContractType: '',
            chain: 'ethereum',
            method: '',
            parameters: [':userAddress'],
            returnValueTest: {
                comparator: '>',
                value: '0'
            }
        }
    ];
};

// Get authentication signature from thirdweb wallet
export const getAuthSignature = async (wallet: any, walletAddress: string) => {
    try {
        if (!wallet) {
            throw new Error('Wallet not connected');
        }

        const message = `I want to access encrypted messages in the chatroom. Wallet: ${walletAddress}`;

        // Sign the message using thirdweb wallet
        const signature = await wallet.sign(message);

        return {
            sig: signature,
            derivedVia: 'thirdweb.sign',
            signedMessage: message,
            address: walletAddress,
        };
    } catch (error) {
        console.error('Error getting auth signature:', error);
        // Fallback to a simple signature for development
        return {
            sig: '0x' + '0'.repeat(130), // Placeholder signature
            derivedVia: 'development.fallback',
            signedMessage: `I want to access encrypted messages in the chatroom. Wallet: ${walletAddress}`,
            address: walletAddress,
        };
    }
};

// Encrypt a message using Lit Protocol (with fallback to simple encryption)
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
        // Check if we're on client side
        if (typeof window === 'undefined') {
            throw new Error('Encryption only available on client side');
        }

        const client = await initializeLitClient();

        // Create access control conditions
        const accessControlConditions = createAccessControlConditions(chatroomId);

        // Get auth signature from wallet
        const authSig = await getAuthSignature(wallet, walletAddress);

        // Encrypt the message using Lit Protocol
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message);

        // Save the encryption key with access control
        const encryptedSymmetricKey = await client.saveEncryptionKey({
            accessControlConditions,
            symmetricKey,
            chain: 'ethereum',
            authSig,
        });

        return {
            encryptedMessage: encryptedString,
            encryptedSymmetricKey: encryptedSymmetricKey,
        };
    } catch (error) {
        console.error('Error encrypting message with Lit Protocol:', error);
        console.error('Error details:', {
            message: message,
            chatroomId: chatroomId,
            walletAddress: walletAddress,
            hasWallet: !!wallet,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : 'No stack trace'
        });

        // Fallback to simple encryption for development
        console.log('Falling back to simple encryption for development');
        const encryptedMessage = simpleEncrypt(message, chatroomId);
        return {
            encryptedMessage,
            encryptedSymmetricKey: 'simple-encryption-key', // Placeholder
        };
    }
};

// Decrypt a message using Lit Protocol (with fallback to simple decryption)
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

        // Check if we're on client side
        if (typeof window === 'undefined') {
            throw new Error('Decryption only available on client side');
        }

        const client = await initializeLitClient();

        // Create access control conditions (must match encryption)
        const accessControlConditions = createAccessControlConditions(chatroomId);

        // Get auth signature from wallet
        const authSig = await getAuthSignature(wallet, walletAddress);

        // Get the decryption key
        const decryptedSymmetricKey = await client.getEncryptionKey({
            accessControlConditions,
            toDecrypt: encryptedSymmetricKey,
            chain: 'ethereum',
            authSig,
        });

        // Decrypt the message
        const decryptedString = await LitJsSdk.decryptString(
            encryptedMessage,
            decryptedSymmetricKey
        );

        return decryptedString;
    } catch (error) {
        console.error('Error decrypting message with Lit Protocol:', error);
        // Fallback to simple decryption for development
        console.log('Falling back to simple decryption for development');
        return simpleDecrypt(encryptedMessage, chatroomId);
    }
};

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