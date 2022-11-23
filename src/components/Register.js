import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  let history = useHistory();
  let token = localStorage.getItem("token");
  let username = localStorage.getItem("username");
  let balance = localStorage.getItem("balance");

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */

  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  let handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const register = async (formData) => {
    // Condition
    if (!validateInput(formData)) return;
    //Start loading
    setIsLoading(true);
    try {
      const data = {
        username: formData.username,
        password: formData.password,
      };
      // POST call
      let res = await axios.post(`${config.endpoint}/auth/register`, data);
      //Redirect to login page
      history.push("/login");

      //Form reset
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
      });
      //Success
      if (res.data.success) {
        enqueueSnackbar("Registered successfully", {
          variant: "success",
        });
      }
    } catch (error) {
      // If username already exists
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        //Other errors
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
    //End loading
    setIsLoading(false);
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - "Passwords do not match"
   */

  const validateInput = (data) => {
    let { username, password, confirmPassword } = data;

    if (!username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    if (username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    if (password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
    return true;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={handleInput}
            value={formData.username || ""}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={handleInput}
            value={formData.password || ""}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={handleInput}
            value={formData.confirmPassword || ""}
          />
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress color="success" size={25} />
            </Box>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={async () => {
                await register(formData);
              }}
            >
              Register Now
            </Button>
          )}
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
