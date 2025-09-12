import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const categoryTextMap = { 1:"자유",2:"KBO",3:"NPB",4:"MLB",5:"사회인야구" };
const categoryValueMap = { all:null, general:1, kbo:2, NPB:3, mlb:4, amateur:5 };

const KboBoardList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const size = 10;

  // 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/board", {
        params: { category: categoryValueMap[category], keyword: keyword||null, page, size }
      });
      setPosts(res.data.list || []);
      setTotalPages(Math.ceil((res.data.totalCount || 0) / size));
    } catch(err){ console.error(err); alert("게시글 로딩 실패"); }
  };

  useEffect(() => { fetchPosts(); }, [category, keyword, page]);

  // 게시글 삭제
  const handleDelete = async (no, writerId) => {
    if (!user || user.Id !== writerId.toString()) { alert("본인 글만 삭제 가능합니다."); return; }
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/board/${no}`, { params: { writer: user.Id } });
      alert("삭제 완료");
      fetchPosts();
    } catch(err){ console.error(err); alert("삭제 실패"); }
  };

  return (
    <div className="noticeboard-container">
      <h2>KBO 게시판</h2>

      <div style={{ marginBottom:"20px" }}>
        <select value={category} onChange={e=>setCategory(e.target.value)}>
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
          onChange={e=>setKeyword(e.target.value)}
          style={{marginLeft:"10px"}}
        />
        <button onClick={()=>setPage(1)} style={{marginLeft:"5px"}}>검색</button>

        <button style={{float:"right"}} onClick={()=>navigate("/PostFormWithComments/new")}>글쓰기</button>
      </div>

      <table className="noticeboard-table">
        <thead>
          <tr><th>번호</th><th>제목</th><th>작성자</th><th>카테고리</th><th>작성일</th><th>삭제</th></tr>
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
      <td>
        {user && user.Id === board.writer.toString() && (
          <button
            style={{ color: "red" }}
            onClick={e => { e.stopPropagation(); handleDelete(board.no, board.writer); }}
          >
            삭제
          </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div style={{marginTop:"10px"}}>
        <button disabled={page <= 1} onClick={()=>setPage(page-1)}>이전</button>
        <span style={{margin:"0 10px"}}>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={()=>setPage(page+1)}>다음</button>
      </div>
    </div>
  );
};

export default KboBoardList;
