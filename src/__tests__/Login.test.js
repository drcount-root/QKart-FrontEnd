import "@testing-library/jest-dom/extend-expect";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import { config } from "../App";
import Login from "../components/Login";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

mock
  .onPost(`${config.endpoint}/auth/login`, {
    username: "crio.do",
    password: "learnbydoing",
  })
  .reply(201, {
    success: true,
    token: "testtoken",
    username: "crio.do",
    balance: 5000,
  });

mock
  .onPost(`${config.endpoint}/auth/login`, {
    username: "crio.do",
    password: "wrongpassword",
  })
  .reply(400, {
    success: false,
    message: "Password is incorrect",
  });

describe("Login Page", () => {
  const history = createMemoryHistory();

  beforeEach(() => {
    mock.resetHistory();

    render(
      <SnackbarProvider
        maxSnack={1}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        preventDuplicate
      >
        <Router history={history}>
          <Login />
        </Router>
      </SnackbarProvider>
    );
  });

  //Login Form Has Heading
  it("should have a Login form title", () => {
    // Matches by h1-h6 tags
    const heading = screen.getByRole("heading", { name: "Login" });
    expect(heading).toBeInTheDocument();
  });

  it("should have a header with logo", () => {
    // Matches by <img> tag role -> img
    const images = screen.getAllByRole("img");

    // Find <img> with matching src attribute
    const logo = images.find(
      (img) => img.getAttribute("src") === "logo_dark.svg"
    );
    expect(logo).toBeInTheDocument();
  });

  //Header has back to explore button
  it("should have header with back to explore button", () => {
    // Matches by <button> with text "Back To Explore" - case insensitive
    const exploreButton = screen.getByRole("button", {
      name: /back to explore/i,
    });
    expect(exploreButton).toBeInTheDocument();
  });

  it("'back to explore' button on Header should route to products", async () => {
    // Matches by <button> with text "Back To Explore" - case insensitive
    const exploreButton = screen.getByRole("button", {
      name: /back to explore/i,
    });
    userEvent.click(exploreButton);

    expect(history.location.pathname).toBe("/");
  });

  it("should have register now link", () => {
    // Matches by <a> with href and text "Register now" - case insensitive
    const registerNow = screen.getByRole("link", { name: /register now/i });
    expect(registerNow).toBeInTheDocument();
  });

  it("should throw error if username field is empty", async () => {
    const passwordInput = screen.getByLabelText(/password/i);

    userEvent.type(passwordInput, "learnbydoing");

    userEvent.click(screen.getByText(/login to qkart/i));    

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/(?=.*username)(?=.*required)/i);
  });

  it("should throw error if password field is empty", async () => {
    const usernameInput = screen.getByLabelText(/username/i);

    userEvent.type(usernameInput, "crio.do");

    userEvent.click(screen.getByText(/login to qkart/i));    

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/(?=.*password)(?=.*required)/i);
  });

  const performFormInput = (req) => {
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    userEvent.type(usernameInput, req.username);
    userEvent.type(passwordInput, req.password);

    return { usernameInput, passwordInput };
  };

  it("should send a POST request with axios", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    const { usernameInput, passwordInput } = performFormInput(request);
    expect(usernameInput).toHaveValue(request.username);
    expect(passwordInput).toHaveValue(request.password);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    const loginPostCall = mock.history.post.find(
      (req) => req.url === `${config.endpoint}/auth/login`
    );
    expect(loginPostCall).toBeTruthy();
  });

  it("should send a POST request to server with correct arguments", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    const { usernameInput, passwordInput } = performFormInput(request);
    expect(usernameInput).toHaveValue(request.username);
    expect(passwordInput).toHaveValue(request.password);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    const loginPostCall = mock.history.post.find(
      (req) => req.url === `${config.endpoint}/auth/login`
    );

    expect(JSON.parse(loginPostCall.data)).toEqual(
      expect.objectContaining({
        username: request.username,
        password: request.password,
      })
    );
  });

  it("should show success alert if request succeeds", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    performFormInput(request);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/logged in/i);
  });

  it("should show error alert with message sent from backend if request fails", async () => {
    const request = {
      username: "crio.do",
      password: "wrongpassword",
    };

    performFormInput(request);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/password is incorrect/i);
  });

  it("should store values in local storage if request succeeds", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    performFormInput(request);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "username",
      "crio.do"
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith("balance", 5000);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "token",
      "testtoken"
    );
  });

  it("should redirect to products page after success", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    performFormInput(request);

    await act(async () => {
      userEvent.click(screen.getByText(/login to qkart/i));
    });

    expect(history.location.pathname).toBe("/");
  });
});