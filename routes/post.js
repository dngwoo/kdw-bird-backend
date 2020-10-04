const express = require("express");
const postRouter = express.Router();
const path = require("path");
const { Post, Comment, Image, User } = require("../models");
const multer = require("multer"); // form마다 데이터 전송이 다르기 때문에 router마다 적용시켜준다.
const fs = require("fs");

try {
  fs.accessSync("uploads"); // uploads 파일이 있는지 체크
} catch (error) {
  // uploads 파일이 없다면
  console.log("uploads 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

const { isLoggedIn } = require("./middlewares"); // 로그인 했는지 확인하기 위해 사용

const upload = multer({
  // 나중에는 s3에 저장할 것이다.
  // 이유는 서버는 나중에 스케일링이라는 것을 하게 된다.
  // 그래서 서버가 여러대가 되면 이미지도 여러개가 되어버린다.
  storage: multer.diskStorage({
    // 컴퓨터의 하드디스크에 저장
    destination(req, file, done) {
      done(null, "uploads"); // uploads라는 폴더에 저장하겠다라는 뜻
    },
    filename(req, file, done) {
      // 제로초.png
      // 파일이름이 겹치지 않게 해줘야 된다.
      const ext = path.extname(file.originalname); // 확장자 추출(png)
      const basename = path.basename(file.originalname, ext); // 제로초
      done(null, basename + "_" + new Date().getTime() + ext); // 제로초15184712891.png
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB <- 해주는 이유는 파일이 너무 크면 서버공격이 되기 때문
});

postRouter.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  // POST /post
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id, // passport/index.js에서 deserialize에서 만들어짐.
    });

    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        // 이미지를 여러 개 올리면 image: [제로초.png, 부기초.png]
        const images = await Promise.all(
          req.body.image.map((image) => Image.create({ src: image }))
        );
        await post.addImages(images);
      } else {
        // 이미지를 하나만 올리면 image: 제로초.png
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
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

// 여러장 - upload.array('image')
// 한장 - upload.single('image')
// 텍스트만 - upload.none()
postRouter.post("/images", upload.array("image"), isLoggedIn, (req, res) => {
  // Post /post/images
  console.log(req.files); // 여기에 저장된다. 업로드 어떻게 되었는지 확인 가능
  res.json(req.files.map((v) => v.filename)); // map을 이용하여 파일이름만 가진 새로운 배열 생성
});

module.exports = postRouter;
