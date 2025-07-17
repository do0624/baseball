from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
import pandas as pd

# --- 설정 ---
URL1 = "https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx?sort=ERA_RT"
URL2 = "https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic2.aspx?sort=ERA_RT"
CHROME_DRIVER_PATH = './chromedriver.exe'

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
player_data2 = []

service = Service(CHROME_DRIVER_PATH)
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1920x1080")
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 20)
print("브라우저 및 WebDriver 초기화 완료.")

try:
    # ==================== URL1 (PitcherBasic/Basic1.aspx) 데이터 수집 ====================
    print("\n========== Basic1 (투수) 데이터 수집 시작 ==========")
    for team_name, team_code in teams.items():
        print(f"\n==================== {team_name.upper()} 팀 Basic1 (투수) 데이터 수집 중 ====================")

        try:
            driver.get(URL1)
            table_locator = (By.CSS_SELECTOR, "table.tData01.tt")
            wait.until(EC.presence_of_element_located(table_locator))
            print("Basic1 페이지 접속 완료")

            year_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlSeason_ddlSeason")))
            year_select = Select(year_select_element)
            table_before_change = driver.find_element(*table_locator)
            year_select.select_by_value("2024")
            wait.until(EC.staleness_of(table_before_change))
            wait.until(EC.presence_of_element_located(table_locator))
            print("연도 선택: 2024")
            
            team_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlTeam_ddlTeam")))
            team_select = Select(team_select_element)
            table_before_change = wait.until(EC.presence_of_element_located(table_locator))
            team_select.select_by_value(team_code)
            print(f"팀 선택: {team_name.upper()} ({team_code})")
            wait.until(EC.staleness_of(table_before_change))
            
            # --- 수정된 부분: Basic1에서도 테이블 데이터가 로드될 때까지 기다립니다. ---
            # 테이블의 첫 번째 행 (헤더 제외)의 첫 번째 셀 (선수 순위) 또는 두 번째 셀 (선수 이름)
            # 여기서는 첫 번째 실제 데이터 행의 선수 이름 셀을 기다려봅니다.
            # 선수 이름 셀의 CSS 선택자는 'table.tData01.tt tbody tr:nth-child(1) td:nth-child(2) a' 일 것입니다.
            first_player_name_locator = (By.CSS_SELECTOR, "table.tData01.tt tbody tr:nth-child(1) td:nth-child(2) a")
            wait.until(EC.presence_of_element_located(first_player_name_locator))
            # 또는 첫 번째 셀에 순위가 표시될 때까지 기다리기
            # wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, "table.tData01.tt tbody tr:nth-child(1) td:nth-child(1)"), "1"))
            print("최종 테이블 로딩 완료 (Basic1 - 데이터 로딩 확인)")


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
                    'Player_Name': player_name,
                    'Player_Team': player_team,
                    'Earned_Run_Average': cols[3].get_text(strip=True),
                    'Game_Num': cols[4].get_text(strip=True),
                    'Win': cols[5].get_text(strip=True),
                    'Lose': cols[6].get_text(strip=True),
                    'Save': cols[7].get_text(strip=True),
                    'Hold': cols[8].get_text(strip=True),
                    'Winning_Percentage': cols[9].get_text(strip=True),
                    'Innings_Pitched': cols[10].get_text(strip=True),
                    'Hits': cols[11].get_text(strip=True),
                    'Home_Run': cols[12].get_text(strip=True),
                    'Base_On_Balls': cols[13].get_text(strip=True),
                    'Hit_By_Pitch': cols[14].get_text(strip=True),
                    'Strike_Out': cols[15].get_text(strip=True),
                    'Runs': cols[16].get_text(strip=True),
                    'Earned_Run': cols[17].get_text(strip=True),
                    'WHIP': cols[18].get_text(strip=True),
                }
                # print(data['Innings_Pitched'])
                player_data1.append(data)

            print(f"{team_name.upper()} Basic1 데이터 추출 완료. 현재까지 추출된 선수 수: {len(player_data1)}")

        except Exception as e:
            print(f"Basic1.aspx 크롤링 중 오류 발생 ({team_name.upper()} 팀): {e}")

    if player_data1:
        df1 = pd.DataFrame(player_data1)
        df1.drop_duplicates(subset=['Player_Name', 'Player_Team'], inplace=True)
        print(f"\n최종 df1 생성 완료. 행 수: {len(df1)}")
    else:
        print("\nBasic1.aspx에서 저장할 데이터가 없습니다.")
        df1 = pd.DataFrame()

    # ==================== URL2 (PitcherBasic/Basic2.aspx) 데이터 수집 ====================
    print("\n========== Basic2 (투수) 데이터 수집 시작 ==========")
    

    for team_name, team_code in teams.items():
        print(f"\n==================== {team_name.upper()} 팀 Basic2 (투수) 데이터 수집 중 ====================")

        try:
            driver.get(URL2)
            table_locator = (By.CSS_SELECTOR, "table.tData01.tt") # Basic2에서도 동일한 테이블 로케이터 사용
            wait.until(EC.presence_of_element_located(table_locator))
            print("Basic2 페이지 접속 완료")

            year_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlSeason_ddlSeason")))
            year_select = Select(year_select_element)
            table_before_change = driver.find_element(*table_locator)
            year_select.select_by_value("2024")
            wait.until(EC.staleness_of(table_before_change))
            wait.until(EC.presence_of_element_located(table_locator))
            print("연도 선택: 2024")

            team_select_element = wait.until(EC.presence_of_element_located((By.ID, "cphContents_cphContents_cphContents_ddlTeam_ddlTeam")))
            team_select = Select(team_select_element)
            table_before_change = wait.until(EC.presence_of_element_located(table_locator))
            team_select.select_by_value(team_code)
            print(f"팀 선택: {team_name.upper()} ({team_code})")
            wait.until(EC.staleness_of(table_before_change))
            
            # --- 핵심 수정 부분: Basic2에서 테이블 데이터가 로드될 때까지 기다립니다. ---
            # 선수 이름 셀의 CSS 선택자는 'table.tData01.tt tbody tr:nth-child(1) td:nth-child(2) a'
            # 한화의 경우 선수가 없을 수도 있으므로, 최소한 테이블의 첫 번째 TD 요소가 존재하고 텍스트가 비어있지 않기를 기다려봅니다.
            # 만약 팀에 선수가 한 명도 없는 경우 (새로 추가된 팀이나 아직 등록된 선수가 없는 경우), 이 wait 조건이 실패할 수 있습니다.
            # 하지만 대부분의 경우 유효한 선수 데이터가 로드될 것이므로 이 조건은 안정적입니다.
            first_data_cell_locator = (By.CSS_SELECTOR, "table.tData01.tt tbody tr:nth-child(1) td:nth-child(1)")
            wait.until(EC.presence_of_element_located(first_data_cell_locator)) # 첫 번째 데이터 셀의 존재
            
            # 만약 첫 번째 셀이 항상 순위를 나타내고, 그 순위가 숫자인 경우 아래 조건을 추가하거나 대신 사용할 수 있습니다.
            # wait.until(EC.text_to_be_present_in_element(first_data_cell_locator, "1")) # 첫 번째 셀에 '1'이 나타날 때까지 기다림
            
            # 선수 이름이 비어있지 않을 때까지 기다리는 것이 더 효과적일 수 있습니다.
            first_player_name_locator = (By.CSS_SELECTOR, "table.tData01.tt tbody tr:nth-child(1) td:nth-child(2) a")
            wait.until(EC.visibility_of_element_located(first_player_name_locator)) # 선수 이름 링크가 보일 때까지 기다림

            print("최종 테이블 로딩 완료 (Basic2 - 데이터 로딩 확인 포함)")

            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            table = soup.find('table', {'class': 'tData01 tt'})
            table_body = table.find('tbody')
            rows = table_body.find_all('tr')

            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 18:
                    continue

                rank_text = cols[0].get_text(strip=True)
                if not rank_text.isdigit():
                    continue

                player_name_tag = cols[1].find('a') 
                player_name = player_name_tag.get_text(strip=True) if player_name_tag else ''
                player_team = cols[2].get_text(strip=True)

                data = {
                    'Player_Name': player_name,
                    'Player_Team': player_team, 
                    'Earned_Run_Average': cols[3].get_text(strip=True),
                    'Complete_Game': cols[4].get_text(strip=True),
                    'Shutout': cols[5].get_text(strip=True),
                    'Quality_Start': cols[6].get_text(strip=True),
                    'Blown_Save': cols[7].get_text(strip=True),
                    'Total_Batters_Faced': cols[8].get_text(strip=True),
                    'Number_Of_Pitching': cols[9].get_text(strip=True),
                    'Opponent_Batting_Average': cols[10].get_text(strip=True),
                    '2Base': cols[11].get_text(strip=True),
                    '3Base': cols[12].get_text(strip=True),
                    'Sacrifice_Bunt': cols[13].get_text(strip=True),
                    'Sacrifice_Fly': cols[14].get_text(strip=True),
                    'IBB': cols[15].get_text(strip=True),
                    'Wild_Pitch': cols[16].get_text(strip=True),
                    'Balk': cols[17].get_text(strip=True)
                }
                player_data2.append(data)

            print(f"{team_name.upper()} Basic2 데이터 추출 완료. 현재까지 추출된 선수 수: {len(player_data2)}")

        except Exception as e:
            print(f"Basic2.aspx 크롤링 중 오류 발생 ({team_name.upper()} 팀): {e}")

    if player_data2:
        df2 = pd.DataFrame(player_data2)
        df2.drop_duplicates(subset=['Player_Name', 'Player_Team'], inplace=True)
        print(f"\n최종 df2 생성 완료. 행 수: {len(df2)}")
    else:
        print("\nBasic2.aspx에서 저장할 데이터가 없습니다.")
        df2 = pd.DataFrame()

    # ==================== DataFrame 병합 및 CSV 저장 ====================

    if not df1.empty and not df2.empty:
        print("\n--- 두 DataFrame 병합 시작 ---")
        merged_df = pd.merge(df1, df2.drop(columns=['Earned_Run_Average'], errors='ignore'),
                                 on=['Player_Name', 'Player_Team'], how='outer')

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

        if 'Innings_Pitched' in merged_df.columns:
            merged_df['Innings_Pitched'] = merged_df['Innings_Pitched'].astype(str)
            merged_df['Innings_Pitched'] = merged_df['Innings_Pitched'].apply(convert_innings_pitched)


        numeric_cols_float = [
            'Earned_Run_Average', 'Winning_Percentage',
            'WHIP', 'Opponent_Batting_Average'
        ]
        numeric_cols_int = [
            'Game_Num', 'Win', 'Lose', 'Save', 'Hold', 'Hits', 'Home_Run',
            'Base_On_Balls', 'Hit_By_Pitch', 'Strike_Out', 'Runs', 'Earned_Run',
            'Complete_Game', 'Shutout', 'Quality_Start', 'Blown_Save',
            'Total_Batters_Faced', 'Number_Of_Pitching', '2Base', '3Base',
            'Sacrifice_Bunt', 'Sacrifice_Fly', 'IBB', 'Wild_Pitch', 'Balk'
        ]

        for col in numeric_cols_float:
            if col in merged_df.columns:
                merged_df[col] = pd.to_numeric(merged_df[col], errors='coerce') 
        
        for col in numeric_cols_int:
            if col in merged_df.columns:
                merged_df[col] = pd.to_numeric(merged_df[col], errors='coerce').fillna(0).astype(int) 
        
        if 'Innings_Pitched' in merged_df.columns:
            merged_df['Innings_Pitched'] = pd.to_numeric(merged_df['Innings_Pitched'], errors='coerce')

        print("병합 및 데이터 타입 변환 완료.")

        initial_rows = len(merged_df)
        merged_df = merged_df[merged_df['Game_Num'] > 0]
        deleted_rows = initial_rows - len(merged_df)
        if deleted_rows > 0:
            print(f"Game_Num이 0인 {deleted_rows}개의 선수 데이터가 삭제되었습니다.")
        else:
            print("Game_Num이 0인 선수 데이터가 없습니다.")

        print(merged_df.head())
        print(f"최종 병합된 데이터의 행 수: {len(merged_df)}, 컬럼 수: {len(merged_df.columns)}")

        csv_filename = "2024_useGame_pitcher.csv"
        merged_df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"\n'{csv_filename}' 파일이 성공적으로 저장되었습니다.")

    else:
        print("\n데이터프레임이 비어있어 병합 및 CSV 저장 작업을 수행할 수 없습니다.")

finally:
    driver.quit()
    print("\n전체 크롤링 완료. 브라우저 종료됨")