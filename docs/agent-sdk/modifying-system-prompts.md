---
title: 시스템 프롬프트 수정
description: output styles, systemPrompt append, 커스텀 시스템 프롬프트 등 세 가지 방법으로 Claude의 동작을 커스터마이징하는 방법을 알아봅니다.
---

# 시스템 프롬프트 수정

> output styles, systemPrompt with append, 커스텀 시스템 프롬프트 등 세 가지 방법으로 Claude의 동작을 커스터마이징하는 방법을 알아봅니다.

시스템 프롬프트는 Claude의 동작 방식, 기능, 응답 스타일을 정의합니다. Claude Agent SDK는 시스템 프롬프트를 커스터마이징하는 세 가지 방법을 제공합니다: output styles(지속적이고 파일 기반의 설정), Claude Code 프롬프트에 추가하는 방식, 완전한 커스텀 프롬프트 사용.

## 시스템 프롬프트 이해하기

시스템 프롬프트는 대화 전반에 걸쳐 Claude의 동작 방식을 형성하는 초기 지침 집합입니다.

::: info
**기본 동작:** Agent SDK는 기본적으로 **최소한의 시스템 프롬프트**를 사용합니다. 이 프롬프트에는 필수적인 도구 지침만 포함되어 있으며, Claude Code의 코딩 가이드라인, 응답 스타일, 프로젝트 컨텍스트는 포함되지 않습니다. Claude Code 전체 시스템 프롬프트를 포함하려면, TypeScript에서는 `systemPrompt: { type: "preset", preset: "claude_code" }`, Python에서는 `system_prompt={"type": "preset", "preset": "claude_code"}`로 지정하세요.
:::

Claude Code의 시스템 프롬프트에는 다음이 포함됩니다:

* 도구 사용 지침 및 사용 가능한 도구
* 코드 스타일 및 포맷 가이드라인
* 응답 톤 및 상세도 설정
* 보안 및 안전 지침
* 현재 작업 디렉터리 및 환경 컨텍스트

## 수정 방법

### 방법 1: CLAUDE.md 파일 (프로젝트 수준 지침)

CLAUDE.md 파일은 프로젝트별 컨텍스트와 지침을 제공하며, Agent SDK가 특정 디렉터리에서 실행될 때 자동으로 읽힙니다. 프로젝트의 지속적인 "메모리" 역할을 합니다.

#### SDK에서 CLAUDE.md가 동작하는 방식

**위치 및 탐색:**

* **프로젝트 수준:** 작업 디렉터리의 `CLAUDE.md` 또는 `.claude/CLAUDE.md`
* **사용자 수준:** 모든 프로젝트에 적용되는 전역 지침은 `~/.claude/CLAUDE.md`

**중요:** SDK는 TypeScript에서 `settingSources`, Python에서 `setting_sources`를 명시적으로 설정했을 때만 CLAUDE.md 파일을 읽습니다:

* 프로젝트 수준 CLAUDE.md를 불러오려면 `'project'`를 포함하세요.
* 사용자 수준 CLAUDE.md(`~/.claude/CLAUDE.md`)를 불러오려면 `'user'`를 포함하세요.

`claude_code` 시스템 프롬프트 preset은 CLAUDE.md를 자동으로 로드하지 않습니다 — setting sources도 함께 지정해야 합니다.

**콘텐츠 형식:**
CLAUDE.md 파일은 일반 마크다운을 사용하며 다음 내용을 담을 수 있습니다:

* 코딩 가이드라인 및 표준
* 프로젝트별 컨텍스트
* 자주 쓰는 명령어 또는 워크플로
* API 컨벤션
* 테스트 요구사항

#### CLAUDE.md 예시

```markdown  theme={null}
# Project Guidelines

## Code Style

- Use TypeScript strict mode
- Prefer functional components in React
- Always include JSDoc comments for public APIs

## Testing

- Run `npm test` before committing
- Maintain >80% code coverage
- Use jest for unit tests, playwright for E2E

## Commands

- Build: `npm run build`
- Dev server: `npm run dev`
- Type check: `npm run typecheck`
```

#### SDK에서 CLAUDE.md 사용하기

::: code-group
```typescript TypeScript theme={null}
import { query } from "@anthropic-ai/claude-agent-sdk";

// 중요: CLAUDE.md를 로드하려면 settingSources를 지정해야 합니다.
// claude_code preset만으로는 CLAUDE.md 파일을 로드하지 않습니다.
const messages = [];

for await (const message of query({
  prompt: "Add a new React component for user profiles",
  options: {
    systemPrompt: {
      type: "preset",
      preset: "claude_code" // Claude Code의 시스템 프롬프트 사용
    },
    settingSources: ["project"] // 프로젝트의 CLAUDE.md를 로드하려면 필수
  }
})) {
  messages.push(message);
}

// 이제 Claude는 CLAUDE.md의 프로젝트 가이드라인에 접근할 수 있습니다.
```

```python Python theme={null}
from claude_agent_sdk import query, ClaudeAgentOptions

# 중요: CLAUDE.md를 로드하려면 setting_sources를 지정해야 합니다.
# claude_code preset만으로는 CLAUDE.md 파일을 로드하지 않습니다.
messages = []

async for message in query(
    prompt="Add a new React component for user profiles",
    options=ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",  # Claude Code의 시스템 프롬프트 사용
        },
        setting_sources=["project"],  # 프로젝트의 CLAUDE.md를 로드하려면 필수
    ),
):
    messages.append(message)

# 이제 Claude는 CLAUDE.md의 프로젝트 가이드라인에 접근할 수 있습니다.
```
:::

#### CLAUDE.md를 사용해야 할 때

**적합한 경우:**

* **팀 공유 컨텍스트** - 모두가 따라야 할 가이드라인
* **프로젝트 컨벤션** - 코딩 표준, 파일 구조, 네이밍 패턴
* **자주 쓰는 명령어** - 프로젝트별 빌드, 테스트, 배포 명령어
* **장기 메모리** - 모든 세션에 걸쳐 유지되어야 할 컨텍스트
* **버전 관리되는 지침** - git에 커밋하여 팀 전체가 동기화 유지

**주요 특징:**

* ✅ 프로젝트 내 모든 세션에서 지속됨
* ✅ git을 통해 팀과 공유 가능
* ✅ 자동 탐색 (코드 변경 불필요)
* ⚠️ `settingSources`를 통한 설정 로드 필요

### 방법 2: Output styles (지속적인 설정)

Output styles는 Claude의 시스템 프롬프트를 수정하는 저장된 설정입니다. 마크다운 파일로 저장되어 세션과 프로젝트 전반에 걸쳐 재사용할 수 있습니다.

#### output style 만들기

::: code-group
```typescript TypeScript theme={null}
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

async function createOutputStyle(name: string, description: string, prompt: string) {
  // 사용자 수준: ~/.claude/output-styles
  // 프로젝트 수준: .claude/output-styles
  const outputStylesDir = join(homedir(), ".claude", "output-styles");

  await mkdir(outputStylesDir, { recursive: true });

  const content = `---
name: ${name}
description: ${description}
---

${prompt}`;

  const filePath = join(outputStylesDir, `${name.toLowerCase().replace(/\s+/g, "-")}.md`);
  await writeFile(filePath, content, "utf-8");
}

// 예시: 코드 리뷰 전문가 생성
await createOutputStyle(
  "Code Reviewer",
  "Thorough code review assistant",
  `You are an expert code reviewer.

For every code submission:
1. Check for bugs and security issues
2. Evaluate performance
3. Suggest improvements
4. Rate code quality (1-10)`
);
```

```python Python theme={null}
from pathlib import Path


async def create_output_style(name: str, description: str, prompt: str):
    # 사용자 수준: ~/.claude/output-styles
    # 프로젝트 수준: .claude/output-styles
    output_styles_dir = Path.home() / ".claude" / "output-styles"

    output_styles_dir.mkdir(parents=True, exist_ok=True)

    content = f"""---
name: {name}
description: {description}
---

{prompt}"""

    file_name = name.lower().replace(" ", "-") + ".md"
    file_path = output_styles_dir / file_name
    file_path.write_text(content, encoding="utf-8")


# 예시: 코드 리뷰 전문가 생성
await create_output_style(
    "Code Reviewer",
    "Thorough code review assistant",
    """You are an expert code reviewer.

For every code submission:
1. Check for bugs and security issues
2. Evaluate performance
3. Suggest improvements
4. Rate code quality (1-10)""",
)
```
:::

#### output styles 사용하기

생성 후, 다음 방법으로 output styles를 활성화하세요:

* **CLI**: `/output-style [style-name]`
* **설정**: `.claude/settings.local.json`
* **새로 만들기**: `/output-style:new [description]`

**SDK 사용자 참고:** Output styles는 옵션에서 TypeScript의 경우 `settingSources: ['user']` 또는 `settingSources: ['project']`, Python의 경우 `setting_sources=["user"]` 또는 `setting_sources=["project"]`를 포함할 때 로드됩니다.

### 방법 3: append를 활용한 `systemPrompt` 사용

Claude Code preset에 `append` 속성을 함께 사용하면, 기본 제공 기능을 모두 유지하면서 커스텀 지침을 추가할 수 있습니다.

::: code-group
```typescript TypeScript theme={null}
import { query } from "@anthropic-ai/claude-agent-sdk";

const messages = [];

for await (const message of query({
  prompt: "Help me write a Python function to calculate fibonacci numbers",
  options: {
    systemPrompt: {
      type: "preset",
      preset: "claude_code",
      append: "Always include detailed docstrings and type hints in Python code."
    }
  }
})) {
  messages.push(message);
  if (message.type === "assistant") {
    console.log(message.message.content);
  }
}
```

```python Python theme={null}
from claude_agent_sdk import query, ClaudeAgentOptions

messages = []

async for message in query(
    prompt="Help me write a Python function to calculate fibonacci numbers",
    options=ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",
            "append": "Always include detailed docstrings and type hints in Python code.",
        }
    ),
):
    messages.append(message)
    if message.type == "assistant":
        print(message.message.content)
```
:::

### 방법 4: 커스텀 시스템 프롬프트

`systemPrompt`에 커스텀 문자열을 제공하여 기본 프롬프트 전체를 자신만의 지침으로 교체할 수 있습니다.

::: code-group
```typescript TypeScript theme={null}
import { query } from "@anthropic-ai/claude-agent-sdk";

const customPrompt = `You are a Python coding specialist.
Follow these guidelines:
- Write clean, well-documented code
- Use type hints for all functions
- Include comprehensive docstrings
- Prefer functional programming patterns when appropriate
- Always explain your code choices`;

const messages = [];

for await (const message of query({
  prompt: "Create a data processing pipeline",
  options: {
    systemPrompt: customPrompt
  }
})) {
  messages.push(message);
  if (message.type === "assistant") {
    console.log(message.message.content);
  }
}
```

```python Python theme={null}
from claude_agent_sdk import query, ClaudeAgentOptions

custom_prompt = """You are a Python coding specialist.
Follow these guidelines:
- Write clean, well-documented code
- Use type hints for all functions
- Include comprehensive docstrings
- Prefer functional programming patterns when appropriate
- Always explain your code choices"""

messages = []

async for message in query(
    prompt="Create a data processing pipeline",
    options=ClaudeAgentOptions(system_prompt=custom_prompt),
):
    messages.append(message)
    if message.type == "assistant":
        print(message.message.content)
```
:::

## 네 가지 방법 비교

| 기능                    | CLAUDE.md        | Output Styles   | append 활용 `systemPrompt` | 커스텀 `systemPrompt`  |
| ----------------------- | ---------------- | --------------- | -------------------------- | ---------------------- |
| **지속성**              | 프로젝트별 파일  | 파일로 저장     | 세션 한정                  | 세션 한정              |
| **재사용성**            | 프로젝트별       | 프로젝트 간     | 코드 중복 필요             | 코드 중복 필요         |
| **관리 방식**           | 파일 시스템      | CLI + 파일      | 코드 내                    | 코드 내                |
| **기본 도구**           | 유지됨           | 유지됨          | 유지됨                     | 미포함 시 손실됨       |
| **기본 안전 기능**      | 유지됨           | 유지됨          | 유지됨                     | 직접 추가 필요         |
| **환경 컨텍스트**       | 자동             | 자동            | 자동                       | 직접 제공 필요         |
| **커스터마이징 수준**   | 추가만 가능      | 기본값 교체     | 추가만 가능                | 완전한 제어            |
| **버전 관리**           | 프로젝트와 함께  | 가능            | 코드와 함께                | 코드와 함께            |
| **범위**                | 프로젝트 한정    | 사용자 또는 프로젝트 | 코드 세션              | 코드 세션              |

**참고:** "append 활용"은 TypeScript에서 `systemPrompt: { type: "preset", preset: "claude_code", append: "..." }`, Python에서 `system_prompt={"type": "preset", "preset": "claude_code", "append": "..."}`를 사용하는 것을 의미합니다.

## 활용 사례 및 모범 사례

### CLAUDE.md를 사용해야 할 때

**적합한 경우:**

* 프로젝트별 코딩 표준 및 컨벤션
* 프로젝트 구조 및 아키텍처 문서화
* 자주 쓰는 명령어 목록 (빌드, 테스트, 배포)
* 버전 관리되어야 할 팀 공유 컨텍스트
* 프로젝트 내 모든 SDK 사용에 적용되어야 할 지침

**예시:**

* "모든 API 엔드포인트는 async/await 패턴을 사용해야 합니다"
* "커밋 전 `npm run lint:fix`를 실행하세요"
* "데이터베이스 마이그레이션은 `migrations/` 디렉터리에 있습니다"

**중요:** CLAUDE.md 파일을 로드하려면 TypeScript에서 `settingSources: ['project']`, Python에서 `setting_sources=["project"]`를 명시적으로 설정해야 합니다. `claude_code` 시스템 프롬프트 preset은 이 설정 없이는 자동으로 CLAUDE.md를 로드하지 않습니다.

### output styles를 사용해야 할 때

**적합한 경우:**

* 세션 간 지속적인 동작 변경
* 팀 공유 설정
* 전문화된 어시스턴트 (코드 리뷰어, 데이터 사이언티스트, DevOps)
* 버전 관리가 필요한 복잡한 프롬프트 수정

**예시:**

* 전용 SQL 최적화 어시스턴트 만들기
* 보안 중심 코드 리뷰어 구축
* 특정 교육 방식을 적용한 교육용 어시스턴트 개발

### append를 활용한 `systemPrompt`를 사용해야 할 때

**적합한 경우:**

* 특정 코딩 표준 또는 선호도 추가
* 출력 포맷 커스터마이징
* 도메인 특화 지식 추가
* 응답 상세도 조정
* 도구 지침을 유지하면서 Claude Code 기본 동작 향상

### 커스텀 `systemPrompt`를 사용해야 할 때

**적합한 경우:**

* Claude 동작에 대한 완전한 제어
* 특화된 단일 세션 작업
* 새로운 프롬프트 전략 테스트
* 기본 도구가 필요하지 않은 상황
* 고유한 동작을 가진 특화 에이전트 구축

## 방법 조합하기

최대한의 유연성을 위해 이러한 방법들을 조합할 수 있습니다:

### 예시: output style과 세션별 추가 지침 조합

::: code-group
```typescript TypeScript theme={null}
import { query } from "@anthropic-ai/claude-agent-sdk";

// "Code Reviewer" output style이 활성화되어 있다고 가정 (/output-style을 통해)
// 세션별 중점 영역 추가
const messages = [];

for await (const message of query({
  prompt: "Review this authentication module",
  options: {
    systemPrompt: {
      type: "preset",
      preset: "claude_code",
      append: `
        For this review, prioritize:
        - OAuth 2.0 compliance
        - Token storage security
        - Session management
      `
    }
  }
})) {
  messages.push(message);
}
```

```python Python theme={null}
from claude_agent_sdk import query, ClaudeAgentOptions

# "Code Reviewer" output style이 활성화되어 있다고 가정 (/output-style을 통해)
# 세션별 중점 영역 추가
messages = []

async for message in query(
    prompt="Review this authentication module",
    options=ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",
            "append": """
            For this review, prioritize:
            - OAuth 2.0 compliance
            - Token storage security
            - Session management
            """,
        }
    ),
):
    messages.append(message)
```
:::

## 관련 문서

* [Output styles](/output-styles) - Output styles 전체 문서
* [TypeScript SDK 가이드](/agent-sdk/typescript) - SDK 사용 전체 가이드
* [설정 가이드](/settings) - 일반 설정 옵션
