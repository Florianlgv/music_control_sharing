import React from "react";
import { Grid, Button, Typography, Card } from "@mui/material";

import SearchBar from "./SearchBar";

export default function SearchSongPage({ updateShowSearchSong, playlist_id }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Card
          sx={{
            bgcolor: "rgb(18, 18, 18)",
            p: 2,
            maxWidth: { xs: "100%", sm: "600px", lg: "800px" },
            margin: "auto",
          }}
        >
          <Card
            sx={{ bgcolor: "rgb(40, 40, 40)", py: { md: 2, sm: 0, xs: 0 } }}
          >
            <SearchBar playlist_id={playlist_id} />
          </Card>
        </Card>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => updateShowSearchSong(false)}
        >
          Close
        </Button>
      </Grid>
    </Grid>
  );
}
