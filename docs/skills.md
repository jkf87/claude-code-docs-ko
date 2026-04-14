---
title: Skills로 Claude 확장하기
description: Claude Code에서 Claude의 기능을 확장하는 Skills를 생성, 관리, 공유하세요. 커스텀 명령어와 번들 Skills를 포함합니다.
---

# Skills로 Claude 확장하기

Skills는 Claude가 할 수 있는 일을 확장합니다. `SKILL.md` 파일에 지침을 작성하면 Claude가 해당 내용을 도구 목록에 추가합니다. Claude는 관련성이 있을 때 자동으로 Skills를 사용하거나, `/skill-name`으로 직접 호출할 수 있습니다.

동일한 플레이북, 체크리스트, 또는 다단계 절차를 계속 채팅에 붙여넣거나, CLAUDE.md의 특정 섹션이 사실보다는 절차에 가까워졌을 때 Skill을 만드세요. CLAUDE.md 내용과 달리, Skill의 본문은 사용될 때만 로드되므로 긴 참조 자료를 필요할 때까지 거의 비용 없이 유지할 수 있습니다.

::: info
`/help`, `/compact` 같은 내장 명령어와 `/debug`, `/simplify` 같은 번들 Skills는 [명령어 레퍼런스](/commands)를 참조하세요.

**커스텀 명령어는 Skills에 통합되었습니다.** `.claude/commands/deploy.md`에 있는 파일과 `.claude/skills/deploy/SKILL.md`에 있는 Skill은 모두 `/deploy`를 생성하며 동일하게 작동합니다. 기존 `.claude/commands/` 파일은 계속 작동합니다. Skills는 선택적 기능을 추가합니다: 지원 파일을 위한 디렉토리, [호출 주체 제어](#호출-주체-제어)를 위한 프론트매터, 관련성이 있을 때 Claude가 자동으로 로드하는 기능.
:::

Claude Code Skills는 여러 AI 도구에서 작동하는 [Agent Skills](https://agentskills.io) 공개 표준을 따릅니다. Claude Code는 [호출 제어](#호출-주체-제어), [서브에이전트 실행](#서브에이전트에서-skill-실행), [동적 컨텍스트 주입](#동적-컨텍스트-주입) 같은 추가 기능으로 표준을 확장합니다.

## 번들 Skills

Claude Code에는 모든 세션에서 사용 가능한 번들 Skills 세트가 포함됩니다. `/simplify`, `/batch`, `/debug`, `/loop`, `/claude-api` 등이 있습니다. 고정된 로직을 직접 실행하는 내장 명령어와 달리, 번들 Skills는 프롬프트 기반입니다: Claude에게 상세한 플레이북을 제공하고 도구를 사용해 작업을 조율하게 합니다. 다른 Skill과 동일하게 `/` 뒤에 Skill 이름을 입력해 호출합니다.

번들 Skills는 [명령어 레퍼런스](/commands)에 내장 명령어와 함께 나열되며, Purpose 열에 **Skill**로 표시됩니다.

## 시작하기

### 첫 번째 Skill 만들기

이 예제는 Claude가 시각적 다이어그램과 비유를 사용해 코드를 설명하도록 가르치는 Skill을 만듭니다. 기본 프론트매터를 사용하므로, Claude는 무언가가 어떻게 작동하는지 물어볼 때 자동으로 로드하거나, `/explain-code`로 직접 호출할 수 있습니다.

<Steps>
  <Step title="Skill 디렉토리 생성">
    개인 Skills 폴더에 Skill 디렉토리를 만드세요. 개인 Skills는 모든 프로젝트에서 사용 가능합니다.

    ```bash
    mkdir -p ~/.claude/skills/explain-code
    ```
  </Step>

  <Step title="SKILL.md 작성">
    모든 Skill에는 두 부분으로 구성된 `SKILL.md` 파일이 필요합니다: Skill을 언제 사용할지 Claude에게 알려주는 YAML 프론트매터(`---` 마커 사이)와, Skill이 호출될 때 Claude가 따르는 지침이 담긴 마크다운 내용. `name` 필드는 `/slash-command`가 되고, `description`은 Claude가 자동으로 로드할 시기를 결정하는 데 도움을 줍니다.

    `~/.claude/skills/explain-code/SKILL.md` 생성:

    ```yaml
    ---
    name: explain-code
    description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
    ---

    When explaining code, always include:

    1. **Start with an analogy**: Compare the code to something from everyday life
    2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
    3. **Walk through the code**: Explain step-by-step what happens
    4. **Highlight a gotcha**: What's a common mistake or misconception?

    Keep explanations conversational. For complex concepts, use multiple analogies.
    ```
  </Step>

  <Step title="Skill 테스트">
    두 가지 방법으로 테스트할 수 있습니다:

    **Claude가 자동으로 호출하도록 하기** — 설명과 일치하는 질문하기:

    ```text
    How does this code work?
    ```

    **또는 직접 호출하기** — Skill 이름으로:

    ```text
    /explain-code src/auth/login.ts
    ```

    어느 방법이든 Claude는 설명에 비유와 ASCII 다이어그램을 포함해야 합니다.
  </Step>
</Steps>

### Skills 저장 위치

Skill을 저장하는 위치에 따라 사용 가능한 범위가 결정됩니다:

| 위치       | 경로                                                | 적용 범위                      |
| :--------- | :-------------------------------------------------- | :----------------------------- |
| 엔터프라이즈 | [관리 설정](/settings#settings-files) 참조         | 조직의 모든 사용자             |
| 개인       | `~/.claude/skills/<skill-name>/SKILL.md`            | 모든 프로젝트                  |
| 프로젝트   | `.claude/skills/<skill-name>/SKILL.md`              | 해당 프로젝트만                |
| 플러그인   | `<plugin>/skills/<skill-name>/SKILL.md`             | 플러그인이 활성화된 곳         |

여러 레벨에서 동일한 이름의 Skills가 있을 경우 우선순위가 높은 위치가 적용됩니다: 엔터프라이즈 > 개인 > 프로젝트. 플러그인 Skills는 `plugin-name:skill-name` 네임스페이스를 사용하므로 다른 레벨과 충돌하지 않습니다. `.claude/commands/`에 파일이 있다면 동일하게 작동하지만, Skill과 명령어의 이름이 같으면 Skill이 우선합니다.

#### 실시간 변경 감지

Claude Code는 Skill 디렉토리의 파일 변경을 감시합니다. `~/.claude/skills/`, 프로젝트 `.claude/skills/`, 또는 `--add-dir` 디렉토리 내의 `.claude/skills/`에 Skill을 추가, 편집, 삭제하면 Claude Code를 재시작하지 않아도 현재 세션에 즉시 반영됩니다. 세션 시작 시 존재하지 않던 최상위 Skills 디렉토리를 새로 생성하는 경우에는 새 디렉토리를 감시할 수 있도록 Claude Code를 재시작해야 합니다.

#### 중첩 디렉토리에서 자동 발견

하위 디렉토리의 파일을 작업할 때, Claude Code는 중첩된 `.claude/skills/` 디렉토리에서 Skills를 자동으로 발견합니다. 예를 들어 `packages/frontend/`의 파일을 편집 중이라면, Claude Code는 `packages/frontend/.claude/skills/`에서도 Skills를 찾습니다. 이는 각 패키지마다 고유한 Skills를 가진 모노레포 설정을 지원합니다.

각 Skill은 `SKILL.md`를 진입점으로 하는 디렉토리입니다:

```text
my-skill/
├── SKILL.md           # 주요 지침 (필수)
├── template.md        # Claude가 채울 템플릿
├── examples/
│   └── sample.md      # 예상 형식을 보여주는 예제 출력
└── scripts/
    └── validate.sh    # Claude가 실행할 수 있는 스크립트
```

`SKILL.md`에는 주요 지침이 포함되며 필수입니다. 다른 파일들은 선택 사항으로, 더 강력한 Skills를 만들 수 있습니다: Claude가 채울 템플릿, 예상 형식을 보여주는 예제 출력, Claude가 실행할 수 있는 스크립트, 또는 상세한 참조 문서. `SKILL.md`에서 이 파일들을 참조하여 Claude가 각 파일의 내용과 언제 로드할지 알 수 있게 하세요. 자세한 내용은 [지원 파일 추가](#지원-파일-추가)를 참조하세요.

::: info
`.claude/commands/`의 파일은 계속 작동하며 동일한 [프론트매터](#프론트매터-레퍼런스)를 지원합니다. 지원 파일 같은 추가 기능을 지원하므로 Skills를 권장합니다.
:::

#### 추가 디렉토리의 Skills

`--add-dir` 플래그는 구성 검색보다 [파일 접근 권한 부여](/permissions#additional-directories-grant-file-access-not-configuration)를 위한 것이지만, Skills는 예외입니다: 추가된 디렉토리 내의 `.claude/skills/`는 자동으로 로드됩니다. 세션 중 편집이 어떻게 반영되는지는 [실시간 변경 감지](#실시간-변경-감지)를 참조하세요.

서브에이전트, 명령어, 출력 스타일 같은 다른 `.claude/` 구성은 추가 디렉토리에서 로드되지 않습니다. 무엇이 로드되고 로드되지 않는지, 그리고 프로젝트 간에 구성을 공유하는 권장 방법은 [예외 표](/permissions#additional-directories-grant-file-access-not-configuration)를 참조하세요.

::: info
`--add-dir` 디렉토리의 CLAUDE.md 파일은 기본적으로 로드되지 않습니다. 로드하려면 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`을 설정하세요. [추가 디렉토리에서 로드하기](/memory#load-from-additional-directories)를 참조하세요.
:::

## Skills 구성하기

Skills는 `SKILL.md` 상단의 YAML 프론트매터와 이후의 마크다운 내용을 통해 구성됩니다.

### Skill 내용의 유형

Skill 파일에는 어떤 지침이든 포함할 수 있지만, 어떻게 호출하고 싶은지를 생각하면 무엇을 포함할지 결정하는 데 도움이 됩니다:

**참조 내용**은 Claude가 현재 작업에 적용하는 지식을 추가합니다. 규칙, 패턴, 스타일 가이드, 도메인 지식 등. 이 내용은 Claude가 대화 컨텍스트와 함께 사용할 수 있도록 인라인으로 실행됩니다.

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**태스크 내용**은 배포, 커밋, 코드 생성 같은 특정 작업에 대한 단계별 지침을 Claude에게 제공합니다. 이는 Claude가 언제 실행할지 결정하게 두는 것보다 `/skill-name`으로 직접 호출하고 싶은 액션인 경우가 많습니다. Claude가 자동으로 트리거하는 것을 막으려면 `disable-model-invocation: true`를 추가하세요.

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

`SKILL.md`에는 무엇이든 포함할 수 있지만, Skill을 어떻게 호출하고 싶은지(직접, Claude에 의해, 또는 둘 다), 어디서 실행하고 싶은지(인라인 또는 서브에이전트)를 생각하면 포함할 내용 결정에 도움이 됩니다. 복잡한 Skills의 경우 주요 Skill을 집중적으로 유지하기 위해 [지원 파일을 추가](#지원-파일-추가)할 수도 있습니다.

### 프론트매터 레퍼런스

마크다운 내용 외에도, `SKILL.md` 파일 상단의 `---` 마커 사이에 있는 YAML 프론트매터 필드를 사용해 Skill 동작을 구성할 수 있습니다:

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

모든 필드는 선택 사항입니다. Claude가 Skill을 언제 사용할지 알기 위해 `description`만 권장됩니다.

| 필드                       | 필수 여부   | 설명                                                                                                                                                                                                                                                                                                                |
| :------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                     | 아니오      | Skill의 표시 이름. 생략하면 디렉토리 이름을 사용합니다. 소문자, 숫자, 하이픈만 허용 (최대 64자).                                                                                                                                                                                                                  |
| `description`              | 권장        | Skill의 기능과 사용 시기. Claude가 Skill을 적용할 시기를 결정하는 데 사용합니다. 생략하면 마크다운 내용의 첫 단락을 사용합니다. 핵심 사용 사례를 앞에 배치하세요: `description`과 `when_to_use` 텍스트 조합은 컨텍스트 사용량 감소를 위해 Skill 목록에서 1,536자로 잘립니다.                                     |
| `when_to_use`              | 아니오      | Claude가 Skill을 호출해야 할 시기에 대한 추가 컨텍스트. 트리거 문구나 요청 예시 등. Skill 목록에서 `description`에 추가되며 1,536자 제한에 포함됩니다.                                                                                                                                                            |
| `argument-hint`            | 아니오      | 자동 완성 시 표시되는 예상 인수 힌트. 예: `[issue-number]` 또는 `[filename] [format]`.                                                                                                                                                                                                                             |
| `disable-model-invocation` | 아니오      | Claude가 이 Skill을 자동으로 로드하는 것을 막으려면 `true`로 설정. `/name`으로 수동으로 트리거하고 싶은 워크플로우에 사용합니다. 기본값: `false`.                                                                                                                                                                   |
| `user-invocable`           | 아니오      | `/` 메뉴에서 숨기려면 `false`로 설정. 사용자가 직접 호출해서는 안 되는 백그라운드 지식에 사용합니다. 기본값: `true`.                                                                                                                                                                                               |
| `allowed-tools`            | 아니오      | Skill이 활성화될 때 승인 요청 없이 Claude가 사용할 수 있는 도구들. 공백으로 구분된 문자열 또는 YAML 목록을 허용합니다.                                                                                                                                                                                              |
| `model`                    | 아니오      | Skill이 활성화될 때 사용할 모델.                                                                                                                                                                                                                                                                                    |
| `effort`                   | 아니오      | Skill이 활성화될 때의 [노력 수준](/model-config#adjust-effort-level). 세션 노력 수준을 재정의합니다. 기본값: 세션에서 상속. 옵션: `low`, `medium`, `high`, `max` (Opus 4.6 전용).                                                                                                                                   |
| `context`                  | 아니오      | 포크된 서브에이전트 컨텍스트에서 실행하려면 `fork`로 설정.                                                                                                                                                                                                                                                         |
| `agent`                    | 아니오      | `context: fork`가 설정되었을 때 사용할 서브에이전트 유형.                                                                                                                                                                                                                                                          |
| `hooks`                    | 아니오      | 이 Skill의 라이프사이클에 범위가 지정된 훅. 구성 형식은 [Skills와 에이전트의 훅](/hooks#hooks-in-skills-and-agents)을 참조하세요.                                                                                                                                                                                   |
| `paths`                    | 아니오      | 이 Skill이 활성화되는 시기를 제한하는 Glob 패턴. 쉼표로 구분된 문자열 또는 YAML 목록을 허용합니다. 설정되면, 패턴과 일치하는 파일을 작업할 때만 Claude가 Skill을 자동으로 로드합니다. [경로별 규칙](/memory#path-specific-rules)과 동일한 형식을 사용합니다.                                                     |
| `shell`                    | 아니오      | 이 Skill의 `` !`command` `` 및 ` ```! ` 블록에 사용할 셸. `bash` (기본값) 또는 `powershell`을 허용합니다. `powershell`을 설정하면 Windows에서 PowerShell로 인라인 셸 명령어를 실행합니다. `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`이 필요합니다.                                                                       |

#### 사용 가능한 문자열 치환

Skills는 Skill 내용의 동적 값에 대한 문자열 치환을 지원합니다:

| 변수                   | 설명                                                                                                                                                                                                                                                                                     |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ARGUMENTS`           | Skill 호출 시 전달된 모든 인수. 내용에 `$ARGUMENTS`가 없으면 `ARGUMENTS: <value>`로 추가됩니다.                                                                                                                                                                                         |
| `$ARGUMENTS[N]`        | 0부터 시작하는 인덱스로 특정 인수에 접근. 예: 첫 번째 인수에는 `$ARGUMENTS[0]`.                                                                                                                                                                                                        |
| `$N`                   | `$ARGUMENTS[N]`의 약식. 예: 첫 번째 인수는 `$0`, 두 번째는 `$1`.                                                                                                                                                                                                                       |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID. 로깅, 세션별 파일 생성, 또는 Skill 출력과 세션 상관관계에 유용합니다.                                                                                                                                                                                                     |
| `${CLAUDE_SKILL_DIR}`  | Skill의 `SKILL.md` 파일이 있는 디렉토리. 플러그인 Skills의 경우, 플러그인 루트가 아닌 플러그인 내 Skill의 하위 디렉토리입니다. 현재 작업 디렉토리에 관계없이 Skill과 함께 번들된 스크립트나 파일을 참조하기 위해 bash 주입 명령어에서 사용하세요.                                       |

인덱싱된 인수는 셸 스타일 따옴표를 사용하므로, 여러 단어 값을 단일 인수로 전달하려면 따옴표로 묶으세요. 예를 들어 `/my-skill "hello world" second`는 `$0`을 `hello world`로, `$1`을 `second`로 확장합니다. `$ARGUMENTS` 플레이스홀더는 항상 입력된 전체 인수 문자열로 확장됩니다.

**치환 사용 예시:**

```yaml
---
name: session-logger
description: Log activity for this session
---

Log the following to logs/${CLAUDE_SESSION_ID}.log:

$ARGUMENTS
```

### 지원 파일 추가

Skills는 디렉토리에 여러 파일을 포함할 수 있습니다. 이렇게 하면 `SKILL.md`는 핵심 사항에 집중하면서, 필요할 때만 Claude가 상세한 참조 자료에 접근할 수 있습니다. 대형 참조 문서, API 사양, 또는 예제 컬렉션은 Skill이 실행될 때마다 컨텍스트에 로드할 필요가 없습니다.

```text
my-skill/
├── SKILL.md (필수 - 개요 및 탐색)
├── reference.md (상세 API 문서 - 필요할 때 로드)
├── examples.md (사용 예시 - 필요할 때 로드)
└── scripts/
    └── helper.py (유틸리티 스크립트 - 로드되지 않고 실행됨)
```

`SKILL.md`에서 지원 파일을 참조하여 Claude가 각 파일의 내용과 언제 로드할지 알 수 있게 하세요:

```markdown
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

::: tip
`SKILL.md`는 500줄 이하로 유지하세요. 상세한 참조 자료는 별도 파일로 이동하세요.
:::

### 호출 주체 제어

기본적으로 본인과 Claude 모두 모든 Skill을 호출할 수 있습니다. `/skill-name`으로 직접 호출하거나, Claude가 대화와 관련성이 있을 때 자동으로 로드할 수 있습니다. 두 개의 프론트매터 필드로 이를 제한할 수 있습니다:

* **`disable-model-invocation: true`**: 본인만 Skill을 호출할 수 있습니다. `/commit`, `/deploy`, `/send-slack-message` 같이 부작용이 있거나 타이밍을 제어하고 싶은 워크플로우에 사용하세요. Claude가 코드가 준비된 것처럼 보인다고 판단해 배포를 결정하는 것은 바람직하지 않습니다.

* **`user-invocable: false`**: Claude만 Skill을 호출할 수 있습니다. 명령어로서 실행할 수 없는 백그라운드 지식에 사용하세요. `legacy-system-context` Skill은 오래된 시스템이 어떻게 작동하는지 설명합니다. Claude는 관련성이 있을 때 이를 알아야 하지만, 사용자가 `/legacy-system-context`를 실행하는 것은 의미 있는 액션이 아닙니다.

이 예제는 본인만 트리거할 수 있는 deploy Skill을 만듭니다. `disable-model-invocation: true` 필드가 Claude의 자동 실행을 막습니다:

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

두 필드가 호출과 컨텍스트 로딩에 미치는 영향:

| 프론트매터                       | 본인 호출 가능 | Claude 호출 가능 | 컨텍스트 로딩 시기                                         |
| :------------------------------- | :------------- | :---------------- | :----------------------------------------------------------- |
| (기본값)                         | 예             | 예                | 설명은 항상 컨텍스트에, 전체 Skill은 호출 시 로드           |
| `disable-model-invocation: true` | 예             | 아니오            | 설명은 컨텍스트에 없음, 전체 Skill은 호출 시 로드           |
| `user-invocable: false`          | 아니오         | 예                | 설명은 항상 컨텍스트에, 전체 Skill은 호출 시 로드           |

::: info
일반 세션에서는 Skill 설명이 컨텍스트에 로드되어 Claude가 무엇이 사용 가능한지 알 수 있지만, 전체 Skill 내용은 호출될 때만 로드됩니다. [미리 로드된 Skills가 있는 서브에이전트](/sub-agents#preload-skills-into-subagents)는 다르게 작동합니다: 전체 Skill 내용이 시작 시 주입됩니다.
:::

### Skill 내용 라이프사이클

본인이나 Claude가 Skill을 호출하면, 렌더링된 `SKILL.md` 내용이 단일 메시지로 대화에 들어가고 나머지 세션 동안 유지됩니다. Claude Code는 이후 대화에서 Skill 파일을 다시 읽지 않으므로, 일회성 단계가 아닌 작업 전반에 적용될 지침은 지속적인 지시로 작성하세요.

[자동 컴팩션](/how-claude-code-works#when-context-fills-up)은 토큰 예산 내에서 호출된 Skills를 이월합니다. 컨텍스트를 확보하기 위해 대화가 요약될 때, Claude Code는 요약 후에 각 Skill의 가장 최근 호출을 다시 첨부하며 각각 처음 5,000 토큰을 유지합니다. 다시 첨부된 Skills는 총 25,000 토큰의 예산을 공유합니다. Claude Code는 가장 최근에 호출된 Skill부터 이 예산을 채우므로, 한 세션에서 많은 Skills를 호출한 경우 컴팩션 후 오래된 Skills는 완전히 제외될 수 있습니다.

첫 번째 응답 이후 Skill이 동작에 영향을 미치지 않는 것처럼 보이면, 내용은 보통 여전히 존재하며 모델이 다른 도구나 접근 방식을 선택하는 것입니다. Skill의 `description`과 지침을 강화하여 모델이 계속 선호하게 하거나, [훅](/hooks)을 사용해 동작을 결정론적으로 강제하세요. Skill이 크거나 그 이후에 다른 Skills를 여러 개 호출했다면, 컴팩션 후 다시 호출하여 전체 내용을 복원하세요.

### Skill에 도구 사전 승인

`allowed-tools` 필드는 Skill이 활성화된 동안 나열된 도구에 권한을 부여하므로, Claude는 승인 요청 없이 도구를 사용할 수 있습니다. 사용 가능한 도구를 제한하지는 않습니다: 모든 도구는 여전히 호출 가능하며, [권한 설정](/permissions)은 나열되지 않은 도구에 대해 계속 적용됩니다.

이 Skill은 호출할 때마다 매번 승인 없이 git 명령어를 실행할 수 있게 합니다:

```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

특정 도구를 Skill에서 사용하지 못하게 하려면, [권한 설정](/permissions)에 거부 규칙을 추가하세요.

### Skills에 인수 전달

본인과 Claude 모두 Skill을 호출할 때 인수를 전달할 수 있습니다. 인수는 `$ARGUMENTS` 플레이스홀더를 통해 사용할 수 있습니다.

이 Skill은 번호로 GitHub 이슈를 수정합니다. `$ARGUMENTS` 플레이스홀더는 Skill 이름 다음에 오는 내용으로 교체됩니다:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

`/fix-issue 123`을 실행하면 Claude는 "Fix GitHub issue 123 following our coding standards..."를 받습니다.

Skill에 인수를 전달했지만 Skill에 `$ARGUMENTS`가 없다면, Claude Code는 Skill 내용 끝에 `ARGUMENTS: <your input>`을 추가하여 Claude가 입력한 내용을 볼 수 있게 합니다.

위치로 개별 인수에 접근하려면 `$ARGUMENTS[N]` 또는 더 짧은 `$N`을 사용하세요:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $ARGUMENTS[0] component from $ARGUMENTS[1] to $ARGUMENTS[2].
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue`를 실행하면 `$ARGUMENTS[0]`은 `SearchBar`, `$ARGUMENTS[1]`은 `React`, `$ARGUMENTS[2]`는 `Vue`로 교체됩니다. `$N` 약식을 사용한 동일한 Skill:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

## 고급 패턴

### 동적 컨텍스트 주입

`` !`<command>` `` 구문은 Skill 내용이 Claude에게 전송되기 전에 셸 명령어를 실행합니다. 명령어 출력이 플레이스홀더를 교체하므로, Claude는 명령어 자체가 아닌 실제 데이터를 받습니다.

이 Skill은 GitHub CLI로 라이브 PR 데이터를 가져와 풀 리퀘스트를 요약합니다. `` !`gh pr diff` ``와 다른 명령어들이 먼저 실행되고, 출력이 프롬프트에 삽입됩니다:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

이 Skill이 실행될 때:

1. 각 `` !`<command>` ``가 즉시 실행됩니다 (Claude가 아무것도 보기 전에)
2. 출력이 Skill 내용의 플레이스홀더를 교체합니다
3. Claude는 실제 PR 데이터가 있는 완전히 렌더링된 프롬프트를 받습니다

이것은 전처리이지 Claude가 실행하는 것이 아닙니다. Claude는 최종 결과만 봅니다.

여러 줄 명령어의 경우, 인라인 형식 대신 ` ```! `로 시작하는 코드 블록을 사용하세요:

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

사용자, 프로젝트, 플러그인, 또는 [추가 디렉토리](#추가-디렉토리의-skills) 소스의 Skills와 커스텀 명령어에서 이 동작을 비활성화하려면, [설정](/settings)에서 `"disableSkillShellExecution": true`를 설정하세요. 각 명령어는 실행되는 대신 `[shell command execution disabled by policy]`로 교체됩니다. 번들 및 관리 Skills는 영향을 받지 않습니다. 이 설정은 사용자가 재정의할 수 없는 [관리 설정](/permissions#managed-settings)에서 가장 유용합니다.

::: tip
Skill에서 [확장된 사고](/common-workflows#use-extended-thinking-thinking-mode)를 활성화하려면, Skill 내용 어디에든 "ultrathink"라는 단어를 포함하세요.
:::

### 서브에이전트에서 Skill 실행

Skill을 격리해서 실행하고 싶을 때 프론트매터에 `context: fork`를 추가하세요. Skill 내용이 서브에이전트를 구동하는 프롬프트가 됩니다. 대화 기록에는 접근할 수 없습니다.

::: warning
`context: fork`는 명시적인 지침이 있는 Skills에서만 의미가 있습니다. Skill에 작업 없이 "이 API 규칙을 사용하라"와 같은 가이드라인이 포함되어 있다면, 서브에이전트는 가이드라인을 받지만 실행 가능한 프롬프트가 없어서 의미 있는 출력 없이 반환됩니다.
:::

Skills와 [서브에이전트](/sub-agents)는 두 방향으로 함께 작동합니다:

| 접근 방식                    | 시스템 프롬프트                               | 태스크                      | 추가 로드                    |
| :--------------------------- | :-------------------------------------------- | :-------------------------- | :--------------------------- |
| `context: fork`가 있는 Skill | 에이전트 유형에서 (`Explore`, `Plan` 등)      | SKILL.md 내용               | CLAUDE.md                    |
| `skills` 필드이 있는 서브에이전트 | 서브에이전트의 마크다운 본문             | Claude의 위임 메시지        | 미리 로드된 Skills + CLAUDE.md |

`context: fork`를 사용하면 Skill에 태스크를 작성하고 실행할 에이전트 유형을 선택합니다. 반대의 경우(Skills를 참조 자료로 사용하는 커스텀 서브에이전트 정의)는 [서브에이전트](/sub-agents#preload-skills-into-subagents)를 참조하세요.

#### 예시: Explore 에이전트를 사용한 리서치 Skill

이 Skill은 포크된 Explore 에이전트에서 리서치를 실행합니다. Skill 내용이 태스크가 되고, 에이전트는 코드베이스 탐색에 최적화된 읽기 전용 도구를 제공합니다:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

이 Skill이 실행될 때:

1. 새로운 격리된 컨텍스트가 생성됩니다
2. 서브에이전트는 Skill 내용을 프롬프트로 받습니다 ("Research \$ARGUMENTS thoroughly...")
3. `agent` 필드가 실행 환경을 결정합니다 (모델, 도구, 권한)
4. 결과가 요약되어 주요 대화로 반환됩니다

`agent` 필드는 사용할 서브에이전트 구성을 지정합니다. 내장 에이전트(`Explore`, `Plan`, `general-purpose`) 또는 `.claude/agents/`의 커스텀 서브에이전트를 선택할 수 있습니다. 생략하면 `general-purpose`를 사용합니다.

### Claude의 Skill 접근 제한

기본적으로 Claude는 `disable-model-invocation: true`가 설정되지 않은 모든 Skill을 호출할 수 있습니다. `allowed-tools`를 정의하는 Skills는 Skill이 활성화될 때 매번 승인 없이 해당 도구에 대한 접근을 Claude에게 부여합니다. [권한 설정](/permissions)은 다른 모든 도구에 대한 기본 승인 동작을 계속 적용합니다. `/compact`, `/init` 같은 내장 명령어는 Skill 도구를 통해 사용할 수 없습니다.

Claude가 호출할 수 있는 Skills를 제어하는 세 가지 방법:

**모든 Skills 비활성화** — `/permissions`에서 Skill 도구 거부:

```text
# 거부 규칙에 추가:
Skill
```

**특정 Skills 허용 또는 거부** — [권한 규칙](/permissions) 사용:

```text
# 특정 Skills만 허용
Skill(commit)
Skill(review-pr *)

# 특정 Skills 거부
Skill(deploy *)
```

권한 구문: `Skill(name)`은 정확한 일치, `Skill(name *)`은 임의의 인수가 있는 접두사 일치.

**개별 Skills 숨기기** — 프론트매터에 `disable-model-invocation: true` 추가. 이렇게 하면 Skill이 Claude의 컨텍스트에서 완전히 제거됩니다.

::: info
`user-invocable` 필드는 메뉴 가시성만 제어하며, Skill 도구 접근은 제어하지 않습니다. 프로그래밍 방식의 호출을 차단하려면 `disable-model-invocation: true`를 사용하세요.
:::

## Skills 공유하기

Skills는 대상에 따라 다른 범위에서 배포할 수 있습니다:

* **프로젝트 Skills**: `.claude/skills/`를 버전 관리에 커밋
* **플러그인**: [플러그인](/plugins)에 `skills/` 디렉토리 생성
* **관리**: [관리 설정](/settings#settings-files)을 통한 조직 전체 배포

### 시각적 출력 생성

Skills는 어떤 언어로든 스크립트를 번들하고 실행하여, 단일 프롬프트로는 불가능한 기능을 Claude에게 제공할 수 있습니다. 강력한 패턴 중 하나는 시각적 출력 생성입니다: 데이터 탐색, 디버깅, 보고서 생성을 위해 브라우저에서 열 수 있는 인터랙티브 HTML 파일.

이 예제는 코드베이스 탐색기를 만듭니다: 디렉토리를 확장하고 접을 수 있고, 파일 크기를 한눈에 보고, 색상으로 파일 유형을 구분하는 인터랙티브 트리 뷰.

Skill 디렉토리 생성:

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

`~/.claude/skills/codebase-visualizer/SKILL.md`를 생성합니다. 설명은 Claude에게 이 Skill을 언제 활성화할지 알려주고, 지침은 번들된 스크립트를 실행하도록 합니다:

````yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python *)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure with collapsible directories.

## Usage

Run the visualization script from your project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

This creates `codebase-map.html` in the current directory and opens it in your default browser.

## What the visualization shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Colors**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
````

`~/.claude/skills/codebase-visualizer/scripts/visualize.py`를 만드세요. 이 스크립트는 디렉토리 트리를 스캔하고 다음을 포함한 독립형 HTML 파일을 생성합니다:

* 파일 수, 디렉토리 수, 전체 크기, 파일 유형 수를 보여주는 **요약 사이드바**
* 파일 유형별로 코드베이스를 분류하는 **바 차트** (크기 기준 상위 8개)
* 디렉토리를 확장하고 접을 수 있는 **접을 수 있는 트리** (색상으로 구분된 파일 유형 표시기 포함)

스크립트는 Python만 필요하며 내장 라이브러리만 사용하므로 설치할 패키지가 없습니다:

```python expandable
#!/usr/bin/env python3
"""Generate an interactive collapsible tree visualization of a codebase."""

import json
import sys
import webbrowser
from pathlib import Path
from collections import Counter

IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build'}

def scan(path: Path, stats: dict) -> dict:
    result = {"name": path.name, "children": [], "size": 0}
    try:
        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                result["children"].append({"name": item.name, "size": size, "ext": ext})
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
    }
    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="width:{(size/total_size)*100}%;background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )
    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Explorer</title>
  <style>
    body {{ font: 14px/1.5 system-ui, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }}
    .container {{ display: flex; height: 100vh; }}
    .sidebar {{ width: 280px; background: #252542; padding: 20px; border-right: 1px solid #3d3d5c; overflow-y: auto; flex-shrink: 0; }}
    .main {{ flex: 1; padding: 20px; overflow-y: auto; }}
    h1 {{ margin: 0 0 10px 0; font-size: 18px; }}
    h2 {{ margin: 20px 0 10px 0; font-size: 14px; color: #888; text-transform: uppercase; }}
    .stat {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3d3d5c; }}
    .stat-value {{ font-weight: bold; }}
    .bar-row {{ display: flex; align-items: center; margin: 6px 0; }}
    .bar-label {{ width: 55px; font-size: 12px; color: #aaa; }}
    .bar {{ height: 18px; border-radius: 3px; }}
    .bar-pct {{ margin-left: 8px; font-size: 12px; color: #666; }}
    .tree {{ list-style: none; padding-left: 20px; }}
    details {{ cursor: pointer; }}
    summary {{ padding: 4px 8px; border-radius: 4px; }}
    summary:hover {{ background: #2d2d44; }}
    .folder {{ color: #ffd700; }}
    .file {{ display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }}
    .file:hover {{ background: #2d2d44; }}
    .size {{ color: #888; margin-left: auto; font-size: 12px; }}
    .dot {{ width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <h1>📊 Summary</h1>
      <div class="stat"><span>Files</span><span class="stat-value">{stats["files"]:,}</span></div>
      <div class="stat"><span>Directories</span><span class="stat-value">{stats["dirs"]:,}</span></div>
      <div class="stat"><span>Total size</span><span class="stat-value">{fmt(data["size"])}</span></div>
      <div class="stat"><span>File types</span><span class="stat-value">{len(stats["extensions"])}</span></div>
      <h2>By file type</h2>
      {lang_bars}
    </div>
    <div class="main">
      <h1>📁 {data["name"]}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};
    function fmt(b) {{ if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }}
    function render(node, parent) {{
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        det.innerHTML = `<summary><span class="folder">📁 ${{node.name}}</span><span class="size">${{fmt(node.size)}}</span></summary>`;
        const ul = document.createElement('ul'); ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul));
        det.appendChild(ul);
        const li = document.createElement('li'); li.appendChild(det); parent.appendChild(li);
      }} else {{
        const li = document.createElement('li'); li.className = 'file';
        li.innerHTML = `<span class="dot" style="background:${{colors[node.ext]||'#6b7280'}}"></span>${{node.name}}<span class="size">${{fmt(node.size)}}</span>`;
        parent.appendChild(li);
      }}
    }}
    data.children.forEach(c => render(c, document.getElementById('root')));
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-map.html')
    generate_html(data, stats, out)
    print(f'Generated {out.absolute()}')
    webbrowser.open(f'file://{out.absolute()}')
```

테스트하려면 임의의 프로젝트에서 Claude Code를 열고 "Visualize this codebase."라고 물어보세요. Claude가 스크립트를 실행하고 `codebase-map.html`을 생성하여 브라우저에서 엽니다.

이 패턴은 어떤 시각적 출력에도 적용됩니다: 의존성 그래프, 테스트 커버리지 보고서, API 문서, 또는 데이터베이스 스키마 시각화. 번들된 스크립트가 무거운 작업을 처리하는 동안 Claude는 조율을 담당합니다.

## 트러블슈팅

### Skill이 트리거되지 않음

Claude가 예상대로 Skill을 사용하지 않는 경우:

1. 설명에 사용자가 자연스럽게 말할 키워드가 포함되어 있는지 확인
2. `What skills are available?`에서 Skill이 표시되는지 확인
3. 설명과 더 밀접하게 일치하도록 요청을 다시 표현
4. Skill이 사용자 호출 가능하다면 `/skill-name`으로 직접 호출

### Skill이 너무 자주 트리거됨

원하지 않을 때 Claude가 Skill을 사용하는 경우:

1. 설명을 더 구체적으로 만들기
2. 수동 호출만 원한다면 `disable-model-invocation: true` 추가

### Skill 설명이 잘림

Skill 설명은 Claude가 무엇이 사용 가능한지 알 수 있도록 컨텍스트에 로드됩니다. 모든 Skill 이름은 항상 포함되지만, Skills가 많은 경우 문자 예산에 맞추기 위해 설명이 짧아져 Claude가 요청을 일치시키는 데 필요한 키워드가 삭제될 수 있습니다. 예산은 컨텍스트 창의 1%로 동적으로 조정되며, 폴백으로 8,000자가 사용됩니다.

제한을 높이려면 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 환경 변수를 설정하세요. 또는 소스에서 `description`과 `when_to_use` 텍스트를 줄이세요: 예산과 관계없이 각 항목의 조합된 텍스트는 1,536자로 제한되므로, 핵심 사용 사례를 앞에 배치하세요.

## 관련 리소스

* **[서브에이전트](/sub-agents)**: 전문화된 에이전트에 태스크 위임
* **[플러그인](/plugins)**: 다른 확장과 함께 Skills 패키지 및 배포
* **[훅](/hooks)**: 도구 이벤트 주변의 워크플로우 자동화
* **[메모리](/memory)**: 지속적인 컨텍스트를 위한 CLAUDE.md 파일 관리
* **[명령어](/commands)**: 내장 명령어 및 번들 Skills 레퍼런스
* **[권한](/permissions)**: 도구 및 Skill 접근 제어
