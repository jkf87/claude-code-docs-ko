---
title: Google Vertex AI에서 Claude Code 사용하기
description: Google Vertex AI를 통해 Claude Code를 구성하는 방법을 알아봅니다. 설정, IAM 구성, 문제 해결을 포함합니다.
---

# Google Vertex AI에서 Claude Code 사용하기

## 사전 요구 사항 {#prerequisites}

Vertex AI로 Claude Code를 구성하기 전에 다음을 확인하세요:

* 결제가 활성화된 Google Cloud Platform (GCP) 계정
* Vertex AI API가 활성화된 GCP 프로젝트
* 원하는 Claude 모델에 대한 액세스 (예: Claude Sonnet 4.6)
* Google Cloud SDK (`gcloud`) 설치 및 구성
* 원하는 GCP 리전에 할당된 할당량

자체 Vertex AI 자격 증명으로 로그인하려면 아래의 [Vertex AI로 로그인](#sign-in-with-vertex-ai)을 따르세요. 팀 전체에 Claude Code를 배포하려면 [수동 설정](#set-up-manually) 단계를 사용하고 배포 전에 [모델 버전을 고정](#5-pin-model-versions)하세요.

## Vertex AI로 로그인 {#sign-in-with-vertex-ai}

Google Cloud 자격 증명이 있고 Vertex AI를 통해 Claude Code를 사용하려면, 로그인 마법사가 안내합니다. GCP 측 사전 요구 사항은 프로젝트당 한 번 완료하면 되며, 마법사가 Claude Code 측을 처리합니다.

::: info 참고
Vertex AI 설정 마법사는 Claude Code v2.1.98 이상이 필요합니다. `claude --version`으로 확인하세요.
:::

### 1단계: GCP 프로젝트에서 Claude 모델 활성화

프로젝트에 [Vertex AI API를 활성화](#1-enable-vertex-ai-api)한 다음, [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)에서 원하는 Claude 모델에 대한 액세스를 요청하세요. 계정에 필요한 권한은 [IAM 구성](#iam-configuration)을 참조하세요.

### 2단계: Claude Code를 시작하고 Vertex AI 선택

`claude`를 실행합니다. 로그인 프롬프트에서 **3rd-party platform**을 선택한 다음 **Google Vertex AI**를 선택합니다.

### 3단계: 마법사 프롬프트 따르기

Google Cloud에 인증하는 방법을 선택합니다: `gcloud`의 Application Default Credentials, 서비스 계정 키 파일, 또는 환경에 이미 있는 자격 증명. 마법사가 프로젝트와 리전을 감지하고, 프로젝트에서 호출할 수 있는 Claude 모델을 확인하며, 고정할 수 있게 합니다. 결과를 [사용자 설정 파일](/settings)의 `env` 블록에 저장하므로 직접 환경 변수를 내보낼 필요가 없습니다.

로그인한 후 언제든지 `/setup-vertex`를 실행하여 마법사를 다시 열고 자격 증명, 프로젝트, 리전 또는 모델 고정을 변경할 수 있습니다.

## 리전 구성 {#region-configuration}

Claude Code는 Vertex AI [글로벌](https://cloud.google.com/blog/products/ai-machine-learning/global-endpoint-for-claude-models-generally-available-on-vertex-ai) 및 리전 엔드포인트 모두에서 사용할 수 있습니다.

::: info 참고
Vertex AI는 모든 [리전](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#genai-partner-models)이나 [글로벌 엔드포인트](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-partner-models#supported_models)에서 Claude Code 기본 모델을 지원하지 않을 수 있습니다. 지원되는 리전으로 전환하거나, 리전 엔드포인트를 사용하거나, 지원되는 모델을 지정해야 할 수 있습니다.
:::

## 수동 설정 {#set-up-manually}

마법사 대신 환경 변수를 통해 Vertex AI를 구성하려면(예: CI 또는 스크립트로 된 엔터프라이즈 배포), 아래 단계를 따르세요.

### 1. Vertex AI API 활성화 {#1-enable-vertex-ai-api}

GCP 프로젝트에서 Vertex AI API를 활성화합니다:

```bash
# 프로젝트 ID 설정
gcloud config set project YOUR-PROJECT-ID

# Vertex AI API 활성화
gcloud services enable aiplatform.googleapis.com
```

### 2. 모델 액세스 요청 {#2-request-model-access}

Vertex AI에서 Claude 모델에 대한 액세스를 요청합니다:

1. [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)으로 이동합니다
2. "Claude" 모델을 검색합니다
3. 원하는 Claude 모델에 대한 액세스를 요청합니다 (예: Claude Sonnet 4.6)
4. 승인을 기다립니다 (24-48시간 소요될 수 있음)

### 3. GCP 자격 증명 구성 {#3-configure-gcp-credentials}

Claude Code는 표준 Google Cloud 인증을 사용합니다.

자세한 내용은 [Google Cloud 인증 문서](https://cloud.google.com/docs/authentication)를 참조하세요.

::: info 참고
인증 시 Claude Code는 `ANTHROPIC_VERTEX_PROJECT_ID` 환경 변수의 프로젝트 ID를 자동으로 사용합니다. 이를 재정의하려면 다음 환경 변수 중 하나를 설정하세요: `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT`, 또는 `GOOGLE_APPLICATION_CREDENTIALS`.
:::

### 4. Claude Code 구성 {#4-configure-claude-code}

다음 환경 변수를 설정합니다:

```bash
# Vertex AI 통합 활성화
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# 선택 사항: 커스텀 엔드포인트 또는 게이트웨이용 Vertex 엔드포인트 URL 재정의
# export ANTHROPIC_VERTEX_BASE_URL=https://aiplatform.googleapis.com

# 선택 사항: 필요한 경우 프롬프트 캐싱 비활성화
export DISABLE_PROMPT_CACHING=1

# CLOUD_ML_REGION=global일 때, 글로벌 엔드포인트를 지원하지 않는 모델의 리전 재정의
export VERTEX_REGION_CLAUDE_HAIKU_4_5=us-east5
export VERTEX_REGION_CLAUDE_4_6_SONNET=europe-west1
```

대부분의 모델 버전에는 대응하는 `VERTEX_REGION_CLAUDE_*` 변수가 있습니다. 전체 목록은 [환경 변수 참조](/env-vars)를 확인하세요. [Vertex Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)에서 어떤 모델이 글로벌 엔드포인트와 리전 전용을 지원하는지 확인하세요.

[프롬프트 캐싱](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)은 `cache_control` ephemeral 플래그를 지정하면 자동으로 지원됩니다. 비활성화하려면 `DISABLE_PROMPT_CACHING=1`을 설정하세요. 더 높은 속도 제한을 원하면 Google Cloud 지원에 문의하세요. Vertex AI를 사용할 때 인증이 Google Cloud 자격 증명을 통해 처리되므로 `/login` 및 `/logout` 명령은 비활성화됩니다.

### 5. 모델 버전 고정 {#5-pin-model-versions}

::: warning 주의
여러 사용자에게 배포할 때는 특정 모델 버전을 고정하세요. 고정하지 않으면 `sonnet` 및 `opus`와 같은 모델 별칭이 최신 버전으로 확인되며, Anthropic이 업데이트를 릴리스할 때 Vertex AI 프로젝트에서 아직 활성화되지 않았을 수 있습니다. Claude Code는 최신 버전을 사용할 수 없을 때 시작 시 [이전 버전으로 폴백](#startup-model-checks)하지만, 고정하면 사용자가 새 모델로 이동하는 시점을 제어할 수 있습니다.
:::

이러한 환경 변수를 특정 Vertex AI 모델 ID로 설정합니다:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

현재 및 레거시 모델 ID는 [모델 개요](https://platform.claude.com/docs/en/about-claude/models/overview)를 참조하세요. 환경 변수 전체 목록은 [모델 구성](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

고정 변수가 설정되지 않은 경우 Claude Code가 사용하는 기본 모델:

| 모델 유형 | 기본값 |
| :--- | :--- |
| 기본 모델 | `claude-sonnet-4-5@20250929` |
| 소형/빠른 모델 | `claude-haiku-4-5@20251001` |

모델을 추가로 커스터마이즈하려면:

```bash
export ANTHROPIC_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

## 시작 시 모델 확인 {#startup-model-checks}

Vertex AI가 구성된 상태에서 Claude Code가 시작되면, 프로젝트에서 사용하려는 모델에 접근할 수 있는지 확인합니다. 이 확인은 Claude Code v2.1.98 이상이 필요합니다.

현재 Claude Code 기본값보다 오래된 모델 버전을 고정했고 프로젝트에서 최신 버전을 호출할 수 있는 경우, Claude Code가 고정을 업데이트하라는 메시지를 표시합니다. 수락하면 새 모델 ID가 [사용자 설정 파일](/settings)에 기록되고 Claude Code가 재시작됩니다. 거부하면 다음 기본 버전 변경 시까지 기억됩니다.

모델을 고정하지 않았고 현재 기본값을 프로젝트에서 사용할 수 없는 경우, Claude Code는 현재 세션에 대해 이전 버전으로 폴백하고 알림을 표시합니다. 폴백은 유지되지 않습니다. [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)에서 최신 모델을 활성화하거나 [버전을 고정](#5-pin-model-versions)하여 선택을 영구적으로 만드세요.

## IAM 구성 {#iam-configuration}

필요한 IAM 권한을 할당합니다:

`roles/aiplatform.user` 역할에는 필요한 권한이 포함되어 있습니다:

* `aiplatform.endpoints.predict` - 모델 호출 및 토큰 카운팅에 필요

더 제한적인 권한을 위해 위의 권한만 포함하는 커스텀 역할을 만드세요.

자세한 내용은 [Vertex IAM 문서](https://cloud.google.com/vertex-ai/docs/general/access-control)를 참조하세요.

::: info 참고
비용 추적과 액세스 제어를 간소화하기 위해 Claude Code 전용 GCP 프로젝트를 만드세요.
:::

## 1M 토큰 컨텍스트 윈도우 {#1m-token-context-window}

Claude Opus 4.6, Sonnet 4.6, Sonnet 4.5, Sonnet 4는 Vertex AI에서 [1M 토큰 컨텍스트 윈도우](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)를 지원합니다. Claude Code는 1M 모델 변형을 선택하면 자동으로 확장된 컨텍스트 윈도우를 활성화합니다.

고정된 모델에 1M 컨텍스트 윈도우를 활성화하려면 모델 ID에 `[1m]`을 추가하세요. 자세한 내용은 [서드파티 배포를 위한 모델 고정](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

## 문제 해결 {#troubleshooting}

할당량 문제가 발생하는 경우:

* [Cloud Console](https://cloud.google.com/docs/quotas/view-manage)을 통해 현재 할당량을 확인하거나 할당량 증가를 요청하세요

"model not found" 404 오류가 발생하는 경우:

* [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)에서 모델이 활성화되어 있는지 확인하세요
* 지정한 리전에 대한 액세스가 있는지 확인하세요
* `CLOUD_ML_REGION=global`을 사용하는 경우, [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)의 "Supported features"에서 모델이 글로벌 엔드포인트를 지원하는지 확인하세요. 글로벌 엔드포인트를 지원하지 않는 모델의 경우:
  * `ANTHROPIC_MODEL` 또는 `ANTHROPIC_DEFAULT_HAIKU_MODEL`을 통해 지원되는 모델을 지정하거나
  * `VERTEX_REGION_<MODEL_NAME>` 환경 변수를 사용하여 리전 엔드포인트를 설정하세요

429 오류가 발생하는 경우:

* 리전 엔드포인트의 경우, 기본 모델과 소형/빠른 모델이 선택한 리전에서 지원되는지 확인하세요
* 더 나은 가용성을 위해 `CLOUD_ML_REGION=global`로 전환하는 것을 고려하세요

## 추가 리소스 {#additional-resources}

* [Vertex AI 문서](https://cloud.google.com/vertex-ai/docs)
* [Vertex AI 가격](https://cloud.google.com/vertex-ai/pricing)
* [Vertex AI 할당량 및 제한](https://cloud.google.com/vertex-ai/docs/quotas)
