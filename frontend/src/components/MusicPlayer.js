import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
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
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

const MusicPlayer = ({
  id,
  image_url,
  title,
  artist,
  is_playing,
  time,
  duration,
  votes,
  votesToSkip,
  updateShowSearchSong,
  playlist_name,
}) => {
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    checkUserVote();
    setHasVoted(false);
  }, [id]);

  const checkUserVote = () => {
    fetch(`/spotify/check-user-vote`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        setHasVoted(data.hasVoted);
      })
      .catch((error) => {
        console.error("Error checking user vote:", error);
      });
  };

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions);
  };
  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions);
  };
  const handleSkipVote = () => {
    setHasVoted(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip-vote", requestOptions);
  };

  return (
    <Card
      sx={{
        bgcolor: "rgb(18, 18, 18)",
        p: 2,
        maxWidth: { xs: "80%", sm: "600px", lg: "800px" },
        margin: "auto",
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={6} md={4} align="center">
          <img
            src={image_url}
            className="now-playing__cover"
            height="100%"
            width="100%"
            alt={title}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8} align="center">
          <Card
            variant="outlined"
            sx={{ bgcolor: "rgb(40, 40, 40)", py: { md: 2, sm: 0, xs: 0 } }}
          >
            <Typography component="h6" variant="h6" sx={{ pb: 1 }}>
              Playlist : {playlist_name}
            </Typography>
            <Typography
              component="h4"
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1.5rem",
                  sm: "2rem",
                  md: "2.5rem",
                },
              }}
            >
              {title}
            </Typography>
            <Typography style={{ color: "#fff" }} variant="subtitle1">
              {artist}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(100 * time) / duration}
              sx={{
                mt: { sm: 1, xs: 1 },
                mx: { sm: 3, xs: 1 },
                height: {
                  xs: "4px",
                  sm: "6px",
                },
              }}
            />
            <Box
              sx={{
                mt: {
                  xs: 1,
                  sm: 2,
                },
                mb: {
                  xs: 0,
                  sm: 2,
                },
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                size="large"
                style={{ color: "#fff" }}
                onClick={() => {
                  is_playing ? pauseSong() : playSong();
                }}
              >
                {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              {hasVoted ? (
                <Card
                  color="success"
                  sx={{ bgcolor: "#008000", ml: { sm: 2, xs: 0 }, p: 1 }}
                >
                  <Typography style={{ color: "#fff" }} variant="subtitle1">
                    Skip Vote Sent !
                  </Typography>
                </Card>
              ) : (
                <Button
                  size="large"
                  color="primary"
                  variant="contained"
                  sx={{ mx: 1 }}
                  onClick={() => {
                    handleSkipVote();
                  }}
                  disabled={hasVoted}
                  endIcon={<SkipNextIcon />}
                >
                  Vote to Skip
                </Button>
              )}
              <IconButton
                size="large"
                style={{ color: "#fff" }}
                onClick={() => updateShowSearchSong(true)}
              >
                <PlaylistAddIcon />
              </IconButton>
            </Box>

            <Typography style={{ color: "#fff" }} variant="subtitle1">
              Skip Vote Counter : {votes}/{votesToSkip}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
};

export default MusicPlayer;
