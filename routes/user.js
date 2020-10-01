const express = require("express");
const { User, Post } = require("../models"); // db.User을 구조분해할당으로 받음
const bcrypt = require("bcrypt");
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const userRouter = express.Router();

userRouter.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    // (err, user, info) <- 서버에러, 유저값, 클라이언트 에러

    // local에서 에러 처리
    // 서버에러
    if (error) {
      console.error(error);
      next(error); // 에러처리를 익스프레스로 넘김
    }

    // 클라에러
    if (info) {
      return res.status(401).send(info.reason); // 이 reason이 프론트에서 받아서 화면에 뽑아주어야 한다.
    }

    // passport에서 에러 처리
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        // attributes: [id, nickname, email],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: "Followings", // as를 models에서 써줬다면 여기서도 그대로 써줘야 함.
          },
          {
            model: User,
            as: "Followers", // as를 models에서 써줬다면 여기서도 그대로 써줘야 함.
          },
        ],
      });
      // res.setHeader("Cookie", "cxlhy");를 자동으로 실행시킨다. 두번째인자는 내 데이터를 기반으로 만들어진 쿠키값이다.
      return res.status(200).json(fullUserWithoutPassword); // 프론트로 json 데이터 + 쿠키값 전송
    });
  })(req, res, next);
});

userRouter.post("/", isNotLoggedIn, async (req, res, next) => {
  try {
    // POST /user/
    const exUser = await User.findOne({
      // where = 조건
      where: {
        email: req.body.email,
      },
    });

    if (exUser) {
      // res.상태코드.data 이렇게 보낸다. header도 보낼 수 있음.
      // header는 바디에 대한 정보를 의미한다. 누가 보냈는지 등. 상태도 헤더 중 하나임.
      // 요청 응답은 헤더(상태, 용량, 시간, 쿠키)와 바디(데이터)로 구성되어있음.
      res.status(403).send("이미 사용 중인 아이디입니다.");

      // 응답은 무조건 한번만 보내야 되기 때문에 여기서 return 해준다.
      // http 프로토콜 통신방식은 요청1번에 응답1번임.
      // can't set headers already send 라는 오류가 뜬다.
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12); // 10~13 정도 넣는다. 보안 수준을 의미한다.
    // 데이터베이스에 데이터 넣기
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });

    // 200 성공 <- 여러가지가 있지만 201은 잘 생성됨이라는 뜻임.
    // 300 리다이렉트
    // 400 클라이언트 에러 <- 보내는 쪽(브라우저) 잘못
    // 500 서버 에러 <- 서버 쪽 문제
    res.status(201).send("ok");
  } catch (error) {
    console.error(error);

    // 에러가 나면 익스프레스가 알아서 브라우저로 에러를 보내줄때 사용
    // 에러 처리 미들웨어로 보내게 된다.
    next(error); // status - 500 (서버쪽 에러임.)
  }
});

userRouter.post("/logout", isLoggedIn, (req, res, next) => {
  // 쿠키 지우고 세션지우면 끝임.
  req.logout();
  req.session.destroy();
  res.send("ok");
});

module.exports = userRouter;
