---
title: Claude Code 프로그래밍 방식으로 실행하기
description: Agent SDK를 사용하여 CLI, Python 또는 TypeScript에서 Claude Code를 프로그래밍 방식으로 실행합니다.
---

# Claude Code 프로그래밍 방식으로 실행하기

[Agent SDK](/agent-sdk/overview)는 Claude Code를 구동하는 동일한 도구, 에이전트 루프, 컨텍스트 관리를 제공합니다. 스크립트 및 CI/CD용 CLI로 제공되거나, 완전한 프로그래밍 제어를 위한 [Python](/agent-sdk/python) 및 [TypeScript](/agent-sdk/typescript) 패키지로 제공됩니다.

::: info 참고
CLI는 이전에 "headless mode"로 불렸습니다. `-p` 플래그와 모든 CLI 옵션은 동일하게 작동합니다.
:::

CLI에서 Claude Code를 프로그래밍 방식으로 실행하려면 `-p`와 프롬프트 및 [CLI 옵션](/cli-reference)을 전달하세요:

```bash
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

이 페이지는 CLI(`claude -p`)를 통한 Agent SDK 사용을 다룹니다. 구조화된 출력, 도구 승인 콜백, 네이티브 메시지 객체가 있는 Python 및 TypeScript SDK 패키지에 대해서는 [전체 Agent SDK 문서](/agent-sdk/overview)를 참조하세요.

## 기본 사용법 {#basic-usage}

모든 `claude` 명령에 `-p` (또는 `--print`) 플래그를 추가하여 비대화형으로 실행합니다. 모든 [CLI 옵션](/cli-reference)이 `-p`와 함께 작동하며, 다음을 포함합니다:

* `--continue` - [대화 이어가기](#continue-conversations)
* `--allowedTools` - [도구 자동 승인](#auto-approve-tools)
* `--output-format` - [구조화된 출력](#get-structured-output)

이 예제는 코드베이스에 대한 질문을 하고 응답을 출력합니다:

```bash
claude -p "What does the auth module do?"
```

### bare 모드로 더 빠르게 시작하기 {#start-faster-with-bare-mode}

`--bare`를 추가하면 hooks, skills, 플러그인, MCP 서버, 자동 메모리, CLAUDE.md의 자동 검색을 건너뛰어 시작 시간을 줄입니다. 이 플래그가 없으면 `claude -p`는 대화형 세션과 동일한 [컨텍스트](/how-claude-code-works#the-context-window)를 로드하며, 작업 디렉토리나 `~/.claude`에 구성된 모든 것을 포함합니다.

bare 모드는 모든 머신에서 동일한 결과가 필요한 CI 및 스크립트에 유용합니다. 동료의 `~/.claude`에 있는 hook이나 프로젝트의 `.mcp.json`에 있는 MCP 서버는 실행되지 않습니다. bare 모드는 이를 읽지 않기 때문입니다. 명시적으로 전달한 플래그만 적용됩니다.

이 예제는 bare 모드에서 일회성 요약 작업을 실행하고 Read 도구를 사전 승인하여 권한 프롬프트 없이 호출을 완료합니다:

```bash
claude --bare -p "Summarize this file" --allowedTools "Read"
```

bare 모드에서 Claude는 Bash, 파일 읽기, 파일 편집 도구에 접근할 수 있습니다. 필요한 컨텍스트는 플래그로 전달하세요:

| 로드할 항목 | 사용할 플래그 |
| --- | --- |
| 시스템 프롬프트 추가 | `--append-system-prompt`, `--append-system-prompt-file` |
| 설정 | `--settings <file-or-json>` |
| MCP 서버 | `--mcp-config <file-or-json>` |
| 커스텀 에이전트 | `--agents <json>` |
| 플러그인 디렉토리 | `--plugin-dir <path>` |

bare 모드는 OAuth 및 키체인 읽기를 건너뜁니다. Anthropic 인증은 `ANTHROPIC_API_KEY` 또는 `--settings`에 전달된 JSON의 `apiKeyHelper`에서 가져와야 합니다. Bedrock, Vertex, Foundry는 일반적인 제공자 자격 증명을 사용합니다.

::: info 참고
`--bare`는 스크립트 및 SDK 호출에 권장되는 모드이며, 향후 릴리스에서 `-p`의 기본값이 될 예정입니다.
:::

## 예제 {#examples}

이 예제들은 일반적인 CLI 패턴을 보여줍니다. CI 및 기타 스크립트 호출의 경우, 로컬에 구성된 항목을 가져오지 않도록 [`--bare`](#start-faster-with-bare-mode)를 추가하세요.

### 구조화된 출력 받기 {#get-structured-output}

`--output-format`을 사용하여 응답 반환 방식을 제어합니다:

* `text` (기본값): 일반 텍스트 출력
* `json`: 결과, 세션 ID, 메타데이터가 포함된 구조화된 JSON
* `stream-json`: 실시간 스트리밍을 위한 개행 구분 JSON

이 예제는 프로젝트 요약을 세션 메타데이터가 포함된 JSON으로 반환하며, 텍스트 결과는 `result` 필드에 있습니다:

```bash
claude -p "Summarize this project" --output-format json
```

특정 스키마에 맞는 출력을 얻으려면 `--output-format json`과 `--json-schema` 및 [JSON Schema](https://json-schema.org/) 정의를 함께 사용하세요. 응답에는 요청에 대한 메타데이터(세션 ID, 사용량 등)가 포함되며, 구조화된 출력은 `structured_output` 필드에 있습니다.

이 예제는 함수 이름을 추출하여 문자열 배열로 반환합니다:

```bash
claude -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

::: tip 팁
[jq](https://jqlang.github.io/jq/)와 같은 도구를 사용하여 응답을 파싱하고 특정 필드를 추출하세요:

```bash
# 텍스트 결과 추출
claude -p "Summarize this project" --output-format json | jq -r '.result'

# 구조화된 출력 추출
claude -p "Extract function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```
:::

### 응답 스트리밍 {#stream-responses}

`--output-format stream-json`과 `--verbose` 및 `--include-partial-messages`를 사용하여 토큰이 생성될 때마다 수신합니다. 각 줄은 이벤트를 나타내는 JSON 객체입니다:

```bash
claude -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages
```

다음 예제는 [jq](https://jqlang.github.io/jq/)를 사용하여 텍스트 델타를 필터링하고 스트리밍 텍스트만 표시합니다. `-r` 플래그는 원시 문자열(따옴표 없음)을 출력하고 `-j`는 개행 없이 연결하여 토큰이 연속적으로 스트리밍됩니다:

```bash
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

API 요청이 재시도 가능한 오류로 실패하면, Claude Code는 재시도 전에 `system/api_retry` 이벤트를 발생시킵니다. 이를 사용하여 재시도 진행 상황을 표시하거나 커스텀 백오프 로직을 구현할 수 있습니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `type` | `"system"` | 메시지 타입 |
| `subtype` | `"api_retry"` | 재시도 이벤트임을 식별 |
| `attempt` | integer | 현재 시도 번호, 1부터 시작 |
| `max_retries` | integer | 허용된 총 재시도 횟수 |
| `retry_delay_ms` | integer | 다음 시도까지의 밀리초 |
| `error_status` | integer 또는 null | HTTP 상태 코드, HTTP 응답이 없는 연결 오류의 경우 `null` |
| `error` | string | 오류 카테고리: `authentication_failed`, `billing_error`, `rate_limit`, `invalid_request`, `server_error`, `max_output_tokens`, 또는 `unknown` |
| `uuid` | string | 고유 이벤트 식별자 |
| `session_id` | string | 이벤트가 속한 세션 |

콜백과 메시지 객체를 사용한 프로그래밍 방식의 스트리밍은 Agent SDK 문서의 [실시간 응답 스트리밍](/agent-sdk/streaming-output)을 참조하세요.

### 도구 자동 승인 {#auto-approve-tools}

`--allowedTools`를 사용하여 Claude가 프롬프트 없이 특정 도구를 사용할 수 있게 합니다. 이 예제는 테스트 스위트를 실행하고 실패를 수정하며, Claude가 권한 요청 없이 Bash 명령을 실행하고 파일을 읽고 편집할 수 있게 합니다:

```bash
claude -p "Run the test suite and fix any failures" \
  --allowedTools "Bash,Read,Edit"
```

개별 도구를 나열하는 대신 전체 세션의 기준을 설정하려면 [권한 모드](/permission-modes)를 전달하세요. `dontAsk`는 `permissions.allow` 규칙에 없는 모든 것을 거부하며, 잠금된 CI 실행에 유용합니다. `acceptEdits`는 Claude가 프롬프트 없이 파일을 작성하고 `mkdir`, `touch`, `mv`, `cp`와 같은 일반적인 파일시스템 명령도 자동 승인합니다. 다른 셸 명령과 네트워크 요청은 여전히 `--allowedTools` 항목이나 `permissions.allow` 규칙이 필요하며, 그렇지 않으면 시도 시 실행이 중단됩니다:

```bash
claude -p "Apply the lint fixes" --permission-mode acceptEdits
```

### 커밋 만들기 {#create-a-commit}

이 예제는 스테이징된 변경 사항을 검토하고 적절한 메시지로 커밋을 생성합니다:

```bash
claude -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

`--allowedTools` 플래그는 [권한 규칙 구문](/settings#permission-rule-syntax)을 사용합니다. 뒤의 ` *`는 접두사 매칭을 활성화하므로 `Bash(git diff *)`는 `git diff`로 시작하는 모든 명령을 허용합니다. `*` 앞의 공백이 중요합니다: 공백이 없으면 `Bash(git diff*)`는 `git diff-index`도 매칭합니다.

::: info 참고
사용자가 호출하는 [skills](/skills)(`/commit` 등)와 [내장 명령](/commands)은 대화형 모드에서만 사용할 수 있습니다. `-p` 모드에서는 수행하려는 작업을 설명하세요.
:::

### 시스템 프롬프트 커스터마이즈 {#customize-the-system-prompt}

`--append-system-prompt`를 사용하여 Claude Code의 기본 동작을 유지하면서 지시사항을 추가합니다. 이 예제는 PR diff를 Claude에 파이프하고 보안 취약점을 검토하도록 지시합니다:

```bash
gh pr diff "$1" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

기본 프롬프트를 완전히 교체하는 `--system-prompt`를 포함한 더 많은 옵션은 [시스템 프롬프트 플래그](/cli-reference#system-prompt-flags)를 참조하세요.

### 대화 이어가기 {#continue-conversations}

`--continue`를 사용하여 가장 최근 대화를 이어가거나, `--resume`과 세션 ID를 사용하여 특정 대화를 이어갑니다. 이 예제는 리뷰를 실행한 후 후속 프롬프트를 보냅니다:

```bash
# 첫 번째 요청
claude -p "Review this codebase for performance issues"

# 가장 최근 대화 이어가기
claude -p "Now focus on the database queries" --continue
claude -p "Generate a summary of all issues found" --continue
```

여러 대화를 실행하는 경우 세션 ID를 캡처하여 특정 대화를 재개합니다:

```bash
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
claude -p "Continue that review" --resume "$session_id"
```

## 다음 단계 {#next-steps}

* [Agent SDK 퀵스타트](/agent-sdk/quickstart): Python 또는 TypeScript로 첫 번째 에이전트 빌드
* [CLI 참조](/cli-reference): 모든 CLI 플래그 및 옵션
* [GitHub Actions](/github-actions): GitHub 워크플로에서 Agent SDK 사용
* [GitLab CI/CD](/gitlab-ci-cd): GitLab 파이프라인에서 Agent SDK 사용
