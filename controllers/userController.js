const passport = require("passport");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

exports.login = (req, res) => {
  res.render("login", {
    pageTitle: "ورود به بخش مدیریت",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.handleLogin = async (req, res, next) => {
  if (!req.body["g-recaptcha-response"]) {
    req.flash("error", "لطفاً تیک من ربات نیستم را بزنید");
    return res.redirect("/users/login");
  }
  const secretKey = process.env.CAPTCHA_SECRET;
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}
  &remoteip=${req.connection.remoteAddress}`;

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  const json = await response.json();
  if (json.success) {
    passport.authenticate("local", {
      // successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  } else {
    req.flash("error", "مشکلی در اعتبار سنجی پیش آمده");
    return res.redirect("/users/login");
  }
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
  });
  req.session = null;
  //req.flash("success_msg", "خروج موفقیت آمیز بود");
  res.redirect("/users/login");
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
