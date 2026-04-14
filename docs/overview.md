# Claude Code 개요

> Claude Code는 코드베이스를 읽고, 파일을 편집하고, 명령을 실행하고, 개발 도구와 통합되는 에이전틱 코딩 도구입니다. 터미널, IDE, 데스크톱 앱, 브라우저에서 사용할 수 있습니다.

Claude Code는 기능 구축, 버그 수정, 개발 작업 자동화를 돕는 AI 기반 코딩 어시스턴트입니다. 전체 코드베이스를 이해하고 여러 파일과 도구에 걸쳐 작업을 수행할 수 있습니다.

## 시작하기

환경을 선택하여 시작하세요. 대부분의 환경에서는 [Claude 구독](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=overview_pricing) 또는 [Anthropic Console](https://console.anthropic.com/) 계정이 필요합니다. Terminal CLI와 VS Code는 [타사 제공업체](/third-party-integrations)도 지원합니다.

::: tabs

== Terminal

터미널에서 직접 Claude Code로 작업하기 위한 완전한 기능의 CLI입니다. 파일 편집, 명령 실행, 전체 프로젝트 관리를 커맨드 라인에서 수행합니다.

Claude Code를 설치하려면 다음 방법 중 하나를 사용하세요:

**네이티브 설치 (권장)**

**macOS, Linux, WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

`The token '&&' is not a valid statement separator`가 표시되면 CMD가 아닌 PowerShell에 있는 것입니다. 위의 PowerShell 명령을 대신 사용하세요. 프롬프트가 `PS C:\`로 표시되면 PowerShell에 있는 것입니다.

**네이티브 Windows 설정에는 [Git for Windows](https://git-scm.com/downloads/win)가 필요합니다.** 없는 경우 먼저 설치하세요. WSL 설정에서는 필요하지 않습니다.

::: info
네이티브 설치는 최신 버전을 유지하기 위해 백그라운드에서 자동 업데이트됩니다.
:::

**Homebrew**

```bash
brew install --cask claude-code
```

Homebrew는 두 가지 cask를 제공합니다. `claude-code`는 안정 릴리스 채널을 추적하며 일반적으로 약 일주일 뒤처지고 주요 회귀가 있는 릴리스를 건너뜁니다. `claude-code@latest`는 최신 채널을 추적하며 새 버전이 출시되는 즉시 수신합니다.

::: info
Homebrew 설치는 자동 업데이트되지 않습니다. 최신 기능과 보안 수정을 받으려면 설치한 cask에 따라 `brew upgrade claude-code` 또는 `brew upgrade claude-code@latest`를 실행하세요.
:::

**WinGet**

```powershell
winget install Anthropic.ClaudeCode
```

::: info
WinGet 설치는 자동 업데이트되지 않습니다. 최신 기능과 보안 수정을 받으려면 주기적으로 `winget upgrade Anthropic.ClaudeCode`를 실행하세요.
:::

그런 다음 아무 프로젝트에서 Claude Code를 시작하세요:

```bash
cd your-project
claude
```

처음 사용 시 로그인하라는 메시지가 표시됩니다. 끝입니다! [빠른 시작으로 계속하기 →](/quickstart)

::: tip
설치 옵션, 수동 업데이트 또는 제거 지침은 [고급 설정](/setup)을 참조하세요. 문제가 발생하면 [문제 해결](/troubleshooting)을 방문하세요.
:::

== VS Code

VS Code 확장은 인라인 diff, @-멘션, 계획 리뷰, 대화 기록을 편집기에서 직접 제공합니다.

* [VS Code용 설치](vscode:extension/anthropic.claude-code)
* [Cursor용 설치](cursor:extension/anthropic.claude-code)

또는 확장 뷰(`Cmd+Shift+X` (Mac), `Ctrl+Shift+X` (Windows/Linux))에서 "Claude Code"를 검색하세요. 설치 후 명령 팔레트(`Cmd+Shift+P` / `Ctrl+Shift+P`)를 열고 "Claude Code"를 입력한 후 **Open in New Tab**을 선택하세요.

[VS Code 시작하기 →](/vs-code#get-started)

== 데스크톱 앱

IDE나 터미널 밖에서 Claude Code를 실행하기 위한 독립 실행형 앱입니다. diff를 시각적으로 검토하고, 여러 세션을 나란히 실행하고, 반복 작업을 예약하고, 클라우드 세션을 시작하세요.

다운로드 및 설치:

* [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code\&utm_medium=docs) (Intel 및 Apple Silicon)
* [Windows](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs) (x64)
* [Windows ARM64](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs)

설치 후 Claude를 실행하고 로그인한 다음 **Code** 탭을 클릭하여 코딩을 시작하세요. [유료 구독](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=overview_desktop_pricing)이 필요합니다.

[데스크톱 앱에 대해 자세히 알아보기 →](/desktop-quickstart)

== Web

로컬 설정 없이 브라우저에서 Claude Code를 실행합니다. 장기 실행 작업을 시작하고 완료되면 확인하거나, 로컬에 없는 리포지토리에서 작업하거나, 여러 작업을 병렬로 실행하세요. 데스크톱 브라우저와 Claude iOS 앱에서 사용할 수 있습니다.

[claude.ai/code](https://claude.ai/code)에서 코딩을 시작하세요.

[웹에서 시작하기 →](/web-quickstart)

== JetBrains

대화형 diff 보기 및 선택 컨텍스트 공유 기능을 갖춘 IntelliJ IDEA, PyCharm, WebStorm 및 기타 JetBrains IDE용 플러그인입니다.

JetBrains Marketplace에서 [Claude Code 플러그인](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-)을 설치하고 IDE를 재시작하세요.

[JetBrains 시작하기 →](/jetbrains)

:::

## 할 수 있는 것들

Claude Code를 사용할 수 있는 몇 가지 방법은 다음과 같습니다:

::: details 미루고 있던 작업 자동화
Claude Code는 하루를 잡아먹는 지루한 작업을 처리합니다: 테스트되지 않은 코드에 대한 테스트 작성, 프로젝트 전체의 lint 오류 수정, 병합 충돌 해결, 의존성 업데이트, 릴리스 노트 작성.

```bash
claude "write tests for the auth module, run them, and fix any failures"
```
:::

::: details 기능 구축 및 버그 수정
원하는 것을 자연어로 설명하세요. Claude Code가 접근 방식을 계획하고, 여러 파일에 걸쳐 코드를 작성하고, 작동을 검증합니다.

버그의 경우 오류 메시지를 붙여넣거나 증상을 설명하세요. Claude Code가 코드베이스를 통해 문제를 추적하고, 근본 원인을 파악하고, 수정을 구현합니다. 더 많은 예시는 [일반 워크플로우](/common-workflows)를 참조하세요.
:::

::: details 커밋 및 풀 리퀘스트 생성
Claude Code는 git과 직접 작업합니다. 변경 사항을 스테이징하고, 커밋 메시지를 작성하고, 브랜치를 생성하고, 풀 리퀘스트를 엽니다.

```bash
claude "commit my changes with a descriptive message"
```

CI에서는 [GitHub Actions](/github-actions) 또는 [GitLab CI/CD](/gitlab-ci-cd)로 코드 리뷰 및 이슈 분류를 자동화할 수 있습니다.
:::

::: details MCP로 도구 연결
[Model Context Protocol (MCP)](/mcp)은 AI 도구를 외부 데이터 소스에 연결하기 위한 개방형 표준입니다. MCP를 사용하면 Claude Code가 Google Drive의 디자인 문서를 읽고, Jira의 티켓을 업데이트하고, Slack에서 데이터를 가져오거나, 자체 커스텀 도구를 사용할 수 있습니다.
:::

::: details 지침, 스킬, 훅으로 커스터마이즈
[`CLAUDE.md`](/memory)는 프로젝트 루트에 추가하는 마크다운 파일로, Claude Code가 매 세션 시작 시 읽습니다. 코딩 표준, 아키텍처 결정, 선호하는 라이브러리, 리뷰 체크리스트를 설정하는 데 사용합니다. Claude는 작업하면서 [자동 메모리](/memory#auto-memory)도 구축하여, 빌드 명령과 디버깅 인사이트 같은 학습 내용을 아무것도 작성하지 않아도 세션 간에 저장합니다.

[사용자 정의 명령](/skills)을 만들어 `/review-pr`이나 `/deploy-staging`과 같은 반복 가능한 워크플로우를 팀과 공유할 수 있습니다.

[훅](/hooks)을 사용하면 Claude Code 동작 전후에 셸 명령을 실행할 수 있습니다. 예를 들어 파일 편집 후 자동 포맷팅이나 커밋 전 lint 실행 등이 있습니다.
:::

::: details 에이전트 팀 실행 및 사용자 정의 에이전트 구축
작업의 다른 부분에서 동시에 작업하는 [여러 Claude Code 에이전트](/sub-agents)를 생성합니다. 리드 에이전트가 작업을 조율하고, 하위 작업을 할당하고, 결과를 병합합니다.

완전한 커스텀 워크플로우의 경우, [Agent SDK](/agent-sdk/overview)를 사용하면 오케스트레이션, 도구 접근, 권한을 완전히 제어하면서 Claude Code의 도구와 기능으로 구동되는 자체 에이전트를 구축할 수 있습니다.
:::

::: details CLI로 파이프, 스크립트, 자동화
Claude Code는 조합 가능하며 Unix 철학을 따릅니다. 로그를 파이프하거나, CI에서 실행하거나, 다른 도구와 체이닝하세요:

```bash
# 최근 로그 출력 분석
tail -200 app.log | claude -p "Slack me if you see any anomalies"

# CI에서 번역 자동화
claude -p "translate new strings into French and raise a PR for review"

# 파일 전체에 대한 대량 작업
git diff main --name-only | claude -p "review these changed files for security issues"
```

전체 명령 및 플래그 세트는 [CLI 참조](/cli-reference)를 확인하세요.
:::

::: details 반복 작업 예약
Claude를 일정에 따라 실행하여 반복되는 작업을 자동화하세요: 아침 PR 리뷰, 야간 CI 실패 분석, 주간 의존성 감사, PR 병합 후 문서 동기화.

* [클라우드 예약 작업](/web-scheduled-tasks)은 Anthropic 관리 인프라에서 실행되므로 컴퓨터가 꺼져 있어도 계속 실행됩니다. 웹, 데스크톱 앱에서 생성하거나 CLI에서 `/schedule`을 실행하여 생성합니다.
* [데스크톱 예약 작업](/desktop-scheduled-tasks)은 로컬 파일과 도구에 직접 접근하여 사용자의 컴퓨터에서 실행됩니다.
* [`/loop`](/scheduled-tasks)는 빠른 폴링을 위해 CLI 세션 내에서 프롬프트를 반복합니다.
:::

::: details 어디서든 작업
세션은 단일 환경에 묶여 있지 않습니다. 컨텍스트가 변경되면 환경 간에 작업을 이동하세요:

* 자리를 비우고 휴대폰이나 아무 브라우저에서 [Remote Control](/remote-control)로 계속 작업
* 휴대폰에서 [Dispatch](/desktop#sessions-from-dispatch)에 작업을 메시지하고 생성된 데스크톱 세션을 열기
* [웹](/claude-code-on-the-web)이나 [iOS 앱](https://apps.apple.com/app/claude-by-anthropic/id6473753684)에서 장기 실행 작업을 시작한 다음 `claude --teleport`로 터미널에 가져오기
* `/desktop`으로 터미널 세션을 [데스크톱 앱](/desktop)에 전달하여 시각적 diff 리뷰
* 팀 채팅에서 작업 라우팅: [Slack](/slack)에서 `@Claude`를 멘션하여 버그 리포트를 보내면 풀 리퀘스트를 돌려받기
:::

## 어디서든 Claude Code 사용

각 환경은 동일한 기본 Claude Code 엔진에 연결되므로, CLAUDE.md 파일, 설정, MCP 서버가 모든 환경에서 작동합니다.

위의 [Terminal](/quickstart), [VS Code](/vs-code), [JetBrains](/jetbrains), [Desktop](/desktop), [Web](/claude-code-on-the-web) 환경 외에도, Claude Code는 CI/CD, 채팅, 브라우저 워크플로우와 통합됩니다:

| 하고 싶은 것                                                                     | 최적의 옵션                                                                                                        |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 휴대폰이나 다른 기기에서 로컬 세션 계속하기                                         | [Remote Control](/remote-control)                                                                               |
| Telegram, Discord, iMessage 또는 자체 웹훅의 이벤트를 세션에 푸시                   | [Channels](/channels)                                                                                           |
| 로컬에서 작업을 시작하고 모바일에서 계속하기                                         | [Web](/claude-code-on-the-web) 또는 [Claude iOS 앱](https://apps.apple.com/app/claude-by-anthropic/id6473753684) |
| 반복 일정으로 Claude 실행                                                          | [클라우드 예약 작업](/web-scheduled-tasks) 또는 [데스크톱 예약 작업](/desktop-scheduled-tasks)         |
| PR 리뷰 및 이슈 분류 자동화                                                       | [GitHub Actions](/github-actions) 또는 [GitLab CI/CD](/gitlab-ci-cd)                                           |
| 모든 PR에 대한 자동 코드 리뷰                                                     | [GitHub Code Review](/code-review)                                                                              |
| Slack에서 버그 리포트를 풀 리퀘스트로 라우팅                                        | [Slack](/slack)                                                                                                 |
| 라이브 웹 애플리케이션 디버그                                                      | [Chrome](/chrome)                                                                                               |
| 자체 워크플로우를 위한 커스텀 에이전트 구축                                          | [Agent SDK](/agent-sdk/overview)                                                                                |

## 다음 단계

Claude Code를 설치한 후, 다음 가이드들이 더 깊이 이해하는 데 도움이 됩니다.

* [빠른 시작](/quickstart): 코드베이스 탐색부터 수정 커밋까지 첫 번째 실제 작업을 안내합니다
* [지침 및 메모리 저장](/memory): CLAUDE.md 파일과 자동 메모리로 Claude에 지속적인 지침을 제공합니다
* [일반 워크플로우](/common-workflows) 및 [모범 사례](/best-practices): Claude Code를 최대한 활용하기 위한 패턴
* [설정](/settings): 워크플로우에 맞게 Claude Code를 커스터마이즈합니다
* [문제 해결](/troubleshooting): 일반적인 문제에 대한 해결책
* [code.claude.com](https://code.claude.com/): 데모, 가격, 제품 세부 정보
