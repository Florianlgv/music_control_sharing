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
  const buttonStyle = {
    color: "#fff",
    borderRadius: "50%", // Rendre le bouton circulaire
    width: 40, // Largeur du bouton
    height: 40, // Hauteur du bouton
    ...(props.votes && {
      // Style supplémentaire lorsque hasVoted est true
      backgroundColor: "#81b71a", // Couleur de fond grise pour l'effet "enfoncé"
      color: "#fff", // Couleur du texte plus sombre
      "&:hover": {
        backgroundColor: "#81b71a", // Maintenir la même couleur au survol
      },
      boxShadow: "inset 0px 0px 10px #81b71a",
    }),
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
          <Card variant="outlined" sx={{ bgcolor: "rgb(40, 40, 40)", py: 3 }}>
            <Typography component="h4" variant="h4">
              {props.title}
            </Typography>
            <Typography style={{ color: "#fff" }} variant="subtitle1">
              {props.artist}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(100 * props.time) / props.duration}
              sx={{ m: 2 }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <IconButton
                size="large"
                style={{ color: "#fff" }}
                onClick={() => {
                  props.is_playing ? pauseSong() : playSong();
                }}
              >
                {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton
                size="large"
                sx={buttonStyle}
                onClick={() => {
                  handleSkipVote();
                }}
                disabled={hasVoted}
              >
                <SkipNextIcon />
              </IconButton>
            </Box>
            <Typography style={{ color: "#fff" }} variant="subtitle1">
              Vote to Skip : {props.votes}/{props.votesToSkip}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
  return <>{spotifyPlayer}</>;
};

export default MusicPlayer;
