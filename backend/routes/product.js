var express = require("express");
var router = express.Router();
const { handleError, getProduct } = require("../utils");
var { products } = require("../db");

router.get("/", (req, res) => {
  console.log("Request received for retrieving products list");

  products.find({}, (err, docs) => {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(docs);
  });
});

// /search?value=
router.get("/search", (req, res) => {
  console.log("Request received for searching ", req.query.value);

  //Creating a RegEx to search
  const searchRegex = new RegExp(req.query.value.replace(/['"]+/g, ""), "i");

  products.find(
    { $or: [{ name: searchRegex }, { category: searchRegex }] },
    (err, docs) => {
      if (err) {
        return handleError(res, err);
      }

      if (docs.length) {
        return res.status(200).json(docs);
      } else {
        return res.status(404).json([]);
      }
    }
  );
});

router.get("/:id", async (req, res) => {
  console.log(
    `Request received for retrieving product with id: ${req.params.id}`
  );
  try {
    const product = await getProduct(req.params.id);
    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json();
    }
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
