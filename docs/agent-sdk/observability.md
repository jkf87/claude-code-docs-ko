---
title: OpenTelemetry를 활용한 관찰 가능성
description: OpenTelemetry를 사용해 Agent SDK에서 traces, metrics, 이벤트를 관찰 가능성 백엔드로 내보내는 방법을 설명합니다.
---

# OpenTelemetry를 활용한 관찰 가능성

> Agent SDK에서 OpenTelemetry를 통해 traces, metrics, 이벤트를 관찰 가능성 백엔드로 내보낼 수 있습니다.

에이전트를 프로덕션에서 실행할 때는 에이전트가 수행한 작업을 파악할 수 있어야 합니다:

* 어떤 도구를 호출했는지
* 각 모델 요청에 얼마나 걸렸는지
* 토큰을 얼마나 소비했는지
* 어디서 오류가 발생했는지

Agent SDK는 이 데이터를 OpenTelemetry traces, metrics, 로그 이벤트로 내보낼 수 있으며, Honeycomb, Datadog, Grafana, Langfuse, 또는 자체 호스팅 컬렉터 등 OpenTelemetry Protocol(OTLP)을 지원하는 모든 백엔드로 전송할 수 있습니다.

이 가이드는 SDK가 텔레메트리를 어떻게 내보내는지, 내보내기를 어떻게 설정하는지, 그리고 데이터가 백엔드에 도달한 후 태그를 붙이고 필터링하는 방법을 설명합니다. 백엔드에 내보내는 대신 SDK 응답 스트림에서 직접 토큰 사용량과 비용을 읽으려면 [비용 및 사용량 추적](/agent-sdk/cost-tracking)을 참고하세요.

## SDK에서 텔레메트리가 흐르는 방식

Agent SDK는 Claude Code CLI를 자식 프로세스로 실행하고 로컬 파이프를 통해 통신합니다. CLI에는 OpenTelemetry 계측이 내장되어 있어, 각 모델 요청과 도구 실행 주변에 spans를 기록하고 토큰 및 비용 카운터에 대한 metrics를 내보내며 프롬프트와 도구 결과에 대한 구조화된 로그 이벤트를 생성합니다. SDK 자체는 텔레메트리를 생성하지 않습니다. 대신 CLI 프로세스에 설정을 전달하고, CLI가 직접 컬렉터로 내보냅니다.

설정은 환경 변수로 전달됩니다. 기본적으로 자식 프로세스는 애플리케이션 환경을 상속하므로, 다음 두 곳 중 한 곳에서 텔레메트리를 설정할 수 있습니다:

* **프로세스 환경:** 애플리케이션이 시작되기 전에 셸, 컨테이너, 또는 오케스트레이터에서 변수를 설정합니다. 모든 `query()` 호출이 코드 변경 없이 자동으로 이를 적용합니다. 이 방법이 프로덕션 배포에서 권장되는 방식입니다.
* **호출별 옵션:** Python에서는 `ClaudeAgentOptions.env`, TypeScript에서는 `options.env`에 변수를 설정합니다. 동일한 프로세스 내의 여러 에이전트가 서로 다른 텔레메트리 설정을 필요로 할 때 사용합니다. Python에서 `env`는 상속된 환경 위에 병합됩니다. TypeScript에서 `env`는 상속된 환경을 완전히 대체하므로, 전달하는 객체에 `...process.env`를 포함시켜야 합니다.

CLI는 세 가지 독립적인 OpenTelemetry 신호를 내보냅니다. 각각 자체적인 활성화 스위치와 내보내기 설정이 있으므로, 필요한 것만 켤 수 있습니다.

| 신호        | 포함 내용                                                                         | 활성화 방법                                                             |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Metrics    | 토큰, 비용, 세션, 코드 줄 수, 도구 결정에 대한 카운터                              | `OTEL_METRICS_EXPORTER`                                                 |
| Log events | 각 프롬프트, API 요청, API 오류, 도구 결과에 대한 구조화된 레코드                  | `OTEL_LOGS_EXPORTER`                                                    |
| Traces     | 각 인터랙션, 모델 요청, 도구 호출, 훅에 대한 spans (베타)                         | `OTEL_TRACES_EXPORTER` + `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`        |

메트릭 이름, 이벤트 이름, 속성의 전체 목록은 Claude Code [모니터링](/monitoring-usage) 참조 문서를 확인하세요. Agent SDK는 동일한 CLI를 실행하므로 같은 데이터를 내보냅니다. Span 이름은 아래의 [에이전트 traces 읽기](#에이전트-traces-읽기) 섹션에 나와 있습니다.

## 텔레메트리 내보내기 활성화

텔레메트리는 `CLAUDE_CODE_ENABLE_TELEMETRY=1`을 설정하고 하나 이상의 내보내기를 선택할 때까지 비활성화 상태입니다. 가장 일반적인 설정은 세 신호 모두를 OTLP HTTP를 통해 컬렉터로 전송합니다.

다음 예시는 딕셔너리에 변수를 설정하고 `options.env`를 통해 전달합니다. 에이전트는 단일 태스크를 실행하고, CLI는 루프가 응답 스트림을 소비하는 동안 `collector.example.com`의 컬렉터로 spans, metrics, 이벤트를 내보냅니다:

::: code-group
```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

OTEL_ENV = {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    # traces는 베타 기능이므로 필수입니다. metrics와 log events에는 필요하지 않습니다.
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    # 신호별 내보내기를 선택합니다. SDK에서는 otlp를 사용하세요. 아래 참고사항을 확인하세요.
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    # 표준 OTLP 전송 설정입니다.
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.example.com:4318",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer your-token",
}


async def main():
    options = ClaudeAgentOptions(env=OTEL_ENV)
    async for message in query(
        prompt="List the files in this directory", options=options
    ):
        print(message)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

const otelEnv = {
  CLAUDE_CODE_ENABLE_TELEMETRY: "1",
  // traces는 베타 기능이므로 필수입니다. metrics와 log events에는 필요하지 않습니다.
  CLAUDE_CODE_ENHANCED_TELEMETRY_BETA: "1",
  // 신호별 내보내기를 선택합니다. SDK에서는 otlp를 사용하세요. 아래 참고사항을 확인하세요.
  OTEL_TRACES_EXPORTER: "otlp",
  OTEL_METRICS_EXPORTER: "otlp",
  OTEL_LOGS_EXPORTER: "otlp",
  // 표준 OTLP 전송 설정입니다.
  OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://collector.example.com:4318",
  OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Bearer your-token",
};

for await (const message of query({
  prompt: "List the files in this directory",
  // TypeScript에서 env는 상속된 환경을 대체하므로, PATH, ANTHROPIC_API_KEY 등의
  // 변수를 유지하려면 process.env를 먼저 전개(spread)하세요.
  options: { env: { ...process.env, ...otelEnv } },
})) {
  console.log(message);
}
```
:::

자식 프로세스는 기본적으로 애플리케이션 환경을 상속하므로, Dockerfile, Kubernetes 매니페스트, 또는 셸 프로파일에서 이 변수들을 내보내고 `options.env`를 완전히 생략해도 동일한 결과를 얻을 수 있습니다.

::: info
`console` 내보내기는 SDK가 메시지 채널로 사용하는 표준 출력에 텔레메트리를 씁니다. SDK를 통해 실행할 때는 `console`을 내보내기 값으로 설정하지 마세요. 텔레메트리를 로컬에서 검사하려면 `OTEL_EXPORTER_OTLP_ENDPOINT`를 로컬 컬렉터나 올인원 Jaeger 컨테이너로 지정하세요.
:::

### 단기 호출에서 텔레메트리 플러시

CLI는 텔레메트리를 배치로 처리하고 일정 간격으로 내보냅니다. 프로세스가 정상적으로 종료되면 대기 중인 데이터를 플러시하므로, 정상적으로 완료된 `query()` 호출은 spans를 잃지 않습니다. 그러나 CLI가 종료되기 전에 프로세스가 강제 종료되면 배치 버퍼에 남아있는 데이터는 손실됩니다. 내보내기 간격을 줄이면 이 위험을 줄일 수 있습니다.

기본적으로 metrics는 60초마다, traces와 로그는 5초마다 내보냅니다. 다음 예시는 짧은 태스크가 실행되는 동안 데이터가 컬렉터에 도달할 수 있도록 세 간격을 모두 줄입니다:

::: code-group
```python [Python]
OTEL_ENV = {
    # ... 이전 예시의 내보내기 설정 ...
    "OTEL_METRIC_EXPORT_INTERVAL": "1000",
    "OTEL_LOGS_EXPORT_INTERVAL": "1000",
    "OTEL_TRACES_EXPORT_INTERVAL": "1000",
}
```

```typescript [TypeScript]
const otelEnv = {
  // ... 이전 예시의 내보내기 설정 ...
  OTEL_METRIC_EXPORT_INTERVAL: "1000",
  OTEL_LOGS_EXPORT_INTERVAL: "1000",
  OTEL_TRACES_EXPORT_INTERVAL: "1000",
};
```
:::

## 에이전트 traces 읽기

Traces는 에이전트 실행에 대한 가장 자세한 뷰를 제공합니다. `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`이 설정되면, 에이전트 루프의 각 단계가 트레이싱 백엔드에서 검사할 수 있는 span이 됩니다:

* **`claude_code.interaction`:** 프롬프트를 받는 것부터 응답을 생성하는 것까지 에이전트 루프의 단일 턴을 감쌉니다.
* **`claude_code.llm_request`:** Claude API에 대한 각 호출을 감싸며, 모델 이름, 지연 시간, 토큰 수를 속성으로 포함합니다.
* **`claude_code.tool`:** 각 도구 호출을 감싸며, 권한 대기(`claude_code.tool.blocked_on_user`)와 실행(`claude_code.tool.execution`) 자체에 대한 자식 spans를 포함합니다.
* **`claude_code.hook`:** 각 [훅](/agent-sdk/hooks) 실행을 감쌉니다.

모든 span은 `session.id` 속성을 가집니다. 동일한 [세션](/agent-sdk/sessions)에 대해 여러 번 `query()`를 호출할 때, 백엔드에서 `session.id`로 필터링하면 하나의 타임라인으로 볼 수 있습니다.

::: info
Tracing은 베타 기능입니다. Span 이름과 속성은 릴리스 사이에 변경될 수 있습니다. 트레이스 내보내기 설정 변수는 모니터링 참조의 [Traces (베타)](/monitoring-usage#traces-beta)를 참고하세요.
:::

## 에이전트 텔레메트리에 태그 추가

기본적으로 CLI는 `service.name`을 `claude-code`로 보고합니다. 여러 에이전트를 실행하거나, 동일한 컬렉터로 내보내는 다른 서비스와 함께 SDK를 실행하는 경우, 서비스 이름을 재정의하고 리소스 속성을 추가해 백엔드에서 에이전트별로 필터링할 수 있습니다.

다음 예시는 서비스 이름을 변경하고 배포 메타데이터를 추가합니다. 이 값들은 에이전트가 내보내는 모든 span, metric, 이벤트에 OpenTelemetry 리소스 속성으로 적용됩니다:

::: code-group
```python [Python]
options = ClaudeAgentOptions(
    env={
        # ... 내보내기 설정 ...
        "OTEL_SERVICE_NAME": "support-triage-agent",
        "OTEL_RESOURCE_ATTRIBUTES": "service.version=1.4.0,deployment.environment=production",
    },
)
```

```typescript [TypeScript]
const options = {
  env: {
    ...process.env,
    // ... 내보내기 설정 ...
    OTEL_SERVICE_NAME: "support-triage-agent",
    OTEL_RESOURCE_ATTRIBUTES:
      "service.version=1.4.0,deployment.environment=production",
  },
};
```
:::

## 내보내는 데이터에서 민감한 정보 제어

텔레메트리는 기본적으로 구조적입니다. 토큰 수, 소요 시간, 모델 이름, 도구 이름은 항상 기록되지만, 에이전트가 읽고 쓰는 콘텐츠 자체는 기록되지 않습니다. 세 가지 opt-in 변수를 통해 내보내는 데이터에 콘텐츠를 추가할 수 있습니다:

| 변수                        | 추가 내용                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_LOG_USER_PROMPTS=1`   | `claude_code.user_prompt` 이벤트와 `claude_code.interaction` span에 프롬프트 텍스트 추가                                                               |
| `OTEL_LOG_TOOL_DETAILS=1`   | `claude_code.tool_result` 이벤트에 도구 입력 인수(파일 경로, 셸 명령어, 검색 패턴) 추가                                                                |
| `OTEL_LOG_TOOL_CONTENT=1`   | `claude_code.tool`의 span 이벤트로 전체 도구 입력 및 출력 본문을 추가하며, 60 KB에서 잘립니다. [tracing](#에이전트-traces-읽기) 활성화가 필요합니다      |

에이전트가 처리하는 데이터를 저장하도록 승인된 관찰 가능성 파이프라인이 아니라면 이 변수들을 설정하지 마세요. 속성의 전체 목록과 리댁션 동작은 모니터링 참조의 [보안 및 개인정보](/monitoring-usage#security-and-privacy) 섹션을 참고하세요.

## 관련 문서

에이전트 모니터링과 배포에 관련된 가이드입니다:

* [비용 및 사용량 추적](/agent-sdk/cost-tracking): 외부 백엔드 없이 메시지 스트림에서 직접 토큰 및 비용 데이터를 읽습니다.
* [Agent SDK 호스팅](/agent-sdk/hosting): OpenTelemetry 변수를 환경 수준에서 설정할 수 있는 컨테이너에 에이전트를 배포합니다.
* [모니터링](/monitoring-usage): CLI가 내보내는 모든 환경 변수, 메트릭, 이벤트에 대한 완전한 참조 문서입니다.
