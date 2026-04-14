---
title: Amazon Bedrock에서 Claude Code 사용하기
description: Amazon Bedrock을 통해 Claude Code를 구성하는 방법을 알아봅니다. 설정, IAM 구성, 문제 해결을 포함합니다.
---

# Amazon Bedrock에서 Claude Code 사용하기

## 사전 요구 사항 {#prerequisites}

Bedrock으로 Claude Code를 구성하기 전에 다음을 확인하세요:

* Bedrock 액세스가 활성화된 AWS 계정
* Bedrock에서 원하는 Claude 모델(예: Claude Sonnet 4.6)에 대한 액세스
* AWS CLI 설치 및 구성 (선택 사항 - 자격 증명을 얻는 다른 메커니즘이 없는 경우에만 필요)
* 적절한 IAM 권한

자체 Bedrock 자격 증명으로 로그인하려면 아래의 [Bedrock으로 로그인](#sign-in-with-bedrock)을 따르세요. 팀 전체에 Claude Code를 배포하려면 [수동 설정](#set-up-manually) 단계를 사용하고 배포 전에 [모델 버전을 고정](#4-pin-model-versions)하세요.

## Bedrock으로 로그인 {#sign-in-with-bedrock}

AWS 자격 증명이 있고 Bedrock을 통해 Claude Code를 사용하려면, 로그인 마법사가 안내합니다. AWS 측 사전 요구 사항은 계정당 한 번 완료하면 되며, 마법사가 Claude Code 측을 처리합니다.

### 1단계: AWS 계정에서 Anthropic 모델 활성화

[Amazon Bedrock 콘솔](https://console.aws.amazon.com/bedrock/)에서 모델 카탈로그를 열고 Anthropic 모델을 선택한 후 사용 사례 양식을 제출합니다. 제출 후 즉시 액세스가 부여됩니다. AWS Organizations에 대해서는 [사용 사례 세부 정보 제출](#1-submit-use-case-details)을, 역할에 필요한 권한에 대해서는 [IAM 구성](#iam-configuration)을 참조하세요.

### 2단계: Claude Code를 시작하고 Bedrock 선택

`claude`를 실행합니다. 로그인 프롬프트에서 **3rd-party platform**을 선택한 다음 **Amazon Bedrock**을 선택합니다.

### 3단계: 마법사 프롬프트 따르기

AWS에 인증하는 방법을 선택합니다: `~/.aws` 디렉토리에서 감지된 AWS 프로필, Bedrock API 키, 액세스 키와 시크릿, 또는 환경에 이미 있는 자격 증명. 마법사가 리전을 선택하고, 계정에서 호출할 수 있는 Claude 모델을 확인하며, 고정할 수 있게 합니다. 결과를 [사용자 설정 파일](/settings)의 `env` 블록에 저장하므로 직접 환경 변수를 내보낼 필요가 없습니다.

로그인한 후 언제든지 `/setup-bedrock`을 실행하여 마법사를 다시 열고 자격 증명, 리전 또는 모델 고정을 변경할 수 있습니다.

## 수동 설정 {#set-up-manually}

마법사 대신 환경 변수를 통해 Bedrock을 구성하려면(예: CI 또는 스크립트로 된 엔터프라이즈 배포), 아래 단계를 따르세요.

### 1. 사용 사례 세부 정보 제출 {#1-submit-use-case-details}

Anthropic 모델을 처음 사용하는 사용자는 모델을 호출하기 전에 사용 사례 세부 정보를 제출해야 합니다. 이는 AWS 계정당 한 번 수행됩니다.

1. 아래 설명된 올바른 IAM 권한이 있는지 확인합니다
2. [Amazon Bedrock 콘솔](https://console.aws.amazon.com/bedrock/)로 이동합니다
3. **모델 카탈로그**에서 Anthropic 모델을 선택합니다
4. 사용 사례 양식을 작성합니다. 제출 후 즉시 액세스가 부여됩니다.

AWS Organizations를 사용하는 경우, 관리 계정에서 [`PutUseCaseForModelAccess` API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_PutUseCaseForModelAccess.html)를 사용하여 양식을 한 번 제출할 수 있습니다. 이 호출에는 `bedrock:PutUseCaseForModelAccess` IAM 권한이 필요합니다. 승인은 자동으로 하위 계정에 확장됩니다.

### 2. AWS 자격 증명 구성 {#2-configure-aws-credentials}

Claude Code는 기본 AWS SDK 자격 증명 체인을 사용합니다. 다음 방법 중 하나를 사용하여 자격 증명을 설정하세요:

**옵션 A: AWS CLI 구성**

```bash
aws configure
```

**옵션 B: 환경 변수 (액세스 키)**

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```

**옵션 C: 환경 변수 (SSO 프로필)**

```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name
```

**옵션 D: AWS Management Console 자격 증명**

```bash
aws login
```

`aws login`에 대해 [자세히 알아보기](https://docs.aws.amazon.com/signin/latest/userguide/command-line-sign-in.html).

**옵션 E: Bedrock API 키**

```bash
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
```

Bedrock API 키는 전체 AWS 자격 증명 없이 더 간단한 인증 방법을 제공합니다. [Bedrock API 키에 대해 자세히 알아보기](https://aws.amazon.com/blogs/machine-learning/accelerate-ai-development-with-amazon-bedrock-api-keys/).

#### 고급 자격 증명 구성 {#advanced-credential-configuration}

Claude Code는 AWS SSO 및 기업 ID 프로바이더에 대한 자동 자격 증명 갱신을 지원합니다. Claude Code 설정 파일에 이러한 설정을 추가하세요(파일 위치는 [설정](/settings)을 참조).

Claude Code가 AWS 자격 증명이 만료되었음을 감지하면(타임스탬프를 기반으로 로컬에서 또는 Bedrock이 자격 증명 오류를 반환할 때), 구성된 `awsAuthRefresh` 및/또는 `awsCredentialExport` 명령을 자동으로 실행하여 요청을 재시도하기 전에 새 자격 증명을 얻습니다.

##### 구성 예시

```json
{
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "env": {
    "AWS_PROFILE": "myprofile"
  }
}
```

##### 구성 설정 설명

**`awsAuthRefresh`**: 자격 증명, SSO 캐시 또는 구성 파일을 업데이트하는 등 `.aws` 디렉토리를 수정하는 명령에 사용합니다. 명령의 출력은 사용자에게 표시되지만 대화형 입력은 지원되지 않습니다. CLI가 URL이나 코드를 표시하고 브라우저에서 인증을 완료하는 브라우저 기반 SSO 플로우에 적합합니다.

**`awsCredentialExport`**: `.aws`를 수정할 수 없고 자격 증명을 직접 반환해야 하는 경우에만 사용합니다. 출력은 조용히 캡처되며 사용자에게 표시되지 않습니다. 명령은 다음 형식의 JSON을 출력해야 합니다:

```json
{
  "Credentials": {
    "AccessKeyId": "value",
    "SecretAccessKey": "value",
    "SessionToken": "value"
  }
}
```

### 3. Claude Code 구성 {#3-configure-claude-code}

다음 환경 변수를 설정하여 Bedrock을 활성화합니다:

```bash
# Bedrock 통합 활성화
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # 또는 선호하는 리전

# 선택 사항: 소형/빠른 모델(Haiku)의 리전을 재정의합니다.
# Bedrock Mantle에도 적용됩니다.
export ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION=us-west-2

# 선택 사항: 커스텀 엔드포인트 또는 게이트웨이를 위해 Bedrock 엔드포인트 URL을 재정의합니다
# export ANTHROPIC_BEDROCK_BASE_URL=https://bedrock-runtime.us-east-1.amazonaws.com
```

Bedrock으로 Claude Code를 활성화할 때 다음 사항을 유의하세요:

* `AWS_REGION`은 필수 환경 변수입니다. Claude Code는 이 설정에 대해 `.aws` 구성 파일에서 읽지 않습니다.
* Bedrock을 사용할 때 인증이 AWS 자격 증명을 통해 처리되므로 `/login` 및 `/logout` 명령이 비활성화됩니다.
* 다른 프로세스로 유출되지 않도록 하려는 `AWS_PROFILE`과 같은 환경 변수에 설정 파일을 사용할 수 있습니다. 자세한 정보는 [설정](/settings)을 참조하세요.

### 4. 모델 버전 고정 {#4-pin-model-versions}

::: warning
여러 사용자에게 배포할 때 특정 모델 버전을 고정하세요. 고정하지 않으면 `sonnet` 및 `opus`와 같은 모델 별칭이 최신 버전으로 해석되는데, Anthropic이 업데이트를 릴리스할 때 Bedrock 계정에서 아직 사용하지 못할 수 있습니다. Claude Code는 최신 버전을 사용할 수 없을 때 시작 시 [이전 버전으로 폴백](#startup-model-checks)하지만, 고정하면 사용자가 새 모델로 전환하는 시기를 제어할 수 있습니다.
:::

이러한 환경 변수를 특정 Bedrock 모델 ID로 설정하세요:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

이 변수들은 크로스 리전 추론 프로필 ID(`us.` 접두사)를 사용합니다. 다른 리전 접두사나 애플리케이션 추론 프로필을 사용하는 경우 적절히 조정하세요. 현재 및 레거시 모델 ID는 [모델 개요](https://platform.claude.com/docs/en/about-claude/models/overview)를 참조하세요. 환경 변수의 전체 목록은 [모델 구성](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

고정 변수가 설정되지 않은 경우 Claude Code가 사용하는 기본 모델:

| 모델 유형         | 기본값                                           |
| :--------------- | :--------------------------------------------- |
| 기본 모델         | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| 소형/빠른 모델     | `us.anthropic.claude-haiku-4-5-20251001-v1:0`  |

모델을 추가로 커스터마이즈하려면 다음 방법 중 하나를 사용하세요:

```bash
# 추론 프로필 ID 사용
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# 애플리케이션 추론 프로필 ARN 사용
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'

# 선택 사항: 필요한 경우 프롬프트 캐싱 비활성화
export DISABLE_PROMPT_CACHING=1
```

::: info
[프롬프트 캐싱](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)은 모든 리전에서 사용할 수 없을 수 있습니다.
:::

#### 각 모델 버전을 추론 프로필에 매핑 {#map-each-model-version-to-an-inference-profile}

`ANTHROPIC_DEFAULT_*_MODEL` 환경 변수는 모델 패밀리당 하나의 추론 프로필을 구성합니다. 조직이 동일한 패밀리의 여러 버전을 `/model` 선택기에 노출하고 각각 자체 애플리케이션 추론 프로필 ARN으로 라우팅해야 하는 경우, [설정 파일](/settings#settings-files)의 `modelOverrides` 설정을 대신 사용하세요.

이 예시는 세 개의 Opus 버전을 고유한 ARN에 매핑하여 사용자가 조직의 추론 프로필을 우회하지 않고 전환할 수 있도록 합니다:

```json
{
  "modelOverrides": {
    "claude-opus-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-46-prod",
    "claude-opus-4-5-20251101": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-45-prod",
    "claude-opus-4-1-20250805": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-41-prod"
  }
}
```

사용자가 `/model`에서 이러한 버전 중 하나를 선택하면 Claude Code가 매핑된 ARN으로 Bedrock을 호출합니다. 재정의가 없는 버전은 내장 Bedrock 모델 ID 또는 시작 시 발견된 일치하는 추론 프로필로 폴백합니다. 재정의가 `availableModels` 및 기타 모델 설정과 어떻게 상호작용하는지에 대한 자세한 내용은 [버전별 모델 ID 재정의](/model-config#override-model-ids-per-version)를 참조하세요.

## 시작 시 모델 확인 {#startup-model-checks}

Bedrock이 구성된 상태에서 Claude Code가 시작되면, 사용하려는 모델이 계정에서 액세스 가능한지 확인합니다. 이 확인에는 Claude Code v2.1.94 이상이 필요합니다.

현재 Claude Code 기본값보다 오래된 모델 버전을 고정했고 계정이 새 버전을 호출할 수 있는 경우, Claude Code가 고정을 업데이트하도록 프롬프트합니다. 수락하면 새 모델 ID를 [사용자 설정 파일](/settings)에 쓰고 Claude Code를 재시작합니다. 거부하면 다음 기본 버전 변경까지 기억됩니다. [애플리케이션 추론 프로필 ARN](#map-each-model-version-to-an-inference-profile)을 가리키는 고정은 관리자가 관리하므로 건너뜁니다.

모델을 고정하지 않았고 현재 기본값이 계정에서 사용할 수 없는 경우, Claude Code는 현재 세션에서 이전 버전으로 폴백하고 알림을 표시합니다. 폴백은 저장되지 않습니다. Bedrock 계정에서 새 모델을 활성화하거나 [버전을 고정](#4-pin-model-versions)하여 선택을 영구적으로 만드세요.

## IAM 구성 {#iam-configuration}

Claude Code에 필요한 권한이 포함된 IAM 정책을 생성하세요:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowModelAndInferenceProfileAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:inference-profile/*",
        "arn:aws:bedrock:*:*:application-inference-profile/*",
        "arn:aws:bedrock:*:*:foundation-model/*"
      ]
    },
    {
      "Sid": "AllowMarketplaceSubscription",
      "Effect": "Allow",
      "Action": [
        "aws-marketplace:ViewSubscriptions",
        "aws-marketplace:Subscribe"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:CalledViaLast": "bedrock.amazonaws.com"
        }
      }
    }
  ]
}
```

보다 제한적인 권한을 위해 Resource를 특정 추론 프로필 ARN으로 제한할 수 있습니다.

자세한 내용은 [Bedrock IAM 문서](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)를 참조하세요.

::: info
비용 추적과 액세스 제어를 단순화하기 위해 Claude Code 전용 AWS 계정을 생성하세요.
:::

## 1M 토큰 컨텍스트 윈도우 {#1m-token-context-window}

Claude Opus 4.6과 Sonnet 4.6은 Amazon Bedrock에서 [1M 토큰 컨텍스트 윈도우](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)를 지원합니다. Claude Code는 1M 모델 변형을 선택하면 확장된 컨텍스트 윈도우를 자동으로 활성화합니다.

고정된 모델에 대해 1M 컨텍스트 윈도우를 활성화하려면 모델 ID에 `[1m]`을 추가하세요. 자세한 내용은 [서드파티 배포를 위한 모델 고정](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

## AWS Guardrails {#aws-guardrails}

[Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)를 사용하여 Claude Code에 대한 콘텐츠 필터링을 구현할 수 있습니다. [Amazon Bedrock 콘솔](https://console.aws.amazon.com/bedrock/)에서 Guardrail을 생성하고 버전을 게시한 다음, [설정 파일](/settings)에 Guardrail 헤더를 추가하세요. 크로스 리전 추론 프로필을 사용하는 경우 Guardrail에서 크로스 리전 추론을 활성화하세요.

구성 예시:

```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-Amzn-Bedrock-GuardrailIdentifier: your-guardrail-id\nX-Amzn-Bedrock-GuardrailVersion: 1"
  }
}
```

## Mantle 엔드포인트 사용 {#use-the-mantle-endpoint}

Mantle은 Bedrock Invoke API 대신 네이티브 Anthropic API 형태로 Claude 모델을 제공하는 Amazon Bedrock 엔드포인트입니다. 이 페이지에서 설명한 것과 동일한 AWS 자격 증명, IAM 권한, `awsAuthRefresh` 구성을 사용합니다.

::: info
Mantle은 Claude Code v2.1.94 이상이 필요합니다. `claude --version`으로 확인하세요.
:::

### Mantle 활성화 {#enable-mantle}

AWS 자격 증명이 이미 구성된 상태에서 `CLAUDE_CODE_USE_MANTLE`을 설정하여 요청을 Mantle 엔드포인트로 라우팅합니다:

```bash
export CLAUDE_CODE_USE_MANTLE=1
export AWS_REGION=us-east-1
```

Claude Code는 `AWS_REGION`에서 엔드포인트 URL을 구성합니다. 커스텀 엔드포인트나 게이트웨이를 위해 재정의하려면 `ANTHROPIC_BEDROCK_MANTLE_BASE_URL`을 설정하세요.

Claude Code 내에서 `/status`를 실행하여 확인하세요. Mantle이 활성화되면 provider 줄에 `Amazon Bedrock (Mantle)`이 표시됩니다.

### Mantle 모델 선택 {#select-a-mantle-model}

Mantle은 `anthropic.`으로 시작하고 버전 접미사가 없는 모델 ID를 사용합니다(예: `anthropic.claude-haiku-4-5`). 계정에서 사용할 수 있는 모델은 조직에 부여된 것에 따라 달라집니다. 추가 모델 ID는 AWS의 온보딩 자료에 나열되어 있습니다. 허용 목록에 있는 모델에 대한 액세스를 요청하려면 AWS 계정 팀에 문의하세요.

`--model` 플래그 또는 Claude Code 내에서 `/model`로 모델을 설정하세요:

```bash
claude --model anthropic.claude-haiku-4-5
```

### Invoke API와 함께 Mantle 실행 {#run-mantle-alongside-the-invoke-api}

Mantle에서 사용할 수 있는 모델이 현재 사용하는 모든 모델을 포함하지 않을 수 있습니다. `CLAUDE_CODE_USE_BEDROCK`과 `CLAUDE_CODE_USE_MANTLE`을 모두 설정하면 Claude Code가 동일한 세션에서 두 엔드포인트를 모두 호출할 수 있습니다. Mantle 형식과 일치하는 모델 ID는 Mantle로 라우팅되고, 다른 모든 모델 ID는 Bedrock Invoke API로 전송됩니다.

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export CLAUDE_CODE_USE_MANTLE=1
```

Mantle 모델을 `/model` 선택기에 표시하려면 [설정 파일](/settings)의 `availableModels`에 해당 ID를 나열하세요. 이 설정은 선택기를 나열된 항목으로 제한하므로 사용 가능하게 유지할 모든 별칭을 포함하세요:

```json
{
  "availableModels": ["opus", "sonnet", "haiku", "anthropic.claude-haiku-4-5"]
}
```

`anthropic.` 접두사가 있는 항목은 커스텀 선택기 옵션으로 추가되어 Mantle로 라우팅됩니다. `anthropic.claude-haiku-4-5`를 계정에 부여된 모델 ID로 교체하세요. `availableModels`가 다른 모델 설정과 어떻게 상호작용하는지에 대한 내용은 [모델 선택 제한](/model-config#restrict-model-selection)을 참조하세요.

두 프로바이더가 모두 활성화된 경우 `/status`에 `Amazon Bedrock + Amazon Bedrock (Mantle)`이 표시됩니다.

### 게이트웨이를 통해 Mantle 라우팅 {#route-mantle-through-a-gateway}

조직이 서버 측에서 AWS 자격 증명을 주입하는 중앙 집중식 [LLM 게이트웨이](/llm-gateway)를 통해 모델 트래픽을 라우팅하는 경우, 클라이언트 측 인증을 비활성화하여 Claude Code가 SigV4 서명이나 `x-api-key` 헤더 없이 요청을 보내도록 하세요:

```bash
export CLAUDE_CODE_USE_MANTLE=1
export CLAUDE_CODE_SKIP_MANTLE_AUTH=1
export ANTHROPIC_BEDROCK_MANTLE_BASE_URL=https://your-gateway.example.com
```

### Mantle 환경 변수 {#mantle-environment-variables}

이 변수들은 Mantle 엔드포인트에 특화되어 있습니다. 전체 목록은 [환경 변수](/env-vars)를 참조하세요.

| 변수                                    | 용도                                                                 |
| :-------------------------------------- | :------------------------------------------------------------------ |
| `CLAUDE_CODE_USE_MANTLE`                | Mantle 엔드포인트 활성화. `1` 또는 `true`로 설정합니다.                  |
| `ANTHROPIC_BEDROCK_MANTLE_BASE_URL`     | 기본 Mantle 엔드포인트 URL 재정의                                      |
| `CLAUDE_CODE_SKIP_MANTLE_AUTH`          | 프록시 설정을 위한 클라이언트 측 인증 건너뛰기                            |
| `ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION` | Haiku 클래스 모델의 AWS 리전 재정의 (Bedrock과 공유)                    |

## 문제 해결 {#troubleshooting}

### SSO 및 기업 프록시의 인증 루프 {#authentication-loop-with-sso-and-corporate-proxies}

AWS SSO 사용 시 브라우저 탭이 반복적으로 생성되는 경우, [설정 파일](/settings)에서 `awsAuthRefresh` 설정을 제거하세요. 이는 기업 VPN이나 TLS 검사 프록시가 SSO 브라우저 플로우를 중단할 때 발생할 수 있습니다. Claude Code는 중단된 연결을 인증 실패로 처리하고, `awsAuthRefresh`를 다시 실행하여 무한 반복됩니다.

네트워크 환경이 자동 브라우저 기반 SSO 플로우를 방해하는 경우, `awsAuthRefresh`에 의존하지 않고 Claude Code를 시작하기 전에 `aws sso login`을 수동으로 사용하세요.

### 리전 문제 {#region-issues}

리전 문제가 발생하는 경우:

* 모델 가용성 확인: `aws bedrock list-inference-profiles --region your-region`
* 지원되는 리전으로 전환: `export AWS_REGION=us-east-1`
* 크로스 리전 액세스를 위한 추론 프로필 사용을 고려하세요

"on-demand throughput isn't supported" 오류가 발생하는 경우:

* 모델을 [추론 프로필](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html) ID로 지정하세요

Claude Code는 Bedrock [Invoke API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModelWithResponseStream.html)를 사용하며 Converse API는 지원하지 않습니다.

### Mantle 엔드포인트 오류 {#mantle-endpoint-errors}

`CLAUDE_CODE_USE_MANTLE`을 설정한 후 `/status`에 `Amazon Bedrock (Mantle)`이 표시되지 않으면 변수가 프로세스에 도달하지 않는 것입니다. `claude`를 실행한 셸에서 내보내기되었는지 확인하거나 [설정 파일](/settings)의 `env` 블록에 설정하세요.

유효한 자격 증명으로 Mantle 엔드포인트에서 `403` 오류가 발생하면 AWS 계정에 요청한 모델에 대한 액세스가 부여되지 않은 것입니다. AWS 계정 팀에 문의하여 액세스를 요청하세요.

모델 ID를 지정하는 `400` 오류는 해당 모델이 Mantle에서 제공되지 않음을 의미합니다. Mantle은 표준 Bedrock 카탈로그와 별도의 자체 모델 라인업을 가지고 있으므로 `us.anthropic.claude-sonnet-4-6`과 같은 추론 프로필 ID는 작동하지 않습니다. Mantle 형식 ID를 사용하거나 [두 엔드포인트를 모두 활성화](#run-mantle-alongside-the-invoke-api)하여 Claude Code가 모델이 사용 가능한 엔드포인트로 각 요청을 라우팅하도록 하세요.

## 추가 리소스 {#additional-resources}

* [Bedrock 문서](https://docs.aws.amazon.com/bedrock/)
* [Bedrock 가격](https://aws.amazon.com/bedrock/pricing/)
* [Bedrock 추론 프로필](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
* [Bedrock 토큰 소진 및 할당량](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-token-burndown.html)
* [Claude Code on Amazon Bedrock: 빠른 설정 가이드](https://community.aws/content/2tXkZKrZzlrlu0KfH8gST5Dkppq/claude-code-on-amazon-bedrock-quick-setup-guide)
* [Claude Code 모니터링 구현 (Bedrock)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock/blob/main/assets/docs/MONITORING.md)
