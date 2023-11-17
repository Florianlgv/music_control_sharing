import React, { useState, useEffect } from "react";

import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import SpotifyTrackList from "./SpotifyTrackList";

export default function SearchBar({ playlist_id }) {
  const [searchInput, setSearchInput] = useState("");
  const [tracks, setTracks] = useState([]);

  const search = () => {
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

  useEffect(() => {
    if (searchInput) {
      search();
    }
  }, [searchInput]);

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
