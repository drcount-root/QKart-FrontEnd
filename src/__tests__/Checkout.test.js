import "@testing-library/jest-dom/extend-expect";
import { act, screen, render } from "@testing-library/react";
import axios from "axios";
import { createMemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Router } from "react-router-dom";
import { config } from "../App";
import Checkout from "../components/Checkout";
import MockAdapter from "axios-mock-adapter";
import userEvent from "@testing-library/user-event";

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

const addressResponse = [
  {
    address: "Some address man, just get it over with!",
    _id: "Tzd6OaX9Zaz2aEPX9ks1n",
  },
];

const updatedAddressResponse = [
  {
    address: "Some address man, just get it over with!",
    _id: "Tzd6OaX9Zaz2aEPX9ks1n",
  },
  {
    address: "new address for me is here",
    _id: "asdawad9Zaz2aEPX9ks10",
  },
];

mock.onGet(`${config.endpoint}/products`).reply(200, productsResponse);
mock.onGet(`${config.endpoint}/cart`).reply(200, cartResponse);
mock.onGet(`${config.endpoint}/user/addresses`).reply(200, addressResponse);
mock
  .onPost(`${config.endpoint}/user/addresses`)
  .reply(200, updatedAddressResponse);
mock
  .onDelete(`${config.endpoint}/user/addresses/Tzd6OaX9Zaz2aEPX9ks1n`)
  .reply(200, []);
mock.onPost(`${config.endpoint}/cart/checkout`).reply(200, { success: true });

describe("Checkout Page", () => {
  // Allow access to useHistory()
  let history = createMemoryHistory();
  history.push("/checkout");

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
        <Checkout />
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

  // afterEach(() => {
  //   history.push("/checkout");
  // })

  it("should retrieve products", () => {
    const getCalls = mock.history.get.map((call) => call.url);
    expect(getCalls).toContain(`${config.endpoint}/products`);
  });

  it("should retieve addresses of the user", () => {
    const getCalls = mock.history.get.map((call) => ({
      url: call.url,
      headers: call.headers,
    }));
    const addressCall = getCalls.find(
      (call) => call.url === `${config.endpoint}/user/addresses`
    );

    expect(addressCall.url).toBe(`${config.endpoint}/user/addresses`);
    expect(addressCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
  });

  it("should retieve cart items of the user", () => {
    const getCalls = mock.history.get.map((call) => ({
      url: call.url,
      headers: call.headers,
    }));
    const cartCall = getCalls.find(
      (call) => call.url === `${config.endpoint}/cart`
    );

    expect(cartCall.url).toBe(`${config.endpoint}/cart`);
    expect(cartCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
  });

  it("should show items by parsing the response data", () => {
    const item1 = screen.getAllByText(/Tan Leatherette Weekender Duffle/);
    const item2 = screen.getAllByText(/The Minimalist Slim Leather Watch/);

    const item1Price = screen.getAllByText("$150");
    const item2Price = screen.getAllByText("$60");

    expect(item1.length).toEqual(1);
    expect(item2.length).toEqual(1);
    expect(item1Price.length).toEqual(1);
    expect(item2Price.length).toEqual(1);
  });

  it("should not allow to edit quantity", () => {
    const qty = screen.getAllByText(/Qty/i);
    expect(qty.length).toEqual(2);

    expect(screen.queryAllByTestId("RemoveOutlinedIcon")).toEqual([]);
    expect(screen.queryAllByTestId("AddOutlinedIcon")).toEqual([]);
  });

  it("should show user addresses", () => {
    const address = screen.getByText(/Some address/i);
    expect(address).toBeInTheDocument();
  });

  it("should have delete button for user addresses", () => {
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();
  });

  it("should have add new address button", () => {
    const addBtn = screen.getByRole("button", { name: /add new address/i });
    expect(addBtn).toBeInTheDocument();
  });

  it("should have a place order button", () => {
    const payBtn = screen.getByRole("button", { name: /place order/i });
    expect(payBtn).toBeInTheDocument();
  });

  it("should show error message if no address selected for checkout", () => {
    const payBtn = screen.getByRole("button", { name: /place order/i });

    userEvent.click(payBtn);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/select one shipping address/i);
  });

  it("should show error message if low balance", () => {
    localStorage.setItem("balance", "0");
    const address = screen.getByText(/Some address/i);
    const payBtn = screen.getByRole("button", { name: /place order/i });

    act(() => {
      userEvent.click(address);
    });

    userEvent.click(payBtn);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/not have enough balance/i);
  });

  it("has add new address button which shows textfield with action buttons", () => {
    const addBtn = screen.getByRole("button", { name: /add new address/i });

    userEvent.click(addBtn);

    expect(
      screen.getByPlaceholderText(/enter your complete address/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("allows to add new address", async () => {
    expect(
      screen.queryByPlaceholderText(/enter your complete address/i)
    ).toBeNull();

    const addBtn = screen.getByRole("button", { name: /add new address/i });
    userEvent.click(addBtn);
    const textField = screen.getByPlaceholderText(
      /enter your complete address/i
    );
    expect(textField).toBeInTheDocument();

    await userEvent.type(textField, "new address for me is here", { delay: 1 });

    expect(textField).toHaveValue("new address for me is here");

    const addBtn2 = screen.getByRole("button", { name: /add/i });
    await act(async () => {
      userEvent.click(addBtn2);
    });

    const addressCall = mock.history.post.find(
      (call) => call.url === `${config.endpoint}/user/addresses`
    );

    expect(addressCall.url).toBe(`${config.endpoint}/user/addresses`);
    expect(addressCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
    expect(addressCall.data).toBe(
      JSON.stringify({ address: "new address for me is here" })
    );

    const address = screen.getByText(/new address for me is here/i);
    expect(address).toBeInTheDocument();
  });

  it("allows to delete address", async () => {
    const deleteBtn = screen.getByRole("button", { name: /delete/i });

    await act(async () => {
      userEvent.click(deleteBtn);
    });

    const deleteAddress = mock.history.delete.find(
      (req) =>
        req.url === `${config.endpoint}/user/addresses/Tzd6OaX9Zaz2aEPX9ks1n`
    );

    expect(deleteAddress).toBeTruthy();
    expect(deleteAddress.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
    expect(deleteAddress.url).toBe(
      `${config.endpoint}/user/addresses/Tzd6OaX9Zaz2aEPX9ks1n`
    );

    expect(screen.queryByText(/Some address/i)).toBeNull();
  });

  it("should make an API call on clicking make payement button", () => {
    const address = screen.getByText(/Some address/i);
    const payBtn = screen.getByRole("button", { name: /place order/i });

    act(() => {
      userEvent.click(address);
    });

    userEvent.click(payBtn);

    const postCalls = mock.history.post.map((call) => ({
      url: call.url,
      headers: call.headers,
      data: call.data,
    }));

    const checkoutCall = postCalls.find(
      (call) => call.url === `${config.endpoint}/cart/checkout`
    );
    expect(checkoutCall.url).toBe(`${config.endpoint}/cart/checkout`);
    expect(checkoutCall.headers.Authorization).toBe(
      `Bearer ${localStorage.getItem("token")}`
    );
    expect(checkoutCall.data).toBe(
      JSON.stringify({
        addressId: "Tzd6OaX9Zaz2aEPX9ks1n",
      })
    );
  });

  it("should route to /thanks after checkout successful", () => {
    const address = screen.getByText(/Some address/i);
    const payBtn = screen.getByRole("button", { name: /place order/i });

    act(() => {
      userEvent.click(address);
    });

    userEvent.click(payBtn);

    expect(history.location.pathname).toBe("/thanks");
  });
});
