# EchoProof: Decentralized Communication Platform Architecture Guide

## 🚀 Overview
EchoProof is a decentralized communication platform featuring chatrooms and video meetings with blockchain-based access control and data integrity. This guide outlines the optimal architecture for on-chain vs off-chain data storage and token-gated access implementation.

---

## ⚖️ Rule of Thumb for Blockchain Storage

Blockchain excels at **integrity and transparency** but struggles with bulk data due to:
- **High costs** (gas fees, especially on Ethereum)
- **Slow write speeds**
- **Lack of privacy by default**

**Golden Rule**: Only store what must be tamper-proof, auditable, and referenced long-term. Everything else goes off-chain.

---

## ✅ What You SHOULD Store On-Chain

### 1. Meeting Metadata
```json
{
  "meetingId": "unique-identifier",
  "hostAddress": "0x...",
  "startTimestamp": 1704067200,
  "endTimestamp": 1704070800,
  "accessType": "public|private|token-gated",
  "ipfsHash": "QmXxYy...",
  "tokenGated": {
    "enabled": true,
    "contractAddress": "0x...",
    "tokenType": "ERC20|ERC721|ERC1155",
    "minimumBalance": 1
  }
}
```

### 2. Access Control Rules
Smart contracts define:
- **Who can join** (wallet addresses, NFT ownership, DAO members)
- **Who can speak/record**
- **Token-gated entry** requirements
- **Role-based permissions**

**Integration Options**:
- [Thirdweb](https://thirdweb.com/) for access control
- [Lit Protocol](https://litprotocol.com/) for advanced permissions

### 3. On-Chain Event Logs
Lightweight audit trail for:
- Meeting creation events
- Join/leave events (optional)
- Voting outcomes (DAO-style decisions)
- Access control changes

### 4. Financial Transactions
All monetary interactions must be on-chain:
- **Paid events** (ERC20/ETH payments)
- **Creator tips** and donations
- **Subscription payments**
- **Revenue sharing** for hosts

### 5. Chatroom Metadata
```json
{
  "chatroomId": "unique-identifier",
  "creatorAddress": "0x...",
  "permissions": {
    "isPublic": true,
    "tokenGated": false,
    "canPost": ["address1", "address2"],
    "moderators": ["address3"]
  },
  "ipfsContentHash": "QmAaBb..."
}
```

---

## 🚫 What You SHOULD NOT Store On-Chain

### 1. Raw Media Content
- **Video/Audio recordings** → Store on IPFS/Arweave
- **Chat messages** → Decentralized storage (Ceramic, Tableland)
- **File uploads** → IPFS with hash references on-chain

### 2. Ephemeral Data
- Active speaker information
- Live participant lists
- Typing indicators
- Hand raises and reactions
- Connection status

### 3. User Profile Data
- Profile pictures → IPFS
- User descriptions → Database
- Preferences → Local storage
- Activity history → Off-chain analytics

**Note**: Use wallet signatures to verify identity without storing sensitive data on-chain.

---

## 🔐 Token-Gated Access Implementation

### UI/UX Design
```
Create Meeting/Chatroom Form:
┌─────────────────────────────────────┐
│ [ ] Enable Token-Gated Access      │
│                                     │
│ ┌─ Token Requirements ─────────────┐ │
│ │ Contract Address: [____________] │ │ (only visible if checked)
│ │ Token Type: [ERC20 ▼]          │ │
│ │ Minimum Balance: [1___]         │ │
│ │ Token ID (for NFTs): [_____]    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Access Control Logic

#### Option A: On-Chain Smart Contract (Fully Trustless)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract EchoProofAccessControl {
    enum TokenType { ERC20, ERC721, ERC1155 }
    
    struct AccessRule {
        bool enabled;
        address tokenContract;
        TokenType tokenType;
        uint256 minimumBalance;
        uint256 tokenId; // For ERC721/ERC1155
    }
    
    mapping(bytes32 => AccessRule) public roomAccessRules;
    
    function setAccessRule(
        bytes32 roomId,
        address tokenContract,
        TokenType tokenType,
        uint256 minimumBalance,
        uint256 tokenId
    ) external {
        roomAccessRules[roomId] = AccessRule({
            enabled: true,
            tokenContract: tokenContract,
            tokenType: tokenType,
            minimumBalance: minimumBalance,
            tokenId: tokenId
        });
    }
    
    function canJoin(bytes32 roomId, address user) public view returns (bool) {
        AccessRule memory rule = roomAccessRules[roomId];
        
        if (!rule.enabled) return true; // Open access
        
        if (rule.tokenType == TokenType.ERC20) {
            return IERC20(rule.tokenContract).balanceOf(user) >= rule.minimumBalance;
        } else if (rule.tokenType == TokenType.ERC721) {
            return IERC721(rule.tokenContract).ownerOf(rule.tokenId) == user;
        } else if (rule.tokenType == TokenType.ERC1155) {
            return IERC1155(rule.tokenContract).balanceOf(user, rule.tokenId) >= rule.minimumBalance;
        }
        
        return false;
    }
}
```

#### Option B: Off-Chain Verification (Simpler & Cheaper)
```typescript
// Token verification service
class TokenGateService {
    async verifyAccess(
        userAddress: string,
        tokenContract: string,
        tokenType: 'ERC20' | 'ERC721' | 'ERC1155',
        minimumBalance: number = 1,
        tokenId?: number
    ): Promise<boolean> {
        try {
            switch (tokenType) {
                case 'ERC20':
                    const erc20Contract = new ethers.Contract(tokenContract, ERC20_ABI, provider);
                    const balance = await erc20Contract.balanceOf(userAddress);
                    return balance.gte(minimumBalance);
                
                case 'ERC721':
                    const erc721Contract = new ethers.Contract(tokenContract, ERC721_ABI, provider);
                    const owner = await erc721Contract.ownerOf(tokenId);
                    return owner.toLowerCase() === userAddress.toLowerCase();
                
                case 'ERC1155':
                    const erc1155Contract = new ethers.Contract(tokenContract, ERC1155_ABI, provider);
                    const balance = await erc1155Contract.balanceOf(userAddress, tokenId);
                    return balance.gte(minimumBalance);
                
                default:
                    return false;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
}
```

---

## 🧠 Hybrid Architecture Strategy

### The "Hash-and-Hold" Pattern
1. **Store lightweight proofs on-chain**
2. **Store actual data off-chain** (IPFS, Arweave)
3. **Reference off-chain data** using cryptographic hashes

**Example Flow**:
```
Meeting Recording → IPFS → Hash → Smart Contract
     ↓                ↓       ↓         ↓
   Content         Storage  Proof   Immutable
   (Private)      (Decentralized) (Verifiable)
```

### Data Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Smart Contract │    │      IPFS       │    │    Database     │
│                 │    │                 │    │                 │
│ • Meeting IDs   │◄──►│ • Recordings    │    │ • User profiles │
│ • Access rules  │    │ • Transcripts   │    │ • Preferences   │
│ • Timestamps    │    │ • Chat logs     │    │ • Analytics     │
│ • IPFS hashes   │    │ • File uploads  │    │ • Cache data    │
│ • Payments      │    │ • Metadata      │    │ • Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔧 Advanced Features

### 1. Merkle Trees for Batch Verification
```solidity
// Verify multiple participants without storing all addresses
function verifyBatchAccess(
    bytes32[] calldata proof,
    bytes32 root,
    address user
) external pure returns (bool) {
    bytes32 leaf = keccak256(abi.encodePacked(user));
    return MerkleProof.verify(proof, root, leaf);
}
```

### 2. Zero-Knowledge Proofs
- **Prove meeting attendance** without revealing identity
- **Private voting** in DAO meetings
- **Anonymous feedback** systems

### 3. Lit Protocol Integration
```javascript
// Encrypt meeting recordings, decrypt based on smart contract rules
const encryptedData = await LitJsSdk.encryptString(
    "meeting-recording-data",
    authSig,
    chain,
    accessControlConditions
);
```

---

## 🏗️ Implementation Roadmap

### Phase 1: Core Infrastructure
- [ ] Smart contract for meeting metadata
- [ ] IPFS integration for content storage
- [ ] Basic wallet authentication
- [ ] Token-gated access (ERC20 only)

### Phase 2: Enhanced Features
- [ ] Support for ERC721/ERC1155 tokens
- [ ] Batch operations and gas optimization
- [ ] Advanced access control rules
- [ ] Payment integration

### Phase 3: Advanced Capabilities
- [ ] Merkle tree batch verification
- [ ] Zero-knowledge proof integration
- [ ] Lit Protocol encryption
- [ ] Cross-chain compatibility

---

## 🎯 Best Practices

### Security Considerations
- **Validate all token contracts** before storing
- **Use OpenZeppelin libraries** for standard implementations
- **Implement rate limiting** for contract interactions
- **Add emergency pause mechanisms** for critical functions

### Gas Optimization
- **Batch operations** when possible
- **Use events** instead of storage for non-critical data
- **Implement efficient data structures** (packed structs)
- **Consider Layer 2 solutions** (Polygon, Arbitrum)

### User Experience
- **Progressive disclosure** of advanced features
- **Clear error messages** for failed token verification
- **Graceful fallbacks** for network issues
- **Mobile-responsive design** for wallet connections

---

## 📊 Cost Analysis

| Operation | On-Chain Cost | Off-Chain Cost | Recommendation |
|-----------|---------------|----------------|----------------|
| Store meeting metadata | ~$5-20 | ~$0.01 | On-chain (trust) |
| Store chat messages | ~$100-500 | ~$0.01 | Off-chain (IPFS) |
| Token verification | ~$2-5 | ~$0.001 | Off-chain (speed) |
| Payment processing | ~$3-10 | N/A | On-chain (required) |

---

## 🚀 Next Steps

1. **Define your smart contract schema** for meetings and chatrooms
2. **Set up IPFS infrastructure** for content storage
3. **Implement wallet-based authentication**
4. **Build token-gated access UI**
5. **Test with multiple token types**
6. **Deploy to testnet** for community testing

---

## 🔗 Useful Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Lit Protocol Docs](https://developer.litprotocol.com/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)

---

**Remember**: Build with **trust and pragmatism** in mind. Not everything needs to be on-chain, but what you do put there should be absolutely necessary for your platform's core value proposition.