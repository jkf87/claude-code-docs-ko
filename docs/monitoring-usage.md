---
title: 모니터링
description: "Claude Code에서 OpenTelemetry를 활성화하고 구성하는 방법을 알아보세요."
---

# 모니터링

OpenTelemetry(OTel)를 통해 텔레메트리 데이터를 내보내어 조직 전반의 Claude Code 사용량, 비용, 도구 활동을 추적하세요. Claude Code는 표준 메트릭 프로토콜을 통해 시계열 데이터로 메트릭을, 로그/이벤트 프로토콜을 통해 이벤트를, 선택적으로 [트레이스 프로토콜](#traces-beta)을 통해 분산 트레이스를 내보냅니다. 모니터링 요구 사항에 맞게 메트릭, 로그, 트레이스 백엔드를 구성하세요.

## 빠른 시작

환경 변수를 사용하여 OpenTelemetry를 구성하세요:

```bash
# 1. 텔레메트리 활성화
export CLAUDE_CODE_ENABLE_TELEMETRY=1

# 2. 익스포터 선택 (둘 다 선택 사항 - 필요한 것만 구성)
export OTEL_METRICS_EXPORTER=otlp       # 옵션: otlp, prometheus, console, none
export OTEL_LOGS_EXPORTER=otlp          # 옵션: otlp, console, none

# 3. OTLP 엔드포인트 구성 (OTLP 익스포터의 경우)
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# 4. 인증 설정 (필요한 경우)
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"

# 5. 디버깅용: 내보내기 간격 줄이기
export OTEL_METRIC_EXPORT_INTERVAL=10000  # 10초 (기본값: 60000ms)
export OTEL_LOGS_EXPORT_INTERVAL=5000     # 5초 (기본값: 5000ms)

# 6. Claude Code 실행
claude
```

::: info
메트릭의 기본 내보내기 간격은 60초이고, 로그는 5초입니다. 설정 중에는 디버깅 목적으로 더 짧은 간격을 사용할 수 있습니다. 프로덕션 사용 시에는 이 값을 원래대로 되돌리는 것을 잊지 마세요.
:::

전체 구성 옵션은 [OpenTelemetry 사양](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)을 참고하세요.

## 관리자 구성

관리자는 [관리형 설정 파일](/settings#settings-files)을 통해 모든 사용자에 대한 OpenTelemetry 설정을 구성할 수 있습니다. 이를 통해 조직 전체의 텔레메트리 설정을 중앙에서 제어할 수 있습니다. 설정이 적용되는 방식에 대한 자세한 내용은 [설정 우선순위](/settings#settings-precedence)를 참고하세요.

관리형 설정 구성 예시:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "grpc",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.example.com:4317",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer example-token"
  }
}
```

::: info
관리형 설정은 MDM(모바일 기기 관리) 또는 기타 기기 관리 솔루션을 통해 배포할 수 있습니다. 관리형 설정 파일에 정의된 환경 변수는 높은 우선순위를 가지며 사용자가 재정의할 수 없습니다.
:::

## 구성 세부 사항

### 공통 구성 변수

| 환경 변수 | 설명 | 예시 값 |
| --- | --- | --- |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | 텔레메트리 수집 활성화 (필수) | `1` |
| `OTEL_METRICS_EXPORTER` | 메트릭 익스포터 유형, 쉼표로 구분. `none`으로 비활성화 | `console`, `otlp`, `prometheus`, `none` |
| `OTEL_LOGS_EXPORTER` | 로그/이벤트 익스포터 유형, 쉼표로 구분. `none`으로 비활성화 | `console`, `otlp`, `none` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | OTLP 익스포터 프로토콜, 모든 신호에 적용 | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | 모든 신호에 대한 OTLP 수집기 엔드포인트 | `http://localhost:4317` |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL` | 메트릭 프로토콜, 일반 설정을 재정의 | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` | OTLP 메트릭 엔드포인트, 일반 설정을 재정의 | `http://localhost:4318/v1/metrics` |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL` | 로그 프로토콜, 일반 설정을 재정의 | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | OTLP 로그 엔드포인트, 일반 설정을 재정의 | `http://localhost:4318/v1/logs` |
| `OTEL_EXPORTER_OTLP_HEADERS` | OTLP 인증 헤더 | `Authorization=Bearer token` |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY` | mTLS 인증을 위한 클라이언트 키 | 클라이언트 키 파일 경로 |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE` | mTLS 인증을 위한 클라이언트 인증서 | 클라이언트 인증서 파일 경로 |
| `OTEL_METRIC_EXPORT_INTERVAL` | 밀리초 단위 내보내기 간격 (기본값: 60000) | `5000`, `60000` |
| `OTEL_LOGS_EXPORT_INTERVAL` | 로그 내보내기 간격 (밀리초, 기본값: 5000) | `1000`, `10000` |
| `OTEL_LOG_USER_PROMPTS` | 사용자 프롬프트 내용 로깅 활성화 (기본값: 비활성화) | `1`로 활성화 |
| `OTEL_LOG_TOOL_DETAILS` | 도구 이벤트 및 트레이스 스팬 속성에서 도구 파라미터 및 입력 인수 로깅 활성화: Bash 명령어, MCP 서버 및 도구 이름, 스킬 이름, 도구 입력 (기본값: 비활성화) | `1`로 활성화 |
| `OTEL_LOG_TOOL_CONTENT` | 스팬 이벤트에서 도구 입력 및 출력 내용 로깅 활성화 (기본값: 비활성화). [트레이싱](#traces-beta) 필요. 내용은 60KB에서 잘림 | `1`로 활성화 |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | 메트릭 임시성 선호도 (기본값: `delta`). 백엔드가 누적 임시성을 요구하는 경우 `cumulative`로 설정 | `delta`, `cumulative` |
| `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` | 동적 헤더 갱신 간격 (기본값: 1740000ms / 29분) | `900000` |

### 메트릭 카디널리티 제어

다음 환경 변수는 카디널리티 관리를 위해 메트릭에 포함되는 속성을 제어합니다:

| 환경 변수 | 설명 | 기본값 | 비활성화 예시 |
| --- | --- | --- | --- |
| `OTEL_METRICS_INCLUDE_SESSION_ID` | 메트릭에 session.id 속성 포함 | `true` | `false` |
| `OTEL_METRICS_INCLUDE_VERSION` | 메트릭에 app.version 속성 포함 | `false` | `true` |
| `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` | 메트릭에 user.account\_uuid 및 user.account\_id 속성 포함 | `true` | `false` |

이 변수들은 메트릭의 카디널리티를 제어하여 메트릭 백엔드의 스토리지 요구사항과 쿼리 성능에 영향을 줍니다. 카디널리티가 낮을수록 일반적으로 성능이 좋고 스토리지 비용이 낮지만, 분석을 위한 데이터 세분성은 줄어듭니다.

### Traces (베타) {#traces-beta}

분산 트레이싱은 각 사용자 프롬프트를 해당 프롬프트가 유발하는 API 요청 및 도구 실행과 연결하는 스팬을 내보내므로, 트레이싱 백엔드에서 전체 요청을 단일 트레이스로 볼 수 있습니다.

트레이싱은 기본적으로 꺼져 있습니다. 활성화하려면 `CLAUDE_CODE_ENABLE_TELEMETRY=1`과 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`을 모두 설정하고, `OTEL_TRACES_EXPORTER`를 설정하여 스팬을 보낼 위치를 선택하세요. 트레이스는 엔드포인트, 프로토콜, 헤더에 대해 [공통 OTLP 구성](#공통-구성-변수)을 재사용합니다.

| 환경 변수 | 설명 | 예시 값 |
| --- | --- | --- |
| `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | 스팬 트레이싱 활성화 (필수). `ENABLE_ENHANCED_TELEMETRY_BETA`도 허용 | `1` |
| `OTEL_TRACES_EXPORTER` | 트레이스 익스포터 유형, 쉼표로 구분. `none`으로 비활성화 | `console`, `otlp`, `none` |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` | 트레이스 프로토콜, `OTEL_EXPORTER_OTLP_PROTOCOL`을 재정의 | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | OTLP 트레이스 엔드포인트, `OTEL_EXPORTER_OTLP_ENDPOINT`를 재정의 | `http://localhost:4318/v1/traces` |
| `OTEL_TRACES_EXPORT_INTERVAL` | 스팬 배치 내보내기 간격 (밀리초, 기본값: 5000) | `1000`, `10000` |

스팬은 기본적으로 사용자 프롬프트 텍스트, 도구 입력 세부 사항, 도구 내용을 마스킹합니다. `OTEL_LOG_USER_PROMPTS=1`, `OTEL_LOG_TOOL_DETAILS=1`, `OTEL_LOG_TOOL_CONTENT=1`을 설정하면 포함할 수 있습니다.

트레이싱이 활성화되면, Bash 및 PowerShell 서브프로세스는 활성 도구 실행 스팬의 W3C 트레이스 컨텍스트를 포함하는 `TRACEPARENT` 환경 변수를 자동으로 상속합니다. 이를 통해 `TRACEPARENT`를 읽는 모든 서브프로세스가 동일한 트레이스 아래에 자체 스팬을 부모로 설정할 수 있어, Claude가 실행하는 스크립트 및 명령을 통한 엔드-투-엔드 분산 트레이싱이 가능합니다.

### 동적 헤더

동적 인증이 필요한 엔터프라이즈 환경에서는 헤더를 동적으로 생성하는 스크립트를 구성할 수 있습니다:

#### 설정 구성

`.claude/settings.json`에 다음을 추가하세요:

```json
{
  "otelHeadersHelper": "/bin/generate_opentelemetry_headers.sh"
}
```

#### 스크립트 요구사항

스크립트는 HTTP 헤더를 나타내는 문자열 키-값 쌍으로 유효한 JSON을 출력해야 합니다:

```bash
#!/bin/bash
# 예시: 여러 헤더
echo "{\"Authorization\": \"Bearer $(get-token.sh)\", \"X-API-Key\": \"$(get-api-key.sh)\"}"
```

#### 갱신 동작

헤더 헬퍼 스크립트는 시작 시 실행되고, 토큰 갱신을 지원하기 위해 주기적으로 다시 실행됩니다. 기본적으로 스크립트는 29분마다 실행됩니다. `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` 환경 변수로 간격을 조정할 수 있습니다.

### 다중 팀 조직 지원

여러 팀이나 부서가 있는 조직은 `OTEL_RESOURCE_ATTRIBUTES` 환경 변수를 사용하여 다른 그룹을 구분하는 사용자 정의 속성을 추가할 수 있습니다:

```bash
# 팀 식별을 위한 사용자 정의 속성 추가
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=platform,cost_center=eng-123"
```

이 사용자 정의 속성은 모든 메트릭 및 이벤트에 포함되어 다음을 가능하게 합니다:

* 팀 또는 부서별 메트릭 필터링
* 비용 센터별 비용 추적
* 팀별 대시보드 생성
* 특정 팀에 대한 알림 설정

::: warning
**OTEL\_RESOURCE\_ATTRIBUTES에 대한 중요한 형식 요구사항:**

`OTEL_RESOURCE_ATTRIBUTES` 환경 변수는 엄격한 형식 요구사항이 있는 쉼표로 구분된 key=value 쌍을 사용합니다:

* **공백 불허**: 값에 공백이 포함될 수 없습니다. 예를 들어 `user.organizationName=My Company`는 유효하지 않습니다
* **형식**: 반드시 쉼표로 구분된 key=value 쌍이어야 합니다: `key1=value1,key2=value2`
* **허용 문자**: 제어 문자, 공백, 큰따옴표, 쉼표, 세미콜론, 역슬래시를 제외한 US-ASCII 문자만 허용
* **특수 문자**: 허용 범위 밖의 문자는 퍼센트 인코딩 필요

**예시:**

```bash
# ❌ 유효하지 않음 - 공백 포함
export OTEL_RESOURCE_ATTRIBUTES="org.name=John's Organization"

# ✅ 유효 - 언더스코어 또는 camelCase 사용
export OTEL_RESOURCE_ATTRIBUTES="org.name=Johns_Organization"
export OTEL_RESOURCE_ATTRIBUTES="org.name=JohnsOrganization"

# ✅ 유효 - 필요 시 특수 문자를 퍼센트 인코딩
export OTEL_RESOURCE_ATTRIBUTES="org.name=John%27s%20Organization"
```

참고: 값을 따옴표로 감싸도 공백이 이스케이프되지 않습니다. 예를 들어 `org.name="My Company"`는 `My Company`가 아닌 `"My Company"`(따옴표 포함)로 처리됩니다.
:::

### 구성 예시

`claude`를 실행하기 전에 이 환경 변수들을 설정하세요. 각 블록은 다른 익스포터 또는 배포 시나리오에 대한 완전한 구성을 보여줍니다:

```bash
# 콘솔 디버깅 (1초 간격)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=console
export OTEL_METRIC_EXPORT_INTERVAL=1000

# OTLP/gRPC
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# Prometheus
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=prometheus

# 여러 익스포터
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=console,otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/json

# 메트릭과 로그에 대해 다른 엔드포인트/백엔드 사용
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://metrics.example.com:4318
export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://logs.example.com:4317

# 메트릭만 (이벤트/로그 없음)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# 이벤트/로그만 (메트릭 없음)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## 사용 가능한 메트릭과 이벤트

### 표준 속성

모든 메트릭과 이벤트는 다음 표준 속성을 공유합니다:

| 속성 | 설명 | 제어 변수 |
| --- | --- | --- |
| `session.id` | 고유 세션 식별자 | `OTEL_METRICS_INCLUDE_SESSION_ID` (기본값: true) |
| `app.version` | 현재 Claude Code 버전 | `OTEL_METRICS_INCLUDE_VERSION` (기본값: false) |
| `organization.id` | 조직 UUID (인증된 경우) | 사용 가능한 경우 항상 포함 |
| `user.account_uuid` | 계정 UUID (인증된 경우) | `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` (기본값: true) |
| `user.account_id` | Anthropic 관리 API와 일치하는 태그 형식의 계정 ID (인증된 경우), 예: `user_01BWBeN28...` | `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` (기본값: true) |
| `user.id` | Claude Code 설치별로 생성되는 익명 기기/설치 식별자 | 항상 포함 |
| `user.email` | 사용자 이메일 주소 (OAuth를 통해 인증된 경우) | 사용 가능한 경우 항상 포함 |
| `terminal.type` | 터미널 유형 (예: `iTerm.app`, `vscode`, `cursor`, `tmux`) | 감지된 경우 항상 포함 |

이벤트에는 추가적으로 다음 속성이 포함됩니다. 이 속성들은 무한한 카디널리티를 유발하므로 메트릭에는 첨부되지 않습니다:

* `prompt.id`: 다음 프롬프트까지 사용자 프롬프트와 모든 후속 이벤트를 연결하는 UUID. [이벤트 상관 속성](#이벤트-상관-속성)을 참고하세요.
* `workspace.host_paths`: 데스크탑 앱에서 선택된 호스트 워크스페이스 디렉토리 (문자열 배열)

### 메트릭

Claude Code는 다음 메트릭을 내보냅니다:

| 메트릭 이름 | 설명 | 단위 |
| --- | --- | --- |
| `claude_code.session.count` | 시작된 CLI 세션 수 | count |
| `claude_code.lines_of_code.count` | 수정된 코드 라인 수 | count |
| `claude_code.pull_request.count` | 생성된 풀 리퀘스트 수 | count |
| `claude_code.commit.count` | 생성된 git 커밋 수 | count |
| `claude_code.cost.usage` | Claude Code 세션 비용 | USD |
| `claude_code.token.usage` | 사용된 토큰 수 | tokens |
| `claude_code.code_edit_tool.decision` | 코드 편집 도구 권한 결정 수 | count |
| `claude_code.active_time.total` | 총 활성 시간 (초) | s |

### 메트릭 세부 사항

각 메트릭에는 위에 나열된 표준 속성이 포함됩니다. 추가적인 컨텍스트별 속성이 있는 메트릭은 아래에 표시됩니다.

#### 세션 카운터

각 세션 시작 시 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)

#### 코드 라인 카운터

코드가 추가되거나 제거될 때 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)
* `type`: (`"added"`, `"removed"`)

#### 풀 리퀘스트 카운터

Claude Code를 통해 풀 리퀘스트를 생성할 때 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)

#### 커밋 카운터

Claude Code를 통해 git 커밋을 생성할 때 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)

#### 비용 카운터

각 API 요청 후 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)
* `model`: 모델 식별자 (예: "claude-sonnet-4-6")

#### 토큰 카운터

각 API 요청 후 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)
* `type`: (`"input"`, `"output"`, `"cacheRead"`, `"cacheCreation"`)
* `model`: 모델 식별자 (예: "claude-sonnet-4-6")

#### 코드 편집 도구 결정 카운터

사용자가 Edit, Write 또는 NotebookEdit 도구 사용을 수락하거나 거부할 때 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)
* `tool_name`: 도구 이름 (`"Edit"`, `"Write"`, `"NotebookEdit"`)
* `decision`: 사용자 결정 (`"accept"`, `"reject"`)
* `source`: 결정 출처 - `"config"`, `"hook"`, `"user_permanent"`, `"user_temporary"`, `"user_abort"`, 또는 `"user_reject"`
* `language`: 편집된 파일의 프로그래밍 언어 (예: `"TypeScript"`, `"Python"`, `"JavaScript"`, `"Markdown"`). 인식되지 않는 파일 확장자의 경우 `"unknown"` 반환.

#### 활성 시간 카운터

유휴 시간을 제외한 Claude Code를 실제로 사용한 시간을 추적합니다. 이 메트릭은 사용자 상호작용(타이핑, 응답 읽기) 중과 CLI 처리(도구 실행, AI 응답 생성) 중에 증가합니다.

**속성**:

* 모든 [표준 속성](#표준-속성)
* `type`: 키보드 상호작용의 경우 `"user"`, 도구 실행 및 AI 응답의 경우 `"cli"`

### 이벤트

Claude Code는 OpenTelemetry 로그/이벤트를 통해 다음 이벤트를 내보냅니다 (`OTEL_LOGS_EXPORTER`가 구성된 경우):

#### 이벤트 상관 속성 {#이벤트-상관-속성}

사용자가 프롬프트를 제출하면 Claude Code는 여러 API 호출을 하고 여러 도구를 실행할 수 있습니다. `prompt.id` 속성을 사용하면 이러한 모든 이벤트를 단일 프롬프트와 연결할 수 있습니다.

| 속성 | 설명 |
| --- | --- |
| `prompt.id` | 단일 사용자 프롬프트를 처리하는 동안 생성된 모든 이벤트를 연결하는 UUID v4 식별자 |

단일 프롬프트에 의해 트리거된 모든 활동을 추적하려면 특정 `prompt.id` 값으로 이벤트를 필터링하세요. 이렇게 하면 user\_prompt 이벤트, api\_request 이벤트, 해당 프롬프트를 처리하는 동안 발생한 tool\_result 이벤트가 반환됩니다.

::: info
`prompt.id`는 각 프롬프트가 고유한 ID를 생성하여 시계열 수가 계속 증가하므로 의도적으로 메트릭에서 제외됩니다. 이벤트 수준 분석 및 감사 추적에만 사용하세요.
:::

#### 사용자 프롬프트 이벤트

사용자가 프롬프트를 제출할 때 로깅됩니다.

**이벤트 이름**: `claude_code.user_prompt`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"user_prompt"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `prompt_length`: 프롬프트 길이
* `prompt`: 프롬프트 내용 (기본적으로 마스킹, `OTEL_LOG_USER_PROMPTS=1`로 활성화)

#### 도구 결과 이벤트

도구 실행이 완료될 때 로깅됩니다.

**이벤트 이름**: `claude_code.tool_result`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"tool_result"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `tool_name`: 도구 이름
* `success`: `"true"` 또는 `"false"`
* `duration_ms`: 실행 시간 (밀리초)
* `error`: 오류 메시지 (실패한 경우)
* `decision_type`: `"accept"` 또는 `"reject"`
* `decision_source`: 결정 출처 - `"config"`, `"hook"`, `"user_permanent"`, `"user_temporary"`, `"user_abort"`, 또는 `"user_reject"`
* `tool_result_size_bytes`: 도구 결과의 바이트 크기
* `mcp_server_scope`: MCP 서버 범위 식별자 (MCP 도구의 경우)
* `tool_parameters` (`OTEL_LOG_TOOL_DETAILS=1`일 때): 도구별 파라미터를 포함하는 JSON 문자열:
  * Bash 도구: `bash_command`, `full_command`, `timeout`, `description`, `dangerouslyDisableSandbox`, `git_commit_id` (`git commit` 명령어 성공 시 커밋 SHA) 포함
  * MCP 도구: `mcp_server_name`, `mcp_tool_name` 포함
  * Skill 도구: `skill_name` 포함
* `tool_input` (`OTEL_LOG_TOOL_DETAILS=1`일 때): JSON 직렬화된 도구 인수. 512자를 초과하는 개별 값은 잘리며, 전체 페이로드는 약 4K 문자로 제한됩니다. MCP 도구를 포함한 모든 도구에 적용됩니다.

#### API 요청 이벤트

Claude에 대한 각 API 요청 시 로깅됩니다.

**이벤트 이름**: `claude_code.api_request`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"api_request"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `model`: 사용된 모델 (예: "claude-sonnet-4-6")
* `cost_usd`: USD 기준 예상 비용
* `duration_ms`: 요청 소요 시간 (밀리초)
* `input_tokens`: 입력 토큰 수
* `output_tokens`: 출력 토큰 수
* `cache_read_tokens`: 캐시에서 읽은 토큰 수
* `cache_creation_tokens`: 캐시 생성에 사용된 토큰 수
* `speed`: `"fast"` 또는 `"normal"` - 빠른 모드 활성화 여부 표시

#### API 오류 이벤트

Claude에 대한 API 요청이 실패할 때 로깅됩니다.

**이벤트 이름**: `claude_code.api_error`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"api_error"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `model`: 사용된 모델 (예: "claude-sonnet-4-6")
* `error`: 오류 메시지
* `status_code`: 문자열로 된 HTTP 상태 코드 또는 비HTTP 오류의 경우 `"undefined"`
* `duration_ms`: 요청 소요 시간 (밀리초)
* `attempt`: 초기 요청을 포함한 총 시도 횟수 (`1`은 재시도 없음을 의미)
* `speed`: `"fast"` 또는 `"normal"` - 빠른 모드 활성화 여부 표시

#### 도구 결정 이벤트

도구 권한 결정(수락/거부)이 내려질 때 로깅됩니다.

**이벤트 이름**: `claude_code.tool_decision`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"tool_decision"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `tool_name`: 도구 이름 (예: "Read", "Edit", "Write", "NotebookEdit")
* `decision`: `"accept"` 또는 `"reject"`
* `source`: 결정 출처 - `"config"`, `"hook"`, `"user_permanent"`, `"user_temporary"`, `"user_abort"`, 또는 `"user_reject"`

#### 플러그인 설치 이벤트

`claude plugin install` CLI 명령어와 대화형 `/plugin` UI 모두에서 플러그인 설치가 완료될 때 로깅됩니다.

**이벤트 이름**: `claude_code.plugin_installed`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"plugin_installed"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `plugin.name`: 설치된 플러그인 이름
* `plugin.version`: 마켓플레이스 항목에 선언된 경우 플러그인 버전
* `marketplace.name`: 플러그인이 설치된 마켓플레이스
* `marketplace.is_official`: 마켓플레이스가 Anthropic 공식 마켓플레이스인 경우 `"true"`, 아닌 경우 `"false"`
* `install.trigger`: `"cli"` 또는 `"ui"`

#### 스킬 활성화 이벤트

스킬이 호출될 때 로깅됩니다.

**이벤트 이름**: `claude_code.skill_activated`

**속성**:

* 모든 [표준 속성](#표준-속성)
* `event.name`: `"skill_activated"`
* `event.timestamp`: ISO 8601 타임스탬프
* `event.sequence`: 세션 내 이벤트 순서를 위한 단조 증가 카운터
* `skill.name`: 스킬 이름
* `skill.source`: 스킬이 로드된 출처 (예: `"bundled"`, `"userSettings"`, `"projectSettings"`, `"plugin"`)
* `plugin.name`: 스킬이 플러그인에서 제공되는 경우 해당 플러그인 이름
* `marketplace.name`: 스킬이 플러그인에서 제공되는 경우 해당 플러그인이 설치된 마켓플레이스

## 메트릭 및 이벤트 데이터 해석

내보낸 메트릭과 이벤트는 다양한 분석을 지원합니다:

### 사용량 모니터링

| 메트릭 | 분석 기회 |
| --- | --- |
| `claude_code.token.usage` | `type`(입력/출력), 사용자, 팀 또는 모델별 세분화 |
| `claude_code.session.count` | 시간 경과에 따른 도입 및 참여 추적 |
| `claude_code.lines_of_code.count` | 코드 추가/제거 추적으로 생산성 측정 |
| `claude_code.commit.count` & `claude_code.pull_request.count` | 개발 워크플로우에 미치는 영향 파악 |

### 비용 모니터링

`claude_code.cost.usage` 메트릭은 다음을 지원합니다:

* 팀 또는 개인별 사용량 추세 추적
* 최적화를 위한 고사용량 세션 식별

::: info
비용 메트릭은 근사치입니다. 공식 청구 데이터는 API 제공업체(Claude Console, AWS Bedrock, 또는 Google Cloud Vertex)를 참고하세요.
:::

### 알림 및 세분화

고려할 일반적인 알림:

* 비용 급증
* 비정상적인 토큰 소비
* 특정 사용자의 높은 세션 볼륨

모든 메트릭은 `user.account_uuid`, `user.account_id`, `organization.id`, `session.id`, `model`, `app.version`으로 세분화할 수 있습니다.

### 재시도 소진 감지

Claude Code는 실패한 API 요청을 내부적으로 재시도하고, 포기한 후에만 단일 `claude_code.api_error` 이벤트를 발생시킵니다. 따라서 이벤트 자체가 해당 요청에 대한 최종 신호입니다. 중간 재시도 시도는 별도 이벤트로 로깅되지 않습니다.

이벤트의 `attempt` 속성은 총 시도 횟수를 기록합니다. `CLAUDE_CODE_MAX_RETRIES`(기본값 `10`)보다 큰 값은 일시적인 오류로 인해 모든 재시도가 소진되었음을 나타냅니다. 낮은 값은 `400` 응답과 같이 재시도 불가능한 오류를 나타냅니다.

복구된 세션과 중단된 세션을 구분하려면 `session.id`로 이벤트를 그룹화하고 오류 후에 이후 `api_request` 이벤트가 있는지 확인하세요.

### 이벤트 분석

이벤트 데이터는 Claude Code 상호작용에 대한 자세한 인사이트를 제공합니다:

**도구 사용 패턴**: 도구 결과 이벤트를 분석하여 다음을 파악합니다:

* 가장 자주 사용되는 도구
* 도구 성공률
* 평균 도구 실행 시간
* 도구 유형별 오류 패턴

**성능 모니터링**: API 요청 소요 시간 및 도구 실행 시간을 추적하여 성능 병목 현상을 파악합니다.

## 백엔드 고려사항

메트릭, 로그, 트레이스 백엔드 선택에 따라 수행할 수 있는 분석 유형이 결정됩니다:

### 메트릭의 경우

* **시계열 데이터베이스 (예: Prometheus)**: 비율 계산, 집계 메트릭
* **열 형식 저장소 (예: ClickHouse)**: 복잡한 쿼리, 고유 사용자 분석
* **풀 기능 관측성 플랫폼 (예: Honeycomb, Datadog)**: 고급 쿼리, 시각화, 알림

### 이벤트/로그의 경우

* **로그 집계 시스템 (예: Elasticsearch, Loki)**: 전체 텍스트 검색, 로그 분석
* **열 형식 저장소 (예: ClickHouse)**: 구조화된 이벤트 분석
* **풀 기능 관측성 플랫폼 (예: Honeycomb, Datadog)**: 메트릭과 이벤트 간 상관관계

### 트레이스의 경우

분산 트레이스 저장 및 스팬 상관을 지원하는 백엔드를 선택하세요:

* **분산 트레이싱 시스템 (예: Jaeger, Zipkin, Grafana Tempo)**: 스팬 시각화, 요청 워터폴, 지연 시간 분석
* **풀 기능 관측성 플랫폼 (예: Honeycomb, Datadog)**: 메트릭 및 로그와의 트레이스 검색 및 상관관계

DAU/WAU/MAU(일별/주별/월별 활성 사용자) 메트릭이 필요한 조직은 효율적인 고유 값 쿼리를 지원하는 백엔드를 고려하세요.

## 서비스 정보

모든 메트릭과 이벤트는 다음 리소스 속성과 함께 내보내집니다:

* `service.name`: `claude-code`
* `service.version`: 현재 Claude Code 버전
* `os.type`: 운영 체제 유형 (예: `linux`, `darwin`, `windows`)
* `os.version`: 운영 체제 버전 문자열
* `host.arch`: 호스트 아키텍처 (예: `amd64`, `arm64`)
* `wsl.version`: WSL 버전 번호 (Windows Subsystem for Linux에서 실행 중일 때만 표시)
* Meter Name: `com.anthropic.claude_code`

## ROI 측정 리소스

텔레메트리 설정, 비용 분석, 생산성 메트릭, 자동화 보고를 포함한 Claude Code 투자 수익 측정에 대한 포괄적인 가이드는 [Claude Code ROI 측정 가이드](https://github.com/anthropics/claude-code-monitoring-guide)를 참고하세요. 이 저장소는 바로 사용할 수 있는 Docker Compose 구성, Prometheus 및 OpenTelemetry 설정, Linear와 같은 도구와 통합된 생산성 보고서 생성 템플릿을 제공합니다.

## 보안 및 개인정보 보호

* 텔레메트리는 옵트인 방식이며 명시적인 구성이 필요합니다
* 원시 파일 내용 및 코드 스니펫은 메트릭이나 이벤트에 포함되지 않습니다. 트레이스 스팬은 별도의 데이터 경로입니다: 아래의 `OTEL_LOG_TOOL_CONTENT` 항목을 참고하세요
* OAuth를 통해 인증된 경우 `user.email`이 텔레메트리 속성에 포함됩니다. 조직에서 이것이 우려 사항이라면, 텔레메트리 백엔드와 협력하여 이 필드를 필터링하거나 마스킹하세요
* 사용자 프롬프트 내용은 기본적으로 수집되지 않습니다. 프롬프트 길이만 기록됩니다. 프롬프트 내용을 포함하려면 `OTEL_LOG_USER_PROMPTS=1`을 설정하세요
* 도구 입력 인수와 파라미터는 기본적으로 로깅되지 않습니다. 포함하려면 `OTEL_LOG_TOOL_DETAILS=1`을 설정하세요. 활성화하면 `tool_result` 이벤트에 Bash 명령어, MCP 서버 및 도구 이름, 스킬 이름을 포함하는 `tool_parameters` 속성과 파일 경로, URL, 검색 패턴 및 기타 인수를 포함하는 `tool_input` 속성이 포함됩니다. 트레이스 스팬에는 동일한 `tool_input` 속성과 `file_path`와 같은 입력 기반 속성이 포함됩니다. 512자를 초과하는 개별 값은 잘리고 총계는 약 4K 문자로 제한되지만, 인수에는 민감한 값이 포함될 수 있습니다. 필요에 따라 텔레메트리 백엔드에서 이러한 속성을 필터링하거나 마스킹하도록 구성하세요
* 도구 입력 및 출력 내용은 기본적으로 트레이스 스팬에 로깅되지 않습니다. 포함하려면 `OTEL_LOG_TOOL_CONTENT=1`을 설정하세요. 활성화하면 스팬 이벤트에 스팬당 60KB로 잘린 전체 도구 입력 및 출력 내용이 포함됩니다. 여기에는 Read 도구 결과의 원시 파일 내용과 Bash 명령어 출력이 포함될 수 있습니다. 필요에 따라 텔레메트리 백엔드에서 이러한 속성을 필터링하거나 마스킹하도록 구성하세요

## Amazon Bedrock에서 Claude Code 모니터링

Amazon Bedrock에 대한 자세한 Claude Code 사용량 모니터링 지침은 [Claude Code 모니터링 구현 (Bedrock)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock/blob/main/assets/docs/MONITORING.md)을 참고하세요.
