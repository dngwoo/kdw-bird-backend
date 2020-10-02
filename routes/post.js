const express = require("express");
const router = express.Router();
const { Post, Comment, Image, User } = require("../models");

const { isLoggedIn } = require("./middlewares"); // 로그인 했는지 확인하기 위해 사용

router.post("/", isLoggedIn, async (req, res, next) => {
  // POST /post
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id, // passport/index.js에서 deserialize에서 만들어짐.
    });

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// :postId 처럼 주소에서 가변적으로 바뀌는 부분을 parameter 라고 부른다.
router.post("/:postId/comment", isLoggedIn, async (req, res, next) => {
  // POST /post/1/comment
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });

    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다."); // forbidden status = 403
    }

    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId), // :postId로 접근 가능
      UserId: req.user.id, // passport/index.js에서 deserialize에서 만들어짐.
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
