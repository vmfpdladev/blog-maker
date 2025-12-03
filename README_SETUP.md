# 설정 가이드

## 1. Python 및 pytrends 설치

Google Trends 데이터를 가져오기 위해 Python과 pytrends 라이브러리가 필요합니다.

### Windows:
```bash
# Python이 설치되어 있는지 확인
python --version

# pytrends 설치
pip install pytrends
```

### macOS/Linux:
```bash
# Python이 설치되어 있는지 확인
python3 --version

# pytrends 설치
pip3 install pytrends
```

또는 `requirements.txt`를 사용:
```bash
pip install -r requirements.txt
```

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Unsplash API (선택사항 - 이미지용)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

### API 키 발급 방법:

1. **Gemini API**: https://makersuite.google.com/app/apikey
2. **Unsplash API**: https://unsplash.com/developers (선택사항 - API 키가 없어도 placeholder 이미지 사용 가능)

## 3. 실행

```bash
# 개발 서버 실행
npm run dev
```

## 주의사항

- pytrends는 Google Trends의 비공식 API를 사용하므로, 과도한 요청 시 일시적으로 차단될 수 있습니다.
- Unsplash API 키가 없어도 이미지 기능은 작동하지만, placeholder 이미지를 사용합니다.








