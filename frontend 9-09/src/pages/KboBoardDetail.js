import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/NoticeboardPage.css";

const categoryTextMap = {
  1: "자유",
  2: "KBO",
  3: "NPB",
  4: "MLB",
  5: "사회인야구",
};

const KboBoardDetail = () => {
  const { id } = useParams(); // 게시글 번호
  const navigate = useNavigate();
  const userId = localStorage.getItem("Id"); // 로그인된 사용자 ID

  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 게시글 + 댓글 불러오기
  const fetchBoardDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/board/${id}`);
      const data = res.data;

      if (data.board) {
        setBoard(data.board);
        setComments(data.comments || []);
      } else {
        alert("게시글을 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("게시글 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
  }, [id]);

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axios.post("http://localhost:8080/api/comment", {
        boardNo: parseInt(id, 10),
        writer: parseInt(userId, 10),
        text: newComment.trim(),
      });

      // 새 댓글 바로 리스트에 추가
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId, commentWriter) => {
    if (parseInt(userId, 10) !== commentWriter) {
      alert("자신의 댓글만 삭제할 수 있습니다.");
      return;
    }

    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/comment/${commentId}`, {
        data: { boardNo: parseInt(id, 10) },
      });

      // 삭제 후 리스트에서 제거
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 실패");
    }
  };

  if (loading || !board) {
    return <div style={{ textAlign: "center", padding: "20px" }}>로딩 중...</div>;
  }

  return (
    <div className="noticeboard-container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "10px" }}>
        ← 목록으로
      </button>

      <h2>{board.title}</h2>
      <div className="noticeboard-meta">
        <span>작성자: {board.writer}</span>
        <span>카테고리: {categoryTextMap[board.category] || board.category}</span>
        <span>작성일: {board.createdAt}</span>
      </div>

      <div style={{ margin: "20px 0", whiteSpace: "pre-wrap" }}>{board.text}</div>

      <div style={{ marginTop: "40px" }}>
        <h3>댓글</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
          rows={3}
          style={{ width: "100%", padding: "10px" }}
          placeholder="댓글을 입력하세요"
        />
        <button onClick={handleCommentSubmit} style={{ marginTop: "5px" }}>
          댓글 작성
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {comments.length === 0 ? (
          <div style={{ color: "#666" }}>댓글이 없습니다.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{c.text}</span>
                {parseInt(userId, 10) === c.writer && (
                  <button
                    onClick={() => handleCommentDelete(c.id, c.writer)}
                    style={{
                      color: "red",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>작성일: {c.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KboBoardDetail;
