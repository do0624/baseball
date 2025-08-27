import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/PostForm2.css";

const PostForm2 = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id가 있으면 수정 모드
  const isEdit = Boolean(id);

  const [writer, setWriter] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // DTO 필드명과 일치
  const [category, setCategory] = useState("general");

  useEffect(() => {
    // 로그인 체크
    const name = localStorage.getItem("userName");
    if (!name) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setWriter(name);

    // 수정 모드면 기존 글 불러오기
    if (isEdit) {
      axios
        .get(`http://localhost:8080/api/post/${id}`)
        .then((res) => {
          setTitle(res.data.title);
          setContent(res.data.content); // DTO 필드명과 맞춤
          setCategory(res.data.category);
        })
        .catch((err) => {
          console.error(err);
          alert("글 불러오기 실패");
        });
    }
  }, [id, isEdit, navigate]);

  const savePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const requestData = {
      writer,
      title: title.trim(),
      content: content.trim(), // DTO와 동일
      category,
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/post/${id}`, requestData);
        alert("글이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:8080/api/post", requestData);
        alert("글이 등록되었습니다.");
      }
      navigate("/kboBoard"); // 글 목록 페이지
    } catch (error) {
      console.error(error);
      alert("글 저장에 실패했습니다.");
    }
  };

  return (
    <div className="container">
      <div className="input-group">
        <h2 style={{ textAlign: "center" }}>{isEdit ? "글 수정" : "글쓰기"}</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
        />

        <span>작성자</span>
        <input type="text" value={writer} readOnly />

        <label>
          종류{" "}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">자유</option>
            <option value="kbo">KBO</option>
            <option value="NPB">NPB</option>
            <option value="mlb">MLB</option>
            <option value="amateur">사회인야구</option>
          </select>
        </label>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="내용"
        />

        <div className="button-group">
          <button onClick={savePost}>{isEdit ? "수정" : "저장"}</button>
          <button onClick={() => navigate("/kboBoard")}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default PostForm2;
