const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const refundSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: 'sellers', required: true },
    items: [refundItemSchema],
    refundDate: { type: Date, default: Date.now },
});

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;
