const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid").v4;

const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");

const { get500 } = require("./errorController");
const { storage, fileFilter } = require("../utils/multer");

exports.getDashboard = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 2;

  try {
    const numberOfPosts = await Blog.find({
      user: req.user._id,
    }).countDocuments();

    const blogs = await Blog.find({ user: req.user.id })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashlayout",
      fullname: req.user.fullname,
      blogs,
      formatDate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPosts,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPosts / postPerPage),
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

exports.getEditPost = async (req, res) => {
  const post = await Blog.findOne({
    _id: req.params.id,
  });

  if (!post) {
    return res.redirect("errors/404");
  }

  if (post.user.toString() != req.user._id) {
    return res.redirect("/dashboard");
  } else {
    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      post,
    });
  }
};

exports.editPost = async (req, res) => {
  const errorArr = [];

  const post = await Blog.findOne({ _id: req.params.id });
  try {
    await Blog.postValidation(req.body);

    if (!post) {
      return res.redirect("errors/404");
    }
    if (post.user.toString() != req.user._id) {
      return res.redirect("/dashboard");
    } else {
      const { title, status, body } = req.body;
      post.title = title;
      post.status = status;
      post.body = body;

      await post.save();

      return res.redirect("/dashboard");
    }
  } catch (err) {
    console.log(err);
    //get500(req, res);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      errors: errorArr,
      post,
    });
  }
  res.redirect("/dashboard");
};

exports.deletePost = async (req, res) => {
  try {
    const result = await Blog.findByIdAndRemove(req.params.id);
    console.log(result);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
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
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد");
      }
      res.send(err);
    } else {
      if (req.file) {
        const filename = `${uuid()}_${req.file.originalname}`;
        await sharp(req.file.buffer)
          .jpeg({
            quality: 60,
          })
          .toFile(`./public/uploads/${filename}`)
          .catch((err) => console.log(err));
        res.status(200).send(`http://localhost:3000/uploads/${filename}`);
      } else {
        res.send("جهت آپلود باید عکسی انتخاب کنید");
      }
    }
  });
};
