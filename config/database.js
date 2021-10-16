const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.0vger.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
const connectDatabase = () => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(data => {
      console.log(`MongoDb connected with server : ${data.connection.host}`);
    })
};

module.exports = connectDatabase;
