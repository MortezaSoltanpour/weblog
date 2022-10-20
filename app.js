const path = require("path");

const debug = require("debug")("weblog-project");
const express = require("express");
const mongoose = require("mongoose");
const expressLayout = require("express-ejs-layouts");
const dotEnv = require("dotenv");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const passport = require("passport");

const connectDB = require("./config/db");
const winston = require("./config/winston");
const { stream } = require("./config/winston");
// Load Config
dotEnv.config({ path: "./config/config.env" });
connectDB();
debug("Connected to database");
// Passport configuration
require("./config/passport");

const app = express();

// Logging
if (process.env.NODE_ENV === "development") {
  debug("nodemon enabled");
  app.use(morgan("combined", { stream: winston.stream }));
}
// View engine
app.use(expressLayout);
app.set("layout", "./Layouts/mainLayout");
app.set("view engine", "ejs");
app.set("views", "views");

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    unset: "destroy",
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

app.use("/errors", require("./routes/errors"));

app.use(require("./controllers/errorController").get404);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  debug(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
