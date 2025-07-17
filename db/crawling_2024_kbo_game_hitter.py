from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import pandas as pd
import time # 혹시 로딩 지연에 대비

# --- 설정 ---
URL1 = "https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx?sort=HRA_RT"
URL2 = "https://www.koreabaseball.com/Record/Player/HitterBasic/Basic2.aspx?sort=HRA_RT"
CHROME_DRIVER_PATH = './chromedriver.exe' # chromedriver.exe 파일 경로

# 팀 정보: {팀명(소문자): 팀 코드}
teams = {
    'doosan': 'OB',
    'hanhwa': 'HH',
    'lg': 'LG',
    'lotte': 'LT',
    'kia': 'HT',
    'ssg': 'SK',
    'kt': 'KT',
    'samsung': 'SS',
    'nc': 'NC',
    'kiwoom': 'WO'
}

player_data1 = []

# ==================== URL1 (Basic1.aspx) 데이터 수집 ====================
for team_name, team_code in teams.items():
    print(f"\n==================== {team_name.upper()} 팀 Basic1 데이터 수집 시작 ====================")

    service = Service(CHROME_DRIVER_PATH)
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920x1080")
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 20)

    try:
        driver.get(URL1)
        print("페이지 접속 완료")

        table_locator = (By.CSS_SELECTOR, "table.tData01.tt")
        wait.until(EC.presence_of_element_located(table_locator))
        print("초기 테이블 로딩 완료")

        # 연도 선택
        year_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlSeason_ddlSeason")))
        year_select = Select(year_select_element)
        table_before_change = driver.find_element(*table_locator)
        year_select.select_by_value("2024")
        wait.until(EC.staleness_of(table_before_change))
        wait.until(EC.presence_of_element_located(table_locator))
        print("연도 선택: 2024")
        
        # 팀 선택
        team_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlTeam_ddlTeam")))
        team_select = Select(team_select_element)
        table_before_change = wait.until(EC.presence_of_element_located(table_locator))
        team_select.select_by_value(team_code)
        print(f"팀 선택: {team_name.upper()} ({team_code})")
        wait.until(EC.staleness_of(table_before_change))
        wait.until(EC.presence_of_element_located(table_locator))
        print("최종 테이블 로딩 완료")

        # 데이터 추출
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.find('table', {'class': 'tData01 tt'})
        table_body = table.find('tbody')
        rows = table_body.find_all('tr')

        for row in rows:
            cols = row.find_all('td')
            if len(cols) < 16: # Basic1.aspx의 경우 16개 컬럼 예상 (0부터 시작)
                continue

            rank_text = cols[0].get_text(strip=True)
            if not rank_text.isdigit():
                continue
            
            avg_str = cols[3].get_text(strip=True)
            try:
                avg = float(avg_str)
            except ValueError:
                continue 
            
            if avg <= 0:
                continue

            data = {
                'Player_Name': cols[1].get_text(strip=True), # 선수 이름
                'Player_Team': cols[2].get_text(strip=True), # 선수 팀 이름
                'Batting_average': avg_str, # 타율
                'Game_Num': cols[4].get_text(strip=True), # 경기 수
                'Plate_Appearance': cols[5].get_text(strip=True), # 타석
                'At_Bat': cols[6].get_text(strip=True), # 타수
                'Run': cols[7].get_text(strip=True), # 득점
                'Hit': cols[8].get_text(strip=True), # 안타
                'two_Base': cols[9].get_text(strip=True), # 2루타
                'three_Base': cols[10].get_text(strip=True), # 3루타
                'Home_Run': cols[11].get_text(strip=True), # 홈런
                'Total_Base': cols[12].get_text(strip=True), # 루타
                'Runs_Batted_In': cols[13].get_text(strip=True), # 타점
                'Sacrifice_Bunts': cols[14].get_text(strip=True), # 희생 번트
                'Sacrifice_Fly': cols[15].get_text(strip=True), # 희생 플라이
            }
            player_data1.append(data)

        print(f"{team_name.upper()} Basic1 데이터 추출 완료. 추출된 선수 수: {len(player_data1)}")

    except Exception as e:
        print(f"Basic1.aspx 크롤링 중 오류 발생: {e}")

    finally:
        driver.quit()
        print("Basic1.aspx 브라우저 종료됨")

# player_data1 리스트를 DataFrame으로 변환
if player_data1:
    df1 = pd.DataFrame(player_data1)
    df1.drop_duplicates(subset=['Player_Name', 'Player_Team'], inplace=True)
    print(f"최종 df1 생성 완료. 행 수: {len(df1)}")
else:
    print("Basic1.aspx에서 저장할 데이터가 없습니다.")
    df1 = pd.DataFrame() # 빈 DataFrame 생성하여 merge 오류 방지

player_data2 = []

# ==================== URL2 (Basic2.aspx) 데이터 수집 ====================
for team_name, team_code in teams.items():
    print(f"\n==================== {team_name.upper()} 팀 Basic2 데이터 수집 시작 ====================")

    service = Service(CHROME_DRIVER_PATH)
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920x1080")
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 20)

    try:
        driver.get(URL2)
        print("페이지 접속 완료")

        table_locator = (By.CSS_SELECTOR, "table.tData01.tt")
        wait.until(EC.presence_of_element_located(table_locator))
        print("초기 테이블 로딩 완료")

        # 연도 선택
        year_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlSeason_ddlSeason")))
        year_select = Select(year_select_element)
        table_before_change = driver.find_element(*table_locator)
        year_select.select_by_value("2024")
        wait.until(EC.staleness_of(table_before_change))
        wait.until(EC.presence_of_element_located(table_locator))
        print("연도 선택: 2024")

        # 팀 선택
        team_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlTeam_ddlTeam")))
        team_select = Select(team_select_element)
        table_before_change = wait.until(EC.presence_of_element_located(table_locator))
        team_select.select_by_value(team_code)
        print(f"팀 선택: {team_name.upper()} ({team_code})")
        wait.until(EC.staleness_of(table_before_change))
        wait.until(EC.presence_of_element_located(table_locator))
        print("최종 테이블 로딩 완료")

        # 데이터 추출
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.find('table', {'class': 'tData01 tt'})
        table_body = table.find('tbody')
        rows = table_body.find_all('tr')

        for row in rows:
            cols = row.find_all('td')
            if len(cols) < 15: # Basic2.aspx의 경우 15개 컬럼 예상
                continue

            rank_text = cols[0].get_text(strip=True)
            if not rank_text.isdigit():
                continue

            data = {
                'Player_Name': cols[1].get_text(strip=True), # 선수 이름
                'Player_Team': cols[2].get_text(strip=True), # 선수 팀 이름
                'Four_Ball': cols[4].get_text(strip=True), # 볼넷
                'IBB': cols[5].get_text(strip=True), # 고의4구
                'Hit_by_Pitch': cols[6].get_text(strip=True), # 사구(몸에 맞는 볼)
                'Strike_Out': cols[7].get_text(strip=True), # 삼진
                'Double_out': cols[8].get_text(strip=True), # 병살타
                'Slugging': cols[9].get_text(strip=True), # 장타율
                'On_Base_Percentage': cols[10].get_text(strip=True), # 출루율
                'Onbase_Plus_Slug': cols[11].get_text(strip=True), # OPS(출루율+장타율)
                'Multi_Hit': cols[12].get_text(strip=True), # 멀티 히트(한 경기 안타 2개 이상)
                'Scoring_Position_AVG': cols[13].get_text(strip=True), # 득점권 타율
                'Pinch_Hit_AVG': cols[14].get_text(strip=True) # 대타 타율
            }
            player_data2.append(data)

        print(f"{team_name.upper()} Basic2 데이터 추출 완료. 추출된 선수 수: {len(player_data2)}")

    except Exception as e:
        print(f"Basic2.aspx 크롤링 중 오류 발생: {e}")

    finally:
        driver.quit()
        print("Basic2.aspx 브라우저 종료됨")

# player_data2 리스트를 DataFrame으로 변환
if player_data2:
    df2 = pd.DataFrame(player_data2)
    df2.drop_duplicates(subset=['Player_Name', 'Player_Team'], inplace=True)
    print(f"최종 df2 생성 완료. 행 수: {len(df2)}")
else:
    print("Basic2.aspx에서 저장할 데이터가 없습니다.")
    df2 = pd.DataFrame() # 빈 DataFrame 생성하여 merge 오류 방지

# ==================== DataFrame 병합 및 CSV 저장 ====================

if not df1.empty and not df2.empty:
    print("\n--- 두 DataFrame 병합 시작 ---")
    # 'Player_Name'과 'Player_Team'을 고유 키로 사용하여 병합
    merged_df = pd.merge(df1, df2, on=['Player_Name', 'Player_Team'], how='outer')

    # 데이터 타입 변환 (선택 사항이지만 권장)
    numeric_cols_float = ['Batting_average', 'Slugging', 'On_Base_Percentage', 'Onbase_Plus_Slug', 'Scoring_Position_AVG', 'Pinch_Hit_AVG']
    numeric_cols_int = [
        'Game_Num', 'Plate_Appearance', 'At_Bat', 'Run', 'Hit', 'two_Base', 'three_Base',
        'Home_Run', 'Total_Base', 'Runs_Batted_In', 'Sacrifice_Bunts', 'Sacrifice_Fly',
        'Four_Ball', 'IBB', 'Hit_by_Pitch', 'Strike_Out', 'Double_out', 'Multi_Hit'
    ]

    for col in numeric_cols_float:
        if col in merged_df.columns:
            merged_df[col] = pd.to_numeric(merged_df[col], errors='coerce') # '-' 등은 NaN으로
    
    for col in numeric_cols_int:
        if col in merged_df.columns:
            merged_df[col] = pd.to_numeric(merged_df[col], errors='coerce').fillna(0).astype(int) # NaN은 0으로 채우고 정수 변환

    print("병합 및 데이터 타입 변환 완료.")

    # Game_Num이 0인 데이터 삭제
    initial_rows = len(merged_df)
    merged_df = merged_df[merged_df['Game_Num'] > 0]
    deleted_rows = initial_rows - len(merged_df)
    print(f"Game_Num이 0인 {deleted_rows}개의 선수 데이터가 삭제되었습니다.")

    print(merged_df.head())
    print(f"최종 병합된 데이터의 행 수: {len(merged_df)}, 컬럼 수: {len(merged_df.columns)}")

    # CSV 파일로 저장
    csv_filename = "2024_useGame_hitter.csv"
    merged_df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
    print(f"\n'{csv_filename}' 파일이 성공적으로 저장되었습니다.")

else:
    print("\n데이터프레임이 비어있어 병합 및 CSV 저장 작업을 수행할 수 없습니다.")