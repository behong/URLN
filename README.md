
---

## ⚙️ 준비물

1. **Notion Integration 생성**
   - [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 에서 `New Integration` 생성
   - 권한: `Insert content`, `Update content`
   - 생성 후 발급되는 **Internal Integration Token**(`secret_...`) 복사

2. **Notion Database 준비**
   - Notion에서 Table/Board/List 형식 DB 생성
   - 속성 추가:
     - `Title` (title)
     - `URL` (url)
     - `Notes` (rich_text)
   - DB를 열고 **주소창 URL**에서 Database ID 추출  
     ```
     https://www.notion.so/.../210d43b113c280a382c0ded85e265a3c?v=...
     ```
     👉 `210d43b113c280a382c0ded85e265a3c` 부분이 Database ID
   - DB → **Share → Invite**에서 생성한 Integration 초대 (권한: Can edit)

3. **Vercel 환경 변수 등록**
   - 프로젝트 → Settings → Environment Variables
   - `NOTION_TOKEN = secret_...`
   - `NOTION_DATABASE_ID = 210d43b113c280a382c0ded85e265a3c`

---

## 🖥️ 사용법

1. **로컬 테스트**
   - `index.html`을 브라우저로 열고
   - URL/제목/메모 입력 후 `노션으로 전송` 클릭
   - 성공 시 Notion DB에 새 항목 생성 확인

2. **GitHub Pages 배포**
   - 저장소에 `index.html` 커밋/푸시
   - GitHub → Repository → **Settings → Pages**
   - **Source** → `Deploy from a branch` 선택
   - Branch: `main` (또는 배포할 브랜치) / Root 경로 선택
   - **Save** → 잠시 후 `https://<username>.github.io/<repository>/` 주소에서 접속 가능

---

## 📑 API 명세

### Endpoint
