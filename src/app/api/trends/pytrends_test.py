from pytrends.request import TrendReq

# Google Trends API 초기화
pytrends = TrendReq(hl='en-US', tz=360)

# 실시간 트렌드 가져오기
def get_realtime_trends():
    trending_searches = pytrends.trending_searches(pn='south_korea')  # 'south_korea'는 대한민국 트렌드
    return trending_searches

# 실행
realtime_trends = get_realtime_trends()
print("실시간 트렌드:")
print(realtime_trends.head(10))  # 상위 10개 트렌드 출력