import React from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = React.useState(2);
  const [guestCanPause, setGuestCanPause] = React.useState(false);
  const [isHost, setIsHost] = React.useState(false);

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
