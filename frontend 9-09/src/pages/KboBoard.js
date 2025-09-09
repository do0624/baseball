// src/pages/KboBoardList.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const categoryTextMap = {
  1: "자유",
  2: "KBO",
  3: "NPB",
  4: "MLB",
  5: "사회인야구",
};

const categoryValueMap = {
  all: null,
  general: 1,
  kbo: 2,
  NPB: 3,
  mlb: 4,
  amateur: 5,
};

const KboBoardList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const size = 10;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/board", {
        params: {
          category: categoryValueMap[category],
          keyword: keyword || null,
          page,
          size,
          sort: "no,DESC",
        },
      });

      const list = Array.isArray(res.data.list) ? res.data.list : [];
      setPosts(list);
      const totalCount = res.data.totalCount || 0;
      setTotalPages(Math.ceil(totalCount / size));
    } catch (err) {
      console.error(err);
      alert("게시글 로딩 실패");
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, keyword, page]);

  const handleSearch = () => setPage(1);

  return (
    <div className="noticeboard-container">
      <h2>KBO 게시판</h2>

      <div style={{ marginBottom: "20px" }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">전체</option>
          <option value="general">자유</option>
          <option value="kbo">KBO</option>
          <option value="NPB">NPB</option>
          <option value="mlb">MLB</option>
          <option value="amateur">사회인야구</option>
        </select>

        <input
          type="text"
          placeholder="검색어"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
        <button onClick={handleSearch} style={{ marginLeft: "5px" }}>
          검색
        </button>

        <button
          onClick={() => navigate("/PostForm2/new")}
          style={{ float: "right" }}
        >
          글쓰기
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>로딩 중...</div>
      ) : posts.length > 0 ? (
        <table className="noticeboard-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>카테고리</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((board) => (
              <tr
                key={board.no}
                onClick={() => navigate(`/kboBoard/${board.no}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{board.no}</td>
                <td>{board.title}</td>
                <td>{board.writer}</td>
                <td>{categoryTextMap[board.category] || board.category}</td>
                <td>{new Date(board.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>게시글이 없습니다.</div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              margin: "0 3px",
              backgroundColor: p === page ? "#666" : "#eee",
              color: p === page ? "#fff" : "#000",
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KboBoardList;
