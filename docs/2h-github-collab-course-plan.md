# 🎓 2시간 GitHub 협업 실전 강의 — 제작 기획안

> **한 저장소 `team-recipes`** 를 처음부터 끝까지 키우며 배우는 **실습형** 강의. 모든 챕터에 **따라하기 예시 + 직접 하는 실습 과제(+정답·자가검증)**. 플랫폼 중립(구독 CTA 없음).

**총 길이:** 약 120분 · **8개 챕터 = 8개 섹션** (섹션별 렌더 후 합치기 → 한 챕터만 수정·재렌더 가능)

**제작 스택:** 본 프로젝트의 AI 영상 팩토리 — 내레이션 `shainvoice01`, 챕터별 템플릿(slides/montage/gitgraph), `node factory/build.mjs <id>` → `node factory/render.mjs <id> --only <섹션>`.

## 한눈에 보기

| # | 챕터 | 분 | 템플릿 | 핵심 실습 |
|---|---|---|---|---|
| 1 | 오리엔테이션 & 큰 그림: Git vs GitHub, 그리고 team-recipes | 10 | 혼합 | 내 학습 환경이 준비됐는지 직접 확인하고, 나만의 team-recipes 아이디어 … |
| 2 | GitHub 계정 & gh CLI 셋업 | 15 | 슬라이드(키노트) | 본인 OS에 gh CLI를 설치하고 gh auth login으로 GitHub에 로그… |
| 3 | 인증 & 토큰(PAT): team-recipes에 안전하게 연결하기 | 12 | 슬라이드(키노트) | 본인 team-recipes 저장소에 한정된 fine-grained PAT를 직접 … |
| 4 | 첫 레포지토리 & 기본 워크플로우 | 18 | 슬라이드(키노트) | team-recipes에 첫 진짜 레시피 recipes/kimchi-stew.md를… |
| 5 | 협업자 초대 & 권한: team-recipes를 진짜 팀 저장소로 | 12 | 슬라이드(키노트) | 당신의 team-recipes에 두 번째 계정(또는 친구/포크용 서브 계정)을 협업… |
| 6 | 브랜치 &amp; git tree 시각화 | 18 | 이론 시각화(3b1b) | main을 건드리지 않고 feature/add-kimchi-jjigae 브랜치를 새… |
| 7 | PR 협업 + 코드리뷰 + 충돌 해결 | 20 | 혼합 | team-recipes에서 '김치찌개 레시피' PR을 직접 올리고, 같은 줄을 양쪽… |
| 8 | 브랜치 전략 + 실전 시나리오 + 마무리 | 15 | 혼합 | team-recipes에 '리뷰 규칙' 한 가지를 추가하는 두 번째 기여를, 배운 … |

> **깃 동작원리 시각화:** 6장(브랜치 & git tree)과 7장(PR·머지·충돌)의 커밋 트리/머지/리베이스/워크트리는 **3Blue1Brown 스타일 `gitgraph` 템플릿**(`GitGraphVideo`, 데모 `demo-gitgraph`)으로 그래프 애니메이션 처리합니다.

---

## 챕터 1. 오리엔테이션 & 큰 그림: Git vs GitHub, 그리고 team-recipes

**⏱ 10분 · 🎨 혼합**

**학습 목표:** Git과 GitHub의 차이와 협업에 GitHub를 쓰는 이유를 이해하고, 강의 로드맵과 team-recipes 예제를 파악한 뒤 내 학습 환경(git/계정)이 준비됐는지 직접 점검한다.

### 📚 강의 흐름

**1. 동기부여 훅 (montage)**

'마지막_진짜최종_v3_이거진짜최종.zip' 폴더, 카톡으로 파일 주고받기, 누가 뭘 고쳤는지 모르는 혼돈 — 이게 협업 없이 일할 때의 현실입니다. 이 강의를 다 들으면 이 모든 걸 GitHub 하나로 깔끔하게 해결합니다.
- 🖥 화면: AI 이미지 빠른 컷 몽타주: 뒤죽박죽 파일명들, 충돌하는 두 사람, 카톡 파일 전송 화면, 마지막에 깔끔한 GitHub PR 화면으로 전환
- ⚠️ 함정: 훅을 너무 길게 끌지 말 것 — 30초 안에 '아 내 얘기다' 공감만 주고 본론으로 넘어간다.

**2. Git vs GitHub 차이**

Git은 내 컴퓨터에서 돌아가는 '버전 관리 프로그램'이고, GitHub는 그 Git 저장소를 인터넷에 올려 함께 보는 '웹 서비스'입니다. Git은 도구, GitHub는 그 도구를 올려두는 클라우드 공간이라고 기억하세요.

```bash
git --version
```
- 🖥 화면: 슬라이드: 왼쪽 '내 노트북 = Git(로컬 버전관리)' 아이콘, 오른쪽 '클라우드 = GitHub(원격 저장+협업)' 아이콘, 가운데 push/pull 화살표
- ⚠️ 함정: Git == GitHub 라고 착각하기 쉽다. Git 없이도 파일은 GitHub에 올라가지만, 둘은 별개이며 Git이 없으면 협업 흐름이 성립하지 않는다는 점을 분명히 한다.

**3. 왜 협업엔 GitHub인가 (혼자 vs 팀)**

혼자면 '내 폴더에 git만' 써도 됩니다. 하지만 팀이 되면 누가·언제·무엇을 바꿨는지 추적하고, 제안(PR)으로 검토하고, 충돌을 안전하게 합치는 '공통 공간'이 필요한데 그게 GitHub입니다.
- 🖥 화면: 슬라이드 비교표: [혼자] 로컬 git, 백업만 / [팀] 원격 저장소·브랜치·PR·리뷰·이슈 — 오른쪽 열에 체크가 더 많이 채워지는 애니메이션
- ⚠️ 함정: GitHub를 '단순 파일 백업'으로만 소개하면 안 된다. 핵심 가치는 백업이 아니라 '변경 제안·리뷰·병합' 협업 워크플로다.

**4. 강의 로드맵 (theory: 미리보기 트리)**

이 강의는 한 저장소 team-recipes를 처음부터 끝까지 키웁니다: 저장소 생성 → 동료 초대 → 브랜치 → PR → 충돌 → 병합 → 전략. 각 챕터가 같은 저장소를 한 단계씩 전진시킵니다.
- 🖥 화면: theory 스타일 커밋/브랜치 트리 미리보기: 한 줄의 main에서 가지가 뻗어 PR로 다시 합쳐지는 흐름을 챕터 번호 라벨과 함께 그려 보여준다
- ⚠️ 함정: 로드맵에서 명령어를 미리 다 가르치려 하지 말 것 — 여기선 '전체 그림'만, 디테일은 각 챕터에서.

**5. team-recipes 예제 소개**

예제는 코드가 아니라 Markdown 레시피 모음 'team-recipes'입니다. 코드 문법이 아니라 Git/GitHub 동작에 집중하기 위해서예요. 두 번째 인물 '동료'가 함께 레시피를 추가하며 협업을 연습합니다.
- 🖥 화면: 슬라이드: team-recipes 폴더 구조 목업 (README.md, recipes/kimchi-jjigae.md ...) 와 '나'+'동료' 두 아바타
- ⚠️ 함정: 예제를 거창하게 만들지 말 것. 레시피 한 줄짜리 Markdown이면 충분 — 복잡한 예제는 Git 학습을 방해한다.

**6. 학습 환경 점검 (실습 준비)**

본격 실습 전에 두 가지만 확인합니다: 내 컴퓨터에 git이 설치돼 있는지, 그리고 GitHub 계정이 있는지. 없으면 지금 만들어 둡니다.

```bash
git --version
gh --version
gh auth status
```
- 🖥 화면: 슬라이드 체크리스트: [ ] git 설치 확인  [ ] GitHub 계정 보유  [ ] gh CLI 설치(선택, 다음 챕터 권장)
- ⚠️ 함정: gh auth status가 'not logged in'이어도 정상이다 — 로그인은 다음 챕터에서 한다. 여기선 설치 여부만 본다. git 명령이 'command not found'면 git을 먼저 설치해야 한다.

### 🧑‍🏫 따라하기 예시

강사가 화면에서 학습 환경이 준비됐는지 점검하고, team-recipes 작업을 담을 로컬 폴더와 아이디어 메모를 만들어 앞으로의 빌드를 위한 출발점을 잡습니다. (저장소 '생성'은 2장에서 하고, 1장은 환경+아이디어까지만 전진합니다.)

1. git --version  → 예상 출력: 'git version 2.39.0' 같은 버전 문자열이 뜨면 git 설치 완료 (2.4x 이상이면 충분, git switch 사용 가능)
2. gh --version  → 예상 출력: 'gh version 2.x.x (...)' 가 뜨면 GitHub CLI 준비 완료. 'command not found'면 다음 챕터 전에 https://cli.github.com 에서 설치해 둔다
3. gh auth status  → 예상 출력: 아직 로그인 전이면 'You are not logged into any GitHub hosts'가 정상. 이미 로그인했다면 'Logged in to github.com as <내아이디>'가 보인다
4. mkdir team-recipes  → 결과: 앞으로 강의 내내 키울 프로젝트 폴더가 만들어진다 (아직 git 저장소 아님)
5. cd team-recipes  → 결과: 프롬프트가 team-recipes 폴더로 이동한다
6. printf '# team-recipes\n\n우리 팀이 함께 모으는 레시피 모음입니다.\n' > README.md  → 결과: README.md 파일에 제목 한 줄이 적힌다
7. printf '## 아이디어\n- 김치찌개 (담당: 나)\n- 계란말이 (담당: 동료)\n' > IDEAS.md  → 결과: 협업 아이디어 메모 IDEAS.md 가 생긴다
8. ls  → 예상 출력: 'IDEAS.md  README.md' 두 파일이 보이면 출발점 준비 완료

**→ 결과:** git/계정 점검이 끝나고, README.md와 IDEAS.md를 담은 team-recipes 로컬 폴더가 생긴다. 2장에서 이 폴더를 git 저장소로 초기화하고 GitHub에 올릴 준비가 된 상태.

### ✍️ 실습 과제

**목표:** 내 학습 환경이 준비됐는지 직접 확인하고, 나만의 team-recipes 아이디어 메모를 만들어 강의 빌드의 출발점을 잡는다.

**진행:**
1. 터미널을 열고 git이 설치돼 있는지 버전을 확인한다
2. GitHub 계정이 있는지 확인한다 (없으면 github.com에서 무료 가입 — 이메일 인증까지 완료). gh CLI가 설치돼 있다면 로그인 상태도 확인해 본다
3. team-recipes 라는 폴더를 만들고 그 안으로 들어간다
4. README.md 에 저장소를 한 줄로 소개하고, IDEAS.md 에 내가 팀과 모으고 싶은 레시피 3개와 '담당: 나 / 동료'를 적는다
5. 폴더 안에 두 파일이 잘 생겼는지 목록으로 확인한다

<details><summary>정답 보기</summary>

```bash
git --version
gh auth status
mkdir team-recipes
cd team-recipes
printf '# team-recipes\n\n나의 팀 레시피 모음입니다.\n' > README.md
printf '## 아이디어\n- 김치찌개 (담당: 나)\n- 계란말이 (담당: 동료)\n- 된장국 (담당: 나)\n' > IDEAS.md
ls
```

</details>

**✅ 자가검증:** ls 실행 시 'IDEAS.md README.md' 두 파일이 보이고, git --version 이 2.4x 이상 버전을 출력하면 성공. (gh auth status 가 'not logged in'이어도 1장에선 정상)

### ✅ 핵심 정리

- Git = 내 컴퓨터의 버전 관리 도구, GitHub = 그 저장소를 올려 함께 협업하는 웹 서비스 — 둘은 다르다
- 협업의 핵심 가치는 단순 백업이 아니라 변경 제안(PR)·리뷰·안전한 병합이다
- 이 강의는 team-recipes 한 저장소를 생성→초대→브랜치→PR→충돌→병합→전략 순으로 끝까지 키운다
- 실습 전 git 설치(2.4x+)와 GitHub 계정만 갖춰지면 출발 준비 끝 — gh 로그인은 2장에서

---

## 챕터 2. GitHub 계정 & gh CLI 셋업

**⏱ 15분 · 🎨 슬라이드(키노트)**

**학습 목표:** GitHub 계정과 2FA를 안전하게 만들고, 본인 OS에 맞는 git·gh CLI를 설치해 gh auth login으로 터미널에서 GitHub에 로그인된 상태를 갖춘다.

### 📚 강의 흐름

**1. 왜 gh CLI인가 (인트로 훅)**

앞으로 team-recipes 레시피 저장소를 만들고 동료와 협업하려면, 매번 브라우저를 열 필요 없이 터미널에서 GitHub를 직접 다룰 수 있어야 합니다. 그 핵심 도구가 gh CLI이고, 이번 챕터에서 계정부터 로그인까지 한 번에 끝냅니다.
- 🖥 화면: 왼쪽 '브라우저로 클릭클릭' vs 오른쪽 '터미널 한 줄 gh repo create' 비교 슬라이드. 오른쪽에 코랄 강조.
- ⚠️ 함정: gh(공식 GitHub CLI)와 git을 헷갈리지 마세요. git은 버전관리 엔진, gh는 GitHub와 대화하는 도구입니다. 둘 다 필요합니다.

**2. GitHub 계정 만들기 + 이메일/프로필**

github.com에서 무료 계정을 만들고, 실제로 쓰는 이메일로 인증합니다. 이 이메일과 username은 앞으로 모든 커밋에 작성자로 박히니 신중하게 정하세요.

```bash
# 브라우저: https://github.com/signup
# username 예: recipe-chef-2026  (커밋·프로필에 그대로 노출됨)
# Settings > Emails 에서 'Keep my email addresses private' 체크 권장
# 이때 제공되는 noreply 주소 예: 12345678+recipe-chef-2026@users.noreply.github.com
```
- 🖥 화면: 회원가입 폼 → 이메일 인증 메일 → 프로필 완성 3단계를 좌→우 흐름 슬라이드로. username/email이 커밋에 박히는 화살표 강조.
- ⚠️ 함정: 회사·학교 이메일로 만들면 졸업/퇴사 시 계정 복구가 막힐 수 있습니다. 개인 이메일을 쓰세요. 또 username은 나중에 바꾸면 기존 링크가 깨질 수 있으니 처음에 잘 정하세요.

**3. 2FA(2단계 인증) 켜기 — 2026년은 사실상 필수**

GitHub는 이제 코드를 푸시하는 모든 계정에 2FA를 의무화했습니다. 인증 앱(TOTP)이나 passkey로 켜고, 복구 코드는 반드시 따로 저장하세요. 복구 코드를 잃으면 계정을 영영 못 들어갈 수 있습니다.

```bash
# Settings > Password and authentication > Two-factor authentication > Enable
# 1) Authenticator app(TOTP) 또는 Passkey 선택
# 2) 화면의 16자리 복구 코드를 비밀번호 관리자/오프라인에 저장
# 3) 인증 앱 예: 1Password, Google Authenticator, Authy
```
- 🖥 화면: 자물쇠 아이콘 + 'QR 스캔 → 6자리 코드 입력 → 복구코드 백업' 3스텝. 복구코드 칸에 코랄 경고 배지.
- ⚠️ 함정: 복구 코드를 스크린샷만 찍고 클라우드 갤러리에 두면 위험합니다. 폰을 잃으면 2FA도 같이 날아가니, 복구 코드는 반드시 별도 보관하세요.

**4. git 설치 확인**

gh를 쓰기 전에 git이 먼저 깔려 있어야 합니다. 버전이 2.40 이상이면 git switch 같은 최신 명령을 쓸 수 있어 이 강의에 충분합니다. 없으면 git-scm.com 또는 패키지 매니저로 설치하세요.

```bash
git --version
# 기대 출력 예: git version 2.45.2  (2.40 이상이면 OK)
# 없을 때 설치:
winget install --id Git.Git -e          # Windows
brew install git                         # macOS
sudo apt update && sudo apt install git  # Linux(Debian/Ubuntu)
```
- 🖥 화면: 터미널 목업에 'git version 2.45.2'가 초록색으로 뜨는 장면. 2.40 기준선 위에 체크.
- ⚠️ 함정: Windows에서 설치 직후 git이 안 잡히면 PATH 반영 안 된 것입니다. 터미널(PowerShell)을 완전히 닫았다 새로 여세요.

**5. gh CLI 설치 (Windows / macOS / Linux)**

본인 OS에 딱 맞는 한 줄로 gh를 설치합니다. 설치 후 gh --version으로 2.x 이상인지 확인하세요. 이 강의의 모든 협업 명령(gh repo, gh pr)이 여기서부터 동작합니다.

```bash
# Windows (winget)
winget install --id GitHub.cli -e

# macOS (Homebrew)
brew install gh

# Linux (Debian/Ubuntu, 공식 저장소)
(type -p wget >/dev/null || sudo apt install wget -y) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -nv -O- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update && sudo apt install gh -y

# 설치 확인
gh --version
# 기대 출력 예: gh version 2.62.0 (2024-12-XX)
```
- 🖥 화면: 3컬럼 슬라이드: Windows(winget) / macOS(brew) / Linux(apt). 각 컬럼 하단에 'gh --version → 2.x' 공통 체크.
- ⚠️ 함정: Ubuntu의 기본 'apt install gh'는 GitHub CLI가 아닌 다른 패키지일 수 있습니다. 반드시 cli.github.com 공식 저장소를 추가한 위 방법을 쓰세요.

**6. gh auth login 웹 흐름 + gh auth status**

gh auth login을 실행하면 브라우저로 GitHub에 로그인하고 일회용 코드를 입력하는 안전한 OAuth 흐름이 진행됩니다. HTTPS를 고르고 'Login with a web browser'를 선택하면, gh가 git 인증까지 알아서 설정해 줘서 토큰을 따로 만들 필요가 없습니다.

```bash
gh auth login
# 선택: GitHub.com → HTTPS → 'Authenticate Git with your GitHub credentials? Yes' → Login with a web browser
# 화면에 뜬 one-time code(예: AB12-CD34) 복사 → Enter로 브라우저 열기 → 코드 붙여넣고 Authorize

gh auth status
# 기대 출력 예:
# github.com
#   ✓ Logged in to github.com account recipe-chef-2026 (keyring)
#   - Active account: true
#   - Git operations protocol: https
#   - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```
- 🖥 화면: 터미널 ↔ 브라우저 핸드오프 다이어그램: 'one-time code 표시 → 브라우저 입력 → ✓ 로그인됨'. 마지막에 gh auth status의 초록 체크 캡처.
- ⚠️ 함정: 2FA를 켜둔 계정이라 비밀번호만으로는 못 들어갑니다. 'Login with a web browser'를 고르면 2FA가 브라우저에서 자동 처리되니, 헷갈리면 토큰 붙여넣기 대신 웹 흐름을 쓰세요.

### 🧑‍🏫 따라하기 예시

강사가 실제로 새 GitHub 계정 'recipe-chef-2026'을 기준으로, git 확인 → gh 설치 → gh auth login → 로그인 확인까지 한 번에 시연합니다. 그리고 다음 챕터에서 team-recipes 저장소를 만들 수 있는 상태인지를 gh로 미리 검증합니다.

1. git --version 실행 → 'git version 2.45.2' 출력(2.40 이상이면 OK).
2. Windows 기준 winget install --id GitHub.cli -e 실행 → 설치 완료 후 PowerShell을 새로 열기.
3. gh --version 실행 → 'gh version 2.62.0' 출력으로 2.x 확인.
4. gh auth login 실행 → GitHub.com / HTTPS / Authenticate Git=Yes / Login with a web browser 선택 → 터미널에 one-time code 'AB12-CD34' 표시.
5. Enter로 브라우저가 열리면 코드 붙여넣고 Authorize GitHub CLI 클릭(2FA는 브라우저에서 자동 처리).
6. 터미널로 돌아오면 '✓ Authentication complete.'와 'Logged in as recipe-chef-2026' 메시지 확인.
7. gh auth status 실행 → '✓ Logged in to github.com account recipe-chef-2026', 'Token scopes: ... repo, workflow' 확인.
8. gh api user --jq .login 실행 → 'recipe-chef-2026' 출력으로, gh가 진짜 내 계정과 통신함을 검증(다음 챕터에서 이 권한으로 team-recipes를 생성).

**→ 결과:** 터미널에서 gh auth status가 초록 체크와 함께 recipe-chef-2026 계정으로 로그인됨을 보여주고, gh api user가 본인 username을 반환한다. 즉 다음 챕터에서 곧바로 'gh repo create team-recipes'를 칠 수 있는 인증된 상태가 완성된다.

### ✍️ 실습 과제

**목표:** 본인 OS에 gh CLI를 설치하고 gh auth login으로 GitHub에 로그인한 뒤, gh auth status와 gh api user로 '내 계정으로 인증됨'을 스스로 확인한다.

**진행:**
1. 먼저 git --version으로 git 2.40 이상이 깔려 있는지 확인하고, 없으면 본인 OS 패키지 매니저로 설치한다.
2. 본인 OS에 맞는 gh 설치 명령(Windows winget / macOS brew / Linux 공식 apt 저장소)을 골라 실행한다.
3. gh --version으로 2.x인지 확인한다(Windows는 터미널을 새로 열어야 PATH가 잡힌다).
4. gh auth login을 실행하고 GitHub.com → HTTPS → Authenticate Git=Yes → Login with a web browser 흐름으로 진행한다.
5. 터미널에 뜬 one-time code를 브라우저에 붙여넣어 Authorize 한다(2FA는 미리 켜두고 브라우저에서 처리).
6. gh auth status로 본인 username과 'Active account: true', repo 스코프가 보이는지 확인한다.
7. 마지막으로 gh api user --jq .login 을 실행해 본인 username이 그대로 출력되는지 self-check 한다.

<details><summary>정답 보기</summary>

```bash
git --version
winget install --id GitHub.cli -e        # macOS: brew install gh / Linux: cli.github.com 공식 apt 저장소
gh --version
gh auth login
# → GitHub.com → HTTPS → Authenticate Git? Yes → Login with a web browser → one-time code 입력 → Authorize
gh auth status
gh api user --jq .login
```

</details>

**✅ 자가검증:** gh auth status 출력에 '✓ Logged in to github.com account <내-username>'와 'Token scopes' 줄에 repo가 보이고, gh api user --jq .login 이 본인 username을 정확히 출력하면 성공. 이 상태여야 다음 챕터에서 gh repo create team-recipes 가 바로 동작한다.

### ✅ 핵심 정리

- git(2.40+)과 gh(2.x) 둘 다 설치되어 있어야 협업을 시작할 수 있다 — git은 엔진, gh는 GitHub와 대화하는 도구.
- GitHub 계정은 개인 이메일로 만들고 2FA를 켠 뒤 복구 코드를 반드시 별도 보관한다(분실 시 계정 복구 불가).
- gh auth login은 HTTPS + 'Login with a web browser' 흐름이 가장 안전하고 2FA·git 인증까지 자동으로 설정해 준다.
- gh auth status에 ✓와 repo 스코프가 보이고 gh api user가 내 username을 반환하면, 다음 챕터의 gh repo create team-recipes를 칠 준비가 끝난 것이다.

---

## 챕터 3. 인증 & 토큰(PAT): team-recipes에 안전하게 연결하기

**⏱ 12분 · 🎨 슬라이드(키노트)**

**학습 목표:** team-recipes 저장소에만 권한이 한정된 fine-grained PAT를 발급하고, 자격증명 매니저로 안전하게 저장해 HTTPS로 push까지 인증되는 상태를 만든다.

### 📚 강의 흐름

**1. 왜 비밀번호가 아니라 토큰인가**

GitHub은 2021년부터 HTTPS Git 작업에 계정 비밀번호를 막았고, 사람을 대신해 인증하는 열쇠가 바로 PAT(개인용 액세스 토큰)입니다. 토큰은 '특정 권한만, 특정 기간만' 가진 비밀번호 대용이라고 생각하면 됩니다.

```bash
git push  # → remote: Support for password authentication was removed. (비밀번호로는 막힘)
# 해결: 비밀번호 자리에 PAT를 넣는다
```
- 🖥 화면: 왼쪽 '계정 비밀번호=만능 마스터키(X)' vs 오른쪽 'PAT=team-recipes 전용·90일 한정 열쇠(O)' 대비 슬라이드
- ⚠️ 함정: PAT를 '또 다른 비밀번호'로만 생각하면 위험합니다. 비밀번호처럼 권한이 무한하지 않게, 범위와 만료를 반드시 좁혀야 의미가 있습니다.

**2. Classic PAT vs Fine-grained PAT**

Classic 토큰은 scope(repo, workflow 같은 큰 묶음) 단위라 한 번 발급하면 내 모든 저장소에 접근됩니다. Fine-grained 토큰은 '어떤 저장소에', '읽기/쓰기 중 무엇을' 항목별로 정하므로 사고가 나도 피해 범위가 team-recipes 하나로 갇힙니다.

```bash
# Classic: Settings → Developer settings → Tokens (classic)  → scope 체크박스
# Fine-grained: Settings → Developer settings → Fine-grained tokens → 저장소·권한 선택
# 2026 권장: 새로 만들 땐 무조건 fine-grained
```
- 🖥 화면: 두 토큰 비교 표: 접근 범위(전체 vs 선택 repo), 권한 단위(scope vs 항목별), 만료 강제(선택 vs 필수), 최소권한 적합도
- ⚠️ 함정: Classic의 'repo' 한 칸 체크가 곧 '내 모든 private 저장소 읽기·쓰기'입니다. 편하다고 classic+repo를 습관처럼 쓰면 토큰 한 줄이 유출됐을 때 계정 전체가 털립니다.

**3. team-recipes 전용 fine-grained 토큰 발급**

최소 권한 원칙대로 Resource owner를 본인 계정으로, Repository access를 'Only select repositories → team-recipes'로 좁히고, Contents 권한만 Read and write로 줍니다. 이게 push에 꼭 필요한 최소 권한입니다.

```bash
# github.com → 우상단 아바타 → Settings → Developer settings
# → Personal access tokens → Fine-grained tokens → Generate new token
# Token name: team-recipes-laptop
# Expiration: 90 days
# Repository access: Only select repositories → team-recipes 선택
# Repository permissions: Contents = Read and write (PR까지 하려면 Pull requests = Read and write 추가)
# Generate token → github_pat_... 한 번만 표시됨 → 즉시 복사
```
- 🖥 화면: 발급 화면 체크리스트 4단계(이름·만료·저장소 한정·Contents 권한)를 코랄 체크박스로 한 장에 정리
- ⚠️ 함정: 생성 직후 화면을 떠나면 토큰 원문은 다시 못 봅니다. 메신저나 메모장에 평문으로 붙여두지 말고, 곧바로 다음 단계의 자격증명 매니저에 저장하세요.

**4. HTTPS+PAT vs SSH, 그리고 안전 저장**

연결 방식은 두 가지입니다. HTTPS+PAT는 회사 방화벽도 잘 통과하고 권한을 토큰으로 세밀하게 거는 방식, SSH는 키 한 쌍으로 통째로 인증하는 방식입니다. 입문 협업에서는 fine-grained PAT의 세밀함 때문에 HTTPS+PAT를 권합니다. 단, 매번 입력하지 않도록 자격증명 매니저에 한 번만 저장합니다.

```bash
git remote -v   # origin이 https://github.com/<나>/team-recipes.git 인지 확인
# 자격증명 매니저 켜기 (Windows는 manager가 기본 동봉)
git config --global credential.helper manager   # Windows: Git Credential Manager
git config --global credential.helper osxkeychain   # macOS
# 첫 push 때 username=<내 GitHub 아이디>, password=<발급한 PAT> 입력 → 이후 자동 저장
```
- 🖥 화면: HTTPS+PAT(토큰=세밀권한, 방화벽 친화) vs SSH(키쌍=계정 통째) 2열 비교, 하단에 '저장은 OS 자격증명 매니저' 띠
- ⚠️ 함정: remote URL을 'PAT를 박은 형태(https://<pat>@github.com/...)'로 만들지 마세요. 그러면 토큰이 .git/config에 평문으로 남아 다른 사람과 화면 공유 시 그대로 노출됩니다. 항상 매니저에 맡기세요.

**5. 만료·회전, 유출 시 즉시 폐기**

토큰은 '영구'가 아니라 '소모품'입니다. 만료일을 짧게(예: 90일) 두고 주기적으로 새로 발급해 교체(회전)합니다. 실수로 커밋이나 채팅에 노출됐다면 후회하지 말고 즉시 Revoke 하면 그 토큰은 그 순간 무력화됩니다.

```bash
# 폐기: Settings → Developer settings → Fine-grained tokens → 해당 토큰 → Revoke
# 회전: 새 토큰 발급 후, 저장된 옛 자격증명 지우기
git credential-manager erase   # 또는 OS 자격증명 관리자에서 git: 항목 삭제 후 다음 push 때 새 PAT 입력
```
- 🖥 화면: 토큰 수명 타임라인: 발급 → 90일 사용 → 만료 임박 알림 → 새 토큰 발급 → 옛 토큰 Revoke, 한 줄 사이클 다이어그램
- ⚠️ 함정: 만료된 토큰을 그냥 두면 push가 갑자기 401로 실패해 당황합니다. 또 유출 시 비밀번호 바꾸듯 '천천히' 하면 늦습니다. Revoke는 즉시, 회전은 만료 전 미리 하세요.

### 🧑‍🏫 따라하기 예시

강사가 team-recipes에 전용 fine-grained 토큰을 발급하고, Git 자격증명 매니저에 저장한 뒤, README에 한 줄을 추가해 HTTPS로 push가 인증되는 것을 눈앞에서 보여준다. (앞 챕터에서 만든 team-recipes 저장소를 그대로 이어 사용)

1. 브라우저에서 github.com → 아바타 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token 클릭 → '새 토큰 발급 폼이 열린다'
2. Token name에 team-recipes-laptop, Expiration을 90 days로 설정 → '이름과 만료일이 채워진다'
3. Repository access에서 'Only select repositories' 선택 → team-recipes 체크 → '접근 대상이 team-recipes 한 개로 고정된다'
4. Permissions → Repository permissions → Contents를 'Read and write'로 변경 (PR 대비 Pull requests도 Read and write) → 'Generate token' 클릭 → 화면에 github_pat_로 시작하는 토큰이 한 번만 표시된다 → 즉시 복사
5. 터미널에서 cd team-recipes 후 git remote -v 실행 → 'origin https://github.com/<내아이디>/team-recipes.git (fetch/push)' 가 출력된다
6. git config --global credential.helper manager 실행 (macOS는 osxkeychain) → '자격증명 매니저가 활성화된다 (출력은 없고 성공)'
7. printf '\n## 인증 메모\n- 이 저장소는 fine-grained PAT로 push합니다 (만료: 90일).\n' >> README.md 실행 → 'README.md 끝에 인증 메모 두 줄이 추가된다'
8. git add README.md && git commit -m "docs: PAT 인증 메모 추가" 실행 → '[main <해시>] docs: PAT 인증 메모 추가 / 1 file changed' 가 출력된다
9. git push 실행 → 처음엔 Username/Password를 묻는다 → Username에 GitHub 아이디, Password에 복사한 PAT를 붙여넣기 → 'Writing objects: 100% ... main -> main' 으로 push 성공, 토큰은 매니저에 저장된다
10. 확인용으로 한 줄 더 바꾸고 git push 다시 실행 → '이번엔 아이디/토큰을 묻지 않고 바로 push 된다 (저장 확인)'

**→ 결과:** team-recipes에만 권한이 한정된 fine-grained PAT가 OS 자격증명 매니저에 저장되어, README 변경이 HTTPS로 인증되어 GitHub에 push되고 이후 push는 입력 없이 자동 인증된다. (다음 챕터의 브랜치·PR 작업이 모두 이 인증 위에서 돌아간다)

### ✍️ 실습 과제

**목표:** 본인 team-recipes 저장소에 한정된 fine-grained PAT를 직접 발급하고, 평문 노출 없이 자격증명 매니저에 저장해, RECIPES.md 변경을 입력 없이 push 되는 상태로 만든다.

**진행:**
1. Fine-grained tokens에서 Token name을 'team-recipes-exercise', Expiration 30 days로 새 토큰을 발급하되, Repository access는 team-recipes만, Contents 권한만 Read and write로 좁힌다.
2. 발급된 토큰을 메모장이 아니라 곧바로 push 단계에서만 쓰도록 복사해 둔다 (채팅·파일에 붙여넣지 않기).
3. team-recipes 폴더에서 git remote -v로 origin이 https:// URL인지 확인하고, credential.helper가 manager(또는 osxkeychain)로 설정돼 있는지 git config --global credential.helper로 확인한다.
4. RECIPES.md(없으면 새로 생성)에 '## 김치볶음밥' 같은 레시피 제목 한 줄을 추가하고 커밋한 뒤 push 한다. 첫 push에서 username=아이디, password=PAT를 입력한다.
5. 아무 줄이나 한 번 더 바꿔 다시 push 해서, 두 번째에는 아이디/토큰 입력 없이 통과하는지 확인한다.

<details><summary>정답 보기</summary>

```bash
# (브라우저) Settings → Developer settings → Fine-grained tokens → Generate new token
#   name: team-recipes-exercise / Expiration: 30 days
#   Repository access: Only select repositories → team-recipes
#   Permissions: Contents = Read and write → Generate token → github_pat_... 복사
cd team-recipes
git remote -v
git config --global credential.helper manager   # macOS: osxkeychain
printf '## 김치볶음밥\n- 밥, 김치, 계란\n' >> RECIPES.md
git add RECIPES.md
git commit -m "feat: 김치볶음밥 레시피 추가"
git push   # Username=<내 아이디>, Password=<PAT> 입력 → 성공 후 저장됨
printf '- 참기름 한 스푼\n' >> RECIPES.md && git commit -am "docs: 참기름 추가" && git push   # 이번엔 입력 없이 통과
```

</details>

**✅ 자가검증:** 두 번째 git push가 아이디/토큰을 묻지 않고 'main -> main'으로 끝나면 자격증명 저장 성공이다. GitHub의 team-recipes 저장소 RECIPES.md에 추가한 레시피 줄이 보이면 인증·push가 정상 동작한 것이다. (그리고 Settings의 토큰 목록에서 team-recipes-exercise의 접근 저장소가 1개로 표시되면 최소권한 발급 성공)

### ✅ 핵심 정리

- 새 토큰은 무조건 fine-grained로, Resource는 team-recipes 하나, 권한은 Contents=Read and write 같은 최소 범위만 준다.
- 발급 직후 화면을 떠나기 전에 토큰을 자격증명 매니저(credential.helper manager/osxkeychain)에 저장하고, 평문으로 채팅·파일·remote URL에 박지 않는다.
- HTTPS+PAT가 입문 협업의 기본값이다. 토큰=세밀권한, SSH=키쌍 통째 인증임을 구분한다.
- 토큰은 소모품이다. 만료(예: 30~90일)를 짧게 두고 미리 회전하며, 유출되면 즉시 Revoke 한다.

---

## 챕터 4. 첫 레포지토리 & 기본 워크플로우

**⏱ 18분 · 🎨 슬라이드(키노트)**

**학습 목표:** gh CLI로 team-recipes 원격 레포를 만들고 클론한 뒤, status→add→commit→push→pull로 이어지는 Git 기본 워크플로우를 직접 손으로 한 바퀴 돌린다.

### 📚 강의 흐름

**1. 이번 챕터가 만들 결과물: team-recipes의 탄생**

오늘부터 강의 전체를 관통할 단 하나의 레포 team-recipes를 직접 만듭니다. 명령어 하나하나가 실제로 돌아가는 결과를 눈으로 확인하면서 '원격 생성 → 클론 → 변경 → 동기화'라는 평생 쓰는 한 바퀴를 몸에 익힙니다.

```bash
gh auth status
```
- 🖥 화면: 오른쪽에 team-recipes 레포의 최종 모습(README.md, .gitignore, LICENSE, recipes/kimchi-stew.md)을 트리로 미리 보여주는 슬라이드. 왼쪽엔 '오늘 만들 것' 체크리스트.
- ⚠️ 함정: gh auth status가 'not logged in'이면 먼저 gh auth login으로 로그인부터. 3장에서 했지만 토큰이 만료됐을 수 있으니 항상 이 한 줄로 점검하고 시작하세요.

**2. gh repo create로 README·.gitignore·LICENSE까지 한 번에**

GitHub 사이트를 열지 않고 터미널 한 줄로 원격 레포를 만들고, 동시에 README와 .gitignore, 라이선스 초기 파일까지 채워 넣고 바로 클론까지 합니다. --clone을 붙이면 만든 즉시 내 컴퓨터로 내려받아 작업 폴더가 생깁니다.

```bash
gh repo create team-recipes --public --description "우리 팀의 공유 레시피 모음" --add-readme --gitignore Node --license mit --clone
cd team-recipes
```
- 🖥 화면: 명령어의 각 플래그(--public / --add-readme / --gitignore Node / --license mit / --clone)에 말풍선 라벨을 달아 무슨 역할인지 한눈에 매핑한 슬라이드.
- ⚠️ 함정: --gitignore와 --license 값은 대소문자·정확한 템플릿 이름에 민감합니다(Node는 대문자 N, mit은 소문자). 이름이 틀리면 'not a valid gitignore template' 에러가 납니다. --clone을 빼먹으면 원격만 생기고 로컬 폴더가 없어 다음 단계가 막히니 주의.

**3. clone이 만든 폴더 안에는 무엇이 있나 (git status)**

클론된 team-recipes 폴더로 들어가 git status를 치면 'nothing to commit, working tree clean'이 뜹니다. 이건 에러가 아니라 '원격과 완전히 똑같다'는 가장 건강한 상태입니다. ls로 README·LICENSE·.gitignore가 받아져 있는지도 확인합니다.

```bash
ls -a
git status
git log --oneline
```
- 🖥 화면: git status의 'working tree clean' 출력에 초록 체크를 얹고, 옆에 '깨끗함 = 원격과 동일'이라는 등호 도식을 그린 슬라이드.
- ⚠️ 함정: ls만 치면 숨김 파일인 .gitignore와 .git 폴더가 안 보입니다. 반드시 ls -a로 확인하세요. .git 폴더는 절대 손대거나 지우지 마세요 — 이게 사라지면 Git 저장소가 아니게 됩니다.

**4. 변경 → 스테이징 → 커밋: 사진 찍듯 기록하기 (add · commit)**

recipes 폴더와 첫 레시피 파일을 만들면 git status가 그 파일을 'Untracked files(빨강)'로 보여줍니다. git add로 스테이징하면 '찍을 준비(초록)'가 되고, git commit으로 비로소 한 장의 스냅샷으로 영구 기록됩니다. 워킹 → 스테이징 → 저장소, 이 3단계가 Git의 심장입니다.

```bash
mkdir recipes
git status
git add recipes/
git status
git commit -m "feat: add first recipe placeholder"
```
- 🖥 화면: 워킹 디렉터리(빨강) → 스테이징 영역(초록) → 로컬 저장소(파랑) 3개 상자 사이를 add와 commit 화살표가 잇는 도식. 같은 파일이 색을 바꾸며 이동하는 애니메이션.
- ⚠️ 함정: git add 없이 바로 commit하면 'nothing to commit'이 뜨거나 변경이 안 담깁니다. 또 git add . 는 의도치 않은 파일까지 통째로 담을 수 있으니, 처음엔 git add recipes/ 처럼 경로를 콕 집어 담는 습관을 들이세요.

**5. 커밋 메시지 규칙: 미래의 나와 동료를 위한 한 줄**

커밋 메시지는 일기가 아니라 변경의 요약입니다. type: 요약 형식(feat 새 기능, fix 수정, docs 문서)을 쓰고, 제목은 50자 안, 현재형 명령조로 적습니다. 'ㅎㅎ 수정함' 같은 메시지는 3주 뒤 본인도 못 알아봅니다.

```bash
git commit -m "docs: explain commit message convention"
git log --oneline -3
```
- 🖥 화면: 왼쪽 '나쁜 예'(ㅎㅎ, asdf, 수정) vs 오른쪽 '좋은 예'(feat: …, fix: …, docs: …)를 빨강/초록 대비로 나란히 보여주는 슬라이드. 아래에 type 치트시트.
- ⚠️ 함정: git commit을 -m 없이 치면 Vim 같은 편집기가 열려 초보자가 빠져나오지 못합니다(탈출은 Esc 후 :q! 입력). 익숙해지기 전엔 항상 -m "메시지"로 메시지를 인라인으로 넣으세요.

**6. push와 pull: 로컬과 원격을 양방향으로 맞추기**

git push origin main으로 내 커밋을 GitHub에 올리고, 협업 중 동료가 먼저 올린 변경은 git pull로 내려받아 합칩니다. push는 '내 사진첩을 클라우드에 백업', pull은 '클라우드의 최신본을 내 폰에 동기화'라고 생각하면 쉽습니다.

```bash
git push origin main
git pull origin main
gh repo view --web
```
- 🖥 화면: 로컬 저장소 ↔ origin(GitHub) 사이를 push(올림)와 pull(내림) 두 화살표가 양방향으로 잇는 도식. gh repo view --web로 브라우저에 커밋이 뜬 스크린샷.
- ⚠️ 함정: push가 'rejected (non-fast-forward)'로 막히면 원격에 내가 모르는 커밋이 있다는 뜻 — 먼저 git pull origin main으로 받은 뒤 다시 push하세요. 절대 처음부터 git push --force로 밀어버리지 마세요. 협업 레포에선 동료 작업을 통째로 날립니다.

### 🧑‍🏫 따라하기 예시

강사가 라이브로 team-recipes 레포를 처음부터 만든다: gh로 원격 생성+클론 → 폴더 확인 → 첫 README 한 줄 추가 → status·add·commit(메시지 규칙 적용)·push로 한 바퀴를 완주하고, 마지막에 git pull로 '이미 최신'임을 확인한다. 이게 앞으로 모든 챕터의 출발 폴더가 된다.

1. gh auth status → 'Logged in to github.com account <내계정> (keyring)'가 떠 로그인 상태 확인
2. gh repo create team-recipes --public --description "우리 팀의 공유 레시피 모음" --add-readme --gitignore Node --license mit --clone → '✓ Created repository <계정>/team-recipes on GitHub' 와 'Cloning into team-recipes...' 출력, 현재 폴더에 team-recipes/ 생성
3. cd team-recipes && ls -a → '.  ..  .git  .gitignore  LICENSE  README.md' 가 보임 (초기 3종 파일이 받아짐)
4. git status → 'On branch main / Your branch is up to date with origin/main. / nothing to commit, working tree clean' (깨끗한 출발 상태)
5. git log --oneline → 'a1b2c3d Initial commit' 한 줄 — gh가 만든 최초 커밋 확인
6. echo "# team-recipes\n\n우리 팀이 함께 모으는 레시피 저장소입니다." > README.md → README를 우리 소개 문구로 교체
7. git status → 'modified: README.md' 가 빨간색 'Changes not staged for commit'에 표시됨
8. git add README.md → (출력 없음) 이후 git status를 치면 'Changes to be committed: modified: README.md' 가 초록색으로 바뀜
9. git commit -m "docs: introduce team-recipes repository" → '[main e4f5a6b] docs: introduce team-recipes repository / 1 file changed' 출력
10. git push origin main → 'To https://github.com/<계정>/team-recipes.git ... main -> main' 로 업로드 완료
11. git pull origin main → 'Already up to date.' — 방금 올렸으니 받을 게 없음을 확인
12. gh repo view --web → 브라우저에서 우리 README 문구와 docs: 커밋이 GitHub에 그대로 올라온 것을 눈으로 확인

**→ 결과:** GitHub에 README·.gitignore·LICENSE가 들어간 공개 레포 team-recipes가 생기고, 로컬 클론에서 docs: 커밋 한 개가 push되어 원격과 완벽히 동기화된 상태(working tree clean, Already up to date). 이제 모든 챕터의 베이스캠프 폴더가 준비됨.

### ✍️ 실습 과제

**목표:** team-recipes에 첫 진짜 레시피 recipes/kimchi-stew.md를 직접 추가하고, 커밋 메시지 규칙(type: 요약)을 지켜 커밋한 뒤 GitHub로 push해서 원격에 반영하라.

**진행:**
1. team-recipes 폴더 안에 있는지 확인한다(pwd 또는 git status로 'On branch main' 확인). 없으면 cd team-recipes.
2. recipes 폴더가 없으면 mkdir recipes로 만든다.
3. recipes/kimchi-stew.md 파일을 만들고 제목(# 김치찌개)·재료 목록·간단한 조리 순서를 Markdown으로 적는다.
4. git status로 파일이 'Untracked(빨강)'로 잡히는지 본다.
5. git add로 그 파일만 스테이징하고, git status로 초록색으로 바뀌었는지 다시 확인한다.
6. feat: 로 시작하는 커밋 메시지로 commit한다(예: 새 레시피 추가).
7. git push origin main으로 GitHub에 올린다.
8. gh repo view --web 로 브라우저에서 recipes/kimchi-stew.md가 보이는지 자기 눈으로 검증한다.

<details><summary>정답 보기</summary>

```bash
cd team-recipes
mkdir -p recipes
printf '# 김치찌개\n\n## 재료\n- 신김치 1/4포기\n- 돼지고기 200g\n- 두부 1/2모\n- 대파 1대\n\n## 만드는 법\n1. 돼지고기를 볶다가 김치를 넣고 함께 볶는다.\n2. 물을 붓고 끓인 뒤 두부와 대파를 넣는다.\n3. 10분간 더 끓이면 완성.\n' > recipes/kimchi-stew.md
git status
git add recipes/kimchi-stew.md
git status
git commit -m "feat: add kimchi-stew recipe"
git push origin main
gh repo view --web
```

</details>

**✅ 자가검증:** git log --oneline -1 의 맨 위 줄이 'feat: add kimchi-stew recipe' 이고, git status가 'working tree clean / up to date with origin/main' 을 출력하면 성공. 추가로 gh repo view --web 로 연 GitHub 페이지의 recipes 폴더 안에 kimchi-stew.md가 보이면 원격까지 정상 반영된 것이다.

### ✅ 핵심 정리

- gh repo create 한 줄로 원격 레포 생성과 README·.gitignore·LICENSE 초기화, 클론까지 동시에 끝낼 수 있다.
- Git의 핵심은 워킹 → (git add) 스테이징 → (git commit) 저장소 3단계이고, git status의 색(빨강/초록)으로 지금 어느 단계인지 읽을 수 있다.
- 커밋 메시지는 'type: 요약'(feat/fix/docs) 형식·현재형·50자 이내로 적어 미래의 나와 동료가 알아보게 한다.
- push는 로컬→원격 백업, pull은 원격→로컬 동기화이며, push가 거부되면 force가 아니라 먼저 pull로 합친다.

---

## 챕터 5. 협업자 초대 & 권한: team-recipes를 진짜 팀 저장소로

**⏱ 12분 · 🎨 슬라이드(키노트)**

**학습 목표:** team-recipes에 동료를 협업자로 초대하고, 역할(read~admin)을 이해하며, main 브랜치에 필수 리뷰 보호 규칙과 CODEOWNERS를 설정해 안전한 협업 기반을 만든다.

### 📚 강의 흐름

**1. 왜 권한과 보호가 먼저인가 (훅)**

혼자 쓰던 team-recipes에 동료가 들어오는 순간, '누가 무엇을 할 수 있나'와 'main을 누가 함부로 못 건드리나'를 먼저 정해야 사고가 안 납니다. 초대보다 권한 설계가 먼저입니다.
- 🖥 화면: kicker '협업의 첫 단추' / 좌측: 자물쇠 없는 main에 직접 push하는 빨간 화살표, 우측: 보호된 main으로 PR을 통해 들어가는 초록 화살표 비교
- ⚠️ 함정: 초대만 하고 권한·보호를 안 정하면, 협업자가 검토 없이 main에 직접 push해 히스토리를 망칠 수 있습니다.

**2. 협업자 초대 — gh CLI와 웹 두 가지**

개인 저장소는 'Collaborator(협업자)'를 한 명씩 초대합니다. gh CLI 한 줄이면 초대 메일이 가고, 상대가 수락하면 끝입니다. 웹은 Settings > Collaborators에서 같은 일을 클릭으로 합니다.

```bash
gh repo view shain1912/team-recipes --json visibility,owner
gh api -X PUT repos/shain1912/team-recipes/collaborators/동료ID -f permission=push
gh api repos/shain1912/team-recipes/invitations --jq '.[].invitee.login'
```
- 🖥 화면: 슬라이드 title '협업자 초대 2-way' / bullets: ①gh api PUT collaborators ②permission 지정 ③초대 메일 수락 / note: 웹 경로 Settings → Collaborators → Add people
- ⚠️ 함정: permission 값은 API 기준 pull/triage/push/maintain/admin 입니다. 'write'라고 쓰면 422 에러 — write는 API에서 push로 적습니다.

**3. 5가지 역할 — read / triage / write / maintain / admin**

권한은 다섯 단계로 누적됩니다. read는 보기만, triage는 이슈·PR 정리, write는 push와 PR 머지, maintain은 저장소 설정 일부, admin은 모든 권한과 삭제까지. 동료에게는 보통 write면 충분합니다.

```bash
gh api repos/shain1912/team-recipes/collaborators/동료ID/permission --jq '.permission'
```
- 🖥 화면: slides bullets 5단계 계단식 표: read(보기) → triage(분류) → write(push·머지) → maintain(설정 일부) → admin(전체·삭제), write에 별표 '동료 기본값'
- ⚠️ 함정: 최소 권한 원칙: 의심되면 낮게 줍니다. admin은 본인(소유자)만. 외부 기여자는 초대 대신 Fork+PR이 더 안전합니다.

**4. Organization과 Team — 사람이 늘어나면**

협업자가 3~4명을 넘어가면 개인 저장소 대신 Organization을 만들고, 사람을 Team으로 묶어 팀 단위로 권한을 줍니다. 한 명씩 초대하는 대신 'recipe-editors 팀에 write' 한 번으로 끝납니다.

```bash
gh api orgs/my-cook-org/teams --jq '.[].slug'
gh api -X PUT orgs/my-cook-org/teams/recipe-editors/repos/my-cook-org/team-recipes -f permission=push
```
- 🖥 화면: theory식 조직도 한 장: Org(my-cook-org) 아래 Team(recipe-editors) 박스, 그 안 멤버 3명, Team→Repo로 'write' 화살표 한 줄. 개인 repo의 1:1 초대와 대비
- ⚠️ 함정: 이번 실습 team-recipes는 개인 저장소라 Team이 없습니다. Org/Team은 '맛보기 개념'으로만 보고, 실습은 개인 협업자 초대로 진행합니다.

**5. main 브랜치 보호 — 필수 리뷰 강제**

이게 이번 챕터의 핵심입니다. main에 보호 규칙을 걸면, 누구도 직접 push 못 하고 반드시 PR + 1명 이상 승인을 거쳐야 머지됩니다. 다음 챕터의 PR·충돌 실습이 모두 이 위에서 돌아갑니다.

```bash
gh api -X PUT repos/shain1912/team-recipes/branches/main/protection --input protection.json
gh api repos/shain1912/team-recipes/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count'
```
- 🖥 화면: slides title 'main 보호 규칙' / bullets: ①직접 push 차단 ②PR 필수 ③승인 1명 이상 ④대화 해결 필수 / note: 웹 경로 Settings → Branches → Add rule (또는 Rulesets)
- ⚠️ 함정: 보호를 켜면 소유자 본인도 main에 직접 push가 막힙니다(enforce_admins=true 시). 의도된 동작이니 당황하지 말고, 앞으로는 PR로 들어가세요.

**6. CODEOWNERS 맛보기 — 자동 리뷰어 지정**

특정 파일이 바뀌면 자동으로 정해진 리뷰어를 PR에 붙여주는 파일이 .github/CODEOWNERS입니다. recipes 폴더가 바뀌면 동료를 자동 호출하도록 한 줄 적어두면, 리뷰가 새지 않습니다.

```bash
mkdir -p .github
printf 'recipes/  @동료ID\n*.md      @shain1912\n' > .github/CODEOWNERS
git add .github/CODEOWNERS && git commit -m "chore: add CODEOWNERS for recipes review"
```
- 🖥 화면: slides 코드 박스 한 장: .github/CODEOWNERS 내용 2줄(경로 → @담당자) + 아래 화살표로 'PR 열리면 reviewer 자동 지정' 표시
- ⚠️ 함정: CODEOWNERS의 @아이디는 실제로 그 저장소에 write 이상 권한이 있어야 리뷰어로 붙습니다. 권한 없는 아이디를 적으면 조용히 무시됩니다.

### 🧑‍🏫 따라하기 예시

강사가 team-recipes(개인 저장소, 챕터4까지 만든 상태)에 동료 계정을 write 권한으로 초대하고, main에 '필수 리뷰 1명' 보호 규칙을 건 뒤, CODEOWNERS까지 커밋해서 다음 챕터의 PR 실습 토대를 완성합니다.

1. 현재 상태 확인: `gh repo view shain1912/team-recipes --json visibility,owner,defaultBranchRef` → visibility "public", defaultBranchRef.name "main" 출력으로 대상 저장소·기본 브랜치 확인
2. 동료를 write로 초대: `gh api -X PUT repos/shain1912/team-recipes/collaborators/cook-buddy -f permission=push` → HTTP 201과 함께 invitation JSON 반환(이미 멤버면 204, 빈 응답)
3. 초대 상태 확인: `gh api repos/shain1912/team-recipes/invitations --jq '.[].invitee.login'` → `cook-buddy` 출력 (동료가 메일/알림에서 수락하면 목록에서 사라짐)
4. 동료가 수락 후 실제 권한 확인: `gh api repos/shain1912/team-recipes/collaborators/cook-buddy/permission --jq '.permission'` → `write` 출력
5. 보호 규칙 JSON 작성: protection.json 파일에 `{"required_status_checks":null,"enforce_admins":true,"required_pull_request_reviews":{"required_approving_review_count":1,"require_code_owner_reviews":true},"restrictions":null,"required_conversation_resolution":true}` 저장
6. main 보호 적용: `gh api -X PUT repos/shain1912/team-recipes/branches/main/protection --input protection.json` → 보호 설정 JSON 반환(url에 .../branches/main/protection 포함)
7. 적용 검증: `gh api repos/shain1912/team-recipes/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count'` → `1` 출력
8. CODEOWNERS 추가: 로컬 클론에서 `mkdir -p .github` 후 `printf 'recipes/  @cook-buddy\n*.md      @shain1912\n' > .github/CODEOWNERS`
9. 보호 때문에 직접 push가 막히는지 시연: feature 브랜치에서 커밋 → `git switch -c chore/codeowners` → `git add .github/CODEOWNERS && git commit -m "chore: add CODEOWNERS"` → `git push -u origin chore/codeowners` (main에 직접 push 시도하면 'protected branch' 거부 메시지가 뜨는 것을 보여줌)

**→ 결과:** team-recipes에 동료(cook-buddy)가 write 협업자로 들어와 있고, main은 'PR + 승인 1명 + 코드오너 리뷰 + 대화 해결' 없이는 머지 불가 상태가 되며, .github/CODEOWNERS가 브랜치에 올라가 다음 챕터 PR에서 리뷰어가 자동 지정될 준비가 끝납니다.

### ✍️ 실습 과제

**목표:** 당신의 team-recipes에 두 번째 계정(또는 친구/포크용 서브 계정)을 협업자로 초대하고, main 브랜치에 '필수 리뷰 1명' 보호 규칙을 직접 설정한 뒤, 보호가 실제로 직접 push를 막는지 확인한다.

**진행:**
1. 서브 계정 준비: github.com에서 두 번째 계정을 만들거나, 친구 계정 아이디를 준비합니다(이 계정이 '동료' 역할).
2. gh가 본인(소유자) 계정으로 로그인돼 있는지 `gh auth status`로 확인합니다.
3. 협업자 초대: gh api PUT으로 그 아이디를 permission=push(=write)로 초대하고, invitations 목록에서 보이는지 확인합니다.
4. 동료 계정으로 GitHub 알림/메일에 들어가 초대를 수락합니다(브라우저 시크릿 창에서 두 번째 계정 로그인).
5. 보호 JSON을 만들어 main에 적용합니다: required_approving_review_count는 1, enforce_admins는 true.
6. 보호가 걸렸는지 jq로 승인 수를 확인하고, 마지막으로 main에 아무 변경이나 직접 push를 시도해 거부되는지 눈으로 확인합니다.

<details><summary>정답 보기</summary>

```bash
gh auth status
gh api -X PUT repos/<본인ID>/team-recipes/collaborators/<동료ID> -f permission=push
gh api repos/<본인ID>/team-recipes/invitations --jq '.[].invitee.login'
printf '{"required_status_checks":null,"enforce_admins":true,"required_pull_request_reviews":{"required_approving_review_count":1},"restrictions":null}' > protection.json
gh api -X PUT repos/<본인ID>/team-recipes/branches/main/protection --input protection.json
gh api repos/<본인ID>/team-recipes/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count'
git switch main && echo '' >> README.md && git commit -am 'test: direct push' && git push origin main   # → ! [remote rejected] main (protected branch hook declined) 가 정상
```

</details>

**✅ 자가검증:** invitations 명령이 동료 아이디를 출력하고, protection 확인 명령이 `1`을 출력하며, main으로 직접 push 시 'protected branch hook declined' 거부 메시지가 뜨면 성공입니다. (테스트 커밋은 `git reset --hard origin/main`으로 되돌리세요.)

### ✅ 핵심 정리

- 초대 권한은 API 기준 pull/triage/push/maintain/admin 다섯 단계 — 동료에겐 push(write)가 기본, admin은 소유자만 (최소 권한 원칙).
- 사람이 많아지면 개인 협업자 1:1 초대 대신 Organization + Team으로 팀 단위 권한을 준다.
- main 브랜치 보호 = 직접 push 차단 + PR 필수 + 승인 1명 이상. 이걸 켜야 다음 챕터의 안전한 PR 협업이 가능하다.
- .github/CODEOWNERS 한 줄로 특정 경로 변경 시 리뷰어를 자동 지정 — 단, 그 아이디에 write 이상 권한이 있어야 적용된다.

---

## 챕터 6. 브랜치 &amp; git tree 시각화

**⏱ 18분 · 🎨 이론 시각화(3b1b)**

**학습 목표:** 브랜치가 커밋을 가리키는 포인터임을 이해하고, git switch -c로 feature 브랜치를 만들어 team-recipes에 비빔밥 레시피를 추가한 뒤 git log --graph로 커밋 트리를 직접 읽을 수 있다.

### 📚 강의 흐름

**1. 브랜치는 복사본이 아니라 '포인터'다**

초보자는 브랜치를 폴더 복사본으로 오해하지만, 브랜치는 커밋 하나를 가리키는 40바이트짜리 이름표일 뿐입니다. 그래서 브랜치를 새로 만드는 건 디스크를 복사하는 게 아니라 화살표 하나를 더 다는, 거의 공짜에 가까운 작업입니다.

```bash
cat .git/refs/heads/main
git log --oneline -1
```
- 🖥 화면: theory: 오른쪽에 커밋 노드 3개(C1→C2→C3)를 줄로 잇고, main 라벨이 화살표로 C3를 '가리키는' 모습을 그려가며 애니메이션. '브랜치 = 커밋을 가리키는 포인터' 자막.
- ⚠️ 함정: 브랜치를 만들면 파일이 통째로 복제된다고 오해 → 불필요하게 브랜치 생성을 두려워함.

**2. git switch -c 로 feature 브랜치 만들기 + 네이밍 규칙**

git switch -c <이름> 한 줄이면 현재 커밋을 가리키는 새 포인터를 만들고 그 위로 갈아탑니다. 협업에서는 feature/add-bibimbap 처럼 'feature/동사-대상' 꼴로 지어, 이름만 봐도 무슨 작업인지 보이게 합니다.

```bash
git switch main
git switch -c feature/add-bibimbap
git branch
```
- 🖥 화면: slides 인서트: 좋은 이름 vs 나쁜 이름 표 (feature/add-bibimbap, fix/typo-readme  vs  test, mybranch, asdf). git switch -c = 만들기(-c)+갈아타기 한 번에.
- ⚠️ 함정: 낡은 checkout 습관으로 git checkout -b 를 쓰거나, 한글/공백/대문자 브랜치명(비빔밥 추가)을 써서 푸시·CI에서 깨짐. 영문 소문자+하이픈 권장.

**3. HEAD = '지금 내가 서 있는 위치'**

HEAD는 '현재 체크아웃된 브랜치'를 가리키는 또 하나의 포인터입니다. switch 하면 파일이 바뀌는 게 아니라 HEAD가 옮겨 다니는 거예요. git status 맨 윗줄과 git branch의 별표(*)가 바로 HEAD의 현재 위치입니다.

```bash
git status
git rev-parse --abbrev-ref HEAD
cat .git/HEAD
```
- 🖥 화면: theory: HEAD 라벨을 main→feature/add-bibimbap 으로 슬라이드 이동시키는 애니메이션. 'HEAD가 가리키는 곳 = 내가 지금 작업하는 브랜치'.
- ⚠️ 함정: 'detached HEAD' 경고를 보고 당황 → 브랜치 이름이 아니라 커밋 SHA로 switch하면 발생. 브랜치 이름으로 돌아오면 해결됨을 미리 안심시키기.

**4. feature 브랜치에서 비빔밥 레시피 커밋 → 트리가 갈라진다**

feature 브랜치 위에서 새 파일을 추가하고 커밋하면, feature 포인터만 앞으로 한 칸 이동하고 main은 제자리에 남습니다. 바로 이 순간 트리가 두 갈래로 갈라집니다.

```bash
git add recipes/bibimbap.md
git commit -m "Add bibimbap recipe"
git log --oneline -1
```
- 🖥 화면: theory: C3에서 새 노드 C4가 위로 솟아오르고 feature/add-bibimbap 라벨이 C4로 따라 올라가는 반면 main 라벨은 C3에 그대로 남아 두 갈래로 벌어지는 핵심 애니메이션.
- ⚠️ 함정: main에 그대로 커밋해 버리는 실수 → 커밋 전에 git status로 현재 브랜치(feature)를 반드시 확인.

**5. git log --graph --oneline --all 로 트리 읽기**

이 한 줄이 글자로 그린 커밋 트리입니다. * 는 커밋, 왼쪽의 선이 갈래, (HEAD -> feature...) 와 (main) 라벨로 두 포인터의 위치를 한눈에 봅니다. --all 을 빼면 현재 브랜치만 보입니다.

```bash
git log --graph --oneline --all
git log --graph --oneline --all --decorate -10
```
- 🖥 화면: slides: 실제 터미널 출력을 그대로 보여주고, * 별표=커밋, 갈래 선, (HEAD -> ...) / (main) 라벨에 컬러 화살표로 주석. 자주 쓰는 별칭 alias git lg 도 인서트.
- ⚠️ 함정: --all 없이 보고 'feature 브랜치가 안 보인다'고 착각. --all 은 '모든 브랜치를 한 화면에'라는 뜻.

**6. merge-base: 두 브랜치가 갈라진 지점**

git merge-base main feature/add-bibimbap 은 두 브랜치의 '공통 조상' 커밋, 즉 갈라지기 직전의 지점을 알려줍니다. 나중에 머지와 충돌을 이해할 때 이 분기점이 기준이 됩니다.

```bash
git merge-base main feature/add-bibimbap
git log --oneline -1 $(git merge-base main feature/add-bibimbap)
```
- 🖥 화면: theory: 두 갈래로 벌어진 트리에서 갈라지는 바로 그 노드에 'merge-base (공통 조상)' 핀을 꽂아 강조.
- ⚠️ 함정: merge-base가 두 브랜치의 '최신 공통점'이 아니라 '분기점'임을 헷갈림. 분기 이후엔 양쪽이 따로 자란다는 점을 짚기.

**7. (고급) git worktree: 브랜치를 폴더로 동시에 펼치기**

switch는 한 폴더에서 브랜치를 갈아끼우지만, git worktree add 는 다른 브랜치를 옆 폴더에 동시에 펼쳐 두 브랜치를 나란히 열어 둘 수 있습니다. 급한 hotfix를 작업 중인 feature를 건드리지 않고 처리할 때 유용합니다. 지금 당장 필수는 아니니 '이런 게 있다'만 기억하세요.

```bash
git worktree add ../team-recipes-hotfix -b hotfix/fix-typo
git worktree list
git worktree remove ../team-recipes-hotfix
```
- 🖥 화면: slides: 폴더 2개(team-recipes = feature, team-recipes-hotfix = hotfix)가 같은 .git 저장소를 공유하는 다이어그램. '고급/선택' 배지.
- ⚠️ 함정: 같은 브랜치를 두 worktree에서 동시에 못 체크아웃함(에러 발생). worktree마다 서로 다른 브랜치를 두어야 함. 작업 끝나면 worktree remove로 정리.

### 🧑‍🏫 따라하기 예시

지난 챕터까지 만든 team-recipes 저장소를 클론해 둔 상태에서, main을 건드리지 않고 feature/add-bibimbap 브랜치를 만들어 비빔밥 레시피 파일을 추가·커밋한 뒤, git log --graph로 트리가 두 갈래로 갈라진 모습과 merge-base 분기점을 직접 확인합니다. (다음 챕터의 PR로 자연스럽게 이어집니다.)

1. git switch main  →  출력: "Already on 'main'" 또는 "Switched to branch 'main'" — 깨끗한 main에서 출발 확인
2. git pull  →  출력: "Already up to date." (원격과 동기화된 main 위에서 분기 시작)
3. git switch -c feature/add-bibimbap  →  출력: "Switched to a new branch 'feature/add-bibimbap'"
4. git status  →  맨 윗줄 "On branch feature/add-bibimbap" 로 HEAD 위치 확인
5. mkdir -p recipes 후, recipes/bibimbap.md 생성하고 내용 작성: 첫 줄 "# 비빔밥", 다음 줄들에 "## 재료" 와 "- 밥, 나물, 고추장, 계란", "## 만드는 법" "1. 그릇에 밥을 담는다" 등 (에디터로 저장)
6. git add recipes/bibimbap.md  →  (출력 없음 = 정상, 스테이징 완료)
7. git commit -m "Add bibimbap recipe"  →  출력: "[feature/add-bibimbap 1a2b3c4] Add bibimbap recipe / 1 file changed, N insertions(+)"
8. git log --graph --oneline --all  →  출력 예: "* 1a2b3c4 (HEAD -> feature/add-bibimbap) Add bibimbap recipe" 그 아래 "* 9f8e7d6 (origin/main, main) Add README" — feature는 한 칸 앞서고 main은 제자리임을 트리에서 확인
9. git merge-base main feature/add-bibimbap  →  출력: "9f8e7d6..." (Add README 커밋 SHA) = 두 브랜치가 갈라진 공통 조상
10. git push -u origin feature/add-bibimbap  →  출력: "* [new branch] feature/add-bibimbap -> feature/add-bibimbap" — 원격에도 브랜치 포인터가 생겨 다음 챕터 PR 준비 완료

**→ 결과:** team-recipes에 recipes/bibimbap.md가 담긴 feature/add-bibimbap 브랜치가 로컬·원격 모두에 생겼고, main은 손대지 않은 채로 남아 있으며, git log --graph 트리에서 두 포인터(HEAD -> feature, main)가 한 커밋만큼 갈라진 모습과 merge-base 분기점을 눈으로 확인한 상태.

### ✍️ 실습 과제

**목표:** main을 건드리지 않고 feature/add-kimchi-jjigae 브랜치를 새로 만들어 김치찌개 레시피를 커밋한 뒤, git log --graph로 트리가 갈라진 것을 확인하고 main과의 merge-base(분기점)를 찾아내세요.

**진행:**
1. 워크드 예제에서 만든 feature/add-bibimbap이 아니라, 반드시 main에서 다시 갈라져 나오도록 먼저 main으로 돌아갈 것 (git switch main)
2. feature/ 접두사 + 영문 소문자 + 하이픈 네이밍 규칙을 지켜 새 브랜치를 만들 것
3. recipes/kimchi-jjigae.md 파일을 만들어 제목과 재료를 적고 add → commit
4. git log --graph --oneline --all 로 main, feature/add-bibimbap, feature/add-kimchi-jjigae 세 포인터의 위치를 읽어볼 것
5. merge-base로 새 브랜치와 main의 분기점 SHA가 main의 마지막 커밋과 같은지 확인할 것

<details><summary>정답 보기</summary>

```bash
git switch main
git switch -c feature/add-kimchi-jjigae
printf '# 김치찌개\n\n## 재료\n- 김치, 돼지고기, 두부, 대파\n' > recipes/kimchi-jjigae.md
git add recipes/kimchi-jjigae.md
git commit -m "Add kimchi-jjigae recipe"
git log --graph --oneline --all
git merge-base main feature/add-kimchi-jjigae
git push -u origin feature/add-kimchi-jjigae
```

</details>

**✅ 자가검증:** git rev-parse --abbrev-ref HEAD 가 'feature/add-kimchi-jjigae' 를 출력하고, git log --graph --oneline --all 출력에서 (HEAD -> feature/add-kimchi-jjigae) 가 새 커밋에, (main) 은 그대로 이전 커밋에 붙어 트리가 갈라져 보이며, git merge-base main feature/add-kimchi-jjigae 의 SHA가 git log main -1 의 SHA와 일치하면 성공.

### ✅ 핵심 정리

- 브랜치는 파일 복사본이 아니라 커밋을 가리키는 가벼운 포인터다 — 새로 만드는 건 거의 공짜다.
- git switch -c feature/동사-대상 한 줄로 만들고 갈아탄다. 이름은 영문 소문자+하이픈, 한글·공백·대문자는 피한다.
- git log --graph --oneline --all 은 글자로 그린 커밋 트리이고, (HEAD -> ...)와 (main) 라벨이 각 포인터의 현재 위치다.
- merge-base는 두 브랜치가 갈라진 공통 조상(분기점)이며, 다음 챕터의 머지·충돌을 이해하는 기준점이다.

---

## 챕터 7. PR 협업 + 코드리뷰 + 충돌 해결

**⏱ 20분 · 🎨 혼합**

**학습 목표:** team-recipes 저장소에서 PR을 올려 리뷰(코멘트·승인·변경요청)를 받고, 같은 줄을 양쪽에서 고쳐 일부러 머지 충돌을 만든 뒤 PR에서 해결하며, merge·squash·rebase 세 가지 머지 방식과 fetch/pull·cherry-pick·revert까지 실전으로 익힌다.

### 📚 강의 흐름

**1. 이번 장의 그림: PR 한 바퀴 전체 흐름**

이번 장은 '브랜치 push → PR 생성 → 리뷰 → 충돌 해결 → 머지'라는 협업 한 바퀴를 team-recipes에서 직접 돕니다. 6장까지 만든 그 저장소를 그대로 이어서 진짜 충돌을 한 번 내고, 그걸 손으로 풀어보는 게 핵심이에요.

```bash
gh repo view --web
git switch main
git pull origin main
```
- 🖥 화면: montage 훅(3~4컷): 두 갈래 코드가 충돌해 빨간 마커가 튀는 컷 → PR 화면 → 초록 Merged 배지로 안도. 이어서 slides로 '오늘의 한 바퀴' 5단계(push→PR→review→conflict→merge) 가로 플로우 다이어그램.
- ⚠️ 함정: 작업 시작 전 git pull로 main을 최신화하지 않으면, 6장 이후 동료가 머지한 변경과 어긋나 시작부터 뒤처진 브랜치를 만든다. 항상 최신 main에서 브랜치를 딴다.

**2. 브랜치 push + gh pr create로 PR 올리기**

내 변경을 동료가 보려면 먼저 브랜치를 원격에 push하고, gh pr create로 Pull Request를 엽니다. -f(또는 --fill)를 쓰면 커밋 메시지로 제목·본문을 자동으로 채워줘서 빠르게 올릴 수 있어요.

```bash
git switch -c feature/add-bibimbap
git add recipes/bibimbap.md
git commit -m "feat: 비빔밥 레시피 추가"
git push -u origin feature/add-bibimbap
gh pr create --base main --head feature/add-bibimbap --title "비빔밥 레시피 추가" --body "기본 비빔밥 4인분 레시피입니다. 리뷰 부탁드려요."
gh pr view --web
```
- 🖥 화면: slides: 좌측 터미널(push→pr create 명령), 우측 GitHub PR 화면 목업. '-u origin = upstream 연결(다음부턴 git push만)' 콜아웃 강조.
- ⚠️ 함정: git push만 하고 PR을 안 만들면 동료에게는 아무 알림도 가지 않는다. push는 '원격에 브랜치 올림'이고 PR은 '리뷰/머지 요청'이라 별개 단계다. 또 -u 없이 push하면 'no upstream' 에러가 나니 첫 push엔 -u를 붙인다.

**3. 코드리뷰: comment · approve · request changes**

리뷰어(동료)는 PR에 줄 단위 코멘트를 달고, 승인(approve) 또는 변경요청(request changes)을 남깁니다. gh pr review로 터미널에서 바로 할 수 있고, 작성자는 코멘트를 반영해 추가 커밋을 push하면 같은 PR이 자동으로 갱신돼요.

```bash
gh pr checkout 1
gh pr review 1 --comment --body "분량 표기가 좋네요. 한 가지만 봐주세요."
gh pr review 1 --request-changes --body "4인분인데 밥 양이 2공기로 보여요. 수정 부탁해요."
gh pr review 1 --approve --body "수정 확인했습니다. LGTM!"
gh pr comment 1 --body "고추장 양도 1큰술로 맞췄습니다."
```
- 🖥 화면: slides: 세 가지 리뷰 액션 카드 비교표 — comment(의견만, 차단 안 함) / request changes(머지 차단) / approve(승인). 각 카드에 gh 명령 한 줄과 PR에서의 색상 배지(회색·빨강·초록).
- ⚠️ 함정: 자기 PR은 GitHub에서 본인이 approve할 수 없다(권한 오류). 그래서 실습은 둘째 계정/포크로 '동료' 역할을 직접 연기해야 한다. 또 request changes 상태가 남아 있으면 브랜치 보호 규칙에 따라 머지가 막히니, 재리뷰로 approve를 받아 풀어줘야 한다.

**4. 같은 줄 양쪽 수정 → 진짜 머지 충돌 만들기**

충돌은 두려운 게 아니라 '같은 줄을 두 브랜치가 다르게 고쳤다'는 신호일 뿐이에요. 동료가 main에서 bibimbap.md의 같은 줄을 먼저 고쳐 머지하고, 나는 내 브랜치에서 그 줄을 다르게 고친 뒤 main을 당겨오면 충돌이 재현됩니다.

```bash
git switch main
git pull origin main
git switch feature/add-bibimbap
git merge main
git status
```
- 🖥 화면: theory 시각화: 공통 조상 커밋 C에서 두 브랜치가 갈라져 같은 줄(밥 2공기 vs 밥 4공기)을 다르게 고치는 그래프가 그려지고, 합류 지점에서 빨간 충돌 마커가 깜빡이며 등장.
- ⚠️ 함정: '충돌=내가 뭘 망가뜨렸다'가 아니다. 머지는 멈춘 것뿐, 파일은 안전하다. 당황해서 git merge --abort로 무조건 되돌리기보다, 먼저 git status로 어떤 파일이 both modified인지 확인하는 습관을 들인다.

**5. 충돌 마커 읽고 해결한 뒤 PR 머지**

충돌 파일을 열면 <<<<<<< HEAD(내 변경) ======= (구분선) >>>>>>> main(상대 변경)이 보입니다. 원하는 최종 형태로 직접 고치고 마커 세 줄을 모두 지운 다음, add로 '해결됨' 표시하고 커밋하면 충돌이 끝나요. push하면 PR이 자동으로 다시 머지 가능 상태가 됩니다.

```bash
git status
git add recipes/bibimbap.md
git commit -m "merge: main 충돌 해결 (밥 4공기로 통일)"
git push
gh pr merge 1 --squash --delete-branch
```
- 🖥 화면: theory 시각화: 충돌 마커 3종(<<<<<<<, =======, >>>>>>>)이 한 줄씩 라벨과 함께 그려지고, 사용자가 한쪽을 선택하자 마커가 사라지며 한 줄로 합쳐지는 애니메이션. 마지막에 두 브랜치가 하나로 합류.
- ⚠️ 함정: <<<<<<<, =======, >>>>>>> 마커를 한 줄이라도 파일에 남기면 그게 그대로 레시피에 들어가 깨진다. 해결 후 git diff --check로 남은 마커가 없는지 확인한다. 또 양쪽 내용을 다 살리고 싶을 땐 둘 다 남기고 마커만 지우면 된다.

**6. merge vs squash vs rebase 머지 전략**

PR을 합치는 방법은 세 가지예요. merge는 모든 커밋과 머지 커밋을 그대로 남기고, squash는 PR의 여러 커밋을 하나로 합쳐 main을 깔끔하게 유지하며, rebase는 머지 커밋 없이 커밋들을 main 위에 일렬로 얹습니다. team-recipes 같은 학습/소규모 협업엔 이력이 깔끔한 squash를 추천해요.

```bash
gh pr merge 1 --merge
gh pr merge 1 --squash --delete-branch
gh pr merge 1 --rebase --delete-branch
git log --oneline --graph --all
```
- 🖥 화면: theory 시각화: 같은 PR을 세 방식으로 머지했을 때의 커밋 트리 3종 비교 — merge(다이아몬드형 머지 커밋) / squash(점 하나) / rebase(일렬). 3Blue1Brown 스타일로 선이 직접 그려짐.
- ⚠️ 함정: rebase/squash는 커밋 해시를 새로 만든다(이력 재작성). 이미 남이 받아간 공개 브랜치엔 절대 rebase하지 말 것 — '본인만 쓰는 로컬 브랜치'에서만 안전하다. 협업 main 머지 정책은 팀이 한 가지로 통일해두는 게 좋다.

**7. fetch/pull · cherry-pick · revert 마무리 도구**

fetch는 원격 변경을 '가져만' 오고 pull은 가져와서 합치기까지 합니다. 특정 커밋 하나만 다른 브랜치로 옮기려면 cherry-pick, 이미 머지된 잘못된 변경을 안전하게 되돌리려면 reset이 아니라 revert를 씁니다. revert는 되돌리는 '새 커밋'을 만들어 이력이 안전해요.

```bash
git fetch origin
git log origin/main --oneline -5
git switch -c hotfix/typo main
git cherry-pick a1b2c3d
git revert <머지커밋해시>
git push origin main
```
- 🖥 화면: slides: 4개 도구 한 장 요약 카드 — fetch(가져오기만) / pull(가져오기+합치기=fetch+merge) / cherry-pick(커밋 하나만 콕 집어 복사) / revert(되돌리는 새 커밋). 각 카드에 '언제 쓰나' 한 줄.
- ⚠️ 함정: 공개된 main을 git reset --hard로 되돌린 뒤 force push하면 동료의 이력이 날아간다. 공유 이력은 항상 revert로 되돌린다. revert가 머지 커밋을 가리킬 땐 -m 1(주 부모 기준)이 필요하다.

### 🧑‍🏫 따라하기 예시

team-recipes에 '비빔밥 레시피'를 추가하는 PR을 올리고, 동료가 변경요청 후 승인까지 하는 코드리뷰 한 바퀴를 돌립니다. 그다음 동료가 main에서 같은 줄(밥 분량)을 먼저 고쳐 머지하고, 내 브랜치도 그 줄을 다르게 고쳐 일부러 충돌을 낸 뒤, 충돌 마커를 직접 읽고 해결해 squash 머지로 마무리합니다. 마지막에 잘못 들어간 커밋 하나를 revert로 되돌립니다.

1. git switch main && git pull origin main  →  6장까지의 최신 main을 받아 시작점을 맞춘다
2. git switch -c feature/add-bibimbap  →  'feature/add-bibimbap' 브랜치로 전환됨
3. recipes/bibimbap.md 작성: 첫 줄 '# 비빔밥', '## 재료' 아래 '- 밥 2공기' 포함 → git add recipes/bibimbap.md && git commit -m "feat: 비빔밥 레시피 추가"  →  1 file changed 커밋 생성
4. git push -u origin feature/add-bibimbap  →  원격에 브랜치가 올라가고 upstream 연결됨('Branch set up to track...')
5. gh pr create --base main --head feature/add-bibimbap --title "비빔밥 레시피 추가" --body "기본 비빔밥 4인분 레시피입니다."  →  PR #1 URL이 출력됨(예: .../pull/1)
6. [동료 역할/둘째 계정] gh pr review 1 --request-changes --body "4인분인데 밥이 2공기네요. 4공기로 고쳐 주세요."  →  PR에 빨간 'Changes requested' 배지가 뜸
7. [작성자] bibimbap.md의 '- 밥 2공기'를 '- 밥 4공기'로 수정 → git commit -am "fix: 밥 4공기로 분량 정정" && git push  →  같은 PR #1이 새 커밋으로 자동 갱신됨
8. [동료 역할] gh pr review 1 --approve --body "확인했습니다. LGTM!"  →  초록 'Approved' 배지로 바뀜
9. 이제 충돌을 만든다: [동료 역할] main에서 직접 bibimbap.md의 같은 줄을 '- 밥 3공기'로 고쳐 커밋·머지(또는 GitHub 웹에서 main에 바로 커밋)  →  main의 그 줄이 '3공기'가 됨
10. [작성자] git switch feature/add-bibimbap && git merge main  →  'CONFLICT (content): Merge conflict in recipes/bibimbap.md' 출력, git status에 both modified 표시
11. bibimbap.md를 열어 <<<<<<< HEAD '- 밥 4공기' ======= '- 밥 3공기' >>>>>>> main 을 '- 밥 4공기'로 직접 통일하고 마커 3줄 삭제 → git diff --check 로 남은 마커 없음 확인
12. git add recipes/bibimbap.md && git commit -m "merge: main 충돌 해결 (밥 4공기로 통일)" && git push  →  PR #1이 'Mergeable' 상태로 복귀
13. gh pr merge 1 --squash --delete-branch  →  '✓ Merged' + 원격/로컬 브랜치 삭제, main에 비빔밥 레시피 한 커밋으로 합쳐짐
14. git switch main && git pull origin main && git log --oneline --graph -5  →  squash된 단일 커밋이 main 맨 위에 보임
15. (보너스) 직전 머지가 잘못됐다고 가정: git revert <머지커밋해시> -m 1 && git push origin main  →  변경을 되돌리는 새 'Revert' 커밋이 추가됨(이력은 보존)

**→ 결과:** team-recipes의 main에 비빔밥 레시피(밥 4공기로 통일)가 squash 머지로 한 커밋 깔끔하게 반영되고, PR #1은 'Merged'·feature 브랜치는 삭제, 잘못된 변경은 revert 커밋으로 되돌릴 수 있는 상태. push→PR→리뷰→충돌해결→머지의 협업 한 바퀴가 실제 이력에 남는다.

### ✍️ 실습 과제

**목표:** team-recipes에서 '김치찌개 레시피' PR을 직접 올리고, 같은 줄을 양쪽에서 다르게 고쳐 진짜 충돌을 낸 뒤 충돌을 해결하고 squash로 머지한다. (둘째 throwaway 계정이나 포크로 '동료' 역할을 직접 연기)

**진행:**
1. 최신 main에서 feature/add-kimchi-jjigae 브랜치를 새로 만든다(git switch -c).
2. recipes/kimchi-jjigae.md를 만들고 '- 김치 200g' 같은 분량 줄을 넣어 커밋한 뒤, push하고 gh pr create로 PR을 연다.
3. '동료' 역할로 그 PR에 request-changes 리뷰를 남기고, 작성자 역할로 코멘트를 반영해 추가 커밋을 push해 본다.
4. 충돌 만들기: '동료'가 main에서 kimchi-jjigae.md의 '김치 200g' 줄을 '김치 300g'로 고쳐 머지하고, 작성자는 자기 브랜치에서 같은 줄을 '김치 250g'로 고친다.
5. 작성자 브랜치에서 git merge main을 실행해 충돌을 재현하고, 마커를 읽고 최종값으로 통일해 해결한 뒤 커밋·push한다.
6. 충돌 마커가 하나도 안 남았는지 git diff --check로 확인한 다음, gh pr merge --squash --delete-branch로 합친다.

<details><summary>정답 보기</summary>

```bash
git switch main && git pull origin main
git switch -c feature/add-kimchi-jjigae
printf '# 김치찌개\n\n## 재료\n- 김치 200g\n- 돼지고기 150g\n' > recipes/kimchi-jjigae.md
git add recipes/kimchi-jjigae.md && git commit -m "feat: 김치찌개 레시피 추가"
git push -u origin feature/add-kimchi-jjigae
gh pr create --base main --head feature/add-kimchi-jjigae --title "김치찌개 레시피 추가" --body "2인분 기준 김치찌개입니다."
gh pr review <PR번호> --request-changes --body "김치 양을 더 늘려도 좋겠어요."   # 동료 역할(둘째 계정)
# [동료] main에서 같은 줄을 300g으로: git switch main && sed -i 's/김치 200g/김치 300g/' recipes/kimchi-jjigae.md && git commit -am "tweak: 김치 300g" && git push origin main
# [작성자] 자기 브랜치에서 250g으로: git switch feature/add-kimchi-jjigae && sed -i 's/김치 200g/김치 250g/' recipes/kimchi-jjigae.md && git commit -am "fix: 김치 250g"
git merge main   # CONFLICT (content): Merge conflict in recipes/kimchi-jjigae.md
# 에디터에서 <<<<<<< ======= >>>>>>> 마커 삭제 후 '- 김치 300g'으로 통일
git diff --check && git add recipes/kimchi-jjigae.md && git commit -m "merge: 충돌 해결 (김치 300g)" && git push
gh pr merge <PR번호> --squash --delete-branch
```

</details>

**✅ 자가검증:** git switch main && git pull origin main 후 recipes/kimchi-jjigae.md에 '- 김치 300g'만 있고 <<<<<<< 같은 충돌 마커가 전혀 없으면 성공. gh pr view <PR번호> 출력의 상태가 'MERGED'이고, git log --oneline -3에 김치찌개 커밋이 squash된 단일 커밋으로 보이면 한 바퀴 완료.

### ✅ 핵심 정리

- push는 '원격에 브랜치 올림', PR은 '리뷰·머지 요청'으로 별개 단계 — 첫 push엔 -u origin을 붙인다.
- 리뷰는 comment(의견)·request-changes(머지 차단)·approve(승인) 3종이며, 자기 PR은 본인이 approve할 수 없어 '동료' 역할이 필요하다.
- 충돌은 '같은 줄을 양쪽이 다르게 고쳤다'는 신호일 뿐 — <<<<<<< ======= >>>>>>> 마커를 모두 지우고 add·commit하면 끝, git diff --check로 잔여 마커를 확인한다.
- 공유된 main을 되돌릴 땐 reset+force push가 아니라 revert(되돌리는 새 커밋)를 쓰고, rebase/squash는 본인 로컬 브랜치에서만 한다.

---

## 챕터 8. 브랜치 전략 + 실전 시나리오 + 마무리

**⏱ 15분 · 🎨 혼합**

**학습 목표:** GitHub Flow·Git Flow·트렁크 기반 전략의 차이와 선택 기준을 이해하고, team-recipes에 팀 규칙(CONTRIBUTING.md)을 PR로 머지하며 처음부터 끝까지의 2인 협업 흐름을 스스로 완주한다.

### 📚 강의 흐름

**1. 인트로 훅 — 전략이 없으면 main이 무너진다**

지금까지 브랜치, PR, 충돌 해결까지 배웠지만 팀이 커지면 '언제 어디서 브랜치를 따고 누가 머지하는가'라는 규칙이 없으면 main이 금세 엉망이 됩니다. 마지막 장에서는 그 규칙, 즉 브랜치 전략을 정합니다.
- 🖥 화면: montage 인트로 1컷: 정리 안 된 브랜치들이 main으로 무질서하게 쏟아지는 어두운 그래프, 그 위로 챕터 제목 카드. 이후 slides로 전환.
- ⚠️ 함정: 전략을 '대기업만의 것'으로 오해하기. 2명짜리 team-recipes에도 최소 규칙(main 보호 + PR 머지)은 필요하다는 점을 먼저 못 박는다.

**2. 세 가지 전략 한눈에 — GitHub Flow vs Git Flow vs 트렁크 기반**

GitHub Flow는 main 하나에 짧은 기능 브랜치를 따 PR로 합치는 가장 단순한 모델이고, Git Flow는 main·develop·feature·release·hotfix로 나눈 버전 릴리스용 모델, 트렁크 기반은 거의 main에 직접(또는 수시간짜리 초단기 브랜치로) 자주 커밋하며 기능 플래그로 미완성을 가립니다. team-recipes 같은 소규모 협업은 GitHub Flow가 정답입니다.
- 🖥 화면: theory 다이어그램: 같은 커밋 타임라인을 세 가지 전략으로 그려 애니메이션. (1) GitHub Flow=main+짧은 feature 브랜치, (2) Git Flow=main/develop/release/hotfix 다층 트리, (3) 트렁크=main에 촘촘한 커밋+짧은 가지. 각 위에 '언제 쓰나' 라벨이 그려짐.
- ⚠️ 함정: 초보가 멋있어 보여서 Git Flow를 2인 프로젝트에 도입하기. develop·release 브랜치가 오히려 관리 부담만 늘린다는 걸 다이어그램으로 대비시켜 보여준다.

**3. 언제 무엇을 — 선택 기준과 우리의 결정**

릴리스 버전을 동시에 여러 개 유지(예: v1, v2 동시 지원)해야 하면 Git Flow, 하루에도 여러 번 배포하는 CI/CD 강한 팀이면 트렁크 기반, 그 외 대부분의 웹/문서/소규모 협업은 GitHub Flow가 적합합니다. team-recipes는 'main은 항상 배포 가능, 모든 변경은 PR로'라는 GitHub Flow 규칙을 채택합니다.
- 🖥 화면: slides 결정 표: 3열(전략 | 적합한 상황 | 브랜치 수명). 마지막 줄에 코랄 강조로 'team-recipes → GitHub Flow' 도장처럼 찍힘.
- ⚠️ 함정: 전략을 한 번 정하고 끝이라고 생각하기. 팀 규모·배포 빈도가 바뀌면 전략도 바뀐다는 점을 짧게 언급.

**4. 팀 규칙을 문서로 — CONTRIBUTING.md와 브랜치 보호**

전략은 머릿속이 아니라 저장소 안 문서로 있어야 새 동료가 봅니다. 핵심 규칙(브랜치 네이밍 feat/, fix/, docs/ · main 직접 push 금지 · PR 1명 승인 후 머지 · Squash merge)을 CONTRIBUTING.md에 적고, gh로 main에 브랜치 보호 규칙을 걸어 규칙을 강제합니다.

```bash
gh repo view shain1912/team-recipes --web
gh api -X PUT repos/shain1912/team-recipes/branches/main/protection -f "required_pull_request_reviews[required_approving_review_count]=1" -F "enforce_admins=true" -F "required_status_checks=null" -F "restrictions=null"
```
- 🖥 화면: slides: CONTRIBUTING.md 6줄 규칙을 체크박스 리스트로. 옆에 GitHub 'Require a pull request before merging' 토글이 켜지는 모습.
- ⚠️ 함정: 혼자 실습할 때 enforce_admins=true로 잠그면 본인도 직접 push가 막혀 당황하기. 실습은 어차피 PR로 머지하므로 의도된 동작임을 설명하고, 막히면 Settings에서 잠시 끌 수 있다고 안내.

**5. 워크드 예제 — CONTRIBUTING.md를 PR로 머지**

방금 정한 규칙을 그대로 실천합니다. docs/contributing 브랜치를 따 CONTRIBUTING.md를 커밋하고, gh로 PR을 올린 뒤 squash 머지합니다. 이게 앞으로 team-recipes의 모든 변경이 따를 표준 사이클입니다.

```bash
cd team-recipes && git switch main && git pull
git switch -c docs/contributing
git add CONTRIBUTING.md && git commit -m "docs: add team contributing guide"
git push -u origin docs/contributing
gh pr create --title "docs: 팀 기여 가이드 추가" --body "GitHub Flow 채택, 브랜치 네이밍/PR 규칙 명시"
gh pr merge --squash --delete-branch
```
- 🖥 화면: theory 미니 트리: docs/contributing 브랜치가 main에서 갈라졌다가 squash 한 점으로 main에 합쳐지는 애니메이션. 머지 후 main HEAD가 새 커밋으로 이동.
- ⚠️ 함정: gh pr merge가 'not mergeable / review required'로 막히는 경우. 브랜치 보호를 켰다면 본인 PR이라도 승인이 필요 — 동료 계정으로 gh pr review --approve 하거나 실습 한정으로 승인 수를 0으로 두는 대안을 제시.

**6. 처음부터 끝까지 — 2인 협업 풀 시나리오 복습**

8개 장을 한 흐름으로 잇습니다: 저장소 생성 → 동료 초대 → 각자 feat 브랜치 → PR 리뷰 → 충돌 발생 → 해결 → 전략대로 머지. 이 한 사이클이 모든 협업의 뼈대이며, 도구만 바뀔 뿐 흐름은 동일합니다.

```bash
git switch main && git pull --prune
git log --oneline --graph --all
```
- 🖥 화면: theory 풀 타임라인: 1장~8장 각 사건을 한 줄 커밋 그래프 위에 순서대로 점등시키며 전체 협업 여정을 한 화면에 완성.
- ⚠️ 함정: 각 장을 따로따로 외운 것으로 끝내기. '하나의 반복되는 사이클'이라는 큰 그림을 놓치지 않도록 그래프로 다시 묶어준다.

**7. 최종 체크리스트 + 다음 단계 (플랫폼 중립 CTA)**

협업 준비 완료 체크리스트로 스스로 점검하고, 다음 단계로 GitHub Actions CI, 이슈/프로젝트 보드, 오픈소스 기여를 제시합니다. 오늘 만든 team-recipes를 포트폴리오로 남기고, 다음 강의로 이어가세요.
- 🖥 화면: slides 마무리: 8칸 체크리스트가 차례로 체크되고, '다음 단계 3가지' 카드. CTA는 '오늘 만든 저장소를 포트폴리오로 남기고 다음 강의에서 이어가요'처럼 플랫폼 중립 문구.
- ⚠️ 함정: 구독/좋아요 같은 플랫폼 종속 CTA를 넣는 것. 크로스포스트 콘텐츠이므로 절대 금지 — '다음 강의/직접 실습' 형태의 중립 CTA만 사용.

### 🧑‍🏫 따라하기 예시

8장까지 키워온 team-recipes에 팀의 협업 규칙을 문서로 박습니다. GitHub Flow를 공식 채택하고, main 브랜치 보호 규칙을 건 뒤, CONTRIBUTING.md를 'docs/contributing' 브랜치 → PR → squash 머지로 합쳐 우리가 정한 규칙을 우리 손으로 처음 실천합니다.

1. git switch main && git pull --prune  →  로컬 main이 최신으로 갱신되고 지난 장에서 삭제된 원격 브랜치 추적이 정리된다
2. git switch -c docs/contributing  →  'Switched to a new branch "docs/contributing"' 출력, 작업 브랜치 분기
3. (편집기로) CONTRIBUTING.md 작성: '# team-recipes 기여 가이드 / 브랜치 전략: GitHub Flow / 브랜치 네이밍: feat/, fix/, docs/ / main 직접 push 금지, 모든 변경은 PR / PR은 동료 1명 승인 후 Squash merge / 커밋 메시지는 type: 설명 형식' 6줄
4. git add CONTRIBUTING.md && git commit -m "docs: add team contributing guide"  →  '1 file changed, ... insertions(+)' 커밋 생성
5. git push -u origin docs/contributing  →  원격에 브랜치 푸시, 출력 끝에 PR 생성 링크가 표시됨
6. gh pr create --title "docs: 팀 기여 가이드 추가" --body "GitHub Flow 채택, 브랜치 네이밍/PR 규칙 명시"  →  새 PR URL(예: https://github.com/shain1912/team-recipes/pull/N)이 출력됨
7. gh pr merge --squash --delete-branch  →  PR이 squash로 main에 머지되고 'Deleted branch docs/contributing' 출력, 원격 브랜치 자동 삭제
8. git switch main && git pull  →  로컬 main에 CONTRIBUTING.md가 내려와 GitHub 첫 화면과 PR 탭에 'Contributing' 가이드가 보인다

**→ 결과:** team-recipes의 main에 CONTRIBUTING.md가 squash 커밋 하나로 머지되어, 저장소가 이제 명문화된 GitHub Flow 규칙을 갖춘다. git log --oneline --graph --all 로 docs/contributing이 한 점으로 main에 합쳐진 깔끔한 트리를 확인할 수 있다.

### ✍️ 실습 과제

**목표:** team-recipes에 '리뷰 규칙' 한 가지를 추가하는 두 번째 기여를, 배운 GitHub Flow 사이클 그대로 PR로 머지해 스스로 협업 한 바퀴를 완주한다.

**진행:**
1. main을 최신화하고(git switch main && git pull) 새 브랜치 docs/review-rule 을 만든다
2. CONTRIBUTING.md 끝에 '## 리뷰 규칙' 한 줄을 추가한다 (예: 'PR은 24시간 내 리뷰, 최소 1명 승인 후 머지')
3. 변경을 'docs: add review rule' 메시지로 커밋하고 origin에 푸시한다
4. gh pr create 로 PR을 올린다 (제목/본문은 자유롭게)
5. 혼자라면 동료 throwaway 계정 또는 본인 두 번째 계정으로 gh pr review --approve 한 뒤, gh pr merge --squash --delete-branch 로 머지한다
6. main을 pull 해 변경이 반영됐는지 확인한다

<details><summary>정답 보기</summary>

```bash
git switch main && git pull --prune
git switch -c docs/review-rule
printf '\n## 리뷰 규칙\n- PR은 24시간 내 리뷰하고, 최소 1명 승인 후 머지합니다.\n' >> CONTRIBUTING.md
git add CONTRIBUTING.md && git commit -m "docs: add review rule"
git push -u origin docs/review-rule
gh pr create --title "docs: 리뷰 규칙 추가" --body "24시간 내 리뷰 + 1명 승인 규칙 명시"
gh pr review --approve   # (동료/두 번째 계정에서 실행)
gh pr merge --squash --delete-branch
git switch main && git pull
```

</details>

**✅ 자가검증:** gh pr list --state merged 에 방금 PR이 보이고, main에서 git log --oneline -1 의 최신 커밋이 'docs: add review rule' 이며 CONTRIBUTING.md 끝에 '## 리뷰 규칙' 섹션이 들어 있으면 성공. git log --oneline --graph --all 로 docs/review-rule이 한 점으로 main에 합쳐진 것도 확인한다.

### ✅ 핵심 정리

- 전략은 '규모와 배포 빈도'로 고른다: 소규모 협업=GitHub Flow, 다중 버전 릴리스=Git Flow, 잦은 배포·CI 강함=트렁크 기반.
- 전략은 머릿속이 아니라 CONTRIBUTING.md와 브랜치 보호 규칙으로 저장소 안에 박아야 강제력이 생긴다.
- 협업의 본질은 하나의 반복 사이클: 브랜치 → 커밋 → 푸시 → PR → 리뷰 → (충돌 해결) → 머지. 도구가 바뀌어도 흐름은 같다.
- 오늘 만든 team-recipes를 포트폴리오로 남기고, 다음 단계는 GitHub Actions CI·이슈/프로젝트 보드·오픈소스 기여로 이어간다.

---

## 🏭 팩토리 제작 매핑

- 각 챕터 = `project.json` 의 한 **섹션**(`"section":"ch1"` …). 30분 넘는 장편이므로 섹션별로 렌더하고 ffmpeg로 합칩니다.
- 챕터별 템플릿: 개념/명령 설명 = `slides`, 도입 훅 = `montage`, **깃 트리/머지/워크트리 동작원리 = `gitgraph`**(이미 구현·데모 완료).
- 워크플로우: `node factory/build.mjs github-collab` (내레이션 생성) → `node factory/render.mjs github-collab` (섹션별 렌더+합치기). 한 챕터 수정 시 `--only ch6`.
- 자동 검수(verify)는 세션 한도로 미완료 → 명령어는 2026년 기준(gh ≥2.x, git switch, fine-grained PAT)으로 작성됨. 실제 제작 전 챕터별 명령 1회 실측 권장.
