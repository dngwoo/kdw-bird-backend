// 파일 이름은 단수로!
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      // MySQL에는 Comments 테이블 생성, 소문자 + 복수형으로 바뀜
      // id는 굳이 안만들어주어도 알아서 생성해서 넣어준다.
      content: {
        type: DataTypes.TEXT, // 글자 무제한
        allowNull: false, // 필수
      },
      // belongsTo를 이용하면 소유자(UserId), 소유게시글(PostId)를 자동으로 넣어준다.
      // UserId: 1,
      // PostId: 3
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci", // 한글 저장
    }
  );
  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User); // 코멘트는 어떤 작성자에게 속해있다.
    db.Comment.belongsTo(db.Post); // 코멘트는 어떤 포스트에게 속해있다.
  };
  return Comment;
};
