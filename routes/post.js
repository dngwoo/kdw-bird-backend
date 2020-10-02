const express = require("express");
const postRouter = express.Router();
const { Post, Comment, Image, User } = require("../models");

const { isLoggedIn } = require("./middlewares"); // 로그인 했는지 확인하기 위해 사용

postRouter.post("/", isLoggedIn, async (req, res, next) => {
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
              model: User, // 댓글 작성자
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User, // 게시글 작성자
          attributes: ["id", "nickname"],
        },
        {
          model: User, // 좋아요 누른 사람
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

postRouter.delete("/:postId", isLoggedIn, async (req, res, next) => {
  // Delete /post/10
  try {
    await Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id, // 내가 쓴 게시글인지 확인. 남의 것을 못지우게 만듬
      },
    });

    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// :postId 처럼 주소에서 가변적으로 바뀌는 부분을 parameter 라고 부른다.
postRouter.post("/:postId/comment", isLoggedIn, async (req, res, next) => {
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

postRouter.patch("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send("게시글이 존재하지 않습니다.");
    }
    await post.addLikers(req.user.id); // post.addLikers는 테이블 관계에 의해 만들어진다.
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
postRouter.delete("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send("게시글이 존재하지 않습니다.");
    }
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = postRouter;
