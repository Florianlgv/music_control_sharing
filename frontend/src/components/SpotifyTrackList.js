import React, { useState } from "react";
import {
  Grid,
  Avatar,
  ListItemText,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Tooltip from "@mui/material/Tooltip";
import ResponsiveImage from "./ResponsiveImage";

export default function SpotifyTrackList({ tracks, playlist_id }) {
  const [addedSongs, setAddedSongs] = useState({});

  const toggleSongAdded = (id) => {
    console.log("Song ID:", id, "Playlist ID:", playlist_id);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        song_id: id,
        playlist_id: playlist_id,
      }),
    };

    fetch("/spotify/add-song-to-playlist", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Song added:", data);
        setAddedSongs((prevAddedSongs) => ({
          ...prevAddedSongs,
          [id]: !prevAddedSongs[id],
        }));
      })
      .catch((error) => {
        console.log("Error adding song:", error);
      });
  };

  return (
    <Stack bgcolor={"#F0F3F4"}>
      {tracks.map((track, index) => (
        <Grid
          container
          key={index}
          alignItems="center"
          justifyContent="space-between"
          style={{
            backgroundColor: addedSongs[track.id] ? "#96be73" : "transparent",
          }}
        >
          <Grid item xs={2} sm={3} md={2} align="left" height="100%">
            <ResponsiveImage src={track.cover} alt={track.album} />
          </Grid>
          <Grid item xs={7} sm={7} md={8}>
            <Tooltip title={track.name}>
              <Typography
                color="text.secondary"
                variant="h6"
                className="truncate"
              >
                {track.name}
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              color="text.secondary"
              className="truncate"
            >
              {track.artist} - {track.album}
            </Typography>
          </Grid>
          <Grid item xs={2} sm={2} md={2} align="right">
            <IconButton onClick={() => toggleSongAdded(track.id)}>
              {addedSongs[track.id] ? (
                <PlaylistAddCheckIcon />
              ) : (
                <AddCircleOutlineIcon />
              )}
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
}
