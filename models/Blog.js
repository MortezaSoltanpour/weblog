const mongoose = require("mongoose");

const { schema } = require("./secure/postvalidation");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    maxLength: 100,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "عمومی",
    enum: ["عمومی", "خصوصی"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.statics.postValidation = function (body) {
  return schema.validate(body, { abortEarly: false });
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
