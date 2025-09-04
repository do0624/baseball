import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css';
import Slider from "react-slick";
import { parseTeamHtmlToArray, parseHitterHtmlToArray, parsePitcherHtmlToArray, normalizeList } from '../utils/htmlTableParser';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
    const [hitterStats, setHitterStats] = useState([]);
    const [pitcherStats, setPitcherStats] = useState([]);
    const [teamStats, setTeamStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 타자 기록
                const hitterRes = await axios.get('/kbo/hitter-stats', { params: { sortBy: 'run' } });
                setHitterStats(Array.isArray(hitterRes.data) 
                    ? hitterRes.data 
                    : (typeof hitterRes.data === 'string' ? parseHitterHtmlToArray(hitterRes.data) : normalizeList(hitterRes.data)));

                // 투수 기록
                const pitcherRes = await axios.get('/kbo/pitcher-stats', { params: { sortBy: 'era' } });
                setPitcherStats(Array.isArray(pitcherRes.data) 
                    ? pitcherRes.data 
                    : (typeof pitcherRes.data === 'string' ? parsePitcherHtmlToArray(pitcherRes.data) : normalizeList(pitcherRes.data)));

                // 팀 기록
                const teamRes = await axios.get('/kbo/team-stats');
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

    if (loading) return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
    if (error) return <div className="error-container">{error}</div>;

    // 타자 Top5 정렬
    const topBattingAverage = [...hitterStats].sort((a, b) => b.battingAverage - a.battingAverage).slice(0, 5);
    const topRBI = [...hitterStats].sort((a, b) => b.runsBattedIn - a.runsBattedIn).slice(0, 5);
    const topHomeRun = [...hitterStats].sort((a, b) => b.homeRun - a.homeRun).slice(0, 5);

    // 투수 Top5 정렬
    const topERA = [...pitcherStats].sort((a, b) => a.earnedRunAverage - b.earnedRunAverage).slice(0, 5);
    const topWin = [...pitcherStats].sort((a, b) => b.win - a.win).slice(0, 5);
    const topStrikeOut = [...pitcherStats].sort((a, b) => b.strikeOut - a.strikeOut).slice(0, 5);

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <Slider {...settings}>
                    <div>
                        <h1>KBO 타자 TOP5 랭킹</h1>
                        <div className="image-container">
                            <h2>타율
                                {topBattingAverage.map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.battingAverage}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                            <h2>타점
                                {topRBI.map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.runsBattedIn}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                            <h2>홈런
                                {topHomeRun.map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.homeRun}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                        </div>
                    </div>

                    <div>
                        <h1>KBO 투수 TOP5 랭킹</h1>
                        <div className="image-container">
                            <h2>ERA
                                {topERA.map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.earnedRunAverage}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                            <h2>승리
                                {topWin.map((player, index) => (
                                    <h4 key={index}>{index + 1}. {player.playerName} ({player.win}) ({player.playerTeam})</h4>
                                ))}
                            </h2>
                            <h2>탈삼진
                                {topStrikeOut.map((player, index) => (
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
