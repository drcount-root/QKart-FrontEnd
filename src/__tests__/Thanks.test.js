import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import Thanks from "../components/Thanks";

describe("Thanks Component", () => {
  const history = createMemoryHistory();

  const ProductDOMTree = (history) => (
    <SnackbarProvider
      maxSnack={1}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      preventDuplicate
    >
      <Router history={history}>
        <Thanks />
      </Router>
    </SnackbarProvider>
  );

  beforeEach(() => {
    localStorage.setItem("balance", "5000");

    render(ProductDOMTree(history));
  });

  it("shows the remaining balance", () => {
    expect(screen.getByText(/5000 Available/i)).toBeInTheDocument();
  });

  it("has button to route to products", () => {
    const btn = screen.getByRole("button", { name: /continue shopping/i });
    userEvent.click(btn);

    expect(history.location.pathname).toBe("/");
  });
});
