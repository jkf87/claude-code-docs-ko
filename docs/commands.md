# 명령어

> Claude Code에서 사용할 수 있는 모든 명령어에 대한 완전한 레퍼런스입니다. 내장 명령어와 번들 스킬을 포함합니다.

명령어는 세션 내에서 Claude Code를 제어합니다. 모델 전환, 권한 관리, 컨텍스트 초기화, 워크플로우 실행 등을 빠르게 수행할 수 있습니다.

`/`를 입력하면 사용 가능한 모든 명령어를 볼 수 있고, `/` 뒤에 글자를 입력하면 필터링할 수 있습니다.

아래 표는 Claude Code에 포함된 모든 명령어를 나열합니다. **[Skill](/skills#bundled-skills)**로 표시된 항목은 번들 스킬입니다. 직접 작성하는 스킬과 동일한 메커니즘을 사용합니다: Claude에게 전달되는 프롬프트이며, 관련이 있을 때 Claude가 자동으로 호출할 수도 있습니다. 그 외의 항목은 CLI에 동작이 코딩된 내장 명령어입니다. 직접 명령어를 추가하려면 [스킬](/skills)을 참조하세요.

모든 명령어가 모든 사용자에게 표시되는 것은 아닙니다. 플랫폼, 요금제, 환경에 따라 사용 가능 여부가 달라집니다. 예를 들어 `/desktop`은 macOS와 Windows에서만 표시되고, `/upgrade`는 Pro 및 Max 요금제에서만 표시됩니다.

아래 표에서 `<arg>`는 필수 인수를, `[arg]`는 선택적 인수를 나타냅니다.

| Command | Purpose |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/add-dir <path>` | 현재 세션에서 파일 접근을 위한 작업 디렉토리를 추가합니다. 대부분의 `.claude/` 설정은 추가된 디렉토리에서 [검색되지 않습니다](/permissions#additional-directories-grant-file-access-not-configuration) |
| `/agents` | [에이전트](/sub-agents) 설정을 관리합니다 |
| `/autofix-pr [prompt]` | 현재 브랜치의 PR을 감시하고 CI 실패나 리뷰어 코멘트가 있으면 수정을 푸시하는 [웹 Claude Code](/claude-code-on-the-web#auto-fix-pull-requests) 세션을 생성합니다. 체크아웃된 브랜치에서 `gh pr view`로 열린 PR을 감지합니다. 다른 PR을 감시하려면 해당 브랜치를 먼저 체크아웃하세요. 기본적으로 원격 세션은 모든 CI 실패와 리뷰 코멘트를 수정하도록 지시받습니다. 다른 지시를 내리려면 프롬프트를 전달하세요. 예: `/autofix-pr only fix lint and type errors`. `gh` CLI와 [웹 Claude Code](/claude-code-on-the-web#who-can-use-claude-code-on-the-web) 접근 권한이 필요합니다 |
| `/batch <instruction>` | **[Skill](/skills#bundled-skills).** 코드베이스 전체에 걸쳐 대규모 변경을 병렬로 수행합니다. 코드베이스를 조사하고, 작업을 5~30개의 독립 단위로 분해하여 계획을 제시합니다. 승인되면 격리된 [git worktree](/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)에서 단위당 하나의 백그라운드 에이전트를 생성합니다. 각 에이전트는 단위를 구현하고, 테스트를 실행하고, pull request를 엽니다. git 저장소가 필요합니다. 예: `/batch migrate src/ from Solid to React` |
| `/btw <question>` | 대화에 추가하지 않고 빠른 [사이드 질문](/interactive-mode#side-questions-with-btw)을 합니다 |
| `/chrome` | [Chrome에서 Claude](/chrome) 설정을 구성합니다 |
| `/claude-api` | **[Skill](/skills#bundled-skills).** 프로젝트 언어(Python, TypeScript, Java, Go, Ruby, C#, PHP 또는 cURL)에 맞는 Claude API 레퍼런스 자료와 Managed Agents 레퍼런스를 로드합니다. 도구 사용, 스트리밍, 배치, 구조화된 출력, 일반적인 함정을 다룹니다. 코드에서 `anthropic` 또는 `@anthropic-ai/sdk`를 import할 때 자동으로 활성화됩니다 |
| `/clear` | 대화 기록을 지우고 컨텍스트를 확보합니다. 별칭: `/reset`, `/new` |
| `/color [color\|default]` | 현재 세션의 프롬프트 바 색상을 설정합니다. 사용 가능한 색상: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`. 초기화하려면 `default`를 사용하세요 |
| `/compact [instructions]` | 선택적 초점 지시와 함께 대화를 압축합니다 |
| `/config` | [설정](/settings) 인터페이스를 열어 테마, 모델, [출력 스타일](/output-styles) 및 기타 환경설정을 조정합니다. 별칭: `/settings` |
| `/context` | 현재 컨텍스트 사용량을 색상 그리드로 시각화합니다. 컨텍스트를 많이 사용하는 도구, 메모리 비대화, 용량 경고에 대한 최적화 제안을 표시합니다 |
| `/copy [N]` | 마지막 어시스턴트 응답을 클립보드에 복사합니다. 숫자 `N`을 전달하면 N번째 최근 응답을 복사합니다: `/copy 2`는 마지막에서 두 번째 응답을 복사합니다. 코드 블록이 있으면 개별 블록 또는 전체 응답을 선택할 수 있는 인터랙티브 선택기를 표시합니다. 선택기에서 `w`를 누르면 클립보드 대신 파일에 기록하며, SSH 환경에서 유용합니다 |
| `/cost` | 토큰 사용량 통계를 표시합니다. 구독별 상세 정보는 [비용 추적 가이드](/costs#using-the-cost-command)를 참조하세요 |
| `/debug [description]` | **[Skill](/skills#bundled-skills).** 현재 세션의 디버그 로깅을 활성화하고 세션 디버그 로그를 읽어 문제를 해결합니다. `claude --debug`로 시작하지 않은 한 디버그 로깅은 기본적으로 꺼져 있으므로, 세션 중간에 `/debug`를 실행하면 그 시점부터 로그 캡처를 시작합니다. 분석 초점을 맞추기 위해 문제를 설명할 수 있습니다 |
| `/desktop` | 현재 세션을 Claude Code Desktop 앱에서 계속합니다. macOS 및 Windows 전용. 별칭: `/app` |
| `/diff` | 커밋되지 않은 변경사항과 턴별 diff를 보여주는 인터랙티브 diff 뷰어를 엽니다. 좌우 화살표로 현재 git diff와 개별 Claude 턴 사이를 전환하고, 상하 화살표로 파일을 탐색합니다 |
| `/doctor` | Claude Code 설치 및 설정을 진단하고 확인합니다. 결과가 상태 아이콘과 함께 표시됩니다. `f`를 누르면 보고된 문제를 Claude가 수정합니다 |
| `/effort [low\|medium\|high\|max\|auto]` | 모델 [노력 수준](/model-config#adjust-effort-level)을 설정합니다. `low`, `medium`, `high`는 세션 간에 유지됩니다. `max`는 현재 세션에만 적용되며 Opus 4.6이 필요합니다. `auto`는 모델 기본값으로 재설정합니다. 인수 없이 실행하면 현재 수준을 표시합니다. 현재 응답이 완료되기를 기다리지 않고 즉시 적용됩니다 |
| `/exit` | CLI를 종료합니다. 별칭: `/quit` |
| `/export [filename]` | 현재 대화를 일반 텍스트로 내보냅니다. 파일명을 지정하면 해당 파일에 직접 기록합니다. 파일명 없이 실행하면 클립보드에 복사하거나 파일로 저장하는 대화상자를 엽니다 |
| `/extra-usage` | 요금 제한에 도달했을 때 계속 작업하기 위한 추가 사용량을 구성합니다 |
| `/fast [on\|off]` | [빠른 모드](/fast-mode)를 켜거나 끕니다 |
| `/feedback [report]` | Claude Code에 대한 피드백을 제출합니다. 별칭: `/bug` |
| `/branch [name]` | 이 시점에서 현재 대화의 브랜치를 생성합니다. 별칭: `/fork` |
| `/help` | 도움말 및 사용 가능한 명령어를 표시합니다 |
| `/hooks` | 도구 이벤트에 대한 [훅](/hooks) 설정을 봅니다 |
| `/ide` | IDE 통합을 관리하고 상태를 표시합니다 |
| `/init` | `CLAUDE.md` 가이드로 프로젝트를 초기화합니다. `CLAUDE_CODE_NEW_INIT=1`을 설정하면 스킬, 훅, 개인 메모리 파일도 안내하는 인터랙티브 플로우를 사용합니다 |
| `/insights` | 프로젝트 영역, 상호작용 패턴, 마찰 지점을 포함하여 Claude Code 세션을 분석하는 보고서를 생성합니다 |
| `/install-github-app` | 저장소에 [Claude GitHub Actions](/github-actions) 앱을 설정합니다. 저장소 선택 및 통합 구성을 안내합니다 |
| `/install-slack-app` | Claude Slack 앱을 설치합니다. 브라우저를 열어 OAuth 플로우를 완료합니다 |
| `/keybindings` | 키바인딩 설정 파일을 열거나 생성합니다 |
| `/login` | Anthropic 계정에 로그인합니다 |
| `/logout` | Anthropic 계정에서 로그아웃합니다 |
| `/loop [interval] [prompt]` | **[Skill](/skills#bundled-skills).** 세션이 열려 있는 동안 프롬프트를 반복 실행합니다. 간격을 생략하면 Claude가 반복 간 속도를 자체 조절합니다. 프롬프트를 생략하면 자율 유지보수 점검을 실행하거나, `.claude/loop.md`에 프롬프트가 있으면 그것을 실행합니다. 예: `/loop 5m check if the deploy finished`. [일정에 따라 프롬프트 실행](/scheduled-tasks)을 참조하세요. 별칭: `/proactive` |
| `/mcp` | MCP 서버 연결 및 OAuth 인증을 관리합니다 |
| `/memory` | `CLAUDE.md` 메모리 파일을 편집하고, [자동 메모리](/memory#auto-memory)를 활성화 또는 비활성화하고, 자동 메모리 항목을 봅니다 |
| `/mobile` | Claude 모바일 앱을 다운로드할 QR 코드를 표시합니다. 별칭: `/ios`, `/android` |
| `/model [model]` | AI 모델을 선택하거나 변경합니다. 지원하는 모델의 경우 좌우 화살표로 [노력 수준을 조정](/model-config#adjust-effort-level)할 수 있습니다. 현재 응답이 완료되기를 기다리지 않고 즉시 적용됩니다 |
| `/passes` | 친구에게 Claude Code 무료 1주일을 공유합니다. 계정이 자격이 있는 경우에만 표시됩니다 |
| `/permissions` | 도구 권한에 대한 허용, 확인, 거부 규칙을 관리합니다. 범위별 규칙 조회, 규칙 추가 또는 제거, 작업 디렉토리 관리, [최근 자동 모드 거부 검토](/permissions#review-auto-mode-denials)가 가능한 인터랙티브 대화상자를 엽니다. 별칭: `/allowed-tools` |
| `/plan [description]` | 프롬프트에서 바로 계획 모드에 진입합니다. 설명을 전달하면 계획 모드에 진입하여 즉시 해당 작업을 시작합니다. 예: `/plan fix the auth bug` |
| `/plugin` | Claude Code [플러그인](/plugins)을 관리합니다 |
| `/powerup` | 빠른 인터랙티브 레슨과 애니메이션 데모를 통해 Claude Code 기능을 발견합니다 |
| `/pr-comments [PR]` | v2.1.91에서 제거되었습니다. 대신 Claude에게 직접 pull request 코멘트를 보도록 요청하세요. 이전 버전에서는 GitHub pull request의 코멘트를 가져와 표시합니다. 현재 브랜치의 PR을 자동 감지하거나 PR URL 또는 번호를 전달할 수 있습니다. `gh` CLI가 필요합니다 |
| `/privacy-settings` | 개인정보 설정을 보고 업데이트합니다. Pro 및 Max 요금제 구독자만 사용 가능합니다 |
| `/release-notes` | 인터랙티브 버전 선택기에서 변경 로그를 봅니다. 특정 버전을 선택하여 릴리스 노트를 보거나 모든 버전을 표시할 수 있습니다 |
| `/reload-plugins` | 재시작 없이 보류 중인 변경사항을 적용하기 위해 모든 활성 [플러그인](/plugins)을 다시 로드합니다. 다시 로드된 각 컴포넌트의 수를 보고하고 로드 오류를 표시합니다 |
| `/remote-control` | 이 세션을 claude.ai에서 [원격 제어](/remote-control)할 수 있도록 합니다. 별칭: `/rc` |
| `/remote-env` | [`--remote`로 시작한 웹 세션](/claude-code-on-the-web#configure-your-environment)의 기본 원격 환경을 구성합니다 |
| `/rename [name]` | 현재 세션의 이름을 변경하고 프롬프트 바에 표시합니다. 이름 없이 실행하면 대화 기록에서 자동 생성합니다 |
| `/resume [session]` | ID 또는 이름으로 대화를 재개하거나 세션 선택기를 엽니다. 별칭: `/continue` |
| `/review` | 더 이상 사용되지 않습니다. 대신 [`code-review` 플러그인](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review)을 설치하세요: `claude plugin install code-review@claude-plugins-official` |
| `/rewind` | 대화 및/또는 코드를 이전 시점으로 되감거나 선택한 메시지부터 요약합니다. [체크포인팅](/checkpointing)을 참조하세요. 별칭: `/checkpoint` |
| `/sandbox` | [샌드박스 모드](/sandboxing)를 전환합니다. 지원되는 플랫폼에서만 사용 가능합니다 |
| `/schedule [description]` | [클라우드 예약 작업](/web-scheduled-tasks)을 생성, 업데이트, 나열 또는 실행합니다. Claude가 대화형으로 설정을 안내합니다 |
| `/security-review` | 현재 브랜치의 보류 중인 변경사항을 보안 취약점에 대해 분석합니다. git diff를 검토하고 인젝션, 인증 문제, 데이터 노출 등의 위험을 식별합니다 |
| `/setup-bedrock` | 인터랙티브 마법사를 통해 [Amazon Bedrock](/amazon-bedrock) 인증, 리전, 모델 핀을 구성합니다. `CLAUDE_CODE_USE_BEDROCK=1`이 설정된 경우에만 표시됩니다. Bedrock을 처음 사용하는 경우 로그인 화면에서도 이 마법사에 접근할 수 있습니다 |
| `/setup-vertex` | 인터랙티브 마법사를 통해 [Google Vertex AI](/google-vertex-ai) 인증, 프로젝트, 리전, 모델 핀을 구성합니다. `CLAUDE_CODE_USE_VERTEX=1`이 설정된 경우에만 표시됩니다. Vertex AI를 처음 사용하는 경우 로그인 화면에서도 이 마법사에 접근할 수 있습니다 |
| `/simplify [focus]` | **[Skill](/skills#bundled-skills).** 최근 변경된 파일을 코드 재사용, 품질, 효율성 문제에 대해 검토한 후 수정합니다. 3개의 검토 에이전트를 병렬로 생성하고, 결과를 종합한 후 수정을 적용합니다. 특정 관심사에 초점을 맞추려면 텍스트를 전달하세요: `/simplify focus on memory efficiency` |
| `/skills` | 사용 가능한 [스킬](/skills)을 나열합니다 |
| `/stats` | 일별 사용량, 세션 기록, 연속 사용일, 모델 선호도를 시각화합니다 |
| `/status` | 버전, 모델, 계정, 연결 상태를 보여주는 설정 인터페이스(Status 탭)를 엽니다. 현재 응답이 완료되기를 기다리지 않고 동작합니다 |
| `/statusline` | Claude Code의 [상태 표시줄](/statusline)을 구성합니다. 원하는 내용을 설명하거나, 인수 없이 실행하면 셸 프롬프트에서 자동 구성합니다 |
| `/stickers` | Claude Code 스티커를 주문합니다 |
| `/tasks` | 백그라운드 작업을 나열하고 관리합니다. `/bashes`로도 사용 가능합니다 |
| `/team-onboarding` | Claude Code 사용 기록에서 팀 온보딩 가이드를 생성합니다. Claude가 지난 30일간의 세션, 명령어, MCP 서버 사용량을 분석하여 팀원이 빠르게 설정할 수 있도록 첫 메시지로 붙여넣을 수 있는 마크다운 가이드를 생성합니다 |
| `/teleport` | [웹 Claude Code](/claude-code-on-the-web#from-web-to-terminal) 세션을 이 터미널로 가져옵니다: 선택기를 열고 브랜치와 대화를 가져옵니다. `/tp`로도 사용 가능합니다. claude.ai 구독이 필요합니다 |
| `/terminal-setup` | Shift+Enter 및 기타 단축키에 대한 터미널 키바인딩을 구성합니다. VS Code, Alacritty, Warp 등 필요한 터미널에서만 표시됩니다 |
| `/theme` | 색상 테마를 변경합니다. 라이트 및 다크 변형, 색각 이상자 접근성(달토나이즈) 테마, 터미널의 색상 팔레트를 사용하는 ANSI 테마를 포함합니다 |
| `/ultraplan <prompt>` | [ultraplan](/ultraplan) 세션에서 계획을 초안 작성하고, 브라우저에서 검토한 후 원격으로 실행하거나 터미널로 다시 보냅니다 |
| `/upgrade` | 더 높은 요금제로 전환하기 위한 업그레이드 페이지를 엽니다 |
| `/usage` | 요금제 사용 한도 및 요금 제한 상태를 표시합니다 |
| `/vim` | v2.1.92에서 제거되었습니다. Vim과 Normal 편집 모드를 전환하려면 `/config` → Editor mode를 사용하세요 |
| `/voice` | 푸시투토크 [음성 받아쓰기](/voice-dictation)를 전환합니다. Claude.ai 계정이 필요합니다 |
| `/web-setup` | 로컬 `gh` CLI 자격 증명을 사용하여 GitHub 계정을 [웹 Claude Code](/web-quickstart#connect-from-your-terminal)에 연결합니다. GitHub이 연결되지 않은 경우 `/schedule`이 자동으로 이를 요청합니다 |

## MCP 프롬프트

MCP 서버는 명령어로 표시되는 프롬프트를 노출할 수 있습니다. 이들은 `/mcp__<server>__<prompt>` 형식을 사용하며 연결된 서버에서 동적으로 검색됩니다. 자세한 내용은 [MCP 프롬프트](/mcp#use-mcp-prompts-as-commands)를 참조하세요.

## 같이 보기

* [스킬](/skills): 직접 명령어를 만들 수 있습니다
* [인터랙티브 모드](/interactive-mode): 키보드 단축키, Vim 모드, 명령어 기록
* [CLI 레퍼런스](/cli-reference): 실행 시 플래그
