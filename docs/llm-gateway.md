---
title: LLM 게이트웨이 설정
description: Claude Code를 LLM 게이트웨이 솔루션과 함께 사용하도록 설정하는 방법을 알아봅니다. 게이트웨이 요구 사항, 인증 설정, 모델 선택 및 공급자별 엔드포인트 설정을 다룹니다.
---

# LLM 게이트웨이 설정

LLM 게이트웨이는 Claude Code와 모델 공급자 사이에 중앙 집중식 프록시 계층을 제공하며, 주로 다음을 제공합니다:

* **중앙 집중식 인증** - API 키 관리를 위한 단일 지점
* **사용량 추적** - 팀 및 프로젝트 전반의 사용량 모니터링
* **비용 제어** - 예산 및 속도 제한 구현
* **감사 로깅** - 규정 준수를 위한 모든 모델 상호 작용 추적
* **모델 라우팅** - 코드 변경 없이 공급자 전환

## 게이트웨이 요구 사항

LLM 게이트웨이가 Claude Code와 작동하려면 다음 요구 사항을 충족해야 합니다:

**API 형식**

게이트웨이는 클라이언트에 다음 API 형식 중 최소 하나를 노출해야 합니다:

1. **Anthropic Messages**: `/v1/messages`, `/v1/messages/count_tokens`
   * 요청 헤더를 전달해야 합니다: `anthropic-beta`, `anthropic-version`

2. **Bedrock InvokeModel**: `/invoke`, `/invoke-with-response-stream`
   * 요청 본문 필드를 보존해야 합니다: `anthropic_beta`, `anthropic_version`

3. **Vertex rawPredict**: `:rawPredict`, `:streamRawPredict`, `/count-tokens:rawPredict`
   * 요청 헤더를 전달해야 합니다: `anthropic-beta`, `anthropic-version`

헤더를 전달하지 않거나 본문 필드를 보존하지 않으면 기능이 제한되거나 Claude Code 기능을 사용할 수 없을 수 있습니다.

::: info 참고
Claude Code는 API 형식에 따라 활성화할 기능을 결정합니다. Bedrock 또는 Vertex에서 Anthropic Messages 형식을 사용할 때는 환경 변수 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`을 설정해야 할 수 있습니다.
:::

**요청 헤더**

Claude Code는 모든 API 요청에 다음 헤더를 포함합니다:

| 헤더 | 설명 |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `X-Claude-Code-Session-Id` | 현재 Claude Code 세션의 고유 식별자입니다. 프록시는 요청 본문을 파싱하지 않고도 이를 사용하여 단일 세션의 모든 API 요청을 집계할 수 있습니다. |

## 설정

### 모델 선택

기본적으로 Claude Code는 선택된 API 형식에 대한 표준 모델 이름을 사용합니다.

게이트웨이에서 커스텀 모델 이름을 구성한 경우, [모델 설정](/model-config)에 문서화된 환경 변수를 사용하여 커스텀 이름과 일치시키세요.

## LiteLLM 설정

::: warning 주의
LiteLLM PyPI 버전 1.82.7 및 1.82.8은 자격 증명 탈취 멀웨어에 감염되었습니다. 이 버전을 설치하지 마세요. 이미 설치한 경우:

* 패키지를 제거하세요
* 영향을 받은 시스템의 모든 자격 증명을 교체하세요
* [BerriAI/litellm#24518](https://github.com/BerriAI/litellm/issues/24518)의 조치 단계를 따르세요

LiteLLM은 타사 프록시 서비스입니다. Anthropic은 LiteLLM의 보안이나 기능을 보증, 유지 관리 또는 감사하지 않습니다. 이 가이드는 정보 제공 목적으로 제공되며 오래될 수 있습니다. 자체 판단하에 사용하세요.
:::

### 전제 조건

* 최신 버전으로 업데이트된 Claude Code
* 배포되고 접근 가능한 LiteLLM Proxy Server
* 선택한 공급자를 통한 Claude 모델 접근

### 기본 LiteLLM 설정

**Claude Code 설정**:

#### 인증 방법

##### 정적 API 키

고정 API 키를 사용하는 가장 간단한 방법:

```bash  theme={null}
# 환경에 설정
export ANTHROPIC_AUTH_TOKEN=sk-litellm-static-key

# 또는 Claude Code 설정에서
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-litellm-static-key"
  }
}
```

이 값은 `Authorization` 헤더로 전송됩니다.

##### 헬퍼를 사용한 동적 API 키

키 순환 또는 사용자별 인증용:

1. API 키 헬퍼 스크립트를 생성합니다:

```bash  theme={null}
#!/bin/bash
# ~/bin/get-litellm-key.sh

# 예시: vault에서 키 가져오기
vault kv get -field=api_key secret/litellm/claude-code

# 예시: JWT 토큰 생성
jwt encode \
  --secret="${JWT_SECRET}" \
  --exp="+1h" \
  '{"user":"'${USER}'","team":"engineering"}'
```

2. 헬퍼를 사용하도록 Claude Code 설정을 구성합니다:

```json  theme={null}
{
  "apiKeyHelper": "~/bin/get-litellm-key.sh"
}
```

3. 토큰 갱신 간격을 설정합니다:

```bash  theme={null}
# 매시간 갱신 (3600000 ms)
export CLAUDE_CODE_API_KEY_HELPER_TTL_MS=3600000
```

이 값은 `Authorization` 및 `X-Api-Key` 헤더로 전송됩니다. `apiKeyHelper`는 `ANTHROPIC_AUTH_TOKEN` 또는 `ANTHROPIC_API_KEY`보다 낮은 우선순위를 가집니다.

#### 통합 엔드포인트 (권장)

LiteLLM의 [Anthropic 형식 엔드포인트](https://docs.litellm.ai/docs/anthropic_unified) 사용:

```bash  theme={null}
export ANTHROPIC_BASE_URL=https://litellm-server:4000
```

**통합 엔드포인트의 패스스루 엔드포인트 대비 이점:**

* 로드 밸런싱
* 폴백
* 비용 추적 및 최종 사용자 추적에 대한 일관된 지원

#### 공급자별 패스스루 엔드포인트 (대안)

##### LiteLLM을 통한 Claude API

[패스스루 엔드포인트](https://docs.litellm.ai/docs/pass_through/anthropic_completion) 사용:

```bash  theme={null}
export ANTHROPIC_BASE_URL=https://litellm-server:4000/anthropic
```

##### LiteLLM을 통한 Amazon Bedrock

[패스스루 엔드포인트](https://docs.litellm.ai/docs/pass_through/bedrock) 사용:

```bash  theme={null}
export ANTHROPIC_BEDROCK_BASE_URL=https://litellm-server:4000/bedrock
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1
export CLAUDE_CODE_USE_BEDROCK=1
```

##### LiteLLM을 통한 Google Vertex AI

[패스스루 엔드포인트](https://docs.litellm.ai/docs/pass_through/vertex_ai) 사용:

```bash  theme={null}
export ANTHROPIC_VERTEX_BASE_URL=https://litellm-server:4000/vertex_ai/v1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project-id
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
```

더 자세한 정보는 [LiteLLM 문서](https://docs.litellm.ai/)를 참조하세요.

## 추가 리소스

* [LiteLLM 문서](https://docs.litellm.ai/)
* [Claude Code 설정](/settings)
* [엔터프라이즈 네트워크 설정](/network-config)
* [서드파티 통합 개요](/third-party-integrations)
