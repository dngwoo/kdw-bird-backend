const express = require("express");
const { Post, User, Image, Comment } = require("../models");

const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  // Get /posts
  try {
    const posts = await Post.findAll({
      limit: 10, // 10개만 가져온다.
      offset: 0, // 1 ~ 10번 포스트를 뜻한다.
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ], // 최신글부터 뽑기 위해
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
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
            as: "Likers",
            attributes: ['id']
        }
      ],
    }); // 모든 게시글 가져옴
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = postsRouter;
