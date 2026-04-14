---
title: Claude가 프로젝트를 기억하는 방법
description: CLAUDE.md 파일로 Claude에게 지속적인 지침을 제공하고, 자동 메모리로 학습을 자동 축적하세요.
---

# Claude가 프로젝트를 기억하는 방법

> CLAUDE.md 파일로 Claude에게 지속적인 지침을 제공하고, 자동 메모리로 학습을 자동 축적하세요.

각 Claude Code 세션은 새로운 컨텍스트 윈도우로 시작합니다. 두 가지 메커니즘이 세션 간에 지식을 전달합니다:

* **CLAUDE.md 파일**: Claude에게 지속적인 컨텍스트를 제공하기 위해 직접 작성하는 지침
* **자동 메모리**: 여러분의 수정과 선호도를 기반으로 Claude가 스스로 작성하는 메모

이 페이지에서 다루는 내용:

* [CLAUDE.md 파일 작성 및 구성하기](#claude-md-파일)
* [특정 파일 유형에 규칙 적용하기](#claude-rules로-규칙-구성) (`.claude/rules/` 사용)
* [자동 메모리 구성하기](#자동-메모리) - Claude가 자동으로 메모를 작성하도록 설정
* [문제 해결](#메모리-문제-해결) - 지침이 따라지지 않을 때

## CLAUDE.md vs 자동 메모리

Claude Code에는 두 가지 상호 보완적인 메모리 시스템이 있습니다. 둘 다 모든 대화의 시작 시 로드됩니다. Claude는 이를 컨텍스트로 취급하며, 강제 구성으로 취급하지 않습니다. 지침이 구체적이고 간결할수록 Claude가 더 일관성 있게 따릅니다.

|  | CLAUDE.md 파일 | 자동 메모리 |
| :--- | :--- | :--- |
| **작성자** | 사용자 | Claude |
| **포함 내용** | 지침 및 규칙 | 학습 및 패턴 |
| **범위** | 프로젝트, 사용자 또는 조직 | 작업 트리별 |
| **로드 대상** | 모든 세션 | 모든 세션 (처음 200줄 또는 25KB) |
| **용도** | 코딩 표준, 워크플로우, 프로젝트 아키텍처 | 빌드 명령, 디버깅 인사이트, Claude가 발견한 선호도 |

Claude의 동작을 안내하고 싶을 때 CLAUDE.md 파일을 사용하세요. 자동 메모리는 수동 노력 없이 수정 사항에서 Claude가 학습하게 합니다.

서브에이전트도 자체 자동 메모리를 유지할 수 있습니다. 자세한 내용은 [서브에이전트 구성](/sub-agents#enable-persistent-memory)을 참조하세요.

## CLAUDE.md 파일

CLAUDE.md 파일은 프로젝트, 개인 워크플로우 또는 전체 조직에 대한 지속적인 지침을 Claude에게 제공하는 마크다운 파일입니다. 이 파일을 일반 텍스트로 작성하면 Claude가 모든 세션의 시작 시 읽습니다.

### CLAUDE.md에 추가할 때

CLAUDE.md를 반복적으로 설명해야 할 내용을 적어두는 곳으로 취급하세요. 다음 경우에 추가하세요:

* Claude가 같은 실수를 두 번째로 할 때
* 코드 리뷰에서 Claude가 이 코드베이스에 대해 알아야 했을 사항을 발견했을 때
* 지난 세션에 입력한 것과 동일한 수정이나 설명을 채팅에 다시 입력할 때
* 새 팀원이 생산적이 되기 위해 동일한 컨텍스트가 필요할 때

모든 세션에서 Claude가 보유해야 할 사실에 집중하세요: 빌드 명령, 규칙, 프로젝트 레이아웃, "항상 X를 하라" 규칙. 항목이 다단계 절차이거나 코드베이스의 한 부분에만 해당되는 경우 [스킬](/skills)이나 [경로 범위 규칙](#claude-rules로-규칙-구성)으로 이동하세요. [확장 기능 개요](/features-overview#build-your-setup-over-time)는 각 메커니즘을 언제 사용할지 다룹니다.

### CLAUDE.md 파일 배치 위치 선택

CLAUDE.md 파일은 여러 위치에 배치할 수 있으며, 각각 다른 범위를 가집니다. 더 구체적인 위치가 더 넓은 위치보다 우선합니다.

| 범위 | 위치 | 목적 | 사용 사례 예 | 공유 대상 |
| --- | --- | --- | --- | --- |
| **관리형 정책** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br />Linux 및 WSL: `/etc/claude-code/CLAUDE.md`<br />Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT/DevOps가 관리하는 조직 전체 지침 | 회사 코딩 표준, 보안 정책, 규정 준수 요구 사항 | 조직의 모든 사용자 |
| **프로젝트 지침** | `./CLAUDE.md` 또는 `./.claude/CLAUDE.md` | 프로젝트에 대한 팀 공유 지침 | 프로젝트 아키텍처, 코딩 표준, 일반적인 워크플로우 | 소스 관리를 통한 팀원 |
| **사용자 지침** | `~/.claude/CLAUDE.md` | 모든 프로젝트에 대한 개인 선호도 | 코드 스타일 선호도, 개인 도구 단축키 | 본인만 (모든 프로젝트) |
| **로컬 지침** | `./CLAUDE.local.md` | 개인 프로젝트별 선호도; `.gitignore`에 추가 | 개인 샌드박스 URL, 선호하는 테스트 데이터 | 본인만 (현재 프로젝트) |

작업 디렉토리 상위의 디렉토리 계층 구조에 있는 CLAUDE.md 및 CLAUDE.local.md 파일은 실행 시 전체가 로드됩니다. 하위 디렉토리의 파일은 Claude가 해당 디렉토리의 파일을 읽을 때 요청 시 로드됩니다. 전체 해석 순서는 [CLAUDE.md 파일 로드 방식](#claude-md-파일-로드-방식)을 참조하세요.

대규모 프로젝트의 경우 [프로젝트 규칙](#claude-rules로-규칙-구성)을 사용하여 지침을 주제별 파일로 분할할 수 있습니다. 규칙을 사용하면 특정 파일 유형이나 하위 디렉토리에 지침을 범위 지정할 수 있습니다.

### 프로젝트 CLAUDE.md 설정

프로젝트 CLAUDE.md는 `./CLAUDE.md` 또는 `./.claude/CLAUDE.md`에 저장할 수 있습니다. 이 파일을 만들고 프로젝트에서 작업하는 모든 사람에게 적용되는 지침을 추가하세요: 빌드 및 테스트 명령, 코딩 표준, 아키텍처 결정, 명명 규칙 및 일반적인 워크플로우. 이러한 지침은 버전 관리를 통해 팀과 공유되므로 개인 선호도가 아닌 프로젝트 수준 표준에 집중하세요.

::: tip
`/init`을 실행하면 시작 CLAUDE.md를 자동으로 생성합니다. Claude가 코드베이스를 분석하고 발견한 빌드 명령, 테스트 지침 및 프로젝트 규칙이 포함된 파일을 생성합니다. CLAUDE.md가 이미 존재하면 `/init`은 덮어쓰지 않고 개선 사항을 제안합니다. Claude가 스스로 발견하지 못할 지침으로 구체화하세요.

`CLAUDE_CODE_NEW_INIT=1`을 설정하면 대화형 다단계 플로우를 활성화합니다. `/init`이 설정할 아티팩트를 묻습니다: CLAUDE.md 파일, 스킬 및 훅. 그런 다음 서브에이전트로 코드베이스를 탐색하고, 후속 질문을 통해 빈 부분을 채운 후, 파일을 작성하기 전에 검토 가능한 제안을 제시합니다.
:::

### 효과적인 지침 작성

CLAUDE.md 파일은 모든 세션의 시작 시 컨텍스트 윈도우에 로드되어 대화와 함께 토큰을 소비합니다. [컨텍스트 윈도우 시각화](/context-window)는 CLAUDE.md가 나머지 시작 컨텍스트에 비해 어디에 로드되는지 보여줍니다. 강제 구성이 아닌 컨텍스트이므로, 지침을 어떻게 작성하느냐에 따라 Claude가 얼마나 신뢰성 있게 따르는지가 달라집니다. 구체적이고, 간결하며, 잘 구조화된 지침이 가장 효과적입니다.

**크기**: CLAUDE.md 파일당 200줄 미만을 목표로 하세요. 긴 파일은 더 많은 컨텍스트를 소비하고 준수도를 떨어뜨립니다. 지침이 커지면 [임포트](#추가-파일-임포트)나 [`.claude/rules/`](#claude-rules로-규칙-구성) 파일로 분할하세요.

**구조**: 마크다운 헤더와 글머리 기호를 사용하여 관련 지침을 그룹화하세요. Claude는 독자와 동일한 방식으로 구조를 스캔합니다: 정리된 섹션이 밀집된 단락보다 따르기 쉽습니다.

**구체성**: 검증할 수 있을 만큼 구체적인 지침을 작성하세요. 예:

* "코드를 적절히 포맷하라" 대신 "2칸 들여쓰기를 사용하라"
* "변경 사항을 테스트하라" 대신 "커밋 전에 `npm test`를 실행하라"
* "파일을 정리하라" 대신 "API 핸들러는 `src/api/handlers/`에 있다"

**일관성**: 두 규칙이 서로 모순되면 Claude가 임의로 하나를 선택할 수 있습니다. CLAUDE.md 파일, 하위 디렉토리의 중첩된 CLAUDE.md 파일 및 [`.claude/rules/`](#claude-rules로-규칙-구성)를 주기적으로 검토하여 오래되거나 충돌하는 지침을 제거하세요. 모노레포에서는 [`claudeMdExcludes`](#특정-claude-md-파일-제외)를 사용하여 작업과 관련 없는 다른 팀의 CLAUDE.md 파일을 건너뛰세요.

### 추가 파일 임포트

CLAUDE.md 파일은 `@path/to/import` 구문을 사용하여 추가 파일을 임포트할 수 있습니다. 임포트된 파일은 실행 시 이를 참조하는 CLAUDE.md와 함께 확장되어 컨텍스트에 로드됩니다.

상대 경로와 절대 경로 모두 허용됩니다. 상대 경로는 작업 디렉토리가 아닌 임포트를 포함하는 파일 기준으로 해석됩니다. 임포트된 파일은 최대 5단계 깊이로 다른 파일을 재귀적으로 임포트할 수 있습니다.

README, package.json 및 워크플로우 가이드를 가져오려면 CLAUDE.md의 아무 곳에서나 `@` 구문으로 참조하세요:

```text
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

버전 관리에 체크인해서는 안 되는 프로젝트별 개인 선호도는 프로젝트 루트에 `CLAUDE.local.md`를 만드세요. `CLAUDE.md`와 함께 로드되며 동일하게 취급됩니다. `CLAUDE.local.md`를 `.gitignore`에 추가하여 커밋되지 않도록 하세요; `/init`을 실행하고 개인 옵션을 선택하면 이 작업이 자동으로 수행됩니다.

동일한 리포지토리의 여러 git worktree에서 작업하는 경우, gitignore된 `CLAUDE.local.md`는 생성한 worktree에만 존재합니다. worktree 간에 개인 지침을 공유하려면 홈 디렉토리에서 파일을 임포트하세요:

```text
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

::: warning
Claude Code가 프로젝트에서 외부 임포트를 처음 만나면 파일을 나열하는 승인 대화 상자를 표시합니다. 거부하면 임포트가 비활성화된 상태로 유지되며 대화 상자가 다시 나타나지 않습니다.
:::

지침을 구성하는 더 구조화된 접근 방식은 [`.claude/rules/`](#claude-rules로-규칙-구성)를 참조하세요.

### AGENTS.md

Claude Code는 `AGENTS.md`가 아닌 `CLAUDE.md`를 읽습니다. 리포지토리가 이미 다른 코딩 에이전트용으로 `AGENTS.md`를 사용하는 경우, 이를 임포트하는 `CLAUDE.md`를 만들면 두 도구 모두 내용을 복제하지 않고 동일한 지침을 읽습니다. 임포트 아래에 Claude 전용 지침을 추가할 수도 있습니다. Claude는 세션 시작 시 임포트된 파일을 로드한 다음 나머지를 추가합니다:

```markdown
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

### CLAUDE.md 파일 로드 방식

Claude Code는 현재 작업 디렉토리에서 디렉토리 트리를 올라가며 CLAUDE.md 파일을 읽고, 각 디렉토리에서 `CLAUDE.md` 및 `CLAUDE.local.md` 파일을 확인합니다. 이는 `foo/bar/`에서 Claude Code를 실행하면 `foo/bar/CLAUDE.md`, `foo/CLAUDE.md` 및 각각의 `CLAUDE.local.md` 파일에서 지침을 로드한다는 의미입니다.

발견된 모든 파일은 서로를 재정의하지 않고 컨텍스트에 연결됩니다. 각 디렉토리 내에서 `CLAUDE.local.md`는 `CLAUDE.md` 뒤에 추가되므로, 지침이 충돌하면 해당 수준에서 개인 메모가 Claude가 마지막으로 읽는 내용이 됩니다.

Claude는 현재 작업 디렉토리 아래의 하위 디렉토리에서도 `CLAUDE.md` 및 `CLAUDE.local.md` 파일을 발견합니다. 실행 시 로드하는 대신 Claude가 해당 하위 디렉토리의 파일을 읽을 때 포함됩니다.

대규모 모노레포에서 다른 팀의 CLAUDE.md 파일이 포함되는 경우 [`claudeMdExcludes`](#특정-claude-md-파일-제외)를 사용하여 건너뛰세요.

CLAUDE.md 파일의 블록 수준 HTML 주석(`<!-- maintainer notes -->`)은 Claude의 컨텍스트에 주입되기 전에 제거됩니다. 컨텍스트 토큰을 소비하지 않고 인간 관리자를 위한 메모를 남기는 데 사용하세요. 코드 블록 내의 주석은 보존됩니다. Read 도구로 CLAUDE.md 파일을 직접 열면 주석이 보입니다.

#### 추가 디렉토리에서 로드

`--add-dir` 플래그는 Claude에게 주 작업 디렉토리 외부의 추가 디렉토리에 대한 액세스를 제공합니다. 기본적으로 이러한 디렉토리의 CLAUDE.md 파일은 로드되지 않습니다.

추가 디렉토리에서도 메모리 파일을 로드하려면 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` 환경 변수를 설정하세요:

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

이는 추가 디렉토리에서 `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/*.md` 및 `CLAUDE.local.md`를 로드합니다. [`--setting-sources`](/cli-reference)에서 `local`을 제외하면 `CLAUDE.local.md`는 건너뜁니다.

### `.claude/rules/`로 규칙 구성 {#claude-rules로-규칙-구성}

대규모 프로젝트의 경우 `.claude/rules/` 디렉토리를 사용하여 지침을 여러 파일로 구성할 수 있습니다. 이를 통해 지침을 모듈화하고 팀이 유지 관리하기 쉽게 만듭니다. 규칙은 [특정 파일 경로에 범위를 지정](#경로별-규칙)할 수도 있어, Claude가 일치하는 파일로 작업할 때만 컨텍스트에 로드되어 노이즈를 줄이고 컨텍스트 공간을 절약합니다.

::: info
규칙은 매 세션 또는 일치하는 파일이 열릴 때 컨텍스트에 로드됩니다. 항상 컨텍스트에 있을 필요가 없는 작업별 지침에는 대신 [스킬](/skills)을 사용하세요. 스킬은 호출하거나 Claude가 프롬프트와 관련이 있다고 판단할 때만 로드됩니다.
:::

#### 규칙 설정

프로젝트의 `.claude/rules/` 디렉토리에 마크다운 파일을 배치하세요. 각 파일은 하나의 주제를 다루어야 하며, `testing.md`나 `api-design.md`와 같은 설명적인 파일 이름을 사용하세요. 모든 `.md` 파일은 재귀적으로 검색되므로 `frontend/`이나 `backend/`와 같은 하위 디렉토리로 규칙을 구성할 수 있습니다:

```text
your-project/
├── .claude/
│   ├── CLAUDE.md           # 메인 프로젝트 지침
│   └── rules/
│       ├── code-style.md   # 코드 스타일 가이드라인
│       ├── testing.md      # 테스트 규칙
│       └── security.md     # 보안 요구 사항
```

[`paths` 프론트매터](#경로별-규칙)가 없는 규칙은 `.claude/CLAUDE.md`와 동일한 우선순위로 실행 시 로드됩니다.

#### 경로별 규칙

규칙은 `paths` 필드가 있는 YAML 프론트매터를 사용하여 특정 파일에 범위를 지정할 수 있습니다. 이러한 조건부 규칙은 Claude가 지정된 패턴과 일치하는 파일로 작업할 때만 적용됩니다.

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 개발 규칙

- 모든 API 엔드포인트에는 입력 검증을 포함해야 합니다
- 표준 오류 응답 형식을 사용하세요
- OpenAPI 문서 주석을 포함하세요
```

`paths` 필드가 없는 규칙은 무조건적으로 로드되며 모든 파일에 적용됩니다. 경로 범위 규칙은 모든 도구 사용이 아닌 Claude가 패턴과 일치하는 파일을 읽을 때 트리거됩니다.

`paths` 필드에 glob 패턴을 사용하여 확장자, 디렉토리 또는 모든 조합으로 파일을 매칭하세요:

| 패턴 | 매칭 대상 |
| --- | --- |
| `**/*.ts` | 모든 디렉토리의 TypeScript 파일 |
| `src/**/*` | `src/` 디렉토리 아래의 모든 파일 |
| `*.md` | 프로젝트 루트의 마크다운 파일 |
| `src/components/*.tsx` | 특정 디렉토리의 React 컴포넌트 |

여러 패턴을 지정하고 중괄호 확장을 사용하여 하나의 패턴에서 여러 확장자를 매칭할 수 있습니다:

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

#### 심볼릭 링크로 프로젝트 간 규칙 공유

`.claude/rules/` 디렉토리는 심볼릭 링크를 지원하므로, 공유 규칙 세트를 유지하고 여러 프로젝트에 링크할 수 있습니다. 심볼릭 링크는 정상적으로 해석되어 로드되며, 순환 심볼릭 링크는 감지되어 우아하게 처리됩니다.

이 예는 공유 디렉토리와 개별 파일 모두를 링크합니다:

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

#### 사용자 수준 규칙

`~/.claude/rules/`의 개인 규칙은 머신의 모든 프로젝트에 적용됩니다. 프로젝트에 특정하지 않은 선호도에 사용하세요:

```text
~/.claude/rules/
├── preferences.md    # 개인 코딩 선호도
└── workflows.md      # 선호하는 워크플로우
```

사용자 수준 규칙은 프로젝트 규칙보다 먼저 로드되어 프로젝트 규칙에 더 높은 우선순위를 부여합니다.

### 대규모 팀을 위한 CLAUDE.md 관리

팀 전체에 Claude Code를 배포하는 조직의 경우 지침을 중앙 집중화하고 어떤 CLAUDE.md 파일이 로드되는지 제어할 수 있습니다.

#### 조직 전체 CLAUDE.md 배포

조직은 머신의 모든 사용자에게 적용되는 중앙 관리 CLAUDE.md를 배포할 수 있습니다. 이 파일은 개별 설정으로 제외할 수 없습니다.

**1단계: 관리형 정책 위치에 파일 생성**

* macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
* Linux 및 WSL: `/etc/claude-code/CLAUDE.md`
* Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`

**2단계: 구성 관리 시스템으로 배포**

MDM, Group Policy, Ansible 또는 유사한 도구를 사용하여 개발자 머신에 파일을 배포합니다. 다른 조직 전체 구성 옵션은 [관리형 설정](/permissions#managed-settings)을 참조하세요.

관리형 CLAUDE.md와 [관리형 설정](/settings#settings-files)은 다른 목적을 가집니다. 기술적 강제에는 설정을, 동작 안내에는 CLAUDE.md를 사용하세요:

| 관심사 | 구성 위치 |
| :--- | :--- |
| 특정 도구, 명령 또는 파일 경로 차단 | 관리형 설정: `permissions.deny` |
| 샌드박스 격리 강제 | 관리형 설정: `sandbox.enabled` |
| 환경 변수 및 API 제공자 라우팅 | 관리형 설정: `env` |
| 인증 방법 및 조직 잠금 | 관리형 설정: `forceLoginMethod`, `forceLoginOrgUUID` |
| 코드 스타일 및 품질 가이드라인 | 관리형 CLAUDE.md |
| 데이터 처리 및 규정 준수 알림 | 관리형 CLAUDE.md |
| Claude에 대한 동작 지침 | 관리형 CLAUDE.md |

설정 규칙은 Claude의 결정과 관계없이 클라이언트가 강제합니다. CLAUDE.md 지침은 Claude의 동작을 형성하지만 엄격한 강제 계층이 아닙니다.

#### 특정 CLAUDE.md 파일 제외

대규모 모노레포에서 상위 CLAUDE.md 파일에 작업과 관련 없는 지침이 포함될 수 있습니다. `claudeMdExcludes` 설정을 사용하면 경로 또는 glob 패턴으로 특정 파일을 건너뛸 수 있습니다.

이 예는 최상위 CLAUDE.md와 상위 폴더의 규칙 디렉토리를 제외합니다. `.claude/settings.local.json`에 추가하여 제외가 머신에 로컬로 유지되도록 하세요:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

패턴은 glob 구문을 사용하여 절대 파일 경로에 대해 매칭됩니다. `claudeMdExcludes`는 모든 [설정 계층](/settings#settings-files): 사용자, 프로젝트, 로컬 또는 관리형 정책에서 구성할 수 있습니다. 배열은 계층 간에 병합됩니다.

관리형 정책 CLAUDE.md 파일은 제외할 수 없습니다. 이를 통해 개별 설정에 관계없이 조직 전체 지침이 항상 적용되도록 합니다.

## 자동 메모리

자동 메모리를 사용하면 아무것도 작성하지 않고도 Claude가 세션 간에 지식을 축적할 수 있습니다. Claude는 작업하면서 자체적으로 메모를 저장합니다: 빌드 명령, 디버깅 인사이트, 아키텍처 메모, 코드 스타일 선호도 및 워크플로우 습관. Claude는 모든 세션에서 무언가를 저장하지 않습니다. 해당 정보가 향후 대화에서 유용할지 여부에 따라 기억할 가치가 있는 것을 결정합니다.

::: info
자동 메모리는 Claude Code v2.1.59 이상이 필요합니다. `claude --version`으로 버전을 확인하세요.
:::

### 자동 메모리 활성화 또는 비활성화

자동 메모리는 기본적으로 켜져 있습니다. 전환하려면 세션에서 `/memory`를 열고 자동 메모리 토글을 사용하거나, 프로젝트 설정에서 `autoMemoryEnabled`를 설정하세요:

```json
{
  "autoMemoryEnabled": false
}
```

환경 변수를 통해 자동 메모리를 비활성화하려면 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`을 설정하세요.

### 저장 위치

각 프로젝트는 `~/.claude/projects/<project>/memory/`에 자체 메모리 디렉토리를 갖습니다. `<project>` 경로는 git 리포지토리에서 파생되므로, 동일한 리포 내의 모든 worktree와 하위 디렉토리가 하나의 자동 메모리 디렉토리를 공유합니다. git 리포 외부에서는 대신 프로젝트 루트가 사용됩니다.

자동 메모리를 다른 위치에 저장하려면 사용자 또는 로컬 설정에서 `autoMemoryDirectory`를 설정하세요:

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

이 설정은 정책, 로컬 및 사용자 설정에서 허용됩니다. 공유 프로젝트가 자동 메모리 쓰기를 민감한 위치로 리디렉션하는 것을 방지하기 위해 프로젝트 설정(`.claude/settings.json`)에서는 허용되지 않습니다.

디렉토리에는 `MEMORY.md` 엔트리포인트와 선택적 주제 파일이 포함됩니다:

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 간결한 인덱스, 모든 세션에 로드됨
├── debugging.md       # 디버깅 패턴에 대한 상세 메모
├── api-conventions.md # API 디자인 결정
└── ...                # Claude가 만드는 기타 주제 파일
```

`MEMORY.md`는 메모리 디렉토리의 인덱스 역할을 합니다. Claude는 세션 전체에서 이 디렉토리의 파일을 읽고 쓰며, `MEMORY.md`를 사용하여 무엇이 어디에 저장되어 있는지 추적합니다.

자동 메모리는 머신 로컬입니다. 동일한 git 리포지토리 내의 모든 worktree와 하위 디렉토리가 하나의 자동 메모리 디렉토리를 공유합니다. 파일은 머신이나 클라우드 환경 간에 공유되지 않습니다.

### 작동 방식

`MEMORY.md`의 처음 200줄 또는 처음 25KB(둘 중 먼저 도달하는 것)가 모든 대화의 시작 시 로드됩니다. 해당 임계값을 넘는 콘텐츠는 세션 시작 시 로드되지 않습니다. Claude는 상세한 메모를 별도의 주제 파일로 이동하여 `MEMORY.md`를 간결하게 유지합니다.

이 제한은 `MEMORY.md`에만 적용됩니다. CLAUDE.md 파일은 길이에 관계없이 전체가 로드되지만, 짧은 파일이 더 나은 준수도를 생산합니다.

`debugging.md`나 `patterns.md`와 같은 주제 파일은 시작 시 로드되지 않습니다. Claude는 정보가 필요할 때 표준 파일 도구를 사용하여 요청 시 읽습니다.

Claude는 세션 중에 메모리 파일을 읽고 씁니다. Claude Code 인터페이스에서 "Writing memory" 또는 "Recalled memory"가 표시되면 Claude가 `~/.claude/projects/<project>/memory/`에서 활발하게 업데이트하거나 읽고 있는 것입니다.

### 메모리 감사 및 편집

자동 메모리 파일은 언제든지 편집하거나 삭제할 수 있는 일반 마크다운입니다. [`/memory`](#memory로-보기-및-편집)를 실행하여 세션 내에서 메모리 파일을 찾아보고 열 수 있습니다.

## `/memory`로 보기 및 편집

`/memory` 명령은 현재 세션에 로드된 모든 CLAUDE.md, CLAUDE.local.md 및 규칙 파일을 나열하고, 자동 메모리를 켜거나 끌 수 있게 하며, 자동 메모리 폴더를 여는 링크를 제공합니다. 편집기에서 열려면 파일을 선택하세요.

Claude에게 "항상 pnpm을 사용해, npm 말고" 또는 "API 테스트에 로컬 Redis 인스턴스가 필요하다는 것을 기억해"와 같이 무언가를 기억하라고 요청하면, Claude는 자동 메모리에 저장합니다. 대신 CLAUDE.md에 지침을 추가하려면 "이것을 CLAUDE.md에 추가해"와 같이 Claude에게 직접 요청하거나, `/memory`를 통해 파일을 직접 편집하세요.

## 메모리 문제 해결

CLAUDE.md 및 자동 메모리와 관련된 가장 일반적인 문제와 디버그 단계입니다.

### Claude가 CLAUDE.md를 따르지 않음

CLAUDE.md 콘텐츠는 시스템 프롬프트의 일부가 아닌 시스템 프롬프트 뒤에 사용자 메시지로 전달됩니다. Claude는 이를 읽고 따르려고 하지만, 특히 모호하거나 충돌하는 지침의 경우 엄격한 준수가 보장되지 않습니다.

디버그하려면:

* `/memory`를 실행하여 CLAUDE.md 및 CLAUDE.local.md 파일이 로드되고 있는지 확인하세요. 파일이 나열되지 않으면 Claude가 볼 수 없습니다.
* 관련 CLAUDE.md가 세션에 로드되는 위치에 있는지 확인하세요 ([CLAUDE.md 파일 배치 위치 선택](#claude-md-파일-배치-위치-선택) 참조).
* 지침을 더 구체적으로 만드세요. "코드를 깔끔하게 포맷하라"보다 "2칸 들여쓰기를 사용하라"가 더 효과적입니다.
* CLAUDE.md 파일 간 충돌하는 지침을 찾으세요. 두 파일이 같은 동작에 대해 다른 안내를 제공하면 Claude가 임의로 하나를 선택할 수 있습니다.

시스템 프롬프트 수준에서 지침을 원하면 [`--append-system-prompt`](/cli-reference#system-prompt-flags)를 사용하세요. 이것은 매 호출마다 전달해야 하므로 대화형 사용보다는 스크립트와 자동화에 더 적합합니다.

::: tip
[`InstructionsLoaded` 훅](/hooks#instructionsloaded)을 사용하면 어떤 지침 파일이 로드되는지, 언제 로드되는지, 왜 로드되는지를 정확히 로그할 수 있습니다. 이는 경로별 규칙이나 하위 디렉토리의 지연 로드 파일을 디버깅하는 데 유용합니다.
:::

### 자동 메모리가 무엇을 저장했는지 모름

`/memory`를 실행하고 자동 메모리 폴더를 선택하여 Claude가 저장한 내용을 찾아보세요. 모든 것은 읽고, 편집하고, 삭제할 수 있는 일반 마크다운입니다.

### CLAUDE.md가 너무 큼

200줄이 넘는 파일은 더 많은 컨텍스트를 소비하고 준수도를 떨어뜨릴 수 있습니다. 상세한 콘텐츠를 `@path` 임포트로 참조하는 별도의 파일로 이동하거나 ([추가 파일 임포트](#추가-파일-임포트) 참조), `.claude/rules/` 파일로 지침을 분할하세요.

### `/compact` 후 지침이 사라짐

프로젝트 루트 CLAUDE.md는 압축에서 살아남습니다: `/compact` 후 Claude는 디스크에서 다시 읽어 세션에 다시 주입합니다. 하위 디렉토리의 중첩된 CLAUDE.md 파일은 자동으로 다시 주입되지 않으며, Claude가 해당 하위 디렉토리의 파일을 다음에 읽을 때 다시 로드됩니다.

압축 후 지침이 사라졌다면, 대화에서만 제공되었거나 아직 다시 로드되지 않은 중첩된 CLAUDE.md에 있었기 때문입니다. 대화에서만 제공한 지침을 CLAUDE.md에 추가하여 지속되게 하세요. 전체 분석은 [압축 후 유지되는 것](/context-window#what-survives-compaction)을 참조하세요.

크기, 구조 및 구체성에 대한 안내는 [효과적인 지침 작성](#효과적인-지침-작성)을 참조하세요.

## 관련 리소스

* [스킬](/skills): 요청 시 로드되는 반복 가능한 워크플로우 패키지
* [설정](/settings): 설정 파일로 Claude Code 동작 구성
* [서브에이전트 메모리](/sub-agents#enable-persistent-memory): 서브에이전트가 자체 자동 메모리를 유지하도록 설정
