import "@testing-library/jest-dom/extend-expect";
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import { config } from "../App";
import Products from "../components/Products";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

const productsResponse = [
  {
    name: "Tan Leatherette Weekender Duffle",
    category: "Fashion",
    cost: 150,
    rating: 4,
    image:
      "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
    _id: "PmInA797xJhMIPti",
  },
  {
    name: "The Minimalist Slim Leather Watch",
    category: "Electronics",
    cost: 60,
    rating: 5,
    image:
      "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/5b478a4a-bf81-467c-964c-1881887799b7.png",
    _id: "TwMM4OAhmK0VQ93S",
  },
];

const cartResponse = [
  {
    productId: "PmInA797xJhMIPti",
    qty: 2,
  },
  {
    productId: "TwMM4OAhmK0VQ93S",
    qty: 1,
  },
];

mock.onGet(`${config.endpoint}/products`).reply(200, productsResponse);
mock.onGet(`${config.endpoint}/cart`).reply(200, cartResponse);

jest.useFakeTimers();

describe("Products Page - Header", () => {
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
        <Products />
      </Router>
    </SnackbarProvider>
    
  );

  beforeEach(async () => {
    mock.resetHistory();

    // https://github.com/clarkbw/jest-localstorage-mock/issues/125
    jest.clearAllMocks();

    await act(async () => {
      render(ProductDOMTree(history));
    });
  });

  it("should have a header with logo", async () => {
    const images = screen.getAllByRole("img");
    const logo = images.find(
      (img) => img.getAttribute("src") === "logo_dark.svg"
    );
    expect(logo).toBeInTheDocument();
  });

  it("should have login button on Header route to login page when logged out", async () => {
    const loginBtn = screen.getByRole("button", { name: /login/i });
    userEvent.click(loginBtn);

    expect(history.location.pathname).toBe("/login");
  });

  it("should have register button on Header route to register page when logged out", async () => {
    const registerBtn = screen.getByRole("button", { name: /register/i });
    userEvent.click(registerBtn);

    expect(history.location.pathname).toBe("/register");
  });

  it("should have a search bar", () => {
    const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
    expect(searchInput).toBeInTheDocument();
  });
});

describe("Products Page - Header: Logged in", () => {
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
        <Products />
      </Router>
    </SnackbarProvider>
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    localStorage.setItem("username", "crio.do");
    localStorage.setItem("token", "testtoken");

    await act(async () => {
      render(ProductDOMTree(history));
    });
  });

  it("should have username & avatar in header if logged in", () => {
    const avatar = screen.getByAltText(/crio.do/i);
    const username = screen.getByText(/crio.do/i);
    expect(avatar).toBeInTheDocument();
    expect(username).toBeInTheDocument();
  });

  it("should have logout button in header when logged in", () => {
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("logout button should clear localstorage items", async () => {
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    userEvent.click(logoutButton);

    expect(localStorage.getItem("username")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("balance")).toBeNull();
  });
});

describe("Products Page", () => {
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
        <Products />
      </Router>
    </SnackbarProvider>
  );

  beforeEach(async () => {
    // https://github.com/clarkbw/jest-localstorage-mock/issues/125
    jest.clearAllMocks();

    render(ProductDOMTree(history));

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should make a GET request to load products", () => {
    const getProductsCall = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/products`
    );
    expect(getProductsCall).toBeTruthy();
  });

  it("shows items on the products page load", async () => {
    const addToCartBtn = screen.queryAllByRole("button", {
      name: /add to cart/i,
    });

    const cardImages = screen
      .queryAllByRole("img")
      .map((image) => image.getAttribute("src"))
      .filter((src) => src !== null)
      .filter((src) => src.match(/https/i));

    const stars = screen
      .queryAllByRole("img")
      .map((img) => img.getAttribute("aria-label"))
      .filter((label) => label !== null)
      .filter((label) => label.match(/stars/i));

    expect(stars.length).toEqual(2);
    expect(cardImages.length).toEqual(2);
    expect(addToCartBtn.length).toEqual(2);
  });

  it("should make a GET request to search", async () => {
    const searchResponse = [
      {
        name: "YONEX Smash Badminton Racquet",
        category: "Sports",
        cost: 100,
        rating: 5,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/64b930f7-3c82-4a29-a433-dbc6f1493578.png",
        _id: "KCRwjF7lN97HnEaY",
      },
    ];
    mock
      .onGet(`${config.endpoint}/products/search?value=smash`)
      .reply(200, searchResponse);

    const search = screen.getAllByPlaceholderText(/search/i)[0];

    userEvent.type(search, "smash");

    expect(search).toHaveValue("smash");

    await act(async () => {
      jest.runAllTimers();
    });

    const searchCall = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/products/search?value=smash`
    );
    expect(searchCall).toBeTruthy();
    expect(searchCall.url).toEqual(
      `${config.endpoint}/products/search?value=smash`
    );
  });

  it("should show all products if search empty", async () => {
    const search = screen.getAllByPlaceholderText(/search/i)[0];
    mock.onGet(`${config.endpoint}/products/search?value=`).reply(404, []);

    userEvent.type(search, "");

    await act(async () => {
      jest.runAllTimers();
    });

    const addToCartBtn = screen.queryAllByRole("button", {
      name: /add to cart/i,
    });
    expect(addToCartBtn.length).toEqual(2);
  });

  it("should show matching products if found", async () => {
    const searchResponse = [
      {
        name: "YONEX Smash Badminton Racquet",
        category: "Sports",
        cost: 100,
        rating: 5,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/64b930f7-3c82-4a29-a433-dbc6f1493578.png",
        _id: "KCRwjF7lN97HnEaY",
      },
    ];

    mock
      .onGet(`${config.endpoint}/products/search?value=smash`)
      .reply(200, searchResponse);

    const search = screen.getAllByPlaceholderText(/search/i)[0];

    userEvent.type(search, "smash");

    await act(async () => {
      jest.runAllTimers();
    });

    const text = screen.getByText(/YONEX Smash Badminton Racquet/);
    const addToCartBtn = screen.queryAllByRole("button", {
      name: /add to cart/i,
    });

    expect(text).toBeInTheDocument();
    expect(addToCartBtn.length).toEqual(1);
  });

  it("should 'No Products Found' if search string does get any items", async () => {
    mock
      .onGet(`${config.endpoint}/products/search?value=smasher`)
      .reply(404, []);

    // Matches by "placeholder" attribute value set for search input field - should have "search" in the placeholder
    const search = screen.getAllByPlaceholderText(/search/i)[0];

    userEvent.type(search, "smasher");

    await act(async () => {
      jest.runAllTimers();
    });

    const searchCall = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/products/search?value=smasher`
    );
    const text = await screen.findByText(/No products found/i);
    const addToCartBtn = screen.queryAllByRole("button", {
      name: /add to cart/i,
    });

    expect(searchCall).toBeTruthy();
    expect(text).toBeInTheDocument();
    expect(addToCartBtn.length).toEqual(0);
  });

  it("updates search items as search string updates", async () => {
    const response1 = [
      {
        name: "Tan Leatherette Weekender Duffle",
        category: "Fashion",
        cost: 150,
        rating: 4,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
        _id: "PmInA797xJhMIPti",
      },
      {
        name: "The Minimalist Slim Leather Watch",
        category: "Electronics",
        cost: 60,
        rating: 5,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/5b478a4a-bf81-467c-964c-1881887799b7.png",
        _id: "TwMM4OAhmK0VQ93S",
      },
    ];

    const response2 = [
      {
        name: "Tan Leatherette Weekender Duffle",
        category: "Fashion",
        cost: 150,
        rating: 4,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
        _id: "PmInA797xJhMIPti",
      },
    ];

    mock
      .onGet(`${config.endpoint}/products/search?value=leather`)
      .reply(200, response1);
    mock
      .onGet(`${config.endpoint}/products/search?value=leathere`)
      .reply(200, response2);

    const search = screen.getAllByPlaceholderText(/search/i)[0];

    userEvent.type(search, "leather");

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      }).length
    ).toEqual(2);

    const item1 = screen.getByText(/Tan Leatherette Weekender Duffle/i);
    const item2 = screen.getByText(/The Minimalist Slim Leather Watch/i);
    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();

    userEvent.type(search, "e");
    expect(search).toHaveValue("leathere");

    await act(async () => {
      jest.runAllTimers();
    });

    expect(item2).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      }).length
    ).toEqual(1);
  });

  it("debounces the searching API calls", async () => {
    const searchResponse = [
      {
        name: "YONEX Smash Badminton Racquet",
        category: "Sports",
        cost: 100,
        rating: 5,
        image:
          "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/64b930f7-3c82-4a29-a433-dbc6f1493578.png",
        _id: "KCRwjF7lN97HnEaY",
      },
    ];

    mock
      .onGet(`${config.endpoint}/products/search?value=badminton`)
      .reply(200, searchResponse);

    const search = screen.getAllByPlaceholderText(/search/i)[0];

    userEvent.type(search, "badminton");

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    const searchCall = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/products/search?value=badminton`
    );
    expect(searchCall).toBeFalsy();

    await act(async () => {
      jest.runAllTimers();
    });

    const searchCall2 = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/products/search?value=badminton`
    );
    expect(searchCall2).toBeTruthy();
  });
});
