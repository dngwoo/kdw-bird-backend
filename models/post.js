// 파일 이름은 단수로!
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      // MySQL에는 users 테이블 생성, 소문자 + 복수형으로 바뀜
      // id는 굳이 안만들어주어도 알아서 생성해서 넣어준다.
      content: {
        type: DataTypes.TEXT, // 글자 무제한
        allowNull: false, // 필수
      },
      // PostId -> RetweetId
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci", // 한글 저장, mb4는 이모티콘을 의미
    }
  );
  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // 게시글은 어떤 작성자에게 속해있다.
    db.Post.hasMany(db.Comment); // 포스트는 여러개의 코멘트를 가질 수 있다.
    db.Post.hasMany(db.Image); // 포스트는 여러개의 이미지를 가질 수 있다.
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
    db.Post.belongsToMany(db.User, { through: "Like" }); // 좋아요는 여러 사용자를 가질 수 있다.
    db.Post.belongsTo(db.Post, { as: "Retweet" });
  };
  return Post;
};
