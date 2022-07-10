const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    item_name: {type: String, required: true},
    item_image: {type: String, required: true},
    slot_size: {type: String, required: true},
    sell_price: {type: String, required: true},
    buy_price: {type: String, required: true},
    item_category: {type: String, required: true}
},{ timestamps: true, collection: 'Documents' });

module.exports = mongoose.model('Item', ItemSchema);