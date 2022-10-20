const { Router } = require("express");

const errorController = require("../controllers/errorController");

const router = new Router();

//  @desc   Error 404 Page
//  @route  GET 404
router.get("/404", errorController.get404);

//  @desc   Error 500 Page
//  @route  GET 500
router.get("/500", errorController.get500);

module.exports = router;
