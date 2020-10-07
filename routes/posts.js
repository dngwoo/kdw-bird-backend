const express = require("express");
const { Post, User, Image, Comment } = require("../models");
const { Op } = require("sequelize"); // operator을 의미, OP를 이용하는 이유는 SQL injection 위험이 있어서이다.

const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  // Get /posts
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐때, 스크롤을 내려서 더 불러올 때
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    } // lastId 보다 작은애들을 가져와라 라는 뜻
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
          attributes: ["id"],
        },
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
      ],
    }); // 모든 게시글 가져옴
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = postsRouter;
