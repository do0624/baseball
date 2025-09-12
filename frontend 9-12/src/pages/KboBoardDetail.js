import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const KboBoardDetail = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const commentsEndRef = useRef(null);

  // 댓글 스크롤 최하단 이동
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 게시글 + 댓글 불러오기
  const fetchBoardDetail = async () => {
    try {
      const res = await axios.get(`/api/board/${id}`);
      setBoard(res.data.board);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
      alert("게시글 로딩 실패");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBoardDetail().finally(() => setLoading(false));

    // 5초 폴링으로 실시간 댓글 반영
    const interval = setInterval(fetchBoardDetail, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!user) {
      alert("로그인 후 작성 가능합니다.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`/api/comment`, {
        boardNo: parseInt(id, 10),
        writer: parseInt(user.Id, 10),
        text: newComment.trim(),
      });

      if (!res.data.commentId) {
        alert("댓글 생성 실패: commentId가 없습니다. (백엔드 확인 필요)");
        return;
      }

      setComments(prev => [...prev, res.data]);
      setNewComment("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId, commentWriter) => {
    if (!commentId) {
      alert("삭제할 댓글 ID가 없습니다.");
      return;
    }
    if (!user || parseInt(user.Id, 10) !== parseInt(commentWriter, 10)) {
      alert("자신의 댓글만 삭제 가능합니다.");
      return;
    }
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/comment/${commentId}`, {
        data: { boardNo: parseInt(id, 10) },
      });
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 실패");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!board) return <div>게시글이 존재하지 않습니다.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>← 목록으로</button>
      <h2>{board.title}</h2>
      <p>{board.text}</p>

      <div style={{ marginTop: "20px" }}>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="댓글 입력"
          rows={3}
          style={{ width: "100%" }}
        />
        <button onClick={handleCommentSubmit} disabled={!user} style={{ marginTop: "5px" }}>
          댓글 작성
        </button>
        {!user && <p>로그인 후 댓글 작성이 가능합니다.</p>}
      </div>

      <div style={{ marginTop: "20px", maxHeight: "400px", overflowY: "auto" }}>
        {comments.length === 0 ? (
          <p>댓글이 없습니다.</p>
        ) : (
          comments.map(c => (
            <div
              key={c.commentId || Math.random()}
              style={{ borderBottom: "1px solid #ccc", padding: "5px 0" }}
            >
              <p>{c.text}</p>
              <small>
                작성자: {c.writer} |{" "}
                {c.date ? new Date(c.date).toLocaleString() : "작성 시간 없음"}
              </small>
              {user && parseInt(user.Id, 10) === parseInt(c.writer, 10) && (
                <button
                  onClick={() => handleCommentDelete(c.commentId, c.writer)}
                  style={{ marginLeft: "10px" }}
                >
                  삭제
                </button>
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
