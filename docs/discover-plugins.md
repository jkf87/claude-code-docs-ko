---
title: 마켓플레이스에서 사전 빌드된 플러그인 검색 및 설치
description: 마켓플레이스에서 플러그인을 찾고 설치하여 Claude Code에 새로운 Skills, 에이전트, 기능을 확장하세요.
---

# 마켓플레이스에서 사전 빌드된 플러그인 검색 및 설치

Plugins는 Skills, 에이전트, Hooks, MCP 서버로 Claude Code를 확장합니다. 플러그인 마켓플레이스는 이러한 확장 기능을 직접 빌드하지 않고도 검색하고 설치할 수 있도록 도와주는 카탈로그입니다.

자체 마켓플레이스를 만들고 배포하려면 [플러그인 마켓플레이스 만들기 및 배포](/plugin-marketplaces)를 참조하세요.

## 마켓플레이스 작동 방식

마켓플레이스는 누군가가 만들어 공유한 플러그인 카탈로그입니다. 마켓플레이스를 사용하는 과정은 두 단계입니다:

**1단계: 마켓플레이스 추가**

카탈로그를 Claude Code에 등록하여 사용 가능한 항목을 탐색할 수 있습니다. 아직 플러그인은 설치되지 않습니다.

**2단계: 개별 플러그인 설치**

카탈로그를 탐색하고 원하는 플러그인을 설치합니다.

앱 스토어를 추가하는 것과 같습니다: 스토어를 추가하면 컬렉션을 탐색할 수 있지만, 어떤 앱을 다운로드할지는 여전히 개별적으로 선택합니다.

## 공식 Anthropic 마켓플레이스

공식 Anthropic 마켓플레이스(`claude-plugins-official`)는 Claude Code를 시작할 때 자동으로 사용 가능합니다. `/plugin`을 실행하고 **Discover** 탭으로 이동하여 사용 가능한 항목을 탐색하거나, [claude.com/plugins](https://claude.com/plugins)에서 카탈로그를 확인하세요.

공식 마켓플레이스에서 플러그인을 설치하려면 `/plugin install <name>@claude-plugins-official`을 사용하세요. 예를 들어, GitHub 통합을 설치하려면:

```shell
/plugin install github@claude-plugins-official
```

Claude Code가 플러그인을 찾을 수 없다고 보고하면, 마켓플레이스가 없거나 오래된 것입니다. `/plugin marketplace update claude-plugins-official`을 실행하여 새로고침하거나, 이전에 추가하지 않았다면 `/plugin marketplace add anthropics/claude-plugins-official`을 실행하세요. 그런 다음 설치를 재시도하세요.

::: info
공식 마켓플레이스는 Anthropic이 관리합니다. 공식 마켓플레이스에 플러그인을 제출하려면 앱 내 제출 양식을 사용하세요:

* **Claude.ai**: [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
* **Console**: [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

플러그인을 독립적으로 배포하려면 [자체 마켓플레이스를 만들고](/plugin-marketplaces) 사용자와 공유하세요.
:::

공식 마켓플레이스에는 여러 카테고리의 플러그인이 포함됩니다:

### 코드 인텔리전스

코드 인텔리전스 플러그인은 Claude Code의 내장 LSP 도구를 활성화하여 Claude가 정의로 이동하고, 참조를 찾고, 편집 직후 타입 오류를 즉시 확인할 수 있도록 합니다. 이 플러그인들은 VS Code의 코드 인텔리전스를 구동하는 것과 동일한 기술인 [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) 연결을 구성합니다.

이 플러그인들은 시스템에 언어 서버 바이너리가 설치되어 있어야 합니다. 이미 언어 서버가 설치되어 있다면, 프로젝트를 열 때 Claude가 해당 플러그인 설치를 안내할 수 있습니다.

| 언어       | 플러그인            | 필요한 바이너리              |
| :--------- | :------------------ | :--------------------------- |
| C/C++      | `clangd-lsp`        | `clangd`                     |
| C#         | `csharp-lsp`        | `csharp-ls`                  |
| Go         | `gopls-lsp`         | `gopls`                      |
| Java       | `jdtls-lsp`         | `jdtls`                      |
| Kotlin     | `kotlin-lsp`        | `kotlin-language-server`     |
| Lua        | `lua-lsp`           | `lua-language-server`        |
| PHP        | `php-lsp`           | `intelephense`               |
| Python     | `pyright-lsp`       | `pyright-langserver`         |
| Rust       | `rust-analyzer-lsp` | `rust-analyzer`              |
| Swift      | `swift-lsp`         | `sourcekit-lsp`              |
| TypeScript | `typescript-lsp`    | `typescript-language-server` |

다른 언어용 [자체 LSP 플러그인을 만들](/plugins-reference#lsp-servers) 수도 있습니다.

::: info
플러그인 설치 후 `/plugin` Errors 탭에서 `Executable not found in $PATH`가 표시되면 위 표에서 필요한 바이너리를 설치하세요.
:::

#### 코드 인텔리전스 플러그인으로 Claude가 얻는 것

코드 인텔리전스 플러그인이 설치되고 언어 서버 바이너리가 사용 가능하면, Claude는 두 가지 기능을 얻습니다:

* **자동 진단**: Claude가 파일을 편집할 때마다 언어 서버가 변경 사항을 분석하고 오류와 경고를 자동으로 보고합니다. Claude는 컴파일러나 린터를 실행하지 않고도 타입 오류, 누락된 import, 구문 문제를 확인합니다. Claude가 오류를 도입하면 같은 턴에서 문제를 인식하고 수정합니다. 플러그인 설치 외에 별도의 구성이 필요하지 않습니다. "diagnostics found" 표시가 나타나면 **Ctrl+O**를 눌러 진단을 인라인으로 확인할 수 있습니다.
* **코드 탐색**: Claude는 언어 서버를 사용하여 정의로 이동, 참조 찾기, 호버 시 타입 정보 얻기, 심볼 나열, 구현 찾기, 호출 계층 추적을 할 수 있습니다. 이러한 작업은 grep 기반 검색보다 더 정밀한 탐색을 제공하지만, 가용성은 언어와 환경에 따라 다를 수 있습니다.

문제가 발생하면 [코드 인텔리전스 문제 해결](#코드-인텔리전스-문제)을 참조하세요.

### 외부 통합

이 플러그인들은 수동 설정 없이 Claude를 외부 서비스에 연결할 수 있도록 사전 구성된 [MCP 서버](/mcp)를 번들합니다:

* **소스 제어**: `github`, `gitlab`
* **프로젝트 관리**: `atlassian` (Jira/Confluence), `asana`, `linear`, `notion`
* **디자인**: `figma`
* **인프라**: `vercel`, `firebase`, `supabase`
* **커뮤니케이션**: `slack`
* **모니터링**: `sentry`

### 개발 워크플로

일반적인 개발 작업을 위한 Skills와 에이전트를 추가하는 플러그인:

* **commit-commands**: 커밋, 푸시, PR 생성을 포함한 Git 커밋 워크플로
* **pr-review-toolkit**: 풀 리퀘스트 리뷰를 위한 전문 에이전트
* **agent-sdk-dev**: Claude Agent SDK로 빌드하기 위한 도구
* **plugin-dev**: 자체 플러그인을 만들기 위한 도구킷

### 출력 스타일

Claude의 응답 방식을 커스터마이즈합니다:

* **explanatory-output-style**: 구현 선택에 대한 교육적 인사이트
* **learning-output-style**: 기술 향상을 위한 대화형 학습 모드

## 체험하기: 데모 마켓플레이스 추가

Anthropic은 플러그인 시스템으로 무엇이 가능한지 보여주는 예제 플러그인이 포함된 [데모 플러그인 마켓플레이스](https://github.com/anthropics/claude-code/tree/main/plugins)(`claude-code-plugins`)도 관리합니다. 공식 마켓플레이스와 달리 이것은 수동으로 추가해야 합니다.

**1단계: 마켓플레이스 추가**

Claude Code 내에서 `anthropics/claude-code` 마켓플레이스에 대한 `plugin marketplace add` 명령을 실행합니다:

```shell
/plugin marketplace add anthropics/claude-code
```

마켓플레이스 카탈로그를 다운로드하고 플러그인을 사용할 수 있게 합니다.

**2단계: 사용 가능한 플러그인 탐색**

`/plugin`을 실행하여 플러그인 관리자를 엽니다. **Tab**(또는 뒤로 가려면 **Shift+Tab**)으로 순환할 수 있는 4개의 탭이 있는 인터페이스가 열립니다:

* **Discover**: 모든 마켓플레이스의 사용 가능한 플러그인 탐색
* **Installed**: 설치된 플러그인 보기 및 관리
* **Marketplaces**: 추가, 제거 또는 업데이트
* **Errors**: 플러그인 로딩 오류 보기

방금 추가한 마켓플레이스의 플러그인을 보려면 **Discover** 탭으로 이동하세요.

**3단계: 플러그인 설치**

플러그인을 선택하여 세부 정보를 본 다음, 설치 범위를 선택합니다:

* **User scope**: 모든 프로젝트에서 자신을 위해 설치
* **Project scope**: 이 저장소의 모든 협업자를 위해 설치
* **Local scope**: 이 저장소에서 자신만을 위해 설치

예를 들어, **commit-commands**(git 워크플로 Skills를 추가하는 플러그인)를 선택하고 user scope로 설치합니다.

명령줄에서 직접 설치할 수도 있습니다:

```shell
/plugin install commit-commands@anthropics-claude-code
```

범위에 대해 더 알아보려면 [구성 범위](/settings#configuration-scopes)를 참조하세요.

**4단계: 새 플러그인 사용**

설치 후 `/reload-plugins`를 실행하여 플러그인을 활성화합니다. 플러그인 Skills는 플러그인 이름으로 네임스페이스되므로, **commit-commands**는 `/commit-commands:commit`과 같은 Skills를 제공합니다.

파일을 변경하고 다음을 실행하여 사용해 보세요:

```shell
/commit-commands:commit
```

변경 사항을 스테이징하고, 커밋 메시지를 생성하고, 커밋을 만듭니다.

각 플러그인은 다르게 작동합니다. 플러그인이 제공하는 Skills와 기능에 대해 알아보려면 **Discover** 탭의 플러그인 설명이나 홈페이지를 확인하세요.

이 가이드의 나머지 부분에서는 마켓플레이스를 추가하고, 플러그인을 설치하고, 구성을 관리하는 모든 방법을 다룹니다.

## 마켓플레이스 추가

`/plugin marketplace add` 명령을 사용하여 다양한 소스에서 마켓플레이스를 추가합니다.

::: tip
**단축키**: `/plugin marketplace` 대신 `/plugin market`을, `remove` 대신 `rm`을 사용할 수 있습니다.
:::

* **GitHub 저장소**: `owner/repo` 형식 (예: `anthropics/claude-code`)
* **Git URL**: 모든 git 저장소 URL (GitLab, Bitbucket, 자체 호스팅)
* **로컬 경로**: 디렉토리 또는 `marketplace.json` 파일의 직접 경로
* **원격 URL**: 호스팅된 `marketplace.json` 파일의 직접 URL

### GitHub에서 추가

`.claude-plugin/marketplace.json` 파일이 포함된 GitHub 저장소를 `owner/repo` 형식으로 추가합니다. `owner`는 GitHub 사용자 이름 또는 조직이고 `repo`는 저장소 이름입니다.

예를 들어, `anthropics/claude-code`는 `anthropics`가 소유한 `claude-code` 저장소를 가리킵니다:

```shell
/plugin marketplace add anthropics/claude-code
```

### 다른 Git 호스트에서 추가

전체 URL을 제공하여 모든 git 저장소를 추가합니다. GitLab, Bitbucket, 자체 호스팅 서버를 포함한 모든 Git 호스트에서 작동합니다:

HTTPS 사용:

```shell
/plugin marketplace add https://gitlab.com/company/plugins.git
```

SSH 사용:

```shell
/plugin marketplace add git@gitlab.com:company/plugins.git
```

특정 브랜치나 태그를 추가하려면 `#` 다음에 ref를 추가합니다:

```shell
/plugin marketplace add https://gitlab.com/company/plugins.git#v1.0.0
```

### 로컬 경로에서 추가

`.claude-plugin/marketplace.json` 파일이 포함된 로컬 디렉토리를 추가합니다:

```shell
/plugin marketplace add ./my-marketplace
```

`marketplace.json` 파일의 직접 경로를 추가할 수도 있습니다:

```shell
/plugin marketplace add ./path/to/marketplace.json
```

### 원격 URL에서 추가

URL을 통해 원격 `marketplace.json` 파일을 추가합니다:

```shell
/plugin marketplace add https://example.com/marketplace.json
```

::: info
URL 기반 마켓플레이스는 Git 기반 마켓플레이스에 비해 몇 가지 제한이 있습니다. 플러그인 설치 시 "path not found" 오류가 발생하면 [문제 해결](/plugin-marketplaces#plugins-with-relative-paths-fail-in-url-based-marketplaces)을 참조하세요.
:::

## 플러그인 설치

마켓플레이스를 추가한 후 플러그인을 직접 설치할 수 있습니다(기본적으로 user scope로 설치):

```shell
/plugin install plugin-name@marketplace-name
```

다른 [설치 범위](/settings#configuration-scopes)를 선택하려면 대화형 UI를 사용합니다: `/plugin`을 실행하고 **Discover** 탭으로 이동한 다음 플러그인에서 **Enter**를 누르세요. 다음 옵션이 표시됩니다:

* **User scope** (기본값): 모든 프로젝트에서 자신을 위해 설치
* **Project scope**: 이 저장소의 모든 협업자를 위해 설치 (`.claude/settings.json`에 추가)
* **Local scope**: 이 저장소에서 자신만을 위해 설치 (협업자와 공유되지 않음)

**managed** scope를 가진 플러그인도 볼 수 있습니다. 이는 [관리 설정](/settings#settings-files)을 통해 관리자가 설치한 것으로 수정할 수 없습니다.

`/plugin`을 실행하고 **Installed** 탭으로 이동하면 범위별로 그룹화된 플러그인을 볼 수 있습니다.

::: warning
설치하기 전에 플러그인을 신뢰하는지 확인하세요. Anthropic은 플러그인에 포함된 MCP 서버, 파일 또는 기타 소프트웨어를 제어하지 않으며 의도대로 작동하는지 확인할 수 없습니다. 자세한 내용은 각 플러그인의 홈페이지를 확인하세요.
:::

## 설치된 플러그인 관리

`/plugin`을 실행하고 **Installed** 탭으로 이동하여 플러그인을 보고, 활성화, 비활성화 또는 제거합니다. 입력하여 플러그인 이름이나 설명으로 목록을 필터링합니다.

직접 명령으로도 플러그인을 관리할 수 있습니다.

제거하지 않고 플러그인 비활성화:

```shell
/plugin disable plugin-name@marketplace-name
```

비활성화된 플러그인 다시 활성화:

```shell
/plugin enable plugin-name@marketplace-name
```

플러그인 완전 제거:

```shell
/plugin uninstall plugin-name@marketplace-name
```

`--scope` 옵션으로 CLI 명령에서 특정 범위를 지정할 수 있습니다:

```shell
claude plugin install formatter@your-org --scope project
claude plugin uninstall formatter@your-org --scope project
```

### 재시작 없이 플러그인 변경 적용

세션 중 플러그인을 설치, 활성화 또는 비활성화할 때, `/reload-plugins`를 실행하여 재시작 없이 모든 변경 사항을 적용합니다:

```shell
/reload-plugins
```

Claude Code는 모든 활성 플러그인을 다시 로드하고 플러그인, Skills, 에이전트, Hooks, 플러그인 MCP 서버, 플러그인 LSP 서버의 수를 표시합니다.

## 마켓플레이스 관리

대화형 `/plugin` 인터페이스 또는 CLI 명령으로 마켓플레이스를 관리할 수 있습니다.

### 대화형 인터페이스 사용

`/plugin`을 실행하고 **Marketplaces** 탭으로 이동하여:

* 소스 및 상태와 함께 추가된 모든 마켓플레이스 보기
* 새 마켓플레이스 추가
* 최신 플러그인을 가져오도록 마켓플레이스 목록 업데이트
* 더 이상 필요하지 않은 마켓플레이스 제거

### CLI 명령 사용

직접 명령으로도 마켓플레이스를 관리할 수 있습니다.

구성된 모든 마켓플레이스 나열:

```shell
/plugin marketplace list
```

마켓플레이스에서 플러그인 목록 새로고침:

```shell
/plugin marketplace update marketplace-name
```

마켓플레이스 제거:

```shell
/plugin marketplace remove marketplace-name
```

::: warning
마켓플레이스를 제거하면 해당 마켓플레이스에서 설치한 모든 플러그인이 제거됩니다.
:::

### 자동 업데이트 구성

Claude Code는 시작 시 마켓플레이스와 설치된 플러그인을 자동으로 업데이트할 수 있습니다. 마켓플레이스에 대해 자동 업데이트가 활성화되면, Claude Code는 마켓플레이스 데이터를 새로고침하고 설치된 플러그인을 최신 버전으로 업데이트합니다. 플러그인이 업데이트되면 `/reload-plugins`를 실행하라는 알림이 표시됩니다.

UI를 통해 개별 마켓플레이스의 자동 업데이트를 토글합니다:

1. `/plugin`을 실행하여 플러그인 관리자 열기
2. **Marketplaces** 선택
3. 목록에서 마켓플레이스 선택
4. **Enable auto-update** 또는 **Disable auto-update** 선택

공식 Anthropic 마켓플레이스는 기본적으로 자동 업데이트가 활성화되어 있습니다. 서드파티 및 로컬 개발 마켓플레이스는 기본적으로 자동 업데이트가 비활성화되어 있습니다.

Claude Code와 모든 플러그인의 자동 업데이트를 완전히 비활성화하려면 `DISABLE_AUTOUPDATER` 환경 변수를 설정하세요. 자세한 내용은 [자동 업데이트](/setup#auto-updates)를 참조하세요.

Claude Code 자동 업데이트를 비활성화하면서 플러그인 자동 업데이트를 유지하려면 `DISABLE_AUTOUPDATER`와 함께 `FORCE_AUTOUPDATE_PLUGINS=1`을 설정하세요:

```bash
export DISABLE_AUTOUPDATER=1
export FORCE_AUTOUPDATE_PLUGINS=1
```

이는 Claude Code 업데이트를 수동으로 관리하면서도 자동 플러그인 업데이트를 계속 받고 싶을 때 유용합니다.

## 팀 마켓플레이스 구성

팀 관리자는 `.claude/settings.json`에 마켓플레이스 구성을 추가하여 프로젝트에 대한 자동 마켓플레이스 설치를 설정할 수 있습니다. 팀원이 저장소 폴더를 신뢰하면 Claude Code가 이 마켓플레이스와 플러그인 설치를 안내합니다.

프로젝트의 `.claude/settings.json`에 `extraKnownMarketplaces`를 추가합니다:

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```

`extraKnownMarketplaces`와 `enabledPlugins`을 포함한 전체 구성 옵션은 [플러그인 설정](/settings#plugin-settings)을 참조하세요.

## 보안

Plugins와 마켓플레이스는 사용자 권한으로 머신에서 임의의 코드를 실행할 수 있는 높은 신뢰 수준의 구성 요소입니다. 신뢰하는 소스의 플러그인만 설치하고 마켓플레이스만 추가하세요. 조직은 [관리 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions)을 사용하여 사용자가 추가할 수 있는 마켓플레이스를 제한할 수 있습니다.

## 문제 해결

### /plugin 명령이 인식되지 않음

"unknown command"가 표시되거나 `/plugin` 명령이 나타나지 않으면:

1. **버전 확인**: `claude --version`을 실행하여 설치된 버전을 확인합니다.
2. **Claude Code 업데이트**:
   * **Homebrew**: `brew upgrade claude-code` (또는 해당 cask를 설치한 경우 `brew upgrade claude-code@latest`)
   * **npm**: `npm update -g @anthropic-ai/claude-code`
   * **네이티브 설치**: [설치](/setup)의 설치 명령을 다시 실행
3. **Claude Code 재시작**: 업데이트 후 터미널을 재시작하고 `claude`를 다시 실행합니다.

### 일반적인 문제

* **마켓플레이스가 로드되지 않음**: URL이 접근 가능하고 해당 경로에 `.claude-plugin/marketplace.json`이 존재하는지 확인합니다
* **플러그인 설치 실패**: 플러그인 소스 URL이 접근 가능하고 저장소가 공개되어 있는지 (또는 접근 권한이 있는지) 확인합니다
* **설치 후 파일을 찾을 수 없음**: 플러그인은 캐시에 복사되므로 플러그인 디렉토리 외부의 파일을 참조하는 경로는 작동하지 않습니다
* **플러그인 Skills가 나타나지 않음**: `rm -rf ~/.claude/plugins/cache`로 캐시를 지우고, Claude Code를 재시작한 다음 플러그인을 다시 설치합니다.

자세한 문제 해결 및 솔루션은 마켓플레이스 가이드의 [문제 해결](/plugin-marketplaces#troubleshooting)을 참조하세요. 디버깅 도구는 [디버깅 및 개발 도구](/plugins-reference#debugging-and-development-tools)를 참조하세요.

### 코드 인텔리전스 문제

* **언어 서버가 시작되지 않음**: 바이너리가 설치되어 있고 `$PATH`에서 사용 가능한지 확인합니다. 자세한 내용은 `/plugin` Errors 탭을 확인하세요.
* **높은 메모리 사용량**: `rust-analyzer`와 `pyright` 같은 언어 서버는 대규모 프로젝트에서 상당한 메모리를 소비할 수 있습니다. 메모리 문제가 발생하면 `/plugin disable <plugin-name>`으로 플러그인을 비활성화하고 대신 Claude의 내장 검색 도구에 의존하세요.
* **모노레포에서의 거짓 양성 진단**: 워크스페이스가 올바르게 구성되지 않은 경우 언어 서버가 내부 패키지에 대해 해결되지 않은 import 오류를 보고할 수 있습니다. 이는 Claude의 코드 편집 능력에 영향을 미치지 않습니다.

## 다음 단계

* **자체 플러그인 빌드**: Skills, 에이전트, Hooks를 만들려면 [Plugins](/plugins)를 참조하세요
* **마켓플레이스 만들기**: 팀이나 커뮤니티에 플러그인을 배포하려면 [플러그인 마켓플레이스 만들기](/plugin-marketplaces)를 참조하세요
* **기술 참조**: 전체 사양은 [Plugins 참조](/plugins-reference)를 참조하세요
