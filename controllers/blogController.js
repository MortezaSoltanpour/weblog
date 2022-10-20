const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate, correctUrl } = require("../utils/helpers");
const { get500 } = require("./errorController");

exports.getIndex = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = process.env.PAGE_CONTENT;

  try {
    const numberOfPosts = await Blog.countDocuments({ status: "public" });

    const posts = await Blog.find({ status: "public" })
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("index", {
      pageTitle: "وبلاگ",
      path: "/",
      posts,
      formatDate,
      islogin: req.isAuthenticated(),
      fullname: req.isAuthenticated() ? req.user.fullname : "",
      truncate,
      correctUrl,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPosts,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPosts / postPerPage),
    });
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await Blog.findOne({ _id: req.params.id }).populate("user");

    if (!post) return res.redirect("/errors/404");

    res.render("post", {
      pageTitle: post.title,
      path: "/post",
      post,
      formatDate,
      islogin: req.isAuthenticated(),
      fullname: req.isAuthenticated() ? req.user.fullname : "",
    });
  } catch (err) {
    console.log(err);
    // get500(req, res);
    res.redirect("/errors/500");
  }
};
