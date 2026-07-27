# LENA Agency — Brand & email signature

사이트 디자인 시스템과 맞춘 로고·이메일 서명 자산입니다.

| Token | Value | 용도 |
|-------|--------|------|
| Coral | `#c41e3a` | Agency, 링크, 액센트 |
| Ink | `#1f1c19` | LENA, 본문 |
| Muted | `#8a837c` | 보조 텍스트 |
| Paper | `#faf8f5` | 마크 배경 |
| Line | `#e8e2da` | 구분선 |

## Files

```
brand/
  logo-email.svg              서명용 가로 (마크 + 워드마크)
  logo-horizontal.svg         워드마크 + 레나에이전시
  logo-horizontal-en.svg      영문만
  logo-mark.svg               사각 마크 (L + 책등 액센트)
  logo-mark-coral.svg         다홍 배경 마크 (아바타)
  png/                        PNG 내보내기
  signature-preview.html      브라우저 프리뷰 + 커스터마이즈
  signature-gmail.html        Gmail 붙여넣기용 HTML
  export-pngs.mjs             SVG → PNG
```

배포 시 서비용: `public/brand/*.png` (export 스크립트가 복사)

## PNG 생성

```bash
cd ~/Desktop/lena-agency-next
export PATH="$HOME/.local/node/bin:$PATH"
node brand/export-pngs.mjs
```

## 서명 넣기 (Gmail)

1. `signature-preview.html` 을 브라우저로 열어 이름·직함 확인
2. `png/logo-email.png` 를 **공개 URL**에 업로드  
   - 사이트 배포 후: `https://<도메인>/brand/logo-email.png`
3. `signature-gmail.html` 에서 `YOUR-LOGO-URL` 을 그 URL로 교체
4. 테이블 전체 복사 → Gmail → 설정 → 서명

> 로컬 파일 경로(`file://…`)나 베이스64는 Gmail/Outlook에서 깨지거나 수신자에게 안 보이는 경우가 많습니다. **반드시 호스팅된 PNG URL**을 쓰세요.

## 이름·직함

기본값은 `Lena Park` / `Literary Rights Agent` 입니다.  
`signature-preview.html` 또는 `signature-gmail.html` 에서 수정하세요.
