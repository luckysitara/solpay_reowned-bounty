const calculateTotalAmount = (payload) => {
  let totalAmount = 0;
  let outOfStockItems = [];

  const docs = payload.docs;

  docs.forEach((cartItem) => {
    const product = cartItem.product;
    const quantity = cartItem.quantity;

    if (quantity > product.stock) {
      outOfStockItems.push({
        productId: product._id,
        availableStock: product.stock,
        requestedQuantity: quantity,
      });
    } else {
      let productPrice = product.price;
      if (product.discount && !isNaN(product.discount) && product.discount > 0) {
        productPrice = product.price * ((100 - product.discount) / 100);
        console.log({ productPrice });
      }
      totalAmount += quantity * productPrice;
    }
  });

  return { totalAmount, outOfStockItems };
};

module.exports = calculateTotalAmount;
