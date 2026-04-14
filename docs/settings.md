---
title: Claude Code 설정
description: 전역 및 프로젝트 수준 설정과 환경 변수로 Claude Code를 구성하세요.
---

# Claude Code 설정

> 전역 및 프로젝트 수준 설정과 환경 변수로 Claude Code를 구성하세요.

Claude Code는 다양한 설정을 통해 동작을 맞춤 구성할 수 있습니다. 대화형 REPL에서 `/config` 명령을 실행하면 탭 형식의 설정 인터페이스가 열리며, 상태 정보를 확인하고 구성 옵션을 수정할 수 있습니다.

## 구성 범위

Claude Code는 **범위 시스템**을 사용하여 구성이 적용되는 위치와 공유 대상을 결정합니다. 범위를 이해하면 개인 사용, 팀 협업, 또는 엔터프라이즈 배포에 맞게 Claude Code를 구성하는 방법을 결정하는 데 도움이 됩니다.

### 사용 가능한 범위

| 범위 | 위치 | 적용 대상 | 팀과 공유? |
| :--- | :--- | :--- | :--- |
| **Managed** | 서버 관리 설정, plist / 레지스트리, 또는 시스템 수준 `managed-settings.json` | 머신의 모든 사용자 | 예 (IT 배포) |
| **User** | `~/.claude/` 디렉토리 | 모든 프로젝트에서 사용자 본인 | 아니요 |
| **Project** | 저장소의 `.claude/` | 이 저장소의 모든 협업자 | 예 (git에 커밋됨) |
| **Local** | `.claude/settings.local.json` | 이 저장소에서 사용자 본인만 | 아니요 (gitignore됨) |

### 각 범위의 사용 시기

**Managed 범위**는 다음에 적합합니다:

* 조직 전체에 적용되어야 하는 보안 정책
* 재정의할 수 없는 컴플라이언스 요구사항
* IT/DevOps가 배포한 표준화된 구성

**User 범위**는 다음에 적합합니다:

* 어디서나 원하는 개인 설정 (테마, 편집기 설정)
* 모든 프로젝트에서 사용하는 도구와 플러그인
* API 키와 인증 (안전하게 저장됨)

**Project 범위**는 다음에 적합합니다:

* 팀 공유 설정 (권한, 훅, MCP 서버)
* 팀 전체가 가져야 할 플러그인
* 협업자 간 도구 표준화

**Local 범위**는 다음에 적합합니다:

* 특정 프로젝트에 대한 개인 재정의
* 팀과 공유하기 전에 구성 테스트
* 다른 사람에게는 적용되지 않는 머신별 설정

### 범위 상호작용 방식

같은 설정이 여러 범위에서 구성된 경우, 더 구체적인 범위가 우선합니다:

1. **Managed** (최고) - 어떤 것으로도 재정의 불가
2. **Command line arguments** - 임시 세션 재정의
3. **Local** - 프로젝트 및 사용자 설정 재정의
4. **Project** - 사용자 설정 재정의
5. **User** (최하) - 다른 설정이 없을 때 적용

예를 들어, 사용자 설정에서 권한이 허용되었지만 프로젝트 설정에서 거부된 경우, 프로젝트 설정이 우선하여 권한이 차단됩니다.

### 범위가 적용되는 항목

범위는 많은 Claude Code 기능에 적용됩니다:

| 기능 | User 위치 | Project 위치 | Local 위치 |
| :--- | :--- | :--- | :--- |
| **Settings** | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| **Subagents** | `~/.claude/agents/` | `.claude/agents/` | 없음 |
| **MCP servers** | `~/.claude.json` | `.mcp.json` | `~/.claude.json` (프로젝트별) |
| **Plugins** | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| **CLAUDE.md** | `~/.claude/CLAUDE.md` | `CLAUDE.md` 또는 `.claude/CLAUDE.md` | `CLAUDE.local.md` |

---

## 설정 파일

`settings.json` 파일은 계층적 설정을 통해 Claude Code를 구성하는 공식 메커니즘입니다:

* **User 설정**은 `~/.claude/settings.json`에 정의되며 모든 프로젝트에 적용됩니다.
* **Project 설정**은 프로젝트 디렉토리에 저장됩니다:
  * `.claude/settings.json`: 소스 컨트롤에 커밋되어 팀과 공유되는 설정
  * `.claude/settings.local.json`: 커밋되지 않는 설정으로, 개인 설정과 실험에 유용합니다. Claude Code는 이 파일이 생성되면 `.claude/settings.local.json`을 git에서 무시하도록 구성합니다.
* **Managed 설정**: 중앙 집중식 제어가 필요한 조직을 위해 Claude Code는 managed 설정에 대한 여러 전달 메커니즘을 지원합니다. 모두 동일한 JSON 형식을 사용하며 사용자나 프로젝트 설정으로 재정의할 수 없습니다:

  * **서버 관리 설정**: Claude.ai 관리자 콘솔을 통해 Anthropic 서버에서 전달됩니다. [서버 관리 설정](/server-managed-settings)을 참조하세요.
  * **MDM/OS 수준 정책**: macOS와 Windows에서 네이티브 장치 관리를 통해 전달됩니다:
    * macOS: `com.anthropic.claudecode` managed preferences 도메인 (Jamf, Iru (Kandji), 또는 기타 MDM 도구의 구성 프로필로 배포)
    * Windows: `HKLM\SOFTWARE\Policies\ClaudeCode` 레지스트리 키에 JSON이 포함된 `Settings` 값 (REG\_SZ 또는 REG\_EXPAND\_SZ) (그룹 정책 또는 Intune으로 배포)
    * Windows (사용자 수준): `HKCU\SOFTWARE\Policies\ClaudeCode` (최하위 정책 우선순위, 관리자 수준 소스가 없을 때만 사용)
  * **파일 기반**: `managed-settings.json`과 `managed-mcp.json`을 시스템 디렉토리에 배포:

    * macOS: `/Library/Application Support/ClaudeCode/`
    * Linux 및 WSL: `/etc/claude-code/`
    * Windows: `C:\Program Files\ClaudeCode\`

    :::warning
    레거시 Windows 경로 `C:\ProgramData\ClaudeCode\managed-settings.json`은 v2.1.75부터 더 이상 지원되지 않습니다. 해당 위치에 설정을 배포한 관리자는 파일을 `C:\Program Files\ClaudeCode\managed-settings.json`으로 마이그레이션해야 합니다.
    :::

    파일 기반 managed 설정은 `managed-settings.json`과 같은 시스템 디렉토리의 `managed-settings.d/` 드롭인 디렉토리도 지원합니다. 이를 통해 별도 팀이 단일 파일 편집을 조율하지 않고도 독립적인 정책 조각을 배포할 수 있습니다.

    systemd 규칙에 따라 `managed-settings.json`이 기본으로 먼저 병합되고, 드롭인 디렉토리의 모든 `*.json` 파일이 알파벳순으로 정렬되어 위에 병합됩니다. 이후 파일이 스칼라 값에 대해 이전 파일을 재정의하며, 배열은 연결 및 중복 제거되고, 객체는 깊게 병합됩니다. `.`으로 시작하는 숨김 파일은 무시됩니다.

    병합 순서를 제어하려면 숫자 접두사를 사용하세요. 예: `10-telemetry.json`, `20-security.json`

  자세한 내용은 [managed 설정](/permissions#managed-only-settings) 및 [Managed MCP 구성](/mcp#managed-mcp-configuration)을 참조하세요.

  이 [저장소](https://github.com/anthropics/claude-code/tree/main/examples/mdm)에는 Jamf, Iru (Kandji), Intune, 그룹 정책을 위한 스타터 배포 템플릿이 포함되어 있습니다. 이를 시작점으로 사용하여 필요에 맞게 조정하세요.

  :::info
  Managed 배포는 `strictKnownMarketplaces`를 사용하여 **플러그인 마켓플레이스 추가**를 제한할 수도 있습니다. 자세한 내용은 [Managed 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions)을 참조하세요.
  :::

* **기타 구성**은 `~/.claude.json`에 저장됩니다. 이 파일에는 기본 설정 (테마, 알림 설정, 편집기 모드), OAuth 세션, 사용자 및 로컬 범위의 [MCP 서버](/mcp) 구성, 프로젝트별 상태 (허용된 도구, 신뢰 설정) 및 다양한 캐시가 포함됩니다. 프로젝트 범위 MCP 서버는 `.mcp.json`에 별도로 저장됩니다.

:::info
Claude Code는 구성 파일의 타임스탬프 백업을 자동으로 생성하고 데이터 손실 방지를 위해 가장 최근 5개의 백업을 보관합니다.
:::

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },
  "companyAnnouncements": [
    "Welcome to Acme Corp! Review our code guidelines at docs.acme.com",
    "Reminder: Code reviews required for all PRs",
    "New security policy in effect"
  ]
}
```

위 예시의 `$schema` 줄은 Claude Code 설정의 [공식 JSON 스키마](https://json.schemastore.org/claude-code-settings.json)를 가리킵니다. 이를 `settings.json`에 추가하면 VS Code, Cursor 및 JSON 스키마 유효성 검사를 지원하는 다른 편집기에서 자동완성과 인라인 유효성 검사가 활성화됩니다.

### 사용 가능한 설정

`settings.json`은 다음 옵션들을 지원합니다:

| 키 | 설명 | 예시 |
| :--- | :--- | :--- |
| `agent` | 메인 스레드를 명명된 서브에이전트로 실행합니다. 해당 서브에이전트의 시스템 프롬프트, 도구 제한, 모델을 적용합니다. [서브에이전트 명시적 호출](/sub-agents#invoke-subagents-explicitly) 참조 | `"code-reviewer"` |
| `allowedChannelPlugins` | (Managed 설정 전용) 메시지를 전송할 수 있는 채널 플러그인의 허용 목록입니다. 설정되면 기본 Anthropic 허용 목록을 대체합니다. 미정의 = 기본값으로 폴백, 빈 배열 = 모든 채널 플러그인 차단. `channelsEnabled: true` 필요. [채널 플러그인 실행 제한](/channels#restrict-which-channel-plugins-can-run) 참조 | `[{ "marketplace": "claude-plugins-official", "plugin": "telegram" }]` |
| `allowedHttpHookUrls` | HTTP 훅이 대상으로 할 수 있는 URL 패턴의 허용 목록입니다. `*`를 와일드카드로 지원합니다. 설정되면 일치하지 않는 URL의 훅이 차단됩니다. 미정의 = 제한 없음, 빈 배열 = 모든 HTTP 훅 차단. 배열은 설정 소스 간에 병합됩니다. [훅 구성](#hook-configuration) 참조 | `["https://hooks.example.com/*"]` |
| `allowedMcpServers` | managed-settings.json에 설정되면 사용자가 구성할 수 있는 MCP 서버의 허용 목록입니다. 미정의 = 제한 없음, 빈 배열 = 잠금. 모든 범위에 적용됩니다. 거부 목록이 우선합니다. [Managed MCP 구성](/mcp#managed-mcp-configuration) 참조 | `[{ "serverName": "github" }]` |
| `allowManagedHooksOnly` | (Managed 설정 전용) managed 훅, SDK 훅, managed 설정 `enabledPlugins`에서 강제 활성화된 플러그인의 훅만 로드됩니다. 사용자, 프로젝트 및 기타 모든 플러그인 훅은 차단됩니다. [훅 구성](#hook-configuration) 참조 | `true` |
| `allowManagedMcpServersOnly` | (Managed 설정 전용) managed 설정의 `allowedMcpServers`만 적용됩니다. `deniedMcpServers`는 모든 소스에서 병합됩니다. 사용자는 여전히 MCP 서버를 추가할 수 있지만 관리자가 정의한 허용 목록만 적용됩니다. [Managed MCP 구성](/mcp#managed-mcp-configuration) 참조 | `true` |
| `allowManagedPermissionRulesOnly` | (Managed 설정 전용) 사용자와 프로젝트 설정이 `allow`, `ask`, 또는 `deny` 권한 규칙을 정의하는 것을 방지합니다. managed 설정의 규칙만 적용됩니다. [Managed 전용 설정](/permissions#managed-only-settings) 참조 | `true` |
| `alwaysThinkingEnabled` | 모든 세션에 대해 기본적으로 [확장 사고](/common-workflows#use-extended-thinking-thinking-mode)를 활성화합니다. 일반적으로 직접 편집보다 `/config` 명령으로 구성합니다 | `true` |
| `apiKeyHelper` | 인증 값을 생성하기 위해 `/bin/sh`에서 실행되는 커스텀 스크립트입니다. 이 값은 모델 요청에 `X-Api-Key` 및 `Authorization: Bearer` 헤더로 전송됩니다 | `/bin/generate_temp_api_key.sh` |
| `attribution` | git 커밋과 풀 리퀘스트에 대한 기여 표시를 사용자 지정합니다. [기여 설정](#attribution-settings) 참조 | `{"commit": "🤖 Generated with Claude Code", "pr": ""}` |
| `autoMemoryDirectory` | [자동 메모리](/memory#storage-location) 저장을 위한 커스텀 디렉토리입니다. `~/`로 확장되는 경로를 허용합니다. 공유 저장소가 민감한 위치로 메모리 쓰기를 리다이렉트하는 것을 방지하기 위해 프로젝트 설정(`.claude/settings.json`)에서는 허용되지 않습니다. 정책, 로컬, 사용자 설정에서 허용됩니다 | `"~/my-memory-dir"` |
| `autoMode` | [자동 모드](/permission-modes#eliminate-prompts-with-auto-mode) 분류기가 차단하고 허용하는 항목을 사용자 지정합니다. `environment`, `allow`, `soft_deny` 배열의 산문 규칙을 포함합니다. [자동 모드 분류기 구성](/permissions#configure-the-auto-mode-classifier) 참조. 공유 프로젝트 설정에서는 읽지 않습니다 | `{"environment": ["Trusted repo: github.example.com/acme"]}` |
| `autoUpdatesChannel` | 업데이트를 따르는 릴리스 채널입니다. 일반적으로 약 1주일 된 버전으로 주요 회귀가 있는 버전을 건너뛰는 `"stable"` 또는 가장 최신 릴리스를 위한 `"latest"` (기본값)를 사용합니다 | `"stable"` |
| `availableModels` | 사용자가 `/model`, `--model`, Config 도구, 또는 `ANTHROPIC_MODEL`을 통해 선택할 수 있는 모델을 제한합니다. Default 옵션에는 영향을 주지 않습니다. [모델 선택 제한](/model-config#restrict-model-selection) 참조 | `["sonnet", "haiku"]` |
| `awsAuthRefresh` | `.aws` 디렉토리를 수정하는 커스텀 스크립트입니다 ([고급 자격 증명 구성](/amazon-bedrock#advanced-credential-configuration) 참조) | `aws sso login --profile myprofile` |
| `awsCredentialExport` | AWS 자격 증명이 포함된 JSON을 출력하는 커스텀 스크립트입니다 ([고급 자격 증명 구성](/amazon-bedrock#advanced-credential-configuration) 참조) | `/bin/generate_aws_grant.sh` |
| `blockedMarketplaces` | (Managed 설정 전용) 마켓플레이스 소스의 차단 목록입니다. 차단된 소스는 다운로드 전에 확인되므로 파일시스템에 접촉하지 않습니다. [Managed 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions) 참조 | `[{ "source": "github", "repo": "untrusted/plugins" }]` |
| `channelsEnabled` | (Managed 설정 전용) Team 및 Enterprise 사용자를 위한 [채널](/channels)을 허용합니다. 미설정 또는 `false`이면 사용자가 `--channels`에 전달하는 내용에 상관없이 채널 메시지 전달이 차단됩니다 | `true` |
| `cleanupPeriodDays` | 이 기간보다 오래된 세션 파일은 시작 시 삭제됩니다 (기본값: 30일, 최소 1). `0`으로 설정하면 유효성 검사 오류가 발생합니다. 시작 시 [고아 서브에이전트 워크트리](/common-workflows#worktree-cleanup) 자동 제거에 대한 기간도 제어합니다. 비대화형 모드(`-p`)에서 트랜스크립트 쓰기를 완전히 비활성화하려면 `--no-session-persistence` 플래그 또는 `persistSession: false` SDK 옵션을 사용하세요 | `20` |
| `companyAnnouncements` | 시작 시 사용자에게 표시할 공지사항입니다. 여러 공지사항이 제공되면 무작위로 순환됩니다 | `["Welcome to Acme Corp! Review our code guidelines at docs.acme.com"]` |
| `defaultShell` | 입력 박스 `!` 명령의 기본 셸입니다. `"bash"` (기본값) 또는 `"powershell"`을 허용합니다. `"powershell"`을 설정하면 Windows에서 대화형 `!` 명령이 PowerShell을 통해 라우팅됩니다. `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` 필요. [PowerShell 도구](/tools-reference#powershell-tool) 참조 | `"powershell"` |
| `deniedMcpServers` | managed-settings.json에 설정되면 명시적으로 차단된 MCP 서버의 거부 목록입니다. managed 서버를 포함한 모든 범위에 적용됩니다. 거부 목록이 허용 목록보다 우선합니다. [Managed MCP 구성](/mcp#managed-mcp-configuration) 참조 | `[{ "serverName": "filesystem" }]` |
| `disableAllHooks` | 모든 [훅](/hooks)과 커스텀 [상태 표시줄](/statusline)을 비활성화합니다 | `true` |
| `disableAutoMode` | [자동 모드](/permission-modes#eliminate-prompts-with-auto-mode)가 활성화되는 것을 방지하려면 `"disable"`로 설정합니다. `Shift+Tab` 순환에서 `auto`를 제거하고 시작 시 `--permission-mode auto`를 거부합니다. 사용자가 재정의할 수 없는 [managed 설정](/permissions#managed-settings)에서 가장 유용합니다 | `"disable"` |
| `disableDeepLinkRegistration` | 시작 시 Claude Code가 운영 체제에 `claude-cli://` 프로토콜 핸들러를 등록하는 것을 방지하려면 `"disable"`로 설정합니다. 딥 링크는 외부 도구가 `claude-cli://open?q=...`를 통해 미리 채워진 프롬프트로 Claude Code 세션을 열 수 있게 합니다. `q` 파라미터는 URL 인코딩된 줄 바꿈(`%0A`)을 사용하는 여러 줄 프롬프트를 지원합니다. 프로토콜 핸들러 등록이 제한되거나 별도로 관리되는 환경에서 유용합니다 | `"disable"` |
| `disabledMcpjsonServers` | `.mcp.json` 파일에서 거부할 특정 MCP 서버 목록입니다 | `["filesystem"]` |
| `disableSkillShellExecution` | 사용자, 프로젝트, 플러그인, 또는 추가 디렉토리 소스의 [스킬](/skills) 및 커스텀 명령에서 `` !`...` `` 및 ` ```! ` 블록에 대한 인라인 셸 실행을 비활성화합니다. 명령은 실행되는 대신 `[shell command execution disabled by policy]`로 대체됩니다. 번들 및 managed 스킬은 영향을 받지 않습니다. 사용자가 재정의할 수 없는 [managed 설정](/permissions#managed-settings)에서 가장 유용합니다 | `true` |
| `effortLevel` | 세션 간에 [노력 수준](/model-config#adjust-effort-level)을 유지합니다. `"low"`, `"medium"`, 또는 `"high"`를 허용합니다. `/effort low`, `/effort medium`, 또는 `/effort high`를 실행하면 자동으로 작성됩니다. Opus 4.6 및 Sonnet 4.6에서 지원됩니다 | `"medium"` |
| `enableAllProjectMcpServers` | 프로젝트 `.mcp.json` 파일에 정의된 모든 MCP 서버를 자동으로 승인합니다 | `true` |
| `enabledMcpjsonServers` | `.mcp.json` 파일에서 승인할 특정 MCP 서버 목록입니다 | `["memory", "github"]` |
| `env` | 모든 세션에 적용될 환경 변수입니다 | `{"FOO": "bar"}` |
| `fastModePerSessionOptIn` | `true`이면 빠른 모드가 세션 간에 유지되지 않습니다. 각 세션은 빠른 모드가 꺼진 상태로 시작되며, 사용자가 `/fast`로 활성화해야 합니다. 사용자의 빠른 모드 설정은 여전히 저장됩니다. [세션별 선택 요구](/fast-mode#require-per-session-opt-in) 참조 | `true` |
| `feedbackSurveyRate` | 적격 시 [세션 품질 설문](/data-usage#session-quality-surveys)이 표시될 확률(0–1)입니다. 완전히 억제하려면 `0`으로 설정합니다. 기본 샘플 비율이 적용되지 않는 Bedrock, Vertex, 또는 Foundry를 사용할 때 유용합니다 | `0.05` |
| `fileSuggestion` | `@` 파일 자동완성에 대한 커스텀 스크립트를 구성합니다. [파일 제안 설정](#file-suggestion-settings) 참조 | `{"type": "command", "command": "~/.claude/file-suggestion.sh"}` |
| `forceLoginMethod` | Claude.ai 계정으로만 로그인을 제한하려면 `claudeai`, Claude Console (API 사용 청구) 계정으로만 제한하려면 `console`을 사용합니다 | `claudeai` |
| `forceLoginOrgUUID` | 로그인이 특정 조직에 속하도록 요구합니다. 단일 UUID 문자열을 허용하여 로그인 시 해당 조직을 미리 선택하거나, 나열된 조직이 미리 선택 없이 허용되는 UUID 배열을 허용합니다. managed 설정에 설정되면 인증된 계정이 나열된 조직에 속하지 않는 경우 로그인이 실패합니다. 빈 배열은 실패로 닫히고 잘못된 구성 메시지와 함께 로그인을 차단합니다 | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` 또는 `["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"]` |
| `forceRemoteSettingsRefresh` | (Managed 설정 전용) 서버에서 원격 managed 설정이 새로 가져올 때까지 CLI 시작을 차단합니다. 가져오기가 실패하면 CLI는 캐시된 설정이나 설정 없이 계속하는 대신 종료합니다. 설정되지 않으면 원격 설정을 기다리지 않고 시작이 계속됩니다. [실패 폐쇄 적용](/server-managed-settings#enforce-fail-closed-startup) 참조 | `true` |
| `hooks` | 수명주기 이벤트에서 실행할 커스텀 명령을 구성합니다. 형식은 [훅 문서](/hooks)를 참조하세요 | [훅](/hooks) 참조 |
| `httpHookAllowedEnvVars` | HTTP 훅이 헤더에 삽입할 수 있는 환경 변수 이름의 허용 목록입니다. 설정되면 각 훅의 유효한 `allowedEnvVars`는 이 목록과의 교집합입니다. 미정의 = 제한 없음. 배열은 설정 소스 간에 병합됩니다. [훅 구성](#hook-configuration) 참조 | `["MY_TOKEN", "HOOK_SECRET"]` |
| `includeCoAuthoredBy` | **사용 중단**: 대신 `attribution`을 사용하세요. git 커밋과 풀 리퀘스트에 `co-authored-by Claude` 바이라인을 포함할지 여부입니다 (기본값: `true`) | `false` |
| `includeGitInstructions` | Claude의 시스템 프롬프트에 내장된 커밋 및 PR 워크플로 지침과 git 상태 스냅샷을 포함합니다 (기본값: `true`). 예를 들어 자체 git 워크플로 스킬을 사용할 때 둘 다 제거하려면 `false`로 설정합니다. `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` 환경 변수는 설정되면 이 설정보다 우선합니다 | `false` |
| `language` | Claude의 기본 응답 언어를 구성합니다 (예: `"japanese"`, `"spanish"`, `"french"`). Claude는 기본적으로 이 언어로 응답합니다. [음성 받아쓰기](/voice-dictation#change-the-dictation-language) 언어도 설정합니다 | `"japanese"` |
| `model` | Claude Code에 사용할 기본 모델을 재정의합니다 | `"claude-sonnet-4-6"` |
| `modelOverrides` | Anthropic 모델 ID를 Bedrock 추론 프로필 ARN과 같은 공급자별 모델 ID에 매핑합니다. 각 모델 선택기 항목은 공급자 API를 호출할 때 매핑된 값을 사용합니다. [버전별 모델 ID 재정의](/model-config#override-model-ids-per-version) 참조 | `{"claude-opus-4-6": "arn:aws:bedrock:..."}` |
| `otelHeadersHelper` | 동적 OpenTelemetry 헤더를 생성하는 스크립트입니다. 시작 시 및 주기적으로 실행됩니다 ([동적 헤더](/monitoring-usage#dynamic-headers) 참조) | `/bin/generate_otel_headers.sh` |
| `outputStyle` | 시스템 프롬프트를 조정하는 출력 스타일을 구성합니다. [출력 스타일 문서](/output-styles) 참조 | `"Explanatory"` |
| `permissions` | 권한 구조에 대해서는 아래 표를 참조하세요 | |
| `plansDirectory` | 계획 파일이 저장되는 위치를 사용자 지정합니다. 경로는 프로젝트 루트에 상대적입니다. 기본값: `~/.claude/plans` | `"./plans"` |
| `pluginTrustMessage` | (Managed 설정 전용) 설치 전에 표시되는 플러그인 신뢰 경고에 추가되는 커스텀 메시지입니다. 내부 마켓플레이스의 플러그인이 검토되었음을 확인하는 등 조직별 컨텍스트를 추가하는 데 사용합니다 | `"All plugins from our marketplace are approved by IT"` |
| `prefersReducedMotion` | 접근성을 위해 UI 애니메이션 (스피너, 시머, 플래시 효과)을 줄이거나 비활성화합니다 | `true` |
| `respectGitignore` | `@` 파일 선택기가 `.gitignore` 패턴을 따를지 제어합니다. `true` (기본값)이면 `.gitignore` 패턴과 일치하는 파일이 제안에서 제외됩니다 | `false` |
| `showClearContextOnPlanAccept` | 계획 수락 화면에 "컨텍스트 지우기" 옵션을 표시합니다. 기본값은 `false`입니다. 옵션을 복원하려면 `true`로 설정합니다 | `true` |
| `showThinkingSummaries` | 대화형 세션에서 [확장 사고](/common-workflows#use-extended-thinking-thinking-mode) 요약을 표시합니다. 미설정 또는 `false` (대화형 모드 기본값)이면 사고 블록이 API에 의해 편집되어 축소된 스텁으로 표시됩니다. 편집은 표시되는 내용만 변경하며 모델이 생성하는 내용은 변경하지 않습니다. 사고 비용을 줄이려면 [예산을 낮추거나 사고를 비활성화](/common-workflows#use-extended-thinking-thinking-mode)하세요. 비대화형 모드(`-p`)와 SDK 호출자는 이 설정에 상관없이 항상 요약을 받습니다 | `true` |
| `spinnerTipsEnabled` | Claude가 작업하는 동안 스피너에 팁을 표시합니다. 팁을 비활성화하려면 `false`로 설정합니다 (기본값: `true`) | `false` |
| `spinnerTipsOverride` | 스피너 팁을 커스텀 문자열로 재정의합니다. `tips`: 팁 문자열 배열. `excludeDefault`: `true`이면 커스텀 팁만 표시, `false` 또는 없으면 커스텀 팁이 기본 팁과 병합됩니다 | `{ "excludeDefault": true, "tips": ["Use our internal tool X"] }` |
| `spinnerVerbs` | 스피너와 턴 지속 시간 메시지에 표시되는 동작 동사를 사용자 지정합니다. `mode`를 `"replace"`로 설정하면 사용자의 동사만 사용하고, `"append"`로 설정하면 기본값에 추가합니다 | `{"mode": "append", "verbs": ["Pondering", "Crafting"]}` |
| `statusLine` | 컨텍스트를 표시하는 커스텀 상태 표시줄을 구성합니다. [`statusLine` 문서](/statusline) 참조 | `{"type": "command", "command": "~/.claude/statusline.sh"}` |
| `strictKnownMarketplaces` | (Managed 설정 전용) 사용자가 추가할 수 있는 플러그인 마켓플레이스의 허용 목록입니다. 미정의 = 제한 없음, 빈 배열 = 잠금. 마켓플레이스 추가에만 적용됩니다. [Managed 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions) 참조 | `[{ "source": "github", "repo": "acme-corp/plugins" }]` |
| `useAutoModeDuringPlan` | 자동 모드가 사용 가능할 때 계획 모드가 자동 모드 의미론을 사용할지 여부입니다. 기본값: `true`. 공유 프로젝트 설정에서는 읽지 않습니다. `/config`에서 "계획 중 자동 모드 사용"으로 표시됩니다 | `false` |
| `viewMode` | 시작 시 기본 트랜스크립트 뷰 모드: `"default"`, `"verbose"`, 또는 `"focus"`. 설정되면 고정된 Ctrl+O 선택을 재정의합니다 | `"verbose"` |
| `voiceEnabled` | 푸시-투-톡 [음성 받아쓰기](/voice-dictation)를 활성화합니다. `/voice`를 실행하면 자동으로 작성됩니다. Claude.ai 계정 필요 | `true` |

### 전역 구성 설정

이 설정들은 `settings.json`이 아닌 `~/.claude.json`에 저장됩니다. `settings.json`에 추가하면 스키마 유효성 검사 오류가 발생합니다.

| 키 | 설명 | 예시 |
| :--- | :--- | :--- |
| `autoConnectIde` | 외부 터미널에서 Claude Code가 시작될 때 실행 중인 IDE에 자동으로 연결합니다. 기본값: `false`. VS Code 또는 JetBrains 터미널 외부에서 실행 시 `/config`에서 **외부 터미널에서 IDE에 자동 연결**로 표시됩니다 | `true` |
| `autoInstallIdeExtension` | VS Code 터미널에서 실행 시 Claude Code IDE 확장을 자동으로 설치합니다. 기본값: `true`. VS Code 또는 JetBrains 터미널 내부에서 실행 시 `/config`에서 **IDE 확장 자동 설치**로 표시됩니다. [`CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL`](/env-vars) 환경 변수도 설정할 수 있습니다 | `false` |
| `editorMode` | 입력 프롬프트의 키 바인딩 모드: `"normal"` 또는 `"vim"`. 기본값: `"normal"`. `/config`에서 **편집기 모드**로 표시됩니다 | `"vim"` |
| `showTurnDuration` | 응답 후 턴 지속 시간 메시지를 표시합니다. 예: "1m 6s 동안 조리". 기본값: `true`. `/config`에서 **턴 지속 시간 표시**로 표시됩니다 | `false` |
| `terminalProgressBarEnabled` | 지원되는 터미널에서 터미널 진행 표시줄을 표시합니다: ConEmu, Ghostty 1.2.0+, iTerm2 3.6.6+. 기본값: `true`. `/config`에서 **터미널 진행 표시줄**로 표시됩니다 | `false` |
| `teammateMode` | [에이전트 팀](/agent-teams) 동료가 표시되는 방식: `auto` (tmux 또는 iTerm2에서 분할 창 선택, 그렇지 않으면 in-process), `in-process`, 또는 `tmux`. [표시 모드 선택](/agent-teams#choose-a-display-mode) 참조 | `"in-process"` |

### 워크트리 설정

`--worktree`가 git 워크트리를 만들고 관리하는 방법을 구성합니다. 대형 모노레포에서 디스크 사용량과 시작 시간을 줄이려면 이 설정을 사용합니다.

| 키 | 설명 | 예시 |
| :--- | :--- | :--- |
| `worktree.symlinkDirectories` | 디스크에 대형 디렉토리를 복제하지 않으려면 메인 저장소에서 각 워크트리로 심볼릭 링크할 디렉토리입니다. 기본적으로 심볼릭 링크되는 디렉토리는 없습니다 | `["node_modules", ".cache"]` |
| `worktree.sparsePaths` | git sparse-checkout(콘 모드)을 통해 각 워크트리에서 체크아웃할 디렉토리입니다. 나열된 경로만 디스크에 기록되어 대형 모노레포에서 더 빠릅니다 | `["packages/my-app", "shared/utils"]` |

`.env`와 같이 gitignore된 파일을 새 워크트리에 복사하려면 설정 대신 프로젝트 루트에 [`.worktreeinclude` 파일](/common-workflows#copy-gitignored-files-to-worktrees)을 사용하세요.

### 권한 설정

| 키 | 설명 | 예시 |
| :--- | :--- | :--- |
| `allow` | 도구 사용을 허용하는 권한 규칙 배열입니다. 패턴 매칭 세부 사항은 아래 [권한 규칙 구문](#permission-rule-syntax)을 참조하세요 | `[ "Bash(git diff *)" ]` |
| `ask` | 도구 사용 시 확인을 요청하는 권한 규칙 배열입니다. [권한 규칙 구문](#permission-rule-syntax) 참조 | `[ "Bash(git push *)" ]` |
| `deny` | 도구 사용을 거부하는 권한 규칙 배열입니다. 민감한 파일에 대한 Claude Code 접근을 제외하는 데 사용합니다. [권한 규칙 구문](#permission-rule-syntax) 및 [Bash 권한 제한](/permissions#tool-specific-permission-rules) 참조 | `[ "WebFetch", "Bash(curl *)", "Read(./.env)", "Read(./secrets/**)" ]` |
| `additionalDirectories` | 파일 접근을 위한 추가 [작업 디렉토리](/permissions#working-directories)입니다. 대부분의 `.claude/` 구성은 이 디렉토리에서 [검색되지 않습니다](/permissions#additional-directories-grant-file-access-not-configuration) | `[ "../docs/" ]` |
| `defaultMode` | Claude Code를 열 때의 기본 [권한 모드](/permission-modes)입니다. 유효한 값: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`. `--permission-mode` CLI 플래그는 단일 세션에 대해 이 설정을 재정의합니다 | `"acceptEdits"` |
| `disableBypassPermissionsMode` | `bypassPermissions` 모드가 활성화되는 것을 방지하려면 `"disable"`로 설정합니다. `--dangerously-skip-permissions` 명령줄 플래그를 비활성화합니다. 조직 정책을 적용하기 위해 일반적으로 [managed 설정](/permissions#managed-settings)에 배치되지만 모든 범위에서 작동합니다 | `"disable"` |
| `skipDangerousModePermissionPrompt` | `--dangerously-skip-permissions` 또는 `defaultMode: "bypassPermissions"`를 통해 권한 우회 모드에 진입하기 전에 표시되는 확인 프롬프트를 건너뜁니다. 신뢰할 수 없는 저장소가 프롬프트를 자동 우회하는 것을 방지하기 위해 프로젝트 설정(`.claude/settings.json`)에 설정되면 무시됩니다 | `true` |

### 권한 규칙 구문

권한 규칙은 `Tool` 또는 `Tool(specifier)` 형식을 따릅니다. 규칙은 순서대로 평가됩니다: 거부 규칙 먼저, 그 다음 ask, 그 다음 allow. 첫 번째 일치 규칙이 적용됩니다.

빠른 예시:

| 규칙 | 효과 |
| :--- | :--- |
| `Bash` | 모든 Bash 명령과 일치 |
| `Bash(npm run *)` | `npm run`으로 시작하는 명령과 일치 |
| `Read(./.env)` | `.env` 파일 읽기와 일치 |
| `WebFetch(domain:example.com)` | example.com에 대한 fetch 요청과 일치 |

와일드카드 동작, Read, Edit, WebFetch, MCP, Agent 규칙에 대한 도구별 패턴, Bash 패턴의 보안 제한을 포함한 완전한 규칙 구문 참조는 [권한 규칙 구문](/permissions#permission-rule-syntax)을 참조하세요.

### 샌드박스 설정

고급 샌드박싱 동작을 구성합니다. 샌드박싱은 bash 명령을 파일시스템과 네트워크로부터 격리합니다. 자세한 내용은 [샌드박싱](/sandboxing)을 참조하세요.

| 키 | 설명 | 예시 |
| :--- | :--- | :--- |
| `enabled` | bash 샌드박싱을 활성화합니다 (macOS, Linux, WSL2). 기본값: false | `true` |
| `failIfUnavailable` | `sandbox.enabled`가 true이지만 샌드박스를 시작할 수 없는 경우 (종속성 누락, 지원되지 않는 플랫폼, 플랫폼 제한) 시작 시 오류와 함께 종료합니다. false (기본값)이면 경고가 표시되고 명령이 샌드박스 없이 실행됩니다. 샌드박싱을 하드 게이트로 요구하는 managed 설정 배포를 위한 것입니다 | `true` |
| `autoAllowBashIfSandboxed` | 샌드박스된 경우 bash 명령을 자동 승인합니다. 기본값: true | `true` |
| `excludedCommands` | 샌드박스 외부에서 실행되어야 하는 명령입니다 | `["docker *"]` |
| `allowUnsandboxedCommands` | `dangerouslyDisableSandbox` 파라미터를 통해 샌드박스 외부에서 명령이 실행되도록 허용합니다. `false`로 설정하면 `dangerouslyDisableSandbox` 탈출구가 완전히 비활성화되고 모든 명령은 샌드박스로 실행되거나 `excludedCommands`에 있어야 합니다. 엄격한 샌드박싱을 요구하는 엔터프라이즈 정책에 유용합니다. 기본값: true | `false` |
| `filesystem.allowWrite` | 샌드박스된 명령이 쓸 수 있는 추가 경로입니다. 배열은 모든 설정 범위에서 병합됩니다: 사용자, 프로젝트, managed 경로가 결합되며 대체되지 않습니다. `Edit(...)` 허용 권한 규칙의 경로와도 병합됩니다. 아래 [경로 접두사](#sandbox-path-prefixes) 참조 | `["/tmp/build", "~/.kube"]` |
| `filesystem.denyWrite` | 샌드박스된 명령이 쓸 수 없는 경로입니다. 배열은 모든 설정 범위에서 병합됩니다. `Edit(...)` 거부 권한 규칙의 경로와도 병합됩니다 | `["/etc", "/usr/local/bin"]` |
| `filesystem.denyRead` | 샌드박스된 명령이 읽을 수 없는 경로입니다. 배열은 모든 설정 범위에서 병합됩니다. `Read(...)` 거부 권한 규칙의 경로와도 병합됩니다 | `["~/.aws/credentials"]` |
| `filesystem.allowRead` | `denyRead` 영역 내에서 읽기를 다시 허용할 경로입니다. `denyRead`보다 우선합니다. 배열은 모든 설정 범위에서 병합됩니다. 작업공간 전용 읽기 접근 패턴을 만드는 데 사용합니다 | `["."]` |
| `filesystem.allowManagedReadPathsOnly` | (Managed 설정 전용) managed 설정의 `filesystem.allowRead` 경로만 적용됩니다. `denyRead`는 여전히 모든 소스에서 병합됩니다. 기본값: false | `true` |
| `network.allowUnixSockets` | 샌드박스에서 접근 가능한 Unix 소켓 경로 (SSH 에이전트 등을 위해) | `["~/.ssh/agent-socket"]` |
| `network.allowAllUnixSockets` | 샌드박스에서 모든 Unix 소켓 연결을 허용합니다. 기본값: false | `true` |
| `network.allowLocalBinding` | localhost 포트에 대한 바인딩을 허용합니다 (macOS만). 기본값: false | `true` |
| `network.allowMachLookup` | 샌드박스가 조회할 수 있는 추가 XPC/Mach 서비스 이름입니다 (macOS만). 접두사 매칭을 위해 단일 후행 `*`를 지원합니다. iOS 시뮬레이터나 Playwright처럼 XPC를 통해 통신하는 도구에 필요합니다 | `["com.apple.coresimulator.*"]` |
| `network.allowedDomains` | 아웃바운드 네트워크 트래픽을 허용할 도메인 배열입니다. 와일드카드를 지원합니다 (예: `*.example.com`) | `["github.com", "*.npmjs.org"]` |
| `network.allowManagedDomainsOnly` | (Managed 설정 전용) managed 설정의 `allowedDomains`와 `WebFetch(domain:...)` 허용 규칙만 적용됩니다. 사용자, 프로젝트, 로컬 설정의 도메인은 무시됩니다. 허용되지 않은 도메인은 사용자에게 프롬프트 없이 자동으로 차단됩니다. 거부된 도메인은 여전히 모든 소스에서 적용됩니다. 기본값: false | `true` |
| `network.httpProxyPort` | 자체 프록시를 사용하려는 경우 사용되는 HTTP 프록시 포트입니다. 지정하지 않으면 Claude가 자체 프록시를 실행합니다 | `8080` |
| `network.socksProxyPort` | 자체 프록시를 사용하려는 경우 사용되는 SOCKS5 프록시 포트입니다. 지정하지 않으면 Claude가 자체 프록시를 실행합니다 | `8081` |
| `enableWeakerNestedSandbox` | 권한 없는 Docker 환경을 위한 약한 샌드박스를 활성화합니다 (Linux 및 WSL2만). **보안이 약화됩니다.** 기본값: false | `true` |
| `enableWeakerNetworkIsolation` | (macOS만) 샌드박스에서 시스템 TLS 신뢰 서비스(`com.apple.trustd.agent`)에 대한 접근을 허용합니다. MITM 프록시와 커스텀 CA가 있는 `httpProxyPort`를 사용할 때 `gh`, `gcloud`, `terraform`과 같은 Go 기반 도구가 TLS 인증서를 검증하는 데 필요합니다. **잠재적 데이터 유출 경로를 열어 보안이 약화됩니다.** 기본값: false | `true` |

#### 샌드박스 경로 접두사 {#sandbox-path-prefixes}

`filesystem.allowWrite`, `filesystem.denyWrite`, `filesystem.denyRead`, `filesystem.allowRead`의 경로는 다음 접두사를 지원합니다:

| 접두사 | 의미 | 예시 |
| :--- | :--- | :--- |
| `/` | 파일시스템 루트에서의 절대 경로 | `/tmp/build`은 `/tmp/build`로 유지됨 |
| `~/` | 홈 디렉토리에 상대적 | `~/.kube`는 `$HOME/.kube`로 변환됨 |
| `./` 또는 접두사 없음 | 프로젝트 설정은 프로젝트 루트에 상대적, 사용자 설정은 `~/.claude`에 상대적 | `.claude/settings.json`의 `./output`은 `<project-root>/output`으로 해석됨 |

이전 `//path` 접두사는 절대 경로에 대해 여전히 작동합니다. 이전에 프로젝트 상대 해석을 기대하며 단일 슬래시 `/path`를 사용했다면 `./path`로 전환하세요. 이 구문은 절대 경로에 `//path`를 사용하고 프로젝트 상대 경로에 `/path`를 사용하는 [Read 및 Edit 권한 규칙](/permissions#read-and-edit)과 다릅니다. 샌드박스 파일시스템 경로는 표준 규칙을 사용합니다: `/tmp/build`는 절대 경로입니다.

**구성 예시:**

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker *"],
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"],
      "allowUnixSockets": [
        "/var/run/docker.sock"
      ],
      "allowLocalBinding": true
    }
  }
}
```

**파일시스템 및 네트워크 제한**은 함께 병합되는 두 가지 방법으로 구성할 수 있습니다:

* **`sandbox.filesystem` 설정** (위 참조): OS 수준 샌드박스 경계에서 경로를 제어합니다. 이 제한은 Claude의 파일 도구만이 아니라 모든 서브프로세스 명령 (예: `kubectl`, `terraform`, `npm`)에 적용됩니다.
* **권한 규칙**: `Edit` 허용/거부 규칙을 사용하여 Claude의 파일 도구 접근을 제어하고, `Read` 거부 규칙으로 읽기를 차단하며, `WebFetch` 허용/거부 규칙으로 네트워크 도메인을 제어합니다. 이 규칙의 경로도 샌드박스 구성에 병합됩니다.

### 기여 설정 {#attribution-settings}

Claude Code는 git 커밋과 풀 리퀘스트에 기여 표시를 추가합니다. 이는 별도로 구성됩니다:

* 커밋은 기본적으로 [git 트레일러](https://git-scm.com/docs/git-interpret-trailers) (예: `Co-Authored-By`)를 사용하며, 사용자 지정하거나 비활성화할 수 있습니다
* 풀 리퀘스트 설명은 일반 텍스트입니다

| 키 | 설명 |
| :--- | :--- |
| `commit` | git 커밋에 대한 기여 표시 (모든 트레일러 포함). 빈 문자열은 커밋 기여 표시를 숨깁니다 |
| `pr` | 풀 리퀘스트 설명에 대한 기여 표시. 빈 문자열은 풀 리퀘스트 기여 표시를 숨깁니다 |

**기본 커밋 기여 표시:**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**기본 풀 리퀘스트 기여 표시:**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**예시:**

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": ""
  }
}
```

:::info
`attribution` 설정은 사용 중단된 `includeCoAuthoredBy` 설정보다 우선합니다. 모든 기여 표시를 숨기려면 `commit`과 `pr`을 빈 문자열로 설정하세요.
:::

### 파일 제안 설정 {#file-suggestion-settings}

`@` 파일 경로 자동완성에 대한 커스텀 명령을 구성합니다. 내장 파일 제안은 빠른 파일시스템 순회를 사용하지만, 대형 모노레포는 미리 구축된 파일 인덱스나 커스텀 도구와 같은 프로젝트별 인덱싱의 혜택을 받을 수 있습니다.

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/file-suggestion.sh"
  }
}
```

명령은 `CLAUDE_PROJECT_DIR`을 포함하여 [훅](/hooks)과 동일한 환경 변수로 실행됩니다. `query` 필드가 포함된 JSON을 stdin으로 받습니다:

```json
{"query": "src/comp"}
```

stdout으로 줄 바꿈으로 구분된 파일 경로를 출력합니다 (현재 최대 15개):

```text
src/components/Button.tsx
src/components/Modal.tsx
src/components/Form.tsx
```

**예시:**

```bash
#!/bin/bash
query=$(cat | jq -r '.query')
your-repo-file-index --query "$query" | head -20
```

### 훅 구성 {#hook-configuration}

이 설정들은 어떤 훅이 실행될 수 있는지와 HTTP 훅이 접근할 수 있는 항목을 제어합니다. `allowManagedHooksOnly` 설정은 [managed 설정](#settings-files)에서만 구성할 수 있습니다. URL과 환경 변수 허용 목록은 모든 설정 수준에서 설정할 수 있으며 소스 간에 병합됩니다.

**`allowManagedHooksOnly`가 `true`일 때의 동작:**

* Managed 훅과 SDK 훅이 로드됩니다
* managed 설정 `enabledPlugins`에서 강제 활성화된 플러그인의 훅이 로드됩니다. 이를 통해 관리자는 다른 모든 것을 차단하면서 조직 마켓플레이스를 통해 검증된 훅을 배포할 수 있습니다. 신뢰는 전체 `plugin@marketplace` ID로 부여되므로 다른 마켓플레이스의 동일한 이름의 플러그인은 차단된 상태로 유지됩니다
* 사용자 훅, 프로젝트 훅, 기타 모든 플러그인 훅이 차단됩니다

**HTTP 훅 URL 제한:**

HTTP 훅이 대상으로 할 수 있는 URL을 제한합니다. 매칭을 위해 `*`를 와일드카드로 지원합니다. 배열이 정의되면 일치하지 않는 URL을 대상으로 하는 HTTP 훅이 자동으로 차단됩니다.

```json
{
  "allowedHttpHookUrls": ["https://hooks.example.com/*", "http://localhost:*"]
}
```

**HTTP 훅 환경 변수 제한:**

HTTP 훅이 헤더 값에 삽입할 수 있는 환경 변수 이름을 제한합니다. 각 훅의 유효한 `allowedEnvVars`는 해당 목록과 이 설정의 교집합입니다.

```json
{
  "httpHookAllowedEnvVars": ["MY_TOKEN", "HOOK_SECRET"]
}
```

### 설정 우선순위

설정은 우선순위 순서로 적용됩니다. 높은 것부터 낮은 순서로:

1. **Managed 설정** ([서버 관리](/server-managed-settings), [MDM/OS 수준 정책](#configuration-scopes), 또는 [managed 설정](/settings#settings-files))
   * 서버 전달, MDM 구성 프로필, 레지스트리 정책, 또는 managed 설정 파일을 통해 IT가 배포한 정책
   * 명령줄 인수를 포함한 다른 어떤 수준으로도 재정의할 수 없습니다
   * managed 계층 내에서 우선순위: 서버 관리 > MDM/OS 수준 정책 > 파일 기반(`managed-settings.d/*.json` + `managed-settings.json`) > HKCU 레지스트리 (Windows만). 하나의 managed 소스만 사용되며 소스는 계층 간에 병합되지 않습니다. 파일 기반 계층 내에서는 드롭인 파일과 기본 파일이 함께 병합됩니다.

2. **명령줄 인수**
   * 특정 세션에 대한 임시 재정의

3. **로컬 프로젝트 설정** (`.claude/settings.local.json`)
   * 개인 프로젝트별 설정

4. **공유 프로젝트 설정** (`.claude/settings.json`)
   * 소스 컨트롤의 팀 공유 프로젝트 설정

5. **사용자 설정** (`~/.claude/settings.json`)
   * 개인 전역 설정

이 계층 구조는 조직 정책이 항상 적용되면서 팀과 개인이 경험을 사용자 지정할 수 있도록 보장합니다. CLI, [VS Code 확장](/vs-code), 또는 [JetBrains IDE](/jetbrains)에서 Claude Code를 실행하는 경우 동일한 우선순위가 적용됩니다.

예를 들어, 사용자 설정이 `Bash(npm run *)`를 허용하지만 프로젝트의 공유 설정이 거부하면 프로젝트 설정이 우선하여 명령이 차단됩니다.

:::info
**배열 설정은 범위 간에 병합됩니다.** 동일한 배열 값 설정 (예: `sandbox.filesystem.allowWrite` 또는 `permissions.allow`)이 여러 범위에 나타날 때, 배열은 대체되지 않고 **연결 및 중복 제거**됩니다. 즉, 하위 우선순위 범위는 상위 우선순위 범위에서 설정한 항목을 재정의하지 않고 항목을 추가할 수 있으며, 반대도 마찬가지입니다. 예를 들어, managed 설정이 `allowWrite`를 `["/opt/company-tools"]`로 설정하고 사용자가 `["~/.kube"]`를 추가하면 최종 구성에 두 경로가 모두 포함됩니다.
:::

### 활성 설정 확인

Claude Code 내부에서 `/status`를 실행하면 어떤 설정 소스가 활성화되어 있고 어디서 오는지 확인할 수 있습니다. 출력은 각 구성 레이어 (managed, 사용자, 프로젝트)와 `Enterprise managed settings (remote)`, `Enterprise managed settings (plist)`, `Enterprise managed settings (HKLM)`, 또는 `Enterprise managed settings (file)`과 같은 출처를 표시합니다. 설정 파일에 오류가 있으면 `/status`가 문제를 보고하여 수정할 수 있습니다.

### 구성 시스템의 핵심 사항

* **메모리 파일 (`CLAUDE.md`)**: Claude가 시작 시 로드하는 지침과 컨텍스트를 포함합니다
* **설정 파일 (JSON)**: 권한, 환경 변수, 도구 동작을 구성합니다
* **스킬**: `/skill-name`으로 호출하거나 Claude가 자동으로 로드할 수 있는 커스텀 프롬프트입니다
* **MCP 서버**: Claude Code를 추가 도구 및 통합으로 확장합니다
* **우선순위**: 상위 수준 구성 (Managed)이 하위 수준 구성 (User/Project)을 재정의합니다
* **상속**: 설정이 병합되어 더 구체적인 설정이 더 광범위한 설정에 추가되거나 재정의됩니다

### 시스템 프롬프트

Claude Code의 내부 시스템 프롬프트는 공개되지 않습니다. 커스텀 지침을 추가하려면 `CLAUDE.md` 파일이나 `--append-system-prompt` 플래그를 사용하세요.

### 민감한 파일 제외

API 키, 시크릿, 환경 파일과 같은 민감한 정보가 포함된 파일에 Claude Code가 접근하지 못하도록 하려면 `.claude/settings.json` 파일의 `permissions.deny` 설정을 사용하세요:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./build)"
    ]
  }
}
```

이는 사용 중단된 `ignorePatterns` 구성을 대체합니다. 이 패턴과 일치하는 파일은 파일 검색 및 검색 결과에서 제외되며, 이 파일에 대한 읽기 작업이 거부됩니다.

## 서브에이전트 구성

Claude Code는 사용자 및 프로젝트 수준 모두에서 구성할 수 있는 커스텀 AI 서브에이전트를 지원합니다. 이 서브에이전트는 YAML 프론트매터가 있는 Markdown 파일로 저장됩니다:

* **User 서브에이전트**: `~/.claude/agents/` - 모든 프로젝트에서 사용 가능
* **Project 서브에이전트**: `.claude/agents/` - 프로젝트에 특정하며 팀과 공유할 수 있습니다

서브에이전트 파일은 커스텀 프롬프트와 도구 권한을 가진 특수화된 AI 어시스턴트를 정의합니다. 서브에이전트 생성 및 사용에 대해 자세히 알아보려면 [서브에이전트 문서](/sub-agents)를 참조하세요.

## 플러그인 구성

Claude Code는 스킬, 에이전트, 훅, MCP 서버로 기능을 확장할 수 있는 플러그인 시스템을 지원합니다. 플러그인은 마켓플레이스를 통해 배포되며 사용자 및 저장소 수준 모두에서 구성할 수 있습니다.

### 플러그인 설정

`settings.json`의 플러그인 관련 설정:

```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "deployer@acme-tools": true,
    "analyzer@security-plugins": false
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": "github",
      "repo": "acme-corp/claude-plugins"
    }
  }
}
```

#### `enabledPlugins`

어떤 플러그인이 활성화되어 있는지 제어합니다. 형식: `"plugin-name@marketplace-name": true/false`

**범위**:

* **User 설정** (`~/.claude/settings.json`): 개인 플러그인 설정
* **Project 설정** (`.claude/settings.json`): 팀과 공유하는 프로젝트별 플러그인
* **Local 설정** (`.claude/settings.local.json`): 머신별 재정의 (커밋되지 않음)
* **Managed 설정** (`managed-settings.json`): 모든 범위에서 설치를 차단하고 마켓플레이스에서 플러그인을 숨기는 조직 전체 정책 재정의

**예시**:

```json
{
  "enabledPlugins": {
    "code-formatter@team-tools": true,
    "deployment-tools@team-tools": true,
    "experimental-features@personal": false
  }
}
```

#### `extraKnownMarketplaces`

저장소에 사용 가능하게 해야 하는 추가 마켓플레이스를 정의합니다. 팀 멤버가 필요한 플러그인 소스에 접근할 수 있도록 일반적으로 저장소 수준 설정에서 사용됩니다.

**저장소에 `extraKnownMarketplaces`가 포함된 경우**:

1. 팀 멤버는 폴더를 신뢰할 때 마켓플레이스를 설치하라는 메시지를 받습니다
2. 팀 멤버는 해당 마켓플레이스에서 플러그인을 설치하라는 메시지를 받습니다
3. 사용자는 원하지 않는 마켓플레이스나 플러그인을 건너뛸 수 있습니다 (사용자 설정에 저장됨)
4. 설치는 신뢰 경계를 존중하며 명시적 동의가 필요합니다

**예시**:

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    },
    "security-plugins": {
      "source": {
        "source": "git",
        "url": "https://git.example.com/security/plugins.git"
      }
    }
  }
}
```

**마켓플레이스 소스 유형**:

* `github`: GitHub 저장소 (`repo` 사용)
* `git`: 모든 git URL (`url` 사용)
* `directory`: 로컬 파일시스템 경로 (`path` 사용, 개발 전용)
* `hostPattern`: 마켓플레이스 호스트를 매칭하는 정규 표현식 패턴 (`hostPattern` 사용)
* `settings`: 별도의 호스팅된 저장소 없이 settings.json에 직접 선언된 인라인 마켓플레이스 (`name`과 `plugins` 사용)

별도의 호스팅된 마켓플레이스 저장소를 설정하지 않고 소규모 플러그인 세트를 인라인으로 선언하려면 `source: 'settings'`를 사용하세요. 여기에 나열된 플러그인은 GitHub나 npm과 같은 외부 소스를 참조해야 합니다. 각 플러그인은 `enabledPlugins`에서 별도로 활성화해야 합니다.

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "settings",
        "name": "team-tools",
        "plugins": [
          {
            "name": "code-formatter",
            "source": {
              "source": "github",
              "repo": "acme-corp/code-formatter"
            }
          }
        ]
      }
    }
  }
}
```

#### `strictKnownMarketplaces`

**Managed 설정 전용**: 사용자가 추가할 수 있는 플러그인 마켓플레이스를 제어합니다. 이 설정은 [managed 설정](/settings#settings-files)에서만 구성할 수 있으며 관리자에게 마켓플레이스 소스에 대한 엄격한 제어를 제공합니다.

**Managed 설정 파일 위치**:

* **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
* **Linux 및 WSL**: `/etc/claude-code/managed-settings.json`
* **Windows**: `C:\Program Files\ClaudeCode\managed-settings.json`

**주요 특성**:

* managed 설정에서만 사용 가능 (`managed-settings.json`)
* 사용자 또는 프로젝트 설정으로 재정의할 수 없습니다 (최고 우선순위)
* 네트워크/파일시스템 작업 이전에 적용됩니다 (차단된 소스는 실행되지 않음)
* 소스 사양에 대해 정확한 매칭을 사용합니다 (`ref`, `path` git 소스 포함), 단 `hostPattern`은 정규 표현식 매칭을 사용합니다

**허용 목록 동작**:

* `undefined` (기본값): 제한 없음 - 사용자가 모든 마켓플레이스를 추가할 수 있습니다
* 빈 배열 `[]`: 완전한 잠금 - 사용자가 새 마켓플레이스를 추가할 수 없습니다
* 소스 목록: 사용자는 정확히 일치하는 마켓플레이스만 추가할 수 있습니다

**지원되는 모든 소스 유형**:

허용 목록은 여러 마켓플레이스 소스 유형을 지원합니다. 대부분의 소스는 정확한 매칭을 사용하며, `hostPattern`은 마켓플레이스 호스트에 대해 정규 표현식 매칭을 사용합니다.

1. **GitHub 저장소**:

```json
{ "source": "github", "repo": "acme-corp/approved-plugins" }
{ "source": "github", "repo": "acme-corp/security-tools", "ref": "v2.0" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main", "path": "marketplace" }
```

필드: `repo` (필수), `ref` (선택: 브랜치/태그/SHA), `path` (선택: 서브디렉토리)

2. **Git 저장소**:

```json
{ "source": "git", "url": "https://gitlab.example.com/tools/plugins.git" }
{ "source": "git", "url": "https://bitbucket.org/acme-corp/plugins.git", "ref": "production" }
{ "source": "git", "url": "ssh://git@git.example.com/plugins.git", "ref": "v3.1", "path": "approved" }
```

필드: `url` (필수), `ref` (선택: 브랜치/태그/SHA), `path` (선택: 서브디렉토리)

3. **URL 기반 마켓플레이스**:

```json
{ "source": "url", "url": "https://plugins.example.com/marketplace.json" }
{ "source": "url", "url": "https://cdn.example.com/marketplace.json", "headers": { "Authorization": "Bearer ${TOKEN}" } }
```

필드: `url` (필수), `headers` (선택: 인증된 접근을 위한 HTTP 헤더)

:::info
URL 기반 마켓플레이스는 `marketplace.json` 파일만 다운로드합니다. 서버에서 플러그인 파일을 다운로드하지 않습니다. URL 기반 마켓플레이스의 플러그인은 상대 경로가 아닌 외부 소스 (GitHub, npm, 또는 git URL)를 사용해야 합니다. 상대 경로가 있는 플러그인의 경우 Git 기반 마켓플레이스를 사용하세요. 자세한 내용은 [문제 해결](/plugin-marketplaces#plugins-with-relative-paths-fail-in-url-based-marketplaces)을 참조하세요.
:::

4. **NPM 패키지**:

```json
{ "source": "npm", "package": "@acme-corp/claude-plugins" }
{ "source": "npm", "package": "@acme-corp/approved-marketplace" }
```

필드: `package` (필수, 범위 패키지 지원)

5. **파일 경로**:

```json
{ "source": "file", "path": "/usr/local/share/claude/acme-marketplace.json" }
{ "source": "file", "path": "/opt/acme-corp/plugins/marketplace.json" }
```

필드: `path` (필수: marketplace.json 파일의 절대 경로)

6. **디렉토리 경로**:

```json
{ "source": "directory", "path": "/usr/local/share/claude/acme-plugins" }
{ "source": "directory", "path": "/opt/acme-corp/approved-marketplaces" }
```

필드: `path` (필수: `.claude-plugin/marketplace.json`을 포함하는 디렉토리의 절대 경로)

7. **호스트 패턴 매칭**:

```json
{ "source": "hostPattern", "hostPattern": "^github\\.example\\.com$" }
{ "source": "hostPattern", "hostPattern": "^gitlab\\.internal\\.example\\.com$" }
```

필드: `hostPattern` (필수: 마켓플레이스 호스트에 대해 매칭하는 정규 표현식 패턴)

각 저장소를 개별적으로 열거하지 않고 특정 호스트의 모든 마켓플레이스를 허용하려면 호스트 패턴 매칭을 사용하세요. 개발자가 자체 마켓플레이스를 만드는 내부 GitHub Enterprise 또는 GitLab 서버가 있는 조직에 유용합니다.

소스 유형별 호스트 추출:

* `github`: 항상 `github.com`에 대해 매칭
* `git`: URL에서 호스트명 추출 (HTTPS 및 SSH 형식 모두 지원)
* `url`: URL에서 호스트명 추출
* `npm`, `file`, `directory`: 호스트 패턴 매칭에 지원되지 않음

**구성 예시**:

예시: 특정 마켓플레이스만 허용:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme-corp/approved-plugins"
    },
    {
      "source": "github",
      "repo": "acme-corp/security-tools",
      "ref": "v2.0"
    },
    {
      "source": "url",
      "url": "https://plugins.example.com/marketplace.json"
    },
    {
      "source": "npm",
      "package": "@acme-corp/compliance-plugins"
    }
  ]
}
```

예시 - 모든 마켓플레이스 추가 비활성화:

```json
{
  "strictKnownMarketplaces": []
}
```

예시: 내부 git 서버의 모든 마켓플레이스 허용:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

**정확한 매칭 요구사항**:

마켓플레이스 소스는 사용자의 추가가 허용되려면 **정확히** 일치해야 합니다. git 기반 소스 (`github` 및 `git`)의 경우 모든 선택적 필드를 포함합니다:

* `repo` 또는 `url`이 정확히 일치해야 합니다
* `ref` 필드가 정확히 일치해야 합니다 (또는 둘 다 undefined)
* `path` 필드가 정확히 일치해야 합니다 (또는 둘 다 undefined)

**일치하지 않는** 소스 예시:

```json
// 이것들은 서로 다른 소스입니다:
{ "source": "github", "repo": "acme-corp/plugins" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main" }

// 이것들도 서로 다릅니다:
{ "source": "github", "repo": "acme-corp/plugins", "path": "marketplace" }
{ "source": "github", "repo": "acme-corp/plugins" }
```

**`extraKnownMarketplaces`와의 비교**:

| 측면 | `strictKnownMarketplaces` | `extraKnownMarketplaces` |
| --- | --- | --- |
| **목적** | 조직 정책 적용 | 팀 편의성 |
| **설정 파일** | `managed-settings.json`만 | 모든 설정 파일 |
| **동작** | 허용 목록에 없는 추가 차단 | 누락된 마켓플레이스 자동 설치 |
| **적용 시기** | 네트워크/파일시스템 작업 이전 | 사용자 신뢰 프롬프트 이후 |
| **재정의 가능** | 아니요 (최고 우선순위) | 예 (더 높은 우선순위 설정으로) |
| **소스 형식** | 직접 소스 객체 | 중첩된 소스가 있는 명명된 마켓플레이스 |
| **사용 사례** | 컴플라이언스, 보안 제한 | 온보딩, 표준화 |

**형식 차이**:

`strictKnownMarketplaces`는 직접 소스 객체를 사용합니다:

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ]
}
```

`extraKnownMarketplaces`는 명명된 마켓플레이스를 요구합니다:

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

**함께 사용하기**:

`strictKnownMarketplaces`는 정책 게이트입니다: 사용자가 추가할 수 있는 항목을 제어하지만 마켓플레이스를 등록하지 않습니다. 제한과 사전 등록을 모두 하려면 `managed-settings.json`에 둘 다 설정하세요:

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ],
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

`strictKnownMarketplaces`만 설정된 경우 사용자는 `/plugin marketplace add`를 통해 허용된 마켓플레이스를 수동으로 추가할 수 있지만 자동으로는 사용할 수 없습니다.

**중요 사항**:

* 제한은 모든 네트워크 요청이나 파일시스템 작업 이전에 확인됩니다
* 차단되면 사용자는 소스가 managed 정책에 의해 차단되었음을 나타내는 명확한 오류 메시지를 받습니다
* 제한은 새 마켓플레이스 추가에만 적용됩니다. 이전에 설치된 마켓플레이스는 여전히 접근 가능합니다
* Managed 설정은 최고 우선순위를 가지며 재정의할 수 없습니다

사용자 대향 문서는 [Managed 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions)을 참조하세요.

### 플러그인 관리

`/plugin` 명령을 사용하여 플러그인을 대화형으로 관리합니다:

* 마켓플레이스에서 사용 가능한 플러그인 탐색
* 플러그인 설치/제거
* 플러그인 활성화/비활성화
* 플러그인 세부 정보 보기 (제공하는 스킬, 에이전트, 훅)
* 마켓플레이스 추가/제거

플러그인 시스템에 대해 자세히 알아보려면 [플러그인 문서](/plugins)를 참조하세요.

## 환경 변수

환경 변수를 사용하면 설정 파일을 편집하지 않고도 Claude Code 동작을 제어할 수 있습니다. 모든 변수는 모든 세션에 적용하거나 팀에 배포하기 위해 [`settings.json`](#available-settings)의 `env` 키 아래에서도 구성할 수 있습니다.

전체 목록은 [환경 변수 참조](/env-vars)를 참조하세요.

## Claude에 사용 가능한 도구

Claude Code는 파일 읽기, 편집, 검색, 명령 실행, 서브에이전트 조율을 위한 도구 세트에 접근할 수 있습니다. 도구 이름은 권한 규칙과 훅 매처에서 사용하는 정확한 문자열입니다.

전체 목록과 Bash 도구 동작 세부 사항은 [도구 참조](/tools-reference)를 참조하세요.

## 참고 자료

* [권한](/permissions): 권한 시스템, 규칙 구문, 도구별 패턴, managed 정책
* [인증](/authentication): Claude Code에 대한 사용자 접근 설정
* [문제 해결](/troubleshooting): 일반적인 구성 문제에 대한 해결책
