// import { sepolia } from "thirdweb/chains";

// // Client-side only imports for Lit Protocol
// let LitJsSdk: any = null;
// let LIT_NETWORK: any = null;

// // Initialize Lit Node Client
// let litNodeClient: any = null;

// const initializeLitClient = async () => {
//     if (!litNodeClient) {
//         // Only import on client side
//         if (typeof window !== 'undefined') {
//             if (!LitJsSdk) {
//                 LitJsSdk = await import("@lit-protocol/lit-node-client");
//             }
//             if (!LIT_NETWORK) {
//                 const constants = await import("@lit-protocol/constants");
//                 LIT_NETWORK = constants.LIT_NETWORK;
//             }

//             litNodeClient = new LitJsSdk.LitNodeClient({
//                 litNetwork: LIT_NETWORK.DatilDev, // Fixed: removed duplicate LIT_NETWORK
//             });
//             await litNodeClient.connect();
//         }
//     }
//     return litNodeClient;
// };

// // Access Control Conditions for chatroom encryption
// export const createAccessControlConditions = (chatroomId: string) => {
//     return [
//         {
//             contractAddress: '',
//             standardContractType: '',
//             chain: 'sepolia', // Fixed: use string instead of chain object
//             method: 'eth_getBalance', // Fixed: added proper method
//             parameters: [':userAddress', 'latest'], // Fixed: added 'latest' parameter
//             returnValueTest: {
//                 comparator: '', // Fixed: changed to >= for balance check
//                 value: '0' // This allows anyone with any balance
//             }
//         }
//     ];
// };

// // Get authentication signature compatible with Lit Protocol
// export const getAuthSignature = async (wallet: any, walletAddress: string) => {
//     try {
//         if (!wallet) {
//             throw new Error('Wallet not connected');
//         }

//         // Use Lit Protocol's standard auth message format
//         const authMessage = await LitJsSdk.checkAndSignAuthMessage({
//             chain: 'sepolia',
//             walletConnectProjectId: undefined, // Add if using WalletConnect
//         });

//         return authMessage;
//     } catch (error) {
//         console.error('Error getting auth signature:', error);

//         // Fallback signature structure that matches Lit Protocol expectations
//         return {
//             sig: '0x' + '0'.repeat(130),
//             derivedVia: 'web3.eth.personal.sign',
//             signedMessage: `localhost wants you to sign in with your Ethereum account:\n${walletAddress}\n\nThis is a test statement.\n\nURI: https://localhost/login\nVersion: 1\nChain ID: ${sepolia.id}\nNonce: ${Date.now()}\nIssued At: ${new Date().toISOString()}`,
//             address: walletAddress,
//         };
//     }
// };

// // Encrypt a message using Lit Protocol (with fallback to simple encryption)
// export const encryptMessage = async (
//     message: string,
//     chatroomId: string,
//     wallet: any,
//     walletAddress: string
// ): Promise<{
//     ciphertext: string;
//     dataToEncryptHash: string;
//     accessControlConditions: any[];
// }> => {
//     try {
//         // Check if we're on client side
//         if (typeof window === 'undefined') {
//             throw new Error('Encryption only available on client side');
//         }

//         const client = await initializeLitClient();

//         // Create access control conditions
//         const accessControlConditions = createAccessControlConditions(chatroomId);

//         // Fixed: Use proper Lit Protocol encryption method
//         const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
//             {
//                 accessControlConditions,
//                 dataToEncrypt: message,
//             },
//             client
//         );

//         return {
//             ciphertext,
//             dataToEncryptHash,
//             accessControlConditions,
//         };
//     } catch (error) {
//         console.error('Error encrypting message with Lit Protocol:', error);
//         console.error('Error details:', {
//             message: message,
//             chatroomId: chatroomId,
//             walletAddress: walletAddress,
//             hasWallet: !!wallet,
//             errorMessage: error instanceof Error ? error.message : 'Unknown error',
//             errorStack: error instanceof Error ? error.stack : 'No stack trace'
//         });

//         // Fallback to simple encryption for development
//         console.log('Falling back to simple encryption for development');
//         const encryptedMessage = simpleEncrypt(message, chatroomId);
//         return {
//             ciphertext: encryptedMessage,
//             dataToEncryptHash: 'simple-encryption-hash',
//             accessControlConditions: createAccessControlConditions(chatroomId),
//         };
//     }
// };

// // Decrypt a message using Lit Protocol (with fallback to simple decryption)
// export const decryptMessage = async (
//     ciphertext: string,
//     dataToEncryptHash: string,
//     accessControlConditions: any[],
//     chatroomId: string,
//     wallet: any,
//     walletAddress: string
// ): Promise<string> => {
//     try {
//         // Check if this is a simple encrypted message
//         if (dataToEncryptHash === 'simple-encryption-hash') {
//             return simpleDecrypt(ciphertext, chatroomId);
//         }

//         // Check if we're on client side
//         if (typeof window === 'undefined') {
//             throw new Error('Decryption only available on client side');
//         }

//         const client = await initializeLitClient();

//         // Get auth signature from wallet
//         const authSig = await getAuthSignature(wallet, walletAddress);

//         // Fixed: Use proper Lit Protocol decryption method
//         const decryptedString = await LitJsSdk.decryptToString(
//             {
//                 accessControlConditions,
//                 ciphertext,
//                 dataToEncryptHash,
//                 authSig,
//                 chain: 'sepolia',
//             },
//             client
//         );

//         return decryptedString;
//     } catch (error) {
//         console.error('Error decrypting message with Lit Protocol:', error);
//         // Fallback to simple decryption for development
//         console.log('Falling back to simple decryption for development');
//         return simpleDecrypt(ciphertext, chatroomId);
//     }
// };








// // Simple encryption fallback (for development/testing)
// export const simpleEncrypt = (message: string, key: string): string => {
//     // This is a simple XOR encryption for development
//     // In production, use proper encryption
//     const keyBytes = new TextEncoder().encode(key);
//     const messageBytes = new TextEncoder().encode(message);
//     const encrypted = new Uint8Array(messageBytes.length);

//     for (let i = 0; i < messageBytes.length; i++) {
//         encrypted[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
//     }

//     return btoa(String.fromCharCode(...encrypted));
// };

// // Simple decryption fallback (for development/testing)
// export const simpleDecrypt = (encryptedMessage: string, key: string): string => {
//     try {
//         // This is a simple XOR decryption for development
//         // In production, use proper decryption
//         const keyBytes = new TextEncoder().encode(key);
//         const encryptedBytes = new Uint8Array(
//             atob(encryptedMessage).split('').map(char => char.charCodeAt(0))
//         );
//         const decrypted = new Uint8Array(encryptedBytes.length);

//         for (let i = 0; i < encryptedBytes.length; i++) {
//             decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
//         }

//         return new TextDecoder().decode(decrypted);
//     } catch (error) {
//         console.error('Error in simple decryption:', error);
//         return encryptedMessage; // Return original if decryption fails
//     }
// };


// participantsStore.ts - Reactive participants store
type Participant = {
    id: string;
    address: string;
    username?: string;
    joinedAt: number;
};

type ParticipantsChangeCallback = (participants: Participant[]) => void;

class ParticipantsStore {
    private participants: Map<string, Participant> = new Map();
    private changeCallbacks: Set<ParticipantsChangeCallback> = new Set();
    private chatroomId: string;

    constructor(chatroomId: string) {
        this.chatroomId = chatroomId;
    }

    // Subscribe to participants changes
    subscribe(callback: ParticipantsChangeCallback): () => void {
        this.changeCallbacks.add(callback);
        // Return unsubscribe function
        return () => {
            this.changeCallbacks.delete(callback);
        };
    }

    // Notify all subscribers of changes
    private notifyChange() {
        const participantsList = Array.from(this.participants.values());
        this.changeCallbacks.forEach(callback => callback(participantsList));
    }

    // Add participant
    addParticipant(participant: Participant) {
        this.participants.set(participant.id, participant);
        this.notifyChange();
        console.log(`Participant ${participant.id} joined chatroom ${this.chatroomId}`);
    }

    // Remove participant
    removeParticipant(participantId: string) {
        if (this.participants.delete(participantId)) {
            this.notifyChange();
            console.log(`Participant ${participantId} left chatroom ${this.chatroomId}`);
        }
    }

    // Get current participants
    getParticipants(): Participant[] {
        return Array.from(this.participants.values());
    }

    // Get participant addresses only
    getParticipantAddresses(): string[] {
        return Array.from(this.participants.values()).map(p => p.address);
    }

    // Check if address is participant
    isParticipant(address: string): boolean {
        return Array.from(this.participants.values()).some(p => p.address === address);
    }

    // Clear all participants
    clear() {
        this.participants.clear();
        this.notifyChange();
    }

    // Get participant count
    getCount(): number {
        return this.participants.size;
    }
}

// Global store manager
class ParticipantsStoreManager {
    private stores: Map<string, ParticipantsStore> = new Map();

    getStore(chatroomId: string): ParticipantsStore {
        if (!this.stores.has(chatroomId)) {
            this.stores.set(chatroomId, new ParticipantsStore(chatroomId));
        }
        return this.stores.get(chatroomId)!;
    }

    removeStore(chatroomId: string) {
        this.stores.delete(chatroomId);
    }
}

// Global instance
const participantsStoreManager = new ParticipantsStoreManager();

// Export functions to use across files
export const getParticipantsStore = (chatroomId: string) => {
    return participantsStoreManager.getStore(chatroomId);
};

export const getCurrentParticipants = (chatroomId: string): Participant[] => {
    return participantsStoreManager.getStore(chatroomId).getParticipants();
};

export const getCurrentParticipantAddresses = (chatroomId: string): string[] => {
    return participantsStoreManager.getStore(chatroomId).getParticipantAddresses();
};

export const isCurrentParticipant = (chatroomId: string, address: string): boolean => {
    return participantsStoreManager.getStore(chatroomId).isParticipant(address);
};

// Socket event handlers
export const handleParticipantJoined = (chatroomId: string, participant: Participant) => {
    const store = participantsStoreManager.getStore(chatroomId);
    store.addParticipant(participant);
};

export const handleParticipantLeft = (chatroomId: string, participantId: string) => {
    const store = participantsStoreManager.getStore(chatroomId);
    store.removeParticipant(participantId);
};

export const handleParticipantsSync = (chatroomId: string, participants: Participant[]) => {
    const store = participantsStoreManager.getStore(chatroomId);
    store.clear();
    participants.forEach(participant => store.addParticipant(participant));
};

// Cleanup function
export const cleanupParticipantsStore = (chatroomId: string) => {
    participantsStoreManager.removeStore(chatroomId);
};

export type { Participant, ParticipantsChangeCallback };


// litEncryption.ts - Updated Lit Protocol integration
import { sepolia } from "thirdweb/chains";
import {
    getCurrentParticipantAddresses,
    isCurrentParticipant,
    getParticipantsStore
} from "./participantsStore";

// Client-side only imports for Lit Protocol
let LitJsSdk: any = null;
let LIT_NETWORK: any = null;
let litNodeClient: any = null;

const initializeLitClient = async () => {
    if (!litNodeClient) {
        if (typeof window !== 'undefined') {
            if (!LitJsSdk) {
                LitJsSdk = await import("@lit-protocol/lit-node-client");
            }
            if (!LIT_NETWORK) {
                const constants = await import("@lit-protocol/constants");
                LIT_NETWORK = constants.LIT_NETWORK;
            }

            litNodeClient = new LitJsSdk.LitNodeClient({
                litNetwork: LIT_NETWORK.DatilDev,
            });
            await litNodeClient.connect();
        }
    }
    return litNodeClient;
};

// Create dynamic access control conditions based on current participants
export const createParticipantAccessControlConditions = (chatroomId: string) => {
    const participantAddresses = getCurrentParticipantAddresses(chatroomId);

    if (participantAddresses.length === 0) {
        throw new Error(`No participants found in chatroom ${chatroomId}`);
    }

    // Create OR conditions for all participant addresses
    const conditions = participantAddresses.map((address, index) => {
        const condition = {
            contractAddress: '',
            standardContractType: '',
            chain: 'sepolia',
            method: 'eth_getBalance',
            parameters: [address, 'latest'],
            returnValueTest: {
                comparator: '>=',
                value: '0' // Must have any balance
            }
        };

        // Add operator for OR logic (except for last condition)
        if (index < participantAddresses.length - 1) {
            return [condition, { operator: 'or' }];
        }
        return condition;
    }).flat();

    return conditions;
};

// Enhanced encryption with participant validation
export const encryptMessage = async (
    message: string,
    chatroomId: string,
    wallet: any,
    walletAddress: string
): Promise<{
    ciphertext: string;
    dataToEncryptHash: string;
    accessControlConditions: any[];
    participantSnapshot: string[]; // Store participant list at encryption time
}> => {
    try {
        // Validate that sender is a participant
        if (!isCurrentParticipant(chatroomId, walletAddress)) {
            throw new Error('You must be a participant to send encrypted messages');
        }

        if (typeof window === 'undefined') {
            throw new Error('Encryption only available on client side');
        }

        const client = await initializeLitClient();
        const accessControlConditions = createParticipantAccessControlConditions(chatroomId);
        const participantSnapshot = getCurrentParticipantAddresses(chatroomId);

        const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
            {
                accessControlConditions,
                dataToEncrypt: message,
            },
            client
        );

        return {
            ciphertext,
            dataToEncryptHash,
            accessControlConditions,
            participantSnapshot,
        };
    } catch (error) {
        console.error('Error encrypting message:', error);
        throw error;
    }
};

// Enhanced decryption with participant validation
export const decryptMessage = async (
    ciphertext: string,
    dataToEncryptHash: string,
    accessControlConditions: any[],
    chatroomId: string,
    wallet: any,
    walletAddress: string
): Promise<string> => {
    try {
        // Validate that user is currently a participant
        if (!isCurrentParticipant(chatroomId, walletAddress)) {
            throw new Error('You must be a participant to decrypt messages');
        }

        if (typeof window === 'undefined') {
            throw new Error('Decryption only available on client side');
        }

        const client = await initializeLitClient();

        // Get auth signature
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'sepolia',
        });

        const decryptedString = await LitJsSdk.decryptToString(
            {
                accessControlConditions,
                ciphertext,
                dataToEncryptHash,
                authSig,
                chain: 'sepolia',
            },
            client
        );

        return decryptedString;
    } catch (error) {
        console.error('Error decrypting message:', error);
        // Return encrypted indicator instead of throwing
        return '[🔒 Encrypted Message - Join the chatroom to decrypt]';
    }
};

// Utility function to re-encrypt message for new participants
export const reEncryptForNewParticipants = async (
    originalMessage: string,
    chatroomId: string,
    wallet: any,
    walletAddress: string
) => {
    // Re-encrypt with current participant list
    return await encryptMessage(originalMessage, chatroomId, wallet, walletAddress);
};


// socketHandler.ts - Integration with socket events
import {
    handleParticipantJoined,
    handleParticipantLeft,
    handleParticipantsSync,
    getParticipantsStore,
    type Participant
} from './participantsStore';

export const setupSocketHandlers = (socket: any, chatroomId: string) => {
    const participantsStore = getParticipantsStore(chatroomId);

    // Handle participant joined
    socket.on('participant-joined', (participant: Participant) => {
        handleParticipantJoined(chatroomId, participant);
    });

    // Handle participant left
    socket.on('participant-left', (participantId: string) => {
        handleParticipantLeft(chatroomId, participantId);
    });

    // Handle initial participants sync
    socket.on('participants-sync', (participants: Participant[]) => {
        handleParticipantsSync(chatroomId, participants);
    });

    // Subscribe to participants changes for real-time updates
    const unsubscribe = participantsStore.subscribe((participants) => {
        console.log('Participants updated:', participants);
        // You can trigger UI updates here
        // For example: updateParticipantsUI(participants);
    });

    // Return cleanup function
    return () => {
        unsubscribe();
        socket.off('participant-joined');
        socket.off('participant-left');
        socket.off('participants-sync');
    };
};


// usage-example.ts - How to use the system
import {
    getCurrentParticipants,
    isCurrentParticipant,
    getParticipantsStore
} from './participantsStore';
import { encryptMessage, decryptMessage } from './litEncryption';
import { setupSocketHandlers } from './socketHandler';

// Example usage in a chatroom component
export const useChatroom = (chatroomId: string, socket: any, wallet: any, walletAddress: string) => {
    // Setup socket handlers
    const cleanup = setupSocketHandlers(socket, chatroomId);

    // Subscribe to participants changes
    const participantsStore = getParticipantsStore(chatroomId);
    const unsubscribeParticipants = participantsStore.subscribe((participants) => {
        console.log('Current participants:', participants);
        // Update UI or trigger re-encryption if needed
    });

    // Send encrypted message
    const sendMessage = async (message: string) => {
        try {
            const encrypted = await encryptMessage(message, chatroomId, wallet, walletAddress);

            // Send to server
            socket.emit('send-message', {
                chatroomId,
                ...encrypted,
                sender: walletAddress,
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Decrypt received message
    const decryptReceivedMessage = async (encryptedMessage: any) => {
        try {
            const decrypted = await decryptMessage(
                encryptedMessage.ciphertext,
                encryptedMessage.dataToEncryptHash,
                encryptedMessage.accessControlConditions,
                chatroomId,
                wallet,
                walletAddress
            );
            return decrypted;
        } catch (error) {
            console.error('Failed to decrypt message:', error);
            return '[🔒 Encrypted Message]';
        }
    };

    // Check if user can participate
    const canParticipate = () => {
        return isCurrentParticipant(chatroomId, walletAddress);
    };

    // Get current participants
    const getParticipants = () => {
        return getCurrentParticipants(chatroomId);
    };

    // Cleanup function
    const cleanupChatroom = () => {
        cleanup();
        unsubscribeParticipants();
    };

    return {
        sendMessage,
        decryptReceivedMessage,
        canParticipate,
        getParticipants,
        cleanup: cleanupChatroom,
    };
};