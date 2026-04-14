---
title: 웹에서 Claude Code 사용하기
description: 클라우드 환경, 설정 스크립트, 네트워크 접근, Docker를 Anthropic 샌드박스에서 구성하세요. --remote와 --teleport로 웹과 터미널 간 세션을 이동할 수 있습니다.
---

# 웹에서 Claude Code 사용하기

::: info
웹에서의 Claude Code는 Pro, Max, Team 사용자와 프리미엄 시트 또는 Chat + Claude Code 시트를 보유한 Enterprise 사용자를 위한 리서치 프리뷰입니다.
:::

웹에서의 Claude Code는 [claude.ai/code](https://claude.ai/code)에서 Anthropic이 관리하는 클라우드 인프라에서 작업을 실행합니다. 브라우저를 닫아도 세션이 유지되며, Claude 모바일 앱에서 모니터링할 수 있습니다.

::: tip
웹에서 Claude Code를 처음 사용하시나요? [시작하기](/web-quickstart)에서 GitHub 계정을 연결하고 첫 번째 작업을 제출해 보세요.
:::

이 페이지에서 다루는 내용:

* [GitHub 인증 옵션](#github-인증-옵션): GitHub 연결 두 가지 방법
* [클라우드 환경](#클라우드-환경): 이전되는 설정, 설치된 도구, 환경 구성 방법
* [설정 스크립트](#설정-스크립트)와 의존성 관리
* [네트워크 접근](#네트워크-접근): 레벨, 프록시, 기본 허용 목록
* [웹과 터미널 간 작업 이동](#웹과-터미널-간-작업-이동): `--remote`와 `--teleport` 사용법
* [세션 작업](#세션-작업): 검토, 공유, 아카이브, 삭제
* [PR 자동 수정](#pr-자동-수정): CI 실패와 리뷰 코멘트에 자동 대응
* [보안 및 격리](#보안-및-격리): 세션 격리 방식
* [제한 사항](#제한-사항): 사용량 제한과 플랫폼 제약

## GitHub 인증 옵션

클라우드 세션에서 코드를 클론하고 브랜치를 푸시하려면 GitHub 저장소에 대한 접근이 필요합니다. 두 가지 방법으로 접근 권한을 부여할 수 있습니다:

| 방법 | 작동 방식 | 적합한 대상 |
| :--- | :--- | :--- |
| **GitHub App** | [웹 온보딩](/web-quickstart) 중 특정 저장소에 Claude GitHub App을 설치합니다. 접근은 저장소별로 범위가 지정됩니다. | 저장소별 명시적 권한 부여를 원하는 팀 |
| **`/web-setup`** | 터미널에서 `/web-setup`을 실행하여 로컬 `gh` CLI 토큰을 Claude 계정에 동기화합니다. 접근 범위는 `gh` 토큰의 권한과 동일합니다. | 이미 `gh`를 사용하는 개인 개발자 |

어느 방법이든 사용 가능합니다. [`/schedule`](/web-scheduled-tasks)은 두 형태의 접근을 모두 확인하고, 둘 다 구성되지 않은 경우 `/web-setup` 실행을 안내합니다. `/web-setup` 안내는 [터미널에서 연결하기](/web-quickstart#connect-from-your-terminal)를 참조하세요.

GitHub App은 [자동 수정](#pr-자동-수정)에 필수입니다. 자동 수정은 App을 통해 PR 웹훅을 수신합니다. `/web-setup`으로 연결한 후 자동 수정이 필요하면, 해당 저장소에 App을 설치하세요.

Team과 Enterprise 관리자는 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)에서 Quick web setup 토글로 `/web-setup`을 비활성화할 수 있습니다.

::: info
[Zero Data Retention](/zero-data-retention)이 활성화된 조직은 `/web-setup`이나 기타 클라우드 세션 기능을 사용할 수 없습니다.
:::

## 클라우드 환경

각 세션은 저장소가 클론된 새로운 Anthropic 관리 VM에서 실행됩니다. 이 섹션에서는 세션 시작 시 사용 가능한 항목과 사용자 정의 방법을 다룹니다.

### 클라우드 세션에서 사용 가능한 항목

클라우드 세션은 저장소의 새로운 클론에서 시작됩니다. 저장소에 커밋된 모든 것은 사용 가능합니다. 로컬 머신에서만 설치하거나 구성한 것은 사용할 수 없습니다.

| | 클라우드 세션에서 사용 가능 | 이유 |
| :--- | :--- | :--- |
| 저장소의 `CLAUDE.md` | 예 | 클론의 일부 |
| 저장소의 `.claude/settings.json` hooks | 예 | 클론의 일부 |
| 저장소의 `.mcp.json` MCP 서버 | 예 | 클론의 일부 |
| 저장소의 `.claude/rules/` | 예 | 클론의 일부 |
| 저장소의 `.claude/skills/`, `.claude/agents/`, `.claude/commands/` | 예 | 클론의 일부 |
| `.claude/settings.json`에 선언된 플러그인 | 예 | 세션 시작 시 선언된 [마켓플레이스](/plugin-marketplaces)에서 설치됩니다. 마켓플레이스 소스에 접근하려면 네트워크 접근이 필요합니다 |
| 사용자 `~/.claude/CLAUDE.md` | 아니요 | 저장소가 아닌 로컬 머신에 존재 |
| 사용자 설정에서만 활성화된 플러그인 | 아니요 | 사용자 범위의 `enabledPlugins`는 `~/.claude/settings.json`에 있습니다. 대신 저장소의 `.claude/settings.json`에 선언하세요 |
| `claude mcp add`로 추가한 MCP 서버 | 아니요 | 로컬 사용자 설정에 기록됩니다. 대신 [`.mcp.json`](/mcp#project-scope)에 서버를 선언하세요 |
| 정적 API 토큰 및 자격 증명 | 아니요 | 전용 시크릿 저장소가 아직 없습니다. 아래 참조 |
| AWS SSO와 같은 대화형 인증 | 아니요 | 지원되지 않습니다. SSO는 클라우드 세션에서 실행할 수 없는 브라우저 기반 로그인이 필요합니다 |

클라우드 세션에서 구성을 사용하려면 저장소에 커밋하세요. 전용 시크릿 저장소는 아직 제공되지 않습니다. 환경 변수와 설정 스크립트 모두 환경 구성에 저장되며, 해당 환경을 편집할 수 있는 모든 사용자에게 표시됩니다. 클라우드 세션에서 시크릿이 필요한 경우, 이러한 가시성을 고려하여 환경 변수로 추가하세요.

### 설치된 도구

클라우드 세션에는 일반적인 언어 런타임, 빌드 도구, 데이터베이스가 사전 설치되어 있습니다. 아래 표는 카테고리별로 포함된 항목을 요약합니다.

| 카테고리 | 포함 항목 |
| :--- | :--- |
| **Python** | Python 3.x (pip, poetry, uv, black, mypy, pytest, ruff 포함) |
| **Node.js** | nvm을 통한 20, 21, 22 (npm, yarn, pnpm, bun¹, eslint, prettier, chromedriver 포함) |
| **Ruby** | 3.1, 3.2, 3.3 (gem, bundler, rbenv 포함) |
| **PHP** | 8.4 (Composer 포함) |
| **Java** | OpenJDK 21 (Maven, Gradle 포함) |
| **Go** | 최신 안정 버전 (모듈 지원) |
| **Rust** | rustc, cargo |
| **C/C++** | GCC, Clang, cmake, ninja, conan |
| **Docker** | docker, dockerd, docker compose |
| **데이터베이스** | PostgreSQL 16, Redis 7.0 |
| **유틸리티** | git, jq, yq, ripgrep, tmux, vim, nano |

¹ Bun은 설치되어 있지만 패키지 가져오기에 대한 [프록시 호환성 문제](#sessionstart-훅으로-의존성-설치)가 알려져 있습니다.

정확한 버전을 확인하려면 클라우드 세션에서 Claude에게 `check-tools`를 실행해 달라고 요청하세요. 이 명령은 클라우드 세션에서만 존재합니다.

### GitHub 이슈와 풀 리퀘스트 작업

클라우드 세션에는 별도의 설정 없이 Claude가 이슈를 읽고, 풀 리퀘스트를 나열하고, diff를 가져오고, 코멘트를 게시할 수 있는 내장 GitHub 도구가 포함되어 있습니다. 이러한 도구는 [GitHub 인증 옵션](#github-인증-옵션)에서 구성한 방법을 사용하여 [GitHub 프록시](#github-프록시)를 통해 인증되므로, 토큰이 컨테이너에 들어가지 않습니다.

`gh` CLI는 사전 설치되어 있지 않습니다. `gh release`나 `gh workflow run`처럼 내장 도구에서 다루지 않는 `gh` 명령이 필요한 경우, 직접 설치하고 인증하세요:

1. **설정 스크립트에서 gh 설치**: [설정 스크립트](#설정-스크립트)에 `apt update && apt install -y gh`를 추가합니다.

2. **토큰 제공**: [환경 설정](#환경-구성)에 GitHub 개인 접근 토큰이 포함된 `GH_TOKEN` 환경 변수를 추가합니다. `gh`는 자동으로 `GH_TOKEN`을 읽으므로 `gh auth login` 단계가 필요 없습니다.

### 테스트 실행, 서비스 시작, 패키지 추가

Claude는 작업의 일부로 테스트를 실행합니다. 프롬프트에서 요청하세요. 예: "fix the failing tests in `tests/`" 또는 "run pytest after each change." pytest, jest, cargo test와 같은 테스트 러너는 사전 설치되어 있으므로 바로 작동합니다.

PostgreSQL과 Redis는 사전 설치되어 있지만 기본적으로 실행되지 않습니다. [설정 스크립트](#설정-스크립트)에서 시작하거나 세션 중에 Claude에게 시작을 요청하세요:

```bash
service postgresql start
```

```bash
service redis-server start
```

Docker는 컨테이너화된 서비스 실행에 사용할 수 있습니다. 이미지 풀을 위한 네트워크 접근은 환경의 [접근 레벨](#접근-레벨)을 따릅니다.

사전 설치되지 않은 패키지를 추가하려면 [설정 스크립트](#설정-스크립트)를 사용하여 세션 시작 시 사용할 수 있도록 하세요. 세션 중에 Claude에게 패키지 설치를 요청할 수도 있지만, 이러한 설치는 세션 간에 유지되지 않습니다.

### 리소스 제한

클라우드 세션은 시간에 따라 변경될 수 있는 대략적인 리소스 상한으로 실행됩니다:

* 4 vCPU
* 16 GB RAM
* 30 GB 디스크

대규모 빌드 작업이나 메모리 집약적인 테스트와 같이 상당히 많은 메모리가 필요한 작업은 실패하거나 종료될 수 있습니다. 이러한 제한을 초과하는 워크로드의 경우, [Remote Control](/remote-control)을 사용하여 자체 하드웨어에서 Claude Code를 실행하세요.

### 환경 구성

환경은 [네트워크 접근](#네트워크-접근), 환경 변수, 세션 시작 전에 실행되는 [설정 스크립트](#설정-스크립트)를 제어합니다. 구성 없이 사용 가능한 항목은 [설치된 도구](#설치된-도구)를 참조하세요. 웹 인터페이스 또는 터미널에서 환경을 관리할 수 있습니다:

| 작업 | 방법 |
| :--- | :--- |
| 환경 추가 | 현재 환경을 선택하여 선택기를 열고, **Add environment**를 선택합니다. 대화 상자에는 이름, 네트워크 접근 레벨, 환경 변수, 설정 스크립트가 포함됩니다. |
| 환경 편집 | 환경 이름 오른쪽의 설정 아이콘을 선택합니다. |
| 환경 아카이브 | 편집을 위해 환경을 열고 **Archive**를 선택합니다. 아카이브된 환경은 선택기에서 숨겨지지만 기존 세션은 계속 실행됩니다. |
| `--remote` 기본값 설정 | 터미널에서 `/remote-env`를 실행합니다. 환경이 하나인 경우 이 명령은 현재 구성을 표시합니다. `/remote-env`는 기본값만 선택하며, 환경 추가, 편집, 아카이브는 웹 인터페이스에서 수행합니다. |

환경 변수는 `.env` 형식으로 한 줄에 하나의 `KEY=value` 쌍을 사용합니다. 따옴표로 값을 감싸지 마세요. 따옴표가 값의 일부로 저장됩니다.

```text
NODE_ENV=development
LOG_LEVEL=debug
DATABASE_URL=postgres://localhost:5432/myapp
```

## 설정 스크립트

설정 스크립트는 새 클라우드 세션이 시작될 때 Claude Code가 실행되기 전에 실행되는 Bash 스크립트입니다. 설정 스크립트를 사용하여 의존성을 설치하고, 도구를 구성하거나, 사전 설치되지 않은 세션에 필요한 항목을 가져옵니다.

스크립트는 Ubuntu 24.04에서 root로 실행되므로 `apt install`과 대부분의 언어 패키지 관리자가 작동합니다.

설정 스크립트를 추가하려면 환경 설정 대화 상자를 열고 **Setup script** 필드에 스크립트를 입력하세요.

이 예시는 사전 설치되지 않은 `gh` CLI를 설치합니다:

```bash
#!/bin/bash
apt update && apt install -y gh
```

설정 스크립트는 새 세션을 만들 때만 실행됩니다. 기존 세션을 재개할 때는 건너뜁니다.

스크립트가 0이 아닌 종료 코드로 종료되면 세션이 시작되지 않습니다. 간헐적인 설치 실패로 세션이 차단되지 않도록 중요하지 않은 명령에 `|| true`를 추가하세요.

::: info
패키지를 설치하는 설정 스크립트는 레지스트리에 접근하기 위한 네트워크 접근이 필요합니다. 기본 **Trusted** 네트워크 접근은 npm, PyPI, RubyGems, crates.io를 포함한 [일반 패키지 레지스트리](#기본-허용-도메인)에 대한 연결을 허용합니다. 환경이 **None** 네트워크 접근을 사용하는 경우 스크립트가 패키지를 설치하지 못합니다.
:::

### 설정 스크립트 vs. SessionStart 훅

설정 스크립트는 클라우드에는 필요하지만 노트북에는 이미 있는 항목(언어 런타임이나 CLI 도구 등)을 설치할 때 사용합니다. [SessionStart 훅](/hooks#sessionstart)은 `npm install`처럼 클라우드와 로컬 모두에서 실행해야 하는 프로젝트 설정에 사용합니다.

둘 다 세션 시작 시 실행되지만, 서로 다른 위치에 속합니다:

| | 설정 스크립트 | SessionStart 훅 |
| --- | --- | --- |
| 연결 대상 | 클라우드 환경 | 저장소 |
| 구성 위치 | 클라우드 환경 UI | 저장소의 `.claude/settings.json` |
| 실행 시점 | Claude Code 실행 전, 새 세션에서만 | Claude Code 실행 후, 재개된 세션 포함 모든 세션 |
| 범위 | 클라우드 환경 전용 | 로컬과 클라우드 모두 |

SessionStart 훅은 로컬에서 사용자 수준의 `~/.claude/settings.json`에도 정의할 수 있지만, 사용자 수준 설정은 클라우드 세션으로 이전되지 않습니다. 클라우드에서는 저장소에 커밋된 훅만 실행됩니다.

### SessionStart 훅으로 의존성 설치

클라우드 세션에서만 의존성을 설치하려면, 저장소의 `.claude/settings.json`에 SessionStart 훅을 추가하세요:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh"
          }
        ]
      }
    ]
  }
}
```

`scripts/install_pkgs.sh`에 스크립트를 만들고 `chmod +x`로 실행 가능하게 만드세요. 클라우드 세션에서는 `CLAUDE_CODE_REMOTE` 환경 변수가 `true`로 설정되므로, 로컬 실행을 건너뛰는 데 사용할 수 있습니다:

```bash
#!/bin/bash

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

npm install
pip install -r requirements.txt
exit 0
```

SessionStart 훅은 클라우드 세션에서 몇 가지 제한이 있습니다:

* **클라우드 전용 범위 지정 불가**: 훅은 로컬과 클라우드 세션 모두에서 실행됩니다. 로컬 실행을 건너뛰려면 위와 같이 `CLAUDE_CODE_REMOTE` 환경 변수를 확인하세요.
* **네트워크 접근 필요**: 설치 명령은 패키지 레지스트리에 접근해야 합니다. 환경이 **None** 네트워크 접근을 사용하면 이러한 훅이 실패합니다. **Trusted** 하의 [기본 허용 목록](#기본-허용-도메인)은 npm, PyPI, RubyGems, crates.io를 포함합니다.
* **프록시 호환성**: 모든 아웃바운드 트래픽은 [보안 프록시](#보안-프록시)를 통과합니다. 일부 패키지 관리자는 이 프록시와 올바르게 작동하지 않습니다. Bun이 알려진 예입니다.
* **시작 지연 추가**: 훅은 세션이 시작되거나 재개될 때마다 실행됩니다. 의존성이 이미 존재하는지 확인한 후 재설치하여 설치 스크립트를 빠르게 유지하세요.

후속 Bash 명령에 대한 환경 변수를 유지하려면 `$CLAUDE_ENV_FILE`에 있는 파일에 기록하세요. 자세한 내용은 [SessionStart 훅](/hooks#sessionstart)을 참조하세요.

사용자 정의 환경 이미지와 스냅샷은 아직 지원되지 않습니다.

## 네트워크 접근

네트워크 접근은 클라우드 환경에서의 아웃바운드 연결을 제어합니다. 각 환경은 하나의 접근 레벨을 지정하며, 사용자 정의 허용 도메인으로 확장할 수 있습니다. 기본값은 패키지 레지스트리와 기타 [허용된 도메인](#기본-허용-도메인)을 허용하는 **Trusted**입니다.

### 접근 레벨

환경을 만들거나 편집할 때 접근 레벨을 선택하세요:

| 레벨 | 아웃바운드 연결 |
| :--- | :--- |
| **None** | 아웃바운드 네트워크 접근 없음 |
| **Trusted** | [허용된 도메인](#기본-허용-도메인)만: 패키지 레지스트리, GitHub, 클라우드 SDK |
| **Full** | 모든 도메인 |
| **Custom** | 자체 허용 목록, 선택적으로 기본값 포함 |

GitHub 작업은 이 설정과 독립적인 [별도 프록시](#github-프록시)를 사용합니다.

### 특정 도메인 허용

Trusted 목록에 없는 도메인을 허용하려면 환경의 네트워크 접근 설정에서 **Custom**을 선택하세요. **Allowed domains** 필드가 나타납니다. 한 줄에 하나의 도메인을 입력하세요:

```text
api.example.com
*.internal.example.com
registry.example.com
```

와일드카드 하위 도메인 매칭에는 `*.`을 사용하세요. **Also include default list of common package managers**를 체크하면 사용자 정의 항목과 함께 [Trusted 도메인](#기본-허용-도메인)을 유지하고, 체크하지 않으면 나열한 항목만 허용합니다.

### GitHub 프록시

보안을 위해 모든 GitHub 작업은 모든 git 상호작용을 투명하게 처리하는 전용 프록시 서비스를 통과합니다. 샌드박스 내부에서 git 클라이언트는 사용자 정의 범위 자격 증명을 사용하여 인증합니다. 이 프록시는:

* GitHub 인증을 안전하게 관리합니다: git 클라이언트는 샌드박스 내부에서 범위가 지정된 자격 증명을 사용하며, 프록시가 이를 확인하고 실제 GitHub 인증 토큰으로 변환합니다
* 안전을 위해 git push 작업을 현재 작업 브랜치로 제한합니다
* 보안 경계를 유지하면서 클론, 페치, PR 작업을 가능하게 합니다

### 보안 프록시

환경은 보안 및 남용 방지 목적으로 HTTP/HTTPS 네트워크 프록시 뒤에서 실행됩니다. 모든 아웃바운드 인터넷 트래픽은 이 프록시를 통과하며, 다음을 제공합니다:

* 악의적인 요청에 대한 보호
* 속도 제한 및 남용 방지
* 향상된 보안을 위한 콘텐츠 필터링

### 기본 허용 도메인

**Trusted** 네트워크 접근을 사용할 때 다음 도메인이 기본적으로 허용됩니다. `*`로 표시된 도메인은 와일드카드 하위 도메인 매칭을 나타내므로, `*.gcr.io`는 `gcr.io`의 모든 하위 도메인을 허용합니다.

**Anthropic 서비스**

* api.anthropic.com
* statsig.anthropic.com
* docs.claude.com
* platform.claude.com
* code.claude.com
* claude.ai

**버전 관리**

* github.com
* www.github.com
* api.github.com
* npm.pkg.github.com
* raw.githubusercontent.com
* pkg-npm.githubusercontent.com
* objects.githubusercontent.com
* release-assets.githubusercontent.com
* codeload.github.com
* avatars.githubusercontent.com
* camo.githubusercontent.com
* gist.github.com
* gitlab.com
* www.gitlab.com
* registry.gitlab.com
* bitbucket.org
* www.bitbucket.org
* api.bitbucket.org

**컨테이너 레지스트리**

* registry-1.docker.io
* auth.docker.io
* index.docker.io
* hub.docker.com
* www.docker.com
* production.cloudflare.docker.com
* download.docker.com
* gcr.io
* \*.gcr.io
* ghcr.io
* mcr.microsoft.com
* \*.data.mcr.microsoft.com
* public.ecr.aws

**클라우드 플랫폼**

* cloud.google.com
* accounts.google.com
* gcloud.google.com
* \*.googleapis.com
* storage.googleapis.com
* compute.googleapis.com
* container.googleapis.com
* azure.com
* portal.azure.com
* microsoft.com
* www.microsoft.com
* \*.microsoftonline.com
* packages.microsoft.com
* dotnet.microsoft.com
* dot.net
* visualstudio.com
* dev.azure.com
* \*.amazonaws.com
* \*.api.aws
* oracle.com
* www.oracle.com
* java.com
* www.java.com
* java.net
* www.java.net
* download.oracle.com
* yum.oracle.com

**JavaScript 및 Node 패키지 관리자**

* registry.npmjs.org
* www.npmjs.com
* www.npmjs.org
* npmjs.com
* npmjs.org
* yarnpkg.com
* registry.yarnpkg.com

**Python 패키지 관리자**

* pypi.org
* www.pypi.org
* files.pythonhosted.org
* pythonhosted.org
* test.pypi.org
* pypi.python.org
* pypa.io
* www.pypa.io

**Ruby 패키지 관리자**

* rubygems.org
* www.rubygems.org
* api.rubygems.org
* index.rubygems.org
* ruby-lang.org
* www.ruby-lang.org
* rubyforge.org
* www.rubyforge.org
* rubyonrails.org
* www.rubyonrails.org
* rvm.io
* get.rvm.io

**Rust 패키지 관리자**

* crates.io
* www.crates.io
* index.crates.io
* static.crates.io
* rustup.rs
* static.rust-lang.org
* www.rust-lang.org

**Go 패키지 관리자**

* proxy.golang.org
* sum.golang.org
* index.golang.org
* golang.org
* www.golang.org
* goproxy.io
* pkg.go.dev

**JVM 패키지 관리자**

* maven.org
* repo.maven.org
* central.maven.org
* repo1.maven.org
* repo.maven.apache.org
* jcenter.bintray.com
* gradle.org
* www.gradle.org
* services.gradle.org
* plugins.gradle.org
* kotlinlang.org
* www.kotlinlang.org
* spring.io
* repo.spring.io

**기타 패키지 관리자**

* packagist.org (PHP Composer)
* www.packagist.org
* repo.packagist.org
* nuget.org (.NET NuGet)
* www.nuget.org
* api.nuget.org
* pub.dev (Dart/Flutter)
* api.pub.dev
* hex.pm (Elixir/Erlang)
* www.hex.pm
* cpan.org (Perl CPAN)
* www.cpan.org
* metacpan.org
* www.metacpan.org
* api.metacpan.org
* cocoapods.org (iOS/macOS)
* www.cocoapods.org
* cdn.cocoapods.org
* haskell.org
* www.haskell.org
* hackage.haskell.org
* swift.org
* www.swift.org

**Linux 배포판**

* archive.ubuntu.com
* security.ubuntu.com
* ubuntu.com
* www.ubuntu.com
* \*.ubuntu.com
* ppa.launchpad.net
* launchpad.net
* www.launchpad.net
* \*.nixos.org

**개발 도구 및 플랫폼**

* dl.k8s.io (Kubernetes)
* pkgs.k8s.io
* k8s.io
* www.k8s.io
* releases.hashicorp.com (HashiCorp)
* apt.releases.hashicorp.com
* rpm.releases.hashicorp.com
* archive.releases.hashicorp.com
* hashicorp.com
* www.hashicorp.com
* repo.anaconda.com (Anaconda/Conda)
* conda.anaconda.org
* anaconda.org
* www.anaconda.com
* anaconda.com
* continuum.io
* apache.org (Apache)
* www.apache.org
* archive.apache.org
* downloads.apache.org
* eclipse.org (Eclipse)
* www.eclipse.org
* download.eclipse.org
* nodejs.org (Node.js)
* www.nodejs.org
* developer.apple.com
* developer.android.com
* pkg.stainless.com
* binaries.prisma.sh

**클라우드 서비스 및 모니터링**

* statsig.com
* www.statsig.com
* api.statsig.com
* sentry.io
* \*.sentry.io
* downloads.sentry-cdn.com
* http-intake.logs.datadoghq.com
* \*.datadoghq.com
* \*.datadoghq.eu
* api.honeycomb.io

**콘텐츠 전달 및 미러**

* sourceforge.net
* \*.sourceforge.net
* packagecloud.io
* \*.packagecloud.io
* fonts.googleapis.com
* fonts.gstatic.com

**스키마 및 구성**

* json-schema.org
* www.json-schema.org
* json.schemastore.org
* www.schemastore.org

**Model Context Protocol**

* \*.modelcontextprotocol.io

## 웹과 터미널 간 작업 이동

이러한 워크플로우에는 동일한 claude.ai 계정으로 로그인한 [Claude Code CLI](/quickstart)가 필요합니다. 터미널에서 새 클라우드 세션을 시작하거나, 클라우드 세션을 터미널로 가져와 로컬에서 계속 작업할 수 있습니다. 클라우드 세션은 노트북을 닫아도 유지되며, Claude 모바일 앱을 포함한 어디서나 모니터링할 수 있습니다.

::: info
CLI에서 세션 핸드오프는 단방향입니다: `--teleport`로 클라우드 세션을 터미널로 가져올 수 있지만, 기존 터미널 세션을 웹으로 보낼 수는 없습니다. `--remote` 플래그는 현재 저장소에 대한 새 클라우드 세션을 만듭니다. [데스크톱 앱](/desktop#continue-in-another-surface)은 로컬 세션을 웹으로 보낼 수 있는 Continue in 메뉴를 제공합니다.
:::

### 터미널에서 웹으로

`--remote` 플래그를 사용하여 명령줄에서 클라우드 세션을 시작합니다:

```bash
claude --remote "Fix the authentication bug in src/auth/login.ts"
```

이렇게 하면 claude.ai에 새 클라우드 세션이 만들어집니다. 세션은 현재 디렉토리의 GitHub remote를 현재 브랜치에서 클론하므로, VM이 로컬 머신이 아닌 GitHub에서 클론하기 때문에 로컬 커밋이 있으면 먼저 푸시하세요. `--remote`는 한 번에 하나의 저장소에서 작동합니다. 작업은 클라우드에서 실행되며 로컬에서 계속 작업할 수 있습니다.

::: info
`--remote`는 클라우드 세션을 만듭니다. `--remote-control`은 관련이 없으며, 웹에서 모니터링할 수 있도록 로컬 CLI 세션을 노출합니다. [Remote Control](/remote-control)을 참조하세요.
:::

Claude Code CLI에서 `/tasks`를 사용하여 진행 상황을 확인하거나, claude.ai 또는 Claude 모바일 앱에서 세션을 열어 직접 상호작용할 수 있습니다. 거기서 다른 대화처럼 Claude에게 방향을 제시하거나, 피드백을 제공하거나, 질문에 답할 수 있습니다.

#### 클라우드 작업 팁

**로컬에서 계획, 원격으로 실행**: 복잡한 작업의 경우 Claude를 plan 모드로 시작하여 접근 방식을 협업한 후, 작업을 클라우드로 보내세요:

```bash
claude --permission-mode plan
```

plan 모드에서 Claude는 파일을 읽고, 탐색 명령을 실행하고, 소스 코드를 편집하지 않고 계획을 제안합니다. 만족스러우면 계획을 저장소에 저장하고, 커밋하고, 푸시하여 클라우드 VM이 클론할 수 있게 합니다. 그런 다음 자율 실행을 위한 클라우드 세션을 시작합니다:

```bash
claude --remote "Execute the migration plan in docs/migration-plan.md"
```

이 패턴은 전략에 대한 제어권을 유지하면서 Claude가 클라우드에서 자율적으로 실행하게 합니다.

**클라우드에서 ultraplan으로 계획**: 웹 세션에서 계획 자체를 초안하고 검토하려면 [ultraplan](/ultraplan)을 사용하세요. Claude가 웹에서 계획을 생성하는 동안 계속 작업하고, 브라우저에서 섹션에 코멘트를 달고 원격으로 실행하거나 계획을 터미널로 보낼 수 있습니다.

**병렬로 작업 실행**: 각 `--remote` 명령은 독립적으로 실행되는 자체 클라우드 세션을 만듭니다. 여러 작업을 시작하면 별도의 세션에서 동시에 실행됩니다:

```bash
claude --remote "Fix the flaky test in auth.spec.ts"
claude --remote "Update the API documentation"
claude --remote "Refactor the logger to use structured output"
```

Claude Code CLI에서 `/tasks`로 모든 세션을 모니터링하세요. 세션이 완료되면 웹 인터페이스에서 PR을 만들거나 세션을 터미널로 [텔레포트](#웹에서-터미널로)하여 계속 작업할 수 있습니다.

#### GitHub 없이 로컬 저장소 전송

GitHub에 연결되지 않은 저장소에서 `claude --remote`를 실행하면, Claude Code가 로컬 저장소를 번들로 묶어 클라우드 세션에 직접 업로드합니다. 번들에는 모든 브랜치의 전체 저장소 히스토리와 추적된 파일의 커밋되지 않은 변경 사항이 포함됩니다.

이 폴백은 GitHub 접근이 불가능할 때 자동으로 활성화됩니다. GitHub가 연결되어 있어도 강제하려면 `CCR_FORCE_BUNDLE=1`을 설정하세요:

```bash
CCR_FORCE_BUNDLE=1 claude --remote "Run the test suite and fix any failures"
```

번들된 저장소는 다음 제한을 충족해야 합니다:

* 디렉토리가 최소 하나의 커밋이 있는 git 저장소여야 합니다
* 번들된 저장소는 100 MB 미만이어야 합니다. 더 큰 저장소는 현재 브랜치만 번들링한 후, 작업 트리의 단일 스쿼시 스냅샷으로 폴백하며, 스냅샷이 여전히 너무 크면 실패합니다
* 추적되지 않은 파일은 포함되지 않습니다. 클라우드 세션에서 볼 파일에 `git add`를 실행하세요
* 번들에서 만든 세션은 [GitHub 인증](#github-인증-옵션)도 구성되어 있지 않으면 remote로 푸시할 수 없습니다

### 웹에서 터미널로

다음 중 하나를 사용하여 클라우드 세션을 터미널로 가져옵니다:

* **`--teleport` 사용**: 명령줄에서 `claude --teleport`를 실행하면 대화형 세션 선택기가 열리고, `claude --teleport <session-id>`로 특정 세션을 직접 재개합니다. 커밋되지 않은 변경 사항이 있으면 먼저 stash하라는 메시지가 표시됩니다.
* **`/teleport` 사용**: 기존 CLI 세션 내에서 `/teleport`(또는 `/tp`)를 실행하면 Claude Code를 재시작하지 않고 동일한 세션 선택기가 열립니다.
* **`/tasks`에서**: `/tasks`를 실행하여 백그라운드 세션을 확인한 후, `t`를 눌러 텔레포트합니다
* **웹 인터페이스에서**: **Open in CLI**를 선택하여 터미널에 붙여넣을 수 있는 명령을 복사합니다

세션을 텔레포트하면, Claude는 올바른 저장소에 있는지 확인하고, 클라우드 세션의 브랜치를 페치하여 체크아웃하고, 전체 대화 히스토리를 터미널에 로드합니다.

`--teleport`는 `--resume`과 다릅니다. `--resume`은 이 머신의 로컬 히스토리에서 대화를 다시 열며 클라우드 세션을 나열하지 않습니다. `--teleport`는 클라우드 세션과 그 브랜치를 가져옵니다.

#### 텔레포트 요구 사항

텔레포트는 세션을 재개하기 전에 다음 요구 사항을 확인합니다. 요구 사항이 충족되지 않으면 오류가 표시되거나 문제를 해결하라는 메시지가 나타납니다.

| 요구 사항 | 세부 사항 |
| --- | --- |
| 깨끗한 git 상태 | 작업 디렉토리에 커밋되지 않은 변경 사항이 없어야 합니다. 텔레포트는 필요시 변경 사항을 stash하라는 메시지를 표시합니다. |
| 올바른 저장소 | fork가 아닌 동일한 저장소의 체크아웃에서 `--teleport`를 실행해야 합니다. |
| 브랜치 사용 가능 | 클라우드 세션의 브랜치가 remote에 푸시되어 있어야 합니다. 텔레포트는 자동으로 페치하고 체크아웃합니다. |
| 동일 계정 | 클라우드 세션에서 사용한 것과 동일한 claude.ai 계정으로 인증되어 있어야 합니다. |

#### `--teleport`를 사용할 수 없는 경우

텔레포트는 claude.ai 구독 인증이 필요합니다. API 키, Bedrock, Vertex AI 또는 Microsoft Foundry로 인증된 경우, `/login`을 실행하여 claude.ai 계정으로 로그인하세요. claude.ai로 이미 로그인되어 있는데 `--teleport`를 사용할 수 없다면, 조직에서 클라우드 세션을 비활성화했을 수 있습니다.

## 세션 작업

세션은 claude.ai/code의 사이드바에 표시됩니다. 여기서 변경 사항을 검토하고, 팀원과 공유하고, 완료된 작업을 아카이브하거나, 세션을 영구 삭제할 수 있습니다.

### 컨텍스트 관리

클라우드 세션은 텍스트 출력을 생성하는 [내장 명령](/commands)을 지원합니다. `/model`이나 `/config`처럼 대화형 터미널 선택기를 여는 명령은 사용할 수 없습니다.

컨텍스트 관리에 대해 구체적으로:

| 명령 | 클라우드 세션에서 작동 | 참고 |
| :--- | :--- | :--- |
| `/compact` | 예 | 대화를 요약하여 컨텍스트를 확보합니다. `/compact keep the test output`처럼 선택적 포커스 지침을 받습니다 |
| `/context` | 예 | 현재 컨텍스트 윈도우에 있는 내용을 표시합니다 |
| `/clear` | 아니요 | 대신 사이드바에서 새 세션을 시작하세요 |

자동 압축은 CLI에서와 동일하게 컨텍스트 윈도우가 용량에 가까워지면 자동으로 실행됩니다. 더 일찍 트리거하려면 [환경 변수](#환경-구성)에서 [`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`](/env-vars)를 설정하세요. 예를 들어 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`은 기본 ~95% 대신 70% 용량에서 압축합니다. 압축 계산에 사용되는 유효 윈도우 크기를 변경하려면 [`CLAUDE_CODE_AUTO_COMPACT_WINDOW`](/env-vars)를 사용하세요.

[서브에이전트](/sub-agents)는 로컬과 동일하게 작동합니다. Claude는 Task 도구로 서브에이전트를 생성하여 연구나 병렬 작업을 별도의 컨텍스트 윈도우로 오프로드하여 메인 대화를 가볍게 유지할 수 있습니다. 저장소의 `.claude/agents/`에 정의된 서브에이전트는 자동으로 감지됩니다. [에이전트 팀](/agent-teams)은 기본적으로 비활성화되어 있지만 [환경 변수](#환경-구성)에 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`을 추가하여 활성화할 수 있습니다.

### 변경 사항 검토

각 세션은 `+42 -18`과 같이 추가 및 삭제된 줄 수가 표시된 diff 표시기를 보여줍니다. 이를 선택하면 diff 뷰가 열리고, 특정 줄에 인라인 코멘트를 남기고, 다음 메시지와 함께 Claude에게 보낼 수 있습니다. PR 생성을 포함한 전체 안내는 [검토 및 반복](/web-quickstart#review-and-iterate)을 참조하세요. Claude가 CI 실패와 리뷰 코멘트를 자동으로 모니터링하도록 하려면 [PR 자동 수정](#pr-자동-수정)을 참조하세요.

### 세션 공유

세션을 공유하려면 아래 계정 유형에 따라 가시성을 전환하세요. 그런 다음 세션 링크를 그대로 공유하세요. 수신자는 링크를 열 때 최신 상태를 볼 수 있지만, 실시간으로 업데이트되지는 않습니다.

#### Enterprise 또는 Team 계정에서 공유

Enterprise와 Team 계정의 두 가지 가시성 옵션은 **Private**과 **Team**입니다. Team 가시성은 claude.ai 조직의 다른 멤버에게 세션을 공개합니다. 수신자 계정에 연결된 GitHub 계정을 기반으로 저장소 접근 확인이 기본적으로 활성화됩니다. 접근 권한이 있는 모든 수신자에게 계정 표시 이름이 보입니다. [Slack의 Claude](/slack) 세션은 자동으로 Team 가시성으로 공유됩니다.

#### Max 또는 Pro 계정에서 공유

Max와 Pro 계정의 두 가지 가시성 옵션은 **Private**과 **Public**입니다. Public 가시성은 claude.ai에 로그인한 모든 사용자에게 세션을 공개합니다.

공유 전에 민감한 콘텐츠가 있는지 세션을 확인하세요. 세션에는 비공개 GitHub 저장소의 코드와 자격 증명이 포함될 수 있습니다. 저장소 접근 확인은 기본적으로 활성화되어 있지 않습니다.

수신자에게 저장소 접근을 요구하거나, 공유된 세션에서 이름을 숨기려면 Settings > Claude Code > Sharing settings로 이동하세요.

### 세션 아카이브

세션 목록을 정리하기 위해 세션을 아카이브할 수 있습니다. 아카이브된 세션은 기본 세션 목록에서 숨겨지지만 아카이브된 세션을 필터링하여 볼 수 있습니다.

세션을 아카이브하려면 사이드바에서 세션 위에 마우스를 올리고 아카이브 아이콘을 선택하세요.

### 세션 삭제

세션을 삭제하면 세션과 데이터가 영구적으로 제거됩니다. 이 작업은 취소할 수 없습니다. 두 가지 방법으로 세션을 삭제할 수 있습니다:

* **사이드바에서**: 아카이브된 세션을 필터링한 후, 삭제할 세션 위에 마우스를 올리고 삭제 아이콘을 선택합니다
* **세션 메뉴에서**: 세션을 열고, 세션 제목 옆의 드롭다운을 선택한 후, **Delete**를 선택합니다

세션 삭제 전에 확인 메시지가 표시됩니다.

## PR 자동 수정

Claude는 풀 리퀘스트를 감시하고 CI 실패와 리뷰 코멘트에 자동으로 대응할 수 있습니다. Claude는 PR의 GitHub 활동을 구독하며, 체크가 실패하거나 리뷰어가 코멘트를 남기면 Claude가 조사하고 명확한 경우 수정 사항을 푸시합니다.

::: info
자동 수정은 Claude GitHub App이 저장소에 설치되어 있어야 합니다. 아직 설치하지 않았다면 [GitHub App 페이지](https://github.com/apps/claude)에서 설치하거나 [설정](/web-quickstart#connect-github-and-create-an-environment) 중에 프롬프트가 나타날 때 설치하세요.
:::

PR이 어디서 만들어졌는지와 어떤 디바이스를 사용하는지에 따라 자동 수정을 활성화하는 몇 가지 방법이 있습니다:

* **웹에서 만든 PR**: CI 상태 바를 열고 **Auto-fix**를 선택합니다
* **터미널에서**: PR의 브랜치에서 [`/autofix-pr`](/commands)을 실행합니다. Claude Code가 `gh`로 열린 PR을 감지하고, 웹 세션을 생성하고, 한 단계로 자동 수정을 활성화합니다
* **모바일 앱에서**: Claude에게 PR을 자동 수정하라고 말합니다. 예: "watch this PR and fix any CI failures or review comments"
* **기존 PR**: 세션에 PR URL을 붙여넣고 Claude에게 자동 수정을 요청합니다

### Claude가 PR 활동에 대응하는 방식

자동 수정이 활성화되면, Claude는 새로운 리뷰 코멘트와 CI 체크 실패를 포함한 PR의 GitHub 이벤트를 수신합니다. 각 이벤트에 대해 Claude는 조사하고 진행 방법을 결정합니다:

* **명확한 수정**: Claude가 수정에 확신이 있고 이전 지침과 충돌하지 않으면, 변경하고 푸시한 후 세션에서 수행한 작업을 설명합니다
* **모호한 요청**: 리뷰어의 코멘트가 여러 방식으로 해석될 수 있거나 아키텍처적으로 중요한 사항인 경우, Claude는 행동하기 전에 사용자에게 질문합니다
* **중복 또는 조치 불필요 이벤트**: 이벤트가 중복되거나 변경이 필요하지 않으면, Claude는 세션에 기록하고 다음으로 넘어갑니다

Claude는 리뷰 코멘트 스레드를 해결하는 과정에서 GitHub에 답글을 게시할 수 있습니다. 이러한 답글은 사용자의 GitHub 계정으로 게시되므로 사용자의 사용자명으로 표시되지만, 각 답글에는 리뷰어가 직접 작성한 것이 아니라 에이전트가 작성했음을 알 수 있도록 Claude Code에서 왔다는 레이블이 표시됩니다.

::: warning
저장소가 Atlantis, Terraform Cloud 또는 `issue_comment` 이벤트에서 실행되는 사용자 정의 GitHub Actions와 같은 코멘트 트리거 자동화를 사용하는 경우, Claude가 사용자를 대신하여 답글을 게시할 수 있으며 이러한 워크플로우를 트리거할 수 있다는 점에 유의하세요. 자동 수정을 활성화하기 전에 저장소의 자동화를 검토하고, PR 코멘트가 인프라를 배포하거나 권한이 있는 작업을 실행할 수 있는 저장소에서는 자동 수정을 비활성화하는 것을 고려하세요.
:::

## 보안 및 격리

각 클라우드 세션은 여러 계층을 통해 사용자의 머신과 다른 세션으로부터 분리됩니다:

* **격리된 가상 머신**: 각 세션은 격리된 Anthropic 관리 VM에서 실행됩니다
* **네트워크 접근 제어**: 네트워크 접근은 기본적으로 제한되며, 비활성화할 수 있습니다. 네트워크 접근이 비활성화된 상태에서도 Claude Code는 Anthropic API와 통신할 수 있으며, 이를 통해 데이터가 VM을 벗어날 수 있습니다.
* **자격 증명 보호**: git 자격 증명이나 서명 키와 같은 민감한 자격 증명은 Claude Code가 있는 샌드박스 내부에 존재하지 않습니다. 인증은 범위가 지정된 자격 증명을 사용하여 보안 프록시를 통해 처리됩니다.
* **안전한 분석**: 코드는 PR을 만들기 전에 격리된 VM 내에서 분석되고 수정됩니다

## 제한 사항

워크플로우에서 클라우드 세션에 의존하기 전에 다음 제약 사항을 고려하세요:

* **사용량 제한**: 웹에서의 Claude Code는 계정 내의 모든 Claude 및 Claude Code 사용과 사용량 제한을 공유합니다. 여러 작업을 병렬로 실행하면 그에 비례하여 더 많은 사용량을 소비합니다. 클라우드 VM에 대한 별도의 컴퓨팅 요금은 없습니다.
* **저장소 인증**: 동일한 계정으로 인증된 경우에만 웹에서 로컬로 세션을 이동할 수 있습니다
* **플랫폼 제한**: 저장소 클론과 풀 리퀘스트 생성에는 GitHub이 필요합니다. 자체 호스팅 [GitHub Enterprise Server](/github-enterprise-server) 인스턴스는 Team과 Enterprise 플랜에서 지원됩니다. GitLab, Bitbucket 및 기타 비 GitHub 저장소는 [로컬 번들](#github-없이-로컬-저장소-전송)로 클라우드 세션에 전송할 수 있지만, 세션에서 결과를 remote로 푸시할 수 없습니다

## 관련 리소스

* [웹에서 작업 예약](/web-scheduled-tasks): 일일 PR 리뷰와 의존성 감사 같은 반복 작업 자동화
* [Hooks 구성](/hooks): 세션 라이프사이클 이벤트에서 스크립트 실행
* [설정 참조](/settings): 모든 구성 옵션
* [보안](/security): 격리 보장과 데이터 처리
* [데이터 사용](/data-usage): Anthropic이 클라우드 세션에서 유지하는 데이터
