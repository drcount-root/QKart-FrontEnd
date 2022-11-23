import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let history = useHistory();
  //Local Storage
  let token = localStorage.getItem("token");
  let username = localStorage.getItem("username");
  let balance = localStorage.getItem("balance");

  // Logout btn handler
  let handleLogout = () => {
    //Redirect to same page - /products
    history.push("/");
    //Refresh the page
    history.go();
    //Remove all items
    localStorage.clear();
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <Link to="/">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Link>
      </Box>
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      ) : !username ? (
        <>
          <Box width="30vw">{children && children}</Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              onClick={() => {
                history.push("/login");
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                history.push("/register");
              }}
            >
              Register
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Box width="30vw">{children && children}</Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar alt={username} src="../../public/avatar.png" />
            <p>{username}</p>
            <Button  onClick={handleLogout}>Logout</Button>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Header;

//Not sure of onClick callback function provided to "Back to explore" BTN;

//Error after Login API successfully loads the products page -
//index.js:1 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
