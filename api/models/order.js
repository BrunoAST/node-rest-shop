const mongoose = require('mongoose');

// Model para os parametros de Product.
const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 }
});

// A model é exportada com o nome de 'Product'.
module.exports = mongoose.model('Order', orderSchema);