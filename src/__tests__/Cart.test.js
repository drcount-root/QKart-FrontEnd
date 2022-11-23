import "@testing-library/jest-dom/extend-expect";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import { config } from "../App";
import Products from "../components/Products";

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

const cartAddResponse = [
  {
    productId: "PmInA797xJhMIPti",
    qty: 3,
  },
  {
    productId: "TwMM4OAhmK0VQ93S",
    qty: 1,
  },
];

const cartRemoveResponse = [
  {
    productId: "PmInA797xJhMIPti",
    qty: 2,
  },
];

const addToCartResponse = [
  {
    productId: "PmInA797xJhMIPti",
    qty: 2,
  },
  {
    productId: "TwMM4OAhmK0VQ93S",
    qty: 1,
  },
  {
    productId: "KCRwjF7lN97HnEaY",
    qty: 1,
  },
];

mock.onGet(`${config.endpoint}/products`).reply(200, productsResponse);
mock.onGet(`${config.endpoint}/cart`).reply(200, cartResponse);
mock
  .onPost(`${config.endpoint}/cart`, { productId: "PmInA797xJhMIPti", qty: 3 })
  .reply(200, cartAddResponse);
mock
  .onPost(`${config.endpoint}/cart`, { productId: "TwMM4OAhmK0VQ93S", qty: 0 })
  .reply(200, cartRemoveResponse);
mock
  .onPost(`${config.endpoint}/cart`, { productId: "KCRwjF7lN97HnEaY", qty: 1 })
  .reply(200, addToCartResponse);

jest.useFakeTimers();

describe("Cart Component", () => {
  const history = createMemoryHistory();
  history.push("/products");

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

    localStorage.setItem("username", "crio.do");
    localStorage.setItem("token", "testtoken");
    localStorage.setItem("balance", "5000");

    await act(async () => {
      render(ProductDOMTree(history));
    });
  });

  it("should perform an API call to fetch products", () => {
    const getProducts = mock.history.get.findIndex(
      (req) => req.url === `${config.endpoint}/products`
    );
    expect(getProducts).not.toBe(-1);
  });

  it("should make GET request to the get cart items", () => {
    const getCart = mock.history.get.find(
      (req) => req.url === `${config.endpoint}/cart`
    );

    expect(getCart).toBeTruthy();
    expect(getCart.url).toBe(`${config.endpoint}/cart`);
    expect(getCart.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
  });

  it("should show items in cart view by parsing the response data", () => {
    const item1 = screen.getAllByText(/Tan Leatherette Weekender Duffle/);
    const item2 = screen.getAllByText(/The Minimalist Slim Leather Watch/);

    const item1Price = screen.getAllByText("$150");
    const item2Price = screen.getAllByText("$60");

    const totalPrice = screen.getByText("$360");

    // Item will be present both on Products view and Cart view
    expect(item1.length).toEqual(2);
    expect(item2.length).toEqual(2);
    // Element matched by "$150", will fail if cost on cart doesn't have "$" symbol
    expect(item1Price.length).toEqual(2);
    expect(item2Price.length).toEqual(2);
    expect(totalPrice).toBeInTheDocument();
  });

  it("should be able to increase quantity of product in cart", async () => {
    const btn = screen.getAllByTestId("AddOutlinedIcon")[0];

    act(() => {
      userEvent.click(btn);
    });

    const itemQty = await screen.findAllByTestId("item-qty");
    expect(itemQty[0].textContent).toBe("3");

    const cartAddCall = mock.history.post.find(
      (req) => req.url === `${config.endpoint}/cart`
    );

    expect(cartAddCall).toBeTruthy();
    expect(cartAddCall.url).toBe(`${config.endpoint}/cart`);
    expect(cartAddCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
    expect(JSON.parse(cartAddCall.data)).toEqual(
      expect.objectContaining({
        productId: "PmInA797xJhMIPti",
        qty: 3,
      })
    );

    const cartTotal = await screen.findByTestId("cart-total");
    expect(cartTotal.textContent).toEqual("$510");
  });

  it("should be able to decrease quantity of product in cart", async () => {
    const btn = screen.getAllByTestId("RemoveOutlinedIcon")[1];

    act(() => {
      userEvent.click(btn);
    });

    const cartRemoveCall = mock.history.post.find(
      (req) =>
        req.url === `${config.endpoint}/cart` &&
        req.data === '{"productId":"TwMM4OAhmK0VQ93S","qty":0}'
    );

    expect(cartRemoveCall).toBeTruthy();
    expect(cartRemoveCall.url).toBe(`${config.endpoint}/cart`);
    expect(cartRemoveCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
    expect(JSON.parse(cartRemoveCall.data)).toEqual(
      expect.objectContaining({
        productId: "TwMM4OAhmK0VQ93S",
        qty: 0,
      })
    );

    const cartTotal = await screen.findByTestId("cart-total");
    expect(cartTotal.textContent).toEqual("$300");
  });

  it("removes the item from cart if quantity is less than one", async () => {
    const btn = screen.getAllByTestId("RemoveOutlinedIcon")[1];

    await act(async () => {
      userEvent.click(btn);
    });

    const item = await screen.findAllByText(
      /The Minimalist Slim Leather Watch/i
    );

    expect(item.length).toEqual(1);
  });

  it("adds a new item when 'ADD TO CART' button is clicked", async () => {
    const btn = screen.getAllByRole("button", { name: /add to cart/i })[2];

    expect((await screen.findAllByText(/Yonex/i)).length).toEqual(1);

    await act(async () => {
      userEvent.click(btn);
    });

    expect((await screen.findAllByText(/Yonex/i)).length).toEqual(2);
  });

  it("does not add a new item with the 'ADD TO CART' button if already in cart", async () => {
    const btn = screen.getAllByRole("button", { name: /add to cart/i })[0];

    await act(async () => {
      userEvent.click(btn);
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/item already in cart/i);
  });

  it("should have a Checkout button", () => {
    const btn = screen.getByRole("button", { name: /checkout/i });
    expect(btn).toBeInTheDocument();
  });

  it("has Checkout button to redirect to /checkout page", async () => {
    const btn = screen.getByRole("button", { name: /checkout/i });

    act(() => {
      userEvent.click(btn);
    });

    expect(history.location.pathname).toBe("/checkout");
  });
});
