const express = require("express");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const { sequelize } = require("./models");
const app = express();

//middelwares

// req.body를 쓰기위한 2가지 미들웨어
// ex) 프론트에서 signup의 action.data를 받아서 해석을 한 뒤 req.body에 실어준다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelize
  .sync()
  .then(() => {
    console.log("Successfully connect db!");
  })
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("hello express");
});

// prefix 처럼 post가 자동으로 붙는다.
app.use("/post", postRouter);
app.use("/user", userRouter);

app.listen(3065, () => {
  console.log("서버열림");
});
