---
title: GitHub Enterprise Server와 Claude Code
description: "자체 호스팅된 GitHub Enterprise Server 인스턴스를 Claude Code에 연결하여 웹 세션, Code Review, 플러그인 마켓플레이스를 활용하세요."
---

# GitHub Enterprise Server와 Claude Code

::: info
GitHub Enterprise Server 지원은 Team 및 Enterprise 플랜에서 사용할 수 있습니다.
:::

GitHub Enterprise Server (GHES) 지원을 통해 조직에서는 github.com 대신 자체 관리하는 GitHub 인스턴스에 호스팅된 저장소와 함께 Claude Code를 사용할 수 있습니다. 관리자가 GHES 인스턴스를 연결하면, 개발자는 저장소별 별도 설정 없이 웹 세션을 실행하고, 자동화된 Code Review를 받고, 내부 마켓플레이스에서 플러그인을 설치할 수 있습니다.

github.com의 저장소를 사용하는 경우, [Claude Code on the web](/claude-code-on-the-web)과 [Code Review](/code-review)를 참조하세요. Claude를 자체 CI 인프라에서 실행하려면 [GitHub Actions](/github-actions)를 참조하세요.

## GitHub Enterprise Server에서 지원되는 기능

아래 표는 어떤 Claude Code 기능이 GHES를 지원하며 github.com 동작과의 차이점이 무엇인지 보여줍니다.

| 기능                   | GHES 지원       | 비고                                                                                                                         |
| :--------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| Claude Code on the web | ✅ 지원          | 관리자가 GHES 인스턴스를 한 번 연결하면, 개발자는 `claude --remote` 또는 [claude.ai/code](https://claude.ai/code)를 평소대로 사용할 수 있음 |
| Code Review            | ✅ 지원          | github.com과 동일한 자동화된 PR 리뷰                                                                                         |
| Teleport 세션          | ✅ 지원          | `--teleport`로 웹과 터미널 사이에서 세션 이동 가능                                                                           |
| 플러그인 마켓플레이스  | ✅ 지원          | `owner/repo` 단축 표기 대신 전체 git URL 사용                                                                                |
| 기여 지표              | ✅ 지원          | [분석 대시보드](/analytics)에 웹훅을 통해 전달                                                                               |
| GitHub Actions         | ✅ 지원          | 수동 워크플로 설정 필요; `/install-github-app`은 github.com 전용                                                             |
| GitHub MCP server      | ❌ 미지원        | GitHub MCP server는 GHES 인스턴스와 함께 동작하지 않음                                                                       |

## 관리자 설정

관리자는 GHES 인스턴스를 Claude Code에 한 번만 연결하면 됩니다. 이후 조직의 개발자는 추가 설정 없이 GHES 저장소를 사용할 수 있습니다. Claude 조직의 관리자 권한과 GHES 인스턴스에서 GitHub App을 생성할 수 있는 권한이 필요합니다.

안내 설정은 GitHub App 매니페스트를 생성하고 GHES 인스턴스로 리디렉션하여 클릭 한 번으로 앱을 생성할 수 있도록 합니다. 환경이 리디렉션 흐름을 차단하는 경우 [대안적인 수동 설정](#수동-설정)을 사용할 수 있습니다.

### 단계 1: Claude Code 관리자 설정 열기

[claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)로 이동하여 GitHub Enterprise Server 섹션을 찾습니다.

### 단계 2: 안내 설정 시작

**Connect**를 클릭합니다. 연결의 표시 이름과 GHES 호스트명(예: `github.example.com`)을 입력합니다. GHES 인스턴스가 자체 서명된 인증서나 비공개 인증 기관을 사용하는 경우, 선택 입력란에 CA 인증서를 붙여넣습니다.

### 단계 3: GitHub App 생성

**Continue to GitHub Enterprise**를 클릭합니다. 브라우저가 미리 채워진 앱 매니페스트와 함께 GHES 인스턴스로 리디렉션됩니다. 설정을 검토하고 **Create GitHub App**을 클릭합니다. GHES가 앱 자격 증명이 자동으로 저장된 상태로 Claude로 다시 리디렉션합니다.

### 단계 4: 저장소에 앱 설치

GHES 인스턴스의 GitHub App 페이지에서 Claude가 접근할 저장소 또는 조직에 앱을 설치합니다. 일부만 먼저 시작하고 나중에 더 추가할 수 있습니다.

### 단계 5: 기능 활성화

[claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)로 돌아가서 github.com과 동일한 설정으로 GHES 저장소에 대한 [Code Review](/code-review#set-up-code-review)와 [기여 지표](/analytics#enable-contribution-metrics)를 활성화합니다.

### GitHub App 권한

매니페스트는 웹 세션, Code Review, 기여 지표 전반에 걸쳐 Claude가 필요로 하는 권한 및 웹훅 이벤트로 GitHub App을 설정합니다:

| 권한             | 접근 수준      | 용도                                        |
| :--------------- | :------------- | :------------------------------------------ |
| Contents         | 읽기 및 쓰기   | 저장소 클론 및 브랜치 푸시                  |
| Pull requests    | 읽기 및 쓰기   | PR 생성 및 리뷰 댓글 게시                   |
| Issues           | 읽기 및 쓰기   | 이슈 멘션에 응답                            |
| Checks           | 읽기 및 쓰기   | Code Review 체크 실행 게시                  |
| Actions          | 읽기           | 자동 수정을 위한 CI 상태 읽기               |
| Repository hooks | 읽기 및 쓰기   | 기여 지표를 위한 웹훅 수신                  |
| Metadata         | 읽기           | 모든 앱에 대해 GitHub에서 필수              |

앱은 `pull_request`, `issue_comment`, `pull_request_review_comment`, `pull_request_review`, `check_run` 이벤트를 구독합니다.

### 수동 설정

안내 리디렉션 흐름이 네트워크 설정으로 인해 차단된 경우, Connect 대신 **Add manually**를 클릭합니다. GHES 인스턴스에서 [위의 권한 및 이벤트](#github-app-권한)로 GitHub App을 생성한 다음, 양식에 앱 자격 증명(호스트명, OAuth 클라이언트 ID 및 시크릿, GitHub App ID, 클라이언트 ID, 클라이언트 시크릿, 웹훅 시크릿, 비공개 키)을 입력합니다.

### 네트워크 요구사항

Claude가 저장소를 클론하고 리뷰 댓글을 게시할 수 있도록 GHES 인스턴스가 Anthropic 인프라에서 접근 가능해야 합니다. GHES 인스턴스가 방화벽 뒤에 있는 경우, [Anthropic API IP 주소](https://platform.claude.com/docs/en/api/ip-addresses)를 허용 목록에 추가하세요.

## 개발자 워크플로

관리자가 GHES 인스턴스를 연결하면 개발자 측에서 별도의 설정이 필요 없습니다. Claude Code는 작업 디렉터리의 git 리모트에서 GHES 호스트명을 자동으로 감지합니다.

GHES 인스턴스에서 저장소를 평소대로 클론합니다:

```bash
git clone git@github.example.com:platform/api-service.git
cd api-service
```

그런 다음 웹 세션을 시작합니다. Claude는 git 리모트에서 GHES 호스트를 감지하고 조직의 설정된 인스턴스를 통해 세션을 라우팅합니다:

```bash
claude --remote "Add retry logic to the payment webhook handler"
```

세션은 Anthropic 인프라에서 실행되며, GHES에서 저장소를 클론하고 브랜치에 변경사항을 푸시합니다. `/tasks`를 사용하거나 [claude.ai/code](https://claude.ai/code)에서 진행 상황을 모니터링할 수 있습니다. 차이점 검토, 자동 수정, 예약 작업을 포함한 전체 원격 세션 워크플로는 [Claude Code on the web](/claude-code-on-the-web)을 참조하세요.

### 터미널로 세션 Teleport

`claude --teleport`로 웹 세션을 로컬 터미널로 가져옵니다. Teleport는 브랜치를 가져오고 세션 기록을 로드하기 전에 동일한 GHES 저장소의 체크아웃 안에 있는지 확인합니다. 자세한 내용은 [teleport 요구사항](/claude-code-on-the-web#teleport-requirements)을 참조하세요.

## GHES의 플러그인 마켓플레이스

GHES 인스턴스에 플러그인 마켓플레이스를 호스팅하여 조직 전체에 내부 도구를 배포할 수 있습니다. 마켓플레이스 구조는 github.com에 호스팅된 마켓플레이스와 동일하며, 차이점은 참조 방식뿐입니다.

### GHES 마켓플레이스 추가

`owner/repo` 단축 표기는 항상 github.com으로 연결됩니다. GHES에 호스팅된 마켓플레이스는 전체 git URL을 사용하세요:

```bash
/plugin marketplace add git@github.example.com:platform/claude-plugins.git
```

HTTPS URL도 사용 가능합니다:

```bash
/plugin marketplace add https://github.example.com/platform/claude-plugins.git
```

마켓플레이스를 구축하는 전체 가이드는 [플러그인 마켓플레이스 생성 및 배포](/plugin-marketplaces)를 참조하세요.

### 관리 설정에서 GHES 마켓플레이스 허용 목록 설정

조직에서 [관리 설정](/settings)을 사용하여 개발자가 추가할 수 있는 마켓플레이스를 제한하는 경우, `hostPattern` 소스 유형을 사용하면 각 저장소를 일일이 나열하지 않고도 GHES 인스턴스의 모든 마켓플레이스를 허용할 수 있습니다:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

개발자가 수동 설정 없이 마켓플레이스를 바로 사용할 수 있도록 미리 등록할 수도 있습니다. 아래 예시는 조직 전체에서 내부 도구 마켓플레이스를 사용 가능하게 만듭니다:

```json
{
  "extraKnownMarketplaces": {
    "internal-tools": {
      "source": {
        "source": "git",
        "url": "git@github.example.com:platform/claude-plugins.git"
      }
    }
  }
}
```

전체 스키마는 [strictKnownMarketplaces](/settings#strictknownmarketplaces) 및 [extraKnownMarketplaces](/settings#extraknownmarketplaces) 설정 참조를 확인하세요.

## 제한사항

일부 기능은 GHES에서 github.com과 다르게 동작합니다. [기능 표](#github-enterprise-server에서-지원되는-기능)에서 지원 현황을 요약하며, 이 섹션에서는 대안을 설명합니다.

* **`/install-github-app` 명령**: 대신 claude.ai에서 [관리자 설정](#관리자-설정) 흐름을 따르세요. GHES에서 GitHub Actions 워크플로도 원하는 경우, [예시 워크플로](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml)를 수동으로 수정하세요.
* **GitHub MCP server**: GHES 호스트에 맞게 설정된 `gh` CLI를 대신 사용하세요. `gh auth login --hostname github.example.com`을 실행하여 인증하면, Claude가 세션에서 `gh` 명령을 사용할 수 있습니다.

## 문제 해결

### 웹 세션의 저장소 클론 실패

`claude --remote`가 클론 오류와 함께 실패하는 경우, 관리자가 GHES 인스턴스 설정을 완료했는지, 그리고 작업 중인 저장소에 GitHub App이 설치되어 있는지 확인하세요. Claude 설정에 등록된 인스턴스 호스트명이 git 리모트의 호스트명과 일치하는지 관리자에게 확인하세요.

### 정책 오류로 인한 마켓플레이스 추가 실패

GHES URL에 대해 `/plugin marketplace add`가 차단된 경우, 조직에서 마켓플레이스 소스를 제한하고 있는 것입니다. 관리자에게 [관리 설정](#관리-설정에서-ghes-마켓플레이스-허용-목록-설정)에서 GHES 호스트명에 대한 `hostPattern` 항목을 추가해 달라고 요청하세요.

### GHES 인스턴스에 접근 불가

리뷰나 웹 세션이 시간 초과되는 경우, Anthropic 인프라에서 GHES 인스턴스에 접근하지 못할 수 있습니다. 방화벽이 [Anthropic API IP 주소](https://platform.claude.com/docs/en/api/ip-addresses)의 인바운드 연결을 허용하는지 확인하세요.

## 관련 리소스

이 가이드에서 언급된 기능들을 더 자세히 다루는 페이지들입니다:

* [Claude Code on the web](/claude-code-on-the-web): 클라우드 인프라에서 Claude Code 세션 실행
* [Code Review](/code-review): 자동화된 PR 리뷰
* [플러그인 마켓플레이스](/plugin-marketplaces): 플러그인 카탈로그 구축 및 배포
* [Analytics](/analytics): 사용량 및 기여 지표 추적
* [관리 설정](/settings): 조직 전체 정책 설정
* [네트워크 설정](/network-config): 방화벽 및 IP 허용 목록 요구사항
