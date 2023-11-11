import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  Card,
  IconButton,
  LinearProgress,
  Box,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import NextPlanIcon from "@mui/icons-material/NextPlan";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

function WebPlayback(props) {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  const [is_connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setConnected(true);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setConnected(false);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });
      player.connect();

      const interval = setInterval(() => {
        player.getCurrentState().then((state) => {
          if (!state) return;
          const { position, duration } = state;
          const progress = (position / duration) * 100;
          setProgress(progress);
        });
      }, 1000);
      return () => {
        clearInterval(interval);
        player.disconnect();
      };
    };
  }, [props.token]);

  useEffect(() => {
    setHasVoted(false); // Réinitialiser le vote lorsque la chanson change
  }, [current_track]);

  const handleSkipVote = () => {
    if (!hasVoted) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      fetch("/spotify/skip-vote", requestOptions);
      setHasVoted(true); // Marquer que l'utilisateur a voté
    } else {
      console.log("Vous avez déjà voté pour passer cette chanson.");
    }
  };

  const deviceNotConnected = (
    <Card sx={{ bgcolor: "rgb(18, 18, 18)" }}>
      <Grid item xs={4} align="center" sx={{ py: 3 }}>
        <Typography color="#81b71a" component="h3" variant="h3">
          Open Spotify App And Select The Device "Web Player SDK"
        </Typography>
      </Grid>
    </Card>
  );
  const spotifyPlayer = (
    <Card sx={{ bgcolor: "rgb(18, 18, 18)", p: 2 }}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={12} md={4} align="center">
          <img
            src={current_track.album.images[0].url}
            className="now-playing__cover"
            height="100%"
            width="100%"
            alt={current_track.name}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4} align="center">
          <Card variant="outlined" sx={{ bgcolor: "rgb(40, 40, 40)", py: 3 }}>
            <Typography component="h4" variant="h4">
              {current_track.name}
            </Typography>
            <Typography style={{ color: "#fff" }} variant="subtitle1">
              {current_track.artists[0].name}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ m: 2 }}
            />
            <Box sx={{ mt: 2, color: "#fff" }}>
              <IconButton
                style={{ color: "#fff" }}
                onClick={() => {
                  player.previousTrack();
                }}
              >
                <SkipPreviousIcon fontSize="medium" />
              </IconButton>
              <IconButton
                fontSize="large"
                style={{ color: "#fff" }}
                onClick={() => {
                  player.togglePlay();
                }}
              >
                {is_paused ? <PlayArrowIcon /> : <PauseIcon />}
              </IconButton>
              <IconButton
                fontSize="large"
                style={{ color: "#fff" }}
                onClick={() => {
                  player.nextTrack();
                }}
              >
                <SkipNextIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Card variant="outlined" sx={{ bgcolor: "rgb(40, 40, 40)", py: 2 }}>
            <Typography component="h5" variant="h5">
              Vote To Skip The Song
            </Typography>
            <Typography component="h5" variant="h5">
              0 / {props.votesToSkip}
            </Typography>
            <IconButton
              style={{ color: "#fff" }}
              sx={{ py: 2 }}
              onClick={() => {
                handleSkipVote();
              }}
              disabled={hasVoted}
            >
              <NextPlanIcon fontSize="large" />
            </IconButton>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
  return <>{spotifyPlayer}</>;
}

export default WebPlayback;
