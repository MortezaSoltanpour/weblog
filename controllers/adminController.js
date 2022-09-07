const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");

const { get500 } = require("./errorController");

exports.getDashboard = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user.id });
    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashlayout",
      fullname: req.user.fullname,
      blogs,
      formatDate,
    });
  } catch (error) {
    console.log(error);
    get500(req, res);
  }
};

exports.getAddPost = (req, res) => {
  res.render("private/addPost", {
    pageTitle: "بخش مدیریت | ساخت پست جدید",
    path: "/dashboard/add-post",
    layout: "./layouts/dashLayout",
    fullname: req.user.fullname,
  });
};

exports.createPost = async (req, res) => {
  try {
    await Blog.create({ ...req.body, user: req.user.id });
  } catch (error) {
    console.log(error);
    get500(req, res);
  }
  res.redirect("/dashboard");
};
