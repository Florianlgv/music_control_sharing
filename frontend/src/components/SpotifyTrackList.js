import React, { useState } from "react";
import { Grid, Typography, IconButton, Stack } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Tooltip from "@mui/material/Tooltip";

import ResponsiveImage from "./ResponsiveImage";

export default function SpotifyTrackList({ tracks, playlist_id }) {
  const [addedSongs, setAddedSongs] = useState({});

  const toggleSongAdded = (id) => {
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
          if (response.status === 409) {
            setAddedSongs((prevAddedSongs) => ({
              ...prevAddedSongs,
              [id]: { added: false, error: true },
            }));
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAddedSongs((prevAddedSongs) => ({
          ...prevAddedSongs,
          [id]: { added: true, error: false },
        }));
      })
      .catch((error) => {
        console.log("Error adding song:", error);
      });
  };

  const getBackgroundColor = (trackId) => {
    const songState = addedSongs[trackId];
    if (songState?.error) return "#d3d3d3";
    return songState?.added ? "#96be73" : "transparent";
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
            backgroundColor: getBackgroundColor(track.id),
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
