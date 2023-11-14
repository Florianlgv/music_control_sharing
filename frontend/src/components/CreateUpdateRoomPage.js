import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
  Alert,
} from "@mui/material";

const CreateRoomPage = ({
  votesToSkip,
  guestCanPause,
  update,
  roomCode,
  updateCallback,
}) => {
  const [votesToSkipState, setVotesToSkipState] = useState(votesToSkip);
  const [guestCanPauseState, setGuestCanPauseState] = useState(guestCanPause);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleVotesChange = (e) => {
    setVotesToSkipState(e.target.value);
  };

  const handleGuestCanPauseChange = (e) => {
    setGuestCanPauseState(e.target.value === "true");
  };

  const handleRoomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkipState,
        guest_can_pause: guestCanPauseState,
      }),
    };
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => navigate(`/room/${data.code}`));
  };

  const handleUpdateButtonPressed = () => {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkipState,
        guest_can_pause: guestCanPauseState,
        code: roomCode,
      }),
    };

    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        setSuccessMsg("Room updated sucessfully!");
      } else {
        setErrorMsg("Error updating room...");
      }
      updateCallback();
    });
  };

  const renderCreateButtons = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={handleRoomButtonPressed}
        >
          Create A Room
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );

  const renderUpdateButtons = () => (
    <Grid item xs={12} align="center">
      <Button
        color="primary"
        variant="contained"
        onClick={handleUpdateButtonPressed}
      >
        Update Room
      </Button>
    </Grid>
  );

  const title = update ? "Update Room" : "Create a Room";

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={errorMsg != "" || successMsg != ""}>
          {successMsg != "" ? (
            <Alert
              severity="success"
              onClose={() => {
                setSuccessMsg("");
              }}
            >
              {successMsg}
            </Alert>
          ) : (
            <Alert
              severity="error"
              onClose={() => {
                setErrorMsg("");
              }}
            >
              {errorMsg}
            </Alert>
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component="fieldset">
          <FormHelperText align="center" sx={{ textAlign: "center" }}>
            Guest Control of Playback State
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={guestCanPauseState.toString()}
            onChange={handleGuestCanPauseChange}
            sx={{
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} sx={{ py: 1 }} align="center">
        <FormControl>
          <TextField
            required={true}
            type="number"
            variant="standard"
            onChange={handleVotesChange}
            defaultValue={votesToSkipState}
            inputProps={{
              min: 1,
              style: { textAlign: "center" },
              fontSize: "40px",
            }}
          />
          <FormHelperText sx={{ textAlign: "center" }}>
            Vote Required To Skip Song
          </FormHelperText>
        </FormControl>
      </Grid>
      {update ? renderUpdateButtons() : renderCreateButtons()}
    </Grid>
  );
};

CreateRoomPage.defaultProps = {
  votesToSkip: 2,
  guestCanPause: true,
  update: false,
  roomCode: null,
  updateCallback: () => {},
};

export default CreateRoomPage;
