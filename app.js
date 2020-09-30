const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const express = require("express");
const passport = require("passport");
const passportConfig = require("./passport");
const postRouter = require("./routes/post");
const session = require("express-session");
const { sequelize } = require("./models");
const userRouter = require("./routes/user");

dotenv.config();

const app = express();

const PORT = 3065;

// db 연결
sequelize
  .sync()
  .then(() => {
    console.log("Successfully connect db!");
  })
  .catch((err) => console.error(err));

passportConfig();

//middelwares

// cors 관련 미들웨어
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
// req.body를 쓰기위한 2가지 미들웨어
// ex) 프론트에서 signup의 action.data를 받아서 해석을 한 뒤 req.body에 실어준다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// passport 관련 미들웨어
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session());
app.use(passport.initialize(process.env.COOKIE_SECRET));
app.use(
  passport.session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
  })
);

app.get("/", (req, res) => {
  res.send("hello express");
});

// prefix 처럼 post가 자동으로 붙는다.
app.use("/user", userRouter);
app.use("/post", postRouter);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 열림`);
});
