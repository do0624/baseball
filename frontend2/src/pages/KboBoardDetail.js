import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/NoticeboardPage.css';

const KboBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // 게시글 불러오기
  const fetchPost = async () => {
    setLoadingPost(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/post/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error(err);
      alert('게시글 로딩 실패');
    } finally {
      setLoadingPost(false);
    }
  };

  // 댓글 불러오기
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
      alert('댓글 로딩 실패');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post('http://localhost:8080/api/comments', {
        postId: parseInt(id),
        content: newComment,
        userId: null // 로그인 연동 시 사용자 ID
      });
      setNewComment('');
      fetchComments();
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    } catch (err) {
      console.error(err);
      alert('댓글 작성 실패');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
      alert('댓글 삭제 실패');
    }
  };

  if (loadingPost || !post) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>;
  }

  return (
    <div className="noticeboard-container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>← 목록으로</button>

      <h2>{post.title}</h2>
      <div className="noticeboard-meta">
        <span>작성자: {post.writer}</span>
        <span>카테고리: {post.category}</span>
        <span>작성일: {post.createdAt}</span>
      </div>
      <div style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }}>{post.content}</div>

      <div style={{ marginTop: '40px' }}>
        <h3>댓글</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
          rows={3}
          style={{ width: '100%', padding: '10px' }}
        />
        <button onClick={handleCommentSubmit} style={{ marginTop: '5px' }}>댓글 작성</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {loadingComments ? (
          <div style={{ textAlign: 'center', color: '#666' }}>댓글 로딩 중...</div>
        ) : comments.length === 0 ? (
          <div style={{ color: '#666' }}>댓글이 없습니다.</div>
        ) : (
          comments.map(c => (
            <div key={c.commentId} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.content}</span>
                <button
                  onClick={() => handleCommentDelete(c.commentId)}
                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >삭제</button>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>작성일: {c.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KboBoardDetail;
