# 인세보고 ↔ 계약목록 연동

데이터 소스: Google Drive **「계약목록」**  
시트 ID: `1YqGUGhG3k7mAencYCVzusWpUqEQ8ZFyt8fey1PFEH7k`  
탭: **rights** (판권/인세) · co-pro 는 별도

## 웹에서 인세 입력 (쓰기)

로그인 후 각 행 **「입력」** → 판매부수·로열티 등 입력 → **인세보고 저장**

시트에 쓰려면 Apps Script 웹 앱이 필요합니다 (뷰어 공개만으로는 쓰기 불가).

1. 계약목록 시트 → **확장 프로그램 → Apps Script**
2. `sheets/apps-script-royalty-write.gs` 내용 붙여넣기  
3. `SCRIPT_SECRET` 을 `.env` 의 `GOOGLE_CONTRACTS_WRITE_SECRET` 과 동일하게  
4. **배포 → 새 배포 → 웹 앱**  
   - 실행: 나 / 액세스: **모든 사용자**
5. URL을 환경변수에:

```env
GOOGLE_CONTRACTS_WRITE_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_CONTRACTS_WRITE_SECRET=lena-royalty-write-secret
```

저장 시 반영 컬럼: Z~AI (전년도 재고, 2025 인쇄·증정파기·판매, 누적, 재고, 로열티, 선인세 잔여, 초과 로열티, 비고)

## 읽기 동작

1. **라이브 시트** CSV (`GOOGLE_CONTRACTS_SHEETS_ID`)  
   - **「링크 있는 모든 사용자 · 뷰어」** → 자동 반영  
2. 실패 시 → **`data/contracts-cache.json`**  
   - `npm run sync-contracts` 로 갱신

## 캐시 다시 받기 (시트 수정 후)

1. Drive에서 계약목록을 `.xlsx` 로 다운로드 (또는 기존 다운로드 파일 사용)
2. 프로젝트에서:

```bash
npm run sync-contracts
# 또는 경로 지정
npm run sync-contracts -- "/Users/you/Downloads/계약목록.xlsx"
```

## 실시간 자동 반영 (권장 설정)

1. [계약목록 시트](https://docs.google.com/spreadsheets/d/1YqGUGhG3k7mAencYCVzusWpUqEQ8ZFyt8fey1PFEH7k/edit) 열기  
2. **공유 → 일반 액세스 → 링크가 있는 모든 사용자 · 뷰어**  
3. `.env` / Vercel:

```env
GOOGLE_CONTRACTS_SHEETS_ID=1YqGUGhG3k7mAencYCVzusWpUqEQ8ZFyt8fey1PFEH7k
GOOGLE_CONTRACTS_GID=0
```

URL은 서버에만 있고, API는 **로그인 후에만** 데이터를 내려줍니다.  
(완전 비공개 + 서비스 계정은 추후 가능)

## rights 탭 주요 컬럼 (사이트 표시)

| 시트 컬럼 | 화면 |
|-----------|------|
| (A) 파일번호 | 파일 |
| 제목(title) | 도서 |
| 출판사(publisher) | 출판사 · **회원 org 필터** |
| 저작권사 | 저작권사 |
| 인세율 | 인세율 |
| 2025 판매부수 | 2025 판매 |
| 누적 판매부수 | 누적 판매 |
| 2025 로열티 발생금액 | 2025 로열티 |
| 선인세 잔여금액 | 선인세 잔여 |
| 초과 로열티 발생금액 | 초과 로열티 |
| 출간일 | 출간일 |
| 계약 진행상황 | 진행상황 |

## 회원 역할 · org 매칭

| role | 권한 | org 매칭 컬럼 |
|------|------|----------------|
| `admin` | 전체 조회 · 입력 · 엑셀 | — |
| `publisher` (또는 레거시 `partner`) | 조회 · **인세 입력** · 엑셀 | **출판사** |
| `rights_holder` | **조회 전용** · 엑셀 다운로드 | **저작권사** |

예: `role=publisher`, `org=전나무숲` → `전나무숲(Firforest)` 계약  
예: `role=rights_holder`, `org=Chelsea Green` → 저작권사 열 매칭 행만

엑셀 컬럼 헤더는 영어 (Korean Title 값만 한글).  
API: `GET /api/royalties/export`

## 데모 로그인 (로컬 `.env.local`)

| 이메일 | 비밀번호 | 역할 · 범위 |
|--------|----------|-------------|
| lena.lenaagency@gmail.com | lena-admin-demo | 관리자 · 전체 |
| demo@firforest.com | demo1234 | 출판사 · 전나무숲 |
| demo@bookmentor.com | demo1234 | 출판사 · 북멘토 |
| demo@chelseagreen.com | demo1234 | 저작권사 · Chelsea Green (조회+엑셀) |
