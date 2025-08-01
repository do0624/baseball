package com.baseball.ranking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KboPitcherStatsDto {
    private Long no;
    private String playerName; // 선수 이름
    private String playerTeam; // 팀이름
    private Double earnedRunAverage; // 평균 자책점
    private Integer gameNum; // 경기수
    private Integer win; // 승
    private Integer lose; // 패
    private Integer save; // 세이브
    private Integer hold; // 홀드
    private Double inningsPitched; // 이닝
    private Integer hits; // 피안타
    private Integer homeRun; // 피홈런
    private Integer baseOnBalls; // 볼넷
    private Integer strikeOut; // 탈삼진
    private Integer runs; // 실점
    private Integer earnedRun; // 자책
    private Double whip; // WHIP
}