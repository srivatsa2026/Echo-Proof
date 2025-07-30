"use server";

export const createRoom = async (roomName:string) => {
    const response = await fetch("https://api.huddle01.com/api/v2/sdk/rooms/create-room", {
        method: "POST",
        body: JSON.stringify({
            title: roomName,
        }),
        headers: {
            "Content-type": "application/json",
            "x-api-key": process.env.API_KEY!,
        },
        cache: "no-cache",
    });

    const data = await response.json();
    const roomId = data.data.roomId;
    return roomId;
};