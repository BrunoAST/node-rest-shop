const mongoose = require('mongoose');

// Model para os parametros de Product.
const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    productImage: { type: String, required: true }
});

// A model é exportada com o nome de 'Product'.
module.exports = mongoose.model('Product', productSchema);