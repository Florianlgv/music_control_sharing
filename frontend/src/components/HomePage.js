import React, { useState, useEffect } from "react";
import JoinRoomPage from "./JoinRoomPage";
import CreateUpdateRoomPage from "./CreateUpdateRoomPage";
import Room from "./Room";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const HomePage = () => {
  const theme = useTheme();
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        setRoomCode(data.code);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  const homePage = (
    <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" compact="h3">
          House Party
        </Typography>
        <Typography variant="h6" compact="h6">
          By SpotiFlo
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" to="/join" component={Link}>
            Join a Room
          </Button>
          <Button color="secondary" to="/create" component={Link}>
            Create a Room
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );

  return (
    <Router>
      <Routes>
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/create" element={<CreateUpdateRoomPage />} />
        <Route
          path="/room/:roomCode"
          element={<Room leaveRoomCallback={clearRoomCode} />}
        />
        <Route
          path="/"
          element={
            roomCode ? <Navigate to={`/room/${roomCode}`} replace /> : homePage
          }
        />
      </Routes>
    </Router>
  );
};

export default HomePage;
