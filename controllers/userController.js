const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");

exports.login = (req, res) => {
  res.render("login", {
    pageTitle: "ورود به بخش مدیریت",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.handleLogin = (rqr, res, next) => {
  passport.authenticate("local", {
    // successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(rqr, res, next);
};

exports.rememberMe = (req, res) => {
  if (req.body.remember) {
    req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000;
  } else {
    req.session.cookie.expire = null;
  }

  res.redirect("/dashboard");
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "خروج موفقیت آمیز بود");
    res.redirect("/users/login");
  });
};

exports.register = (req, res) => {
  res.render("register", {
    pageTitle: "ثبت نام کاربر جدید",
    path: "/register",
  });
};

exports.createUser = async (req, res) => {
  const errors = [];
  try {
    await User.userValidation(req.body);
    const { fullname, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      errors.push({
        message: "ایمیل وارد شده تکراری می باشد",
      });
      return res.render("register", {
        pageTitle: "ثبت نام کاربر",
        path: "/register",
        errors,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({
      fullname,
      email,
      password: hash,
    });

    //await User.create(req.body);

    req.flash("success_msg", "ثبت نام با موفقیت انجام شد");

    res.redirect("/users/login");
  } catch (err) {
    if (err.inner) {
      err.inner.forEach((e) => {
        errors.push({
          name: e.path,
          message: e.message,
        });
      });
    } else {
      console.log(err);
      errors.push({
        message: "خطایی رخ داده است",
      });
    }

    return res.render("register", {
      pageTitle: "ثبت نام کاربر",
      path: "/register",
      errors,
    });
  }
};
