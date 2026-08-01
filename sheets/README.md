# LENA Agency · For sales 도서 구글시트 연동

시트를 편집하면 **홈 · For sales 목록 · 상세**에 반영됩니다. (약 30–60초, 새로고침 시 즉시)

## 1. 시트 만들기

1. `LENA-For-Sales-Titles.xlsx` 를 [Google Drive](https://drive.google.com)에 업로드  
2. 우클릭 → **Google 스프레드시트로 열기**  
3. **공유** → 일반 액세스 → **링크가 있는 모든 사용자** → **뷰어**

> 뷰어 공개가 안 되면 사이트 서버가 CSV를 받지 못합니다. (로그인 HTML만 내려옴)

## 2. 사이트 연결

주소창 예시:

```
https://docs.google.com/spreadsheets/d/  【여기가_ID】  /edit#gid=0
```

프로젝트 루트에 `.env.local` 생성:

```bash
# 방법 A — 시트 ID
GOOGLE_SHEETS_ID=여기에_스프레드시트_ID
GOOGLE_SHEETS_GID=0

# 방법 B — CSV URL 전체 (Titles 탭 gid 확인)
# GOOGLE_SHEETS_EXPORT_CSV_URL=https://docs.google.com/spreadsheets/d/ID/export?format=csv&gid=0
```

개발 서버 재시작:

```bash
npm run dev
```

### Vercel 배포

1. Project → **Settings** → **Environment Variables**  
2. `GOOGLE_SHEETS_ID` (및 필요 시 `GOOGLE_SHEETS_GID`) 추가  
3. **Redeploy**

## 2-1. 카테고리 (Categories 탭)

`Categories` 시트 행이 **홈 · For sales 필터 칩**에 그대로 반영됩니다.

| 열 | 예시 |
|----|------|
| `id` | `fiction` (영문, 도서 **Titles → category** 열과 동일) |
| `label_en` | Fiction |
| `label_ko` | 소설 |

현재 id 목록 예:  
`fiction` · `nonfiction` · `business-selfhelp` · `science-technology` · `history-biography` · `arts` · `lifestyle` · `health` · `parenting` · `picturebook` · `children-fiction` · `children-nonfiction` · `children-selphelp` · `comics`

환경변수: `GOOGLE_SHEETS_CATEGORIES_GID` (기본 `1347612289`) · `GOOGLE_SHEETS_CATEGORIES_TAB=Categories`

### Titles 탭 category (다중 선택)

구글 시트 **기본 드롭다운은 1개만** 고를 수 있습니다. 여러 카테고리는 아래를 쓰세요.

**방법 A — 메뉴 체크박스 (권장)**  
1. `sheets/apps-script-for-sales-ALL.gs` 전체를 Apps Script에 붙여넣기 → 저장  
2. `installLenaMenu` 실행 → 시트 새로고침  
3. Titles **category** 셀 클릭  
4. 메뉴 **LENA → ★ 카테고리 다중 선택 (현재 셀)**  
5. 원하는 항목 체크 → **적용**  
   → 셀에 `parenting,nonfiction` 형태로 저장  

**방법 B — 직접 입력**  
`parenting,nonfiction` (쉼표 구분, Categories 탭의 **id** 그대로)

사이트 필터도 카테고리 **여러 개 선택** 가능합니다.

## 3. 도서 추가

`Titles` 시트 맨 아래 행에 입력:

| 열 | 예시 | 필수 |
|----|------|------|
| `id` | `my-new-book` (영문·하이픈, URL용) | ✅ |
| `titleKo` | 한국어 제목 | ✅ |
| `title` | 영문 제목 | 권장 |
| `author` / `authorEn` | **저자 1** (한글 / 영문) | ✅ / 권장 |
| `author2` / `author2En` | **저자 2** (공저자, 같은 책에 2명일 때) | 선택 |
| `authorBio` / `authorBioKo` | 저자 1 소개 (영문 / 한글) | 권장 |
| `authorBio2` / `authorBio2Ko` | 저자 2 소개 | 선택 |
| `category` | `practical` / `fiction` / … | ✅ |
| `synopsisKo` | 소개 | 권장 |
| `cover` | 표지 이미지 (아래 참고) | 선택 |

### 공저자 2명 (같은 책)

한 책에 저자가 **두 명**이면 **한 셀에 합치지 말고** 열을 나눕니다.

| 열 | 역할 |
|----|------|
| `author` | 저자 1 한글 |
| `authorEn` | 저자 1 영문 |
| `author2` | 저자 2 한글 |
| `author2En` | 저자 2 영문 |
| `authorBio` / `authorBioKo` | 저자 1 소개 |
| `authorBio2` / `authorBio2Ko` | 저자 2 소개 |

- 사이트에서 **각 이름**을 따로 클릭 → 각자 저자소개 페이지  
- 목록: `/export/authors`  
- 메뉴 **LENA → 저자 2열·저자소개 열 추가** 로 없는 열 자동 생성

### 제목·소개 서식 (볼드 / 이탤릭 / 글자색)

사이트 **도서 상세**(`synopsis` · `coverCopy`)와 **저자 페이지**(`authorBio` · `authorBio2`)에  
시트 서식이 반영됩니다. (CSV는 툴바 서식을 그대로 못 가져오므로 HTML로 한 번 변환 필요)

**방법 A — 시트에서 툴바 서식 후 메뉴 변환 (권장)**

1. Titles 셀에서 글자 일부 **굵게 / 기울임 / 글자색** 적용  
2. `sheets/apps-script-for-sales-ALL.gs` (또는 `apps-script-for-sales-rich-text.gs`) 를 Apps Script에 붙여넣기  
3. 시트 메뉴 **LENA → 서식을 HTML로 변환 (Titles)** 실행  
4. 사이트 강력 새로고침 (⌘⇧R)  

적용 열: `title`, `titleKo`, `synopsis`, `synopsisKo`, `coverCopy`, `coverCopyKo`,  
`authorBio`, `authorBioKo`, `authorBio2`, `authorBio2Ko`

**방법 B — 셀에 직접 마크업 입력**

| 효과 | 입력 예 |
|------|---------|
| 굵게 | `**중요 구절**` 또는 `<b>중요 구절</b>` |
| 기울임 | `*강조*` 또는 `<i>강조</i>` |
| 글자색 | `{#c41e3a}빨간 글자{/}` 또는 `[color=#c41e3a]빨간 글자[/color]` |
| `preview1` ~ `preview4` | 본문 미리보기 이미지 3–4장 | 선택 |
| `published` | `TRUE` (공개) / `FALSE` (숨김) | 기본 공개 |
| `featured` | `TRUE` → 홈 추천 | |
| `new` | `TRUE` | |

### 표지(`cover`) · 본문 미리보기(`preview1`–`4`) 넣는 법

| 방식 | 예시 | 비고 |
|------|------|------|
| 사이트 파일 | `/covers/my-book.png` | `public/covers/`에 파일 넣은 뒤 |
| **Google Drive (권장)** | 파일 **공유 링크** 그대로 붙여넣기 | 코드가 자동으로 이미지 주소로 변환 |
| 직접 이미지 URL | `https://…/page1.jpg` | imgur, CDN 등 실제 이미지 주소 |

**Drive 사용 시 꼭 할 일**

1. Drive에 **이미지 파일(PNG/JPG)** 업로드 (폴더·PDF 미리보기 링크는 불가)  
2. **공유** → **링크가 있는 모든 사용자** → **뷰어**  
3. **링크 복사** 후 시트에 붙여넣기  
   - 표지 → `cover`  
   - 본문 1~4장 → `preview1` … `preview4`  
4. 사이트 **강력 새로고침** (Mac: `Cmd+Shift+R`)

⚠️ `/view` 공유 링크 그대로 써도 됩니다. 사이트가 이미지 주소로 바꿉니다.

**본문 미리보기 UI:** 수출 상세 페이지에서 **표지 아래**에 작은 썸네일이 보이고, 클릭하면 3–4장을 크게 넘겨 봅니다.  
열에 값이 하나도 없으면 미리보기 영역은 숨겨집니다.

#### 기존 시트에 preview 열 추가 (1회) — 꼭 필요

지금 라이브 시트에 `preview1`~`4`가 없으면 사이트에 본문 미리보기가 **절대 안 뜹니다.**  
(표지 `cover`만으로는 본문 미리보기가 생기지 않습니다.)

**수동 (30초, 가장 쉬움)**

1. [For sales 시트](https://docs.google.com/spreadsheets/d/1RbwRq0NqcSMcN99nZ_JcOZOjN_ZzXEaXwrPGiJrLjYI/edit) → **Titles** 탭  
2. 1행에서 **`cover` 열 오른쪽**을 우클릭 → **열 4개 삽입**  
3. 새 1행 칸에 순서대로 입력 (영문 그대로):

```
preview1
preview2
preview3
preview4
```

4. 각 도서 행에 Drive **공유 링크**(링크 있는 모든 사용자 · 뷰어) 붙여넣기  
5. 사이트에서 `Cmd+Shift+R` 강력 새로고침  
6. 확인: http://localhost:3000/api/export-titles 에서 해당 책의 `"previewImages": ["https://…"]` 가 보여야 함  

**Apps Script**

1. 시트 → **확장 프로그램 → Apps Script**  
2. `sheets/apps-script-for-sales-categories.gs` 전체 붙여넣기 → 저장  
3. 함수 **`ensurePreviewColumnsOnTitles`** 실행  

**로컬 파일 (시트 없이 테스트)**

```
public/previews/{도서id}/1.png
public/previews/{도서id}/2.png
public/previews/{도서id}/3.png
public/previews/{도서id}/4.png
```

예: `public/previews/teacher-speech-skills/1.png`

(선택) 한 칸에 여러 URL: `preview` 열에 줄바꿈 또는 `|` 로 구분해도 인식합니다.

카테고리 허용값: Categories 탭의 `id` (예: `fiction`, `practical`, `parenting` …)

**1행 영문 헤더는 수정하지 마세요** (`preview1` 등 새 열 이름만 추가).

## 4. 확인

- 브라우저: http://localhost:3000/api/export-titles  
  - `"source": "google_sheets"` 이면 연동 성공  
  - `"source": "static"` 이면 폴백 (시트 미설정·비공개·빈 시트)

## 파일

| 파일 | 설명 |
|------|------|
| `LENA-For-Sales-Titles.xlsx` | 업로드용 템플릿 + 현재 도서 시드 |
| `사용법` 시트 | 시트 안 안내 |
| `Titles` 시트 | 실제 데이터 |
| `Categories` / `열설명` | 참고용 |
