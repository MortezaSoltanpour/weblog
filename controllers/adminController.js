const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid").v4;

const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");

const { get500 } = require("./errorController");
const { storage, fileFilter } = require("../utils/multer");

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
  const errorArr = [];

  try {
    await Blog.postValidation(req.body);
    await Blog.create({ ...req.body, user: req.user.id });
  } catch (err) {
    console.log(err);
    //get500(req, res);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("private/addPost", {
      pageTitle: "بخش مدیریت | ساخت پست جدید",
      path: "/dashboard/add-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      errors: errorArr,
    });
  }
  res.redirect("/dashboard");
};

exports.uploadImage = (req, res) => {
  const upload = multer({
    limits: { fileSize: 4000000 },
    // dest: "uploads/",
    // storage: storage,
    fileFilter: fileFilter,
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      res.send(err);
    } else {
      if (req.file) {
        console.log(req.file);

        const filename = `${uuid()}_${req.file.originalname}`;
        await sharp(req.file.buffer)
          .jpeg({
            quality: 60,
          })
          .toFile(`./public/uploads/${filename}`)
          .catch((err) => console.log(err));
        res.status(200).send("آپلود عکس موفقیت آمیز بود");
      } else {
        res.send("جهت آپلود باید عکسی انتخاب کنید");
      }
    }
  });
};
