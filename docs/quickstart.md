---
title: 빠른 시작
description: 이 빠른 시작 가이드는 몇 분 안에 AI 기반 코딩 도구를 사용할 수 있도록 안내합니다.
---

# 빠른 시작

> Claude Code에 오신 것을 환영합니다!

이 빠른 시작 가이드를 통해 몇 분 안에 AI 기반 코딩 지원을 사용할 수 있습니다. 가이드를 마치면 일반적인 개발 작업에 Claude Code를 활용하는 방법을 이해하게 됩니다.

## 시작하기 전에

다음 항목이 준비되어 있는지 확인하세요:

* 열려 있는 터미널 또는 명령 프롬프트
  * 터미널을 처음 사용하는 경우 [터미널 가이드](/terminal-guide)를 참조하세요
* 작업할 코드 프로젝트
* [Claude 구독](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=quickstart_prereq) (Pro, Max, Team, 또는 Enterprise), [Claude Console](https://console.anthropic.com/) 계정, 또는 [지원되는 클라우드 공급자](/third-party-integrations)를 통한 접근

::: info
이 가이드는 터미널 CLI를 다룹니다. Claude Code는 [웹](https://claude.ai/code), [데스크톱 앱](/desktop), [VS Code](/vs-code), [JetBrains IDE](/jetbrains), [Slack](/slack), 그리고 [GitHub Actions](/github-actions) 및 [GitLab](/gitlab-ci-cd)을 통한 CI/CD에서도 사용할 수 있습니다. [모든 인터페이스 보기](/overview#use-claude-code-everywhere)를 참조하세요.
:::

## 1단계: Claude Code 설치

Claude Code를 설치하려면 다음 방법 중 하나를 사용하세요:

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

`'&&' is not a valid statement separator`라는 오류가 표시되면 PowerShell에 있는 것입니다. 위의 PowerShell 명령을 사용하세요. PowerShell에 있을 때 프롬프트에 `PS C:\`가 표시됩니다.

**기본 Windows 설정에는 [Git for Windows](https://git-scm.com/downloads/win)가 필요합니다.** 없다면 먼저 설치하세요. WSL 설정에는 필요하지 않습니다.

::: info
기본 설치는 최신 버전을 유지하기 위해 백그라운드에서 자동으로 업데이트됩니다.
:::

**Homebrew:**

```bash
brew install --cask claude-code
```

Homebrew는 두 가지 cask를 제공합니다. `claude-code`는 안정적인 릴리스 채널을 추적하며, 일반적으로 약 일주일 지연되고 주요 회귀가 있는 릴리스는 건너뜁니다. `claude-code@latest`는 최신 채널을 추적하며 새 버전이 출시되는 즉시 제공됩니다.

::: info
Homebrew 설치는 자동으로 업데이트되지 않습니다. 최신 기능 및 보안 수정을 받으려면 설치한 cask에 따라 `brew upgrade claude-code` 또는 `brew upgrade claude-code@latest`를 실행하세요.
:::

**WinGet:**

```powershell
winget install Anthropic.ClaudeCode
```

::: info
WinGet 설치는 자동으로 업데이트되지 않습니다. 최신 기능 및 보안 수정을 받으려면 주기적으로 `winget upgrade Anthropic.ClaudeCode`를 실행하세요.
:::

## 2단계: 계정에 로그인

Claude Code를 사용하려면 계정이 필요합니다. `claude` 명령으로 대화형 세션을 시작하면 로그인해야 합니다:

```bash
claude
# 처음 사용 시 로그인하라는 메시지가 표시됩니다
```

```bash
/login
# 계정으로 로그인하려면 프롬프트를 따르세요
```

다음 계정 유형 중 하나를 사용하여 로그인할 수 있습니다:

* [Claude Pro, Max, Team, 또는 Enterprise](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=quickstart_login) (권장)
* [Claude Console](https://console.anthropic.com/) (선불 크레딧을 통한 API 접근). 첫 로그인 시 중앙 집중식 비용 추적을 위해 Console에 "Claude Code" 워크스페이스가 자동으로 생성됩니다.
* [Amazon Bedrock, Google Vertex AI, 또는 Microsoft Foundry](/third-party-integrations) (엔터프라이즈 클라우드 공급자)

로그인하면 자격 증명이 저장되어 다시 로그인할 필요가 없습니다. 나중에 계정을 전환하려면 `/login` 명령을 사용하세요.

## 3단계: 첫 번째 세션 시작

터미널에서 프로젝트 디렉터리를 열고 Claude Code를 시작하세요:

```bash
cd /path/to/your/project
claude
```

세션 정보, 최근 대화, 최신 업데이트가 담긴 Claude Code 환영 화면이 표시됩니다. 사용 가능한 명령은 `/help`를, 이전 대화를 계속하려면 `/resume`을 입력하세요.

::: tip
로그인(2단계) 후 자격 증명이 시스템에 저장됩니다. 자세한 내용은 [자격 증명 관리](/authentication#credential-management)를 참조하세요.
:::

## 4단계: 첫 번째 질문하기

코드베이스 이해부터 시작해 보겠습니다. 다음 명령 중 하나를 시도해 보세요:

```text
what does this project do?
```

Claude가 파일을 분석하고 요약을 제공합니다. 더 구체적인 질문도 할 수 있습니다:

```text
what technologies does this project use?
```

```text
where is the main entry point?
```

```text
explain the folder structure
```

Claude의 기능에 대해 직접 물어볼 수도 있습니다:

```text
what can Claude Code do?
```

```text
how do I create custom skills in Claude Code?
```

```text
can Claude Code work with Docker?
```

::: info
Claude Code는 필요에 따라 프로젝트 파일을 읽습니다. 수동으로 컨텍스트를 추가할 필요가 없습니다.
:::

## 5단계: 첫 번째 코드 변경하기

이제 Claude Code로 실제 코딩 작업을 해봅시다. 간단한 작업을 시도해 보세요:

```text
add a hello world function to the main file
```

Claude Code는 다음을 수행합니다:

1. 적절한 파일 찾기
2. 제안된 변경 사항 표시
3. 승인 요청
4. 편집 수행

::: info
Claude Code는 파일을 수정하기 전에 항상 허가를 요청합니다. 개별 변경 사항을 승인하거나 세션에 대해 "모두 수락" 모드를 활성화할 수 있습니다.
:::

## 6단계: Claude Code로 Git 사용하기

Claude Code는 Git 작업을 대화형으로 만들어 줍니다:

```text
what files have I changed?
```

```text
commit my changes with a descriptive message
```

더 복잡한 Git 작업도 요청할 수 있습니다:

```text
create a new branch called feature/quickstart
```

```text
show me the last 5 commits
```

```text
help me resolve merge conflicts
```

## 7단계: 버그 수정 또는 기능 추가

Claude는 디버깅과 기능 구현에 능숙합니다.

원하는 것을 자연어로 설명하세요:

```text
add input validation to the user registration form
```

또는 기존 문제를 수정하세요:

```text
there's a bug where users can submit empty forms - fix it
```

Claude Code는 다음을 수행합니다:

* 관련 코드 찾기
* 컨텍스트 이해
* 솔루션 구현
* 테스트 실행 (가능한 경우)

## 8단계: 다른 일반적인 워크플로우 시험해 보기

Claude와 함께 작업할 수 있는 다양한 방법이 있습니다:

**코드 리팩터링**

```text
refactor the authentication module to use async/await instead of callbacks
```

**테스트 작성**

```text
write unit tests for the calculator functions
```

**문서 업데이트**

```text
update the README with installation instructions
```

**코드 리뷰**

```text
review my changes and suggest improvements
```

::: tip
Claude에게 유용한 동료에게 말하듯이 이야기하세요. 달성하려는 목표를 설명하면 도움을 받을 수 있습니다.
:::

## 필수 명령어

일상적인 사용을 위한 가장 중요한 명령어입니다:

| 명령어 | 기능 | 예시 |
| --- | --- | --- |
| `claude` | 대화형 모드 시작 | `claude` |
| `claude "task"` | 일회성 작업 실행 | `claude "fix the build error"` |
| `claude -p "query"` | 일회성 쿼리 실행 후 종료 | `claude -p "explain this function"` |
| `claude -c` | 현재 디렉터리에서 최근 대화 계속 | `claude -c` |
| `claude -r` | 이전 대화 재개 | `claude -r` |
| `/clear` | 대화 기록 지우기 | `/clear` |
| `/help` | 사용 가능한 명령 표시 | `/help` |
| `exit` 또는 Ctrl+D | Claude Code 종료 | `exit` |

전체 명령 목록은 [CLI 참조](/cli-reference)를 참조하세요.

## 초보자를 위한 팁

자세한 내용은 [모범 사례](/best-practices) 및 [일반적인 워크플로우](/common-workflows)를 참조하세요.

**요청을 구체적으로 하세요**

다음 대신: "fix the bug"

이렇게 시도하세요: "fix the login bug where users see a blank screen after entering wrong credentials"

**단계별 지시 사용하기**

복잡한 작업을 단계로 나누세요:

```text
1. create a new database table for user profiles
2. create an API endpoint to get and update user profiles
3. build a webpage that allows users to see and edit their information
```

**먼저 Claude가 탐색하게 하세요**

변경을 가하기 전에 Claude가 코드를 이해하게 하세요:

```text
analyze the database schema
```

```text
build a dashboard showing products that are most frequently returned by our UK customers
```

**단축키로 시간 절약하기**

* `?`를 눌러 모든 사용 가능한 키보드 단축키 보기
* Tab을 사용하여 명령 완성
* ↑을 눌러 명령 기록 탐색
* `/`를 입력하여 모든 명령과 스킬 보기

## 다음 단계

기본 사항을 배웠으니 더 고급 기능을 탐색해 보세요:

* [Claude Code 작동 방식](/how-claude-code-works) — 에이전트 루프, 내장 도구, Claude Code가 프로젝트와 상호 작용하는 방식 이해
* [모범 사례](/best-practices) — 효과적인 프롬프팅과 프로젝트 설정으로 더 나은 결과 얻기
* [일반적인 워크플로우](/common-workflows) — 일반적인 작업에 대한 단계별 가이드
* [Claude Code 확장](/features-overview) — CLAUDE.md, 스킬, 훅, MCP 등으로 맞춤 설정

## 도움 받기

* **Claude Code 내에서**: `/help`를 입력하거나 "how do I..."라고 질문하세요
* **문서**: 다른 가이드를 둘러보세요
* **커뮤니티**: 팁과 지원을 위해 [Discord](https://www.anthropic.com/discord)에 참여하세요
