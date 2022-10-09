const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate } = require("../utils/helpers");

exports.getIndex = async (req, res) => {
  try {
    const posts = await Blog.find({ status: "public" }).sort({
      createdAt: "desc",
    });

    var fullname = "aa";
    if (req.isAuthenticated()) {
      fullname = req.user.fullname;
    }

    res.render("index", {
      pageTitle: "وبلاگ",
      path: "/",
      posts,
      formatDate,
      islogin: req.isAuthenticated(),
      fullname: fullname,
      truncate,
    });
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
};
