const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const expressLayout = require("express-ejs-layouts");
const dotEnv = require("dotenv");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const passport = require("passport");

const connectDB = require("./config/db");

// Load Config
dotEnv.config({ path: "./config/config.env" });
connectDB();

// Passport configuration
require("./config/passport");

const app = express();

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// View engine
app.use(expressLayout);
app.set("layout", "./Layouts/mainLayout");
app.set("view engine", "ejs");
app.set("views", "views");

// Body Parser
app.use(express.urlencoded({ extended: false }));

// session
app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/blog"));
app.use("/users", require("./routes/users"));
app.use("/dashboard", require("./routes/dashboard"));

app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Page not found", path: "/404" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
