const bcrypt = require("bcryptjs");

const User = require("../models/User");

exports.login = (req, res) => {
  res.render("login", { pageTitle: "ورود به بخش مدیریت", path: "/login" });
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
