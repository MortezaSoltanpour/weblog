const { Router } = require("express");

const blogController = require("../controllers/blogController");

const router = new Router();

//  @desc   Weblog Index Page
//  @route  GET /
router.get("/", blogController.getIndex);

//  @desc   Weblog Post Page
//  @route  GET /post/:id
router.get("/post/:id/:title", blogController.getSinglePost);

module.exports = router;
