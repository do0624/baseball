package com.baseball.ranking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController; // @Controller 대신 @RestController 사용

import com.baseball.ranking.dto.KboHitterStatsDto;
import com.baseball.ranking.dto.KboPitcherStatsDto;
import com.baseball.ranking.dto.KboTeamStatsDto;
import com.baseball.ranking.service.KboStatsService;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController // JSON 데이터를 반환하므로 @RestController 사용
@RequestMapping("/kbo") // API 경로를 명확히 하기 위해 경로를 /api/kbo로 수정
public class KboStatsController {
    
    private final KboStatsService kboStatsService;

    @Autowired
    public KboStatsController(KboStatsService kboStatsService) {
        this.kboStatsService = kboStatsService;
    }

    // --- 타자 기록 API ---
    @GetMapping("/hitter-stats")
    public List<KboHitterStatsDto> getHitterStats(@RequestParam(required = false, defaultValue = "battingAverage") String sortBy) {
        switch (sortBy) {
            case "numberOfGames":
                return kboStatsService.getHitterStatsOrderByNumberOfGamesDesc();
            case "plateAppearance":
                return kboStatsService.getHitterStatsOrderByPlateAppearanceDesc();
            case "run":
                return kboStatsService.getHitterStatsOrderByRunDesc();
            case "hit":
                return kboStatsService.getHitterStatsOrderByHitDesc();
            case "twoBase":
                return kboStatsService.getHitterStatsOrderByTwoBaseDesc();
            case "threeBase":
                return kboStatsService.getHitterStatsOrderByThreeBaseDesc();
            case "homeRun":
                return kboStatsService.getHitterStatsOrderByHomeRun();
            case "runsBattedIn":
                return kboStatsService.getHitterStatsOrderByRunsBattedIn();
            case "fourBall":
                return kboStatsService.getHitterStatsOrderByFourBallDesc();
            case "strikeOut":
                return kboStatsService.getHitterStatsOrderByStrikeOutDesc();
            case "onBasePercentage":
                return kboStatsService.getHitterStatsOrderByOnBasePercentageDesc();
            case "ops":
                return kboStatsService.getHitterStatsOrderByOPSDesc();
            case "battingAverage":
            default:
                return kboStatsService.getHitterStatsOrderByBattingAverage();
        }
    }

    // --- 투수 기록 API ---
    @GetMapping("/pitcher-stats")
    public List<KboPitcherStatsDto> getPitcherStats(@RequestParam(required = false, defaultValue = "era") String sortBy) {
        switch (sortBy) {
            case "numberOfGame":
                return kboStatsService.getPitcherStatsOrderByNumberOfGameDesc();
            case "win":
                return kboStatsService.getPitcherStatsOrderByWin();
            case "lose":
                return kboStatsService.getPitcherStatsOrderByLoseDesc();
            case "save":
                return kboStatsService.getPitcherStatsOrderBySaveDesc();
            case "hold":
                return kboStatsService.getPitcherStatsOrderByHoldDesc();
            case "numberOfInning":
                return kboStatsService.getPitcherStatsOrderByNumberOfInningDesc();
            case "hit":
                return kboStatsService.getPitcherStatsOrderByHitDesc();
            case "homeRun":
                return kboStatsService.getPitcherStatsOrderByHomeRunDesc();
            case "fourBall":
                return kboStatsService.getPitcherStatsOrderByFourBallDesc();
            case "strikeOut":
                return kboStatsService.getPitcherStatsOrderByStrikeOut();
            case "run":
                return kboStatsService.getPitcherStatsOrderByRunDesc();
            case "earnedRun":
                return kboStatsService.getPitcherStatsOrderByEarnedRunDesc();
            case "whip":
                return kboStatsService.getPitcherStatsOrderByWHIPAsc();
            case "era":
            default:
                return kboStatsService.getPitcherStatsOrderByERADesc();
        }
    }

    // --- 팀 기록 API ---
    @GetMapping("/team-stats")
    public List<KboTeamStatsDto> getTeamStats() {
        // 팀 기록은 정렬 옵션이 하나뿐이므로 별도 처리 없이 호출
        return kboStatsService.getTeamStatsOrderByWinPercentage();
    }
}