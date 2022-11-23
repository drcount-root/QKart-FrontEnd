import "@testing-library/jest-dom/extend-expect";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import { config } from "../App";
import Register from "../components/Register";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

mock
  .onPost(`${config.endpoint}/auth/register`, {
    username: "crio.do",
    password: "learnbydoing",
  })
  .reply(201, { success: true });

mock
  .onPost(`${config.endpoint}/auth/register`, {
    username: "viveknigam3003",
    password: "newpass",
  })
  .reply(400, { success: false, message: "Username is already taken" });

describe("Register Page", () => {
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
          <Register />
        </Router>
      </SnackbarProvider>
    );
  });

  //Login Form Has Heading
  it("should have a Register form title", () => {
    const heading = screen.getByRole("heading", { name: "Register" });
    expect(heading).toBeInTheDocument();
  });

  it("should have header with logo", () => {
    const images = screen.getAllByRole("img");
    const logo = images.find(
      (img) => img.getAttribute("src") === "logo_dark.svg"
    );
    expect(logo).toBeInTheDocument();
  });

  //Header has back to explore button
  it("should have header with 'back to explore' button", () => {
    const exploreButton = screen.getByRole("button", {
      name: /back to explore/i,
    });
    expect(exploreButton).toBeInTheDocument();
  });

  it("should have 'login here' link", () => {
    const loginHere = screen.getByRole("link", { name: /login/i });
    expect(loginHere).toBeInTheDocument();
  });

  it("should show error message if username empty", async () => {
    const [passwordInput] = screen.getAllByLabelText(/password/i);

    userEvent.type(passwordInput, "learnbydoing");

    expect(passwordInput).toHaveValue("learnbydoing");

    userEvent.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/required/i);
  });

  it("should show error message if username < 6 characters", async () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const [passwordInput, confirmPasswordInput] =
      screen.getAllByLabelText(/password/i);

    userEvent.type(usernameInput, "abcde");
    userEvent.type(passwordInput, "learnbydoing");
    userEvent.type(confirmPasswordInput, "learnbydoing");

    expect(usernameInput).toHaveValue("abcde");

    userEvent.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/6/i);
  });

  it("should show error message if password empty", async () => {
    const usernameInput = screen.getByLabelText(/username/i);

    userEvent.type(usernameInput, "crio.do");

    expect(usernameInput).toHaveValue("crio.do");

    userEvent.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/required/i);
  });

  it("should show error message if password < 6 chars long", async () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const [passwordInput, confirmPasswordInput] =
      screen.getAllByLabelText(/password/i);

    userEvent.type(usernameInput, "crio.do");
    userEvent.type(passwordInput, "lea");
    userEvent.type(confirmPasswordInput, "lea");

    userEvent.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/6/i);
  });

  it("should show error message if password and confirm password are not same", async () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const [passwordInput, confirmPassword] =
      screen.getAllByLabelText(/password/i);

    userEvent.type(usernameInput, "crio.do");
    userEvent.type(passwordInput, "Hello!Password");
    userEvent.type(confirmPassword, "Password");

    userEvent.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/do not match/i);
  });

  const performFormInput = (req) => {
    const usernameInput = screen.getByLabelText(/username/i);
    const [passwordInput, confirmPassword] =
      screen.getAllByLabelText(/password/i);

    userEvent.type(usernameInput, req.username);
    userEvent.type(passwordInput, req.password);
    userEvent.type(confirmPassword, req.password);

    return { usernameInput, passwordInput, confirmPassword };
  };

  it("should send a POST request with axios", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    const { usernameInput, passwordInput, confirmPassword } =
      performFormInput(request);
    expect(usernameInput).toHaveValue(request.username);
    expect(passwordInput).toHaveValue(request.password);
    expect(confirmPassword).toHaveValue(request.password);

    await act(async () => {
      userEvent.click(screen.getByRole("button", { name: /register/i }));
    });

    const registerCall = mock.history.post.find(
      (req) => req.url === `${config.endpoint}/auth/register`
    );
    expect(registerCall).toBeTruthy();
  });

  it("should send a POST request to server with correct arguments", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    const { usernameInput, passwordInput, confirmPassword } =
      performFormInput(request);
    expect(usernameInput).toHaveValue(request.username);
    expect(passwordInput).toHaveValue(request.password);
    expect(confirmPassword).toHaveValue(request.password);

    await act(async () => {
      userEvent.click(screen.getByRole("button", { name: /register/i }));
    });

    const registerCall = mock.history.post.find(
      (req) => req.url === `${config.endpoint}/auth/register`
    );

    expect(registerCall.url).toEqual(`${config.endpoint}/auth/register`);
    expect(JSON.parse(registerCall.data)).toEqual(
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
      userEvent.click(screen.getByRole("button", { name: /register/i }));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/success/i);
  });

  it("should show error alert with message sent from backend if request fails", async () => {
    const request = {
      username: "viveknigam3003",
      password: "newpass",
    };

    performFormInput(request);

    await act(async () => {
      userEvent.click(screen.getByRole("button", { name: /register/i }));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Username is already taken/i);
  });

  it("should redirect to login after success", async () => {
    const request = {
      username: "crio.do",
      password: "learnbydoing",
    };

    performFormInput(request);

    expect(history.location.pathname).toBe("/login");
  });

  it("'back to explore' button on Header should route to products", async () => {
    const exploreButton = screen.getByRole("button", {
      name: /back to explore/i,
    });
    userEvent.click(exploreButton);

    expect(history.location.pathname).toBe("/");
  });
});
