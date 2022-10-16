const express = require("express");
const path = require('path')
require("dotenv").config({path:'./config.env'})
const Router = require("./routes/userRouter")
const cors = require('cors')
let db = require('./config/db')
const app = express();
const cookieParser = require('cookie-parser')
let PORT = process.env.PORT || 4000
app.use(express.json());
app.use(cookieParser());
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'));
app.use(cors());
db = db.connection
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});



app.use('/auth/api',Router);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
