import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

/**
 * 특정 포스트 조회
 * GET /api/posts/:id
 */
export const read = async (ctx) => {
  ctx.body = 'read!';
};

/**
 * 포스트 작성
 * POST /api/posts
 * {
 *    title: '제목',
 *    body:  '내용',
 * }
 */
export const write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string().required(), // required가 있으면 필수항목
    body: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  // REST API의 Reuqest Body는 ctx.request.body에서 조회 가능
  const { title, body } = ctx.request.body;
  const post = new Post({
    title,
    body,
  });
  try {
    // async/await 문법으로 데이터베이스 저장 요청을 완료할 때 까지 대기
    // await를 사용하는 방법 다시 정리
    // 1. await를 사용하려는 함수 앞에 async키워드를 넣어야함
    // 2. await 는 try~catch 문을 사용해야함
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
