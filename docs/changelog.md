---
title: 변경 로그
description: 새로운 기능, 개선 사항 및 버전별 버그 수정을 포함한 Claude Code 릴리스 노트.
---

# 변경 로그

> 새로운 기능, 개선 사항 및 버전별 버그 수정을 포함한 Claude Code 릴리스 노트.

이 페이지는 [GitHub의 CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)에서 생성됩니다.

`claude --version` 명령어로 설치된 버전을 확인하세요.

<details><summary>2.1.107 (April 14, 2026)</summary>

  * 긴 작업 중 사고 힌트를 더 빨리 표시하도록 개선

</details>

<details><summary>2.1.105 (April 13, 2026)</summary>

  * `EnterWorktree` 도구에 `path` 파라미터 추가: 현재 저장소의 기존 worktree로 전환 가능
  * PreCompact hook 지원 추가: hook이 종료 코드 2 또는 `{"decision":"block"}` 반환으로 컴팩션 차단 가능
  * 플러그인에 대한 백그라운드 모니터 지원 추가: 최상위 `monitors` manifest 키를 통해 세션 시작 또는 skill 호출 시 자동 활성화
  * `/proactive`가 `/loop`의 별칭으로 추가됨
  * 정체된 API 스트림 처리 개선: 데이터 없이 5분 후 스트림이 중단되고 무한 대기 대신 비스트리밍으로 재시도
  * 네트워크 오류 메시지 개선: 연결 오류 시 조용한 스피너 대신 즉시 재시도 메시지 표시
  * 파일 쓰기 표시 개선: 긴 단일 줄 쓰기(예: 압축된 JSON)가 여러 화면에 걸쳐 페이지 분할되지 않고 UI에서 잘림 처리됨
  * `/doctor` 레이아웃을 상태 아이콘으로 개선; `f`를 눌러 Claude가 발견된 문제를 수정하도록 할 수 있음
  * `/config` 레이블 및 설명의 명확성 개선
  * skill 설명 처리 개선: 목록 표시 한도가 250자에서 1,536자로 높아지고, 설명이 잘릴 때 시작 시 경고 추가
  * `WebFetch` 개선: 가져온 페이지에서 `<style>` 및 `<script>` 내용을 제거하여 CSS가 많은 페이지가 실제 텍스트에 도달하기 전에 콘텐츠 예산을 소진하지 않도록 함
  * 정체된 에이전트 worktree 정리 개선: PR이 squash-merge된 worktree를 무기한 유지하는 대신 제거
  * MCP 대용량 출력 잘림 프롬프트 개선: JSON에는 `jq`, 텍스트에는 계산된 Read 청크 크기 등 형식별 레시피 제공
  * 대기 중인 메시지(Claude 작업 중 전송)에 첨부된 이미지가 삭제되던 버그 수정
  * 긴 대화에서 프롬프트 입력이 두 번째 줄로 넘어갈 때 화면이 빈 화면으로 되던 버그 수정
  * 전체화면 모드에서 여러 줄의 어시스턴트 응답을 선택할 때 선행 공백이 복사되던 버그 수정
  * 어시스턴트 메시지에서 선행 공백이 잘려 ASCII 아트와 들여쓰기된 다이어그램이 깨지던 버그 수정
  * 클릭 가능한 파일 링크를 출력하는 명령어(예: Python `rich`/`loguru` 로깅) 실행 시 bash 출력이 깨지던 버그 수정
  * ESC-prefix alt 인코딩을 사용하는 터미널에서 alt+enter가 줄바꿈을 삽입하지 않고, Ctrl+J가 줄바꿈을 삽입하지 않던 버그 수정 (2.1.100 회귀)
  * EnterWorktree/ExitWorktree 도구 표시에서 "Creating worktree" 텍스트가 중복되던 버그 수정
  * 포커스 모드에서 대기 중인 사용자 프롬프트가 사라지던 버그 수정
  * 파일 감시자가 실행 후 정리를 놓쳤을 때 일회성 예약 작업이 반복 실행되던 버그 수정
  * Team/Enterprise 사용자의 인바운드 채널 알림이 첫 메시지 이후 조용히 삭제되던 버그 수정
  * `package.json` 및 lockfile이 있는 마켓플레이스 플러그인의 의존성이 설치/업데이트 후 자동으로 설치되지 않던 버그 수정
  * 업데이트 중 플러그인 프로세스가 파일을 열고 있을 때 마켓플레이스 자동 업데이트가 공식 마켓플레이스를 손상된 상태로 만들던 버그 수정
  * `/resume`, `--worktree`, `/branch` 이후 종료 시 "Resume this session with..." 힌트가 출력되지 않던 버그 수정
  * 더 긴 프롬프트 끝에 입력할 때 피드백 설문 단축키가 실행되던 버그 수정
  * stdio MCP 서버가 잘못된(비 JSON) 출력을 내보낼 때 "Connection closed"로 빠르게 실패하는 대신 세션이 중단되던 버그 수정
  * MCP 서버가 비동기로 연결될 때 headless/remote-trigger 세션의 첫 번째 턴에서 MCP 도구가 누락되던 버그 수정
  * 인퍼런스 프로파일 탐색이 진행 중일 때 AWS Bedrock 비미국 지역에서 `/model` 선택기가 잘못된 `us.*` 모델 ID를 `settings.json`에 저장하던 버그 수정
  * API 키, Bedrock, Vertex 사용자에게 429 rate-limit 오류가 원시 JSON 덤프 대신 깔끔한 메시지로 표시되지 않던 버그 수정
  * 세션에 잘못된 텍스트 블록이 포함될 때 resume 시 충돌하던 버그 수정
  * 터미널 높이가 짧을 때 `/help`에서 탭 바, Shortcuts 제목, 푸터가 누락되던 버그 수정
  * `keybindings.json`의 잘못된 keybinding 항목 값이 명확한 오류 없이 자동으로 로드되던 버그 수정
  * 하나의 프로젝트 설정에서 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`이 해당 머신의 모든 프로젝트의 사용 메트릭을 영구적으로 비활성화하던 버그 수정
  * SSH/mosh를 통해 Ghostty, Kitty, Alacritty, WezTerm, foot, rio, Contour를 사용할 때 16색 팔레트가 흐릿하게 표시되던 버그 수정
  * 플랜 모드 종료 시 Bash 도구가 더 높은 권한 수준에서 다운그레이드될 때 `acceptEdits` 권한 모드를 제안하던 버그 수정

</details>

<details><summary>2.1.101 (April 10, 2026)</summary>

  * 로컬 Claude Code 사용 내역에서 팀원 온보딩 가이드를 생성하는 `/team-onboarding` 명령어 추가
  * OS CA 인증서 저장소를 기본적으로 신뢰하도록 추가: 추가 설정 없이 기업 TLS 프록시가 작동 (번들 CA만 사용하려면 `CLAUDE_CODE_CERT_STORE=bundled` 설정)
  * `/ultraplan` 및 기타 원격 세션 기능이 웹 설정 없이 기본 클라우드 환경을 자동 생성하도록 개선
  * Claude가 구조화된 메시지 대신 일반 텍스트로 응답할 때 brief 모드가 한 번 재시도하도록 개선
  * 포커스 모드 개선: Claude가 마지막 메시지만 표시된다는 것을 알기 때문에 더 자기완결적인 요약 작성
  * 도구가 존재하지만 현재 컨텍스트에서 사용할 수 없을 때 모델이 해당 도구를 호출하면 이유와 진행 방법을 설명하는 오류 메시지 개선
  * rate-limit 재시도 메시지 개선: 어느 한도에 도달했는지, 언제 재설정되는지를 불투명한 초 카운트다운 대신 표시
  * 거부 오류 메시지 개선: 사용 가능한 경우 API 제공 설명 포함
  * `claude -p --resume <name>`이 `/rename` 또는 `--name`으로 설정된 세션 제목을 허용하도록 개선
  * 설정 복원력 개선: `settings.json`에서 인식되지 않는 hook 이벤트 이름이 더 이상 전체 파일 무시를 유발하지 않음
  * `allowManagedHooksOnly`가 설정된 경우 managed settings에 의해 강제 활성화된 플러그인의 plugin hook이 실행되도록 개선
  * 마켓플레이스를 새로 고칠 수 없을 때 `/plugin` 및 `claude plugin update`가 오래된 버전을 조용히 보고하는 대신 경고를 표시하도록 개선
  * 사용자의 조직 또는 인증 설정이 웹에서 Claude Code에 도달할 수 없을 때 플랜 모드에서 "Refine with Ultraplan" 옵션을 숨기도록 개선
  * 베타 추적 개선: `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT` 준수; 옵트인하지 않으면 민감한 span 속성이 더 이상 내보내지지 않음
  * SDK `query()`가 소비자가 `for await`에서 `break`하거나 `await using`을 사용할 때 서브프로세스와 임시 파일을 정리하도록 개선
  * LSP 바이너리 감지에서 사용되는 POSIX `which` 폴백의 명령어 삽입 취약점 수정
  * 가상 스크롤러에서 긴 세션이 메시지 목록의 수십 개의 이전 복사본을 유지하던 메모리 누수 수정
  * 로더가 라이브 대화 대신 막힌 분기에 고정될 때 `--resume`/`--continue`가 대용량 세션에서 대화 컨텍스트를 잃던 버그 수정
  * `--resume` 체인 복구가 주 체인 쓰기 간격 근처에 서브에이전트 메시지가 있을 때 관련 없는 서브에이전트 대화로 브리징하던 버그 수정
  * 저장된 Edit/Write 도구 결과에 `file_path`가 없을 때 `--resume` 시 충돌하던 버그 수정
  * `API_TIMEOUT_MS`에 관계없이 느린 백엔드(로컬 LLM, 확장 사고, 느린 게이트웨이)를 중단하던 하드코딩된 5분 요청 타임아웃 수정
  * `permissions.deny` 규칙이 PreToolUse hook의 `permissionDecision: "ask"`를 재정의하지 못하던 버그 수정 — 이전에는 hook이 deny를 프롬프트로 다운그레이드할 수 있었음
  * `--setting-sources`에 `user`가 없을 때 백그라운드 정리가 `cleanupPeriodDays`를 무시하고 30일 이상된 대화 내역을 삭제하던 버그 수정
  * `ANTHROPIC_AUTH_TOKEN`, `apiKeyHelper`, 또는 `ANTHROPIC_CUSTOM_HEADERS`가 Authorization 헤더를 설정할 때 Bedrock SigV4 인증이 403 오류로 실패하던 버그 수정
  * 이전 세션의 worktree 정리가 오래된 디렉터리를 남겼을 때 `claude -w <name>`이 "already exists" 오류로 실패하던 버그 수정
  * 서브에이전트가 동적으로 삽입된 서버의 MCP 도구를 상속하지 않던 버그 수정
  * 격리된 worktree에서 실행 중인 서브에이전트가 자신의 worktree 내 파일에 대한 Read/Edit 접근을 거부당하던 버그 수정
  * 새로 부팅한 후 샌드박스된 Bash 명령어가 `mktemp: No such file or directory` 오류로 실패하던 버그 수정
  * `outputSchema`를 검증하는 MCP 클라이언트에서 `claude mcp serve` 도구 호출이 "Tool execution failed"로 실패하던 버그 수정
  * `RemoteTrigger` 도구의 `run` 액션이 빈 본문을 전송하여 서버에서 거부되던 버그 수정
  * 여러 `/resume` 선택기 문제 수정: 다른 프로젝트의 세션을 숨기는 좁은 기본 뷰, Windows Terminal에서 도달할 수 없는 미리보기, worktree의 잘못된 cwd, stderr에 표시되지 않는 세션 찾기 오류, 설정되지 않는 터미널 제목, 프롬프트 입력과 겹치는 resume 힌트
  * 내장 ripgrep 바이너리 경로가 오래되었을 때(VS Code 확장 자동 업데이트, macOS App Translocation) Grep 도구 ENOENT 수정; 이제 시스템 `rg`로 폴백하고 세션 중 자가 복구
  * `/btw` 사용 시마다 전체 대화 복사본을 디스크에 쓰던 버그 수정
  * `/context` 여유 공간과 메시지 분류가 헤더 비율과 불일치하던 버그 수정
  * 여러 플러그인 문제 수정: 중복된 `name:` frontmatter로 잘못된 플러그인에 슬래시 명령어 해석, `ENAMETOOLONG` 오류로 `/plugin update` 실패, 이미 설치된 플러그인을 보여주는 Discover, 오래된 버전 캐시에서 로드되는 디렉터리 소스 플러그인, `context: fork` 및 `agent` frontmatter 필드를 준수하지 않는 skill
  * `headersHelper`로 구성된 MCP 서버에 대해 `/mcp` 메뉴가 OAuth 전용 작업을 제공하던 버그 수정; 이제 helper 스크립트를 다시 호출하기 위해 Reconnect가 제공됨
  * Terminal.app, 기본 iTerm2, xterm과 같이 원시 C0 제어 바이트를 전송하는 터미널에서 `ctrl+]`, `ctrl+\`, `ctrl+^` 키바인딩이 실행되지 않던 버그 수정
  * `/login` OAuth URL이 깔끔한 마우스 선택을 방해하는 패딩으로 렌더링되던 버그 수정
  * 렌더링 문제 수정: 표시 영역 위의 내용이 변경될 때 비전체화면 모드에서 깜박임, 비전체화면 모드에서 긴 세션 중 터미널 스크롤백 지워짐, 가끔 마우스 스크롤 이스케이프 시퀀스가 텍스트로 프롬프트에 누출됨
  * `settings.json` env 값이 문자열 대신 숫자일 때 충돌하던 버그 수정
  * 인앱 설정 쓰기(예: `/add-dir --remember`, `/config`)가 인메모리 스냅샷을 새로 고치지 않아 제거된 디렉터리가 세션 중에 취소되지 않던 버그 수정
  * Bedrock, Vertex 및 기타 서드파티 공급자에서 사용자 정의 키바인딩(`~/.claude/keybindings.json`)이 로드되지 않던 버그 수정
  * `claude --continue -p`가 `-p` 또는 SDK로 생성된 세션을 올바르게 계속하지 않던 버그 수정
  * 여러 Remote Control 문제 수정: 세션 충돌 시 제거된 worktree, 전사본에 유지되지 않는 연결 실패, 로컬 세션에 대한 brief 모드의 가짜 "Disconnected" 표시기, `CLAUDE_CODE_ORGANIZATION_UUID`만 설정된 경우 SSH에서 `/remote-control` 실패
  * `/insights`가 때때로 응답에서 보고서 파일 링크를 생략하던 버그 수정
  * \[VSCode] 마지막 편집기 탭이 닫힐 때 채팅 입력 아래의 파일 첨부가 지워지지 않던 버그 수정

</details>

<details><summary>2.1.98 (April 9, 2026)</summary>

  * 로그인 화면에서 "3rd-party platform"을 선택할 때 접근 가능한 대화형 Google Vertex AI 설정 마법사 추가: GCP 인증, 프로젝트 및 지역 구성, 자격 증명 확인, 모델 고정 안내
  * `CLAUDE_CODE_PERFORCE_MODE` env var 추가: 설정 시 Edit/Write/NotebookEdit이 읽기 전용 파일에서 자동으로 덮어쓰는 대신 `p4 edit` 힌트와 함께 실패
  * 백그라운드 스크립트의 스트리밍 이벤트를 위한 Monitor 도구 추가
  * Linux에서 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`가 설정되었을 때 PID 네임스페이스 격리를 통한 서브프로세스 샌드박싱 추가, 세션당 스크립트 호출을 제한하는 `CLAUDE_CODE_SCRIPT_CAPS` env var 추가
  * 교차 사용자 프롬프트 캐싱 개선을 위한 print 모드에 `--exclude-dynamic-system-prompt-sections` 플래그 추가
  * 현재 디렉터리가 연결된 git worktree 내부에 있을 때 설정되는 상태 표시줄 JSON 입력에 `workspace.git_worktree` 추가
  * OTEL 추적이 활성화될 때 Bash 도구 서브프로세스에 W3C `TRACEPARENT` env var 추가: 자식 프로세스 span이 Claude Code의 추적 트리에 올바르게 부모화됨
  * LSP: Claude Code가 이제 초기화 요청에서 `clientInfo`를 통해 언어 서버에 자신을 식별
  * 백슬래시 이스케이프된 플래그가 읽기 전용으로 자동 허용되어 임의 코드 실행으로 이어질 수 있는 Bash 도구 권한 우회 수정
  * 자동 및 bypass-permissions 모드에서 복합 Bash 명령어가 보안 검사 및 명시적 ask 규칙에 대한 강제 권한 프롬프트를 우회하던 버그 수정
  * env-var 접두사가 있는 읽기 전용 명령어가 var가 알려진 안전 목록(`LANG`, `TZ`, `NO_COLOR` 등)에 없으면 프롬프트를 표시하지 않던 버그 수정
  * `/dev/tcp/...` 또는 `/dev/udp/...`로의 리다이렉션이 자동 허용 대신 프롬프트를 표시하지 않던 버그 수정
  * 정체된 스트리밍 응답이 비스트리밍 모드로 폴백하는 대신 타임아웃되던 버그 수정
  * 서버가 작은 `Retry-After`를 반환할 때 429 재시도가 약 13초 만에 모든 시도를 소진하던 버그 수정 — 이제 지수 백오프가 최솟값으로 적용됨
  * 재시작 후 토큰 새로 고침 시 MCP OAuth `oauth.authServerMetadataUrl` 구성 재정의가 적용되지 않던 버그 수정, ADFS 및 유사한 IdP에 영향
  * kitty 키보드 프로토콜이 활성화된 경우 xterm 및 VS Code 통합 터미널에서 대문자가 소문자로 변환되던 버그 수정
  * macOS 텍스트 대체가 대체 텍스트를 삽입하는 대신 트리거 단어를 삭제하던 버그 수정
  * Bash를 통해 보호된 경로에 대한 쓰기를 승인한 후 `--dangerously-skip-permissions`가 조용히 accept-edits 모드로 다운그레이드되던 버그 수정
  * 프로세스 재시작 전까지 관리자가 제거한 후에도 managed-settings allow 규칙이 활성 상태로 유지되던 버그 수정
  * `permissions.additionalDirectories` 변경이 세션 중간에 적용되지 않던 버그 수정 — 제거된 디렉터리는 즉시 접근이 취소되고 추가된 디렉터리는 재시작 없이 작동
  * `additionalDirectories`에서 디렉터리를 제거하면 `--add-dir`로 전달된 동일 디렉터리의 접근도 취소되던 버그 수정
  * `Bash(cmd:*)` 및 `Bash(git commit *)` 와일드카드 권한 규칙이 추가 공백이나 탭이 있는 명령어와 일치하지 않던 버그 수정
  * 파이프된 명령어에서 `cd`와 다른 세그먼트를 혼합할 때 `Bash(...)` deny 규칙이 프롬프트로 다운그레이드되던 버그 수정
  * `cut -d /`, `paste -d /`, `column -s /`, `awk '{print $1}' file`, 및 `%`를 포함한 파일명에 대한 거짓 Bash 권한 프롬프트 수정
  * JavaScript 프로토타입 속성과 일치하는 이름(예: `toString`)을 가진 권한 규칙이 `settings.json`을 조용히 무시하도록 만들던 버그 수정
  * `--dangerously-skip-permissions` 사용 시 에이전트 팀 멤버가 리더의 권한 모드를 상속하지 않던 버그 수정
  * 전체화면 모드에서 MCP 도구 결과 위에 마우스를 올릴 때 충돌하던 버그 수정
  * 전체화면 모드에서 래핑된 URL 복사 시 줄 바꿈에 공백이 삽입되던 버그 수정
  * 편집된 파일이 10KB보다 클 때 `--resume` 시 파일 편집 diff가 UI에서 사라지던 버그 수정
  * 여러 `/resume` 선택기 문제 수정: `--resume <name>`이 편집 불가능하게 열림, 필터 새로 고침이 검색 상태를 지움, 빈 목록이 화살표 키를 삼킴, 프로젝트 간 오래된 데이터, 대화 요약을 대체하는 임시 작업 상태 텍스트
  * `/export`가 절대 경로 및 `~`를 적용하지 않고 사용자가 제공한 확장자를 `.txt`로 자동 변환하던 버그 수정
  * 알 수 없거나 미래의 모델 ID에 대해 `/effort max`가 거부되던 버그 수정
  * 플러그인의 frontmatter `name`이 YAML 불리언 키워드일 때 슬래시 명령어 선택기가 중단되던 버그 수정
  * 메시지 리마운트 후 rate-limit 업셀 텍스트가 숨겨지던 버그 수정
  * `_meta["anthropic/maxResultSizeChars"]`가 있는 MCP 도구가 토큰 기반 지속 레이어를 우회하지 않던 버그 수정
  * 이전 음성 전사가 여전히 처리 중일 때 push-to-talk 키를 다시 누르고 있으면 음성 모드가 입력에 수십 개의 공백 문자를 누출하던 버그 수정
  * `DISABLE_AUTOUPDATER`가 npm 기반 설치에서 npm 레지스트리 버전 확인 및 심볼릭 링크 수정을 완전히 억제하지 않던 버그 수정
  * Remote Control 권한 핸들러 항목이 세션 수명 동안 유지되던 메모리 누수 수정
  * 오류로 실패한 백그라운드 서브에이전트가 상위 에이전트에 부분적인 진행 상황을 보고하지 않던 버그 수정
  * 긴 세션에서 프롬프트 유형 Stop/SubagentStop hook이 실패하고 hook 평가자 API 오류가 실제 메시지 대신 "JSON validation failed"를 표시하던 버그 수정
  * 피드백 설문 렌더링이 해제될 때 나타나던 버그 수정
  * 작업 디렉터리 외부의 패턴 파일을 읽을 때 Bash `grep -f FILE` / `rg -f FILE`이 프롬프트를 표시하지 않던 버그 수정
  * 오래된 서브에이전트 worktree 정리가 추적되지 않은 파일이 포함된 worktree를 제거하던 버그 수정
  * macOS에서 `sandbox.network.allowMachLookup`이 적용되지 않던 버그 수정
  * `/resume` 필터 힌트 레이블 개선 및 필터 표시기에 프로젝트/worktree/브랜치 이름 추가
  * 포커스 표시기(Focus, 알림)가 좁은 터미널 너비에서 줄 바꿈되는 대신 모드 표시기 행에 유지되도록 푸터 표시기 개선
  * `/agents`에 탭 레이아웃 추가: Running 탭은 라이브 서브에이전트 표시, Library 탭에 에이전트 실행 및 실행 중인 인스턴스 보기 액션 추가
  * 재시작 없이 플러그인이 제공하는 skill을 가져오도록 `/reload-plugins` 개선
  * 안전한 env var 또는 프로세스 래퍼가 접두사로 붙은 파일시스템 명령어를 자동 승인하도록 Accept Edits 모드 개선
  * Vim 모드 개선: NORMAL 모드에서 `j`/`k`가 이제 히스토리를 탐색하고 입력 경계에서 푸터 pill을 선택
  * 자가 진단을 위해 `--debug` 없이도 hook 오류에 stderr의 첫 번째 줄을 포함하도록 전사본의 hook 오류 개선
  * OTEL 추적 개선: interaction span이 이제 동시 SDK 호출에서 전체 턴을 올바르게 래핑하고, headless 턴은 턴당 span을 종료
  * 스트리밍 플레이스홀더 대신 최종 토큰 사용량을 전달하도록 전사본 항목 개선
  * `/claude-api` skill이 Claude API와 함께 Managed Agents를 커버하도록 업데이트
  * \[VSCode] Windows에서 `CLAUDE_CODE_GIT_BASH_PATH`가 설정되어 있거나 Git이 기본 위치에 설치된 경우 "requires git-bash" 오류가 거짓 양성으로 표시되던 버그 수정
  * `DISABLE_COMPACT`가 설정된 경우 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`가 이를 준수하도록 수정
  * `DISABLE_COMPACT`가 설정된 경우 `/compact` 힌트 제거

</details>

<details><summary>2.1.97 (April 8, 2026)</summary>

  * `NO_FLICKER` 모드에서 포커스 뷰 전환(`Ctrl+O`) 추가: 프롬프트, 편집 diffstat이 포함된 한 줄 도구 요약, 최종 응답 표시
  * 상태 표시줄 설정에 `refreshInterval` 추가: N초마다 상태 표시줄 명령어 재실행
  * 현재 디렉터리가 연결된 git worktree 내부에 있을 때 설정되는 상태 표시줄 JSON 입력에 `workspace.git_worktree` 추가
  * `/agents`에서 라이브 서브에이전트 인스턴스가 있는 에이전트 유형 옆에 `● N running` 표시기 추가
  * Cedar 정책 파일(`.cedar`, `.cedarpolicy`)에 대한 구문 강조 추가
  * 보호된 경로에 대한 쓰기를 승인한 후 `--dangerously-skip-permissions`가 조용히 accept-edits 모드로 다운그레이드되던 버그 수정
  * Bash 도구 권한 수정 및 강화: env-var 접두사와 네트워크 리다이렉션 주변 검사 강화, 일반적인 명령어의 거짓 프롬프트 감소
  * JavaScript 프로토타입 속성과 일치하는 이름(예: `toString`)을 가진 권한 규칙이 `settings.json`을 조용히 무시하도록 만들던 버그 수정
  * 프로세스 재시작 전까지 관리자가 제거한 후에도 managed-settings allow 규칙이 활성 상태로 유지되던 버그 수정
  * 세션 중간에 설정의 `permissions.additionalDirectories` 변경이 적용되지 않던 버그 수정
  * `settings.permissions.additionalDirectories`에서 디렉터리를 제거하면 `--add-dir`로 전달된 동일 디렉터리의 접근도 취소되던 버그 수정
  * 서버가 재연결할 때 MCP HTTP/SSE 연결이 시간당 약 50MB의 해제되지 않은 버퍼를 누적하던 버그 수정
  * 재시작 후 토큰 새로 고침 시 MCP OAuth `oauth.authServerMetadataUrl`이 적용되지 않던 버그 수정, ADFS 및 유사한 IdP 수정
  * 서버가 작은 `Retry-After`를 반환할 때 429 재시도가 약 13초 만에 모든 시도를 소진하던 버그 수정 — 이제 지수 백오프가 최솟값으로 적용됨
  * 컨텍스트 컴팩션 후 rate-limit 업그레이드 옵션이 사라지던 버그 수정
  * 여러 `/resume` 선택기 문제 수정: `--resume <name>`이 편집 불가능하게 열림, Ctrl+A 새로 고침이 검색을 지움, 빈 목록이 탐색을 삼킴, 대화 요약을 대체하는 작업 상태 텍스트, 프로젝트 간 오래된 데이터
  * 편집된 파일이 10KB보다 클 때 `--resume` 시 파일 편집 diff가 사라지던 버그 수정
  * `--resume` 캐시 미스 수정 및 첨부 메시지에서 저장되지 않던 세션 중간 입력 손실 수정
  * Claude 작업 중 입력된 메시지가 전사본에 저장되지 않던 버그 수정
  * 긴 세션에서 프롬프트 유형 `Stop`/`SubagentStop` hook이 실패하고 hook 평가자 API 오류가 실제 메시지 대신 "JSON validation failed"를 표시하던 버그 수정
  * worktree 격리 또는 `cwd:` 재정의를 사용하는 서브에이전트가 작업 디렉터리를 상위 세션의 Bash 도구로 누출하던 버그 수정
  * 프롬프트 너무 긴 재시도 시 컴팩션이 중복된 다중 MB 서브에이전트 전사본 파일을 쓰던 버그 수정
  * `claude plugin update`가 원격에 더 새로운 커밋이 있을 때 git 기반 마켓플레이스 플러그인에 대해 "already at the latest version"을 보고하던 버그 수정
  * 플러그인의 frontmatter `name`이 YAML 불리언 키워드일 때 슬래시 명령어 선택기가 중단되던 버그 수정
  * `NO_FLICKER` 모드에서 래핑된 URL 복사 시 줄 바꿈에 공백이 삽입되던 버그 수정
  * zellij 내에서 실행 시 `NO_FLICKER` 모드의 스크롤 렌더링 아티팩트 수정
  * `NO_FLICKER` 모드에서 MCP 도구 결과 위에 마우스를 올릴 때 충돌하던 버그 수정
  * `NO_FLICKER` 모드에서 API 재시도가 오래된 스트리밍 상태를 남기던 메모리 누수 수정
  * Windows Terminal에서 `NO_FLICKER` 모드의 느린 마우스 휠 스크롤 수정
  * 터미널이 24행보다 짧을 때 `NO_FLICKER` 모드에서 사용자 정의 상태 표시줄이 표시되지 않던 버그 수정
  * Warp에서 `NO_FLICKER` 모드의 Shift+Enter 및 Alt/Cmd+화살표 단축키가 작동하지 않던 버그 수정
  * Windows의 no-flicker 모드에서 복사 시 한국어/일본어/유니코드 텍스트가 깨지던 버그 수정
  * `AWS_BEARER_TOKEN_BEDROCK` 또는 `ANTHROPIC_BEDROCK_BASE_URL`이 빈 문자열로 설정될 때(GitHub Actions가 설정되지 않은 입력에 대해 하는 것처럼) Bedrock SigV4 인증이 실패하던 버그 수정
  * 안전한 env var 또는 프로세스 래퍼가 접두사로 붙은 파일시스템 명령어를 자동 승인하도록 Accept Edits 모드 개선 (예: `LANG=C rm foo`, `timeout 5 mkdir out`)
  * 자동 모드와 bypass-permissions 모드에서 샌드박스 네트워크 접근 프롬프트를 자동 승인하도록 개선
  * 샌드박스 개선: `sandbox.network.allowMachLookup`이 이제 macOS에서 적용됨
  * 이미지 처리 개선: 붙여넣기 및 첨부된 이미지가 이제 Read 도구로 읽은 이미지와 동일한 토큰 예산으로 압축됨
  * 슬래시 명령어 및 `@`-멘션 완성이 CJK 문장 부호 뒤에서도 실행되도록 개선: 일본어/중국어 입력 시 `/` 또는 `@` 앞에 공백이 필요하지 않음
  * Bridge 세션이 claude.ai 세션 카드에 로컬 git 저장소, 브랜치, 작업 디렉터리를 표시하도록 개선
  * 푸터 레이아웃 개선: 표시기(Focus, 알림)가 이제 아래로 줄 바꿈되는 대신 모드 표시기 행에 유지됨
  * 컨텍스트 부족 경고가 지속적인 행 대신 일시적인 푸터 알림으로 표시되도록 개선
  * 마크다운 인용구가 래핑된 줄에 걸쳐 연속적인 왼쪽 바를 표시하도록 개선
  * 빈 hook 항목을 건너뛰고 저장된 편집 전 파일 복사본을 제한하여 세션 전사본 크기 개선
  * 전사본 정확성 개선: 블록별 항목이 이제 스트리밍 플레이스홀더 대신 최종 토큰 사용량을 전달
  * Bash 도구 OTEL 추적 개선: 추적이 활성화된 경우 서브프로세스가 이제 W3C `TRACEPARENT` env var를 상속
  * Claude API와 함께 Managed Agents를 커버하도록 `/claude-api` skill 업데이트

</details>

<details><summary>2.1.96 (April 8, 2026)</summary>

  * `AWS_BEARER_TOKEN_BEDROCK` 또는 `CLAUDE_CODE_SKIP_BEDROCK_AUTH` 사용 시 Bedrock 요청이 `403 "Authorization header is missing"` 오류로 실패하던 버그 수정 (2.1.94 회귀)

</details>

<details><summary>2.1.94 (April 7, 2026)</summary>

  * Mantle 기반 Amazon Bedrock 지원 추가, `CLAUDE_CODE_USE_MANTLE=1` 설정
  * API 키, Bedrock/Vertex/Foundry, Team, Enterprise 사용자의 기본 effort 수준을 medium에서 high로 변경 (`/effort`로 조정 가능)
  * Slack MCP 메시지 전송 도구 호출에 대한 클릭 가능한 채널 링크가 포함된 간결한 `Slacked #channel` 헤더 추가
  * 플러그인 출력 스타일에 대한 `keep-coding-instructions` frontmatter 필드 지원 추가
  * 세션 제목 설정을 위해 `UserPromptSubmit` hook에 `hookSpecificOutput.sessionTitle` 추가
  * `"skills": ["./"]`로 선언된 플러그인 skill이 이제 디렉터리 basename 대신 skill의 frontmatter `name`을 호출 이름으로 사용하여 설치 방법에 관계없이 안정적인 이름 제공
  * 긴 Retry-After 헤더가 있는 429 rate-limit 응답 후 에이전트가 멈춰 보이던 버그 수정 — 오류가 조용히 기다리는 대신 즉시 표시됨
  * 로그인 키체인이 잠겨 있거나 비밀번호가 동기화되지 않은 경우 macOS에서 Console 로그인이 "Not logged in" 오류로 조용히 실패하던 버그 수정 — 오류가 이제 표시되고 `claude doctor`가 수정 방법을 진단
  * YAML frontmatter에 정의된 플러그인 skill hook이 조용히 무시되던 버그 수정
  * `CLAUDE_PLUGIN_ROOT`가 설정되지 않았을 때 플러그인 hook이 "No such file or directory" 오류로 실패하던 버그 수정
  * 시작 시 로컬 마켓플레이스 플러그인에 대해 `${CLAUDE_PLUGIN_ROOT}`가 설치된 캐시 대신 마켓플레이스 소스 디렉터리로 해석되던 버그 수정
  * 긴 실행 중인 세션에서 스크롤백이 동일한 diff를 반복하고 빈 페이지를 보여주던 버그 수정
  * 전사본에서 여러 줄 사용자 프롬프트가 텍스트 아래 대신 `❯` 캐럿 아래에 줄 바꿈을 들여쓰던 버그 수정
  * 검색 입력에서 Shift+Space가 공백 문자 대신 리터럴 단어 "space"를 삽입하던 버그 수정
  * xterm.js 기반 터미널(VS Code, Hyper, Tabby) 내에서 tmux 실행 시 링크 클릭이 두 개의 브라우저 탭을 여던 버그 수정
  * 스크롤 중간에 내용 높이 변경이 겹치는 유령 줄을 남기던 alt-screen 렌더링 버그 수정
  * `settings.json` `env`를 통해 설정될 때 `FORCE_HYPERLINK` 환경 변수가 무시되던 버그 수정
  * 다이얼로그에서 선택된 탭을 추적하지 않던 네이티브 터미널 커서 수정, 스크린 리더와 돋보기가 탭 탐색을 따를 수 있도록 함
  * `us.` 인퍼런스 프로파일 ID를 사용하여 Sonnet 3.5 v2의 Bedrock 호출 수정
  * 스트림 중간에 인터럽트될 때 SDK/print 모드가 대화 히스토리에서 부분적인 어시스턴트 응답을 보존하지 않던 버그 수정
  * `--resume`이 다른 저장소의 worktree에서 온 세션을 `cd` 명령어를 출력하는 대신 직접 재개하도록 개선
  * 청크 경계가 UTF-8 시퀀스를 분할할 때 stream-json 입출력에서 CJK 및 기타 멀티바이트 텍스트가 U+FFFD로 손상되던 버그 수정
  * \[VSCode] 세션 시작 시 콜드 오픈 서브프로세스 작업 감소
  * \[VSCode] 입력 중이거나 화살표 키를 사용하는 동안 마우스가 목록 위에 있을 때 드롭다운 메뉴가 잘못된 항목을 선택하던 버그 수정
  * \[VSCode] `settings.json` 파일 파싱 실패 시 사용자가 권한 규칙이 적용되지 않음을 알 수 있도록 경고 배너 추가

</details>

<details><summary>2.1.92 (April 4, 2026)</summary>

  * `forceRemoteSettingsRefresh` 정책 설정 추가: 설정 시 CLI가 원격 managed settings가 새로 가져와질 때까지 시작을 차단하고, 가져오기 실패 시 종료(fail-closed)
  * 로그인 화면에서 "3rd-party platform"을 선택할 때 접근 가능한 대화형 Bedrock 설정 마법사 추가: AWS 인증, 지역 구성, 자격 증명 확인, 모델 고정 안내
  * 구독 사용자를 위한 `/cost`에 모델별 및 캐시 히트 분류 추가
  * `/release-notes`가 대화형 버전 선택기로 변경됨
  * Remote Control 세션 이름이 이제 호스트명을 기본 접두사로 사용(예: `myhost-graceful-unicorn`), `--remote-control-session-name-prefix`로 재정의 가능
  * 프롬프트 캐시가 만료된 후 세션으로 돌아올 때 Pro 사용자에게 다음 턴이 캐시 없이 보낼 대략적인 토큰 수를 보여주는 푸터 힌트 표시
  * tmux 창이 긴 세션 중에 종료되거나 번호가 재지정된 후 "Could not determine pane count" 오류로 서브에이전트 생성이 영구적으로 실패하던 버그 수정
  * 소형 빠른 모델이 `ok:false`를 반환할 때 프롬프트 유형 Stop hook이 잘못 실패하던 버그 수정, 비Stop 프롬프트 유형 hook에 대한 `preventContinuation:true` 의미 복원
  * 스트리밍이 배열/객체 필드를 JSON 인코딩된 문자열로 내보낼 때 발생하던 도구 입력 유효성 검사 실패 수정
  * 확장 사고가 실제 내용과 함께 공백만 있는 텍스트 블록을 생성할 때 발생하던 API 400 오류 수정
  * 자동 파일럿 키 입력 및 연속 프롬프트 숫자 충돌로 인한 우발적인 피드백 설문 제출 수정
  * 전체화면 모드에서 처리 중에 텍스트 선택이 존재할 때 "esc to interrupt" 힌트가 "esc to clear" 옆에 잘못 표시되던 버그 수정
  * Homebrew 설치 업데이트 프롬프트를 cask의 릴리스 채널 사용으로 수정(`claude-code` → stable, `claude-code@latest` → latest)
  * 여러 줄 프롬프트에서 이미 줄 끝에 있을 때 `ctrl+e`가 다음 줄 끝으로 이동하던 버그 수정
  * 전체화면 모드에서 스크롤 업 시 동일한 메시지가 두 위치에 표시되던 문제 수정 (DEC 2026을 지원하는 iTerm2, Ghostty 등의 터미널)
  * 유휴 복귀 "/clear to save X tokens" 힌트가 현재 컨텍스트 크기 대신 누적 세션 토큰을 표시하던 버그 수정
  * 플러그인 MCP 서버가 인증되지 않은 claude.ai 커넥터를 복제할 때 세션 시작 시 "connecting" 상태에서 멈추던 버그 수정
  * 탭/`&`/`$`가 있는 파일의 Write 도구 diff 계산 속도 개선 (탭/`&`/`$`가 있는 파일에서 60% 빠름)
  * `/tag` 명령어 제거
  * `/vim` 명령어 제거 (vim 모드는 `/config` → Editor mode로 전환)
  * Linux 샌드박스가 이제 npm 및 네이티브 빌드 모두에 `apply-seccomp` 헬퍼를 포함하여 샌드박스된 명령어에 대한 unix-socket 차단 복원

</details>

<details><summary>2.1.91 (April 2, 2026)</summary>

  * `_meta["anthropic/maxResultSizeChars"]` 어노테이션(최대 500K)을 통한 MCP 도구 결과 지속 재정의 추가: DB 스키마와 같은 더 큰 결과가 잘림 없이 전달 가능
  * skill, 사용자 정의 슬래시 명령어, 플러그인 명령어의 인라인 셸 실행을 비활성화하는 `disableSkillShellExecution` 설정 추가
  * `claude-cli://open?q=` 딥 링크에서 여러 줄 프롬프트 지원 추가 (인코딩된 줄바꿈 `%0A`가 더 이상 거부되지 않음)
  * 플러그인이 이제 `bin/` 아래에 실행 파일을 포함하고 Bash 도구에서 베어 명령어로 호출 가능
  * 비동기 전사본 쓰기가 조용히 실패할 때 `--resume`에서 대화 히스토리를 잃을 수 있던 전사본 체인 중단 수정
  * iTerm2, kitty, WezTerm, Ghostty, Windows Terminal에서 `cmd+delete`가 줄 시작까지 삭제하지 않던 버그 수정
  * 컨테이너 재시작 후 원격 세션에서 플랜 모드가 계획 파일을 추적하지 못하여 계획 편집 시 권한 프롬프트와 빈 계획 승인 모달이 발생하던 버그 수정
  * `settings.json`에서 `permissions.defaultMode: "auto"`에 대한 JSON 스키마 유효성 검사 수정
  * Windows 버전 정리가 활성 버전의 롤백 복사본을 보호하지 않던 버그 수정
  * `/feedback`이 슬래시 메뉴에서 사라지는 대신 왜 사용할 수 없는지 설명하도록 변경
  * 도구 표면 결정, 컨텍스트 관리, 캐싱 전략을 포함한 에이전트 설계 패턴에 대한 `/claude-api` skill 안내 개선
  * 성능 개선: Bun에서 `Bun.stripANSI`를 통해 `stripAnsi` 속도 향상
  * Edit 도구가 더 짧은 `old_string` 앵커를 사용하여 출력 토큰 감소

</details>

<details><summary>2.1.90 (April 1, 2026)</summary>

  * `/powerup` 추가 — 애니메이션 데모와 함께 Claude Code 기능을 가르치는 대화형 레슨
  * `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE` env var 추가: `git pull` 실패 시 기존 마켓플레이스 캐시 유지, 오프라인 환경에서 유용
  * 보호된 디렉터리에 `.husky` 추가 (acceptEdits 모드)
  * 사용 한도에 도달한 후 rate-limit 옵션 대화 상자가 반복해서 자동으로 열려 결국 세션이 충돌하던 무한 루프 수정
  * 지연된 도구, MCP 서버, 사용자 정의 에이전트가 있는 사용자에 대해 첫 번째 요청 시 `--resume`이 전체 프롬프트 캐시 미스를 유발하던 버그 수정 (v2.1.69 이후 회귀)
  * PostToolUse 형식-저장 hook이 연속 편집 사이에 파일을 다시 작성할 때 `Edit`/`Write`가 "File content has changed" 오류로 실패하던 버그 수정
  * stdout에 JSON을 내보내고 종료 코드 2로 종료하는 `PreToolUse` hook이 도구 호출을 올바르게 차단하지 않던 버그 수정
  * 도구 호출 중 CLAUDE.md 파일이 자동 로드될 때 전체화면 스크롤백에서 축소된 검색/읽기 요약 배지가 여러 번 나타나던 버그 수정
  * 자동 모드가 작업이 허용되더라도 명시적인 사용자 경계("push 하지 마세요", "X 전에 Y를 기다리세요")를 무시하던 버그 수정
  * 밝은 터미널 테마에서 클릭하여 확장 호버 텍스트가 거의 보이지 않던 버그 수정
  * 잘못된 도구 입력이 권한 대화 상자에 도달했을 때 UI 충돌 수정
  * `/model`, `/config` 및 기타 선택 화면을 스크롤할 때 헤더가 사라지던 버그 수정
  * PowerShell 도구 권한 검사 강화: 후행 `&` 백그라운드 작업 우회, `-ErrorAction Break` 디버거 중단, 아카이브 추출 TOCTOU, 파싱 실패 폴백 deny-rule 저하 수정
  * 성능 개선: 캐시 키 조회 시 MCP 도구 스키마의 턴당 JSON.stringify 제거
  * 성능 개선: SSE 전송이 이제 대용량 스트리밍 프레임을 선형 시간에 처리 (이전에는 이차 시간)
  * 성능 개선: 긴 대화가 있는 SDK 세션이 전사본 쓰기 시 이차적으로 느려지지 않음
  * `/resume` 모든 프로젝트 뷰가 프로젝트 세션을 병렬로 로드하도록 개선, 많은 프로젝트를 가진 사용자의 로드 시간 향상
  * `--resume` 선택기가 더 이상 `claude -p` 또는 SDK 호출로 생성된 세션을 표시하지 않도록 변경
  * 자동 허용에서 `Get-DnsClientCache` 및 `ipconfig /displaydns` 제거 (DNS 캐시 개인 정보)

</details>

<details><summary>2.1.89 (April 1, 2026)</summary>

  * `PreToolUse` hook에 `"defer"` 권한 결정 추가 — headless 세션이 도구 호출에서 일시 중지하고 `-p --resume`으로 재개하여 hook이 재평가할 수 있음
  * 플리커 없는 alt-screen 렌더링과 가상화된 스크롤백을 위한 `CLAUDE_CODE_NO_FLICKER=1` 환경 변수 추가
  * 자동 모드 분류기 거부 후 실행되는 `PermissionDenied` hook 추가 — `{retry: true}`를 반환하여 모델에 재시도 가능함을 알릴 수 있음
  * `@` 멘션 타입어헤드 제안에 명명된 서브에이전트 추가
  * `-p` 모드에서 MCP 연결 대기를 완전히 건너뛰는 `MCP_CONNECTION_NONBLOCKING=true` 추가, 가장 느린 서버에서 차단하는 대신 `--mcp-config` 서버 연결을 5초로 제한
  * 자동 모드: 거부된 명령어가 이제 알림을 표시하고 `/permissions` → Recent 탭에서 `r`로 재시도 가능
  * `Edit(//path/**)` 및 `Read(//path/**)` 허용 규칙이 요청된 경로만이 아닌 해석된 심볼릭 링크 대상을 확인하도록 수정
  * 일부 수정자 조합 바인딩에서 음성 push-to-talk가 활성화되지 않고 Windows에서 "WebSocket upgrade rejected with HTTP 101" 오류로 음성 모드가 실패하던 버그 수정
  * Windows에서 Edit/Write 도구가 CRLF를 두 배로 하고 Markdown 하드 줄 바꿈(두 개의 후행 공백)을 제거하던 버그 수정
  * 여러 스키마 사용 시 약 50% 실패율을 유발하던 `StructuredOutput` 스키마 캐시 버그 수정
  * 긴 실행 중인 세션에서 대형 JSON 입력이 LRU 캐시 키로 유지되던 메모리 누수 수정
  * 매우 큰 세션 파일(50MB 초과)에서 메시지 제거 시 충돌하던 버그 수정
  * 충돌 후 LSP 서버 좀비 상태 수정 — 서버가 세션 재시작 전까지 실패하는 대신 다음 요청 시 재시작
  * `~/.claude/history.jsonl`에서 4KB 경계에 걸쳐 있을 때 CJK 또는 이모지를 포함하는 프롬프트 히스토리 항목이 조용히 삭제되던 버그 수정
  * `/stats`가 서브에이전트 사용을 제외하여 토큰을 적게 계산하고 통계 캐시 형식이 변경될 때 30일 이후의 과거 데이터를 잃던 버그 수정
  * 지연된 도구 입력이 64KB를 초과하거나 지연 마커가 없을 때 `-p --resume` 중단 수정, 지연된 도구를 재개하지 않던 `-p --continue` 수정
  * macOS에서 `claude-cli://` 딥 링크가 열리지 않던 버그 수정
  * 서버가 다중 요소 오류 내용을 반환할 때 MCP 도구 오류가 첫 번째 내용 블록만 잘라내던 버그 수정
  * SDK를 통해 이미지가 있는 메시지를 보낼 때 skill 알림 및 기타 시스템 컨텍스트가 삭제되던 버그 수정
  * PreToolUse/PostToolUse hook이 문서화된 동작과 일치하도록 Write/Edit/Read 도구에 대해 `file_path`를 절대 경로로 받도록 수정
  * autocompact 스래싱 루프 수정 — 연속 세 번의 컴팩션 직후 컨텍스트가 한도에 다시 차는 경우를 감지하고 API 호출을 낭비하는 대신 실행 가능한 오류와 함께 중지
  * 세션 중간에 도구 스키마 바이트가 변경되어 발생하던 긴 세션의 프롬프트 캐시 미스 수정
  * 많은 파일을 읽는 긴 세션에서 중첩된 CLAUDE.md 파일이 수십 번 재삽입되던 버그 수정
  * 이전 CLI 버전의 도구 결과 또는 중단된 쓰기를 포함하는 전사본에서 `--resume` 충돌 수정
  * API가 자격 권한 오류를 반환했을 때 오해의 소지가 있는 "Rate limit reached" 메시지 수정 — 이제 실행 가능한 힌트와 함께 실제 오류를 표시
  * hook `if` 조건 필터링이 복합 명령어(`ls && git push`) 또는 env-var 접두사가 있는 명령어(`FOO=bar git push`)와 일치하지 않던 버그 수정
  * 대용량 병렬 도구 사용 중 터미널 스크롤백에서 축소된 검색/읽기 그룹 배지가 중복되던 버그 수정
  * 알림 `invalidates`가 현재 표시된 알림을 즉시 지우지 않던 버그 수정
  * 처리 중에 백그라운드 메시지가 도착할 때 제출 후 프롬프트가 잠깐 사라지던 버그 수정
  * 어시스턴트 출력에서 데바나가리 및 기타 결합 마크 텍스트가 잘리던 버그 수정
  * 레이아웃 변경 후 메인 스크린 터미널의 렌더링 아티팩트 수정
  * macOS Apple Silicon에서 음성 모드가 마이크 권한 요청에 실패하던 버그 수정
  * Windows Terminal Preview 1.25에서 Shift+Enter가 줄바꿈 삽입 대신 제출하던 버그 수정
  * tmux 내에서 iTerm2로 스트리밍 중 주기적인 UI 떨림 수정
  * Windows PowerShell 5.1에서 `git push`와 같은 명령어가 stderr에 진행 상황을 쓸 때 PowerShell 도구가 잘못 실패를 보고하던 버그 수정
  * Edit 도구가 매우 큰 파일(1GiB 이상)에서 사용될 때의 잠재적인 메모리 초과 충돌 수정
  * `ls`/`tree`/`du`에 대해 축소된 도구 요약이 "Read N files" 대신 "Listed N directories"를 표시하도록 개선
  * 포매터/린터 명령어가 이전에 읽은 파일을 수정할 때 오래된 편집 오류를 방지하도록 Bash 도구 경고 개선
  * 비슷한 이름의 MCP 리소스보다 소스 파일을 상위에 순위를 매기도록 `@`-멘션 타입어헤드 개선
  * 버전별 구문 안내를 포함하도록 PowerShell 도구 프롬프트 개선 (5.1 vs 7+)
  * `Edit`이 별도의 `Read` 호출 없이 `Bash`에서 `sed -n` 또는 `cat`으로 본 파일에서 작동하도록 변경
  * 50K 자를 초과하는 hook 출력이 컨텍스트에 직접 삽입되는 대신 파일 경로와 미리보기와 함께 디스크에 저장되도록 변경
  * `settings.json`에서 `cleanupPeriodDays: 0`이 유효성 검사 오류와 함께 거부되도록 변경 — 이전에는 전사본 지속성을 조용히 비활성화했음
  * 사고 요약이 대화형 세션에서 기본적으로 더 이상 생성되지 않도록 변경 — 복원하려면 `settings.json`에서 `showThinkingSummaries: true` 설정
  * `TaskCreated` hook 이벤트 및 차단 동작 문서화
  * Ctrl+B로 실행 중인 명령어를 백그라운드로 보낼 때 작업 알림 보존
  * Windows의 PowerShell 도구: 큰따옴표와 공백을 모두 포함하는 외부 명령 인수가 이제 자동 허용 대신 프롬프트 표시 (PS 5.1 인수 분할 강화)
  * `/env`가 이제 PowerShell 도구 명령어에도 적용 (이전에는 Bash만 영향)
  * `/usage`가 이제 Pro 및 Enterprise 플랜에 대해 중복된 "Current week (Sonnet only)" 바를 숨김
  * 이미지 붙여넣기 시 후행 공백이 더 이상 삽입되지 않음
  * 빈 프롬프트에 `!command` 붙여넣기 시 입력된 `!` 동작과 일치하도록 bash 모드 진입
  * `/buddy`가 4월 1일을 위해 등장 — 코딩하는 동안 지켜보는 작은 생명체 부화

</details>

<details><summary>2.1.87 (March 29, 2026)</summary>

  * Cowork Dispatch에서 메시지가 전달되지 않던 버그 수정

</details>

<details><summary>2.1.86 (March 27, 2026)</summary>

  * 프록시가 본문을 파싱하지 않고도 세션별로 요청을 집계할 수 있도록 API 요청에 `X-Claude-Code-Session-Id` 헤더 추가
  * Jujutsu 또는 Sapling 메타데이터에 Grep 및 파일 자동완성이 내려가지 않도록 VCS 디렉터리 제외 목록에 `.jj` 및 `.sl` 추가
  * v2.1.85 이전에 생성된 세션에서 "tool\_use ids were found without tool\_result blocks" 오류로 `--resume`이 실패하던 버그 수정
  * 조건부 skill 또는 규칙이 구성된 경우 프로젝트 루트 외부의 파일(예: `~/.claude/CLAUDE.md`)에서 Write/Edit/Read가 실패하던 버그 수정
  * 모든 skill 호출 시 불필요한 구성 디스크 쓰기로 인해 성능 문제 및 Windows에서 구성 손상이 발생하던 버그 수정
  * 매우 긴 세션의 대형 전사본 파일에서 `/feedback` 사용 시 잠재적인 메모리 초과 충돌 수정
  * `--bare` 모드가 대화형 세션에서 MCP 도구를 삭제하고 세션 중간 중에 대기 중인 메시지를 조용히 폐기하던 버그 수정
  * `c` 단축키가 OAuth 로그인 URL의 전체 URL 대신 약 20자만 복사하던 버그 수정
  * 마스킹된 입력(예: OAuth 코드 붙여넣기)이 좁은 터미널에서 여러 줄에 걸쳐 래핑될 때 토큰 시작 부분이 누출되던 버그 수정
  * v2.1.83 이후 macOS/Linux에서 공식 마켓플레이스 플러그인 스크립트가 "Permission denied" 오류로 실패하던 버그 수정
  * 여러 Claude Code 인스턴스 실행 중 하나에서 `/model`을 사용할 때 statusline이 다른 세션의 모델을 표시하던 버그 수정
  * 긴 대화 하단에서 휠 스크롤 또는 클릭하여 선택 후 스크롤이 새 메시지를 따르지 않던 버그 수정
  * `/plugin` 설치 제거 대화 상자 수정: `n`을 누르면 이제 데이터 디렉터리를 보존하면서 플러그인을 올바르게 제거
  * 클릭 후 Enter를 누르면 응답이 도착할 때까지 전사본이 빈 화면으로 남아있던 회귀 수정
  * 키워드를 삭제한 후에도 `ultrathink` 힌트가 남아있던 버그 수정
  * 마크다운/하이라이트 렌더 캐시가 전체 내용 문자열을 유지하던 긴 세션의 메모리 증가 수정
  * 많은 claude.ai MCP 커넥터가 구성된 경우 시작 이벤트 루프 지연 감소 (macOS 키체인 캐시가 5초에서 30초로 연장됨)
  * `@`로 파일을 멘션할 때 토큰 오버헤드 감소 — 원시 문자열 내용이 더 이상 JSON 이스케이프되지 않음
  * 도구 설명에서 동적 내용을 제거하여 Bedrock, Vertex, Foundry 사용자의 프롬프트 캐시 히트율 개선
  * "Saved N memories" 알림의 메모리 파일명이 이제 hover 시 강조 표시되고 클릭으로 열림
  * `/skills` 목록에서 skill 설명이 이제 컨텍스트 사용을 줄이기 위해 250자로 제한됨
  * 쉽게 검색할 수 있도록 `/skills` 메뉴가 알파벳 순서로 정렬되도록 변경
  * 자동 모드가 플랜 제한으로 비활성화된 경우 "temporarily unavailable" 대신 "unavailable for your plan" 표시
  * \[VSCode] 장시간 실행 중인 작업 중 확장 프로그램이 잘못 "Not responding"을 표시하던 버그 수정
  * \[VSCode] OAuth 토큰 새로 고침 후(로그인 후 8시간) Max 플랜 사용자를 Sonnet으로 기본 설정하던 버그 수정
  * Read 도구가 이제 간결한 줄 번호 형식을 사용하고 변경되지 않은 재읽기를 중복 제거하여 토큰 사용량 감소

</details>

<details><summary>2.1.85 (March 26, 2026)</summary>

  * `headersHelper` 스크립트에 `CLAUDE_CODE_MCP_SERVER_NAME` 및 `CLAUDE_CODE_MCP_SERVER_URL` 환경 변수 추가: 하나의 helper가 여러 서버를 제공 가능
  * 실행 시기를 필터링하여 프로세스 생성 오버헤드를 줄이기 위해 권한 규칙 구문(예: `Bash(git *)`)을 사용하는 hook에 조건부 `if` 필드 추가
  * 예약된 작업(`/loop`, `CronCreate`)이 실행될 때 전사본에 타임스탬프 마커 추가
  * 이미지 붙여넣기 시 후행 공백 추가
  * 딥 링크 쿼리(`claude-cli://open?q=…`)가 이제 최대 5,000자를 지원하며 긴 미리 채워진 프롬프트에 대한 "scroll to review" 경고 추가
  * MCP OAuth가 이제 RFC 9728 Protected Resource Metadata 검색을 따라 인증 서버를 찾음
  * 조직 정책(`managed-settings.json`)으로 차단된 플러그인이 더 이상 설치 또는 활성화될 수 없으며 마켓플레이스 뷰에서 숨겨짐
  * PreToolUse hook이 `updatedInput`을 `permissionDecision: "allow"`와 함께 반환하여 `AskUserQuestion`을 충족시킬 수 있음: 자체 UI를 통해 답변을 수집하는 headless 통합 가능
  * OpenTelemetry tool\_result 이벤트의 `tool_parameters`가 이제 `OTEL_LOG_TOOL_DETAILS=1` 뒤에 제한됨
  * 대화가 컴팩트 요청 자체에 맞기에 너무 커진 경우 "context exceeded" 오류로 `/compact`가 실패하던 버그 수정
  * 플러그인의 설치 위치가 설정에서 선언된 위치와 다를 때 `/plugin enable` 및 `/plugin disable`이 실패하던 버그 수정
  * `WorktreeCreate` hook이 실행되기 전에 git이 아닌 저장소에서 `--worktree`가 오류로 종료되던 버그 수정
  * `deniedMcpServers` 설정이 claude.ai MCP 서버를 차단하지 않던 버그 수정
  * 다중 모니터 설정에서 computer-use 도구의 `switch_display`가 "not available in this session"을 반환하던 버그 수정
  * `OTEL_LOGS_EXPORTER`, `OTEL_METRICS_EXPORTER`, 또는 `OTEL_TRACES_EXPORTER`가 `none`으로 설정될 때 충돌하던 버그 수정
  * 비네이티브 빌드에서 diff 구문 강조가 작동하지 않던 버그 수정
  * 새로 고침 토큰이 존재할 때 MCP step-up 인증이 실패하던 버그 수정 — `403 insufficient_scope`를 통해 상승된 범위를 요청하는 서버가 이제 재인증 흐름을 올바르게 트리거
  * 스트리밍 응답이 중단될 때 원격 세션의 메모리 누수 수정
  * 재시도 시 새로운 TCP 연결을 사용하여 엣지 연결 변화 중 지속적인 ECONNRESET 오류 수정
  * 특정 슬래시 명령어 실행 후 대기 중인 프롬프트가 멈추고 위쪽 화살표로 검색할 수 없던 버그 수정
  * Python Agent SDK: `--mcp-config`를 통해 전달된 `type:'sdk'` MCP 서버가 시작 중 더 이상 삭제되지 않도록 수정
  * SSH 또는 VS Code 통합 터미널에서 실행 시 프롬프트에 원시 키 시퀀스가 나타나던 버그 수정
  * 권한이 해결된 후 Remote Control 세션 상태가 "Requires Action"에 멈춰있던 버그 수정
  * 타입어헤드 제안이 줄바꿈 삽입 대신 shift+enter 및 meta+enter를 가로채던 버그 수정
  * 스트리밍 중 스크롤 업 시 오래된 내용이 비치던 버그 수정
  * Ghostty, Kitty, WezTerm 및 기타 Kitty 키보드 프로토콜을 지원하는 터미널에서 종료 후 터미널이 향상된 키보드 모드로 남아있던 버그 수정 — 이제 종료 후 Ctrl+C 및 Ctrl+D가 올바르게 작동
  * 대용량 저장소에서 `@`-멘션 파일 자동완성 성능 개선
  * PowerShell 위험한 명령어 감지 개선
  * WASM yoga-layout을 순수 TypeScript 구현으로 교체하여 대형 전사본의 스크롤 성능 개선
  * 대형 세션에서 컴팩션이 트리거될 때 UI 지연 감소

</details>

<details><summary>2.1.84 (March 26, 2026)</summary>

  * Windows용 PowerShell 도구를 옵트인 미리보기로 추가. 자세한 내용은 [https://code.claude.com/docs/tools-reference#powershell-tool](https://code.claude.com/docs/tools-reference#powershell-tool) 참조
  * 3자(Bedrock, Vertex, Foundry)에 대한 고정된 기본 모델의 effort/thinking 기능 감지를 재정의하는 `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU}_MODEL_SUPPORTS` env var 추가, `/model` 선택기 레이블을 사용자 정의하는 `_MODEL_NAME`/`_DESCRIPTION` 추가
  * 스트리밍 유휴 감시 임계값을 구성하는 `CLAUDE_STREAM_IDLE_TIMEOUT_MS` env var 추가 (기본값 90초)
  * `TaskCreate`를 통해 작업이 생성될 때 실행되는 `TaskCreated` hook 추가
  * `type: "http"` `WorktreeCreate` hook 지원 추가 — 응답 JSON에서 `hookSpecificOutput.worktreePath`를 통해 생성된 worktree 경로 반환
  * 팀/엔터프라이즈 관리자가 채널 플러그인 허용 목록을 정의하는 `allowedChannelPlugins` managed 설정 추가
  * 타임아웃 디버깅을 위한 API 요청에 `x-client-request-id` 헤더 추가
  * 75분 이상 후 돌아오는 사용자에게 불필요한 토큰 재캐싱을 줄이기 위해 `/clear`를 권장하는 유휴 복귀 프롬프트 추가
  * 딥 링크(`claude-cli://`)가 이제 감지 목록의 첫 번째 터미널 대신 선호하는 터미널에서 열림
  * 규칙 및 skill의 `paths:` frontmatter가 이제 YAML 글로브 목록을 허용
  * OpenAPI 생성 서버가 컨텍스트를 부풀리지 않도록 MCP 도구 설명 및 서버 지침을 2KB로 제한
  * 로컬로 구성된 MCP 서버와 claude.ai 커넥터를 통해 구성된 서버가 중복 제거됨 — 로컬 구성이 우선
  * 대화형 프롬프트에서 멈춰 보이는 백그라운드 bash 작업이 약 45초 후 알림 표시
  * 1M 이상의 토큰 수가 이제 "1512.6k" 대신 "1.5m"으로 표시됨
  * `ToolSearch`가 활성화된 경우, MCP 도구가 구성된 사용자를 포함하여 전역 시스템 프롬프트 캐싱이 이제 작동
  * 음성 push-to-talk 수정: 음성 키를 누르고 있어도 더 이상 텍스트 입력에 문자가 누출되지 않으며, 전사가 올바른 위치에 삽입됨
  * 푸터 항목에 포커스가 있을 때 위/아래 화살표 키가 응답하지 않던 버그 수정
  * 여러 줄 입력의 줄 경계에서 `Ctrl+U`(줄 시작까지 삭제)가 작동하지 않던 버그 수정, 반복된 `Ctrl+U`가 이제 줄에 걸쳐 지워짐
  * 기본 코드 바인딩을 null로 해제(예: `"ctrl+x ctrl+k": null`)해도 여전히 코드 대기 모드로 진입하던 버그 수정, 이제 접두사 키가 해제됨
  * 마우스 이벤트가 전사본 검색 입력에 리터럴 "mouse" 텍스트를 삽입하던 버그 수정
  * 외부 세션이 `--json-schema`를 사용하고 서브에이전트도 스키마를 지정할 때 워크플로우 서브에이전트가 API 400 오류로 실패하던 버그 수정
  * 일부 터미널에서 사용자 메시지 버블의 특정 이모지 뒤에 배경색이 없던 버그 수정
  * `Edit(.claude)` 허용 규칙이 있는 사용자에 대해 "allow Claude to edit its own settings for this session" 권한 옵션이 유지되지 않던 버그 수정
  * 대형 편집된 파일의 첨부 스니펫 생성 시 중단 수정
  * 서버 재연결 시 MCP 도구/리소스 캐시 누수 수정
  * 부분 클론 저장소(Scalar/GVFS)가 대량 blob 다운로드를 트리거하던 시작 성능 문제 수정
  * IME 컴포지션(CJK 입력)이 인라인으로 렌더링되고 스크린 리더가 입력 위치를 따를 수 있도록 네이티브 터미널 커서가 텍스트 입력 캐럿을 추적하지 않던 버그 수정
  * 일시적인 키체인 읽기 실패로 인한 macOS의 가짜 "Not logged in" 오류 수정
  * 코어 도구가 bypass 활성화 없이 지연될 수 있는 콜드 스타트 경쟁 조건 수정, Edit/Write가 입력된 파라미터에서 InputValidationError로 실패하는 원인
  * Windows 드라이브 루트(`C:\`, `C:\Windows` 등)의 위험한 제거 감지 개선
  * 슬래시 명령어 및 에이전트 로딩과 병렬로 `setup()`을 실행하여 대화형 시작 약 30ms 개선
  * REPL이 모든 서버 연결을 기다리는 대신 즉시 렌더링되도록 MCP 서버가 있는 `claude "prompt"` 시작 개선
  * Remote Control이 일반적인 "not yet enabled" 메시지 대신 차단 이유를 표시하도록 개선
  * p90 프롬프트 캐시 비율 개선
  * 컴팩션 및 그룹화 변경으로 메시지 창이 면역되어 긴 세션의 스크롤-투-탑 재설정 감소
  * 애니메이션된 도구 진행이 뷰포트 위로 스크롤될 때 터미널 깜박임 감소
  * 이슈/PR 참조가 `owner/repo#123`으로 작성된 경우에만 클릭 가능한 링크로 변경 — 단순 `#123`은 더 이상 자동 링크되지 않음
  * 현재 인증 설정에서 사용할 수 없는 슬래시 명령어(`/voice`, `/mobile`, `/chrome`, `/upgrade` 등)가 표시 대신 숨겨짐
  * \[VSCode] 사용 비율 및 재설정 시간이 포함된 rate limit 경고 배너 추가
  * 통계 스크린샷(Ctrl+S in /stats)이 이제 모든 빌드에서 작동하며 16배 빠름

</details>

<details><summary>2.1.83 (March 25, 2026)</summary>

  * `managed-settings.json` 옆에 `managed-settings.d/` 드롭인 디렉터리 추가: 별도의 팀이 알파벳 순서로 병합되는 독립적인 정책 파일 배포 가능
  * 반응형 환경 관리를 위한 `CwdChanged` 및 `FileChanged` hook 이벤트 추가 (예: direnv)
  * 샌드박스가 활성화되었지만 시작할 수 없을 때 샌드박스 없이 실행하는 대신 오류로 종료하는 `sandbox.failIfUnavailable` 설정 추가
  * `claude-cli://` 프로토콜 핸들러 등록을 방지하는 `disableDeepLinkRegistration` 설정 추가
  * 서브프로세스 환경(Bash 도구, hook, MCP stdio 서버)에서 Anthropic 및 클라우드 공급자 자격 증명을 제거하는 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` 추가
  * 전사본 검색 추가 — 전사본 모드(`Ctrl+O`)에서 `/`를 눌러 검색, `n`/`N`으로 일치 항목 탐색
  * 외부 편집기를 여는 `Ctrl+X Ctrl+E` 별칭 추가 (readline 기본 바인딩; `Ctrl+G`도 계속 작동)
  * 붙여넣은 이미지가 이제 커서에 `[Image #N]` 칩을 삽입하여 프롬프트에서 위치로 참조 가능
  * 에이전트가 이제 frontmatter에 `initialPrompt`를 선언하여 첫 번째 턴을 자동 제출 가능
  * `chat:killAgents` 및 `chat:fastMode`가 이제 `~/.claude/keybindings.json`을 통해 재바인딩 가능
  * 종료 후 터미널 마우스 추적 이스케이프 시퀀스가 셸 프롬프트로 누출되던 버그 수정
  * macOS에서 Claude Code가 종료 시 중단되던 버그 수정
  * 몇 초간 유휴 상태 후 화면이 빈 화면으로 번쩍이던 버그 수정
  * 공통 줄이 거의 없는 매우 큰 파일을 diff할 때 중단되던 버그 수정 — diff가 이제 5초 후 타임아웃되고 우아하게 폴백
  * 음성 입력이 활성화된 경우 시작 시 1–8초 UI 중단 수정: 네이티브 오디오 모듈을 즉시 로드하던 문제
  * Claude Code가 진행하기 전에 약 3초간 claude.ai MCP 구성 가져오기를 기다리던 시작 회귀 수정
  * `--mcp-config` CLI 플래그가 `allowedMcpServers`/`deniedMcpServers` managed 정책 시행을 우회하던 버그 수정
  * 단일 턴 `--print` 모드에서 claude.ai MCP 커넥터(Slack, Gmail 등)를 사용할 수 없던 버그 수정
  * Claude Code 종료 시 `caffeinate` 프로세스가 제대로 종료되지 않아 Mac이 잠자기 모드로 전환되지 않던 버그 수정
  * `!`-접두사 명령어 제안을 탭으로 수락할 때 bash 모드가 활성화되지 않던 버그 수정
  * 제안 탐색 후 잘못된 강조 표시된 명령어를 표시하던 오래된 슬래시 명령어 선택 버그 수정
  * `/config` 메뉴에서 검색 커서와 목록 선택이 동시에 표시되던 버그 수정
  * 컨텍스트 컴팩션 후 백그라운드 서브에이전트가 보이지 않게 되어 중복 에이전트가 생성될 수 있던 버그 수정
  * 정리 중 git 또는 API 호출이 중단될 때 백그라운드 에이전트 작업이 "running" 상태에 멈추던 버그 수정
  * 업그레이드 후 처음 실행 시 `--channels`가 "Channels are not currently available"을 표시하던 버그 수정
  * 설치 제거된 플러그인 hook이 다음 세션까지 계속 실행되던 버그 수정
  * 스트리밍 응답 중 대기 중인 명령어가 깜박이던 버그 수정
  * 메시지 처리 중에 제출된 슬래시 명령어가 텍스트로 모델에 전송되던 버그 수정
  * 화면 밖으로 스크롤한 후 축소된 읽기/검색 그룹이 완료될 때 스크롤백이 점프하던 버그 수정
  * 모델이 사고를 시작하거나 중지할 때 스크롤백이 맨 위로 점프하던 버그 수정

</details>

