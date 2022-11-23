import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  Box,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";
// import { makeStyles } from "@material-ui/core/styles";

const ProductCard = ({ product, handleAddToCart }) => {
  // Custom Styles
  // const classes = useStyles();

  // console.log(product);
  return (
    <Card className="card">
      <CardMedia
        component="img"
        image={product.image}
        alt="product"
      />
      <CardContent>
        <Typography gutterBottom variant="body2" component="div">
          {product.name}
        </Typography>
        <Typography
          variant="h6"
          color="textPrimary"
          sx={{ fontWeight: "bold" }}
          mb={1}
        >
          ${product.cost}
        </Typography>
        <Box display="flex">
          <Rating
            name="read-only"
            value={product.rating}
            readOnly
            size="small"
          />
          <Box sx={{ ml: 1 }}>({product.rating})</Box>
        </Box>
      </CardContent>
      <CardActions className="card-actions">
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleAddToCart}
          className="card-button"
        >
          <AddShoppingCartOutlined /> &nbsp; ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
