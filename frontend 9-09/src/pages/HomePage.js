/* 
 * Todo list.
 * 1. <div className="home-container"> 배경 색상 변경
 * 2. 나머지는 전부 삭제.
 * 
 * # 들어가야 할 기능 #
 * 1. Header 제외한 KBO 정보 조회, 게시판, 게임 button이 있는 큰 container 만들기
 * -> Header 바로 밑에 들어갈 것.
 * 2. 하단 왼쪽 상단에 KBO 뉴스 포탈 이동 기능 container 만들기
 * 3. 하단 왼쪽 하단에 KBO 타자, 투수 랭킹 Top 5 container 만들기
 * 4. 하단 오른쪽 중 제일 상단에 로그인 기능 container 만들기
 * 5. 하단 오른쪽 중 제일 하단에 팀 랭킹 만들기
 * 
 * 6. 공간이 남으면, 오더지, 기록지 출력 기능 container 만들기
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';
import { parseHitterHtmlToArray, parsePitcherHtmlToArray, normalizeList } from '../utils/htmlTableParser';

const HomePage = () => {
    // API로부터 가져온 데이터를 저장할 상태
    const [hitterStats, setHitterStats] = useState([]);
    const [pitcherStats, setPitcherStats] = useState([]);
    const [teamStats, setTeamStats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState(''); // 로그인 메시지 상태 추가

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/login/login', {
                id: username,
                pw: password
            });

            if (response.data.success) {
                setLoginMessage('로그인 성공! 환영합니다. 🎉');
                setIsLoggedIn(true);
                // 백엔드에서 사용자 정보를 가져오는 추가 API 호출
                const memberInfo = await axios.get(`http://localhost:8080/api/login/member?Id=${username}`);
                setUserInfo(memberInfo.data);
            } else {
                setLoginMessage(response.data.message || '로그인 실패. 다시 시도해주세요.');
                console.error('로그인 실패:', response.data.message);
            }
        } catch (err) {
            console.error('로그인 요청 중 오류 발생:', err);
            setLoginMessage('로그인 처리 중 오류가 발생했습니다.');
        }
    };

    // 로그아웃 처리
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserInfo(null);
        setUsername('');
        setPassword('');
        setLoginMessage('로그아웃되었습니다.');
    };

    // HTML 응답(서버 렌더링 테이블)에서 팀 순위를 추출하는 파서
    const parseTeamHtmlToArray = (htmlString) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const rows = doc.querySelectorAll('tbody tr');
            const result = [];
            rows.forEach((tr) => {
                const tds = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
                if (tds.length >= 8) {
                    result.push({
                        teamName: tds[1],
                        gameNum: Number(tds[2]),
                        win: Number(tds[3]),
                        lose: Number(tds[4]),
                        draw: Number(tds[5]),
                        winPercentage: tds[6],
                        gamesBehind: tds[7]
                    });
                }
            });
            return result;
        } catch (e) {
            return [];
        }
    };

  
    useEffect(() => {
        const fetchData = async () => {
          try {
            const [hitterRes, pitcherRes, teamRes] = await Promise.all([
              axios.get('/kbo/hitter-stats', { params: { sortBy: 'run' } }),
              axios.get('/kbo/pitcher-stats', { params: { sortBy: 'era' } }),
              axios.get('/kbo/team-stats')
            ]);
                setHitterStats(Array.isArray(hitterRes.data) ? hitterRes.data : (typeof hitterRes.data === 'string' ? parseHitterHtmlToArray(hitterRes.data) : normalizeList(hitterRes.data)));
                setPitcherStats(Array.isArray(pitcherRes.data) ? pitcherRes.data : (typeof pitcherRes.data === 'string' ? parsePitcherHtmlToArray(pitcherRes.data) : normalizeList(pitcherRes.data)));
                
                const rawTeam = teamRes.data;
                const normalizedTeam = Array.isArray(rawTeam)
                    ? rawTeam
                    : (typeof rawTeam === 'string' ? parseTeamHtmlToArray(rawTeam) : normalizeList(rawTeam));
                setTeamStats(normalizedTeam);

            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true,
    };

    if (loading) {
        return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        
        <div className="home-container"> {/* 전체 container div 시작 */}

            <div className="header-content-banner"> {/* header container div 시작 */}
                <h1 className="banner-title"> KBO 야구의 모든 것 </h1>

                <p className="banner-subtitle">
                    최신 뉴스부터 경기 정보, 팀 순위까지 한 곳에서 확인하세요
                </p>

                <div className="banner-buttons">
                    <button className="kbo-button" onClick={() => navigate("/kbo")}>팀 정보 보기</button>
                    <button className="kbo-button" onClick={() => navigate("/kboboard")}>팬 게시판</button>
                    <button className="kbo-button" onClick={() => navigate("/game/game")}>야구 게임</button>
                </div>

            </div> {/* header container div 시작 */}

            <div className="content-area"> {/* content-area div 시작 */}
                
                <div className="main-left-section"> {/* 왼쪽 div 시작 */}
                    
                    <div className="ranking-container"> {/* 선수 랭킹 container div 시작 */}

                        {/* 선수 랭킹 div는 3개의 div로 나뉜다. 상 중 하. -> 제목, 타자 랭킹, 투수 랭킹 */}

                        <div className="ranking-header"> {/* 제목 div 시작 */}
                            <h2 className="ranking-title">선수 랭킹 TOP 5</h2>
                        </div> {/* 제목 div 종료 */}
                        
                        <div className="ranking-slider-hitter"> {/* 타자 랭킹 div 시작 */}

                            <Slider {...sliderSettings}> {/* 타자 기록 슬라이더 시작 */}

                                <div className="ranking-box"> {/* 타자 타율 div 시작 */}
                                    <h3>타자 랭킹 (타율)</h3>

                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => ( 
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.battingAverage}</span>
                                            </li>
                                        ))}
                                    </ol>

                                </div> {/* 타자 타율 div 종료 */}

                                <div className="ranking-box"> {/* 타자 타점 div 시작 */}

                                    <h3>타자 랭킹 (타점)</h3>

                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => (
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.runsBattedIn}</span>
                                            </li>
                                        ))}
                                    </ol>

                                </div> {/* 타자 타점 div 종료 */}

                                <div className="ranking-box"> {/* 타자 홈런 div 시작 */}

                                    <h3>타자 랭킹 (홈런)</h3>

                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => (
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.homeRun}</span>
                                            </li>
                                        ))}
                                    </ol>

                                </div> {/* 타자 홈런 div 종료 */}

                            </Slider> {/* 타자 기록 슬라이더 종료 */}

                        </div> {/* 타자 랭킹 div 종료 */}

                        <hr></hr>

                        <div className="ranking-slider-pitcher"> {/* 투수 랭킹 div 시작 */}

                            <Slider {...sliderSettings}> {/* 투수 기록 슬라이더 시작 */}

                                <div className="ranking-box"> {/* 투수 era div 시작 */}
                                    <h3>투수 랭킹 (평균자책점)</h3>
                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.earnedRunAverage}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div> {/* 투수 era div 종료 */}

                                <div className="ranking-box"> {/* 투수 승리 div 시작 */}
                                    <h3>투수 랭킹 (승리)</h3>
                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.win}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div> {/* 투수 승리 div 종료 */}

                                <div className="ranking-box"> {/* 투수 탈삼진 div 시작 */}
                                    <h3>투수 랭킹 (탈삼진)</h3>
                                    <ol className="player-ranking-list"> {/* 새로운 클래스 적용 */}
                                        {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                            <li key={index}>
                                                <span className="rank-number">{index + 1}.</span>
                                                <span className="player-name">{player.playerName} ({player.playerTeam})</span>
                                                <span className="player-stat">{player.strikeOut}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div> {/* 투수 탈삼진 div 종료 */}

                            </Slider> {/* 투수 기록 슬라이더 종료 */}

                        </div> {/* 투수 랭킹 div 시작 */}
                        
                    </div> {/* 선수 랭킹 container div 시작 */}
                    
                </div>
                {/* 왼쪽 div 종 료*/}
                
                {/* "오른쪽 content section div" 는 log-in box와 팀 ranking 을 보여주는 부분으로 나뉜다. */}
                <div className="main-right-content-section"> {/* 오른쪽 content section div 시작 */}

                    <div className="login-container"> {/* log-in box div 시작 */}
                        <div className="login-header"> {/* 제목 div 시작 */}
                            <h3 className="login-title">로그인</h3>
                       
                  
                        </div> {/* 제목 div 종료 */}
                        

                        {isLoggedIn ? (
                            <div className="welcome-message-box">
                                <p className="welcome-message">
                                    {userInfo?.Id}님 환영합니다!!
                                </p>
                                <button onClick={handleLogout} className="logout-button">
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="login-form"> {/* log-in form 시작 */}
                            <input // ID 적는 부분
                                type="text"
                                name="username"
                                placeholder="아이디"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />

                            <input // 비밀 번호 적는 부분
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button type="submit" className="login-button">로그인</button> {/* 로그인 버튼 */}
                        </form> // log-in form 종료
                        )}
                        
                        {/* 로그인 메시지 표시 */}
                        {loginMessage && ( 
                            <div className="login-message">
                                {loginMessage}
                            </div>
                        )}

                    </div> {/* log-in box div 종료 */}
                    
                    <div className="team-ranking-container"> {/* 팀 랭킹 container div 시작 */}

                        <div className="ranking-header"> {/* 제목 div 시작 */}
                            <h3 className="ranking-title">
                                <span>🏆</span> 팀 순위 (상위 5팀)
                            </h3>
                        </div> {/* 제목 div 종료 */}

                        <ol className="team-ranking-list"> {/* 팀 랭킹 ol tag 시작 */}
                            {teamStats.slice(0, 5).map((team, index) => (
                                <li key={index}>
                                    <span className="rank-number">{index + 1}.</span>
                                    <span className="team-name">{team.teamName}</span>
                                    <span className="team-wins">{team.win}승</span>
                                </li>
                            ))}
                        </ol> {/* 팀 랭킹 ol tag 종료 */}

                    </div> {/* 선수 랭킹 container div 종료 */}

                </div> {/* 오른쪽 content section div 종료 */}

            </div> {/* content-area div 종료 */}

        </div> // 전체 container div 종료
        
    );
};

export default HomePage;