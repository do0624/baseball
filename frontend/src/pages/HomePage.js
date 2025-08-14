import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Axios 임포트
import '../styles/HomePage.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
    // API로부터 가져온 데이터를 저장할 상태
    const [hitterStats, setHitterStats] = useState([]);
    const [pitcherStats, setPitcherStats] = useState([]);
    const [teamStats, setTeamStats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 타자 기록 (홈런 순)
                // JSP 파일의 `<c:forEach>`에서 사용된 속성 이름과 일치하도록 `hitter.homeRun` 등을 사용
                const hitterRes = await axios.get('http://localhost:8080/kbo/hitter-stats', {
                    params: { sortBy: 'run' }
                });
                setHitterStats(hitterRes.data);

                // 투수 기록 (승리 순)
                // JSP 파일의 `<c:forEach>`에서 사용될 속성 이름과 일치하도록 `pitcher.win` 등을 사용
                const pitcherRes = await axios.get('http://localhost:8080/kbo/pitcher-stats', {
                    params: { sortBy: 'era' }
                });
                setPitcherStats(pitcherRes.data);

                // 팀 기록
                const teamRes = await axios.get('http://localhost:8080/kbo/team-stats');
                setTeamStats(teamRes.data);

            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true
    };

    if (loading) {
        return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="home-container">
            <section className="hero-section">
                <Slider {...settings}>

                    <div>
                        <h1>KBO 타자 TOP5 랭킹</h1>

                        <div className="image-container">
                            <h2>타율
                              {/* hitterStats가 배열인지 확인 후 map 함수 사용 */}
                              {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => ( 
                                  // mapper.xml 파일에서 resultMap 안에 있는 property 값을 사용해야 합니다.
                                  <h4 key={index}>{index + 1}. {player.playerName} ({player.battingAverage}) ({player.playerTeam})</h4>
                              ))}
                            </h2>

                            <h2>타점
                                {/* hitterStats가 배열인지 확인 후 map 함수 사용 */}
                                {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.runsBattedIn}) ({player.playerTeam})</h4>
                                ))}
                            </h2>

                            <h2>홈런
                                {/* hitterStats가 배열인지 확인 후 map 함수 사용 */}
                                {Array.isArray(hitterStats) && hitterStats.slice(0, 5).map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.homeRun}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                        </div>
                    </div>

                    <div>
                        <h1>KBO 투수 TOP5 랭킹</h1>
                          <div className="image-container">
                            <h2>ERA
                                {/* pitcherStats가 배열인지 확인 후 map 함수 사용 */}
                                {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.earnedRunAverage}) ({player.playerTeam})</h4>
                                ))}
                            </h2>

                            <h2>승리
                                {/* pitcherStats가 배열인지 확인 후 map 함수 사용 */}
                                {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.win}) ({player.playerTeam})</h4>
                                ))}
                            </h2>

                            <h2>탈삼진
                                {/* pitcherStats가 배열인지 확인 후 map 함수 사용 */}
                                {Array.isArray(pitcherStats) && pitcherStats.slice(0, 5).map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.strikeOut}) ({player.playerTeam})</h4>
                                ))}
                            </h2>

                        </div>
                    </div>

                </Slider>
            </section>
            
            <section className="team-ranking-row">
                <div className="team-ranking">
                    <h1 className="team-ranking-title">KBO팀순위</h1>

                    <div className="team-ranking-container">
                        <div className="team-ranking-item">
                            {/* teamStats가 배열인지 확인 후 map 함수 사용 */}
                            {Array.isArray(teamStats) && teamStats.map((team, index) => (
                                <h2 key={index}>{index + 1}. {team.teamName} ({team.winPercentage})</h2>
                            ))}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default HomePage;