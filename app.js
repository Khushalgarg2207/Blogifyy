require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");


const Blog = require("./models/blog");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const { checkForAuthCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL)
.then((e) => console.log("Mongo Db connected"));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.resolve('./public')));

app.set("view engine","ejs");
app.set("views",path.resolve('./views'));
app.use('/user',userRoute);
app.use('/blog',blogRoute);


app.get('/', async (req, res) => {
  const allBlogs = await Blog.find({}).populate("createdBy");
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.listen(PORT,() =>console.log(`Server started at Port ${PORT}`));