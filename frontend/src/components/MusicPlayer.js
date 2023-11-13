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

const MusicPlayer = (props) => {
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    checkUserVote();
    setHasVoted(false);
  }, [props.id]);

  const checkUserVote = async () => {
    try {
      const response = await fetch(`/spotify/check-user-vote`);
      // Assurez-vous de remplacer `userId` par l'identifiant actuel de l'utilisateur
      if (response.ok) {
        const data = await response.json();
        setHasVoted(data.hasVoted);
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
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

  const spotifyPlayer = (
    <Card
      sx={{
        bgcolor: "rgb(18, 18, 18)",
        p: 2,
        maxWidth: { xs: "100%", sm: "600px", lg: "800px" },
        margin: "auto",
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={6} md={4} align="center">
          <img
            src={props.image_url}
            className="now-playing__cover"
            height="100%"
            width="100%"
            alt={props.title}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8} align="center">
          <Card
            variant="outlined"
            sx={{ bgcolor: "rgb(40, 40, 40)", py: { md: 3, sm: 0, xs: 0 } }}
          >
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
              {props.title}
            </Typography>
            <Typography style={{ color: "#fff" }} variant="subtitle1">
              {props.artist}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(100 * props.time) / props.duration}
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
                  xs: 1,
                  sm: 2,
                },
                display: "flex",
                flexDirection: {
                  xs: "column", // Empilement vertical sur les petits écrans
                  sm: "row", // Alignement horizontal sur les écrans plus larges
                },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                size="large"
                style={{ color: "#fff" }}
                onClick={() => {
                  props.is_playing ? pauseSong() : playSong();
                }}
              >
                {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              {hasVoted ? (
                <Card sx={{ bgcolor: "#008000", ml: { sm: 2, xs: 0 }, p: 1 }}>
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
            </Box>

            <Typography style={{ color: "#fff" }} variant="subtitle1">
              Skip Vote Counter : {props.votes}/{props.votesToSkip}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
  return spotifyPlayer;
};

export default MusicPlayer;
