import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import CreateUpdateRoomPage from "./CreateUpdateRoomPage";
import WebPlayback from "./WebPlayback";

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [song, setSong] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getRoomDetails();
  }, [roomCode]);

  const getRoomDetails = () => {
    fetch(`/api/get-room?code=${roomCode}`)
      .then((response) => {
        if (!response.ok) {
          leaveRoomCallback();
          navigate("/");
        }
        return response.json();
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
        if (data.is_host) {
          authenticateSpotify();
          getAccessToken();
        }
        console.log(isHost, data.is_host);
      });
  };

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      })
      .then((data) => {
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      })
      .catch((error) => {
        console.error("Error during fetch:", error);
      });
  };

  const getAccessToken = async () => {
    const response = await fetch("/spotify/get-token");
    const data = await response.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
  };

  const getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSong(data);
      });
  };

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };
    fetch("/api/leave-room", requestOptions).then((response) => {
      leaveRoomCallback();
      navigate("/");
    });
  };

  const updateShowSettings = (value) => {
    setShowSettings(value);
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateUpdateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          ></CreateUpdateRoomPage>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };
  if (showSettings) {
    return renderSettings();
  }
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography color="rgb(0,0,0)" variant="h4" component="h4">
          Room Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <WebPlayback token={token} votesToSkip={votesToSkip} />
      </Grid>
      {isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          onClick={leaveButtonPressed}
          color="secondary"
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
