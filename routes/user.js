const express = require("express");
const { User } = require("../mdoels"); // db.User을 구조분해할당으로 받음
const bcrypt = require("bcrypt");
const userRouter = express.Router();

userRouter.post("/", async (req, res, next) => {
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

module.exports = router;
