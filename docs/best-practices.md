---
title: Claude Code 모범 사례
description: 환경 구성부터 병렬 세션 확장까지, Claude Code를 최대한 활용하기 위한 팁과 패턴을 소개합니다.
---

# Claude Code 모범 사례

Claude Code는 에이전트형 코딩 환경입니다. 질문에 답하고 기다리는 챗봇과 달리, Claude Code는 파일을 읽고, 명령을 실행하고, 변경을 가하며, 여러분이 지켜보거나 방향을 바꿔주거나 자리를 비운 사이에도 자율적으로 문제를 해결할 수 있습니다.

이는 작업 방식을 바꿉니다. 직접 코드를 작성하고 Claude에게 리뷰를 요청하는 대신, 원하는 것을 설명하면 Claude가 구현 방법을 알아냅니다. Claude가 탐색하고, 계획하고, 구현합니다.

하지만 이 자율성에도 학습 곡선이 있습니다. Claude는 여러분이 이해해야 할 특정 제약 조건 내에서 작동합니다.

이 가이드는 Anthropic 내부 팀과 다양한 코드베이스, 언어, 환경에서 Claude Code를 사용하는 엔지니어들에게 효과적으로 입증된 패턴을 다룹니다. 에이전트 루프가 내부적으로 어떻게 작동하는지는 [Claude Code 작동 방식](/how-claude-code-works)을 참조하세요.

***

대부분의 모범 사례는 하나의 제약에 기반합니다: Claude의 컨텍스트 윈도우는 빠르게 채워지며, 채워질수록 성능이 저하됩니다.

Claude의 컨텍스트 윈도우는 모든 메시지, Claude가 읽은 모든 파일, 모든 명령 출력을 포함한 전체 대화를 담습니다. 그러나 이는 빠르게 채워질 수 있습니다. 단일 디버깅 세션이나 코드베이스 탐색만으로도 수만 개의 토큰을 생성하고 소비할 수 있습니다.

이것이 중요한 이유는 컨텍스트가 채워질수록 LLM 성능이 저하되기 때문입니다. 컨텍스트 윈도우가 가득 차면 Claude는 이전 지시사항을 "잊어버리거나" 더 많은 실수를 할 수 있습니다. 컨텍스트 윈도우는 관리해야 할 가장 중요한 리소스입니다. 세션이 실제로 어떻게 채워지는지 보려면 시작 시 무엇이 로드되고 각 파일 읽기에 얼마나 비용이 드는지에 대한 [대화형 안내](/context-window)를 확인하세요. [커스텀 상태 표시줄](/statusline)로 컨텍스트 사용량을 지속적으로 추적하고, 토큰 사용량 절감 전략은 [토큰 사용량 줄이기](/costs#reduce-token-usage)를 참조하세요.

***

## Claude가 스스로 작업을 검증할 수 있게 하세요

::: tip
테스트, 스크린샷 또는 예상 출력을 포함하여 Claude가 스스로 확인할 수 있게 하세요. 이것이 가장 효과적인 단일 방법입니다.
:::

Claude는 자신의 작업을 검증할 수 있을 때, 즉 테스트를 실행하고, 스크린샷을 비교하고, 출력을 검증할 수 있을 때 극적으로 더 나은 성능을 발휘합니다.

명확한 성공 기준이 없으면 올바르게 보이지만 실제로는 작동하지 않는 결과를 만들 수 있습니다. 여러분이 유일한 피드백 루프가 되고, 모든 실수에 여러분의 주의가 필요합니다.

| 전략 | 이전 | 이후 |
| --- | --- | --- |
| **검증 기준 제공** | *"이메일 주소를 검증하는 함수를 구현해"* | *"validateEmail 함수를 작성해. 테스트 케이스 예시: [user@example.com](mailto:user@example.com)은 true, invalid는 false, [user@.com](mailto:user@.com)은 false. 구현 후 테스트를 실행해"* |
| **UI 변경을 시각적으로 검증** | *"대시보드를 더 보기 좋게 만들어"* | *"\[스크린샷 붙여넣기] 이 디자인을 구현해. 결과의 스크린샷을 찍어서 원본과 비교해. 차이점을 나열하고 수정해"* |
| **증상이 아닌 근본 원인 해결** | *"빌드가 실패해"* | *"이 에러로 빌드가 실패해: \[에러 붙여넣기]. 수정하고 빌드가 성공하는지 확인해. 에러를 억제하지 말고 근본 원인을 해결해"* |

UI 변경은 [Claude in Chrome 확장 프로그램](/chrome)을 사용하여 검증할 수 있습니다. 브라우저에서 새 탭을 열고, UI를 테스트하며, 코드가 작동할 때까지 반복합니다.

검증은 테스트 스위트, 린터 또는 출력을 확인하는 Bash 명령일 수도 있습니다. 검증을 견고하게 만드는 데 투자하세요.

***

## 먼저 탐색하고, 계획한 다음, 코딩하세요

::: tip
잘못된 문제를 해결하지 않도록 리서치와 계획을 구현과 분리하세요.
:::

Claude가 바로 코딩에 뛰어들면 잘못된 문제를 해결하는 코드를 만들 수 있습니다. [Plan Mode](/common-workflows#use-plan-mode-for-safe-code-analysis)를 사용하여 탐색과 실행을 분리하세요.

권장 워크플로우는 네 단계로 구성됩니다:

1. **탐색**

   Plan Mode에 진입합니다. Claude는 파일을 읽고 변경 없이 질문에 답합니다.

   ```txt
   read /src/auth and understand how we handle sessions and login.
   also look at how we manage environment variables for secrets.
   ```

2. **계획**

   Claude에게 상세한 구현 계획을 만들도록 요청합니다.

   ```txt
   I want to add Google OAuth. What files need to change?
   What's the session flow? Create a plan.
   ```

   `Ctrl+G`를 눌러 텍스트 에디터에서 계획을 열어 Claude가 진행하기 전에 직접 편집할 수 있습니다.

3. **구현**

   Normal Mode로 전환하고 Claude가 계획에 따라 코딩하도록 합니다.

   ```txt
   implement the OAuth flow from your plan. write tests for the
   callback handler, run the test suite and fix any failures.
   ```

4. **커밋**

   Claude에게 설명적인 메시지로 커밋하고 PR을 생성하도록 요청합니다.

   ```txt
   commit with a descriptive message and open a PR
   ```

::: info
Plan Mode는 유용하지만 오버헤드도 추가합니다.

범위가 명확하고 수정이 작은 작업(오타 수정, 로그 라인 추가, 변수 이름 변경 등)은 Claude에게 직접 수행하도록 요청하세요.

계획은 접근 방식이 불확실할 때, 변경이 여러 파일에 걸쳐 있을 때, 또는 수정하는 코드에 익숙하지 않을 때 가장 유용합니다. diff를 한 문장으로 설명할 수 있다면 계획을 건너뛰세요.
:::

***

## 프롬프트에 구체적인 컨텍스트를 제공하세요

::: tip
지시사항이 정확할수록 수정이 적게 필요합니다.
:::

Claude는 의도를 추론할 수 있지만 마음을 읽을 수는 없습니다. 특정 파일을 참조하고, 제약 조건을 언급하며, 예시 패턴을 가리키세요.

| 전략 | 이전 | 이후 |
| --- | --- | --- |
| **작업 범위 지정.** 어떤 파일인지, 어떤 시나리오인지, 테스트 선호사항을 지정합니다. | *"foo.py에 테스트 추가해"* | *"사용자가 로그아웃한 엣지 케이스를 다루는 foo.py 테스트를 작성해. mock은 피해."* |
| **출처 지시.** Claude를 질문에 답할 수 있는 소스로 안내합니다. | *"왜 ExecutionFactory의 API가 이상해?"* | *"ExecutionFactory의 git 히스토리를 살펴보고 API가 어떻게 현재 형태가 되었는지 요약해"* |
| **기존 패턴 참조.** 코드베이스의 패턴을 Claude에게 알려줍니다. | *"캘린더 위젯 추가해"* | *"홈 페이지의 기존 위젯이 어떻게 구현되어 있는지 살펴봐서 패턴을 이해해. HotDogWidget.php가 좋은 예시야. 패턴을 따라서 사용자가 월을 선택하고 앞뒤로 페이지네이션하여 연도를 선택할 수 있는 새 캘린더 위젯을 구현해. 코드베이스에 이미 사용된 라이브러리 외에는 라이브러리 없이 처음부터 구현해."* |
| **증상 설명.** 증상, 예상 위치, "수정됨"의 의미를 제공합니다. | *"로그인 버그 수정해"* | *"세션 타임아웃 후 로그인이 실패한다고 사용자가 보고해. src/auth/의 인증 흐름, 특히 토큰 갱신을 확인해. 문제를 재현하는 실패하는 테스트를 작성하고, 그런 다음 수정해"* |

모호한 프롬프트는 탐색 중이고 방향 수정을 할 수 있을 때 유용할 수 있습니다. `"이 파일에서 무엇을 개선하겠어?"`와 같은 프롬프트는 여러분이 물어볼 생각을 하지 못했을 것들을 발견할 수 있습니다.

### 풍부한 콘텐츠 제공

::: tip
`@`로 파일을 참조하거나, 스크린샷/이미지를 붙여넣거나, 데이터를 직접 파이프하세요.
:::

여러 가지 방법으로 Claude에 풍부한 데이터를 제공할 수 있습니다:

* **`@`로 파일 참조** - 코드가 어디에 있는지 설명하는 대신 사용합니다. Claude가 응답하기 전에 파일을 읽습니다.
* **이미지를 직접 붙여넣기** - 프롬프트에 이미지를 복사/붙여넣기하거나 드래그 앤 드롭합니다.
* **URL 제공** - 문서와 API 참조용입니다. `/permissions`를 사용하여 자주 사용하는 도메인을 허용 목록에 추가합니다.
* **데이터 파이프** - `cat error.log | claude`를 실행하여 파일 내용을 직접 전송합니다.
* **Claude가 필요한 것을 가져오게 하기** - Bash 명령, MCP 도구 또는 파일 읽기를 사용하여 Claude가 직접 컨텍스트를 가져오도록 합니다.

***

## 환경 구성하기

몇 가지 설정 단계로 모든 세션에서 Claude Code의 효과를 크게 높일 수 있습니다. 확장 기능의 전체 개요와 각 기능을 사용할 시기는 [Claude Code 확장하기](/features-overview)를 참조하세요.

### 효과적인 CLAUDE.md 작성하기

::: tip
`/init`을 실행하여 현재 프로젝트 구조를 기반으로 시작 CLAUDE.md 파일을 생성한 다음 시간이 지남에 따라 다듬으세요.
:::

CLAUDE.md는 Claude가 모든 대화 시작 시 읽는 특별한 파일입니다. Bash 명령, 코드 스타일, 워크플로우 규칙을 포함하세요. 이는 Claude에게 코드만으로는 추론할 수 없는 지속적인 컨텍스트를 제공합니다.

`/init` 명령은 코드베이스를 분석하여 빌드 시스템, 테스트 프레임워크, 코드 패턴을 감지하여 다듬기 위한 견고한 기반을 제공합니다.

CLAUDE.md 파일에 필수 형식은 없지만 짧고 사람이 읽기 쉽게 유지하세요. 예시:

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

CLAUDE.md는 매 세션마다 로드되므로 광범위하게 적용되는 것만 포함하세요. 가끔만 관련되는 도메인 지식이나 워크플로우에는 [skills](/skills)를 대신 사용하세요. Claude가 모든 대화를 부풀리지 않고 필요할 때 로드합니다.

간결하게 유지하세요. 각 줄마다 다음을 물어보세요: *"이것을 제거하면 Claude가 실수를 하게 될까?"* 그렇지 않다면 삭제하세요. 비대해진 CLAUDE.md 파일은 Claude가 실제 지시사항을 무시하게 만듭니다!

| 포함할 것 | 제외할 것 |
| --- | --- |
| Claude가 추측할 수 없는 Bash 명령 | Claude가 코드를 읽어서 파악할 수 있는 것 |
| 기본값과 다른 코드 스타일 규칙 | Claude가 이미 아는 표준 언어 규약 |
| 테스트 지침과 선호 테스트 러너 | 상세한 API 문서 (대신 문서 링크 제공) |
| 저장소 에티켓 (브랜치 네이밍, PR 규약) | 자주 변경되는 정보 |
| 프로젝트 특정 아키텍처 결정 | 긴 설명이나 튜토리얼 |
| 개발 환경 특이사항 (필수 환경 변수) | 파일별 코드베이스 설명 |
| 일반적인 함정이나 비직관적 동작 | "깨끗한 코드를 작성하라" 같은 자명한 관행 |

규칙이 있음에도 Claude가 원치 않는 행동을 계속한다면, 파일이 너무 길어서 중요한 규칙이 노이즈에 묻히고 있을 가능성이 높습니다. Claude가 CLAUDE.md에 답이 있는 질문을 한다면 표현이 모호할 수 있습니다. CLAUDE.md를 코드처럼 다루세요: 문제가 발생하면 검토하고, 정기적으로 정리하며, Claude의 행동이 실제로 변하는지 관찰하여 변경 사항을 테스트하세요.

강조(예: "IMPORTANT" 또는 "YOU MUST")를 추가하여 준수도를 높일 수 있습니다. CLAUDE.md를 git에 체크인하여 팀이 기여할 수 있게 하세요. 이 파일은 시간이 지남에 따라 가치가 복리로 증가합니다.

CLAUDE.md 파일은 `@path/to/import` 구문을 사용하여 추가 파일을 가져올 수 있습니다:

```markdown
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

CLAUDE.md 파일을 여러 위치에 배치할 수 있습니다:

* **홈 폴더 (`~/.claude/CLAUDE.md`)**: 모든 Claude 세션에 적용
* **프로젝트 루트 (`./CLAUDE.md`)**: git에 체크인하여 팀과 공유
* **프로젝트 루트 (`./CLAUDE.local.md`)**: 개인 프로젝트별 메모; `.gitignore`에 추가하여 팀과 공유하지 않음
* **상위 디렉토리**: `root/CLAUDE.md`와 `root/foo/CLAUDE.md` 모두 자동으로 가져오는 모노레포에 유용
* **하위 디렉토리**: 해당 디렉토리의 파일을 작업할 때 Claude가 필요에 따라 하위 CLAUDE.md 파일을 가져옴

### 권한 구성하기

::: tip
[auto mode](/permission-modes#eliminate-prompts-with-auto-mode)를 사용하여 분류기가 승인을 처리하게 하거나, `/permissions`로 특정 명령을 허용 목록에 추가하거나, `/sandbox`로 OS 수준 격리를 사용하세요. 각각이 여러분의 통제를 유지하면서 중단을 줄여줍니다.
:::

기본적으로 Claude Code는 시스템을 수정할 수 있는 작업(파일 쓰기, Bash 명령, MCP 도구 등)에 대해 권한을 요청합니다. 이는 안전하지만 번거롭습니다. 열 번째 승인 후에는 더 이상 제대로 검토하지 않고 그냥 클릭하게 됩니다. 이러한 중단을 줄이는 세 가지 방법이 있습니다:

* **Auto mode**: 별도의 분류기 모델이 명령을 검토하고 위험해 보이는 것만 차단합니다: 범위 확대, 알 수 없는 인프라 또는 악성 콘텐츠 기반 작업. 작업의 전반적인 방향은 신뢰하지만 모든 단계를 클릭하고 싶지 않을 때 가장 좋습니다
* **권한 허용 목록**: `npm run lint`나 `git commit` 같이 안전하다고 아는 특정 도구를 허용합니다
* **샌드박싱**: 파일 시스템과 네트워크 접근을 제한하는 OS 수준 격리를 활성화하여 정의된 경계 내에서 Claude가 더 자유롭게 작업할 수 있게 합니다

[권한 모드](/permission-modes), [권한 규칙](/permissions), [샌드박싱](/sandboxing)에 대해 자세히 알아보세요.

### CLI 도구 사용하기

::: tip
외부 서비스와 상호작용할 때 Claude Code에 `gh`, `aws`, `gcloud`, `sentry-cli` 같은 CLI 도구를 사용하도록 알려주세요.
:::

CLI 도구는 외부 서비스와 상호작용하는 가장 컨텍스트 효율적인 방법입니다. GitHub을 사용한다면 `gh` CLI를 설치하세요. Claude는 이슈 생성, 풀 리퀘스트 열기, 댓글 읽기에 이를 사용하는 방법을 알고 있습니다. `gh` 없이도 Claude는 GitHub API를 사용할 수 있지만, 인증되지 않은 요청은 종종 속도 제한에 걸립니다.

Claude는 아직 모르는 CLI 도구를 배우는 데도 효과적입니다. `Use 'foo-cli-tool --help' to learn about foo tool, then use it to solve A, B, C.`와 같은 프롬프트를 시도해 보세요.

### MCP 서버 연결하기

::: tip
`claude mcp add`를 실행하여 Notion, Figma 또는 데이터베이스 같은 외부 도구를 연결하세요.
:::

[MCP 서버](/mcp)를 사용하면 이슈 트래커에서 기능을 구현하고, 데이터베이스를 쿼리하고, 모니터링 데이터를 분석하고, Figma에서 디자인을 통합하고, 워크플로우를 자동화하도록 Claude에게 요청할 수 있습니다.

### 훅 설정하기

::: tip
예외 없이 매번 반드시 수행되어야 하는 작업에 훅을 사용하세요.
:::

[훅](/hooks-guide)은 Claude 워크플로우의 특정 시점에서 자동으로 스크립트를 실행합니다. 권고 사항인 CLAUDE.md 지침과 달리, 훅은 결정적이며 작업이 반드시 수행되는 것을 보장합니다.

Claude가 훅을 작성해 줄 수 있습니다. *"Write a hook that runs eslint after every file edit"* 또는 *"Write a hook that blocks writes to the migrations folder."* 같은 프롬프트를 시도해 보세요. `.claude/settings.json`을 직접 편집하여 훅을 수동으로 구성하고, `/hooks`를 실행하여 구성된 항목을 확인하세요.

### 스킬 생성하기

::: tip
`.claude/skills/`에 `SKILL.md` 파일을 생성하여 Claude에게 도메인 지식과 재사용 가능한 워크플로우를 제공하세요.
:::

[스킬](/skills)은 프로젝트, 팀 또는 도메인에 특화된 정보로 Claude의 지식을 확장합니다. Claude는 관련성이 있을 때 자동으로 적용하거나, `/skill-name`으로 직접 호출할 수 있습니다.

`.claude/skills/`에 `SKILL.md`가 포함된 디렉토리를 추가하여 스킬을 생성합니다:

```markdown
---
name: api-conventions
description: REST API design conventions for our services
---
# API Conventions
- Use kebab-case for URL paths
- Use camelCase for JSON properties
- Always include pagination for list endpoints
- Version APIs in the URL path (/v1/, /v2/)
```

스킬은 직접 호출하는 반복 가능한 워크플로우도 정의할 수 있습니다:

```markdown
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```

`/fix-issue 1234`로 호출합니다. 수동으로 트리거하려는 부수 효과가 있는 워크플로우에는 `disable-model-invocation: true`를 사용하세요.

### 커스텀 서브에이전트 생성하기

::: tip
`.claude/agents/`에 특수 어시스턴트를 정의하여 Claude가 격리된 작업을 위임할 수 있게 하세요.
:::

[서브에이전트](/sub-agents)는 자체 컨텍스트와 자체 허용 도구 세트로 실행됩니다. 많은 파일을 읽거나 메인 대화를 어지럽히지 않고 전문적인 집중이 필요한 작업에 유용합니다.

```markdown
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```

Claude에게 명시적으로 서브에이전트를 사용하도록 지시하세요: *"Use a subagent to review this code for security issues."*

### 플러그인 설치하기

::: tip
`/plugin`을 실행하여 마켓플레이스를 탐색하세요. 플러그인은 구성 없이 스킬, 도구, 통합을 추가합니다.
:::

[플러그인](/plugins)은 커뮤니티와 Anthropic의 스킬, 훅, 서브에이전트, MCP 서버를 하나의 설치 가능한 단위로 번들합니다. 타입이 있는 언어로 작업한다면 [코드 인텔리전스 플러그인](/discover-plugins#code-intelligence)을 설치하여 Claude에게 정확한 심볼 내비게이션과 편집 후 자동 에러 감지를 제공하세요.

스킬, 서브에이전트, 훅, MCP 중 선택하는 방법에 대한 안내는 [Claude Code 확장하기](/features-overview#match-features-to-your-goal)를 참조하세요.

***

## 효과적으로 소통하기

Claude Code와 소통하는 방식은 결과의 품질에 크게 영향을 미칩니다.

### 코드베이스에 대해 질문하기

::: tip
시니어 엔지니어에게 물어볼 것과 같은 질문을 Claude에게 하세요.
:::

새로운 코드베이스에 온보딩할 때, Claude Code를 학습과 탐색에 사용하세요. 다른 엔지니어에게 물어볼 것과 같은 종류의 질문을 Claude에게 할 수 있습니다:

* 로깅은 어떻게 작동해?
* 새 API 엔드포인트는 어떻게 만들어?
* `foo.rs`의 134번 줄에서 `async move { ... }`는 무엇을 해?
* `CustomerOnboardingFlowImpl`은 어떤 엣지 케이스를 처리해?
* 333번 줄에서 왜 `bar()` 대신 `foo()`를 호출해?

이런 방식으로 Claude Code를 사용하면 온보딩 시간을 단축하고 다른 엔지니어의 부담을 줄이는 효과적인 온보딩 워크플로우가 됩니다. 특별한 프롬프팅이 필요 없습니다: 직접 질문하세요.

### Claude에게 인터뷰를 받기

::: tip
대규모 기능의 경우 Claude에게 먼저 인터뷰하도록 하세요. 최소한의 프롬프트로 시작하고 `AskUserQuestion` 도구를 사용하여 인터뷰하도록 요청하세요.
:::

Claude는 여러분이 아직 고려하지 않았을 수 있는 기술 구현, UI/UX, 엣지 케이스, 트레이드오프에 대해 질문합니다.

```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

스펙이 완료되면 새 세션을 시작하여 실행하세요. 새 세션은 전적으로 구현에 집중된 깨끗한 컨텍스트를 가지며, 참조할 작성된 스펙이 있습니다.

***

## 세션 관리하기

대화는 지속적이고 되돌릴 수 있습니다. 이를 유리하게 활용하세요!

### 일찍 그리고 자주 방향을 수정하세요

::: tip
Claude가 잘못된 방향으로 가는 것을 발견하면 즉시 수정하세요.
:::

최상의 결과는 긴밀한 피드백 루프에서 나옵니다. Claude가 가끔 첫 시도에서 완벽하게 문제를 해결하기도 하지만, 빠르게 수정하는 것이 일반적으로 더 나은 솔루션을 더 빨리 만들어냅니다.

* **`Esc`**: `Esc` 키로 Claude를 중간에 중지합니다. 컨텍스트는 보존되므로 방향을 전환할 수 있습니다.
* **`Esc + Esc` 또는 `/rewind`**: `Esc`를 두 번 누르거나 `/rewind`를 실행하여 되감기 메뉴를 열고 이전 대화와 코드 상태를 복원하거나 선택한 메시지에서 요약합니다.
* **`"Undo that"`**: Claude에게 변경 사항을 되돌리도록 합니다.
* **`/clear`**: 관련 없는 작업 사이에 컨텍스트를 초기화합니다. 관련 없는 컨텍스트가 있는 긴 세션은 성능을 저하시킬 수 있습니다.

같은 세션에서 동일한 문제에 대해 두 번 이상 수정했다면 컨텍스트가 실패한 접근 방식으로 어수선합니다. `/clear`를 실행하고 배운 것을 반영한 더 구체적인 프롬프트로 새로 시작하세요. 더 나은 프롬프트로 시작하는 깨끗한 세션은 거의 항상 누적된 수정이 있는 긴 세션보다 성능이 좋습니다.

### 컨텍스트를 적극적으로 관리하세요

::: tip
관련 없는 작업 사이에 `/clear`를 실행하여 컨텍스트를 초기화하세요.
:::

Claude Code는 컨텍스트 제한에 접근하면 자동으로 대화 기록을 압축하여 중요한 코드와 결정을 보존하면서 공간을 확보합니다.

긴 세션 동안 Claude의 컨텍스트 윈도우는 관련 없는 대화, 파일 내용, 명령으로 채워질 수 있습니다. 이는 성능을 저하시키고 때때로 Claude를 산만하게 만들 수 있습니다.

* 작업 사이에 `/clear`를 자주 사용하여 컨텍스트 윈도우를 완전히 초기화하세요
* 자동 압축이 트리거되면 Claude가 코드 패턴, 파일 상태, 주요 결정 등 가장 중요한 것을 요약합니다
* 더 세밀한 제어를 위해 `/compact <instructions>`를 실행하세요. 예: `/compact Focus on the API changes`
* 대화의 일부만 압축하려면 `Esc + Esc` 또는 `/rewind`를 사용하고, 메시지 체크포인트를 선택한 다음 **Summarize from here**를 선택하세요. 이는 해당 지점 이후의 메시지를 요약하면서 이전 컨텍스트는 유지합니다.
* CLAUDE.md에서 `"When compacting, always preserve the full list of modified files and any test commands"`와 같은 지시사항으로 압축 동작을 커스터마이즈하여 중요한 컨텍스트가 요약에서 살아남도록 하세요
* 컨텍스트에 남길 필요가 없는 빠른 질문에는 [`/btw`](/interactive-mode#side-questions-with-btw)를 사용하세요. 답변은 닫을 수 있는 오버레이로 나타나며 대화 기록에 포함되지 않으므로 컨텍스트를 늘리지 않고 세부사항을 확인할 수 있습니다.

### 조사에 서브에이전트 사용하기

::: tip
`"use subagents to investigate X"`로 리서치를 위임하세요. 서브에이전트는 별도의 컨텍스트에서 탐색하여 메인 대화를 구현에 깨끗하게 유지합니다.
:::

컨텍스트가 근본적인 제약이므로, 서브에이전트는 사용 가능한 가장 강력한 도구 중 하나입니다. Claude가 코드베이스를 조사할 때 많은 파일을 읽으며, 이 모든 것이 컨텍스트를 소비합니다. 서브에이전트는 별도의 컨텍스트 윈도우에서 실행되고 요약을 보고합니다:

```text
Use subagents to investigate how our authentication system handles token
refresh, and whether we have any existing OAuth utilities I should reuse.
```

서브에이전트는 코드베이스를 탐색하고, 관련 파일을 읽고, 발견 사항을 보고합니다 - 모두 메인 대화를 어지럽히지 않으면서.

Claude가 구현을 완료한 후 검증에도 서브에이전트를 사용할 수 있습니다:

```text
use a subagent to review this code for edge cases
```

### 체크포인트로 되감기

::: tip
Claude가 수행하는 모든 작업은 체크포인트를 생성합니다. 어떤 이전 체크포인트로든 대화, 코드 또는 둘 다 복원할 수 있습니다.
:::

Claude는 변경 전에 자동으로 체크포인트를 생성합니다. `Escape`를 두 번 누르거나 `/rewind`를 실행하여 되감기 메뉴를 엽니다. 대화만 복원, 코드만 복원, 둘 다 복원 또는 선택한 메시지에서 요약할 수 있습니다. 자세한 내용은 [체크포인팅](/checkpointing)을 참조하세요.

모든 움직임을 신중하게 계획하는 대신 Claude에게 위험한 것을 시도해 보라고 할 수 있습니다. 작동하지 않으면 되감고 다른 접근 방식을 시도하세요. 체크포인트는 세션 간에 유지되므로 터미널을 닫아도 나중에 되감을 수 있습니다.

::: warning
체크포인트는 *Claude가 수행한* 변경만 추적하며, 외부 프로세스는 추적하지 않습니다. 이것은 git의 대체가 아닙니다.
:::

### 대화 재개하기

::: tip
`claude --continue`로 마지막 작업을 이어가거나, `--resume`으로 최근 세션 중에서 선택하세요.
:::

Claude Code는 대화를 로컬에 저장합니다. 작업이 여러 세션에 걸칠 때 컨텍스트를 다시 설명할 필요가 없습니다:

```bash
claude --continue    # 가장 최근 대화 재개
claude --resume      # 최근 대화 중에서 선택
```

`/rename`을 사용하여 세션에 `"oauth-migration"` 또는 `"debugging-memory-leak"` 같은 설명적인 이름을 지어 나중에 찾을 수 있게 하세요. 세션을 브랜치처럼 다루세요: 다른 작업 흐름은 별도의 지속적인 컨텍스트를 가질 수 있습니다.

***

## 자동화 및 확장

하나의 Claude로 효과를 보았다면, 병렬 세션, 비대화형 모드, 팬아웃 패턴으로 출력을 배가시키세요.

지금까지의 모든 내용은 한 명의 사람, 하나의 Claude, 하나의 대화를 가정합니다. 하지만 Claude Code는 수평으로 확장됩니다. 이 섹션의 기법들은 더 많은 작업을 수행하는 방법을 보여줍니다.

### 비대화형 모드 실행하기

::: tip
CI, pre-commit 훅 또는 스크립트에서 `claude -p "prompt"`를 사용하세요. 스트리밍 JSON 출력에는 `--output-format stream-json`을 추가하세요.
:::

`claude -p "your prompt"`로 세션 없이 비대화형으로 Claude를 실행할 수 있습니다. 비대화형 모드는 Claude를 CI 파이프라인, pre-commit 훅 또는 모든 자동화 워크플로우에 통합하는 방법입니다. 출력 형식을 사용하면 결과를 프로그래밍 방식으로 파싱할 수 있습니다: 일반 텍스트, JSON 또는 스트리밍 JSON.

```bash
# 일회성 쿼리
claude -p "Explain what this project does"

# 스크립트를 위한 구조화된 출력
claude -p "List all API endpoints" --output-format json

# 실시간 처리를 위한 스트리밍
claude -p "Analyze this log file" --output-format stream-json
```

### 여러 Claude 세션 실행하기

::: tip
병렬로 여러 Claude 세션을 실행하여 개발을 가속화하거나, 격리된 실험을 수행하거나, 복잡한 워크플로우를 시작하세요.
:::

병렬 세션을 실행하는 세 가지 주요 방법이 있습니다:

* [Claude Code 데스크톱 앱](/desktop#work-in-parallel-with-sessions): 여러 로컬 세션을 시각적으로 관리합니다. 각 세션은 자체 격리된 워크트리를 갖습니다.
* [웹의 Claude Code](/claude-code-on-the-web): Anthropic의 보안 클라우드 인프라에서 격리된 VM으로 실행합니다.
* [에이전트 팀](/agent-teams): 공유 작업, 메시징, 팀 리드를 통한 여러 세션의 자동 조정.

작업 병렬화 외에도 여러 세션은 품질 중심 워크플로우를 가능하게 합니다. 깨끗한 컨텍스트는 코드 리뷰를 개선합니다. Claude가 방금 작성한 코드에 편향되지 않기 때문입니다.

예를 들어, Writer/Reviewer 패턴을 사용할 수 있습니다:

| 세션 A (Writer) | 세션 B (Reviewer) |
| --- | --- |
| `Implement a rate limiter for our API endpoints` | |
| | `Review the rate limiter implementation in @src/middleware/rateLimiter.ts. Look for edge cases, race conditions, and consistency with our existing middleware patterns.` |
| `Here's the review feedback: [Session B output]. Address these issues.` | |

테스트로 비슷하게 할 수도 있습니다: 하나의 Claude가 테스트를 작성하고, 다른 Claude가 통과하는 코드를 작성합니다.

### 파일 간 팬아웃

::: tip
각 작업에 대해 `claude -p`를 호출하는 루프를 만드세요. 배치 작업의 권한 범위를 지정하려면 `--allowedTools`를 사용하세요.
:::

대규모 마이그레이션이나 분석의 경우 많은 병렬 Claude 호출에 작업을 분산할 수 있습니다:

1. **작업 목록 생성**

   Claude에게 마이그레이션이 필요한 모든 파일을 나열하도록 합니다 (예: `list all 2,000 Python files that need migrating`)

2. **목록을 순회하는 스크립트 작성**

   ```bash
   for file in $(cat files.txt); do
     claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
       --allowedTools "Edit,Bash(git commit *)"
   done
   ```

3. **몇 개 파일로 테스트한 후 규모 확대**

   처음 2-3개 파일에서 잘못되는 부분을 기반으로 프롬프트를 다듬은 다음 전체 세트에 실행합니다. `--allowedTools` 플래그는 Claude가 할 수 있는 것을 제한하며, 무인 실행 시 중요합니다.

기존 데이터/처리 파이프라인에 Claude를 통합할 수도 있습니다:

```bash
claude -p "<your prompt>" --output-format json | your_command
```

개발 중 디버깅에는 `--verbose`를 사용하고, 프로덕션에서는 끄세요.

### auto mode로 자율 실행하기

백그라운드 안전 검사와 함께 중단 없이 실행하려면 [auto mode](/permission-modes#eliminate-prompts-with-auto-mode)를 사용하세요. 분류기 모델이 명령 실행 전에 검토하여 범위 확대, 알 수 없는 인프라, 악성 콘텐츠 기반 작업을 차단하면서 일상적인 작업은 프롬프트 없이 진행되게 합니다.

```bash
claude --permission-mode auto -p "fix all lint errors"
```

`-p` 플래그를 사용한 비대화형 실행에서 auto mode는 분류기가 반복적으로 작업을 차단하면 중단됩니다. 대체할 사용자가 없기 때문입니다. 임계값에 대해서는 [auto mode 대체 시점](/permission-modes#when-auto-mode-falls-back)을 참조하세요.

***

## 일반적인 실패 패턴 피하기

다음은 일반적인 실수입니다. 일찍 인식하면 시간을 절약합니다:

* **잡탕 세션.** 하나의 작업으로 시작하여 Claude에게 관련 없는 것을 물어본 다음 첫 번째 작업으로 돌아갑니다. 컨텍스트가 관련 없는 정보로 가득합니다.
  > **해결책**: 관련 없는 작업 사이에 `/clear`를 사용합니다.
* **반복적인 수정.** Claude가 잘못하고, 수정하고, 여전히 잘못되고, 다시 수정합니다. 컨텍스트가 실패한 접근 방식으로 오염됩니다.
  > **해결책**: 두 번의 실패한 수정 후, `/clear`하고 배운 것을 반영한 더 나은 초기 프롬프트를 작성합니다.
* **과도하게 상세한 CLAUDE.md.** CLAUDE.md가 너무 길면 중요한 규칙이 노이즈에 묻혀 Claude가 절반을 무시합니다.
  > **해결책**: 가차 없이 정리합니다. Claude가 지시 없이도 이미 올바르게 수행하는 것은 삭제하거나 훅으로 전환합니다.
* **신뢰-후-검증 격차.** Claude가 엣지 케이스를 처리하지 않는 그럴듯해 보이는 구현을 생성합니다.
  > **해결책**: 항상 검증(테스트, 스크립트, 스크린샷)을 제공합니다. 검증할 수 없으면 출시하지 마세요.
* **끝없는 탐색.** 범위를 지정하지 않고 Claude에게 무언가를 "조사"하도록 요청합니다. Claude가 수백 개의 파일을 읽어 컨텍스트를 채웁니다.
  > **해결책**: 조사 범위를 좁게 지정하거나 서브에이전트를 사용하여 탐색이 메인 컨텍스트를 소비하지 않도록 합니다.

***

## 직관 개발하기

이 가이드의 패턴은 고정불변이 아닙니다. 일반적으로 잘 작동하는 시작점이지만 모든 상황에 최적은 아닐 수 있습니다.

때로는 하나의 복잡한 문제에 깊이 빠져있고 기록이 가치 있기 때문에 컨텍스트가 쌓이게 *해야* 합니다. 때로는 작업이 탐색적이기 때문에 계획을 건너뛰고 Claude가 알아서 하게 해야 합니다. 때로는 문제를 제약하기 전에 Claude가 어떻게 해석하는지 보고 싶기 때문에 모호한 프롬프트가 정확히 맞습니다.

무엇이 효과적인지 주목하세요. Claude가 훌륭한 출력을 생성할 때 무엇을 했는지 관찰하세요: 프롬프트 구조, 제공한 컨텍스트, 사용한 모드. Claude가 어려워할 때 이유를 물어보세요. 컨텍스트가 너무 시끄러웠나? 프롬프트가 너무 모호했나? 한 번의 패스로는 작업이 너무 컸나?

시간이 지남에 따라 어떤 가이드도 포착할 수 없는 직관을 개발하게 됩니다. 언제 구체적이어야 하고 언제 개방적이어야 하는지, 언제 계획하고 언제 탐색해야 하는지, 언제 컨텍스트를 정리하고 언제 쌓이게 해야 하는지 알게 됩니다.

## 관련 리소스

* [Claude Code 작동 방식](/how-claude-code-works): 에이전트 루프, 도구, 컨텍스트 관리
* [Claude Code 확장하기](/features-overview): 스킬, 훅, MCP, 서브에이전트, 플러그인
* [일반적인 워크플로우](/common-workflows): 디버깅, 테스트, PR 등의 단계별 레시피
* [CLAUDE.md](/memory): 프로젝트 규약과 지속적인 컨텍스트 저장
