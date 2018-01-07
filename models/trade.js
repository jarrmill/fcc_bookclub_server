const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
  //_id: ObjectId,
  offerId: String,
  offerUser: String,
  requestId: String,
  requestUser: String
});

const Trade = mongoose.model('trade', tradeSchema);
// Export the model
module.exports = Trade;
