const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_URI.toString(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: `);
    });
  // .catch((err)=>{
  //     console.log(err)
  // })
  // because we handle the error in server.js
};

module.exports = connectDatabase;
