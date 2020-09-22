const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // db에서 데이터 들고오기
          const exUser = await User.findOne({
            where: { email },
          });

          // email 체크
          if (!exUser) {
            return done(null, false, { reason: "email이 존재하지 않습니다." });
          }

          // 비번 체크
          const result = await bcrypt.compare(password, exUser.password);
          if (result) {
            return done(null, user);
          }
          return done(null, false, { reason: "password가 맞지 않습니다." });
        } catch (error) {
          // 에러 체크
          console.error(error);
          done(error);
        }
      }
    )
  );
};
