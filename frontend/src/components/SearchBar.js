import React, { useState, useEffect } from "react";

import SpotifyTrackList from "./SpotifyTrackList";

import {
  Button,
  Grid,
  TextField,
  Container,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({ playlist_id }) {
  const [searchInput, setSearchInput] = useState("");
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (searchInput) {
      search();
    }
  }, [searchInput]);

  const search = () => {
    if (searchInput == "") {
      setTracks([]);
      return;
    }
    const url = `/spotify/search-song?query=${encodeURIComponent(searchInput)}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setTracks(data);
      })
      .catch((error) => {
        console.error("Error during search:", error);
      });
  };

  return (
    <>
      <TextField
        placeholder="Search for a song"
        variant="outlined"
        value={searchInput}
        sx={{ mb: 1 }}
        onChange={(event) => {
          setSearchInput(event.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#fff" }} />
            </InputAdornment>
          ),
        }}
      />

      <SpotifyTrackList tracks={tracks} playlist_id={playlist_id} />
    </>
  );
}
