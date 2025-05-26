// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EchoProof - Decentralized chatroom and video meeting system
/// @author ...
/// @notice This contract allows users to create/join chatrooms and video meetings, and send messages.
/// @dev All string inputs use calldata for gas optimization.

contract EchoProof {
    /// @dev Represents a chatroom with members and stored messages.
    struct ChatRoom {
        uint id;
        string name;
        string purpose;
        address creator;
        address[] members;
        mapping(uint => string) messages;
        uint messageCount;
    }

    /// @dev Represents a video meeting with participants and stored messages.
    struct VideoMeeting {
        uint id;
        string name;
        string purpose;
        address host;
        address[] members;
        mapping(uint => string) messages;
        uint messageCount;
    }

    uint public chatRoomCounter;
    uint public videoMeetingCounter;

    mapping(uint => ChatRoom) private chatRooms;
    mapping(uint => VideoMeeting) private videoMeetings;

    /// @notice Creates a new chatroom.
    /// @param _name The name of the chatroom.
    /// @param _purpose The description/purpose of the chatroom.
    /// @return The ID of the newly created chatroom.
    function createChatRoom(
        string calldata _name,
        string calldata _purpose
    ) external returns (uint) {
        chatRoomCounter++;
        ChatRoom storage room = chatRooms[chatRoomCounter];
        room.id = chatRoomCounter;
        room.name = _name;
        room.purpose = _purpose;
        room.creator = msg.sender;
        room.members.push(msg.sender);
        return chatRoomCounter;
    }

    /// @notice Allows a user to join an existing chatroom.
    /// @param _roomId The ID of the chatroom to join.
    function joinChatRoom(uint _roomId) external {
        ChatRoom storage room = chatRooms[_roomId];
        require(room.id != 0, "ChatRoom not found");

        for (uint i = 0; i < room.members.length; i++) {
            if (room.members[i] == msg.sender) revert("Already joined");
        }

        room.members.push(msg.sender);
    }

    /// @notice Sends a message in a chatroom.
    /// @param _roomId The ID of the chatroom.
    /// @param _message The message content.
    function sendChatMessage(uint _roomId, string calldata _message) external {
        ChatRoom storage room = chatRooms[_roomId];
        require(room.id != 0, "Room not found");

        bool isMember = false;
        for (uint i = 0; i < room.members.length; i++) {
            if (room.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member");

        room.messages[room.messageCount] = _message;
        room.messageCount++;
    }

    /// @notice Gets all messages in a chatroom.
    /// @param _roomId The ID of the chatroom.
    /// @return An array of messages in the chatroom.
    function getChatMessages(
        uint _roomId
    ) external view returns (string[] memory) {
        ChatRoom storage room = chatRooms[_roomId];
        string[] memory msgs = new string[](room.messageCount);
        for (uint i = 0; i < room.messageCount; i++) {
            msgs[i] = room.messages[i];
        }
        return msgs;
    }

    /// @notice Returns the list of members in a chatroom.
    /// @param _roomId The ID of the chatroom.
    /// @return An array of member addresses.
    function getChatRoomMembers(
        uint _roomId
    ) external view returns (address[] memory) {
        return chatRooms[_roomId].members;
    }

    /// @notice Creates a new video meeting.
    /// @param _name The name of the meeting.
    /// @param _purpose The description/purpose of the meeting.
    /// @return The ID of the newly created video meeting.
    function createVideoMeeting(
        string calldata _name,
        string calldata _purpose
    ) external returns (uint) {
        videoMeetingCounter++;
        VideoMeeting storage meeting = videoMeetings[videoMeetingCounter];
        meeting.id = videoMeetingCounter;
        meeting.name = _name;
        meeting.purpose = _purpose;
        meeting.host = msg.sender;
        meeting.members.push(msg.sender);
        return videoMeetingCounter;
    }

    /// @notice Allows a user to join a video meeting.
    /// @param _meetingId The ID of the meeting to join.
    function joinVideoMeeting(uint _meetingId) external {
        VideoMeeting storage meeting = videoMeetings[_meetingId];
        require(meeting.id != 0, "Meeting not found");

        for (uint i = 0; i < meeting.members.length; i++) {
            if (meeting.members[i] == msg.sender) revert("Already joined");
        }

        meeting.members.push(msg.sender);
    }

    /// @notice Sends a message in a video meeting.
    /// @param _meetingId The ID of the meeting.
    /// @param _message The message content.
    function sendMeetingMessage(
        uint _meetingId,
        string calldata _message
    ) external {
        VideoMeeting storage meeting = videoMeetings[_meetingId];
        require(meeting.id != 0, "Meeting not found");

        bool isMember = false;
        for (uint i = 0; i < meeting.members.length; i++) {
            if (meeting.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a participant");

        meeting.messages[meeting.messageCount] = _message;
        meeting.messageCount++;
    }

    /// @notice Gets all messages in a video meeting.
    /// @param _meetingId The ID of the meeting.
    /// @return An array of messages from the meeting.
    function getMeetingMessages(
        uint _meetingId
    ) external view returns (string[] memory) {
        VideoMeeting storage meeting = videoMeetings[_meetingId];
        string[] memory msgs = new string[](meeting.messageCount);
        for (uint i = 0; i < meeting.messageCount; i++) {
            msgs[i] = meeting.messages[i];
        }
        return msgs;
    }

    /// @notice Returns the list of participants in a video meeting.
    /// @param _meetingId The ID of the meeting.
    /// @return An array of participant addresses.
    function getVideoMeetingMembers(
        uint _meetingId
    ) external view returns (address[] memory) {
        return videoMeetings[_meetingId].members;
    }
}
