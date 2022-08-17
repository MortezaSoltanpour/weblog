const { Router } = require("express");

const router = new Router();

//  @desc   Login Page
//  @route  GET /users/login
router.get("/login", (req, res) => {
  res.render("login", { pageTitle: "ورود به بخش مدیریت", path: "/login" });
});

//  @desc   Register Page
//  @route  GET /users/Register
router.get("/register", (req, res) => {
  res.render("register", { pageTitle: "ثبت نام", path: "/register" });
});

router.post("/register", (req, res) => {
  console.log(req.body);
  res.send("got it");
});

module.exports = router;
