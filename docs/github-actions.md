---
title: Claude Code GitHub Actions
description: "GitHub Actions와 Claude Code를 개발 워크플로우에 통합하는 방법을 알아보세요"
---

# Claude Code GitHub Actions

Claude Code GitHub Actions는 GitHub 워크플로우에 AI 기반 자동화를 제공합니다. PR이나 이슈에서 `@claude`를 멘션하기만 하면 Claude가 코드를 분석하고, 풀 리퀘스트를 생성하고, 기능을 구현하고, 버그를 수정합니다. 이 모든 과정이 프로젝트 표준을 준수하면서 이루어집니다. 트리거 없이 모든 PR에 자동으로 리뷰를 게시하려면 [GitHub Code Review](/code-review)를 참고하세요.

::: info
Claude Code GitHub Actions는 [Claude Agent SDK](/agent-sdk/overview)를 기반으로 구축되어 있으며, 이를 통해 Claude Code를 애플리케이션에 프로그래밍 방식으로 통합할 수 있습니다. SDK를 사용하여 GitHub Actions를 넘어선 커스텀 자동화 워크플로우를 구축할 수 있습니다.
:::

::: info
**Claude Opus 4.6을 이제 사용할 수 있습니다.** Claude Code GitHub Actions의 기본값은 Sonnet입니다. Opus 4.6을 사용하려면 [model 파라미터](#breaking-changes-reference)를 `claude-opus-4-6`으로 설정하세요.
:::

## Claude Code GitHub Actions를 사용하는 이유

* **즉각적인 PR 생성**: 필요한 내용을 설명하면 Claude가 모든 변경사항을 포함한 완전한 PR을 생성합니다
* **자동화된 코드 구현**: 단 하나의 명령으로 이슈를 실제 동작하는 코드로 변환합니다
* **표준 준수**: Claude는 `CLAUDE.md` 가이드라인과 기존 코드 패턴을 존중합니다
* **간편한 설정**: 설치 프로그램과 API 키만 있으면 몇 분 안에 시작할 수 있습니다
* **기본적으로 안전**: 코드는 GitHub 러너에서만 실행됩니다

## Claude가 할 수 있는 일

Claude Code는 코드 작업 방식을 혁신하는 강력한 GitHub Action을 제공합니다.

### Claude Code Action

이 GitHub Action을 사용하면 GitHub Actions 워크플로우 내에서 Claude Code를 실행할 수 있습니다. Claude Code 위에 원하는 커스텀 워크플로우를 구축하는 데 활용할 수 있습니다.

[저장소 보기 →](https://github.com/anthropics/claude-code-action)

## 설정

## 빠른 설정

이 Action을 설정하는 가장 쉬운 방법은 터미널의 Claude Code를 통하는 것입니다. Claude를 열고 `/install-github-app`을 실행하기만 하면 됩니다.

이 명령이 GitHub 앱 설정과 필요한 시크릿 설정 과정을 안내해 드립니다.

::: info
* GitHub 앱을 설치하고 시크릿을 추가하려면 저장소 관리자 권한이 있어야 합니다
* GitHub 앱은 Contents, Issues, Pull requests에 대한 읽기 및 쓰기 권한을 요청합니다
* 이 빠른 설정 방법은 Claude API 직접 사용자에게만 제공됩니다. AWS Bedrock 또는 Google Vertex AI를 사용하는 경우 [AWS Bedrock 및 Google Vertex AI와 함께 사용하기](#using-with-aws-bedrock--google-vertex-ai) 섹션을 참고하세요.
:::

## 수동 설정

`/install-github-app` 명령이 실패하거나 수동 설정을 선호하는 경우, 다음 수동 설정 지침을 따르세요.

1. **Claude GitHub 앱을 저장소에 설치합니다**: [https://github.com/apps/claude](https://github.com/apps/claude)

   Claude GitHub 앱에는 다음 저장소 권한이 필요합니다:

   * **Contents**: 읽기 및 쓰기 (저장소 파일 수정)
   * **Issues**: 읽기 및 쓰기 (이슈에 응답)
   * **Pull requests**: 읽기 및 쓰기 (PR 생성 및 변경사항 푸시)

   보안 및 권한에 대한 자세한 내용은 [보안 문서](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)를 참고하세요.
2. **ANTHROPIC\_API\_KEY를 저장소 시크릿에 추가합니다** ([GitHub Actions에서 시크릿 사용 방법](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions))
3. **워크플로우 파일을 복사합니다**: [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml)에서 저장소의 `.github/workflows/` 디렉토리로 복사합니다

::: tip
빠른 설정 또는 수동 설정을 완료한 후, 이슈나 PR 댓글에서 `@claude`를 태그하여 Action을 테스트하세요.
:::

## 베타 버전에서 업그레이드

::: warning
Claude Code GitHub Actions v1.0은 베타 버전에서 v1.0으로 업그레이드하기 위해 워크플로우 파일을 업데이트해야 하는 호환성 변경사항을 도입했습니다.
:::

현재 베타 버전의 Claude Code GitHub Actions를 사용 중이라면 GA 버전으로 워크플로우를 업데이트하는 것을 권장합니다. 새 버전은 구성을 단순화하면서 자동 모드 감지와 같은 강력한 새 기능을 추가했습니다.

### 필수 변경사항

모든 베타 사용자는 업그레이드를 위해 워크플로우 파일에서 다음 변경사항을 적용해야 합니다.

1. **Action 버전 업데이트**: `@beta`를 `@v1`로 변경합니다
2. **모드 구성 제거**: `mode: "tag"` 또는 `mode: "agent"` 삭제 (이제 자동 감지됨)
3. **프롬프트 입력 업데이트**: `direct_prompt`를 `prompt`로 교체합니다
4. **CLI 옵션 이동**: `max_turns`, `model`, `custom_instructions` 등을 `claude_args`로 변환합니다

### Breaking Changes 참조표 {#breaking-changes-reference}

| 이전 베타 입력        | 새 v1.0 입력                          |
| --------------------- | ------------------------------------- |
| `mode`                | *(제거됨 - 자동 감지)*               |
| `direct_prompt`       | `prompt`                              |
| `override_prompt`     | GitHub 변수를 사용한 `prompt`         |
| `custom_instructions` | `claude_args: --append-system-prompt` |
| `max_turns`           | `claude_args: --max-turns`            |
| `model`               | `claude_args: --model`                |
| `allowed_tools`       | `claude_args: --allowedTools`         |
| `disallowed_tools`    | `claude_args: --disallowedTools`      |
| `claude_env`          | `settings` JSON 형식                  |

### 변경 전후 예시

**베타 버전:**

```yaml
- uses: anthropics/claude-code-action@beta
  with:
    mode: "tag"
    direct_prompt: "Review this PR for security issues"
    anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
    custom_instructions: "Follow our coding standards"
    max_turns: "10"
    model: "claude-sonnet-4-6"
```

**GA 버전 (v1.0):**

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    prompt: "Review this PR for security issues"
    anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
    claude_args: |
      --append-system-prompt "Follow our coding standards"
      --max-turns 10
      --model claude-sonnet-4-6
```

::: tip
이제 Action이 구성에 따라 대화형 모드(`@claude` 멘션에 응답)와 자동화 모드(프롬프트와 함께 즉시 실행) 중 어떤 것을 실행할지 자동으로 감지합니다.
:::

## 사용 사례 예시

Claude Code GitHub Actions는 다양한 작업을 도울 수 있습니다. [examples 디렉토리](https://github.com/anthropics/claude-code-action/tree/main/examples)에는 다양한 시나리오에 바로 사용할 수 있는 워크플로우가 포함되어 있습니다.

### 기본 워크플로우

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
          # Responds to @claude mentions in comments
```

### Skills 사용

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
          prompt: "Review this pull request for code quality, correctness, and security. Analyze the diff, then post your findings as review comments."
          claude_args: "--max-turns 5"
```

### 커스텀 프롬프트 자동화

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: "--model opus"
```

### 일반적인 사용 사례

이슈나 PR 댓글에서:

```text
@claude implement this feature based on the issue description
@claude how should I implement user authentication for this endpoint?
@claude fix the TypeError in the user dashboard component
```

Claude가 컨텍스트를 자동으로 분석하고 적절하게 응답합니다.

## 모범 사례

### CLAUDE.md 구성

저장소 루트에 `CLAUDE.md` 파일을 생성하여 코드 스타일 가이드라인, 리뷰 기준, 프로젝트별 규칙, 선호하는 패턴을 정의하세요. 이 파일은 Claude가 프로젝트 표준을 이해하는 데 도움을 줍니다.

### 보안 고려사항

::: warning
API 키를 저장소에 직접 커밋하지 마세요.
:::

권한, 인증, 모범 사례를 포함한 포괄적인 보안 지침은 [Claude Code Action 보안 문서](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)를 참고하세요.

API 키에는 항상 GitHub Secrets를 사용하세요:

* API 키를 `ANTHROPIC_API_KEY`라는 이름의 저장소 시크릿으로 추가합니다
* 워크플로우에서 참조: `anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }`
* Action 권한을 필요한 최소한으로 제한합니다
* Claude의 제안을 머지하기 전에 검토합니다

API 키를 워크플로우 파일에 직접 하드코딩하지 말고 항상 GitHub Secrets(예: `${ '{secrets.ANTHROPIC_API_KEY}' }`)를 사용하세요.

### 성능 최적화

이슈 템플릿을 사용하여 컨텍스트를 제공하고, `CLAUDE.md`를 간결하고 집중적으로 유지하며, 워크플로우에 적절한 타임아웃을 설정하세요.

### CI 비용

Claude Code GitHub Actions를 사용할 때 관련 비용을 인지하세요:

**GitHub Actions 비용:**

* Claude Code는 GitHub 호스팅 러너에서 실행되므로 GitHub Actions 분(minutes)을 소비합니다
* 자세한 요금 및 분 제한은 [GitHub 청구 문서](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)를 참고하세요

**API 비용:**

* 각 Claude 인터랙션은 프롬프트와 응답의 길이에 따라 API 토큰을 소비합니다
* 토큰 사용량은 작업의 복잡성과 코드베이스 크기에 따라 다릅니다
* 현재 토큰 요금은 [Claude 요금 페이지](https://claude.com/platform/api)를 참고하세요

**비용 최적화 팁:**

* 특정 `@claude` 명령을 사용하여 불필요한 API 호출을 줄입니다
* `claude_args`에서 `--max-turns`를 적절히 설정하여 과도한 반복을 방지합니다
* 워크플로우 수준 타임아웃을 설정하여 무한 실행되는 작업을 방지합니다
* GitHub의 동시성 제어를 활용하여 병렬 실행 수를 제한합니다

## 구성 예시

Claude Code Action v1은 통합된 파라미터로 구성을 단순화합니다:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${ '{secrets.ANTHROPIC_API_KEY}' }
    prompt: "Your instructions here" # Optional
    claude_args: "--max-turns 5" # Optional CLI arguments
```

주요 기능:

* **통합된 프롬프트 인터페이스** - 모든 지침에 `prompt` 사용
* **Skills** - 프롬프트에서 설치된 [skills](/skills)를 직접 호출
* **CLI 패스스루** - `claude_args`를 통해 모든 Claude Code CLI 인수 전달
* **유연한 트리거** - 모든 GitHub 이벤트와 함께 작동

완전한 워크플로우 파일은 [examples 디렉토리](https://github.com/anthropics/claude-code-action/tree/main/examples)를 방문하세요.

::: tip
이슈나 PR 댓글에 응답할 때 Claude는 @claude 멘션에 자동으로 응답합니다. 다른 이벤트의 경우 `prompt` 파라미터를 사용하여 지침을 제공하세요.
:::

## AWS Bedrock 및 Google Vertex AI와 함께 사용하기 {#using-with-aws-bedrock--google-vertex-ai}

엔터프라이즈 환경에서는 자체 클라우드 인프라와 함께 Claude Code GitHub Actions를 사용할 수 있습니다. 이 방식은 동일한 기능을 유지하면서 데이터 거주지와 청구에 대한 제어권을 제공합니다.

### 사전 요구사항

클라우드 제공업체와 함께 Claude Code GitHub Actions를 설정하기 전에 다음이 필요합니다:

#### Google Cloud Vertex AI의 경우:

1. Vertex AI가 활성화된 Google Cloud 프로젝트
2. GitHub Actions를 위한 Workload Identity Federation 구성
3. 필요한 권한이 있는 서비스 계정
4. GitHub App (권장) 또는 기본 GITHUB\_TOKEN 사용

#### AWS Bedrock의 경우:

1. Amazon Bedrock이 활성화된 AWS 계정
2. AWS에 GitHub OIDC Identity Provider 구성
3. Bedrock 권한이 있는 IAM 역할
4. GitHub App (권장) 또는 기본 GITHUB\_TOKEN 사용

### 단계 1: 커스텀 GitHub App 생성 (3P 제공업체에 권장)

Vertex AI 또는 Bedrock과 같은 3P 제공업체를 사용할 때 최상의 제어 및 보안을 위해 자체 GitHub App을 만드는 것을 권장합니다:

1. [https://github.com/settings/apps/new](https://github.com/settings/apps/new)로 이동합니다
2. 기본 정보를 입력합니다:
   * **GitHub App name**: 고유한 이름 선택 (예: "YourOrg Claude Assistant")
   * **Homepage URL**: 조직의 웹사이트 또는 저장소 URL
3. 앱 설정을 구성합니다:
   * **Webhooks**: "Active" 체크를 해제합니다 (이 통합에서는 필요 없음)
4. 필요한 권한을 설정합니다:
   * **Repository permissions**:
     * Contents: Read & Write
     * Issues: Read & Write
     * Pull requests: Read & Write
5. "Create GitHub App"을 클릭합니다
6. 생성 후 "Generate a private key"를 클릭하고 다운로드된 `.pem` 파일을 저장합니다
7. 앱 설정 페이지에서 App ID를 기록합니다
8. 저장소에 앱을 설치합니다:
   * 앱 설정 페이지에서 왼쪽 사이드바의 "Install App"을 클릭합니다
   * 계정 또는 조직을 선택합니다
   * "Only select repositories"를 선택하고 특정 저장소를 선택합니다
   * "Install"을 클릭합니다
9. 개인 키를 저장소 시크릿으로 추가합니다:
   * 저장소의 Settings → Secrets and variables → Actions로 이동합니다
   * `.pem` 파일 내용을 담은 `APP_PRIVATE_KEY`라는 새 시크릿을 생성합니다
10. App ID를 시크릿으로 추가합니다:
    * GitHub App의 ID를 담은 `APP_ID`라는 새 시크릿을 생성합니다

::: info
이 앱은 워크플로우에서 인증 토큰을 생성하기 위해 [actions/create-github-app-token](https://github.com/actions/create-github-app-token) Action과 함께 사용됩니다.
:::

**Claude API 또는 자체 GitHub App을 설정하지 않으려는 경우의 대안**: 공식 Anthropic 앱을 사용하세요:

1. 설치: [https://github.com/apps/claude](https://github.com/apps/claude)
2. 인증을 위한 추가 구성 불필요

### 단계 2: 클라우드 제공업체 인증 구성

클라우드 제공업체를 선택하고 안전한 인증을 설정합니다:

<details>
<summary>AWS Bedrock</summary>

**자격 증명을 저장하지 않고 GitHub Actions가 안전하게 인증할 수 있도록 AWS를 구성합니다.**

> **보안 참고**: 저장소별 구성을 사용하고 최소한의 필수 권한만 부여하세요.

**필수 설정**:

1. **Amazon Bedrock 활성화**:
   * Amazon Bedrock에서 Claude 모델 액세스 요청
   * 크로스 리전 모델의 경우 모든 필수 리전에서 액세스 요청

2. **GitHub OIDC Identity Provider 설정**:
   * Provider URL: `https://token.actions.githubusercontent.com`
   * Audience: `sts.amazonaws.com`

3. **GitHub Actions용 IAM 역할 생성**:
   * Trusted entity type: Web identity
   * Identity provider: `token.actions.githubusercontent.com`
   * Permissions: `AmazonBedrockFullAccess` 정책
   * 특정 저장소에 대한 신뢰 정책 구성

**필요한 값**:

설정 후 다음이 필요합니다:

* **AWS\_ROLE\_TO\_ASSUME**: 생성한 IAM 역할의 ARN

::: tip
OIDC는 자격 증명이 임시적이고 자동으로 교체되기 때문에 정적 AWS 액세스 키를 사용하는 것보다 더 안전합니다.
:::

자세한 OIDC 설정 지침은 [AWS 문서](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)를 참고하세요.
</details>

<details>
<summary>Google Vertex AI</summary>

**자격 증명을 저장하지 않고 GitHub Actions가 안전하게 인증할 수 있도록 Google Cloud를 구성합니다.**

> **보안 참고**: 저장소별 구성을 사용하고 최소한의 필수 권한만 부여하세요.

**필수 설정**:

1. **Google Cloud 프로젝트에서 API 활성화**:
   * IAM Credentials API
   * Security Token Service (STS) API
   * Vertex AI API

2. **Workload Identity Federation 리소스 생성**:
   * Workload Identity Pool 생성
   * 다음을 포함하는 GitHub OIDC 제공업체 추가:
     * Issuer: `https://token.actions.githubusercontent.com`
     * 저장소 및 소유자에 대한 속성 매핑
     * **보안 권장**: 저장소별 속성 조건 사용

3. **서비스 계정 생성**:
   * `Vertex AI User` 역할만 부여
   * **보안 권장**: 저장소별 전용 서비스 계정 생성

4. **IAM 바인딩 구성**:
   * Workload Identity Pool이 서비스 계정을 가장할 수 있도록 허용
   * **보안 권장**: 저장소별 주체 집합 사용

**필요한 값**:

설정 후 다음이 필요합니다:

* **GCP\_WORKLOAD\_IDENTITY\_PROVIDER**: 전체 제공업체 리소스 이름
* **GCP\_SERVICE\_ACCOUNT**: 서비스 계정 이메일 주소

::: tip
Workload Identity Federation은 다운로드 가능한 서비스 계정 키의 필요성을 없애 보안을 향상시킵니다.
:::

자세한 설정 지침은 [Google Cloud Workload Identity Federation 문서](https://cloud.google.com/iam/docs/workload-identity-federation)를 참고하세요.
</details>

### 단계 3: 필수 시크릿 추가

저장소에 다음 시크릿을 추가합니다 (Settings → Secrets and variables → Actions):

#### Claude API (직접) 사용의 경우:

1. **API 인증용**:
   * `ANTHROPIC_API_KEY`: [console.anthropic.com](https://console.anthropic.com)의 Claude API 키

2. **GitHub App용 (자체 앱을 사용하는 경우)**:
   * `APP_ID`: GitHub App의 ID
   * `APP_PRIVATE_KEY`: 개인 키 (.pem) 내용

#### Google Cloud Vertex AI의 경우

1. **GCP 인증용**:
   * `GCP_WORKLOAD_IDENTITY_PROVIDER`
   * `GCP_SERVICE_ACCOUNT`

2. **GitHub App용 (자체 앱을 사용하는 경우)**:
   * `APP_ID`: GitHub App의 ID
   * `APP_PRIVATE_KEY`: 개인 키 (.pem) 내용

#### AWS Bedrock의 경우

1. **AWS 인증용**:
   * `AWS_ROLE_TO_ASSUME`

2. **GitHub App용 (자체 앱을 사용하는 경우)**:
   * `APP_ID`: GitHub App의 ID
   * `APP_PRIVATE_KEY`: 개인 키 (.pem) 내용

### 단계 4: 워크플로우 파일 생성

클라우드 제공업체와 통합하는 GitHub Actions 워크플로우 파일을 생성합니다. 아래 예시는 AWS Bedrock과 Google Vertex AI 모두에 대한 완전한 구성을 보여줍니다:

<details>
<summary>AWS Bedrock 워크플로우</summary>

**사전 요구사항:**

* Claude 모델 권한이 있는 AWS Bedrock 액세스 활성화
* AWS에 GitHub OIDC identity provider로 구성
* GitHub Actions를 신뢰하는 Bedrock 권한이 있는 IAM 역할

**필수 GitHub 시크릿:**

| 시크릿 이름           | 설명                                              |
| -------------------- | ------------------------------------------------- |
| `AWS_ROLE_TO_ASSUME` | Bedrock 액세스를 위한 IAM 역할의 ARN              |
| `APP_ID`             | GitHub App ID (앱 설정에서 확인)                  |
| `APP_PRIVATE_KEY`    | GitHub App을 위해 생성한 개인 키                  |

```yaml
name: Claude PR Action

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-pr:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    env:
      AWS_REGION: us-west-2
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${ '{secrets.APP_ID}' }
          private-key: ${ '{secrets.APP_PRIVATE_KEY}' }

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${ '{secrets.AWS_ROLE_TO_ASSUME}' }
          aws-region: us-west-2

      - uses: anthropics/claude-code-action@v1
        with:
          github_token: ${ '{steps.app-token.outputs.token}' }
          use_bedrock: "true"
          claude_args: '--model us.anthropic.claude-sonnet-4-6 --max-turns 10'
```

::: tip
Bedrock의 모델 ID 형식에는 지역 접두사가 포함됩니다 (예: `us.anthropic.claude-sonnet-4-6`).
:::
</details>

<details>
<summary>Google Vertex AI 워크플로우</summary>

**사전 요구사항:**

* GCP 프로젝트에서 Vertex AI API 활성화
* GitHub를 위한 Workload Identity Federation 구성
* Vertex AI 권한이 있는 서비스 계정

**필수 GitHub 시크릿:**

| 시크릿 이름                      | 설명                                              |
| -------------------------------- | ------------------------------------------------- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload identity provider 리소스 이름            |
| `GCP_SERVICE_ACCOUNT`            | Vertex AI 액세스 권한이 있는 서비스 계정 이메일   |
| `APP_ID`                         | GitHub App ID (앱 설정에서 확인)                  |
| `APP_PRIVATE_KEY`                | GitHub App을 위해 생성한 개인 키                  |

```yaml
name: Claude PR Action

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-pr:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${ '{secrets.APP_ID}' }
          private-key: ${ '{secrets.APP_PRIVATE_KEY}' }

      - name: Authenticate to Google Cloud
        id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${ '{secrets.GCP_WORKLOAD_IDENTITY_PROVIDER}' }
          service_account: ${ '{secrets.GCP_SERVICE_ACCOUNT}' }

      - uses: anthropics/claude-code-action@v1
        with:
          github_token: ${ '{steps.app-token.outputs.token}' }
          trigger_phrase: "@claude"
          use_vertex: "true"
          claude_args: '--model claude-sonnet-4-5@20250929 --max-turns 10'
        env:
          ANTHROPIC_VERTEX_PROJECT_ID: ${ '{steps.auth.outputs.project_id}' }
          CLOUD_ML_REGION: us-east5
          VERTEX_REGION_CLAUDE_4_5_SONNET: us-east5
```

::: tip
프로젝트 ID는 Google Cloud 인증 단계에서 자동으로 가져오므로 하드코딩할 필요가 없습니다.
:::
</details>

## 문제 해결

### @claude 명령에 Claude가 응답하지 않는 경우

GitHub App이 올바르게 설치되었는지 확인하고, 워크플로우가 활성화되어 있는지 확인하고, API 키가 저장소 시크릿에 설정되어 있는지 확인하고, 댓글에 `/claude`가 아닌 `@claude`가 포함되어 있는지 확인하세요.

### Claude의 커밋에서 CI가 실행되지 않는 경우

GitHub App 또는 커스텀 앱(Actions 사용자가 아님)을 사용하고 있는지 확인하고, 워크플로우 트리거에 필요한 이벤트가 포함되어 있는지 확인하고, 앱 권한에 CI 트리거가 포함되어 있는지 확인하세요.

### 인증 오류

API 키가 유효하고 충분한 권한이 있는지 확인하세요. Bedrock/Vertex의 경우 자격 증명 구성을 확인하고 시크릿 이름이 워크플로우에서 올바르게 지정되었는지 확인하세요.

## 고급 구성

### Action 파라미터

Claude Code Action v1은 단순화된 구성을 사용합니다:

| 파라미터            | 설명                                                               | 필수     |
| ------------------- | ------------------------------------------------------------------ | -------- |
| `prompt`            | Claude에 대한 지침 (일반 텍스트 또는 [skill](/skills) 이름)       | 아니요\* |
| `claude_args`       | Claude Code에 전달되는 CLI 인수                                    | 아니요   |
| `anthropic_api_key` | Claude API 키                                                      | 예\*\*   |
| `github_token`      | API 액세스를 위한 GitHub 토큰                                      | 아니요   |
| `trigger_phrase`    | 커스텀 트리거 문구 (기본값: "@claude")                             | 아니요   |
| `use_bedrock`       | Claude API 대신 AWS Bedrock 사용                                   | 아니요   |
| `use_vertex`        | Claude API 대신 Google Vertex AI 사용                              | 아니요   |

\*이슈/PR 댓글에서 생략하면 Claude가 트리거 문구에 응답합니다\
\*\*직접 Claude API에는 필수, Bedrock/Vertex에는 불필요

#### CLI 인수 전달

`claude_args` 파라미터는 모든 Claude Code CLI 인수를 허용합니다:

```yaml
claude_args: "--max-turns 5 --model claude-sonnet-4-6 --mcp-config /path/to/config.json"
```

일반적인 인수:

* `--max-turns`: 최대 대화 턴 수 (기본값: 10)
* `--model`: 사용할 모델 (예: `claude-sonnet-4-6`)
* `--mcp-config`: MCP 구성 경로
* `--allowedTools`: 허용된 도구의 쉼표로 구분된 목록. `--allowed-tools` 별칭도 사용 가능합니다.
* `--debug`: 디버그 출력 활성화

### 대체 통합 방법

`/install-github-app` 명령이 권장 방법이지만, 다음과 같은 방법도 사용할 수 있습니다:

* **커스텀 GitHub App**: 브랜딩된 사용자명이나 커스텀 인증 플로우가 필요한 조직을 위한 방법입니다. 필요한 권한(contents, issues, pull requests)을 가진 자체 GitHub App을 생성하고 actions/create-github-app-token Action을 사용하여 워크플로우에서 토큰을 생성하세요.
* **수동 GitHub Actions**: 최대한의 유연성을 위한 직접 워크플로우 구성
* **MCP 구성**: Model Context Protocol 서버의 동적 로딩

인증, 보안, 고급 구성에 대한 자세한 가이드는 [Claude Code Action 문서](https://github.com/anthropics/claude-code-action/blob/main/docs)를 참고하세요.

### Claude의 동작 커스터마이징

Claude의 동작을 두 가지 방법으로 구성할 수 있습니다:

1. **CLAUDE.md**: 저장소 루트의 `CLAUDE.md` 파일에 코딩 표준, 리뷰 기준, 프로젝트별 규칙을 정의하세요. Claude가 PR을 생성하고 요청에 응답할 때 이 가이드라인을 따릅니다. 자세한 내용은 [Memory 문서](/memory)를 참고하세요.
2. **커스텀 프롬프트**: 워크플로우 파일에서 `prompt` 파라미터를 사용하여 워크플로우별 지침을 제공하세요. 이를 통해 다양한 워크플로우나 작업에 맞게 Claude의 동작을 커스터마이징할 수 있습니다.

Claude가 PR을 생성하고 요청에 응답할 때 이 가이드라인을 따릅니다.
