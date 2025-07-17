from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException # 필요한 예외 클래스 임포트
from selenium.webdriver.chrome.options import Options
import time # 혹시 로딩 지연에 대비
from bs4 import BeautifulSoup
import pandas as pd

# Todo(게시판 투수 기록 크롤링)
# 웹에 보일 타자 기록 : 선수 이름, 선수 팀 이름, 평균자책점, 경기, 승리, 패배, 세이브, 홀드, 이닝, 피안타, 피홈런, 볼넷, 탈삼진, 실점, 자책점
# URL1 기록 : 선수 이름, 선수 팀 이름, 평균자책점, 경기, 승리, 패배, 세이브, 홀드, 이닝, 피안타, 피홈런, 볼넷, 탈삼진, 실점, 자책점
# URL2 기록 : 없음.
# => URL1 데이터랑 URL2 데이터를 합치는 작업이 필요 없음.

# 특이 사항 : 평균자책점은 규정 이닝은 채워야 한다. -> 규정 이닝 = 경기 수.
# -> 그럼 이것은 mapper에서 평균자책점을 가져올 때 where 절로 계산한다. -> 방법 1로 하자. -> DB에 "웹에 보일 xntn 기록" 이외로 넣을 스탯이 없다.

# 버튼 누르면 스탯 순서로 n명 웹에 나열 :
# 방법 : 스탯 크롤링 -> csv 저장 -> DB 저장 -> backend mapper로 DB에서 스탯순으로 가져옴.

# 그러면 할 것 :
# 1. 연도 바꾸기 (완)
# 2. 파일 이름 바꾸기 (완)
# 3. URL1에서 필요한 기록만 가져오기 -> data dictionary 변경 (완)
# 4. URL2과 관련된 코드 삭제. (완)
# 5. 바뀐 data dictionary에 맞게 numeric_cols_float와 numeric_cols_int 리스트 값들 변경. (완)

# --- 설정 ---
URL1 = "https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx?sort=ERA_RT"
# URL2는 사용하지 않으므로 주석 처리하거나 제거합니다.
# URL2 = "https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic2.aspx?sort=ERA_RT"
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

# --- 드라이버 초기화 (반복문 밖으로 이동하여 한 번만 초기화) ---
service = Service(CHROME_DRIVER_PATH)
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1920x1080")
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 20)
print("브라우저 및 WebDriver 초기화 완료.")

try: # 전체 크롤링 작업을 하나의 큰 try 블록으로 묶어 에러 발생 시에도 드라이버 종료 보장
    # ==================== URL1 (PitcherBasic/Basic1.aspx) 데이터 수집 ====================
    print("\n========== Basic1 (투수) 데이터 수집 시작 ==========")
    for team_name, team_code in teams.items():
        print(f"\n==================== {team_name.upper()} 팀 Basic1 (투수) 데이터 수집 중 ====================")

        try:
            # 각 팀별로 URL1을 다시 로드하여 페이지 상태를 초기화합니다.
            driver.get(URL1)
            table_locator = (By.CSS_SELECTOR, "table.tData01.tt")
            wait.until(EC.presence_of_element_located(table_locator))
            print("Basic1 페이지 접속 완료")

            # 연도 선택
            year_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlSeason_ddlSeason")))
            year_select = Select(year_select_element)

            current_selected_year = year_select.first_selected_option.get_attribute("value")

            if current_selected_year == "2025":
                print("연도: 2025년이 이미 선택되어 있습니다. 연도 변경을 건너뜀.")
                # 이미 2025년이 선택되어 있어도, 테이블이 로드되었는지 확인합니다.
                wait.until(EC.presence_of_element_located(table_locator))
            else:
                print(f"현재 선택된 연도: {current_selected_year}. 2025년으로 변경합니다.")
                try:
                    table_before_change = driver.find_element(*table_locator)
                except StaleElementReferenceException:
                    table_before_change = wait.until(EC.presence_of_element_located(table_locator))

                year_select.select_by_value("2025")
                print("연도 선택: 2025")
                try:
                    wait.until(EC.staleness_of(table_before_change))
                except TimeoutException:
                    print("Warning: 기존 테이블이 Stale 상태가 되는 데 타임아웃 발생. 하지만 진행합니다.")
                wait.until(EC.presence_of_element_located(table_locator))

            print("연도 선택 프로세스 완료.")

            # 팀 선택
            team_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlTeam_ddlTeam")))
            team_select = Select(team_select_element)
            table_before_change = wait.until(EC.presence_of_element_located(table_locator))
            team_select.select_by_value(team_code)
            print(f"팀 선택: {team_name.upper()} ({team_code})")
            wait.until(EC.staleness_of(table_before_change))
            
            # 테이블 데이터가 로드될 때까지 기다립니다.
            # 첫 번째 실제 데이터 행의 선수 이름 셀을 기다립니다.
            first_player_name_locator = (By.CSS_SELECTOR, "table.tData01.tt tbody tr:nth-child(1) td:nth-child(2) a")
            try:
                wait.until(EC.visibility_of_element_located(first_player_name_locator))
                print("최종 테이블 로딩 완료 (Basic1 - 데이터 로딩 확인)")
            except TimeoutException:
                print(f"경고: {team_name.upper()} 팀 Basic1에 2025년 투수 데이터가 없거나 로딩 지연.")
                continue # 데이터가 없으면 다음 팀으로 넘어갑니다.

            # 데이터 추출
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            table = soup.find('table', {'class': 'tData01 tt'})
            table_body = table.find('tbody')
            rows = table_body.find_all('tr')

            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 19:
                    continue

                rank_text = cols[0].get_text(strip=True)
                if not rank_text.isdigit():
                    continue

                player_name_tag = cols[1].find('a')
                player_name = player_name_tag.get_text(strip=True) if player_name_tag else ''
                player_team = cols[2].get_text(strip=True)

                data = {
                    'Player_Name': player_name, # 선수 이름
                    'Player_Team': player_team, # 선수 팀 이름
                    'Earned_Run_Average': cols[3].get_text(strip=True), # 평균자책점
                    'Game_Num': cols[4].get_text(strip=True), # 경기 수
                    'Win': cols[5].get_text(strip=True), # 승
                    'Lose': cols[6].get_text(strip=True), # 패
                    'Save': cols[7].get_text(strip=True), # 세이브
                    'Hold': cols[8].get_text(strip=True), # 홀드
                    'Innings_Pitched': cols[10].get_text(strip=True), # 이닝
                    'Hits': cols[11].get_text(strip=True), # 피안타
                    'Home_Run': cols[12].get_text(strip=True), # 피홈런
                    'Base_On_Balls': cols[13].get_text(strip=True), # 볼넷
                    'Strike_Out': cols[15].get_text(strip=True), # 탈삼진
                    'Runs': cols[16].get_text(strip=True), # 실점
                    'Earned_Run': cols[17].get_text(strip=True), # 자책점
                    'WHIP': cols[18].get_text(strip=True),
                }
                player_data1.append(data)

            print(f"{team_name.upper()} Basic1 데이터 추출 완료. 현재까지 추출된 선수 수: {len(player_data1)}")

        except Exception as e:
            print(f"Basic1.aspx 크롤링 중 오류 발생 ({team_name.upper()} 팀): {e}")

    # player_data1 리스트를 DataFrame으로 변환
    if player_data1:
        df1 = pd.DataFrame(player_data1)
        df1.drop_duplicates(subset=['Player_Name', 'Player_Team'], inplace=True)
        print(f"\n최종 df1 생성 완료. 행 수: {len(df1)}")
    else:
        print("\nBasic1.aspx에서 저장할 데이터가 없습니다.")
        df1 = pd.DataFrame() # 빈 DataFrame 생성

    # ==================== 데이터 타입 변환 및 CSV 저장 (df1만 사용) ====================

    if not df1.empty:
        print("\n--- 데이터 타입 변환 및 CSV 저장 시작 ---")

        # Innings_Pitched 변환 함수
        def convert_innings_pitched(inning_str):
            if pd.isna(inning_str) or inning_str.strip() == '':
                return None
            try:
                inning_str = inning_str.strip()

                # 1. 정수 형태 (예: '11')
                if '/' not in inning_str and ' ' not in inning_str:
                    return round(float(inning_str), 3)

                # 2. 정수 + 분수 (예: '39 1/3')
                parts = inning_str.split()
                if len(parts) == 2:
                    full = int(parts[0])
                    numerator, denominator = map(int, parts[1].split('/'))
                    return round(full + numerator / denominator, 3)

                # 3. 분수만 있는 경우 (예: '1/3')
                elif len(parts) == 1 and '/' in parts[0]:
                    numerator, denominator = map(int, parts[0].split('/'))
                    return round(numerator / denominator, 3)

                else:
                    return None
            except Exception:
                return None

        if 'Innings_Pitched' in df1.columns:
            df1['Innings_Pitched'] = df1['Innings_Pitched'].astype(str)
            df1['Innings_Pitched'] = df1['Innings_Pitched'].apply(convert_innings_pitched)

        numeric_cols_float = [
            'Earned_Run_Average', 'WHIP'
        ]
        numeric_cols_int = [
            'Game_Num', 'Win', 'Lose', 'Save', 'Hold', 'Hits', 'Home_Run',
            'Base_On_Balls', 'Strike_Out', 'Runs', 'Earned_Run',
        ]

        for col in numeric_cols_float:
            if col in df1.columns:
                df1[col] = pd.to_numeric(df1[col], errors='coerce')

        for col in numeric_cols_int:
            if col in df1.columns:
                df1[col] = pd.to_numeric(df1[col], errors='coerce').fillna(0).astype(int)

        # Innings_Pitched는 convert_innings_pitched 함수에서 이미 float으로 변환되었으므로,
        # 다시 pd.to_numeric을 호출할 필요는 없지만, 혹시 모를 경우를 대비해 유지할 수 있습니다.
        # 다만, errors='coerce'를 사용하여 None 값을 NaN으로 변환하고, 필요에 따라 fillna(0) 등을 적용할 수 있습니다.
        if 'Innings_Pitched' in df1.columns:
            df1['Innings_Pitched'] = pd.to_numeric(df1['Innings_Pitched'], errors='coerce')


        print("데이터 타입 변환 완료.")

        # Game_Num이 0인 데이터 삭제
        initial_rows = len(df1)
        df1 = df1[df1['Game_Num'] > 0]
        deleted_rows = initial_rows - len(df1)
        if deleted_rows > 0:
            print(f"Game_Num이 0인 {deleted_rows}개의 선수 데이터가 삭제되었습니다.")
        else:
            print("Game_Num이 0인 선수 데이터가 없습니다.")


        print(df1.head())
        print(f"최종 처리된 데이터의 행 수: {len(df1)}, 컬럼 수: {len(df1.columns)}")

        # CSV 파일로 저장
        csv_filename = "2025_useBoard_pitcher.csv"
        df1.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"\n'{csv_filename}' 파일이 성공적으로 저장되었습니다.")

    else:
        print("\n데이터프레임이 비어있어 CSV 저장 작업을 수행할 수 없습니다.")

finally:
    # 모든 크롤링 작업이 완료된 후 드라이버를 종료합니다.
    driver.quit()
    print("\n전체 크롤링 완료. 브라우저 종료됨")