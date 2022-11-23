import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack, Divider } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 *
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  let cartProducts = [];
  if (cartData.length && productsData.length) {
    for (let i = 0; i < cartData.length; i++) {
      for (let j = 0; j < productsData.length; j++) {
        if (cartData[i].productId === productsData[j]._id) {
          cartProducts.push({ ...productsData[j], ...cartData[i] });
        }
      }
    }
  }
  //log
  // console.log("generateCartItemsFrom(): ", cartProducts);
  return cartProducts;
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  return items.reduce((acc, curr) => {
    // console.log(curr.cost, curr.qty);
    let itemvalue = curr.cost * curr.qty;
    return acc + itemvalue;
  }, 0);
};

// TODO: CRIO_TASK_MODULE_CHECKOUT - Implement function to return total cart quantity
/**
 * Return the sum of quantities of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products in cart
 *
 * @returns { Number }
 *    Total quantity of products added to the cart
 *
 */
export const getTotalItems = (items = []) => {
  let itemsCount = items.map((item) => {
    let count = 0;
    if (item.productId) count++;
    return count;
  });
  return itemsCount.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
};

// TODO: CRIO_TASK_MODULE_CHECKOUT - Add static quantity view for Checkout page cart
/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 *
 * @param {Number} value
 *    Current quantity of product in cart
 *
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 *
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 *
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 *
 */
const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
  isReadOnly = false,
}) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="medium" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="medium" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

let OrderDetailsView = ({ items = [] }) => {
  return (
    <>
      <Box className="cart">
        <Box display="flex" flexDirection="column" padding="1rem">
          <h2>Order Details</h2>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            // alignItems="flex-start"
          >
            <Box>
              <p>Products</p>
              <p>Subtotal</p>
              <p>Shipping Charges</p>
              <h3>Total</h3>
            </Box>
            <Box style={{ textAlign: "right" }}>
              <p>{getTotalItems(items)}</p>
              <p>${getTotalCartValue(items)}</p>
              <p>$0</p>
              <h3>${getTotalCartValue(items)}</h3>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 *
 */
const Cart = ({ products, items = [], handleQuantity, isReadOnly = false }) => {
  let history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
  // console.log("Cart View",items);
  return (
    <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {items.map((item) => (
          <Box
            display="flex"
            alignItems="flex-start"
            padding="1rem"
            key={item.productId}
          >
            <Box className="image-container">
              <img
                // Add product image
                src={item.image}
                // Add product name as alt eext
                alt={item.name}
                width="100%"
                height="100%"
              />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="6rem"
              paddingX="1rem"
            >
              <div>{item.name}</div>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {isReadOnly ? (
                  <Box style={{ fontSize: "1rem" }}>Qty: {item.qty}</Box>
                ) : (
                  <ItemQuantity
                    // Add required props by checking implementation
                    value={item.qty}
                    handleAdd={() =>
                      handleQuantity(item.productId, item.qty + 1)
                    }
                    handleDelete={() =>
                      handleQuantity(item.productId, item.qty - 1)
                    }
                  />
                )}
                <Box padding="0.5rem" fontWeight="700">
                  ${item.cost}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}

        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        <Divider />
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

        {isReadOnly ? null : (
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => {
                history.push("/checkout");
                window.scrollTo(0, 0);
              }}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
      {isReadOnly ? <OrderDetailsView items={items} /> : null}
    </>
  );
};

export default Cart;
