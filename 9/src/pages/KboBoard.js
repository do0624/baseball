// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from "axios";
// import '../styles/NoticeboardPage.css';

// const mockPosts = [
//   { id: 1, title: 'KBO 첫 번째 게시글', author: 'kbo1', date: '2024-06-01', views: 10 },
//   { id: 2, title: 'KBO 경기 분석', author: 'kbo2', date: '2024-06-02', views: 8 },
//   { id: 3, title: 'KBO 선수 소식', author: 'kbo3', date: '2024-06-03', views: 5 },
//   { id: 4, title: '오늘의 KBO', author: 'kbo4', date: '2024-06-04', views: 20 },
//   { id: 5, title: 'KBO 규칙', author: 'admin', date: '2024-06-05', views: 30 },
// ];
// const POSTS_PER_PAGE = 5;

// const [searchResults, setSearchResults] = useState([]);
// const [pagedPosts, setPagedPosts] = useState([]);
// const [totalPages, setTotalPages] = useState(1);
// const [page, setPage] = useState(1);

// const KboBoard = () => {
//   const [roomId, setRoomId] = useState('general');
//   const [page, setPage] = useState(1);
//   const totalPages = Math.ceil(mockPosts.length / POSTS_PER_PAGE);
//   const pagedPosts = mockPosts.slice((page-1)*POSTS_PER_PAGE, page*POSTS_PER_PAGE);
//   const navigate = useNavigate();
//   const handleCardClick = (post) => {
//     navigate(`/KboBoardDetail/${post.id}`);
//   };
//  // 🔍 검색 버튼 클릭 시: 제목 + 카테고리 필터링
//  const handleSearch = () => {
//   const filtered = mockPosts.filter(post => {
//     const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchCategory = roomId === 'all' || post.category === roomId;
//     return matchTitle && matchCategory;
//   });
//   useEffect(() => {
//     const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
//     const paged = searchResults.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
//     setTotalPages(totalPages);
//     setPagedPosts(paged);
//   }, [searchResults, page]);

//   setSearchResults(filtered);
//   setPage(1); // 검색 시 페이지 초기화

//   const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
//   const pagedPosts = filtered.slice(0, POSTS_PER_PAGE);

//   // 필요하다면 별도의 상태로 설정
//   setTotalPages(totalPages);
//   setPagedPosts(pagedPosts);
// };


//   return (
//     <div className="noticeboard-container">
//       <div className="noticeboard-header">
//         <h1 className="noticeboard-title">게시판</h1>
//       </div>
//          <label>
//         종류{' '}
//         <select
//           value={roomId}
//           onChange={e => setRoomId(e.target.value)}
//           >
//           <option value="all">전체</option>
//           <option value="general">자유</option>
//           <option value="kbo">KBO</option>
//           <option value="kbo">사회인야구</option>
//           <option value="kbo">MLB</option>
//         </select>
//       </label>
//       <div>
//         rjator
//       </div>
//       <div className="noticeboard-list">
//         {pagedPosts.map(post => (
//           <div className="noticeboard-card" key={post.id} onClick={() => handleCardClick(post)} style={{ cursor: 'pointer' }}>
//             <div className="noticeboard-post-title">{post.title}</div>
//             <div className="noticeboard-meta">
//               <span>작성자: {post.author}</span>
//               <span>날짜: {post.date}</span>
//               <span>조회수: {post.views}</span>
//             </div>
//           </div>
//         ))}
//         <button className="noticeboard-write-btn" onClick={() => navigate('/PostForm2')}>글쓰기</button>
//       </div>
//       <div className="noticeboard-pagination">
//         {Array.from({ length: totalPages }, (_, idx) => (
//           <button
//             key={idx+1}
//             className={`noticeboard-page-btn${page === idx+1 ? ' active' : ''}`}
//             onClick={() => setPage(idx+1)}
//           >
//             {idx+1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default KboBoard; 



// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import '../styles/NoticeboardPage.css';

// // const mockPosts = [
// //   { id: 1, title: 'KBO 첫 번째 게시글', author: 'kbo1', date: '2024-06-01', views: 10, category: 'kbo' },
// //   { id: 2, title: 'KBO 경기 분석', author: 'kbo2', date: '2024-06-02', views: 8, category: 'kbo' },
// //   { id: 3, title: 'KBO 선수 소식', author: 'kbo3', date: '2024-06-03', views: 5, category: 'kbo' },
// //   { id: 4, title: '오늘의 KBO', author: 'kbo4', date: '2024-06-04', views: 20, category: 'general' },
// //   { id: 5, title: 'KBO 규칙', author: 'admin', date: '2024-06-05', views: 30, category: 'mlb' },
// // ];

// // const POSTS_PER_PAGE = 5;

// // const KboBoard = () => {
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [roomId, setRoomId] = useState('all'); // ← 종류 상태 추가
// //   const [searchResults, setSearchResults] = useState(mockPosts);
// //   const [page, setPage] = useState(1);
// //   const navigate = useNavigate();

// //   // 🔍 검색 버튼 클릭 시: 제목 + 카테고리 필터링
// //   const handleSearch = () => {
// //     const filtered = mockPosts.filter(post => {
// //       const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
// //       const matchCategory = roomId === 'all' || post.category === roomId;
// //       return matchTitle && matchCategory;
// //     });
// //     setSearchResults(filtered);
// //     setPage(1); // 검색 시 페이지 초기화
// //   };

// //   const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
// //   const pagedPosts = searchResults.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

// //   return (
// //     <div className="noticeboard-container">
// //       <h1 className="noticeboard-title">게시판</h1>

// //       <div className="noticeboard-filters">
// //         <input
// //           type="text"
// //           placeholder="제목 검색"
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //         />
// //         <label>
// //           종류{' '}
// //           <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
// //             <option value="all">전체</option>
// //             <option value="general">자유</option>
// //             <option value="kbo">KBO</option>
// //             <option value="amateur">사회인야구</option>
// //             <option value="mlb">MLB</option>
// //           </select>
// //         </label>
// //         <button onClick={handleSearch}>검색</button>
// //       </div>

// //       <div className="noticeboard-list">
// //         {pagedPosts.map((post) => (
// //           <div
// //             className="noticeboard-card"
// //             key={post.id}
// //             onClick={() => navigate(`/KboBoardDetail/${post.id}`)}
// //             style={{ cursor: 'pointer' }}
// //           >
// //             <div className="noticeboard-post-title">{post.title}</div>
// //             <div className="noticeboard-meta">
// //               <span>작성자: {post.author}</span>
// //               <span>날짜: {post.date}</span>
// //               <span>조회수: {post.views}</span>
// //             </div>
// //           </div>
// //         ))}

// //         <button className="noticeboard-write-btn" onClick={() => navigate('/PostForm2')}>
// //           글쓰기
// //         </button>
// //       </div>

// //       <div className="noticeboard-pagination">
// //         {Array.from({ length: totalPages }, (_, idx) => (
// //           <button
// //             key={idx + 1}
// //             className={`noticeboard-page-btn${page === idx + 1 ? ' active' : ''}`}
// //             onClick={() => setPage(idx + 1)}
// //           >
// //             {idx + 1}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default KboBoard;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/NoticeboardPage.css';

// const mockPosts = [
//   { id: 1, title: 'KBO 첫 번째 게시글', author: 'kbo1', date: '2024-06-01', views: 10, category: 'kbo' },
//   { id: 2, title: 'KBO 경기 분석', author: 'kbo2', date: '2024-06-02', views: 8, category: 'kbo' },
//   { id: 3, title: 'KBO 선수 소식', author: 'kbo3', date: '2024-06-03', views: 5, category: 'kbo' },
//   { id: 4, title: '오늘의 KBO', author: 'kbo4', date: '2024-06-04', views: 20, category: 'general' },
//   { id: 5, title: 'KBO 규칙', author: 'admin', date: '2024-06-05', views: 30, category: 'mlb' },
// ];

// const POSTS_PER_PAGE = 5;

// const KboBoard = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [roomId, setRoomId] = useState('all');
//   const [searchResults, setSearchResults] = useState(mockPosts);
//   const [page, setPage] = useState(1);

//   const navigate = useNavigate();

//   const handleSearch = () => {
//     const filtered = mockPosts.filter(post => {
//       const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchCategory = roomId === 'all' || post.category === roomId;
//       return matchTitle && matchCategory;
//     });
//     setSearchResults(filtered);
//     setPage(1); // 페이지 초기화
//   };
//   useEffect(() => {
//     if (roomId === "all") {
//       setFilteredPosts(allPosts);
//     } else {
//       const filtered = allPosts.filter(post => post.category === roomId);
//       setFilteredPosts(filtered);
//     }
//   }, [roomId]);

//   const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
//   const pagedPosts = searchResults.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

//   return (
//     <div className="noticeboard-container">
//       <h1 className="noticeboard-title">게시판</h1>

//       <div className="noticeboard-filters">
//         <input
//           type="text"
//           placeholder=" 검색"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button onClick={handleSearch}>검색</button>
//         <div>
//       <label>
//         <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
//           <option value="all">전체</option>
//           <option value="general">자유</option>
//           <option value="kbo">KBO</option>
//           <option value="NPB">NPB</option>
//           <option value="mlb">MLB</option>
//           <option value="amateur">사회인야구</option>
//         </select>
//       </label>

//       <ul>
//         {filteredPosts.map(post => (
//           <li key={post.id}>{post.title}</li>
//         ))}
//       </ul>
//     </div>

//       <div className="noticeboard-list">
//         {pagedPosts.map((post) => (
//           <div
//             className="noticeboard-card"
//             key={post.id}
//             onClick={() => navigate(`/KboBoardDetail/${post.id}`)}
//             style={{ cursor: 'pointer' }}
//           >
//             <div className="noticeboard-post-title">{post.title}</div>
//             <div className="noticeboard-meta">
//               <span>작성자: {post.author}</span>
//               <span>날짜: {post.date}</span>
//               <span>조회수: {post.views}</span>
//             </div>
//           </div>
//         ))}

//         <button className="noticeboard-write-btn" onClick={() => navigate('/PostForm2')}>
//           글쓰기
//         </button>
//       </div>

//       <div className="noticeboard-pagination">
//         {Array.from({ length: totalPages }, (_, idx) => (
//           <button
//             key={idx + 1}
//             className={`noticeboard-page-btn${page === idx + 1 ? ' active' : ''}`}
//             onClick={() => setPage(idx + 1)}
//           >
//             {idx + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//     </div>
//   );
// };

// export default KboBoard;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/NoticeboardPage.css';

// const mockPosts = [
//   { id: 1, title: 'KBO 첫 번째 게시글', author: 'kbo1', date: '2024-06-01', views: 10, category: 'kbo' },
//   { id: 2, title: 'KBO 경기 분석', author: 'kbo2', date: '2024-06-02', views: 8, category: 'kbo' },
//   { id: 3, title: 'KBO 선수 소식', author: 'kbo3', date: '2024-06-03', views: 5, category: 'kbo' },
//   { id: 4, title: '오늘의 KBO', author: 'kbo4', date: '2024-06-04', views: 20, category: 'general' },
//   { id: 5, title: 'KBO 규칙', author: 'admin', date: '2024-06-05', views: 30, category: 'kbo' },
// ];

// const POSTS_PER_PAGE = 5;

// const KboBoard = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [roomId, setRoomId] = useState('all');
//   const [searchResults, setSearchResults] = useState(mockPosts);
//   const [page, setPage] = useState(1);

//   const navigate = useNavigate();

//   // 검색 또는 카테고리 변경 시 필터링
//   const handleSearch = () => {
//     const filtered = mockPosts.filter(post => {
//       const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchCategory = roomId === 'all' || post.category === roomId;
//       return matchTitle && matchCategory;
//     });
//     setSearchResults(filtered);
//     setPage(1); // 페이지 초기화
//   };

//   // roomId 변경 시 자동 검색 실행
//   useEffect(() => {
//     handleSearch();
//   }, [roomId]);

//   const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
//   const pagedPosts = searchResults.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

//   return (
//     <div className="noticeboard-container">
//       <h1 className="noticeboard-title">게시판</h1>

//       <div className="noticeboard-filters">
//         <input
//           type="text"
//           placeholder=" 검색"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button onClick={handleSearch}>검색</button>
//         <label>
//           <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
//             <option value="all">전체</option>
//             <option value="general">자유</option>
//             <option value="kbo">KBO</option>
//             <option value="NPB">NPB</option>
//             <option value="mlb">MLB</option>
//             <option value="amateur">사회인야구</option>
//           </select>
//         </label>
//       </div>

//       <div className="noticeboard-list">
//         {pagedPosts.map((post) => (
//           <div
//             className="noticeboard-card"
//             key={post.id}
//             onClick={() => navigate(`/KboBoardDetail/${post.id}`)}
//             style={{ cursor: 'pointer' }}
//           >
//             <div className="noticeboard-post-title">{post.title}</div>
//             <div className="noticeboard-meta">
//               <span>작성자: {post.author}</span>
//               <span>날짜: {post.date}</span>
//               <span>조회수: {post.views}</span>
//             </div>
//           </div>
//         ))}

//         <button className="noticeboard-write-btn" onClick={() => navigate('/PostForm2')}>
//           글쓰기
//         </button>
//       </div>

//       <div className="noticeboard-pagination">
//         {Array.from({ length: totalPages }, (_, idx) => (
//           <button
//             key={idx + 1}
//             className={`noticeboard-page-btn${page === idx + 1 ? ' active' : ''}`}
//             onClick={() => setPage(idx + 1)}
//           >
//             {idx + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default KboBoard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/NoticeboardPage.css';

const POSTS_PER_PAGE = 5;

const KboBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomId, setRoomId] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // ✅ 게시글 불러오기 (Spring 연동)
  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/board", {
        params: roomId === 'all' ? {} : { category: roomId }
      });

      const data = response.data;

      // 검색어까지 필터링
      const filtered = data.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSearchResults(filtered);
      setPage(1); // 페이지 초기화
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
      alert("게시글을 불러오는 데 실패했습니다.");
    }
  };

  // ✅ 검색 버튼 클릭 시
  const handleSearch = () => {
    fetchPosts();
  };

  // ✅ 카테고리 변경 시 자동 검색
  useEffect(() => {
    fetchPosts();
  }, [roomId]);

  const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
  const pagedPosts = searchResults.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="noticeboard-container">
      <h1 className="noticeboard-title">게시판</h1>

      <div className="noticeboard-filters">
        <input
          type="text"
          placeholder=" 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button>

        <label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="all">전체</option>
            <option value="general">자유</option>
            <option value="kbo">KBO</option>
            <option value="NPB">NPB</option>
            <option value="mlb">MLB</option>
            <option value="amateur">사회인야구</option>
          </select>
        </label>
      </div>

      <div className="noticeboard-list">
        {pagedPosts.map((post) => (
          <div
            className="noticeboard-card"
            key={post.id}
            onClick={() => navigate(`/KboBoardDetail/${post.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="noticeboard-post-title">{post.title}</div>
            <div className="noticeboard-meta">
              <span>작성자: {post.writer}</span>
              <span>날짜: {post.date}</span>
              <span>조회수: {post.views}</span>
            </div>
          </div>
        ))}

        <button className="noticeboard-write-btn" onClick={() => navigate('/PostForm2')}>
          글쓰기
        </button>
      </div>

      <div className="noticeboard-pagination">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            className={`noticeboard-page-btn${page === idx + 1 ? ' active' : ''}`}
            onClick={() => setPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KboBoard;
