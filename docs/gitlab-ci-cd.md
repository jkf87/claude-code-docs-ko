---
title: Claude Code GitLab CI/CD
description: "GitLab CI/CD와 Claude Code를 개발 워크플로에 통합하는 방법을 알아보세요"
---

# Claude Code GitLab CI/CD

::: info
GitLab CI/CD용 Claude Code는 현재 베타 단계입니다. 기능과 동작 방식은 개선 과정에서 변경될 수 있습니다.

이 통합은 GitLab에서 유지 관리합니다. 지원이 필요한 경우 [GitLab 이슈](https://gitlab.com/gitlab-org/gitlab/-/issues/573776)를 참고하세요.
:::

::: info
이 통합은 [Claude Code CLI 및 Agent SDK](/agent-sdk/overview) 위에 구축되어 있으며, CI/CD 작업 및 커스텀 자동화 워크플로에서 Claude를 프로그래밍 방식으로 사용할 수 있습니다.
:::

## GitLab과 함께 Claude Code를 사용하는 이유

* **즉각적인 MR 생성**: 필요한 내용을 설명하면 Claude가 변경 사항과 설명이 담긴 완성된 MR을 제안합니다
* **자동화된 구현**: 단일 명령 또는 멘션으로 이슈를 작동하는 코드로 전환합니다
* **프로젝트 인식**: Claude는 `CLAUDE.md` 가이드라인과 기존 코드 패턴을 따릅니다
* **간편한 설정**: `.gitlab-ci.yml`에 하나의 작업을 추가하고 마스킹된 CI/CD 변수를 설정하면 됩니다
* **엔터프라이즈 지원**: 데이터 상주 및 조달 요구 사항을 충족하기 위해 Claude API, AWS Bedrock, 또는 Google Vertex AI를 선택할 수 있습니다
* **기본 보안**: GitLab 러너에서 브랜치 보호 및 승인과 함께 실행됩니다

## 작동 방식

Claude Code는 GitLab CI/CD를 사용하여 격리된 작업에서 AI 태스크를 실행하고 MR을 통해 결과를 커밋합니다:

1. **이벤트 기반 오케스트레이션**: GitLab은 선택한 트리거(예: 이슈, MR, 또는 리뷰 스레드에서 `@claude`를 언급하는 코멘트)를 감지합니다. 작업은 스레드와 저장소에서 컨텍스트를 수집하고, 해당 입력으로 프롬프트를 구성한 다음 Claude Code를 실행합니다.

2. **프로바이더 추상화**: 환경에 맞는 프로바이더를 선택하세요:
   * Claude API (SaaS)
   * AWS Bedrock (IAM 기반 액세스, 크로스 리전 옵션)
   * Google Vertex AI (GCP 네이티브, Workload Identity Federation)

3. **샌드박스 실행**: 각 상호작용은 엄격한 네트워크 및 파일 시스템 규칙이 적용된 컨테이너에서 실행됩니다. Claude Code는 워크스페이스 범위의 권한을 적용하여 쓰기를 제한합니다. 모든 변경 사항은 MR을 통해 처리되므로 리뷰어가 diff를 확인하고 승인을 적용할 수 있습니다.

지역 엔드포인트를 선택하여 지연 시간을 줄이고, 기존 클라우드 계약을 활용하면서 데이터 주권 요건을 충족할 수 있습니다.

## Claude로 할 수 있는 것

Claude Code는 코드 작업 방식을 혁신하는 강력한 CI/CD 워크플로를 지원합니다:

* 이슈 설명 또는 코멘트로부터 MR 생성 및 업데이트
* 성능 회귀 분석 및 최적화 제안
* 브랜치에 직접 기능 구현 후 MR 오픈
* 테스트 또는 코멘트로 식별된 버그 및 회귀 수정
* 후속 코멘트에 응답하여 요청된 변경 사항 반복 처리

## 설정

### 빠른 설정

시작하는 가장 빠른 방법은 `.gitlab-ci.yml`에 최소한의 작업을 추가하고 API 키를 마스킹된 변수로 설정하는 것입니다.

1. **마스킹된 CI/CD 변수 추가**
   * **Settings** → **CI/CD** → **Variables**로 이동합니다
   * `ANTHROPIC_API_KEY`를 추가합니다 (필요에 따라 마스킹 및 보호 설정)

2. **`.gitlab-ci.yml`에 Claude 작업 추가**

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  # 작업 트리거 방식을 원하는 대로 조정하세요:
  # - 수동 실행
  # - 머지 리퀘스트 이벤트
  # - 코멘트에 '@claude'가 포함될 때 web/API 트리거
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
  script:
    # 선택 사항: 설정에서 GitLab MCP 서버를 제공하는 경우 시작
    - /bin/gitlab-mcp-server || true
    # web/API 트리거로 컨텍스트 페이로드를 전달할 때 AI_FLOW_* 변수 사용
    - echo "$AI_FLOW_INPUT for $AI_FLOW_CONTEXT on $AI_FLOW_EVENT"
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Review this MR and implement the requested changes'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
```

작업과 `ANTHROPIC_API_KEY` 변수를 추가한 후, **CI/CD** → **Pipelines**에서 수동으로 작업을 실행하여 테스트하거나, MR에서 트리거하여 Claude가 브랜치에 업데이트를 제안하고 필요시 MR을 오픈하도록 할 수 있습니다.

::: info
Claude API 대신 AWS Bedrock 또는 Google Vertex AI에서 실행하려면 아래의 [AWS Bedrock & Google Vertex AI와 함께 사용하기](#aws-bedrock-google-vertex-ai와-함께-사용하기) 섹션을 참고하세요.
:::

### 수동 설정 (프로덕션 환경 권장)

더 세밀한 제어가 필요하거나 엔터프라이즈 프로바이더가 필요한 경우:

1. **프로바이더 액세스 구성**:
   * **Claude API**: `ANTHROPIC_API_KEY`를 생성하고 마스킹된 CI/CD 변수로 저장
   * **AWS Bedrock**: **GitLab** → **AWS OIDC** 구성 및 Bedrock용 IAM 역할 생성
   * **Google Vertex AI**: **GitLab** → **GCP**를 위한 Workload Identity Federation 구성

2. **GitLab API 작업을 위한 프로젝트 자격 증명 추가**:
   * 기본적으로 `CI_JOB_TOKEN`을 사용하거나, `api` 범위의 Project Access Token 생성
   * PAT를 사용하는 경우 `GITLAB_ACCESS_TOKEN` (마스킹)으로 저장

3. **`.gitlab-ci.yml`에 Claude 작업 추가** (아래 예시 참고)

4. **(선택 사항) 멘션 기반 트리거 활성화**:
   * 이벤트 리스너(사용하는 경우)에 "Comments (notes)"에 대한 프로젝트 웹훅 추가
   * 코멘트에 `@claude`가 포함될 때 리스너가 `AI_FLOW_INPUT` 및 `AI_FLOW_CONTEXT`와 같은 변수로 파이프라인 트리거 API를 호출하도록 설정

## 사용 사례 예시

### 이슈를 MR로 전환

이슈 코멘트에서:

```text
@claude implement this feature based on the issue description
```

Claude가 이슈와 코드베이스를 분석하고, 브랜치에 변경 사항을 작성한 후 리뷰를 위한 MR을 오픈합니다.

### 구현 도움 받기

MR 토론에서:

```text
@claude suggest a concrete approach to cache the results of this API call
```

Claude가 변경 사항을 제안하고, 적절한 캐싱으로 코드를 추가한 후 MR을 업데이트합니다.

### 빠른 버그 수정

이슈 또는 MR 코멘트에서:

```text
@claude fix the TypeError in the user dashboard component
```

Claude가 버그를 찾아 수정을 구현하고, 브랜치를 업데이트하거나 새 MR을 오픈합니다.

## AWS Bedrock & Google Vertex AI와 함께 사용하기

엔터프라이즈 환경의 경우, 동일한 개발자 경험으로 클라우드 인프라에서 완전히 Claude Code를 실행할 수 있습니다.

### AWS Bedrock

#### 사전 요구 사항

AWS Bedrock과 함께 Claude Code를 설정하기 전에 다음이 필요합니다:

1. 원하는 Claude 모델에 대한 Amazon Bedrock 액세스가 있는 AWS 계정
2. AWS IAM에서 OIDC ID 프로바이더로 구성된 GitLab
3. Bedrock 권한과 GitLab 프로젝트/refs로 제한된 신뢰 정책이 있는 IAM 역할
4. 역할 가정을 위한 GitLab CI/CD 변수:
   * `AWS_ROLE_TO_ASSUME` (역할 ARN)
   * `AWS_REGION` (Bedrock 리전)

#### 설정 지침

OIDC를 통해 GitLab CI 작업이 IAM 역할을 가정할 수 있도록 AWS를 구성합니다 (정적 키 불필요).

**필수 설정:**

1. Amazon Bedrock을 활성화하고 대상 Claude 모델에 대한 액세스 요청
2. 아직 없는 경우 GitLab용 IAM OIDC 프로바이더 생성
3. GitLab OIDC 프로바이더가 신뢰하는 IAM 역할 생성 (프로젝트 및 보호된 refs로 제한)
4. Bedrock 호출 API에 대한 최소 권한 부여

**CI/CD 변수에 저장할 필수 값:**

* `AWS_ROLE_TO_ASSUME`
* `AWS_REGION`

Settings → CI/CD → Variables에서 변수를 추가하세요:

```yaml
# AWS Bedrock용:
- AWS_ROLE_TO_ASSUME
- AWS_REGION
```

위의 AWS Bedrock 작업 예시를 사용하여 런타임에 GitLab 작업 토큰을 임시 AWS 자격 증명으로 교환하세요.

### Google Vertex AI

#### 사전 요구 사항

Google Vertex AI와 함께 Claude Code를 설정하기 전에 다음이 필요합니다:

1. 다음이 포함된 Google Cloud 프로젝트:
   * Vertex AI API 활성화
   * GitLab OIDC를 신뢰하도록 구성된 Workload Identity Federation
2. 필요한 Vertex AI 역할만 있는 전용 서비스 계정
3. WIF를 위한 GitLab CI/CD 변수:
   * `GCP_WORKLOAD_IDENTITY_PROVIDER` (전체 리소스 이름)
   * `GCP_SERVICE_ACCOUNT` (서비스 계정 이메일)

#### 설정 지침

Workload Identity Federation을 통해 GitLab CI 작업이 서비스 계정을 가장할 수 있도록 Google Cloud를 구성합니다.

**필수 설정:**

1. IAM Credentials API, STS API, Vertex AI API 활성화
2. GitLab OIDC용 Workload Identity Pool 및 프로바이더 생성
3. Vertex AI 역할이 있는 전용 서비스 계정 생성
4. WIF 주체에게 서비스 계정 가장 권한 부여

**CI/CD 변수에 저장할 필수 값:**

* `GCP_WORKLOAD_IDENTITY_PROVIDER`
* `GCP_SERVICE_ACCOUNT`

Settings → CI/CD → Variables에서 변수를 추가하세요:

```yaml
# Google Vertex AI용:
- GCP_WORKLOAD_IDENTITY_PROVIDER
- GCP_SERVICE_ACCOUNT
- CLOUD_ML_REGION (예: us-east5)
```

키를 저장하지 않고 인증하려면 위의 Google Vertex AI 작업 예시를 사용하세요.

## 구성 예시

다음은 파이프라인에 적용할 수 있는 바로 사용 가능한 스니펫입니다.

### 기본 .gitlab-ci.yml (Claude API)

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
  script:
    - /bin/gitlab-mcp-server || true
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Summarize recent changes and suggest improvements'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  # Claude Code는 CI/CD 변수의 ANTHROPIC_API_KEY를 사용합니다
```

### AWS Bedrock 작업 예시 (OIDC)

**사전 요구 사항:**

* 선택한 Claude 모델에 대한 액세스가 활성화된 Amazon Bedrock
* GitLab 프로젝트 및 refs를 신뢰하는 역할로 AWS에서 GitLab OIDC 구성
* Bedrock 권한이 있는 IAM 역할 (최소 권한 권장)

**필수 CI/CD 변수:**

* `AWS_ROLE_TO_ASSUME`: Bedrock 액세스를 위한 IAM 역할의 ARN
* `AWS_REGION`: Bedrock 리전 (예: `us-west-2`)

```yaml
claude-bedrock:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apk add --no-cache bash curl jq git python3 py3-pip
    - pip install --no-cache-dir awscli
    - curl -fsSL https://claude.ai/install.sh | bash
    # GitLab OIDC 토큰을 AWS 자격 증명으로 교환
    - export AWS_WEB_IDENTITY_TOKEN_FILE="${CI_JOB_JWT_FILE:-/tmp/oidc_token}"
    - if [ -n "${CI_JOB_JWT_V2}" ]; then printf "%s" "$CI_JOB_JWT_V2" > "$AWS_WEB_IDENTITY_TOKEN_FILE"; fi
    - >
      aws sts assume-role-with-web-identity
      --role-arn "$AWS_ROLE_TO_ASSUME"
      --role-session-name "gitlab-claude-$(date +%s)"
      --web-identity-token "file://$AWS_WEB_IDENTITY_TOKEN_FILE"
      --duration-seconds 3600 > /tmp/aws_creds.json
    - export AWS_ACCESS_KEY_ID="$(jq -r .Credentials.AccessKeyId /tmp/aws_creds.json)"
    - export AWS_SECRET_ACCESS_KEY="$(jq -r .Credentials.SecretAccessKey /tmp/aws_creds.json)"
    - export AWS_SESSION_TOKEN="$(jq -r .Credentials.SessionToken /tmp/aws_creds.json)"
  script:
    - /bin/gitlab-mcp-server || true
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Implement the requested changes and open an MR'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    AWS_REGION: "us-west-2"
```

::: info
Bedrock의 모델 ID에는 리전별 접두사가 포함됩니다 (예: `us.anthropic.claude-sonnet-4-6`). 워크플로에서 지원하는 경우 작업 구성 또는 프롬프트를 통해 원하는 모델을 전달하세요.
:::

### Google Vertex AI 작업 예시 (Workload Identity Federation)

**사전 요구 사항:**

* GCP 프로젝트에서 Vertex AI API 활성화
* GitLab OIDC를 신뢰하도록 Workload Identity Federation 구성
* Vertex AI 권한이 있는 서비스 계정

**필수 CI/CD 변수:**

* `GCP_WORKLOAD_IDENTITY_PROVIDER`: 전체 프로바이더 리소스 이름
* `GCP_SERVICE_ACCOUNT`: 서비스 계정 이메일
* `CLOUD_ML_REGION`: Vertex 리전 (예: `us-east5`)

```yaml
claude-vertex:
  stage: ai
  image: gcr.io/google.com/cloudsdktool/google-cloud-cli:slim
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apt-get update && apt-get install -y git && apt-get clean
    - curl -fsSL https://claude.ai/install.sh | bash
    # WIF를 통해 Google Cloud 인증 (다운로드된 키 불필요)
    - >
      gcloud auth login --cred-file=<(cat <<EOF
      {
        "type": "external_account",
        "audience": "${GCP_WORKLOAD_IDENTITY_PROVIDER}",
        "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
        "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT}:generateAccessToken",
        "token_url": "https://sts.googleapis.com/v1/token"
      }
      EOF
      )
    - gcloud config set project "$(gcloud projects list --format='value(projectId)' --filter="name:${CI_PROJECT_NAMESPACE}" | head -n1)" || true
  script:
    - /bin/gitlab-mcp-server || true
    - >
      CLOUD_ML_REGION="${CLOUD_ML_REGION:-us-east5}"
      claude
      -p "${AI_FLOW_INPUT:-'Review and update code as requested'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    CLOUD_ML_REGION: "us-east5"
```

::: info
Workload Identity Federation을 사용하면 서비스 계정 키를 저장할 필요가 없습니다. 저장소별 신뢰 조건과 최소 권한 서비스 계정을 사용하세요.
:::

## 모범 사례

### CLAUDE.md 구성

저장소 루트에 `CLAUDE.md` 파일을 생성하여 코딩 표준, 리뷰 기준, 프로젝트별 규칙을 정의하세요. Claude는 실행 중 이 파일을 읽고 변경 사항을 제안할 때 규칙을 따릅니다.

### 보안 고려 사항

**API 키 또는 클라우드 자격 증명을 저장소에 절대 커밋하지 마세요**. 항상 GitLab CI/CD 변수를 사용하세요:

* `ANTHROPIC_API_KEY`를 마스킹된 변수로 추가 (필요시 보호 설정)
* 가능한 경우 프로바이더별 OIDC 사용 (장기 키 불필요)
* 작업 권한 및 네트워크 이그레스 제한
* 다른 기여자의 코드처럼 Claude의 MR 검토

### 성능 최적화

* `CLAUDE.md`를 간결하게 유지
* 반복 작업을 줄이기 위해 명확한 이슈/MR 설명 제공
* 불필요하게 긴 실행을 방지하기 위해 적절한 작업 타임아웃 구성
* 가능한 경우 러너에서 npm 및 패키지 설치 캐싱

### CI 비용

GitLab CI/CD와 함께 Claude Code를 사용할 때 관련 비용을 고려하세요:

* **GitLab Runner 시간**:
  * Claude는 GitLab 러너에서 실행되며 컴퓨팅 시간을 소비합니다
  * 자세한 내용은 GitLab 플랜의 러너 결제 정책을 참고하세요

* **API 비용**:
  * 각 Claude 상호작용은 프롬프트 및 응답 크기에 따라 토큰을 소비합니다
  * 토큰 사용량은 작업 복잡도와 코드베이스 크기에 따라 다릅니다
  * 자세한 내용은 [Anthropic 요금제](https://platform.claude.com/docs/en/about-claude/pricing)를 참고하세요

* **비용 최적화 팁**:
  * 불필요한 턴을 줄이기 위해 구체적인 `@claude` 명령 사용
  * 적절한 `max_turns` 및 작업 타임아웃 값 설정
  * 병렬 실행 수를 제한하여 동시 실행 제어

## 보안 및 거버넌스

* 각 작업은 제한된 네트워크 액세스가 있는 격리된 컨테이너에서 실행됩니다
* Claude의 변경 사항은 MR을 통해 처리되므로 리뷰어가 모든 diff를 확인합니다
* AI 생성 코드에 브랜치 보호 및 승인 규칙이 적용됩니다
* Claude Code는 워크스페이스 범위의 권한을 사용하여 쓰기를 제한합니다
* 직접 프로바이더 자격 증명을 사용하므로 비용이 제어됩니다

## 문제 해결

### @claude 명령에 응답하지 않는 경우

* 파이프라인이 트리거되고 있는지 확인하세요 (수동, MR 이벤트, 또는 노트 이벤트 리스너/웹훅을 통해)
* CI/CD 변수(`ANTHROPIC_API_KEY` 또는 클라우드 프로바이더 설정)가 존재하고 마스킹 해제되었는지 확인하세요
* 코멘트에 `/claude`가 아닌 `@claude`가 포함되어 있는지, 멘션 트리거가 구성되어 있는지 확인하세요

### 작업이 코멘트를 작성하거나 MR을 열 수 없는 경우

* `CI_JOB_TOKEN`이 프로젝트에 대한 충분한 권한을 가지고 있거나, `api` 범위의 Project Access Token을 사용하는지 확인하세요
* `--allowedTools`에 `mcp__gitlab` 도구가 활성화되어 있는지 확인하세요
* 작업이 MR 컨텍스트에서 실행되거나 `AI_FLOW_*` 변수를 통해 충분한 컨텍스트를 가지고 있는지 확인하세요

### 인증 오류

* **Claude API의 경우**: `ANTHROPIC_API_KEY`가 유효하고 만료되지 않았는지 확인하세요
* **Bedrock/Vertex의 경우**: OIDC/WIF 구성, 역할 가장, 시크릿 이름을 확인하고, 리전 및 모델 가용성을 확인하세요

## 고급 구성

### 공통 파라미터 및 변수

Claude Code는 다음과 같이 일반적으로 사용되는 입력을 지원합니다:

* `prompt` / `prompt_file`: 인라인(`-p`) 또는 파일을 통해 지침 제공
* `max_turns`: 왕복 반복 횟수 제한
* `timeout_minutes`: 총 실행 시간 제한
* `ANTHROPIC_API_KEY`: Claude API에 필요 (Bedrock/Vertex에는 사용되지 않음)
* 프로바이더별 환경: `AWS_REGION`, Vertex용 프로젝트/리전 변수

::: info
정확한 플래그 및 파라미터는 `@anthropic-ai/claude-code` 버전에 따라 다를 수 있습니다. 지원되는 옵션을 확인하려면 작업에서 `claude --help`를 실행하세요.
:::

### Claude 동작 커스터마이징

두 가지 주요 방법으로 Claude를 안내할 수 있습니다:

1. **CLAUDE.md**: 코딩 표준, 보안 요구 사항, 프로젝트 규칙을 정의합니다. Claude는 실행 중 이 파일을 읽고 규칙을 따릅니다.
2. **커스텀 프롬프트**: 작업에서 `prompt`/`prompt_file`을 통해 태스크별 지침을 전달합니다. 다른 작업에 다른 프롬프트를 사용하세요 (예: 리뷰, 구현, 리팩토링).
