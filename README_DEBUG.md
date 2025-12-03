# 디버깅 가이드

## API 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. API 엔드포인트 테스트

브라우저에서 접속:
```
http://localhost:3000/api/trends
```

또는 Node.js로 테스트:
```bash
node test-api.js
```

### 3. Python 스크립트 직접 테스트
```bash
node test-python-script.js
```

## 디버그 로그 확인

### 서버 콘솔에서 확인할 수 있는 로그:

1. **API 시작 로그**
   - `[API] ===== Starting Google Trends fetch =====`
   - 플랫폼, 작업 디렉토리 정보

2. **Python 실행 로그**
   - `[API] Python script path: ...`
   - `[API] Using Python command: ...`
   - `[API] Executing command: ...`

3. **Python 스크립트 디버그 로그**
   - `[PYTHON DEBUG]` 접두사로 시작하는 모든 로그
   - 스크립트 실행 단계별 정보

4. **결과 로그**
   - 성공: `[API] ===== Successfully fetched trends in X ms =====`
   - 실패: `[API] ===== Error after X ms =====`

## 일반적인 문제 해결

### 문제 1: Python을 찾을 수 없음
**증상**: `Python not found` 오류

**해결책**:
1. Python 설치 확인: https://www.python.org/
2. PATH 환경 변수에 Python 추가
3. Windows: `python` 명령어가 작동하는지 확인
4. Unix/Mac: `python3` 명령어가 작동하는지 확인

### 문제 2: pytrends 라이브러리 없음
**증상**: `pytrends library not installed` 오류

**해결책**:
```bash
pip install pytrends
# 또는
pip3 install pytrends
```

### 문제 3: Google Trends API 오류
**증상**: `No trends found` 또는 네트워크 오류

**해결책**:
- pytrends는 비공식 API이므로 Google의 정책 변경에 따라 작동하지 않을 수 있습니다
- 과도한 요청 시 일시적으로 차단될 수 있습니다
- 이 경우 mock 데이터가 자동으로 반환됩니다

## 로그 레벨

- `[API]`: Next.js API 라우트 로그
- `[PYTHON DEBUG]`: Python 스크립트 디버그 로그
- `[PYTHON WARNING]`: Python 스크립트 경고
- 일반 `console.log`: 추가 정보

## 응답 헤더 확인

API 응답 헤더에서 다음을 확인할 수 있습니다:
- `X-Trends-Error`: 오류 메시지 (있는 경우)
- `X-Trends-Source`: 데이터 소스 (`pytrends` 또는 `mock-fallback`)








