import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/PostForm2.css";

const categoryMap = {
  general: 1,
  kbo: 2,
  NPB: 3,
  mlb: 4,
  amateur: 5,
};

const PostForm2 = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드이면 id 존재
  const isEdit = Boolean(id);

  const draftKey = isEdit ? `postDraft_${id}` : "postDraft_new";

  const [writer, setWriter] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  // 로그인 체크 & 글 불러오기
  useEffect(() => {
    const userId = localStorage.getItem("Id");
    if (!userId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setWriter(userId);

    // draft 불러오기
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      const { title, content, category } = JSON.parse(savedDraft);
      setTitle(title || "");
      setContent(content || "");
      setCategory(category || "general");
    }

    // 수정 모드면 기존 글 불러오기 (draft보다 우선)
    if (isEdit) fetchPost(id);
  }, [id, isEdit, navigate]);

  // 기존 글 조회 함수
  const fetchPost = async (postId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/post/${postId}`);
      setTitle(res.data.title || "");
      setContent(res.data.content || "");
      const catStr =
        Object.entries(categoryMap).find(
          ([, val]) => val === res.data.categoryId
        )?.[0] || "general";
      setCategory(catStr);
    } catch (err) {
      console.error(err);
      alert("글 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  // draft 자동 저장
  useEffect(() => {
    const draft = { title, content, category };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [title, content, category, draftKey]);

  // 글 저장 / 수정
  const savePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const requestData = {
      userId: parseInt(writer, 10),
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryMap[category],
    };

    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(
          `http://localhost:8080/api/post/${id}`,
          requestData,
          { withCredentials: true }
        );
        alert("글이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:8080/api/post", requestData, {
          withCredentials: true,
        });
        alert("글이 등록되었습니다.");
        setTitle("");
        setContent("");
        setCategory("general");
      }
      // draft 삭제
      localStorage.removeItem(draftKey);
      navigate("/kboBoard");
    } catch (error) {
      console.error(error);
      alert("글 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="input-group">
        <h2 style={{ textAlign: "center" }}>
          {isEdit ? "글 수정" : "글쓰기"}
        </h2>

        {loading && <p>로딩 중...</p>}

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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
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
          style={{ resize: "vertical" }}
        />

        <div className="button-group">
          <button onClick={savePost}>{isEdit ? "수정" : "저장"}</button>
          <button
            onClick={() => {
              if (window.confirm("임시 저장된 내용이 삭제됩니다. 정말 취소?")) {
                localStorage.removeItem(draftKey);
                navigate("/kboBoard");
              }
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostForm2;
