const Yup = require("yup");
const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate, correctUrl } = require("../utils/helpers");
const { get500 } = require("./errorController");
const { sendEmail } = require("../utils/mailer");
const captchapng = require("captchapng");

let CAPTCHA_NUM;

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
      search: "",
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
      search: "",
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

exports.getContactus = (req, res) => {
  res.render("contact", {
    search: "",
    pageTitle: "تماس با ما",
    path: "/dashboard/contactus",
    layout: "./layouts/mainlayout",
    islogin: req.isAuthenticated(),
    fullname: req.isAuthenticated() ? req.user.fullname : "",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    errors: [],
  });
};

exports.handleContactPage = async (req, res) => {
  const errorArr = [];

  const { fullname, email, message, captcha } = req.body;

  const schema = Yup.object().shape({
    fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
    email: Yup.string()
      .email("آدرس ایمیل صحیح نیست")
      .required("آدرس ایمیل الزامی می باشد"),
    message: Yup.string().required("پیام اصلی الزامی می باشد"),
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    if (parseInt(captcha) === CAPTCHA_NUM) {
      sendEmail(
        email,
        fullname,
        "پیام از طرف وبلاگ",
        `${message} <br/> ایمیل کاربر : ${email}`
      );

      req.flash("success_msg", "پیام شما با موفقیت ارسال شد");

      return res.render("contact", {
        search: "",
        pageTitle: "تماس با ما",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: errorArr,
        islogin: req.isAuthenticated(),
        fullname: req.isAuthenticated() ? req.user.fullname : "",
      });
    }

    req.flash("error", "کد امنیتی صحیح نیست");

    res.render("contact", {
      search: "",
      pageTitle: "تماس با ما",
      path: "/contactus",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      errors: errorArr,
      islogin: req.isAuthenticated(),
      fullname: req.isAuthenticated() ? req.user.fullname : "",
    });
  } catch (err) {
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("contact", {
      search: "",
      pageTitle: "تماس با ما",
      path: "/contactus",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      errors: errorArr,
      islogin: req.isAuthenticated(),
      fullname: req.isAuthenticated() ? req.user.fullname : "",
    });
  }
};

exports.getCaptcha = (req, res) => {
  CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
  const p = new captchapng(80, 30, CAPTCHA_NUM);
  p.color(0, 0, 0, 0);
  p.color(80, 80, 80, 255);

  const img = p.getBase64();
  const imgBase64 = Buffer.from(img, "base64");

  res.send(imgBase64);
};

exports.handleSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 5;

  try {
    const keyword = req.body.search.trim();
    const numberOfPosts = await Blog.find({
      status: "public",
      //$text: { $search: keyword },
      title: { $regex: ".*" + keyword + ".*" },
    }).countDocuments();

    const posts = await Blog.find({
      status: "public",
      //$text: { $search: keyword },
      title: { $regex: ".*" + keyword + ".*" },
    })
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("index", {
      search: keyword,
      pageTitle: "نتایج جستجوی شما",
      path: "/",
      posts,
      correctUrl,
      numberOfPosts,
      formatDate,
      islogin: req.isAuthenticated(),
      fullname: req.isAuthenticated() ? req.user.fullname : "",
      truncate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPosts,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPosts / postPerPage),
    });
    //? Smooth Scrolling
  } catch (err) {
    console.log(err);
    res.render("errors/500", {
      pageTitle: "خطای سرور | 500",
      path: "/404",
    });
  }
};
