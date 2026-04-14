# 일반적인 워크플로우

> 코드베이스 탐색, 버그 수정, 리팩토링, 테스트 등 Claude Code를 활용한 일상적인 작업에 대한 단계별 가이드입니다.

이 페이지에서는 일상적인 개발을 위한 실용적인 워크플로우를 다룹니다: 익숙하지 않은 코드 탐색, 디버깅, 리팩토링, 테스트 작성, PR 생성, 세션 관리 등. 각 섹션에는 자신의 프로젝트에 맞게 조정할 수 있는 예시 프롬프트가 포함되어 있습니다. 더 높은 수준의 패턴과 팁은 [모범 사례](/best-practices)를 참조하세요.

## 새로운 코드베이스 이해하기

### 코드베이스 빠르게 파악하기

새 프로젝트에 합류해서 구조를 빠르게 이해해야 하는 상황을 가정해 봅시다.

### 1단계: 프로젝트 루트 디렉토리로 이동

```bash
cd /path/to/project
```

### 2단계: Claude Code 시작

```bash
claude
```

### 3단계: 전체적인 개요 요청

```text
give me an overview of this codebase
```

### 4단계: 특정 컴포넌트 심층 탐색

```text
explain the main architecture patterns used here
```

```text
what are the key data models?
```

```text
how is authentication handled?
```

::: tip
팁:

* 넓은 질문으로 시작한 후 특정 영역으로 좁혀가세요
* 프로젝트에서 사용하는 코딩 규칙과 패턴에 대해 물어보세요
* 프로젝트별 용어 사전을 요청하세요
:::

### 관련 코드 찾기

특정 기능과 관련된 코드를 찾아야 하는 상황을 가정해 봅시다.

### 1단계: Claude에게 관련 파일 찾기 요청

```text
find the files that handle user authentication
```

### 2단계: 컴포넌트 간 상호작용 이해

```text
how do these authentication files work together?
```

### 3단계: 실행 흐름 이해

```text
trace the login process from front-end to database
```

::: tip
팁:

* 찾고 있는 것에 대해 구체적으로 설명하세요
* 프로젝트의 도메인 용어를 사용하세요
* 해당 언어에 맞는 [코드 인텔리전스 플러그인](/discover-plugins#code-intelligence)을 설치하면 Claude에게 정확한 "정의로 이동" 및 "참조 찾기" 네비게이션을 제공할 수 있습니다
:::

---

## 효율적인 버그 수정

오류 메시지가 발생하여 원인을 찾고 수정해야 하는 상황을 가정해 봅시다.

### 1단계: Claude에게 오류 공유

```text
I'm seeing an error when I run npm test
```

### 2단계: 수정 방법 추천 요청

```text
suggest a few ways to fix the @ts-ignore in user.ts
```

### 3단계: 수정 적용

```text
update user.ts to add the null check you suggested
```

::: tip
팁:

* Claude에게 문제를 재현하고 스택 트레이스를 얻는 명령어를 알려주세요
* 오류를 재현하는 단계를 언급하세요
* 오류가 간헐적인지 일관적인지 알려주세요
:::

---

## 코드 리팩토링

오래된 코드를 최신 패턴과 관행으로 업데이트해야 하는 상황을 가정해 봅시다.

### 1단계: 리팩토링 대상 레거시 코드 식별

```text
find deprecated API usage in our codebase
```

### 2단계: 리팩토링 권장 사항 확인

```text
suggest how to refactor utils.js to use modern JavaScript features
```

### 3단계: 안전하게 변경 사항 적용

```text
refactor utils.js to use ES2024 features while maintaining the same behavior
```

### 4단계: 리팩토링 검증

```text
run tests for the refactored code
```

::: tip
팁:

* Claude에게 최신 접근 방식의 이점을 설명해 달라고 요청하세요
* 필요한 경우 하위 호환성을 유지하도록 요청하세요
* 작고 테스트 가능한 단위로 리팩토링하세요
:::

---

## 특수 서브에이전트 사용

특정 작업을 더 효과적으로 처리하기 위해 특수 AI 서브에이전트를 사용하려는 상황을 가정해 봅시다.

### 1단계: 사용 가능한 서브에이전트 확인

```text
/agents
```

사용 가능한 모든 서브에이전트를 표시하고 새로 만들 수 있습니다.

### 2단계: 서브에이전트 자동 사용

Claude Code는 적절한 작업을 특수 서브에이전트에 자동으로 위임합니다:

```text
review my recent code changes for security issues
```

```text
run all tests and fix any failures
```

### 3단계: 특정 서브에이전트 명시적 요청

```text
use the code-reviewer subagent to check the auth module
```

```text
have the debugger subagent investigate why users can't log in
```

### 4단계: 워크플로우에 맞는 커스텀 서브에이전트 생성

```text
/agents
```

그런 다음 "Create New subagent"를 선택하고 프롬프트에 따라 다음을 정의합니다:

* 서브에이전트의 목적을 설명하는 고유 식별자 (예: `code-reviewer`, `api-designer`)
* Claude가 이 에이전트를 언제 사용해야 하는지
* 접근할 수 있는 도구
* 에이전트의 역할과 동작을 설명하는 시스템 프롬프트

::: tip
팁:

* 팀 공유를 위해 `.claude/agents/`에 프로젝트별 서브에이전트를 만드세요
* 자동 위임이 가능하도록 설명적인 `description` 필드를 사용하세요
* 각 서브에이전트에 실제로 필요한 도구만 접근할 수 있도록 제한하세요
* 자세한 예시는 [서브에이전트 문서](/sub-agents)를 확인하세요
:::

---

## Plan Mode로 안전한 코드 분석

Plan Mode는 Claude에게 읽기 전용 작업으로 코드베이스를 분석하여 계획을 만들도록 지시하며, 코드베이스 탐색, 복잡한 변경 계획 수립, 코드 리뷰를 안전하게 수행하는 데 적합합니다. Plan Mode에서 Claude는 [`AskUserQuestion`](/tools-reference)을 사용하여 요구사항을 수집하고 계획을 제안하기 전에 목표를 명확히 합니다.

### Plan Mode를 사용해야 하는 경우

* **다단계 구현**: 기능이 많은 파일을 편집해야 하는 경우
* **코드 탐색**: 변경하기 전에 코드베이스를 철저히 조사하고 싶은 경우
* **대화형 개발**: Claude와 방향성을 반복적으로 조율하고 싶은 경우

### Plan Mode 사용 방법

**세션 중에 Plan Mode 켜기**

세션 중에 **Shift+Tab**을 눌러 권한 모드를 순환하면서 Plan Mode로 전환할 수 있습니다.

Normal Mode에 있는 경우, **Shift+Tab**은 먼저 터미널 하단에 `⏵⏵ accept edits on`이 표시되는 Auto-Accept Mode로 전환합니다. 이어서 **Shift+Tab**을 누르면 `⏸ plan mode on`이 표시되는 Plan Mode로 전환됩니다.

**새 세션을 Plan Mode로 시작**

새 세션을 Plan Mode로 시작하려면 `--permission-mode plan` 플래그를 사용합니다:

```bash
claude --permission-mode plan
```

**Plan Mode로 "헤드리스" 쿼리 실행**

`-p`를 사용하여 Plan Mode에서 직접 쿼리를 실행할 수도 있습니다 (즉, ["헤드리스 모드"](/headless)):

```bash
claude --permission-mode plan -p "Analyze the authentication system and suggest improvements"
```

### 예시: 복잡한 리팩토링 계획

```bash
claude --permission-mode plan
```

```text
I need to refactor our authentication system to use OAuth2. Create a detailed migration plan.
```

Claude가 현재 구현을 분석하고 포괄적인 계획을 만듭니다. 후속 질문으로 다듬으세요:

```text
What about backward compatibility?
```

```text
How should we handle database migration?
```

::: tip
`Ctrl+G`를 눌러 기본 텍스트 편집기에서 계획을 열고 Claude가 진행하기 전에 직접 편집할 수 있습니다.
:::

계획을 수락하면 Claude가 계획 내용에서 자동으로 세션 이름을 지정합니다. 이름은 프롬프트 바와 세션 선택기에 표시됩니다. `--name` 또는 `/rename`으로 이미 이름을 설정한 경우, 계획 수락으로 덮어쓰지 않습니다.

### Plan Mode를 기본값으로 설정

```json
// .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

더 많은 설정 옵션은 [설정 문서](/settings#available-settings)를 참조하세요.

---

## 테스트 작업

커버되지 않는 코드에 대한 테스트를 추가해야 하는 상황을 가정해 봅시다.

### 1단계: 테스트되지 않은 코드 식별

```text
find functions in NotificationsService.swift that are not covered by tests
```

### 2단계: 테스트 스캐폴딩 생성

```text
add tests for the notification service
```

### 3단계: 의미 있는 테스트 케이스 추가

```text
add test cases for edge conditions in the notification service
```

### 4단계: 테스트 실행 및 검증

```text
run the new tests and fix any failures
```

Claude는 프로젝트의 기존 패턴과 규칙을 따르는 테스트를 생성할 수 있습니다. 테스트를 요청할 때 검증하려는 동작에 대해 구체적으로 설명하세요. Claude는 기존 테스트 파일을 검사하여 이미 사용 중인 스타일, 프레임워크, 어설션 패턴을 맞춥니다.

포괄적인 커버리지를 위해 Claude에게 놓쳤을 수 있는 엣지 케이스를 식별해 달라고 요청하세요. Claude는 코드 경로를 분석하고 간과하기 쉬운 오류 조건, 경계 값, 예상치 못한 입력에 대한 테스트를 제안할 수 있습니다.

---

## 풀 리퀘스트 생성

Claude에게 직접 요청하여 풀 리퀘스트를 만들 수 있습니다 ("create a pr for my changes"), 또는 단계별로 Claude를 안내할 수 있습니다:

### 1단계: 변경 사항 요약

```text
summarize the changes I've made to the authentication module
```

### 2단계: 풀 리퀘스트 생성

```text
create a pr
```

### 3단계: 검토 및 다듬기

```text
enhance the PR description with more context about the security improvements
```

`gh pr create`를 사용하여 PR을 만들면 세션이 자동으로 해당 PR에 연결됩니다. 나중에 `claude --from-pr <number>`로 다시 시작할 수 있습니다.

::: tip
Claude가 생성한 PR을 제출하기 전에 검토하고 Claude에게 잠재적 위험이나 고려 사항을 강조해 달라고 요청하세요.
:::

## 문서 처리

코드에 대한 문서를 추가하거나 업데이트해야 하는 상황을 가정해 봅시다.

### 1단계: 문서화되지 않은 코드 식별

```text
find functions without proper JSDoc comments in the auth module
```

### 2단계: 문서 생성

```text
add JSDoc comments to the undocumented functions in auth.js
```

### 3단계: 검토 및 개선

```text
improve the generated documentation with more context and examples
```

### 4단계: 문서 검증

```text
check if the documentation follows our project standards
```

::: tip
팁:

* 원하는 문서 스타일을 지정하세요 (JSDoc, docstrings 등)
* 문서에 예시를 포함해 달라고 요청하세요
* 공개 API, 인터페이스, 복잡한 로직에 대한 문서를 요청하세요
:::

---

## 이미지 작업

코드베이스에서 이미지를 다루며 Claude의 이미지 콘텐츠 분석 도움이 필요한 상황을 가정해 봅시다.

### 1단계: 대화에 이미지 추가

다음 방법 중 하나를 사용할 수 있습니다:

1. Claude Code 창에 이미지를 드래그 앤 드롭
2. 이미지를 복사하고 CLI에서 ctrl+v로 붙여넣기 (cmd+v를 사용하지 마세요)
3. Claude에게 이미지 경로 제공. 예: "Analyze this image: /path/to/your/image.png"

### 2단계: Claude에게 이미지 분석 요청

```text
What does this image show?
```

```text
Describe the UI elements in this screenshot
```

```text
Are there any problematic elements in this diagram?
```

### 3단계: 컨텍스트를 위해 이미지 사용

```text
Here's a screenshot of the error. What's causing it?
```

```text
This is our current database schema. How should we modify it for the new feature?
```

### 4단계: 시각적 콘텐츠에서 코드 제안 받기

```text
Generate CSS to match this design mockup
```

```text
What HTML structure would recreate this component?
```

::: tip
팁:

* 텍스트 설명이 불명확하거나 번거로울 때 이미지를 사용하세요
* 더 나은 컨텍스트를 위해 오류, UI 디자인, 다이어그램의 스크린샷을 포함하세요
* 대화에서 여러 이미지를 사용할 수 있습니다
* 이미지 분석은 다이어그램, 스크린샷, 목업 등에 사용할 수 있습니다
* Claude가 이미지를 참조할 때 (예: `[Image #1]`), `Cmd+Click` (Mac) 또는 `Ctrl+Click` (Windows/Linux)으로 링크를 클릭하면 기본 뷰어에서 이미지를 열 수 있습니다
:::

---

## 파일 및 디렉토리 참조

@를 사용하여 Claude가 파일을 읽을 때까지 기다리지 않고 빠르게 파일이나 디렉토리를 포함할 수 있습니다.

### 1단계: 단일 파일 참조

```text
Explain the logic in @src/utils/auth.js
```

대화에 파일의 전체 내용이 포함됩니다.

### 2단계: 디렉토리 참조

```text
What's the structure of @src/components?
```

파일 정보와 함께 디렉토리 목록이 제공됩니다.

### 3단계: MCP 리소스 참조

```text
Show me the data from @github:repos/owner/repo/issues
```

`@server:resource` 형식을 사용하여 연결된 MCP 서버에서 데이터를 가져옵니다. 자세한 내용은 [MCP 리소스](/mcp#use-mcp-resources)를 참조하세요.

::: tip
팁:

* 파일 경로는 상대 경로 또는 절대 경로를 사용할 수 있습니다
* @ 파일 참조는 해당 파일의 디렉토리와 상위 디렉토리에 있는 `CLAUDE.md`를 컨텍스트에 추가합니다
* 디렉토리 참조는 파일 목록을 보여주며 내용은 보여주지 않습니다
* 한 메시지에서 여러 파일을 참조할 수 있습니다 (예: "@file1.js and @file2.js")
:::

---

## 확장 사고 사용 (thinking mode)

[확장 사고](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)는 기본적으로 활성화되어 있어 Claude가 응답하기 전에 복잡한 문제를 단계별로 추론할 수 있는 공간을 제공합니다. 이 추론 과정은 verbose 모드에서 볼 수 있으며, `Ctrl+O`로 전환할 수 있습니다.

또한 Opus 4.6과 Sonnet 4.6은 적응형 추론을 지원합니다: 고정된 사고 토큰 예산 대신 모델이 [노력 수준](/model-config#adjust-effort-level) 설정에 따라 동적으로 사고를 할당합니다. 확장 사고와 적응형 추론이 함께 작동하여 Claude가 응답하기 전에 얼마나 깊이 추론할지 제어할 수 있습니다.

확장 사고는 복잡한 아키텍처 결정, 어려운 버그, 다단계 구현 계획, 다양한 접근 방식 간의 트레이드오프 평가에 특히 유용합니다.

::: info
"think", "think hard", "think more"와 같은 문구는 일반 프롬프트 지시로 해석되며 사고 토큰을 할당하지 않습니다.
:::

### 사고 모드 설정

사고는 기본적으로 활성화되어 있지만 조정하거나 비활성화할 수 있습니다.

| 범위 | 설정 방법 | 세부 사항 |
| --- | --- | --- |
| **노력 수준** | `/effort` 실행, `/model`에서 조정, 또는 [`CLAUDE_CODE_EFFORT_LEVEL`](/env-vars) 설정 | Opus 4.6 및 Sonnet 4.6의 사고 깊이를 제어합니다. [노력 수준 조정](/model-config#adjust-effort-level) 참조 |
| **`ultrathink` 키워드** | 프롬프트 어디에든 "ultrathink" 포함 | Opus 4.6 및 Sonnet 4.6에서 해당 턴의 노력을 높음으로 설정합니다. 노력 설정을 영구적으로 변경하지 않고 깊은 추론이 필요한 일회성 작업에 유용합니다 |
| **토글 단축키** | `Option+T` (macOS) 또는 `Alt+T` (Windows/Linux) | 현재 세션에서 사고를 켜거나 끕니다 (모든 모델). Option 키 단축키를 활성화하려면 [터미널 설정](/terminal-config)이 필요할 수 있습니다 |
| **전역 기본값** | `/config`를 사용하여 사고 모드 전환 | 모든 프로젝트에 걸쳐 기본값을 설정합니다 (모든 모델). `~/.claude/settings.json`에 `alwaysThinkingEnabled`로 저장됩니다 |
| **토큰 예산 제한** | [`MAX_THINKING_TOKENS`](/env-vars) 환경 변수 설정 | 사고 예산을 특정 토큰 수로 제한합니다. Opus 4.6 및 Sonnet 4.6에서는 적응형 추론이 비활성화되지 않는 한 `0`만 적용됩니다. 예: `export MAX_THINKING_TOKENS=10000` |

Claude의 사고 과정을 보려면 `Ctrl+O`를 눌러 verbose 모드를 전환하면 내부 추론이 회색 이탤릭 텍스트로 표시됩니다.

### 확장 사고 작동 방식

확장 사고는 Claude가 응답하기 전에 수행하는 내부 추론의 양을 제어합니다. 더 많은 사고는 솔루션 탐색, 엣지 케이스 분석, 실수 자기 교정을 위한 더 많은 공간을 제공합니다.

**Opus 4.6 및 Sonnet 4.6에서** 사고는 적응형 추론을 사용합니다: 모델이 선택한 [노력 수준](/model-config#adjust-effort-level)에 따라 사고 토큰을 동적으로 할당합니다. 이것이 속도와 추론 깊이 간의 트레이드오프를 조정하는 권장 방법입니다.

**이전 모델에서** 사고는 출력 할당에서 차감되는 고정 토큰 예산을 사용합니다. 예산은 모델마다 다릅니다. 모델별 상한은 [`MAX_THINKING_TOKENS`](/env-vars)를 참조하세요. 해당 환경 변수로 예산을 제한하거나 `/config` 또는 `Option+T`/`Alt+T` 토글로 사고를 완전히 비활성화할 수 있습니다.

Opus 4.6 및 Sonnet 4.6에서 [적응형 추론](/model-config#adjust-effort-level)이 사고 깊이를 제어하므로, `MAX_THINKING_TOKENS`는 `0`으로 설정하여 사고를 비활성화하거나 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`이 이 모델들을 고정 예산으로 되돌릴 때만 적용됩니다. [환경 변수](/env-vars)를 참조하세요.

::: warning
사고 요약이 수정되어도 사용된 모든 사고 토큰에 대해 비용이 청구됩니다. 대화형 모드에서 사고는 기본적으로 접힌 스텁으로 표시됩니다. 전체 요약을 표시하려면 `settings.json`에서 `showThinkingSummaries: true`를 설정하세요.
:::

---

## 이전 대화 재개

Claude Code를 시작할 때 이전 세션을 재개할 수 있습니다:

* `claude --continue`는 현재 디렉토리에서 가장 최근 대화를 계속합니다
* `claude --resume`은 대화 선택기를 열거나 이름으로 재개합니다
* `claude --from-pr 123`은 특정 풀 리퀘스트에 연결된 세션을 재개합니다

활성 세션 내에서 `/resume`을 사용하여 다른 대화로 전환할 수 있습니다.

세션은 프로젝트 디렉토리별로 저장됩니다. `/resume` 선택기는 동일한 git 저장소의 대화형 세션을 표시하며, worktree도 포함합니다. 같은 저장소의 다른 worktree에서 세션을 선택하면 Claude Code가 디렉토리를 먼저 전환할 필요 없이 직접 재개합니다. `claude -p` 또는 SDK 호출로 생성된 세션은 선택기에 표시되지 않지만, 세션 ID나 커스텀 이름을 `claude --resume <session-id-or-name>`에 전달하여 재개할 수 있습니다. `--name` 또는 `/rename`으로 설정한 커스텀 이름도 세션 ID와 함께 사용할 수 있습니다.

### 세션 이름 지정

나중에 찾을 수 있도록 세션에 설명적인 이름을 지정하세요. 여러 작업이나 기능을 작업할 때 권장되는 사례입니다.

### 1단계: 세션 이름 지정

시작 시 `-n`으로 세션 이름을 지정합니다:

```bash
claude -n auth-refactor
```

또는 세션 중에 `/rename`을 사용하면 프롬프트 바에도 이름이 표시됩니다:

```text
/rename auth-refactor
```

선택기에서 세션 이름을 변경할 수도 있습니다: `/resume`을 실행하고 세션으로 이동한 후 `R`을 누르세요.

### 2단계: 나중에 이름으로 재개

명령줄에서:

```bash
claude --resume auth-refactor
```

또는 활성 세션 내에서:

```text
/resume auth-refactor
```

### 세션 선택기 사용

`/resume` 명령 (또는 인수 없이 `claude --resume`)은 다음 기능을 갖춘 대화형 세션 선택기를 엽니다:

**선택기에서의 키보드 단축키:**

| 단축키 | 동작 |
| :--- | :--- |
| `↑` / `↓` | 세션 간 탐색 |
| `→` / `←` | 그룹화된 세션 펼치기 또는 접기 |
| `Enter` | 강조된 세션 선택 및 재개 |
| `P` | 세션 내용 미리보기 |
| `R` | 강조된 세션 이름 변경 |
| `/` | 세션 필터링 검색 |
| `A` | 현재 디렉토리와 모든 프로젝트 간 전환 |
| `B` | 현재 git 브랜치의 세션만 필터링 |
| `Esc` | 선택기 또는 검색 모드 종료 |

**세션 구성:**

선택기는 유용한 메타데이터와 함께 세션을 표시합니다:

* 세션 이름 또는 초기 프롬프트
* 마지막 활동 이후 경과 시간
* 메시지 수
* Git 브랜치 (해당되는 경우)

포크된 세션 (`/branch`, `/rewind`, 또는 `--fork-session`으로 생성)은 루트 세션 아래에 그룹화되어 관련 대화를 쉽게 찾을 수 있습니다.

::: tip
팁:

* **세션 이름을 일찍 지정하세요**: 별도의 작업을 시작할 때 `/rename`을 사용하세요: 나중에 "explain this function"보다 "payment-integration"을 찾는 것이 훨씬 쉽습니다
* 현재 디렉토리의 가장 최근 대화에 빠르게 접근하려면 `--continue`를 사용하세요
* 어떤 세션이 필요한지 알 때는 `--resume session-name`을 사용하세요
* 탐색하고 선택해야 할 때는 `--resume` (이름 없이)을 사용하세요
* 스크립트에서는 `claude --continue --print "prompt"`를 사용하여 비대화형 모드로 재개하세요
* 선택기에서 `P`를 눌러 세션을 재개하기 전에 미리볼 수 있습니다
* 재개된 대화는 원래와 동일한 모델 및 설정으로 시작됩니다

작동 방식:

1. **대화 저장**: 모든 대화는 전체 메시지 기록과 함께 자동으로 로컬에 저장됩니다
2. **메시지 역직렬화**: 재개 시 컨텍스트를 유지하기 위해 전체 메시지 기록이 복원됩니다
3. **도구 상태**: 이전 대화의 도구 사용 및 결과가 보존됩니다
4. **컨텍스트 복원**: 이전의 모든 컨텍스트가 그대로 유지된 채 대화가 재개됩니다
:::

---

## Git Worktree로 병렬 Claude Code 세션 실행

여러 작업을 동시에 수행할 때 각 Claude 세션이 변경 사항이 충돌하지 않도록 자체 코드베이스 사본을 가져야 합니다. Git worktree는 동일한 저장소 기록과 원격 연결을 공유하면서 각각 자체 파일과 브랜치를 가진 별도의 작업 디렉토리를 생성하여 이 문제를 해결합니다. 이는 한 worktree에서 Claude가 기능을 작업하는 동안 다른 worktree에서 버그를 수정할 수 있으며, 두 세션이 서로 간섭하지 않는다는 것을 의미합니다.

`--worktree` (`-w`) 플래그를 사용하여 격리된 worktree를 만들고 그 안에서 Claude를 시작합니다. 전달하는 값은 worktree 디렉토리 이름과 브랜치 이름이 됩니다:

```bash
# "feature-auth"라는 이름의 worktree에서 Claude 시작
# 새 브랜치와 함께 .claude/worktrees/feature-auth/ 생성
claude --worktree feature-auth

# 별도의 worktree에서 다른 세션 시작
claude --worktree bugfix-123
```

이름을 생략하면 Claude가 자동으로 임의의 이름을 생성합니다:

```bash
# "bright-running-fox" 같은 이름을 자동 생성
claude --worktree
```

Worktree는 `<repo>/.claude/worktrees/<name>`에 생성되며 기본 원격 브랜치, 즉 `origin/HEAD`가 가리키는 곳에서 분기합니다. worktree 브랜치 이름은 `worktree-<name>`입니다.

기본 브랜치는 Claude Code 플래그나 설정으로 구성할 수 없습니다. `origin/HEAD`는 클론할 때 Git이 한 번 설정한 로컬 `.git` 디렉토리에 저장된 참조입니다. 나중에 GitHub이나 GitLab에서 저장소의 기본 브랜치가 변경되면 로컬 `origin/HEAD`는 이전 브랜치를 계속 가리키며, worktree는 거기서 분기합니다. 원격이 현재 기본으로 간주하는 것과 로컬 참조를 다시 동기화하려면:

```bash
git remote set-head origin -a
```

이것은 로컬 `.git` 디렉토리만 업데이트하는 표준 Git 명령입니다. 원격 서버에는 아무것도 변경되지 않습니다. 원격의 기본 대신 특정 브랜치에서 worktree를 기반으로 하려면 `git remote set-head origin your-branch-name`으로 명시적으로 설정하세요.

worktree 생성 방법에 대한 완전한 제어를 위해, 호출당 다른 기반을 선택하는 것을 포함하여 [WorktreeCreate 훅](/hooks#worktreecreate)을 구성하세요. 이 훅은 Claude Code의 기본 `git worktree` 로직을 완전히 대체하므로 필요한 참조에서 fetch하고 분기할 수 있습니다.

세션 중에 Claude에게 "work in a worktree" 또는 "start a worktree"라고 요청하면 자동으로 생성합니다.

### 서브에이전트 worktree

서브에이전트도 충돌 없이 병렬로 작업하기 위해 worktree 격리를 사용할 수 있습니다. Claude에게 "use worktrees for your agents"라고 요청하거나 에이전트의 프론트매터에 `isolation: worktree`를 추가하여 [커스텀 서브에이전트](/sub-agents#supported-frontmatter-fields)에서 설정하세요. 각 서브에이전트는 자체 worktree를 가지며 변경 사항 없이 완료되면 자동으로 정리됩니다.

### Worktree 정리

worktree 세션을 종료하면 Claude가 변경 사항 여부에 따라 정리를 처리합니다:

* **변경 사항 없음**: worktree와 브랜치가 자동으로 제거됩니다
* **변경 사항이나 커밋이 있음**: Claude가 worktree를 유지할지 제거할지 묻습니다. 유지하면 나중에 돌아올 수 있도록 디렉토리와 브랜치가 보존됩니다. 제거하면 worktree 디렉토리와 브랜치가 삭제되어 커밋되지 않은 모든 변경 사항과 커밋이 폐기됩니다

크래시나 중단된 병렬 실행으로 인해 고아가 된 서브에이전트 worktree는 커밋되지 않은 변경 사항, 추적되지 않는 파일, 푸시되지 않은 커밋이 없는 경우 [`cleanupPeriodDays`](/settings#available-settings) 설정보다 오래되면 시작 시 자동으로 제거됩니다. `--worktree`로 생성한 worktree는 이 정리에 의해 제거되지 않습니다.

Claude 세션 외부에서 worktree를 정리하려면 [수동 worktree 관리](#worktree-수동-관리)를 사용하세요.

::: tip
worktree 내용이 기본 저장소에서 추적되지 않는 파일로 나타나지 않도록 `.gitignore`에 `.claude/worktrees/`를 추가하세요.
:::

### gitignore된 파일을 worktree에 복사

Git worktree는 새로운 체크아웃이므로 기본 저장소의 `.env`나 `.env.local` 같은 추적되지 않는 파일이 포함되지 않습니다. Claude가 worktree를 생성할 때 이러한 파일을 자동으로 복사하려면 프로젝트 루트에 `.worktreeinclude` 파일을 추가하세요.

이 파일은 `.gitignore` 구문을 사용하여 복사할 파일을 나열합니다. 패턴과 일치하면서 gitignore된 파일만 복사되므로 추적되는 파일은 절대 중복되지 않습니다.

```text
.env
.env.local
config/secrets.json
```

이는 `--worktree`로 생성한 worktree, 서브에이전트 worktree, [데스크톱 앱](/desktop#work-in-parallel-with-sessions)의 병렬 세션에 적용됩니다.

### Worktree 수동 관리

worktree 위치와 브랜치 설정을 더 세밀하게 제어하려면 Git으로 직접 worktree를 만드세요. 특정 기존 브랜치를 체크아웃하거나 저장소 외부에 worktree를 배치해야 할 때 유용합니다.

```bash
# 새 브랜치로 worktree 생성
git worktree add ../project-feature-a -b feature-a

# 기존 브랜치로 worktree 생성
git worktree add ../project-bugfix bugfix-123

# worktree에서 Claude 시작
cd ../project-feature-a && claude

# 완료 후 정리
git worktree list
git worktree remove ../project-feature-a
```

자세한 내용은 [공식 Git worktree 문서](https://git-scm.com/docs/git-worktree)를 참조하세요.

::: tip
각 새 worktree에서 프로젝트 설정에 따라 개발 환경을 초기화하는 것을 잊지 마세요. 스택에 따라 의존성 설치 (`npm install`, `yarn`), 가상 환경 설정, 또는 프로젝트의 표준 설정 프로세스를 따르는 것이 포함될 수 있습니다.
:::

### Git이 아닌 버전 관리

Worktree 격리는 기본적으로 git과 함께 작동합니다. SVN, Perforce, Mercurial 같은 다른 버전 관리 시스템의 경우 [WorktreeCreate 및 WorktreeRemove 훅](/hooks#worktreecreate)을 구성하여 커스텀 worktree 생성 및 정리 로직을 제공하세요. 구성되면 이러한 훅은 `--worktree` 사용 시 기본 git 동작을 대체하므로 [`.worktreeinclude`](#gitignore된-파일을-worktree에-복사)는 처리되지 않습니다. 훅 스크립트 내에서 로컬 설정 파일을 대신 복사하세요.

공유 작업과 메시징을 통한 병렬 세션의 자동화된 조율은 [에이전트 팀](/agent-teams)을 참조하세요.

---

## Claude의 주의가 필요할 때 알림 받기

장시간 실행되는 작업을 시작하고 다른 창으로 전환할 때, Claude가 완료하거나 입력이 필요할 때 알 수 있도록 데스크톱 알림을 설정할 수 있습니다. 이는 `Notification` [훅 이벤트](/hooks-guide#get-notified-when-claude-needs-input)를 사용하며, Claude가 권한 대기, 유휴 상태에서 새 프롬프트 대기, 인증 완료 시 발생합니다.

### 1단계: 설정에 훅 추가

`~/.claude/settings.json`을 열고 플랫폼의 기본 알림 명령을 호출하는 `Notification` 훅을 추가합니다:

#### macOS

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

#### Linux

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
          }
        ]
      }
    ]
  }
}
```

#### Windows

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

설정 파일에 이미 `hooks` 키가 있으면 덮어쓰지 않고 `Notification` 항목을 병합하세요. CLI에서 원하는 것을 설명하여 Claude에게 훅을 작성하도록 요청할 수도 있습니다.

### 2단계: 선택적으로 매처 범위 좁히기

기본적으로 훅은 모든 알림 유형에서 발생합니다. 특정 이벤트에서만 발생하도록 하려면 `matcher` 필드를 다음 값 중 하나로 설정하세요:

| 매처 | 발생 시점 |
| :--- | :--- |
| `permission_prompt` | Claude가 도구 사용 승인이 필요할 때 |
| `idle_prompt` | Claude가 완료되어 다음 프롬프트를 기다릴 때 |
| `auth_success` | 인증이 완료될 때 |
| `elicitation_dialog` | Claude가 질문을 할 때 |

### 3단계: 훅 확인

`/hooks`를 입력하고 `Notification`을 선택하여 훅이 나타나는지 확인합니다. 선택하면 실행될 명령이 표시됩니다. 종단 간 테스트를 하려면 Claude에게 권한이 필요한 명령을 실행하도록 요청하고 터미널에서 벗어나거나, Claude에게 직접 알림을 트리거하도록 요청하세요.

전체 이벤트 스키마와 알림 유형은 [Notification 참조](/hooks#notification)를 확인하세요.

---

## Claude를 Unix 스타일 유틸리티로 사용

### 검증 프로세스에 Claude 추가

Claude Code를 린터나 코드 리뷰어로 사용하려는 상황을 가정해 봅시다.

**빌드 스크립트에 Claude 추가:**

```json
// package.json
{
    ...
    "scripts": {
        ...
        "lint:claude": "claude -p 'you are a linter. please look at the changes vs. main and report any issues related to typos. report the filename and line number on one line, and a description of the issue on the second line. do not return any other text.'"
    }
}
```

::: tip
팁:

* CI/CD 파이프라인에서 자동화된 코드 리뷰에 Claude를 사용하세요
* 프로젝트에 관련된 특정 이슈를 확인하도록 프롬프트를 커스터마이즈하세요
* 다양한 유형의 검증을 위해 여러 스크립트를 만드는 것을 고려하세요
:::

### 파이프 입력, 파이프 출력

데이터를 Claude에 파이프로 전달하고 구조화된 형식으로 데이터를 돌려받으려는 상황을 가정해 봅시다.

**Claude를 통해 데이터 파이프:**

```bash
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

::: tip
팁:

* 기존 쉘 스크립트에 Claude를 통합하기 위해 파이프를 사용하세요
* 강력한 워크플로우를 위해 다른 Unix 도구와 결합하세요
* 구조화된 출력을 위해 `--output-format` 사용을 고려하세요
:::

### 출력 형식 제어

스크립트나 다른 도구에 Claude Code를 통합할 때 특정 형식의 출력이 필요한 상황을 가정해 봅시다.

### 1단계: 텍스트 형식 사용 (기본값)

```bash
cat data.txt | claude -p 'summarize this data' --output-format text > summary.txt
```

Claude의 일반 텍스트 응답만 출력합니다 (기본 동작).

### 2단계: JSON 형식 사용

```bash
cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json
```

비용과 지속 시간을 포함한 메타데이터가 있는 메시지의 JSON 배열을 출력합니다.

### 3단계: 스트리밍 JSON 형식 사용

```bash
cat log.txt | claude -p 'parse this log file for errors' --output-format stream-json
```

Claude가 요청을 처리하는 동안 실시간으로 일련의 JSON 객체를 출력합니다. 각 메시지는 유효한 JSON 객체이지만 연결하면 전체 출력은 유효한 JSON이 아닙니다.

::: tip
팁:

* Claude의 응답만 필요한 간단한 통합에는 `--output-format text`를 사용하세요
* 전체 대화 로그가 필요할 때는 `--output-format json`을 사용하세요
* 각 대화 턴의 실시간 출력이 필요할 때는 `--output-format stream-json`을 사용하세요
:::

---

## 스케줄에 따라 Claude 실행

매일 아침 열린 PR 검토, 주간 의존성 감사, 야간 CI 실패 확인 등 Claude가 정기적으로 작업을 자동 처리하도록 하려는 상황을 가정해 봅시다.

작업을 실행할 위치에 따라 스케줄링 옵션을 선택하세요:

| 옵션 | 실행 위치 | 적합한 용도 |
| :--- | :--- | :--- |
| [클라우드 예약 작업](/web-scheduled-tasks) | Anthropic 관리 인프라 | 컴퓨터가 꺼져 있어도 실행되어야 하는 작업. [claude.ai/code](https://claude.ai/code)에서 설정합니다. |
| [데스크톱 예약 작업](/desktop-scheduled-tasks) | 데스크톱 앱을 통한 사용자 머신 | 로컬 파일, 도구, 또는 커밋되지 않은 변경 사항에 직접 접근해야 하는 작업. |
| [GitHub Actions](/github-actions) | CI 파이프라인 | 열린 PR 같은 저장소 이벤트에 연결되거나, 워크플로우 설정과 함께 있어야 하는 cron 스케줄. |
| [`/loop`](/scheduled-tasks) | 현재 CLI 세션 | 세션이 열려 있는 동안 빠른 폴링. 종료 시 작업이 취소됩니다. |

::: tip
예약 작업의 프롬프트를 작성할 때 성공의 모습과 결과를 어떻게 처리할지 명확하게 작성하세요. 작업이 자율적으로 실행되므로 명확한 질문을 할 수 없습니다. 예: "Review open PRs labeled `needs-review`, leave inline comments on any issues, and post a summary in the `#eng-reviews` Slack channel."
:::

---

## Claude에게 기능에 대해 질문하기

Claude는 자체 문서에 대한 내장 접근 권한이 있으며 자체 기능과 제한 사항에 대한 질문에 답할 수 있습니다.

### 예시 질문

```text
can Claude Code create pull requests?
```

```text
how does Claude Code handle permissions?
```

```text
what skills are available?
```

```text
how do I use MCP with Claude Code?
```

```text
how do I configure Claude Code for Amazon Bedrock?
```

```text
what are the limitations of Claude Code?
```

::: info
Claude는 이러한 질문에 문서 기반 답변을 제공합니다. 실습 데모를 보려면 `/powerup`을 실행하여 애니메이션 데모가 포함된 대화형 레슨을 확인하거나, 위의 특정 워크플로우 섹션을 참조하세요.
:::

::: tip
팁:

* Claude는 사용 중인 버전에 관계없이 항상 최신 Claude Code 문서에 접근할 수 있습니다
* 구체적인 질문을 하면 상세한 답변을 얻을 수 있습니다
* Claude는 MCP 통합, 엔터프라이즈 설정, 고급 워크플로우 같은 복잡한 기능을 설명할 수 있습니다
:::

---

## 다음 단계

- [모범 사례](/best-practices) - Claude Code를 최대한 활용하기 위한 패턴
- [Claude Code 작동 방식](/how-claude-code-works) - 에이전틱 루프와 컨텍스트 관리 이해
- [Claude Code 확장](/features-overview) - 스킬, 훅, MCP, 서브에이전트, 플러그인 추가
- [참조 구현](https://github.com/anthropics/claude-code/tree/main/.devcontainer) - 개발 컨테이너 참조 구현 클론
