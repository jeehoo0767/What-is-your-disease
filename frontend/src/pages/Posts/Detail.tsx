import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import {
  PostsDetailContainer,
  CommentsSection,
  CreateComment,
  Buttons,
} from 'styles/PostsDetail.styles'
import Search from 'components/Search'
import Button from 'components/Button'
import API from 'service/api'
import { useRecoilState } from 'recoil'
import { currentUserInfo } from 'store/userInfo'
import { PostModel } from 'model/postsModel'
import reply from '../../assets/img/reply.svg'
import { setConstantValue } from 'typescript'

interface IPostsDetailProps {}

export default function PostsDetail(props: RouteComponentProps) {
  const history = useHistory()
  const [userInfo] = useRecoilState(currentUserInfo)
  const [post, setPost] = useState<PostModel>({} as PostModel)
  const [comment_value, setCommentValue] = useState('')
  const [reply_value, setReplyValue] = useState('')
  const [comments_list, setCommentsList] = useState([])
  const [comments_cnt, setCommentsCnt] = useState(0)
  const [is_write_comment, setIsWriteComment] = useState(false)
  const [is_reply, setIsReply] = useState({} as any)

  const getPost = async () => {
    const urlParam = props.match.params as { postId: string }
    const postId = urlParam.postId

    await API.post
      .getPost(postId)
      .then((res) => {
        setCommentsList(res.data.data.comments)
        setPost(res.data.data.post)
        setCommentValue('')
        setIsWriteComment(false)
        setReplyValue('')
        let nextReplyState = res.data.data.comments.map((item: any) => {
          return {
            [item._id]: false,
          }
        })

        let nextReplyStateObj = {}

        for (let i = 0; i < nextReplyState.length; i++) {
          const key = Object.keys(nextReplyState[i])[0]
          nextReplyStateObj = {
            ...nextReplyStateObj,
            [key]: false,
          }
        }

        setIsReply(nextReplyStateObj)
      })

      .catch((e) => {
        console.log(e)
      })
  }

  const onClickEdit = (postData: PostModel) => {
    history.push('/posts/edit', postData)
  }

  const onClickDelete = async () => {
    if (
      !window.confirm(
        '삭제된 게시글은 되돌릴 수 없습니다. 정말로 삭제 하시겠습니까?',
      )
    ) {
      return
    }
    await API.post
      .deletePost(post._id)
      .then((res) => {
        alert('게시물 삭제에 성공했습니다.')
        history.push('/')
      })
      .catch((e) => {
        console.log(e.response)
      })
  }

  const onClickListsLink = () => {
    const stateFromPush = history.location.state as {
      is_create_state?: boolean
    }
    if (stateFromPush?.is_create_state) {
      history.push('/')
    } else {
      history.goBack()
    }
  }

  const onClickHashtag = (target_hashtag: string) => {
    history.push(`/posts/lists/search/hashtag/${target_hashtag}`)
  }

  const handleSubmitComment = async () => {
    if (comment_value === '') {
      return alert('댓글을 입력해주세요')
    }
    const urlParam = props.match.params as { postId: string }
    const postId = urlParam.postId
    await API.post
      .createComment(postId, comment_value)
      .then((res) => {
        getPost()
      })
      .catch((e) => {
        console.log(e)
      })
  }

  const handleSubmitReply = async (comment_id: string, contents: string) => {
    if (reply_value === '') {
      return alert('답글을 입력해주세요')
    }

    await API.post
      .createReply(comment_id, contents)
      .then((res) => {
        getPost()
      })
      .catch((e) => {
        console.log(e)
      })
  }

  useEffect(() => {
    getPost()
    window.scrollTo({ top: 0 })
  }, [])

  const Comments = [
    { txt: '오 꿀팀 감사합니다.' },
    { txt: '좋은 하루 되세요~' },
    { txt: '감사합니다:)' },
  ]

  return (
    <PostsDetailContainer className="wrap">
      <Search />
      <section className="postTitle">{post.title}</section>
      <section className="postInfo">
        <div>작성자: {post?.user?.info.nickname}</div>
        <div>카테고리: {post?.category}</div>
        <div className="hashtag">
          해쉬태그:{' '}
          {post?.tags?.map((item, index) => {
            if (index === post.tags.length - 1) {
              return <span onClick={() => onClickHashtag(item)}>#{item}</span>
            } else {
              return <span onClick={() => onClickHashtag(item)}>#{item}, </span>
            }
          })}
        </div>
        <div>조회수: {post?.views}</div>
      </section>
      <hr />
      <div className="createdAt">
        작성일: {post?.publishedDate?.split('T')[0]}
      </div>
      <section
        className="postContents"
        dangerouslySetInnerHTML={{ __html: post?.body }}
      ></section>
      <Button
        type="button"
        className="commentsBtn"
        onClick={() => setIsWriteComment(!is_write_comment)}
      >
        {is_write_comment ? '취소' : '+ 댓글 작성하기'}
      </Button>
      {is_write_comment && (
        <CreateComment>
          <textarea
            value={comment_value}
            onChange={(e) => setCommentValue(e.target.value)}
          ></textarea>
          <Button
            id="submitComment"
            type="button"
            onClick={handleSubmitComment}
          >
            등록
          </Button>
        </CreateComment>
      )}
      <CommentsSection className="wrap">
        {comments_list.map((comment: any, idx) => {
          return (
            <div className="comment" key={idx}>
              <span>{comment.user.info.nickname}</span>
              {comment.text}
              <Button
                type="button"
                className="replyBtn"
                onClick={() =>
                  setIsReply({
                    ...is_reply,
                    [comment._id]: !is_reply[comment._id],
                  })
                }
              >
                <img src={reply} alt="답글 아이콘" />
              </Button>
              {is_reply[comment._id] && (
                <CreateComment>
                  <textarea
                    value={reply_value}
                    onChange={(e) => setReplyValue(e.target.value)}
                  ></textarea>
                  <Button
                    id="submitComment"
                    type="button"
                    onClick={() => handleSubmitReply(comment._id, reply_value)}
                  >
                    등록
                  </Button>
                </CreateComment>
              )}
              {comment.replies?.length !== 0 && (
                <div className="replyWrap">
                  {comment.replies?.map((reply: any, index: number) => {
                    return (
                      <div className="reply">
                        <span>{reply?.user?.info?.nickname}</span>
                        {reply?.text}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </CommentsSection>
      <Buttons className="buttonRow">
        {post.user?._id === userInfo?._id && (
          <>
            <Button
              type="button"
              className="editBtn"
              onClick={() => onClickEdit(post)}
            >
              수정
            </Button>
            <Button type="button" className="delBtn" onClick={onClickDelete}>
              삭제
            </Button>
          </>
        )}
        <Button type="button" onClick={() => onClickListsLink()}>
          목록
        </Button>
      </Buttons>
    </PostsDetailContainer>
  )
}
