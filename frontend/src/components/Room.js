import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CreateUpdateRoomPage from "./CreateUpdateRoomPage";
import MusicPlayer from "./MusicPlayer";
import SearchSongPage from "./SearchSongPage";

import { Grid, Button, Typography, Card } from "@mui/material";

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams();
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchSong, setShowSearchSong] = useState(false);
  const [song, setSong] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getRoomDetails();

    const interval = setInterval(getCurrentSong, 1000);

    return () => {
      clearInterval(interval);
    };
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
        setRoomDetails({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (data.is_host) {
          authenticateSpotify();
        }
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
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      leaveRoomCallback();
      navigate("/");
    });
  };

  const updateShowSearchSong = (value) => {
    setShowSearchSong(value);
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
            votesToSkip={roomDetails.votesToSkip}
            guestCanPause={roomDetails.guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
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
  } else if (showSearchSong) {
    return (
      <SearchSongPage
        updateShowSearchSong={updateShowSearchSong}
        playlist_id={song.playlist_id}
      />
    );
  }
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography color="rgb(0,0,0)" variant="h3" component="h3">
          Room Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} md={12} align="center" justifyContent="center">
        <MusicPlayer
          {...song}
          votesToSkip={roomDetails.votesToSkip}
          updateShowSearchSong={updateShowSearchSong}
        />
      </Grid>
      {roomDetails.isHost ? renderSettingsButton() : null}
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
