---
title: 상태 표시줄 커스터마이즈
description: Claude Code에서 컨텍스트 창 사용량, 비용, git 상태를 모니터링하는 커스텀 상태 표시줄 구성하기
---

# 상태 표시줄 커스터마이즈

Claude Code 하단에 있는 커스터마이즈 가능한 상태 표시줄은 설정한 셸 스크립트를 실행합니다. stdin으로 JSON 세션 데이터를 받아서 스크립트가 출력하는 내용을 표시하므로, 컨텍스트 사용량, 비용, git 상태, 또는 원하는 모든 정보를 한눈에 볼 수 있습니다.

상태 표시줄이 유용한 경우:

* 작업 중 컨텍스트 창 사용량을 모니터링하고 싶을 때
* 세션 비용을 추적해야 할 때
* 여러 세션에 걸쳐 작업하면서 세션을 구분해야 할 때
* git 브랜치와 상태를 항상 표시하고 싶을 때

아래는 첫 번째 줄에 git 정보를, 두 번째 줄에 색상으로 구분된 컨텍스트 바를 표시하는 [다중 줄 상태 표시줄](#display-multiple-lines) 예시입니다.

이 페이지에서는 [기본 상태 표시줄 설정하기](#set-up-a-status-line), Claude Code에서 스크립트로 [데이터가 전달되는 방식](#how-status-lines-work), [표시 가능한 모든 필드](#available-data), 그리고 git 상태, 비용 추적, 진행률 바 등 일반적인 패턴에 대한 [바로 사용 가능한 예시](#examples)를 다룹니다.

## 상태 표시줄 설정하기 {#set-up-a-status-line}

[`/statusline` 명령어](#use-the-statusline-command)를 사용하여 Claude Code가 스크립트를 생성하도록 하거나, [직접 스크립트를 만들어](#manually-configure-a-status-line) 설정에 추가하세요.

### /statusline 명령어 사용하기 {#use-the-statusline-command}

`/statusline` 명령어는 표시하고 싶은 내용을 자연어로 설명하는 지시를 받습니다. Claude Code는 `~/.claude/`에 스크립트 파일을 생성하고 설정을 자동으로 업데이트합니다:

```text
/statusline show model name and context percentage with a progress bar
```

### 상태 표시줄 수동 구성하기 {#manually-configure-a-status-line}

사용자 설정(`~/.claude/settings.json`, 여기서 `~`는 홈 디렉토리) 또는 [프로젝트 설정](/settings#settings-files)에 `statusLine` 필드를 추가합니다. `type`을 `"command"`로 설정하고 `command`가 스크립트 경로 또는 인라인 셸 명령어를 가리키도록 합니다. 스크립트 생성에 대한 전체 안내는 [상태 표시줄 단계별 구성하기](#build-a-status-line-step-by-step)를 참조하세요.

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 2
  }
}
```

`command` 필드는 셸에서 실행되므로 스크립트 파일 대신 인라인 명령어도 사용할 수 있습니다. 이 예시는 `jq`를 사용하여 JSON 입력을 파싱하고 모델 이름과 컨텍스트 비율을 표시합니다:

```json
{
  "statusLine": {
    "type": "command",
    "command": "jq -r '\"[\\(.model.display_name)] \\(.context_window.used_percentage // 0)% context\"'"
  }
}
```

선택적 `padding` 필드는 상태 표시줄 내용에 추가 수평 공백(문자 단위)을 추가합니다. 기본값은 `0`입니다. 이 패딩은 인터페이스의 내장 간격에 추가되므로 터미널 가장자리로부터의 절대 거리가 아닌 상대적 들여쓰기를 조절합니다.

선택적 `refreshInterval` 필드는 [이벤트 기반 업데이트](#how-status-lines-work) 외에도 N초마다 명령어를 다시 실행합니다. 최솟값은 `1`입니다. 시계처럼 시간 기반 데이터를 표시하거나, 메인 세션이 유휴 상태일 때 백그라운드 서브에이전트가 git 상태를 변경하는 경우에 사용하세요. 이벤트 발생 시에만 실행하려면 설정하지 마세요.

### 상태 표시줄 비활성화하기

`/statusline`을 실행하고 상태 표시줄을 제거하거나 지우도록 요청합니다(예: `/statusline delete`, `/statusline clear`, `/statusline remove it`). settings.json에서 `statusLine` 필드를 직접 삭제할 수도 있습니다.

## 상태 표시줄 단계별 구성하기 {#build-a-status-line-step-by-step}

이 안내에서는 현재 모델, 작업 디렉토리, 컨텍스트 창 사용 비율을 표시하는 상태 표시줄을 직접 만들어봅니다.

:::info
[`/statusline`](#use-the-statusline-command)에 원하는 내용을 설명하면 이 모든 과정이 자동으로 구성됩니다.
:::

이 예시는 macOS와 Linux에서 작동하는 Bash 스크립트를 사용합니다. Windows에서는 PowerShell 및 Git Bash 예시에 대해 [Windows 구성](#windows-configuration)을 참조하세요.

**1단계: JSON을 읽고 출력을 출력하는 스크립트 만들기**

Claude Code는 stdin을 통해 JSON 데이터를 스크립트에 전달합니다. 이 스크립트는 설치가 필요할 수 있는 커맨드라인 JSON 파서인 [`jq`](https://jqlang.github.io/jq/)를 사용하여 모델 이름, 디렉토리, 컨텍스트 비율을 추출한 다음 형식화된 줄을 출력합니다.

이 내용을 `~/.claude/statusline.sh`에 저장하세요(`~`는 macOS의 `/Users/username` 또는 Linux의 `/home/username`과 같은 홈 디렉토리입니다):

```bash
#!/bin/bash
# Read JSON data that Claude Code sends to stdin
input=$(cat)

# Extract fields using jq
MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
# The "// 0" provides a fallback if the field is null
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Output the status line - ${DIR##*/} extracts just the folder name
echo "[$MODEL] 📁 ${DIR##*/} | ${PCT}% context"
```

**2단계: 실행 가능하게 만들기**

스크립트를 셸에서 실행할 수 있도록 실행 권한을 부여합니다:

```bash
chmod +x ~/.claude/statusline.sh
```

**3단계: 설정에 추가하기**

스크립트를 상태 표시줄로 실행하도록 Claude Code에 알립니다. `~/.claude/settings.json`에 다음 설정을 추가합니다. `type`을 `"command"`("이 셸 명령어 실행"을 의미)로 설정하고 `command`가 스크립트를 가리키도록 합니다:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

상태 표시줄이 인터페이스 하단에 표시됩니다. 설정은 자동으로 다시 로드되지만 변경 사항은 Claude Code와 다음 상호작용 시에 반영됩니다.

## 상태 표시줄 작동 방식 {#how-status-lines-work}

Claude Code는 스크립트를 실행하고 stdin을 통해 [JSON 세션 데이터](#available-data)를 파이프로 전달합니다. 스크립트는 JSON을 읽어 필요한 것을 추출하고 stdout에 텍스트를 출력합니다. Claude Code는 스크립트가 출력하는 내용을 표시합니다.

**업데이트 시점**

스크립트는 각 새 어시스턴트 메시지 이후, 권한 모드가 변경될 때, 또는 vim 모드가 토글될 때 실행됩니다. 업데이트는 300ms로 디바운싱되어 빠른 변경이 묶여서 처리되고 상황이 안정되면 스크립트가 한 번 실행됩니다. 스크립트가 아직 실행 중인 동안 새 업데이트가 발생하면 진행 중인 실행이 취소됩니다. 스크립트를 편집하면 다음 번에 Claude Code 업데이트가 트리거될 때까지 변경 사항이 반영되지 않습니다.

메인 세션이 유휴 상태일 때, 예를 들어 코디네이터가 백그라운드 서브에이전트를 기다리는 동안에는 이러한 트리거가 조용해질 수 있습니다. 유휴 기간 동안 시간 기반 또는 외부 소스 세그먼트를 최신 상태로 유지하려면 [`refreshInterval`](#manually-configure-a-status-line)을 설정하여 고정 타이머에서도 명령어를 다시 실행하세요.

**스크립트 출력 가능 내용**

* **다중 줄**: 각 `echo` 또는 `print` 문은 별도의 행으로 표시됩니다. [다중 줄 예시](#display-multiple-lines)를 참조하세요.
* **색상**: 초록색의 경우 `\033[32m`과 같은 [ANSI 이스케이프 코드](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)를 사용합니다(터미널이 지원해야 함). [git 상태 예시](#git-status-with-colors)를 참조하세요.
* **링크**: [OSC 8 이스케이프 시퀀스](https://en.wikipedia.org/wiki/ANSI_escape_code#OSC)를 사용하여 텍스트를 클릭 가능하게 만듭니다(macOS는 Cmd+클릭, Windows/Linux는 Ctrl+클릭). iTerm2, Kitty, WezTerm과 같이 하이퍼링크를 지원하는 터미널이 필요합니다. [클릭 가능한 링크 예시](#clickable-links)를 참조하세요.

:::info
상태 표시줄은 로컬에서 실행되며 API 토큰을 소모하지 않습니다. 자동완성 제안, 도움말 메뉴, 권한 프롬프트 등 특정 UI 상호작용 중에는 일시적으로 숨겨집니다.
:::

## 사용 가능한 데이터 {#available-data}

Claude Code는 stdin을 통해 스크립트에 다음 JSON 필드를 전달합니다:

| 필드 | 설명 |
| --- | --- |
| `model.id`, `model.display_name` | 현재 모델 식별자 및 표시 이름 |
| `cwd`, `workspace.current_dir` | 현재 작업 디렉토리. 두 필드는 동일한 값을 포함합니다. `workspace.project_dir`와의 일관성을 위해 `workspace.current_dir`를 권장합니다. |
| `workspace.project_dir` | Claude Code가 시작된 디렉토리로, 세션 중 작업 디렉토리가 변경되면 `cwd`와 다를 수 있습니다 |
| `workspace.added_dirs` | `/add-dir` 또는 `--add-dir`을 통해 추가된 디렉토리. 추가된 항목이 없으면 빈 배열 |
| `workspace.git_worktree` | 현재 디렉토리가 `git worktree add`로 생성된 연결된 워크트리 내에 있을 때의 Git 워크트리 이름. 메인 작업 트리에서는 없음. `--worktree` 세션에만 적용되는 `worktree.*`와 달리 모든 git 워크트리에 적용됨 |
| `cost.total_cost_usd` | USD 기준 총 세션 비용 |
| `cost.total_duration_ms` | 세션 시작 이후의 총 경과 시간(밀리초) |
| `cost.total_api_duration_ms` | API 응답을 기다리는 데 소요된 총 시간(밀리초) |
| `cost.total_lines_added`, `cost.total_lines_removed` | 변경된 코드 줄 수 |
| `context_window.total_input_tokens`, `context_window.total_output_tokens` | 세션 전체의 누적 토큰 수 |
| `context_window.context_window_size` | 최대 컨텍스트 창 크기(토큰). 기본값은 200000이며, 확장 컨텍스트 모델은 1000000 |
| `context_window.used_percentage` | 사용된 컨텍스트 창의 사전 계산된 비율 |
| `context_window.remaining_percentage` | 남은 컨텍스트 창의 사전 계산된 비율 |
| `context_window.current_usage` | [컨텍스트 창 필드](#context-window-fields)에 설명된 마지막 API 호출의 토큰 수 |
| `exceeds_200k_tokens` | 가장 최근 API 응답의 총 토큰 수(입력, 캐시, 출력 토큰 합산)가 200k를 초과하는지 여부. 실제 컨텍스트 창 크기와 무관한 고정 임계값 |
| `rate_limits.five_hour.used_percentage`, `rate_limits.seven_day.used_percentage` | 5시간 또는 7일 속도 제한 사용 비율(0~100) |
| `rate_limits.five_hour.resets_at`, `rate_limits.seven_day.resets_at` | 5시간 또는 7일 속도 제한 창이 재설정되는 Unix epoch 초 |
| `session_id` | 고유 세션 식별자 |
| `session_name` | `--name` 플래그 또는 `/rename`으로 설정된 커스텀 세션 이름. 커스텀 이름이 설정되지 않은 경우 없음 |
| `transcript_path` | 대화 기록 파일 경로 |
| `version` | Claude Code 버전 |
| `output_style.name` | 현재 출력 스타일의 이름 |
| `vim.mode` | [vim 모드](/interactive-mode#vim-editor-mode)가 활성화된 경우의 현재 vim 모드(`NORMAL` 또는 `INSERT`) |
| `agent.name` | `--agent` 플래그 또는 에이전트 설정이 구성된 경우의 에이전트 이름 |
| `worktree.name` | 활성 워크트리의 이름. `--worktree` 세션 중에만 표시됨 |
| `worktree.path` | 워크트리 디렉토리의 절대 경로 |
| `worktree.branch` | 워크트리의 Git 브랜치 이름(예: `"worktree-my-feature"`). 훅 기반 워크트리에서는 없음 |
| `worktree.original_cwd` | 워크트리에 진입하기 전 Claude가 있던 디렉토리 |
| `worktree.original_branch` | 워크트리에 진입하기 전에 체크아웃된 Git 브랜치. 훅 기반 워크트리에서는 없음 |

<details>
<summary>전체 JSON 스키마</summary>

상태 표시줄 명령어는 stdin을 통해 다음 JSON 구조를 받습니다:

```json
{
  "cwd": "/current/working/directory",
  "session_id": "abc123...",
  "session_name": "my-session",
  "transcript_path": "/path/to/transcript.jsonl",
  "model": {
    "id": "claude-opus-4-6",
    "display_name": "Opus"
  },
  "workspace": {
    "current_dir": "/current/working/directory",
    "project_dir": "/original/project/directory",
    "added_dirs": [],
    "git_worktree": "feature-xyz"
  },
  "version": "2.1.90",
  "output_style": {
    "name": "default"
  },
  "cost": {
    "total_cost_usd": 0.01234,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15234,
    "total_output_tokens": 4521,
    "context_window_size": 200000,
    "used_percentage": 8,
    "remaining_percentage": 92,
    "current_usage": {
      "input_tokens": 8500,
      "output_tokens": 1200,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 2000
    }
  },
  "exceeds_200k_tokens": false,
  "rate_limits": {
    "five_hour": {
      "used_percentage": 23.5,
      "resets_at": 1738425600
    },
    "seven_day": {
      "used_percentage": 41.2,
      "resets_at": 1738857600
    }
  },
  "vim": {
    "mode": "NORMAL"
  },
  "agent": {
    "name": "security-reviewer"
  },
  "worktree": {
    "name": "my-feature",
    "path": "/path/to/.claude/worktrees/my-feature",
    "branch": "worktree-my-feature",
    "original_cwd": "/path/to/project",
    "original_branch": "main"
  }
}
```

**없을 수 있는 필드** (JSON에 포함되지 않음):

* `session_name`: `--name` 또는 `/rename`으로 커스텀 이름이 설정된 경우에만 표시됨
* `workspace.git_worktree`: 현재 디렉토리가 연결된 git 워크트리 내에 있을 때만 표시됨
* `vim`: vim 모드가 활성화된 경우에만 표시됨
* `agent`: `--agent` 플래그 또는 에이전트 설정이 구성된 경우에만 표시됨
* `worktree`: `--worktree` 세션 중에만 표시됨. 표시될 때 `branch`와 `original_branch`는 훅 기반 워크트리의 경우 없을 수 있음
* `rate_limits`: 세션의 첫 번째 API 응답 이후 Claude.ai 구독자(Pro/Max)에게만 표시됨. 각 창(`five_hour`, `seven_day`)은 독립적으로 없을 수 있음. 없는 경우를 처리하려면 `jq -r '.rate_limits.five_hour.used_percentage // empty'`를 사용하세요.

**`null`이 될 수 있는 필드**:

* `context_window.current_usage`: 세션의 첫 번째 API 호출 전에는 `null`
* `context_window.used_percentage`, `context_window.remaining_percentage`: 세션 초반에 `null`일 수 있음

스크립트에서 조건부 접근으로 누락된 필드를, 폴백 기본값으로 null 값을 처리하세요.

</details>

### 컨텍스트 창 필드 {#context-window-fields}

`context_window` 객체는 컨텍스트 사용량을 추적하는 두 가지 방법을 제공합니다:

* **누적 합계** (`total_input_tokens`, `total_output_tokens`): 전체 세션의 모든 토큰 합계로, 총 소비량 추적에 유용함
* **현재 사용량** (`current_usage`): 가장 최근 API 호출의 토큰 수로, 실제 컨텍스트 상태를 반영하므로 정확한 컨텍스트 비율에 사용

`current_usage` 객체의 구성:

* `input_tokens`: 현재 컨텍스트의 입력 토큰
* `output_tokens`: 생성된 출력 토큰
* `cache_creation_input_tokens`: 캐시에 기록된 토큰
* `cache_read_input_tokens`: 캐시에서 읽은 토큰

`used_percentage` 필드는 입력 토큰만으로 계산됩니다: `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`. `output_tokens`는 포함되지 않습니다.

`current_usage`에서 수동으로 컨텍스트 비율을 계산하는 경우, `used_percentage`와 일치하도록 동일한 입력 전용 공식을 사용하세요.

`current_usage` 객체는 세션의 첫 번째 API 호출 전에 `null`입니다.

## 예시 {#examples}

이 예시들은 일반적인 상태 표시줄 패턴을 보여줍니다. 예시를 사용하려면:

1. 스크립트를 `~/.claude/statusline.sh`(또는 `.py`/`.js`)와 같은 파일에 저장합니다
2. 실행 가능하게 만듭니다: `chmod +x ~/.claude/statusline.sh`
3. [설정](#manually-configure-a-status-line)에 경로를 추가합니다

Bash 예시는 JSON을 파싱하기 위해 [`jq`](https://jqlang.github.io/jq/)를 사용합니다. Python과 Node.js는 JSON 파싱이 내장되어 있습니다.

### 컨텍스트 창 사용량 {#context-window-usage}

현재 모델과 시각적 진행률 바로 컨텍스트 창 사용량을 표시합니다. 각 스크립트는 stdin에서 JSON을 읽어 `used_percentage` 필드를 추출하고, 채워진 블록(▓)이 사용량을 나타내는 10자 바를 구성합니다:

::: code-group

```bash [Bash]
#!/bin/bash
# Read all of stdin into a variable
input=$(cat)

# Extract fields with jq, "// 0" provides fallback for null
MODEL=$(echo "$input" | jq -r '.model.display_name')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Build progress bar: printf -v creates a run of spaces, then
# ${var// /▓} replaces each space with a block character
BAR_WIDTH=10
FILLED=$((PCT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /▓}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /░}"

echo "[$MODEL] $BAR $PCT%"
```

```python [Python]
#!/usr/bin/env python3
import json, sys

# json.load reads and parses stdin in one step
data = json.load(sys.stdin)
model = data['model']['display_name']
# "or 0" handles null values
pct = int(data.get('context_window', {}).get('used_percentage', 0) or 0)

# String multiplication builds the bar
filled = pct * 10 // 100
bar = '▓' * filled + '░' * (10 - filled)

print(f"[{model}] {bar} {pct}%")
```

```javascript [Node.js]
#!/usr/bin/env node
// Node.js reads stdin asynchronously with events
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    // Optional chaining (?.) safely handles null fields
    const pct = Math.floor(data.context_window?.used_percentage || 0);

    // String.repeat() builds the bar
    const filled = Math.floor(pct * 10 / 100);
    const bar = '▓'.repeat(filled) + '░'.repeat(10 - filled);

    console.log(`[${model}] ${bar} ${pct}%`);
});
```

:::

### 색상이 있는 Git 상태 {#git-status-with-colors}

색상으로 구분된 스테이징 및 수정된 파일 지표와 함께 git 브랜치를 표시합니다. 이 스크립트는 터미널 색상을 위한 [ANSI 이스케이프 코드](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)를 사용합니다: `\033[32m`은 초록색, `\033[33m`은 노란색, `\033[0m`은 기본값으로 초기화합니다.

각 스크립트는 현재 디렉토리가 git 저장소인지 확인하고, 스테이징 및 수정된 파일을 세어 색상으로 구분된 지표를 표시합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')

GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    STAGED=$(git diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
    MODIFIED=$(git diff --numstat 2>/dev/null | wc -l | tr -d ' ')

    GIT_STATUS=""
    [ "$STAGED" -gt 0 ] && GIT_STATUS="${GREEN}+${STAGED}${RESET}"
    [ "$MODIFIED" -gt 0 ] && GIT_STATUS="${GIT_STATUS}${YELLOW}~${MODIFIED}${RESET}"

    echo -e "[$MODEL] 📁 ${DIR##*/} | 🌿 $BRANCH $GIT_STATUS"
else
    echo "[$MODEL] 📁 ${DIR##*/}"
fi
```

```python [Python]
#!/usr/bin/env python3
import json, sys, subprocess, os

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])

GREEN, YELLOW, RESET = '\033[32m', '\033[33m', '\033[0m'

try:
    subprocess.check_output(['git', 'rev-parse', '--git-dir'], stderr=subprocess.DEVNULL)
    branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip()
    staged_output = subprocess.check_output(['git', 'diff', '--cached', '--numstat'], text=True).strip()
    modified_output = subprocess.check_output(['git', 'diff', '--numstat'], text=True).strip()
    staged = len(staged_output.split('\n')) if staged_output else 0
    modified = len(modified_output.split('\n')) if modified_output else 0

    git_status = f"{GREEN}+{staged}{RESET}" if staged else ""
    git_status += f"{YELLOW}~{modified}{RESET}" if modified else ""

    print(f"[{model}] 📁 {directory} | 🌿 {branch} {git_status}")
except:
    print(f"[{model}] 📁 {directory}")
```

```javascript [Node.js]
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);

    const GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RESET = '\x1b[0m';

    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        const staged = execSync('git diff --cached --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
        const modified = execSync('git diff --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;

        let gitStatus = staged ? `${GREEN}+${staged}${RESET}` : '';
        gitStatus += modified ? `${YELLOW}~${modified}${RESET}` : '';

        console.log(`[${model}] 📁 ${dir} | 🌿 ${branch} ${gitStatus}`);
    } catch {
        console.log(`[${model}] 📁 ${dir}`);
    }
});
```

:::

### 비용 및 시간 추적 {#cost-and-duration-tracking}

세션의 API 비용과 경과 시간을 추적합니다. `cost.total_cost_usd` 필드는 현재 세션의 모든 API 호출 비용을 누적합니다. `cost.total_duration_ms` 필드는 세션 시작 이후 총 경과 시간을 측정하며, `cost.total_api_duration_ms`는 API 응답 대기 시간만을 추적합니다.

각 스크립트는 비용을 통화 형식으로 포맷하고 밀리초를 분과 초로 변환합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

COST_FMT=$(printf '$%.2f' "$COST")
DURATION_SEC=$((DURATION_MS / 1000))
MINS=$((DURATION_SEC / 60))
SECS=$((DURATION_SEC % 60))

echo "[$MODEL] 💰 $COST_FMT | ⏱️ ${MINS}m ${SECS}s"
```

```python [Python]
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
model = data['model']['display_name']
cost = data.get('cost', {}).get('total_cost_usd', 0) or 0
duration_ms = data.get('cost', {}).get('total_duration_ms', 0) or 0

duration_sec = duration_ms // 1000
mins, secs = duration_sec // 60, duration_sec % 60

print(f"[{model}] 💰 ${cost:.2f} | ⏱️ {mins}m {secs}s")
```

```javascript [Node.js]
#!/usr/bin/env node
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const cost = data.cost?.total_cost_usd || 0;
    const durationMs = data.cost?.total_duration_ms || 0;

    const durationSec = Math.floor(durationMs / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;

    console.log(`[${model}] 💰 $${cost.toFixed(2)} | ⏱️ ${mins}m ${secs}s`);
});
```

:::

### 다중 줄 표시 {#display-multiple-lines}

스크립트는 여러 줄을 출력하여 더 풍부한 화면을 만들 수 있습니다. 각 `echo` 문은 상태 영역에서 별도의 행을 생성합니다.

이 예시는 여러 기법을 결합합니다: 임계값 기반 색상(70% 미만은 초록색, 70-89%는 노란색, 90% 이상은 빨간색), 진행률 바, git 브랜치 정보. 각 `print` 또는 `echo` 문은 별도의 행을 생성합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

CYAN='\033[36m'; GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; RESET='\033[0m'

# Pick bar color based on context usage
if [ "$PCT" -ge 90 ]; then BAR_COLOR="$RED"
elif [ "$PCT" -ge 70 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$GREEN"; fi

FILLED=$((PCT / 10)); EMPTY=$((10 - FILLED))
printf -v FILL "%${FILLED}s"; printf -v PAD "%${EMPTY}s"
BAR="${FILL// /█}${PAD// /░}"

MINS=$((DURATION_MS / 60000)); SECS=$(((DURATION_MS % 60000) / 1000))

BRANCH=""
git rev-parse --git-dir > /dev/null 2>&1 && BRANCH=" | 🌿 $(git branch --show-current 2>/dev/null)"

echo -e "${CYAN}[$MODEL]${RESET} 📁 ${DIR##*/}$BRANCH"
COST_FMT=$(printf '$%.2f' "$COST")
echo -e "${BAR_COLOR}${BAR}${RESET} ${PCT}% | ${YELLOW}${COST_FMT}${RESET} | ⏱️ ${MINS}m ${SECS}s"
```

```python [Python]
#!/usr/bin/env python3
import json, sys, subprocess, os

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])
cost = data.get('cost', {}).get('total_cost_usd', 0) or 0
pct = int(data.get('context_window', {}).get('used_percentage', 0) or 0)
duration_ms = data.get('cost', {}).get('total_duration_ms', 0) or 0

CYAN, GREEN, YELLOW, RED, RESET = '\033[36m', '\033[32m', '\033[33m', '\033[31m', '\033[0m'

bar_color = RED if pct >= 90 else YELLOW if pct >= 70 else GREEN
filled = pct // 10
bar = '█' * filled + '░' * (10 - filled)

mins, secs = duration_ms // 60000, (duration_ms % 60000) // 1000

try:
    branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True, stderr=subprocess.DEVNULL).strip()
    branch = f" | 🌿 {branch}" if branch else ""
except:
    branch = ""

print(f"{CYAN}[{model}]{RESET} 📁 {directory}{branch}")
print(f"{bar_color}{bar}{RESET} {pct}% | {YELLOW}${cost:.2f}{RESET} | ⏱️ {mins}m {secs}s")
```

```javascript [Node.js]
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);
    const cost = data.cost?.total_cost_usd || 0;
    const pct = Math.floor(data.context_window?.used_percentage || 0);
    const durationMs = data.cost?.total_duration_ms || 0;

    const CYAN = '\x1b[36m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RED = '\x1b[31m', RESET = '\x1b[0m';

    const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
    const filled = Math.floor(pct / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);

    let branch = '';
    try {
        branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        branch = branch ? ` | 🌿 ${branch}` : '';
    } catch {}

    console.log(`${CYAN}[${model}]${RESET} 📁 ${dir}${branch}`);
    console.log(`${barColor}${bar}${RESET} ${pct}% | ${YELLOW}$${cost.toFixed(2)}${RESET} | ⏱️ ${mins}m ${secs}s`);
});
```

:::

### 클릭 가능한 링크 {#clickable-links}

이 예시는 GitHub 저장소에 대한 클릭 가능한 링크를 만듭니다. git 원격 URL을 읽어 SSH 형식을 `sed`로 HTTPS로 변환하고, 저장소 이름을 OSC 8 이스케이프 코드로 감쌉니다. macOS에서는 Cmd+클릭, Windows/Linux에서는 Ctrl+클릭으로 브라우저에서 링크를 엽니다.

각 스크립트는 git 원격 URL을 가져와 SSH 형식을 HTTPS로 변환하고, 저장소 이름을 OSC 8 이스케이프 코드로 감쌉니다. Bash 버전은 다양한 셸에서 `echo -e`보다 안정적으로 백슬래시 이스케이프를 해석하는 `printf '%b'`를 사용합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')

# Convert git SSH URL to HTTPS
REMOTE=$(git remote get-url origin 2>/dev/null | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')

if [ -n "$REMOTE" ]; then
    REPO_NAME=$(basename "$REMOTE")
    # OSC 8 format: \e]8;;URL\a then TEXT then \e]8;;\a
    # printf %b interprets escape sequences reliably across shells
    printf '%b' "[$MODEL] 🔗 \e]8;;${REMOTE}\a${REPO_NAME}\e]8;;\a\n"
else
    echo "[$MODEL]"
fi
```

```python [Python]
#!/usr/bin/env python3
import json, sys, subprocess, re, os

data = json.load(sys.stdin)
model = data['model']['display_name']

# Get git remote URL
try:
    remote = subprocess.check_output(
        ['git', 'remote', 'get-url', 'origin'],
        stderr=subprocess.DEVNULL, text=True
    ).strip()
    # Convert SSH to HTTPS format
    remote = re.sub(r'^git@github\.com:', 'https://github.com/', remote)
    remote = re.sub(r'\.git$', '', remote)
    repo_name = os.path.basename(remote)
    # OSC 8 escape sequences
    link = f"\033]8;;{remote}\a{repo_name}\033]8;;\a"
    print(f"[{model}] 🔗 {link}")
except:
    print(f"[{model}]")
```

```javascript [Node.js]
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;

    try {
        let remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        // Convert SSH to HTTPS format
        remote = remote.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
        const repoName = path.basename(remote);
        // OSC 8 escape sequences
        const link = `\x1b]8;;${remote}\x07${repoName}\x1b]8;;\x07`;
        console.log(`[${model}] 🔗 ${link}`);
    } catch {
        console.log(`[${model}]`);
    }
});
```

:::

### 속도 제한 사용량 {#rate-limit-usage}

상태 표시줄에 Claude.ai 구독 속도 제한 사용량을 표시합니다. `rate_limits` 객체에는 `five_hour`(5시간 롤링 창)와 `seven_day`(주간) 창이 있습니다. 각 창은 `used_percentage`(0-100)와 `resets_at`(창이 재설정되는 Unix epoch 초)를 제공합니다.

이 필드는 첫 번째 API 응답 이후 Claude.ai 구독자(Pro/Max)에게만 표시됩니다. 각 스크립트는 해당 필드가 없는 경우를 처리합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
# "// empty" produces no output when rate_limits is absent
FIVE_H=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
WEEK=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')

LIMITS=""
[ -n "$FIVE_H" ] && LIMITS="5h: $(printf '%.0f' "$FIVE_H")%"
[ -n "$WEEK" ] && LIMITS="${LIMITS:+$LIMITS }7d: $(printf '%.0f' "$WEEK")%"

[ -n "$LIMITS" ] && echo "[$MODEL] | $LIMITS" || echo "[$MODEL]"
```

```python [Python]
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
model = data['model']['display_name']

parts = []
rate = data.get('rate_limits', {})
five_h = rate.get('five_hour', {}).get('used_percentage')
week = rate.get('seven_day', {}).get('used_percentage')

if five_h is not None:
    parts.append(f"5h: {five_h:.0f}%")
if week is not None:
    parts.append(f"7d: {week:.0f}%")

if parts:
    print(f"[{model}] | {' '.join(parts)}")
else:
    print(f"[{model}]")
```

```javascript [Node.js]
#!/usr/bin/env node
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;

    const parts = [];
    const fiveH = data.rate_limits?.five_hour?.used_percentage;
    const week = data.rate_limits?.seven_day?.used_percentage;

    if (fiveH != null) parts.push(`5h: ${Math.round(fiveH)}%`);
    if (week != null) parts.push(`7d: ${Math.round(week)}%`);

    console.log(parts.length ? `[${model}] | ${parts.join(' ')}` : `[${model}]`);
});
```

:::

### 비용이 큰 작업 캐싱 {#cache-expensive-operations}

상태 표시줄 스크립트는 활성 세션 중에 자주 실행됩니다. 대규모 저장소에서 `git status`나 `git diff`와 같은 명령어는 느릴 수 있습니다. 이 예시는 git 정보를 임시 파일에 캐싱하고 5초마다만 새로 고칩니다.

캐시 파일 이름은 세션 내 상태 표시줄 호출에 걸쳐 안정적이어야 하지만, 서로 다른 저장소의 동시 세션이 서로의 캐시된 git 상태를 읽지 않도록 세션 간에는 고유해야 합니다. `$$`, `os.getpid()`, `process.pid`와 같은 프로세스 기반 식별자는 호출마다 변경되어 캐시를 무력화합니다. 대신 JSON 입력의 `session_id`를 사용하세요: 세션 수명 동안 안정적이고 세션별로 고유합니다.

각 스크립트는 git 명령어를 실행하기 전에 캐시 파일이 없거나 5초보다 오래된 경우를 확인합니다:

::: code-group

```bash [Bash]
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
SESSION_ID=$(echo "$input" | jq -r '.session_id')

CACHE_FILE="/tmp/statusline-git-cache-$SESSION_ID"
CACHE_MAX_AGE=5  # seconds

cache_is_stale() {
    [ ! -f "$CACHE_FILE" ] || \
    # stat -f %m is macOS, stat -c %Y is Linux
    [ $(($(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0))) -gt $CACHE_MAX_AGE ]
}

if cache_is_stale; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        BRANCH=$(git branch --show-current 2>/dev/null)
        STAGED=$(git diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
        MODIFIED=$(git diff --numstat 2>/dev/null | wc -l | tr -d ' ')
        echo "$BRANCH|$STAGED|$MODIFIED" > "$CACHE_FILE"
    else
        echo "||" > "$CACHE_FILE"
    fi
fi

IFS='|' read -r BRANCH STAGED MODIFIED < "$CACHE_FILE"

if [ -n "$BRANCH" ]; then
    echo "[$MODEL] 📁 ${DIR##*/} | 🌿 $BRANCH +$STAGED ~$MODIFIED"
else
    echo "[$MODEL] 📁 ${DIR##*/}"
fi
```

```python [Python]
#!/usr/bin/env python3
import json, sys, subprocess, os, time

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])
session_id = data['session_id']

CACHE_FILE = f"/tmp/statusline-git-cache-{session_id}"
CACHE_MAX_AGE = 5  # seconds

def cache_is_stale():
    if not os.path.exists(CACHE_FILE):
        return True
    return time.time() - os.path.getmtime(CACHE_FILE) > CACHE_MAX_AGE

if cache_is_stale():
    try:
        subprocess.check_output(['git', 'rev-parse', '--git-dir'], stderr=subprocess.DEVNULL)
        branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip()
        staged = subprocess.check_output(['git', 'diff', '--cached', '--numstat'], text=True).strip()
        modified = subprocess.check_output(['git', 'diff', '--numstat'], text=True).strip()
        staged_count = len(staged.split('\n')) if staged else 0
        modified_count = len(modified.split('\n')) if modified else 0
        with open(CACHE_FILE, 'w') as f:
            f.write(f"{branch}|{staged_count}|{modified_count}")
    except:
        with open(CACHE_FILE, 'w') as f:
            f.write("||")

with open(CACHE_FILE) as f:
    branch, staged, modified = f.read().strip().split('|')

if branch:
    print(f"[{model}] 📁 {directory} | 🌿 {branch} +{staged} ~{modified}")
else:
    print(f"[{model}] 📁 {directory}")
```

```javascript [Node.js]
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);
    const sessionId = data.session_id;

    const CACHE_FILE = `/tmp/statusline-git-cache-${sessionId}`;
    const CACHE_MAX_AGE = 5; // seconds

    const cacheIsStale = () => {
        if (!fs.existsSync(CACHE_FILE)) return true;
        return (Date.now() / 1000) - fs.statSync(CACHE_FILE).mtimeMs / 1000 > CACHE_MAX_AGE;
    };

    if (cacheIsStale()) {
        try {
            execSync('git rev-parse --git-dir', { stdio: 'ignore' });
            const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            const staged = execSync('git diff --cached --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
            const modified = execSync('git diff --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
            fs.writeFileSync(CACHE_FILE, `${branch}|${staged}|${modified}`);
        } catch {
            fs.writeFileSync(CACHE_FILE, '||');
        }
    }

    const [branch, staged, modified] = fs.readFileSync(CACHE_FILE, 'utf8').trim().split('|');

    if (branch) {
        console.log(`[${model}] 📁 ${dir} | 🌿 ${branch} +${staged} ~${modified}`);
    } else {
        console.log(`[${model}] 📁 ${dir}`);
    }
});
```

:::

### Windows 구성 {#windows-configuration}

Windows에서 Claude Code는 Git Bash를 통해 상태 표시줄 명령어를 실행합니다. 해당 셸에서 PowerShell을 호출할 수 있습니다:

::: code-group

```json [settings.json]
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -File C:/Users/username/.claude/statusline.ps1"
  }
}
```

```powershell [statusline.ps1]
$input_json = $input | Out-String | ConvertFrom-Json
$cwd = $input_json.cwd
$model = $input_json.model.display_name
$used = $input_json.context_window.used_percentage
$dirname = Split-Path $cwd -Leaf

if ($used) {
    Write-Host "$dirname [$model] ctx: $used%"
} else {
    Write-Host "$dirname [$model]"
}
```

:::

또는 Bash 스크립트를 직접 실행할 수 있습니다:

::: code-group

```json [settings.json]
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

```bash [statusline.sh]
#!/usr/bin/env bash
input=$(cat)
cwd=$(echo "$input" | grep -o '"cwd":"[^"]*"' | cut -d'"' -f4)
model=$(echo "$input" | grep -o '"display_name":"[^"]*"' | cut -d'"' -f4)
dirname="${cwd##*[/\\]}"
echo "$dirname [$model]"
```

:::

## 서브에이전트 상태 표시줄

`subagentStatusLine` 설정은 에이전트 패널에서 프롬프트 아래에 표시되는 각 [서브에이전트](/sub-agents)의 커스텀 행 본문을 렌더링합니다. 기본 `name · description · token count` 행을 자체 형식으로 교체하는 데 사용합니다.

```json
{
  "subagentStatusLine": {
    "type": "command",
    "command": "~/.claude/subagent-statusline.sh"
  }
}
```

명령어는 모든 표시된 서브에이전트 행이 stdin의 단일 JSON 객체로 전달되어 새로 고침 틱마다 한 번 실행됩니다. 입력에는 [기본 훅 필드](/hooks#common-input-fields)와 `columns`(사용 가능한 행 너비), 그리고 각 작업에 `id`, `name`, `type`, `status`, `description`, `label`, `startTime`, `tokenCount`, `tokenSamples`, `cwd`가 있는 `tasks` 배열이 포함됩니다.

재정의하려는 각 행에 대해 `{"id": "<task id>", "content": "<row body>"}` 형식으로 stdout에 JSON 줄 하나를 작성하세요. `content` 문자열은 ANSI 색상 및 OSC 8 하이퍼링크를 포함하여 있는 그대로 렌더링됩니다. 작업의 `id`를 생략하면 해당 행의 기본 렌더링이 유지되며, 빈 `content` 문자열을 내보내면 숨겨집니다.

`statusLine`에 적용되는 동일한 신뢰 및 `disableAllHooks` 게이트가 여기에도 적용됩니다. 플러그인은 [`settings.json`](/plugins-reference#standard-plugin-layout)에 기본 `subagentStatusLine`을 포함할 수 있습니다.

## 팁

* **모의 입력으로 테스트하기**: `echo '{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/home/user/project"},"context_window":{"used_percentage":25},"session_id":"test-session-abc"}' | ./statusline.sh`
* **출력을 짧게 유지하기**: 상태 표시줄은 너비가 제한되어 있으므로 긴 출력은 잘리거나 어색하게 줄바꿈될 수 있습니다
* **느린 작업 캐싱**: 스크립트는 활성 세션 중에 자주 실행되므로 `git status`와 같은 명령어는 지연을 야기할 수 있습니다. 처리 방법은 [캐싱 예시](#cache-expensive-operations)를 참조하세요.

[ccstatusline](https://github.com/sirmalloc/ccstatusline) 및 [starship-claude](https://github.com/martinemde/starship-claude)와 같은 커뮤니티 프로젝트는 테마와 추가 기능이 있는 미리 구성된 설정을 제공합니다.

## 문제 해결

**상태 표시줄이 나타나지 않음**

* 스크립트가 실행 가능한지 확인합니다: `chmod +x ~/.claude/statusline.sh`
* 스크립트가 stderr가 아닌 stdout에 출력하는지 확인합니다
* 스크립트를 수동으로 실행하여 출력이 생성되는지 확인합니다
* 설정에서 `disableAllHooks`가 `true`로 설정된 경우 상태 표시줄도 비활성화됩니다. 이 설정을 제거하거나 `false`로 설정하여 다시 활성화하세요.
* `claude --debug`를 실행하여 세션의 첫 번째 상태 표시줄 호출의 종료 코드와 stderr를 로그에 기록합니다
* Claude에게 설정 파일을 읽고 `statusLine` 명령어를 직접 실행하도록 요청하여 오류를 표면화합니다

**상태 표시줄에 `--` 또는 빈 값이 표시됨**

* 첫 번째 API 응답이 완료되기 전에 필드가 `null`일 수 있습니다
* `jq`의 `// 0`과 같은 폴백으로 스크립트에서 null 값을 처리합니다
* 여러 메시지 후에도 값이 비어 있으면 Claude Code를 다시 시작합니다

**컨텍스트 비율이 예상치 못한 값을 표시함**

* 누적 합계 대신 정확한 컨텍스트 상태를 위해 `used_percentage`를 사용합니다
* `total_input_tokens`와 `total_output_tokens`는 세션 전체의 누적값이므로 컨텍스트 창 크기를 초과할 수 있습니다
* 컨텍스트 비율은 각 계산 시점으로 인해 `/context` 출력과 다를 수 있습니다

**OSC 8 링크를 클릭할 수 없음**

* 터미널이 OSC 8 하이퍼링크를 지원하는지 확인합니다(iTerm2, Kitty, WezTerm)

* Terminal.app은 클릭 가능한 링크를 지원하지 않습니다

* 링크 텍스트는 표시되지만 클릭할 수 없는 경우, Claude Code가 터미널의 하이퍼링크 지원을 감지하지 못했을 수 있습니다. 이는 Windows Terminal 및 자동 감지 목록에 없는 다른 에뮬레이터에서 일반적으로 발생합니다. Claude Code를 시작하기 전에 `FORCE_HYPERLINK` 환경 변수를 설정하여 감지를 재정의합니다:

  ```bash
  FORCE_HYPERLINK=1 claude
  ```

  PowerShell에서는 먼저 현재 세션에서 변수를 설정합니다:

  ```powershell
  $env:FORCE_HYPERLINK = "1"; claude
  ```

* SSH 및 tmux 세션은 구성에 따라 OSC 시퀀스를 제거할 수 있습니다

* `\e]8;;`와 같이 이스케이프 시퀀스가 리터럴 텍스트로 나타나는 경우, 더 안정적인 이스케이프 처리를 위해 `echo -e` 대신 `printf '%b'`를 사용합니다

**이스케이프 시퀀스로 인한 화면 깜빡임**

* 복잡한 이스케이프 시퀀스(ANSI 색상, OSC 8 링크)는 다른 UI 업데이트와 겹치는 경우 가끔 깨진 출력을 야기할 수 있습니다
* 깨진 텍스트가 보이면 스크립트를 일반 텍스트 출력으로 단순화해보세요
* 이스케이프 코드가 있는 다중 줄 상태 표시줄은 단일 줄 일반 텍스트보다 렌더링 문제가 발생하기 쉽습니다

**워크스페이스 신뢰 필요**

* 상태 표시줄 명령어는 현재 디렉토리에 대한 워크스페이스 신뢰 대화 상자를 수락한 경우에만 실행됩니다. `statusLine`은 셸 명령어를 실행하므로 훅 및 기타 셸 실행 설정과 동일한 신뢰 수락이 필요합니다.
* 신뢰가 수락되지 않은 경우 상태 표시줄 출력 대신 `statusline skipped · restart to fix` 알림이 표시됩니다. Claude Code를 다시 시작하고 신뢰 프롬프트를 수락하여 활성화하세요.

**스크립트 오류 또는 중단**

* 비정상 종료 코드로 종료하거나 출력이 없는 스크립트는 상태 표시줄을 비웁니다
* 느린 스크립트는 완료될 때까지 상태 표시줄 업데이트를 차단합니다. 오래된 출력을 방지하려면 스크립트를 빠르게 유지하세요.
* 느린 스크립트가 실행 중인 동안 새 업데이트가 트리거되면 진행 중인 스크립트가 취소됩니다
* 구성하기 전에 모의 입력으로 스크립트를 독립적으로 테스트하세요

**알림이 상태 표시줄 행을 공유함**

* MCP 서버 오류 및 자동 업데이트와 같은 시스템 알림은 상태 표시줄과 동일한 행의 오른쪽에 표시됩니다. 낮은 컨텍스트 경고와 같은 일시적인 알림도 이 영역을 순환합니다.
* 자세한 모드를 활성화하면 이 영역에 토큰 카운터가 추가됩니다
* 좁은 터미널에서는 이러한 알림이 상태 표시줄 출력을 잘라낼 수 있습니다
