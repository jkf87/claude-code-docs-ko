---
title: Microsoft Foundry에서 Claude Code 사용하기
description: "Microsoft Foundry를 통한 Claude Code 설정, 구성 및 문제 해결 방법을 알아보세요."
---

# Microsoft Foundry에서 Claude Code 사용하기

## 사전 요구 사항

Microsoft Foundry로 Claude Code를 구성하기 전에 다음이 필요합니다:

* Microsoft Foundry에 대한 접근 권한이 있는 Azure 구독
* Microsoft Foundry 리소스 및 배포를 생성할 RBAC 권한
* Azure CLI 설치 및 구성 (선택 사항 - 자격 증명을 가져오는 다른 수단이 없을 경우에만 필요)

::: info
여러 사용자에게 Claude Code를 배포하는 경우, Anthropic이 새 모델을 출시할 때 문제가 발생하지 않도록 [모델 버전을 고정](#4-모델-버전-고정)하세요.
:::

## 설정

### 1. Microsoft Foundry 리소스 프로비저닝

먼저 Azure에서 Claude 리소스를 생성합니다:

1. [Microsoft Foundry 포털](https://ai.azure.com/)로 이동합니다
2. 새 리소스를 생성하고 리소스 이름을 기록합니다
3. 다음 Claude 모델에 대한 배포를 생성합니다:
   * Claude Opus
   * Claude Sonnet
   * Claude Haiku

### 2. Azure 자격 증명 구성

Claude Code는 Microsoft Foundry에 대해 두 가지 인증 방법을 지원합니다. 보안 요구 사항에 가장 적합한 방법을 선택하세요.

**옵션 A: API 키 인증**

1. Microsoft Foundry 포털에서 리소스로 이동합니다
2. **엔드포인트 및 키** 섹션으로 이동합니다
3. **API 키**를 복사합니다
4. 환경 변수를 설정합니다:

```bash
export ANTHROPIC_FOUNDRY_API_KEY=your-azure-api-key
```

**옵션 B: Microsoft Entra ID 인증**

`ANTHROPIC_FOUNDRY_API_KEY`가 설정되어 있지 않으면 Claude Code는 Azure SDK [기본 자격 증명 체인](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/credential-chains#defaultazurecredential-overview)을 자동으로 사용합니다.
이 방법은 로컬 및 원격 워크로드 인증을 위한 다양한 방법을 지원합니다.

로컬 환경에서는 일반적으로 Azure CLI를 사용할 수 있습니다:

```bash
az login
```

::: info
Microsoft Foundry를 사용하는 경우, 인증이 Azure 자격 증명을 통해 처리되므로 `/login` 및 `/logout` 명령은 비활성화됩니다.
:::

### 3. Claude Code 구성

Microsoft Foundry를 활성화하려면 다음 환경 변수를 설정합니다:

```bash
# Microsoft Foundry 통합 활성화
export CLAUDE_CODE_USE_FOUNDRY=1

# Azure 리소스 이름 ({resource}를 실제 리소스 이름으로 교체)
export ANTHROPIC_FOUNDRY_RESOURCE={resource}
# 또는 전체 기본 URL을 직접 지정할 수 있습니다:
# export ANTHROPIC_FOUNDRY_BASE_URL=https://{resource}.services.ai.azure.com/anthropic
```

### 4. 모델 버전 고정

::: warning
모든 배포에 특정 모델 버전을 고정하세요. 버전 고정 없이 모델 별칭(`sonnet`, `opus`, `haiku`)을 사용하면 Anthropic이 업데이트를 출시할 때 Foundry 계정에서 사용할 수 없는 더 새로운 모델 버전을 Claude Code가 사용하려고 시도하여 기존 사용자에게 오류가 발생할 수 있습니다. Azure 배포를 생성할 때 "최신 버전으로 자동 업데이트" 대신 특정 모델 버전을 선택하세요.
:::

1단계에서 생성한 배포 이름에 맞게 모델 변수를 설정합니다:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
```

현재 및 이전 모델 ID는 [모델 개요](https://platform.claude.com/docs/en/about-claude/models/overview)를 참조하세요. 환경 변수 전체 목록은 [모델 구성](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

## Azure RBAC 구성

`Azure AI User` 및 `Cognitive Services User` 기본 역할에는 Claude 모델을 호출하는 데 필요한 모든 권한이 포함되어 있습니다.

더 제한적인 권한이 필요한 경우, 다음과 같이 커스텀 역할을 생성합니다:

```json
{
  "permissions": [
    {
      "dataActions": [
        "Microsoft.CognitiveServices/accounts/providers/*"
      ]
    }
  ]
}
```

자세한 내용은 [Microsoft Foundry RBAC 문서](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry)를 참조하세요.

## 문제 해결

"Failed to get token from azureADTokenProvider: ChainedTokenCredential authentication failed" 오류가 발생하는 경우:

* 환경에서 Entra ID를 구성하거나 `ANTHROPIC_FOUNDRY_API_KEY`를 설정하세요.

## 추가 리소스

* [Microsoft Foundry 문서](https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry)
* [Microsoft Foundry 모델](https://ai.azure.com/explore/models)
* [Microsoft Foundry 가격 정책](https://azure.microsoft.com/en-us/pricing/details/ai-foundry/)
