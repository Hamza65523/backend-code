const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBURL,
  {
    useNewUrlParser: true,
  }
);
module.exports = mongoose;