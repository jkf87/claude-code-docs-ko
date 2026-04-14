---
title: 엔터프라이즈 배포 개요
description: Claude Code가 엔터프라이즈 배포 요구 사항을 충족하기 위해 다양한 서드파티 서비스 및 인프라와 통합하는 방법을 알아봅니다.
---

# 엔터프라이즈 배포 개요

조직은 Anthropic을 통해 직접, 또는 클라우드 제공업체를 통해 Claude Code를 배포할 수 있습니다. 이 페이지에서는 올바른 구성을 선택하는 데 도움을 드립니다.

## 배포 옵션 비교

대부분의 조직에서는 Claude for Teams 또는 Claude for Enterprise가 최상의 경험을 제공합니다. 팀 구성원은 하나의 구독으로 Claude Code와 웹의 Claude 모두에 접근할 수 있으며, 중앙화된 청구 및 별도의 인프라 설정이 필요하지 않습니다.

**Claude for Teams**는 셀프서비스 방식으로 협업 기능, 관리자 도구, 청구 관리 기능을 포함합니다. 빠르게 시작해야 하는 소규모 팀에 적합합니다.

**Claude for Enterprise**는 SSO 및 도메인 캡처, 역할 기반 권한, 컴플라이언스 API 접근, 그리고 조직 전체에 Claude Code 구성을 배포하기 위한 관리형 정책 설정을 추가로 제공합니다. 보안 및 컴플라이언스 요구 사항이 있는 대규모 조직에 적합합니다.

[Team 플랜](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) 및 [Enterprise 플랜](https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan)에 대해 자세히 알아보세요.

조직에 특정 인프라 요구 사항이 있는 경우 아래 옵션을 비교해 보세요:

<table>
  <thead>
    <tr>
      <th>기능</th>
      <th>Claude for Teams/Enterprise</th>
      <th>Anthropic Console</th>
      <th>Amazon Bedrock</th>
      <th>Google Vertex AI</th>
      <th>Microsoft Foundry</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>적합 대상</td>
      <td>대부분의 조직 (권장)</td>
      <td>개인 개발자</td>
      <td>AWS 네이티브 배포</td>
      <td>GCP 네이티브 배포</td>
      <td>Azure 네이티브 배포</td>
    </tr>

    <tr>
      <td>청구</td>
      <td><strong>Teams:</strong> $150/시트 (Premium), PAYG 옵션 제공<br /><strong>Enterprise:</strong> <a href="https://claude.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=third_party_enterprise">영업팀 문의</a></td>
      <td>PAYG</td>
      <td>AWS를 통한 PAYG</td>
      <td>GCP를 통한 PAYG</td>
      <td>Azure를 통한 PAYG</td>
    </tr>

    <tr>
      <td>리전</td>
      <td>지원 [국가](https://www.anthropic.com/supported-countries)</td>
      <td>지원 [국가](https://www.anthropic.com/supported-countries)</td>
      <td>다수의 AWS [리전](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)</td>
      <td>다수의 GCP [리전](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations)</td>
      <td>다수의 Azure [리전](https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/)</td>
    </tr>

    <tr>
      <td>프롬프트 캐싱</td>
      <td>기본 활성화</td>
      <td>기본 활성화</td>
      <td>기본 활성화</td>
      <td>기본 활성화</td>
      <td>기본 활성화</td>
    </tr>

    <tr>
      <td>인증</td>
      <td>Claude.ai SSO 또는 이메일</td>
      <td>API 키</td>
      <td>API 키 또는 AWS 자격 증명</td>
      <td>GCP 자격 증명</td>
      <td>API 키 또는 Microsoft Entra ID</td>
    </tr>

    <tr>
      <td>비용 추적</td>
      <td>사용량 대시보드</td>
      <td>사용량 대시보드</td>
      <td>AWS Cost Explorer</td>
      <td>GCP Billing</td>
      <td>Azure Cost Management</td>
    </tr>

    <tr>
      <td>웹에서 Claude 포함</td>
      <td>예</td>
      <td>아니오</td>
      <td>아니오</td>
      <td>아니오</td>
      <td>아니오</td>
    </tr>

    <tr>
      <td>엔터프라이즈 기능</td>
      <td>팀 관리, SSO, 사용량 모니터링</td>
      <td>없음</td>
      <td>IAM 정책, CloudTrail</td>
      <td>IAM 역할, Cloud Audit Logs</td>
      <td>RBAC 정책, Azure Monitor</td>
    </tr>
  </tbody>
</table>

배포 옵션을 선택하여 설치 안내를 확인하세요:

* [Claude for Teams 또는 Enterprise](/authentication#claude-for-teams-or-enterprise)
* [Anthropic Console](/authentication#claude-console-authentication)
* [Amazon Bedrock](/amazon-bedrock)
* [Google Vertex AI](/google-vertex-ai)
* [Microsoft Foundry](/microsoft-foundry)

## 프록시 및 게이트웨이 구성

대부분의 조직은 추가 구성 없이 클라우드 제공업체를 직접 사용할 수 있습니다. 그러나 조직에 특정 네트워크 또는 관리 요구 사항이 있는 경우 기업 프록시나 LLM 게이트웨이를 구성해야 할 수 있습니다. 이 두 가지는 함께 사용할 수 있는 서로 다른 구성입니다:

* **기업 프록시**: HTTP/HTTPS 프록시를 통해 트래픽을 라우팅합니다. 조직에서 보안 모니터링, 컴플라이언스, 또는 네트워크 정책 적용을 위해 모든 아웃바운드 트래픽이 프록시 서버를 통과해야 하는 경우에 사용합니다. `HTTPS_PROXY` 또는 `HTTP_PROXY` 환경 변수로 구성합니다. [엔터프라이즈 네트워크 구성](/network-config)에서 자세히 알아보세요.
* **LLM 게이트웨이**: Claude Code와 클라우드 제공업체 사이에서 인증 및 라우팅을 처리하는 서비스입니다. 팀 간 중앙화된 사용량 추적, 맞춤형 속도 제한 또는 예산 설정, 중앙화된 인증 관리가 필요한 경우에 사용합니다. `ANTHROPIC_BASE_URL`, `ANTHROPIC_BEDROCK_BASE_URL`, 또는 `ANTHROPIC_VERTEX_BASE_URL` 환경 변수로 구성합니다. [LLM 게이트웨이 구성](/llm-gateway)에서 자세히 알아보세요.

아래 예시는 셸 또는 셸 프로파일(`.bashrc`, `.zshrc`)에서 설정할 환경 변수를 보여줍니다. 다른 구성 방법은 [설정](/settings)을 참조하세요.

### Amazon Bedrock

::: code-group

```bash [기업 프록시]
# Bedrock 활성화
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# 기업 프록시 구성
export HTTPS_PROXY='https://proxy.example.com:8080'
```

```bash [LLM 게이트웨이]
# Bedrock 활성화
export CLAUDE_CODE_USE_BEDROCK=1

# LLM 게이트웨이 구성
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # 게이트웨이가 AWS 인증을 처리하는 경우
```

:::

### Microsoft Foundry

::: code-group

```bash [기업 프록시]
# Microsoft Foundry 활성화
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key  # Entra ID 인증의 경우 생략 가능

# 기업 프록시 구성
export HTTPS_PROXY='https://proxy.example.com:8080'
```

```bash [LLM 게이트웨이]
# Microsoft Foundry 활성화
export CLAUDE_CODE_USE_FOUNDRY=1

# LLM 게이트웨이 구성
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1  # 게이트웨이가 Azure 인증을 처리하는 경우
```

:::

### Google Vertex AI

::: code-group

```bash [기업 프록시]
# Vertex 활성화
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# 기업 프록시 구성
export HTTPS_PROXY='https://proxy.example.com:8080'
```

```bash [LLM 게이트웨이]
# Vertex 활성화
export CLAUDE_CODE_USE_VERTEX=1

# LLM 게이트웨이 구성
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1  # 게이트웨이가 GCP 인증을 처리하는 경우
```

:::

::: tip
Claude Code에서 `/status`를 사용하여 프록시 및 게이트웨이 구성이 올바르게 적용되었는지 확인하세요.
:::

## 조직을 위한 모범 사례

### 문서화 및 메모리에 투자하기

Claude Code가 코드베이스를 이해할 수 있도록 문서화에 투자하는 것을 강력히 권장합니다. 조직은 여러 수준에서 CLAUDE.md 파일을 배포할 수 있습니다:

* **조직 전체**: 회사 전체 표준을 위해 `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS)와 같은 시스템 디렉터리에 배포
* **저장소 수준**: 프로젝트 아키텍처, 빌드 명령, 기여 가이드라인이 포함된 `CLAUDE.md` 파일을 저장소 루트에 생성. 모든 사용자가 혜택을 받을 수 있도록 소스 제어에 커밋

[메모리 및 CLAUDE.md 파일](/memory)에서 자세히 알아보세요.

### 배포 간소화하기

맞춤형 개발 환경이 있는 경우, Claude Code를 "원클릭"으로 설치할 수 있는 방법을 만드는 것이 조직 전체의 도입을 높이는 핵심이라는 것을 경험을 통해 알게 되었습니다.

### 가이드된 사용으로 시작하기

새로운 사용자가 코드베이스 Q&A, 소규모 버그 수정, 또는 기능 요청에 Claude Code를 사용해 보도록 권장하세요. Claude Code에게 계획을 세우도록 요청하세요. Claude의 제안을 확인하고 방향이 맞지 않으면 피드백을 제공하세요. 시간이 지나면서 사용자가 이 새로운 패러다임을 더 잘 이해하게 되면, Claude Code를 보다 자율적으로 실행할 때 더 효과적으로 활용할 수 있게 됩니다.

### 클라우드 제공업체의 모델 버전 고정하기

[Bedrock](/amazon-bedrock), [Vertex AI](/google-vertex-ai), 또는 [Foundry](/microsoft-foundry)를 통해 배포하는 경우 `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`을 사용하여 특정 모델 버전을 고정하세요. 고정하지 않으면 모델 별칭이 최신 버전으로 연결되는데, Anthropic이 업데이트를 출시할 때 해당 버전이 아직 계정에서 활성화되지 않을 수 있습니다. 버전을 고정하면 사용자가 새 모델로 이동하는 시점을 제어할 수 있습니다. 최신 버전을 사용할 수 없을 때 각 제공업체가 어떻게 처리하는지에 대해서는 [모델 구성](/model-config#pin-models-for-third-party-deployments)을 참조하세요.

### 보안 정책 구성하기

보안 팀은 Claude Code가 수행할 수 있는 것과 수행할 수 없는 것에 대한 관리형 권한을 구성할 수 있으며, 이는 로컬 구성으로 덮어쓸 수 없습니다. [자세히 알아보기](/security).

### 통합을 위한 MCP 활용하기

MCP는 티켓 관리 시스템이나 오류 로그 연결과 같이 Claude Code에 더 많은 정보를 제공하는 훌륭한 방법입니다. 한 중앙 팀이 MCP 서버를 구성하고 `.mcp.json` 구성을 코드베이스에 커밋하여 모든 사용자가 혜택을 받을 수 있도록 권장합니다. [자세히 알아보기](/mcp).

Anthropic에서는 모든 Anthropic 코드베이스에 걸쳐 개발을 지원하기 위해 Claude Code를 신뢰하고 있습니다. 저희만큼 Claude Code를 즐겁게 사용하시길 바랍니다.

## 다음 단계

배포 옵션을 선택하고 팀 접근을 구성한 후:

1. **팀에 배포하기**: 설치 안내를 공유하고 팀 구성원이 [Claude Code를 설치](/setup)하고 자격 증명으로 인증하도록 합니다.
2. **공유 구성 설정하기**: 저장소에 [CLAUDE.md 파일](/memory)을 생성하여 Claude Code가 코드베이스와 코딩 표준을 이해하도록 도움을 줍니다.
3. **권한 구성하기**: [보안 설정](/security)을 검토하여 Claude Code가 환경에서 수행할 수 있는 것과 없는 것을 정의합니다.
