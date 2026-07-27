# Vercel 배포 실패 해결 — "no functions or static directory"

이 경고는 **Next.js 앱을 일반 정적 사이트로 배포**했을 때 자주 납니다.

```
Build output contains no "functions" or "static" directory
```

## 원인

Vercel이 Framework를 **Next.js**가 아니라 **Other**로 잡으면  
`static/` / `functions/` 폴더를 찾습니다.  
Next.js 빌드 결과(`.next`)는 그 형식이 아니라서 실패합니다.

## 올바른 프로젝트

반드시 이 폴더를 배포하세요:

```
~/Desktop/lena-agency-next
```

❌ `~/Desktop/lena-agency` (예전 HTML 정적 사이트)  
✅ `~/Desktop/lena-agency-next` (Next.js)

---

## 고치는 방법 (Vercel 대시보드)

### 1. 프로젝트 Settings

1. [vercel.com](https://vercel.com) → 해당 프로젝트  
2. **Settings → General**  
3. **Framework Preset** → **Next.js** 선택 후 Save  

### 2. Build & Output (중요)

**Settings → Build and Deployment** (또는 General 하단):

| 항목 | 설정 |
|------|------|
| Framework Preset | **Next.js** |
| Root Directory | **비움** 또는 `.` (모노레포가 아니면) |
| Build Command | `npm run build` 또는 **비움(기본값)** |
| Output Directory | **반드시 비움 / Override 끄기** |
| Install Command | `npm install` 또는 기본값 |

⚠️ **Output Directory에 `.next` 또는 `out` 또는 `dist`를 넣지 마세요.**  
Next.js는 Vercel이 알아서 처리합니다.

### 3. 다시 배포

**Deployments → … → Redeploy**  
또는 코드를 다시 push / `npx vercel --prod`

---

## CLI로 다시 배포

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/Desktop/lena-agency-next

# 잘못된 링크가 있으면 제거 후 재연결
rm -rf .vercel

npx vercel
# Framework: Next.js 확인
# Output Directory 물어보면 Enter (비움)

npx vercel --prod
```

---

## GitHub 연동 시 Root Directory

저장소 루트가 `lena-agency-next` 안 내용이면 Root Directory 비움.  
상위 폴더에 여러 프로젝트가 있으면 Root Directory를 `lena-agency-next`로 지정.

---

## 확인 체크리스트

- [ ] 배포 대상이 `lena-agency-next` 인가?  
- [ ] Framework = **Next.js** 인가?  
- [ ] Output Directory가 **비어 있는가?**  
- [ ] 로컬 `npm run build` 성공하는가?  
- [ ] `vercel.json`에 `"framework": "nextjs"` 가 있는가? (이 프로젝트에 포함됨)

성공하면 주소가 `https://xxx.vercel.app` 형태로 열리고,  
`/`, `/about`, `/contact`, `/api/contact` 가 동작합니다.
