// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EchoProof Smart Contract System
 * @notice A comprehensive Web3 communication platform with chatrooms, meetings, and subscriptions
 * @dev Optimized for gas efficiency and scalability
 */

// =================== INTERFACES ===================

interface ISubscriptionManager {
    function isProUser(address user) external view returns (bool);
    function hasActiveSubscription(address user) external view returns (bool);
}

interface IChatroomRegistry {
    function getChatroomCreator(uint256 chatroomId) external view returns (address);
    function isChatroomParticipant(uint256 chatroomId, address user) external view returns (bool);
}

// =================== EVENTS ===================

contract EchoProofEvents {
    // Chatroom Events
    event ChatroomCreated(uint256 indexed chatroomId, address indexed creator, string title);
    event ParticipantAdded(uint256 indexed chatroomId, address indexed participant);
    event ParticipantRemoved(uint256 indexed chatroomId, address indexed participant);
    event ChatroomUpdated(uint256 indexed chatroomId, string newTitle, string newMetadataHash);
    
    // Meeting Events
    event MeetingCreated(uint256 indexed meetingId, uint256 indexed chatroomId, address indexed host);
    event MeetingEnded(uint256 indexed meetingId, uint256 endTime, string recordingHash);
    event MeetingParticipantAdded(uint256 indexed meetingId, address indexed participant);
    
    // Subscription Events
    event SubscriptionPurchased(address indexed user, uint256 amount, uint256 expiryTime);
    event SubscriptionRenewed(address indexed user, uint256 newExpiryTime);
    event ProFeeUpdated(uint256 newFee);
    }

// =================== SUBSCRIPTION MANAGER ===================

contract SubscriptionManager is Ownable, ReentrancyGuard, Pausable, EchoProofEvents {
    using Counters for Counters.Counter;
    
    uint256 public proFee = 0.01 ether; // Monthly subscription fee
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    
    struct Subscription {
        bool isActive;
        uint256 expiryTime;
        uint256 subscriptionCount;
    }
    
    mapping(address => Subscription) public subscriptions;
    mapping(address => bool) public lifetimeProUsers; // For special users
    
    uint256 public totalRevenue;
    address public treasuryWallet;
    
    constructor(address _treasuryWallet) {
        treasuryWallet = _treasuryWallet;
    }
    
    function subscribe() external payable whenNotPaused nonReentrant {
        require(msg.value >= proFee, "Insufficient payment");
        
        Subscription storage sub = subscriptions[msg.sender];
        uint256 newExpiryTime;
        
        if (sub.isActive && sub.expiryTime > block.timestamp) {
            // Extend existing subscription
            newExpiryTime = sub.expiryTime + SUBSCRIPTION_DURATION;
            emit SubscriptionRenewed(msg.sender, newExpiryTime);
        } else {
            // New subscription
            newExpiryTime = block.timestamp + SUBSCRIPTION_DURATION;
            emit SubscriptionPurchased(msg.sender, msg.value, newExpiryTime);
        }
        
        sub.isActive = true;
        sub.expiryTime = newExpiryTime;
        sub.subscriptionCount++;
        
        totalRevenue += msg.value;
        
        // Refund excess payment
        if (msg.value > proFee) {
            payable(msg.sender).transfer(msg.value - proFee);
        }
    }
    
    function isProUser(address user) external view returns (bool) {
        return lifetimeProUsers[user] || 
               (subscriptions[user].isActive && subscriptions[user].expiryTime > block.timestamp);
    }
    
    function hasActiveSubscription(address user) external view returns (bool) {
        return this.isProUser(user);
    }
    
    function getSubscriptionInfo(address user) external view returns (bool isActive, uint256 expiryTime, uint256 subscriptionCount) {
        Subscription memory sub = subscriptions[user];
        return (
            lifetimeProUsers[user] || (sub.isActive && sub.expiryTime > block.timestamp),
            sub.expiryTime,
            sub.subscriptionCount
        );
    }
    
    function setProFee(uint256 _newFee) external onlyOwner {
        proFee = _newFee;
        emit ProFeeUpdated(_newFee);
    }
    
    function setLifetimeProUser(address user, bool status) external onlyOwner {
        lifetimeProUsers[user] = status;
    }
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(treasuryWallet).transfer(balance);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

// =================== CHATROOM REGISTRY ===================

contract ChatroomRegistry is Ownable, Pausable, EchoProofEvents {
    using Counters for Counters.Counter;
    
    Counters.Counter private _chatroomIds;
    
    struct Chatroom {
        uint256 id;
        address creator;
        string title;
        string ipfsMetadataHash;
        uint256 createdAt;
        uint256 maxParticipants;
        bool isPrivate;
        bool isActive;
    }
    
    mapping(uint256 => Chatroom) public chatrooms;
    mapping(uint256 => address[]) public chatroomParticipants;
    mapping(uint256 => mapping(address => bool)) public isParticipant;
    mapping(address => uint256[]) public chatroomsByOwner;
    mapping(address => uint256[]) public chatroomsByParticipant;
    
    uint256 public maxParticipantsDefault = 100;
    uint256 public maxChatroomsPerUser = 10;
    
    ISubscriptionManager public subscriptionManager;
    
    constructor(address _subscriptionManager) {
        subscriptionManager = ISubscriptionManager(_subscriptionManager);
    }
    
    function createChatroom(
        string memory title,
        string memory ipfsMetadataHash,
        uint256 maxParticipants,
        bool isPrivate
    ) external whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(chatroomsByOwner[msg.sender].length < maxChatroomsPerUser, "Max chatrooms reached");
        
        if (maxParticipants > maxParticipantsDefault) {
            require(subscriptionManager.isProUser(msg.sender), "Pro subscription required for large rooms");
        }
        
        _chatroomIds.increment();
        uint256 chatroomId = _chatroomIds.current();
        
        Chatroom storage chatroom = chatrooms[chatroomId];
        chatroom.id = chatroomId;
        chatroom.creator = msg.sender;
        chatroom.title = title;
        chatroom.ipfsMetadataHash = ipfsMetadataHash;
        chatroom.createdAt = block.timestamp;
        chatroom.maxParticipants = maxParticipants > 0 ? maxParticipants : maxParticipantsDefault;
        chatroom.isPrivate = isPrivate;
        chatroom.isActive = true;
        
        chatroomsByOwner[msg.sender].push(chatroomId);
        
        // Add creator as first participant
        _addParticipantInternal(chatroomId, msg.sender);
        
        emit ChatroomCreated(chatroomId, msg.sender, title);
        return chatroomId;
    }
    
    function addParticipant(uint256 chatroomId, address participant) external {
        require(chatrooms[chatroomId].isActive, "Chatroom not active");
        require(!isParticipant[chatroomId][participant], "Already a participant");
        require(chatroomParticipants[chatroomId].length < chatrooms[chatroomId].maxParticipants, "Chatroom full");
        
        // Only creator can add participants to private rooms
        if (chatrooms[chatroomId].isPrivate) {
            require(msg.sender == chatrooms[chatroomId].creator, "Only creator can add to private room");
        }
        
        _addParticipantInternal(chatroomId, participant);
    }
    
    function _addParticipantInternal(uint256 chatroomId, address participant) internal {
        chatroomParticipants[chatroomId].push(participant);
        isParticipant[chatroomId][participant] = true;
        chatroomsByParticipant[participant].push(chatroomId);
        
        emit ParticipantAdded(chatroomId, participant);
    }
    
    function removeParticipant(uint256 chatroomId, address participant) external {
        require(chatrooms[chatroomId].isActive, "Chatroom not active");
        require(isParticipant[chatroomId][participant], "Not a participant");
        require(
            msg.sender == chatrooms[chatroomId].creator || msg.sender == participant,
            "Not authorized"
        );
        
        // Remove from participants array
        address[] storage participants = chatroomParticipants[chatroomId];
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
        
        isParticipant[chatroomId][participant] = false;
        
        // Remove from participant's chatroom list
        uint256[] storage userChatrooms = chatroomsByParticipant[participant];
        for (uint256 i = 0; i < userChatrooms.length; i++) {
            if (userChatrooms[i] == chatroomId) {
                userChatrooms[i] = userChatrooms[userChatrooms.length - 1];
                userChatrooms.pop();
                break;
            }
        }
        
        emit ParticipantRemoved(chatroomId, participant);
    }
    
    function updateChatroom(uint256 chatroomId, string memory newTitle, string memory newMetadataHash) external {
        require(msg.sender == chatrooms[chatroomId].creator, "Only creator can update");
        require(chatrooms[chatroomId].isActive, "Chatroom not active");
        
        chatrooms[chatroomId].title = newTitle;
        chatrooms[chatroomId].ipfsMetadataHash = newMetadataHash;
        
        emit ChatroomUpdated(chatroomId, newTitle, newMetadataHash);
    }
    
    function getChatroomsByOwner(address user) external view returns (uint256[] memory) {
        return chatroomsByOwner[user];
    }
    
    function getChatroomsByParticipant(address user) external view returns (uint256[] memory) {
        return chatroomsByParticipant[user];
    }
    
    function getChatroomParticipants(uint256 chatroomId) external view returns (address[] memory) {
        return chatroomParticipants[chatroomId];
    }
    
    function getChatroomCreator(uint256 chatroomId) external view returns (address) {
        return chatrooms[chatroomId].creator;
    }
    
    function isChatroomParticipant(uint256 chatroomId, address user) external view returns (bool) {
        return isParticipant[chatroomId][user];
    }
    
    function setMaxParticipantsDefault(uint256 _maxParticipants) external onlyOwner {
        maxParticipantsDefault = _maxParticipants;
    }
    
    function setMaxChatroomsPerUser(uint256 _maxChatrooms) external onlyOwner {
        maxChatroomsPerUser = _maxChatrooms;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

// =================== MEETING LOGGER ===================

contract MeetingLogger is Ownable, Pausable, EchoProofEvents {
    using Counters for Counters.Counter;
    
    Counters.Counter private _meetingIds;
    
    struct Meeting {
        uint256 id;
        address host;
        uint256 chatroomId;
        string topic;
        string ipfsRecordingHash;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isRecorded;
    }
    
    mapping(uint256 => Meeting) public meetings;
    mapping(uint256 => address[]) public meetingParticipants;
    mapping(uint256 => mapping(address => bool)) public isMeetingParticipant;
    mapping(address => uint256[]) public meetingsByHost;
    mapping(address => uint256[]) public meetingsByParticipant;
    
    IChatroomRegistry public chatroomRegistry;
    ISubscriptionManager public subscriptionManager;
    
    constructor(address _chatroomRegistry, address _subscriptionManager) {
        chatroomRegistry = IChatroomRegistry(_chatroomRegistry);
        subscriptionManager = ISubscriptionManager(_subscriptionManager);
    }
    
    function createMeeting(
        uint256 chatroomId,
        string memory topic,
        bool isRecorded
    ) external whenNotPaused returns (uint256) {
        require(chatroomRegistry.isChatroomParticipant(chatroomId, msg.sender), "Not a chatroom participant");
        require(bytes(topic).length > 0, "Topic cannot be empty");
        
        if (isRecorded) {
            require(subscriptionManager.isProUser(msg.sender), "Pro subscription required for recording");
        }
        
        _meetingIds.increment();
        uint256 meetingId = _meetingIds.current();
        
        Meeting storage meeting = meetings[meetingId];
        meeting.id = meetingId;
        meeting.host = msg.sender;
        meeting.chatroomId = chatroomId;
        meeting.topic = topic;
        meeting.startTime = block.timestamp;
        meeting.isActive = true;
        meeting.isRecorded = isRecorded;
        
        meetingsByHost[msg.sender].push(meetingId);
        
        // Add host as first participant
        _addMeetingParticipantInternal(meetingId, msg.sender);
        
        emit MeetingCreated(meetingId, chatroomId, msg.sender);
        return meetingId;
    }
    
    function endMeeting(uint256 meetingId, string memory recordingHash) external {
        require(meetings[meetingId].host == msg.sender, "Only host can end meeting");
        require(meetings[meetingId].isActive, "Meeting not active");
        
        meetings[meetingId].endTime = block.timestamp;
        meetings[meetingId].isActive = false;
        meetings[meetingId].ipfsRecordingHash = recordingHash;
        
        emit MeetingEnded(meetingId, block.timestamp, recordingHash);
    }
    
    function addMeetingParticipant(uint256 meetingId, address participant) external {
        require(meetings[meetingId].isActive, "Meeting not active");
        require(!isMeetingParticipant[meetingId][participant], "Already a participant");
        require(
            meetings[meetingId].host == msg.sender || 
            chatroomRegistry.isChatroomParticipant(meetings[meetingId].chatroomId, participant),
            "Not authorized"
        );
        
        _addMeetingParticipantInternal(meetingId, participant);
    }
    
    function _addMeetingParticipantInternal(uint256 meetingId, address participant) internal {
        meetingParticipants[meetingId].push(participant);
        isMeetingParticipant[meetingId][participant] = true;
        meetingsByParticipant[participant].push(meetingId);
        
        emit MeetingParticipantAdded(meetingId, participant);
    }
    
    function getMeetingsByHost(address host) external view returns (uint256[] memory) {
        return meetingsByHost[host];
    }
    
    function getMeetingsByParticipant(address participant) external view returns (uint256[] memory) {
        return meetingsByParticipant[participant];
    }
    
    function getMeetingParticipants(uint256 meetingId) external view returns (address[] memory) {
        return meetingParticipants[meetingId];
    }
    
    function getMeetingDuration(uint256 meetingId) external view returns (uint256) {
        Meeting memory meeting = meetings[meetingId];
        if (meeting.endTime > 0) {
            return meeting.endTime - meeting.startTime;
        }
        return 0;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}



// =================== MAIN ECHOPROOF CONTRACT ===================

contract EchoProof is Ownable {
    SubscriptionManager public subscriptionManager;
    ChatroomRegistry public chatroomRegistry;
    MeetingLogger public meetingLogger;
    
    string public constant VERSION = "1.0.0";
    
    constructor(address _treasuryWallet) {
        subscriptionManager = new SubscriptionManager(_treasuryWallet);
        chatroomRegistry = new ChatroomRegistry(address(subscriptionManager));
        meetingLogger = new MeetingLogger(address(chatroomRegistry), address(subscriptionManager));
    }
    
    function getContractAddresses() external view returns (
        address subscription,
        address chatroom,
        address meeting
    ) {
        return (
            address(subscriptionManager),
            address(chatroomRegistry),
            address(meetingLogger)
        );
    }
    
    function emergencyPause() external onlyOwner {
        subscriptionManager.pause();
        chatroomRegistry.pause();
        meetingLogger.pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        subscriptionManager.unpause();
        chatroomRegistry.unpause();
        meetingLogger.unpause();
    }
}