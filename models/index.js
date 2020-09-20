const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
// {development: {}, test: {}, production: {}}['development']

const db = {};

// 밑의 코드로 시퀄라이즈가 node와 mysql을 연결 시켜준다.
// 좀 더 자세한 설명은 시퀄라이즈는 내부적으로 mysql2를 이용하기 때문에 지금 new Sequelize의 인자들을 mysql2로 보내주어서 연결한다.
// 이제 sequelize라는 변수에 연결정보가 담겨져있다.
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.Comment = require("./comment")(sequelize, Sequelize);
db.Hashtag = require("./hashtag")(sequelize, Sequelize);
db.Image = require("./image")(sequelize, Sequelize);
db.Post = require("./post")(sequelize, Sequelize);
db.User = require("./user")(sequelize, Sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
