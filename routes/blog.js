const { Router } = require("express");
const { authenticate } = require("../middlewares/auth");

const router = new Router();

//  @desc   Weblog Index Page
//  @route  GET /
router.get("/", (req, res) => {
  var fullname = "aa";
  if (req.isAuthenticated()) {
    fullname = req.user.fullname;
  }

  res.render("index", {
    pageTitle: "وبلاگ",
    path: "/",
    islogin: req.isAuthenticated(),
    fullname: fullname,
  });
});

module.exports = router;
