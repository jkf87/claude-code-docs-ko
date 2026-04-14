---
title: 환경 변수
description: "Claude Code 동작을 제어하는 환경 변수 전체 참조 가이드"
---

# 환경 변수

> Claude Code 동작을 제어하는 환경 변수 전체 참조 가이드

Claude Code는 동작을 제어하기 위해 다음 환경 변수를 지원합니다. `claude`를 실행하기 전 셸에서 설정하거나, [`settings.json`](/settings#available-settings)의 `env` 키에 구성하여 모든 세션에 적용하거나 팀 전체에 배포할 수 있습니다.

| 변수 | 용도 |
| :--- | :--- |
| `ANTHROPIC_API_KEY` | `X-Api-Key` 헤더로 전송되는 API 키. 설정하면 Claude Pro, Max, Team, Enterprise 구독 대신 이 키가 사용됩니다. 비대화형 모드(`-p`)에서는 키가 있으면 항상 사용됩니다. 대화형 모드에서는 구독을 재정의하기 전 한 번 승인을 요청합니다. 구독을 대신 사용하려면 `unset ANTHROPIC_API_KEY`를 실행하세요. |
| `ANTHROPIC_AUTH_TOKEN` | `Authorization` 헤더의 커스텀 값 (`Bearer ` 접두사가 자동으로 추가됨) |
| `ANTHROPIC_BASE_URL` | API 엔드포인트를 재정정하여 프록시나 게이트웨이를 통해 요청을 라우팅합니다. 1파티가 아닌 호스트로 설정하면 [MCP tool search](/mcp#scale-with-mcp-tool-search)가 기본적으로 비활성화됩니다. 프록시가 `tool_reference` 블록을 전달하는 경우 `ENABLE_TOOL_SEARCH=true`를 설정하세요. |
| `ANTHROPIC_BEDROCK_BASE_URL` | Bedrock 엔드포인트 URL 재정정. 커스텀 Bedrock 엔드포인트나 [LLM gateway](/llm-gateway)를 통해 라우팅할 때 사용. [Amazon Bedrock](/amazon-bedrock) 참조 |
| `ANTHROPIC_BEDROCK_MANTLE_BASE_URL` | Bedrock Mantle 엔드포인트 URL 재정정. [Mantle endpoint](/amazon-bedrock#use-the-mantle-endpoint) 참조 |
| `ANTHROPIC_BETAS` | API 요청에 포함할 추가 `anthropic-beta` 헤더 값 (쉼표로 구분). Claude Code는 필요한 베타 헤더를 이미 전송하며, Claude Code가 네이티브 지원을 추가하기 전에 [Anthropic API beta](https://platform.claude.com/docs/en/api/beta-headers)에 옵트인하는 데 사용합니다. [`--betas` 플래그](/cli-reference#cli-flags)와 달리 API 키 인증이 필요 없으며 Claude.ai 구독을 포함한 모든 인증 방법에서 동작합니다. |
| `ANTHROPIC_CUSTOM_HEADERS` | 요청에 추가할 커스텀 헤더 (`Name: Value` 형식, 여러 헤더는 줄바꿈으로 구분) |
| `ANTHROPIC_CUSTOM_MODEL_OPTION` | `/model` 선택기에 커스텀 항목으로 추가할 모델 ID. 기본 제공 별칭을 대체하지 않고 비표준 또는 게이트웨이별 모델을 선택 가능하게 합니다. [Model configuration](/model-config#add-a-custom-model-option) 참조 |
| `ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION` | `/model` 선택기에서 커스텀 모델 항목의 설명. 미설정 시 `Custom model (<model-id>)`가 기본값 |
| `ANTHROPIC_CUSTOM_MODEL_OPTION_NAME` | `/model` 선택기에서 커스텀 모델 항목의 표시 이름. 미설정 시 모델 ID가 기본값 |
| `ANTHROPIC_CUSTOM_MODEL_OPTION_SUPPORTED_CAPABILITIES` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | [Model configuration](/model-config#environment-variables) 참조 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | [Model configuration](/model-config#environment-variables) 참조 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_NAME` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | [Model configuration](/model-config#environment-variables) 참조 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL_NAME` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES` | [Model configuration](/model-config#customize-pinned-model-display-and-capabilities) 참조 |
| `ANTHROPIC_FOUNDRY_API_KEY` | Microsoft Foundry 인증용 API 키 ([Microsoft Foundry](/microsoft-foundry) 참조) |
| `ANTHROPIC_FOUNDRY_BASE_URL` | Foundry 리소스의 전체 기본 URL (예: `https://my-resource.services.ai.azure.com/anthropic`). `ANTHROPIC_FOUNDRY_RESOURCE`의 대안 ([Microsoft Foundry](/microsoft-foundry) 참조) |
| `ANTHROPIC_FOUNDRY_RESOURCE` | Foundry 리소스 이름 (예: `my-resource`). `ANTHROPIC_FOUNDRY_BASE_URL`이 설정되지 않은 경우 필수 ([Microsoft Foundry](/microsoft-foundry) 참조) |
| `ANTHROPIC_MODEL` | 사용할 모델 설정 이름 ([Model Configuration](/model-config#environment-variables) 참조) |
| `ANTHROPIC_SMALL_FAST_MODEL` | [사용 중단됨] 백그라운드 작업용 Haiku 클래스 모델 이름 ([Costs](/costs) 참조) |
| `ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION` | Bedrock 또는 Bedrock Mantle 사용 시 Haiku 클래스 모델의 AWS 리전 재정정 |
| `ANTHROPIC_VERTEX_BASE_URL` | Vertex AI 엔드포인트 URL 재정정. 커스텀 Vertex 엔드포인트나 [LLM gateway](/llm-gateway) 라우팅에 사용. [Google Vertex AI](/google-vertex-ai) 참조 |
| `ANTHROPIC_VERTEX_PROJECT_ID` | Vertex AI용 GCP 프로젝트 ID. [Google Vertex AI](/google-vertex-ai) 사용 시 필수 |
| `API_TIMEOUT_MS` | API 요청 타임아웃 (밀리초, 기본값: 600000/10분, 최대: 2147483647). 느린 네트워크나 프록시 사용 시 요청이 타임아웃되면 이 값을 늘리세요. 최대값을 초과하면 내부 타이머가 오버플로우되어 요청이 즉시 실패합니다. |
| `AWS_BEARER_TOKEN_BEDROCK` | Bedrock 인증용 API 키 ([Bedrock API keys](https://aws.amazon.com/blogs/machine-learning/accelerate-ai-development-with-amazon-bedrock-api-keys/) 참조) |
| `BASH_DEFAULT_TIMEOUT_MS` | 장시간 실행 bash 명령의 기본 타임아웃 (기본값: 120000/2분) |
| `BASH_MAX_OUTPUT_LENGTH` | bash 출력이 중간에서 잘리기 전의 최대 문자 수 |
| `BASH_MAX_TIMEOUT_MS` | 모델이 장시간 실행 bash 명령에 설정할 수 있는 최대 타임아웃 (기본값: 600000/10분) |
| `CCR_FORCE_BUNDLE` | `1`로 설정하면 GitHub 접근이 가능할 때도 [`claude --remote`](/claude-code-on-the-web#send-local-repositories-without-github)가 로컬 리포지토리를 번들하여 업로드하도록 강제합니다. |
| `CLAUDECODE` | Claude Code가 생성하는 셸 환경에서 `1`로 설정됨 (Bash 도구, tmux 세션). [hooks](/hooks)나 [status line](/statusline) 명령에서는 설정되지 않습니다. Claude Code가 생성한 셸에서 실행 중인지 감지하는 데 사용합니다. |
| `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` | `1`로 설정하면 Explore, Plan 같은 모든 내장 [subagent](/sub-agents) 유형을 비활성화합니다. 비대화형 모드(`-p` 플래그)에만 적용됩니다. 빈 상태의 SDK 사용자에게 유용합니다. |
| `CLAUDE_AGENT_SDK_MCP_NO_PREFIX` | `1`로 설정하면 SDK 생성 MCP 서버의 도구 이름에서 `mcp__<server>__` 접두사를 생략합니다. 도구가 원래 이름을 사용합니다. SDK 전용. |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 자동 압축이 트리거되는 컨텍스트 용량의 비율(1-100)을 설정합니다. 기본적으로 약 95%에서 트리거됩니다. `50` 같은 낮은 값으로 더 일찍 압축하도록 설정할 수 있습니다. 기본 임계값보다 높은 값은 효과가 없습니다. 메인 대화와 서브에이전트 모두에 적용됩니다. 이 비율은 [status line](/statusline)에서 사용 가능한 `context_window.used_percentage` 필드와 정렬됩니다. |
| `CLAUDE_AUTO_BACKGROUND_TASKS` | `1`로 설정하면 장시간 실행되는 에이전트 작업의 자동 백그라운드화를 강제 활성화합니다. 활성화 시 서브에이전트는 약 2분 실행 후 백그라운드로 이동합니다. |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | 메인 세션에서 각 Bash 또는 PowerShell 명령 실행 후 원래 작업 디렉토리로 돌아갑니다. |
| `CLAUDE_CODE_ACCESSIBILITY` | `1`로 설정하면 네이티브 터미널 커서를 표시하고 반전 텍스트 커서 표시기를 비활성화합니다. macOS Zoom 같은 화면 돋보기가 커서 위치를 추적할 수 있게 합니다. |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | `1`로 설정하면 `--add-dir`로 지정된 디렉토리에서 메모리 파일을 로드합니다. `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/*.md`, `CLAUDE.local.md`를 로드합니다. 기본적으로 추가 디렉토리는 메모리 파일을 로드하지 않습니다. |
| `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` | [`apiKeyHelper`](/settings#available-settings) 사용 시 자격 증명을 새로 고칠 간격 (밀리초) |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | 자동 압축 계산에 사용할 컨텍스트 용량 (토큰). 기본값은 모델의 컨텍스트 윈도우: 표준 모델 200K, [확장 컨텍스트](/model-config#extended-context) 모델 1M. 1M 모델에서 `500000` 같은 낮은 값을 사용하면 압축 목적으로 윈도우를 500K로 처리합니다. 모델의 실제 컨텍스트 윈도우로 상한됩니다. `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`는 이 값의 백분율로 적용됩니다. |
| `CLAUDE_CODE_AUTO_CONNECT_IDE` | 자동 [IDE 연결](/vs-code)을 재정정합니다. 기본적으로 지원되는 IDE의 통합 터미널에서 실행 시 Claude Code가 자동 연결합니다. `false`로 설정하면 연결을 방지하고, `true`로 설정하면 tmux가 부모 터미널을 가리는 경우처럼 자동 감지가 실패할 때 연결을 시도합니다. |
| `CLAUDE_CODE_CERT_STORE` | TLS 연결용 CA 인증서 소스 목록 (쉼표로 구분). `bundled`은 Claude Code에 번들된 Mozilla CA 세트, `system`은 OS 신뢰 저장소. 기본값은 `bundled,system`. 시스템 저장소 통합에는 네이티브 바이너리 배포가 필요합니다. |
| `CLAUDE_CODE_CLIENT_CERT` | mTLS 인증용 클라이언트 인증서 파일 경로 |
| `CLAUDE_CODE_CLIENT_KEY` | mTLS 인증용 클라이언트 개인 키 파일 경로 |
| `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE` | 암호화된 CLAUDE_CODE_CLIENT_KEY의 암호 (선택사항) |
| `CLAUDE_CODE_DEBUG_LOGS_DIR` | 디버그 로그 파일 경로 재정정. 이름과 달리 디렉토리가 아닌 파일 경로입니다. `--debug`나 `/debug`로 디버그 모드를 별도로 활성화해야 합니다. 기본값: `~/.claude/debug/<session-id>.txt` |
| `CLAUDE_CODE_DEBUG_LOG_LEVEL` | 디버그 로그 파일에 기록할 최소 로그 레벨. 값: `verbose`, `debug`(기본), `info`, `warn`, `error`. 전체 status line 명령 출력 같은 대량 진단을 포함하려면 `verbose`로 설정하고, 노이즈를 줄이려면 `error`로 올리세요. |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | `1`로 설정하면 [1M 컨텍스트 윈도우](/model-config#extended-context) 지원을 비활성화합니다. 설정 시 1M 모델 변형이 모델 선택기에서 사용 불가능합니다. 규정 준수 요구사항이 있는 엔터프라이즈 환경에 유용합니다. |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | `1`로 설정하면 Opus 4.6 및 Sonnet 4.6의 [적응 추론](/model-config#adjust-effort-level)을 비활성화합니다. 비활성화 시 `MAX_THINKING_TOKENS`로 제어되는 고정 추론 예산으로 대체됩니다. |
| `CLAUDE_CODE_DISABLE_ATTACHMENTS` | `1`로 설정하면 첨부 파일 처리를 비활성화합니다. `@` 구문의 파일 언급이 확장된 파일 콘텐츠 대신 일반 텍스트로 전송됩니다. |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | `1`로 설정하면 [자동 메모리](/memory#auto-memory)를 비활성화합니다. `0`으로 설정하면 점진적 롤아웃 중에 강제 활성화합니다. 비활성화 시 Claude는 자동 메모리 파일을 생성하거나 로드하지 않습니다. |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | `1`로 설정하면 Bash 및 서브에이전트 도구의 `run_in_background` 매개변수, 자동 백그라운드화, Ctrl+B 단축키를 포함한 모든 백그라운드 작업 기능을 비활성화합니다. |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | `1`로 설정하면 사용자, 프로젝트, 자동 메모리 파일을 포함한 모든 CLAUDE.md 메모리 파일을 컨텍스트에 로드하지 않습니다. |
| `CLAUDE_CODE_DISABLE_CRON` | `1`로 설정하면 [예약 작업](/scheduled-tasks)을 비활성화합니다. `/loop` 스킬과 크론 도구를 사용할 수 없으며 이미 예약된 작업이 중지됩니다. |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | `1`로 설정하면 API 요청에서 Anthropic 전용 `anthropic-beta` 요청 헤더와 베타 도구 스키마 필드(`defer_loading`, `eager_input_streaming` 등)를 제거합니다. 프록시 게이트웨이가 "Unexpected value(s) for the `anthropic-beta` header" 같은 에러로 요청을 거부할 때 사용합니다. |
| `CLAUDE_CODE_DISABLE_FAST_MODE` | `1`로 설정하면 [fast mode](/fast-mode)를 비활성화합니다. |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | `1`로 설정하면 "How is Claude doing?" 세션 품질 설문을 비활성화합니다. `DISABLE_TELEMETRY`나 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`이 설정되어도 설문이 비활성화됩니다. [Session quality surveys](/data-usage#session-quality-surveys) 참조. |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | `1`로 설정하면 파일 [체크포인팅](/checkpointing)을 비활성화합니다. `/rewind` 명령으로 코드 변경을 복원할 수 없습니다. |
| `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` | `1`로 설정하면 Claude의 시스템 프롬프트에서 내장 커밋/PR 워크플로우 지침과 git 상태 스냅샷을 제거합니다. 자체 git 워크플로우 스킬을 사용할 때 유용합니다. [`includeGitInstructions`](/settings#available-settings) 설정보다 우선합니다. |
| `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP` | `1`로 설정하면 Anthropic API에서 Opus 4.0 및 4.1을 현재 Opus 버전으로 자동 재매핑하지 않습니다. 이전 모델을 고정하려는 경우 사용하세요. Bedrock, Vertex, Foundry에서는 재매핑이 실행되지 않습니다. |
| `CLAUDE_CODE_DISABLE_MOUSE` | `1`로 설정하면 [전체화면 렌더링](/fullscreen)에서 마우스 추적을 비활성화합니다. `PgUp`/`PgDn` 키보드 스크롤은 계속 동작합니다. 터미널의 기본 복사 선택 동작을 유지하려면 이 옵션을 사용하세요. |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | `DISABLE_AUTOUPDATER`, `DISABLE_FEEDBACK_COMMAND`, `DISABLE_ERROR_REPORTING`, `DISABLE_TELEMETRY`를 모두 설정하는 것과 동일합니다. |
| `CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK` | `1`로 설정하면 스트리밍 요청이 중간에 실패할 때 비스트리밍 폴백을 비활성화합니다. 스트리밍 에러가 재시도 레이어로 전파됩니다. 프록시/게이트웨이가 폴백으로 인해 도구 실행이 중복되는 경우 유용합니다. |
| `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL` | `1`로 설정하면 첫 실행 시 공식 플러그인 마켓플레이스 자동 추가를 건너뜁니다. |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | `1`로 설정하면 대화 컨텍스트 기반의 자동 터미널 제목 업데이트를 비활성화합니다. |
| `CLAUDE_CODE_DISABLE_THINKING` | `1`로 설정하면 모델 지원이나 다른 설정과 관계없이 [확장 사고](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)를 강제 비활성화합니다. `MAX_THINKING_TOKENS=0`보다 더 직접적입니다. |
| `CLAUDE_CODE_EFFORT_LEVEL` | 지원되는 모델의 노력 수준을 설정합니다. 값: `low`, `medium`, `high`, `max`(Opus 4.6 전용), 또는 `auto`(모델 기본값). `/effort` 및 `effortLevel` 설정보다 우선합니다. [노력 수준 조정](/model-config#adjust-effort-level) 참조. |
| `CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING` | `1`로 설정하면 세분화된 도구 입력 스트리밍을 강제 활성화합니다. 미설정 시 API가 도구 입력 매개변수를 완전히 버퍼링한 후 델타 이벤트를 전송하여 대형 도구 입력에서 표시가 지연될 수 있습니다. Anthropic API 전용: Bedrock, Vertex, Foundry에는 효과가 없습니다. |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | `false`로 설정하면 프롬프트 제안을 비활성화합니다 (`/config`의 "Prompt suggestions" 토글). Claude가 응답한 후 프롬프트 입력에 나타나는 회색 예측 텍스트입니다. [Prompt suggestions](/interactive-mode#prompt-suggestions) 참조. |
| `CLAUDE_CODE_ENABLE_TASKS` | `1`로 설정하면 비대화형 모드(`-p` 플래그)에서 작업 추적 시스템을 활성화합니다. 대화형 모드에서는 기본적으로 활성화됩니다. [작업 목록](/interactive-mode#task-list) 참조. |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | `1`로 설정하면 메트릭 및 로깅용 OpenTelemetry 데이터 수집을 활성화합니다. OTel 익스포터 구성 전에 필수입니다. [Monitoring](/monitoring-usage) 참조. |
| `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY` | 쿼리 루프가 유휴 상태가 된 후 자동 종료까지 대기할 시간 (밀리초). SDK 모드를 사용하는 자동화 워크플로우 및 스크립트에 유용합니다. |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1`로 설정하면 [agent teams](/agent-teams)를 활성화합니다. 에이전트 팀은 실험적 기능으로 기본적으로 비활성화됩니다. |
| `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` | 파일 읽기의 기본 토큰 제한을 재정정합니다. 더 큰 파일을 전체로 읽어야 할 때 유용합니다. |
| `CLAUDE_CODE_GIT_BASH_PATH` | Windows 전용: Git Bash 실행 파일 경로(`bash.exe`). Git Bash가 설치되었지만 PATH에 없을 때 사용. [Windows 설정](/setup#set-up-on-windows) 참조 |
| `CLAUDE_CODE_GLOB_HIDDEN` | `false`로 설정하면 Claude가 [Glob 도구](/tools-reference)를 호출할 때 숨김 파일을 결과에서 제외합니다. 기본적으로 포함됩니다. `@` 파일 자동완성, `ls`, Grep, Read에는 영향을 주지 않습니다. |
| `CLAUDE_CODE_GLOB_NO_IGNORE` | `false`로 설정하면 [Glob 도구](/tools-reference)가 `.gitignore` 패턴을 준수합니다. 기본적으로 Glob은 gitignore된 파일을 포함하여 모든 일치 파일을 반환합니다. |
| `CLAUDE_CODE_GLOB_TIMEOUT_SECONDS` | Glob 도구 파일 검색 타임아웃 (초). 기본값: 대부분 플랫폼 20초, WSL 60초 |
| `CLAUDE_CODE_IDE_HOST_OVERRIDE` | IDE 확장 연결에 사용할 호스트 주소를 재정정합니다. Claude Code가 WSL→Windows 라우팅을 포함한 올바른 주소를 자동 감지합니다. |
| `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL` | IDE 확장 자동 설치를 건너뜁니다. [`autoInstallIdeExtension`](/settings#global-config-settings)을 `false`로 설정하는 것과 동일합니다. |
| `CLAUDE_CODE_IDE_SKIP_VALID_CHECK` | `1`로 설정하면 연결 시 IDE lockfile 항목의 유효성 검사를 건너뜁니다. IDE가 실행 중인데도 자동 연결이 실패할 때 사용하세요. |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 대부분 요청의 최대 출력 토큰 수를 설정합니다. 기본값과 상한은 모델에 따라 다릅니다. 이 값을 늘리면 [자동 압축](/costs#reduce-token-usage)이 트리거되기 전의 유효 컨텍스트 윈도우가 줄어듭니다. |
| `CLAUDE_CODE_MAX_RETRIES` | 실패한 API 요청의 재시도 횟수 재정정 (기본값: 10) |
| `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | 병렬로 실행할 수 있는 읽기 전용 도구 및 서브에이전트의 최대 수 (기본값: 10). 높은 값은 병렬성을 높이지만 더 많은 리소스를 소모합니다. |
| `CLAUDE_CODE_NEW_INIT` | `1`로 설정하면 `/init`가 대화형 설정 흐름을 실행합니다. 코드베이스를 탐색하고 작성하기 전에 CLAUDE.md, 스킬, 훅 중 어떤 것을 생성할지 묻습니다. 미설정 시 `/init`은 프롬프트 없이 CLAUDE.md를 자동 생성합니다. |
| `CLAUDE_CODE_NO_FLICKER` | `1`로 설정하면 [전체화면 렌더링](/fullscreen)을 활성화합니다. 깜빡임을 줄이고 긴 대화에서 메모리 사용량을 안정화하는 리서치 프리뷰입니다. |
| `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | Claude.ai 인증용 OAuth 리프레시 토큰. 설정 시 `claude auth login`이 브라우저 대신 이 토큰을 직접 교환합니다. `CLAUDE_CODE_OAUTH_SCOPES`가 필요합니다. 자동화 환경에서 인증을 프로비저닝할 때 유용합니다. |
| `CLAUDE_CODE_OAUTH_SCOPES` | 리프레시 토큰이 발급된 OAuth 스코프 (공백으로 구분). `"user:profile user:inference user:sessions:claude_code"` 등. `CLAUDE_CODE_OAUTH_REFRESH_TOKEN`이 설정된 경우 필수입니다. |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude.ai 인증용 OAuth 액세스 토큰. SDK 및 자동화 환경에서 `/login`의 대안입니다. 키체인에 저장된 자격 증명보다 우선합니다. [`claude setup-token`](/authentication#generate-a-long-lived-token)으로 생성하세요. |
| `CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS` | 보류 중인 OpenTelemetry 스팬 플러시 타임아웃 (밀리초, 기본값: 5000). [Monitoring](/monitoring-usage) 참조. |
| `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` | 동적 OpenTelemetry 헤더 새로 고침 간격 (밀리초, 기본값: 1740000/29분). [Dynamic headers](/monitoring-usage#dynamic-headers) 참조. |
| `CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS` | 종료 시 OpenTelemetry 익스포터 완료 타임아웃 (밀리초, 기본값: 2000). 종료 시 메트릭 손실이 있으면 늘리세요. [Monitoring](/monitoring-usage) 참조. |
| `CLAUDE_CODE_PERFORCE_MODE` | `1`로 설정하면 Perforce 인식 쓰기 보호를 활성화합니다. 설정 시 대상 파일에 소유자 쓰기 비트가 없으면 Edit, Write, NotebookEdit이 `p4 edit <file>` 힌트와 함께 실패합니다. Claude Code가 Perforce 변경 추적을 우회하는 것을 방지합니다. |
| `CLAUDE_CODE_PLUGIN_CACHE_DIR` | 플러그인 루트 디렉토리를 재정정합니다. 이름과 달리 캐시 자체가 아닌 상위 디렉토리를 설정합니다. 기본값: `~/.claude/plugins` |
| `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` | 플러그인 설치/업데이트 시 git 작업 타임아웃 (밀리초, 기본값: 120000). 대형 리포지토리나 느린 네트워크에서 늘리세요. [Git operations time out](/plugin-marketplaces#git-operations-time-out) 참조. |
| `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE` | `1`로 설정하면 `git pull` 실패 시 기존 마켓플레이스 캐시를 유지합니다. 오프라인이나 에어갭 환경에서 재클론이 같은 방식으로 실패할 때 유용합니다. |
| `CLAUDE_CODE_PLUGIN_SEED_DIR` | 읽기 전용 플러그인 시드 디렉토리 경로 (Unix에서 `:`, Windows에서 `;`로 구분). 컨테이너 이미지에 미리 채워진 플러그인 디렉토리를 번들할 때 사용합니다. [Pre-populate plugins for containers](/plugin-marketplaces#pre-populate-plugins-for-containers) 참조. |
| `CLAUDE_CODE_PROXY_RESOLVES_HOSTS` | `1`로 설정하면 프록시가 DNS 확인을 수행하도록 허용합니다. 프록시가 호스트네임 확인을 처리해야 하는 환경에서 옵트인하세요. |
| `CLAUDE_CODE_RESUME_INTERRUPTED_TURN` | `1`로 설정하면 이전 세션이 턴 중간에 종료된 경우 자동으로 재개합니다. SDK 모드에서 모델이 SDK가 프롬프트를 재전송할 필요 없이 계속 진행하도록 사용합니다. |
| `CLAUDE_CODE_SCRIPT_CAPS` | `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`이 설정된 경우 세션당 특정 스크립트 호출 횟수를 제한하는 JSON 객체. 키는 명령 텍스트에 대해 부분 문자열 일치, 값은 정수 호출 제한. 예: `{"deploy.sh": 2}`는 `deploy.sh`를 최대 2번 호출하도록 허용합니다. |
| `CLAUDE_CODE_SCROLL_SPEED` | [전체화면 렌더링](/fullscreen#adjust-wheel-scroll-speed)에서 마우스 휠 스크롤 배율을 설정합니다. 1~20의 값을 허용합니다. `3`으로 설정하면 터미널이 증폭 없이 한 노치당 하나의 휠 이벤트를 보낼 때 `vim`과 일치합니다. |
| `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` | [SessionEnd](/hooks#sessionend) 훅의 시간 예산 재정정 (밀리초). 세션 종료, `/clear`, 대화형 `/resume`으로 세션 전환에 적용됩니다. 기본 예산은 1.5초이며, 설정 파일에 구성된 훅별 `timeout` 중 가장 높은 값까지 자동 상향, 최대 60초입니다. |
| `CLAUDE_CODE_SHELL` | 자동 셸 감지를 재정정합니다. 로그인 셸과 선호하는 작업 셸이 다를 때 유용합니다 (예: `bash` vs `zsh`) |
| `CLAUDE_CODE_SHELL_PREFIX` | 모든 bash 명령을 감싸는 명령 접두사 (예: 로깅이나 감사용). 예: `/path/to/logger.sh`는 `/path/to/logger.sh <command>`를 실행합니다. |
| `CLAUDE_CODE_SIMPLE` | `1`로 설정하면 최소 시스템 프롬프트와 Bash, 파일 읽기, 파일 편집 도구만으로 실행합니다. `--mcp-config`의 MCP 도구는 계속 사용 가능합니다. 훅, 스킬, 플러그인, MCP 서버, 자동 메모리, CLAUDE.md의 자동 발견을 비활성화합니다. [`--bare`](/headless#start-faster-with-bare-mode) CLI 플래그가 이 값을 설정합니다. |
| `CLAUDE_CODE_SKIP_BEDROCK_AUTH` | Bedrock용 AWS 인증을 건너뜁니다 (예: LLM 게이트웨이 사용 시) |
| `CLAUDE_CODE_SKIP_FOUNDRY_AUTH` | Microsoft Foundry용 Azure 인증을 건너뜁니다 (예: LLM 게이트웨이 사용 시) |
| `CLAUDE_CODE_SKIP_MANTLE_AUTH` | Bedrock Mantle용 AWS 인증을 건너뜁니다 (예: LLM 게이트웨이 사용 시) |
| `CLAUDE_CODE_SKIP_VERTEX_AUTH` | Vertex용 Google 인증을 건너뜁니다 (예: LLM 게이트웨이 사용 시) |
| `CLAUDE_CODE_SUBAGENT_MODEL` | [Model configuration](/model-config) 참조 |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | `1`로 설정하면 서브프로세스 환경(Bash 도구, 훅, MCP stdio 서버)에서 Anthropic 및 클라우드 프로바이더 자격 증명을 제거합니다. 부모 Claude 프로세스는 API 호출용 자격 증명을 유지하지만, 자식 프로세스는 셸 확장을 통한 시크릿 유출 프롬프트 인젝션 공격에 노출을 줄입니다. Linux에서는 Bash 서브프로세스를 분리된 PID 네임스페이스에서 실행하여 호스트 프로세스 환경을 읽지 못하게 합니다. |
| `CLAUDE_CODE_SYNC_PLUGIN_INSTALL` | 비대화형 모드(`-p` 플래그)에서 `1`로 설정하면 첫 번째 쿼리 전 플러그인 설치 완료를 대기합니다. 미설정 시 플러그인이 백그라운드에서 설치되어 첫 번째 턴에 사용할 수 없을 수 있습니다. |
| `CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS` | 동기 플러그인 설치 타임아웃 (밀리초). 초과 시 Claude Code는 플러그인 없이 진행하고 에러를 로깅합니다. 미설정 시 동기 설치는 완료까지 대기합니다. |
| `CLAUDE_CODE_SYNTAX_HIGHLIGHT` | `false`로 설정하면 diff 출력에서 구문 강조를 비활성화합니다. 색상이 터미널 설정과 충돌할 때 유용합니다. |
| `CLAUDE_CODE_TASK_LIST_ID` | 세션 간 작업 목록을 공유합니다. 여러 Claude Code 인스턴스에 동일한 ID를 설정하여 공유 작업 목록을 조율합니다. [작업 목록](/interactive-mode#task-list) 참조. |
| `CLAUDE_CODE_TEAM_NAME` | 이 팀원이 속한 에이전트 팀 이름. [agent team](/agent-teams) 멤버에 자동 설정됩니다. |
| `CLAUDE_CODE_TMPDIR` | 내부 임시 파일에 사용할 임시 디렉토리를 재정정합니다. Claude Code는 이 경로에 `/claude-{uid}/`(Unix) 또는 `/claude/`(Windows)를 추가합니다. |
| `CLAUDE_CODE_USE_BEDROCK` | [Bedrock](/amazon-bedrock) 사용 |
| `CLAUDE_CODE_USE_FOUNDRY` | [Microsoft Foundry](/microsoft-foundry) 사용 |
| `CLAUDE_CODE_USE_MANTLE` | Bedrock [Mantle endpoint](/amazon-bedrock#use-the-mantle-endpoint) 사용 |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL` | `1`로 설정하면 Windows에서 PowerShell 도구를 활성화합니다 (옵트인 프리뷰). Claude가 Git Bash를 통하지 않고 PowerShell 명령을 네이티브로 실행할 수 있습니다. WSL이 아닌 네이티브 Windows만 지원합니다. |
| `CLAUDE_CODE_USE_VERTEX` | [Vertex](/google-vertex-ai) 사용 |
| `CLAUDE_CONFIG_DIR` | 설정 디렉토리를 재정정합니다 (기본값: `~/.claude`). 모든 설정, 자격 증명, 세션 기록, 플러그인이 이 경로 아래에 저장됩니다. 여러 계정을 나란히 실행할 때 유용합니다. |
| `CLAUDE_ENABLE_BYTE_WATCHDOG` | `1`로 설정하면 바이트 수준 스트리밍 유휴 워치독을 강제 활성화하고, `0`으로 설정하면 강제 비활성화합니다. 미설정 시 Anthropic API 연결에 기본적으로 활성화됩니다. |
| `CLAUDE_ENABLE_STREAM_WATCHDOG` | `1`로 설정하면 이벤트 수준 스트리밍 유휴 워치독을 활성화합니다. 기본적으로 비활성화됩니다. Bedrock, Vertex, Foundry에서는 사용 가능한 유일한 유휴 워치독입니다. |
| `CLAUDE_ENV_FILE` | Claude Code가 각 Bash 명령 전에 소싱하는 셸 스크립트 경로. virtualenv나 conda 활성화를 명령 간에 유지하는 데 사용합니다. |
| `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` | 명시적 이름이 제공되지 않을 때 자동 생성되는 [Remote Control](/remote-control) 세션 이름의 접두사. 기본값은 호스트네임입니다. |
| `CLAUDE_STREAM_IDLE_TIMEOUT_MS` | 스트리밍 유휴 워치독이 정체된 연결을 닫기 전의 타임아웃 (밀리초). 바이트 수준 워치독(Anthropic API): 기본 및 최소 `300000`(5분). 이벤트 수준 워치독: 기본 `90000`(90초), 최소 없음. |
| `DISABLE_AUTOUPDATER` | `1`로 설정하면 자동 업데이트를 비활성화합니다. |
| `DISABLE_AUTO_COMPACT` | `1`로 설정하면 컨텍스트 한도에 가까워질 때 자동 압축을 비활성화합니다. 수동 `/compact` 명령은 계속 사용 가능합니다. |
| `DISABLE_COMPACT` | `1`로 설정하면 모든 압축을 비활성화합니다: 자동 압축과 수동 `/compact` 명령 모두. |
| `DISABLE_COST_WARNINGS` | `1`로 설정하면 비용 경고 메시지를 비활성화합니다. |
| `DISABLE_DOCTOR_COMMAND` | `1`로 설정하면 `/doctor` 명령을 숨깁니다. 관리형 배포에서 유용합니다. |
| `DISABLE_ERROR_REPORTING` | `1`로 설정하면 Sentry 에러 보고를 옵트아웃합니다. |
| `DISABLE_EXTRA_USAGE_COMMAND` | `1`로 설정하면 사용자가 추가 사용량을 구매할 수 있는 `/extra-usage` 명령을 숨깁니다. |
