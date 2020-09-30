const local = require("./local");
const passport = require("passport");
const { User } = require("../models");

module.exports = () => {
  // user <- routes/user.js에서 req.login(user, ...) 여기서 첫번째 인자인 user가 오게 된다.
  passport.serializeUser((user, done) => {
    done(null, user.id); // 세션에서 유저 데이터를 다 들고 있기엔 부담 되므로 user.id만 저장
  });

  passport.deserializeUser(async (id, done) => {
    // 1. 로그인 성공하고 나서의 요청부터 계속 실행된다.
    // 2. 로그인 성공하고 나서 그 다음 요청부터 connect.sid라는 쿠키와 함께 보낸다.
    // 3. 그리고 위의 user.id가 첫번째 인자인 id로 오게 된다.
    try {
      const user = await User.findOne({ where: { id } }); // 사용자 정보 복구
      done(null, user); // req.user에 넣어준다.
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};
