require("dotenv").config();

var express = require("express");
var cors = require("cors");

var transactionsRouter = require("./routes/transactions");
var usersRouter = require("./routes/users");
//var adminRouter = require("./routes/admin");

const middlewares = require("./middlewares");

var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
  "/users",
  usersRouter,
  middlewares.errorHandler
);
app.use(
  "/transactions",
  transactionsRouter,
  middlewares.errorHandler
);

/*app.use(
  "/admin",
  middlewares.checkAdmin,
  adminRouter
);*/



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
