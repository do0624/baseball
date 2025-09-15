// src/pages/KboBoardDetail.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const KboBoardDetail = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams(); // 게시글 번호
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const commentsEndRef = useRef(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 게시글 + 댓글 불러오기
  const fetchBoardDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/board/${id}`);
      setBoard(res.data.board);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
      alert('게시글 로딩 실패');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBoardDetail().finally(() => setLoading(false));

    const interval = setInterval(fetchBoardDetail, 5000); // 5초마다 댓글 갱신
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!user) { alert('로그인 후 작성 가능합니다.'); return; }
    if (!newComment.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/comment`, {
        boardNo: id,
        writer: user.Id, // 문자/숫자 모두 가능
        text: newComment.trim(),
      }, { headers: { 'Content-Type': 'application/json' } });

      setNewComment('');
      fetchBoardDetail(); // 댓글 목록 갱신
    } catch (err) {
      console.error(err);
      alert('댓글 작성 실패');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId, commentWriter) => {
    if (!user || user.Id !== commentWriter) {
      alert('자신의 댓글만 삭제 가능합니다.');
      return;
    }
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/comment/${id}/${commentId}`);
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (err) {
      console.error(err);
      alert('댓글 삭제 실패');
    }
  };

  const startEditing = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
  };

  const saveEditComment = async () => {
    if (!editingCommentText.trim()) return;
    try {
      await axios.put(`http://localhost:8080/api/comment/${id}/${editingCommentId}`, {
        text: editingCommentText
      });
      setEditingCommentId(null);
      setEditingCommentText('');
      fetchBoardDetail();
    } catch (err) {
      console.error(err);
      alert('댓글 수정 실패');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div>로딩 중...</div>;
  if (!board) return <div>게시글이 존재하지 않습니다.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← 목록으로</button>
      <h2>{board.title}</h2>
      <p>{board.text}</p>

      {/* 댓글 작성 */}
      <div style={{ marginTop: '20px' }}>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="댓글 입력"
          rows={3}
          style={{ width: '100%' }}
        />
        <button onClick={handleCommentSubmit} disabled={!user} style={{ marginTop: '5px' }}>
          댓글 작성
        </button>
        {!user && <p>로그인 후 댓글 작성이 가능합니다.</p>}
      </div>

      {/* 댓글 목록 */}
      <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p>댓글이 없습니다.</p>
        ) : (
          comments.map(c => (
            <div key={c.commentId} style={{ borderBottom: '1px solid #ccc', padding: '5px 0' }}>
              {editingCommentId === c.commentId ? (
                <>
                  <textarea
                    value={editingCommentText}
                    onChange={e => setEditingCommentText(e.target.value)}
                    rows={2}
                    style={{ width: '100%' }}
                  />
                  <button onClick={saveEditComment}>저장</button>
                  <button onClick={() => setEditingCommentId(null)}>취소</button>
                </>
              ) : (
                <>
                  <p>{c.text}</p>
                  <small>
                    작성자: {c.writer} | {formatDate(c.date)}
                  </small>
                  {user && user.Id === c.writer && (
                    <>
                      <button onClick={() => startEditing(c.commentId, c.text)} style={{ marginLeft: '5px' }}>수정</button>
                      <button onClick={() => handleCommentDelete(c.commentId, c.writer)} style={{ marginLeft: '5px' }}>삭제</button>
                    </>
                  )}
                </>
              )}
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

export default KboBoardDetail;
