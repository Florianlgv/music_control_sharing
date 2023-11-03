import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const getRoomDetails = () => {
      fetch(`/api/get-room?code=${roomCode}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setVotesToSkip(data.votes_to_skip);
          setGuestCanPause(data.guest_can_pause);
          setIsHost(data.is_host);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          setError("Error fetching room details.");
        });
    };

    getRoomDetails();
  });

  return (
    <div>
      <h3>Room Code: {roomCode}</h3>
      <p>Votes: {votesToSkip}</p>
      <p>guestCanPause: {guestCanPause.toString()}</p>
      <p>isHost: {isHost.toString()}</p>
    </div>
  );
};

export default Room;
