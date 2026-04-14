---
title: Plugin marketplace 생성 및 배포
description: "팀과 커뮤니티에 Claude Code 확장 기능을 배포하기 위한 plugin marketplace를 빌드하고 호스팅합니다."
---

# Plugin marketplace 생성 및 배포

**Plugin marketplace**는 다른 사람들에게 plugin을 배포할 수 있는 카탈로그입니다. Marketplace는 중앙 집중식 검색, 버전 추적, 자동 업데이트, 그리고 다양한 소스 유형(git 저장소, 로컬 경로 등)을 지원합니다. 이 가이드는 팀이나 커뮤니티와 plugin을 공유하기 위해 자체 marketplace를 만드는 방법을 보여줍니다.

기존 marketplace에서 plugin을 설치하려는 경우 [사전 빌드된 plugin 검색 및 설치](/discover-plugins)를 참조하세요.

## 개요

Marketplace를 생성하고 배포하는 과정은 다음과 같습니다:

1. **Plugin 생성**: skills, agents, hooks, MCP 서버, 또는 LSP 서버가 포함된 하나 이상의 plugin을 빌드합니다. 이 가이드는 이미 배포할 plugin이 있다고 가정합니다. Plugin을 만드는 방법은 [Plugin 생성](/plugins)을 참조하세요.
2. **Marketplace 파일 생성**: Plugin과 해당 위치를 나열하는 `marketplace.json`을 정의합니다([Marketplace 파일 생성](#marketplace-파일-생성) 참조).
3. **Marketplace 호스팅**: GitHub, GitLab 또는 다른 git 호스트에 push합니다([Marketplace 호스팅 및 배포](#marketplace-호스팅-및-배포) 참조).
4. **사용자와 공유**: 사용자는 `/plugin marketplace add`로 marketplace를 추가하고 개별 plugin을 설치합니다([Plugin 검색 및 설치](/discover-plugins) 참조).

Marketplace가 활성화되면 저장소에 변경 사항을 push하여 업데이트할 수 있습니다. 사용자는 `/plugin marketplace update`로 로컬 복사본을 새로 고칩니다.

## 안내: 로컬 marketplace 생성

이 예제는 코드 리뷰를 위한 `/quality-review` skill 하나가 포함된 marketplace를 만듭니다. 디렉토리 구조를 생성하고, skill을 추가하고, plugin 매니페스트와 marketplace 카탈로그를 만든 다음, 설치하고 테스트합니다.

### 단계 1: 디렉토리 구조 생성

```bash
mkdir -p my-marketplace/.claude-plugin
mkdir -p my-marketplace/plugins/quality-review-plugin/.claude-plugin
mkdir -p my-marketplace/plugins/quality-review-plugin/skills/quality-review
```

### 단계 2: Skill 생성

`/quality-review` skill이 수행하는 작업을 정의하는 `SKILL.md` 파일을 만듭니다.

```markdown my-marketplace/plugins/quality-review-plugin/skills/quality-review/SKILL.md
---
description: Review code for bugs, security, and performance
disable-model-invocation: true
---

Review the code I've selected or the recent changes for:
- Potential bugs or edge cases
- Security concerns
- Performance issues
- Readability improvements

Be concise and actionable.
```

### 단계 3: Plugin 매니페스트 생성

Plugin을 설명하는 `plugin.json` 파일을 만듭니다. 매니페스트는 `.claude-plugin/` 디렉토리에 위치합니다.

```json my-marketplace/plugins/quality-review-plugin/.claude-plugin/plugin.json
{
  "name": "quality-review-plugin",
  "description": "Adds a /quality-review skill for quick code reviews",
  "version": "1.0.0"
}
```

### 단계 4: Marketplace 파일 생성

Plugin을 나열하는 marketplace 카탈로그를 만듭니다.

```json my-marketplace/.claude-plugin/marketplace.json
{
  "name": "my-plugins",
  "owner": {
    "name": "Your Name"
  },
  "plugins": [
    {
      "name": "quality-review-plugin",
      "source": "./plugins/quality-review-plugin",
      "description": "Adds a /quality-review skill for quick code reviews"
    }
  ]
}
```

### 단계 5: 추가 및 설치

Marketplace를 추가하고 plugin을 설치합니다.

```shell
/plugin marketplace add ./my-marketplace
/plugin install quality-review-plugin@my-plugins
```

### 단계 6: 사용해보기

에디터에서 일부 코드를 선택하고 새 skill을 실행합니다.

```shell
/quality-review
```

Plugin이 할 수 있는 작업(hooks, agents, MCP 서버, LSP 서버 포함)에 대해 자세히 알아보려면 [Plugins](/plugins)를 참조하세요.

::: info
**Plugin 설치 방식**: 사용자가 plugin을 설치하면, Claude Code는 plugin 디렉토리를 캐시 위치에 복사합니다. 이는 `../shared-utils`와 같은 경로를 사용하여 plugin 디렉토리 외부의 파일을 참조할 수 없음을 의미합니다. 해당 파일들은 복사되지 않기 때문입니다.

Plugin 간에 파일을 공유해야 하는 경우 심볼릭 링크를 사용하세요. 자세한 내용은 [Plugin 캐싱 및 파일 해석](/plugins-reference#plugin-caching-and-file-resolution)을 참조하세요.
:::

## Marketplace 파일 생성

저장소 루트에 `.claude-plugin/marketplace.json`을 만듭니다. 이 파일은 marketplace의 이름, 소유자 정보, 그리고 소스가 포함된 plugin 목록을 정의합니다.

각 plugin 항목에는 최소한 `name`과 `source`(가져올 위치)가 필요합니다. 사용 가능한 모든 필드는 아래의 [전체 스키마](#marketplace-스키마)를 참조하세요.

```json
{
  "name": "company-tools",
  "owner": {
    "name": "DevTools Team",
    "email": "devtools@example.com"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "Automatic code formatting on save",
      "version": "2.1.0",
      "author": {
        "name": "DevTools Team"
      }
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "Deployment automation tools"
    }
  ]
}
```

## Marketplace 스키마

### 필수 필드

| 필드      | 타입   | 설명                                                                                                                                              | 예시           |
| :-------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------------- |
| `name`    | string | Marketplace 식별자(kebab-case, 공백 없음). 공개용으로, 사용자가 plugin 설치 시 표시됩니다(예: `/plugin install my-tool@your-marketplace`). | `"acme-tools"` |
| `owner`   | object | Marketplace 관리자 정보([아래 필드 참조](#소유자-필드))                                                                                           |                |
| `plugins` | array  | 사용 가능한 plugin 목록                                                                                                                            | 아래 참조      |

::: info
**예약된 이름**: 다음 marketplace 이름은 Anthropic 공식 용도로 예약되어 있어 서드파티 marketplace에서 사용할 수 없습니다: `claude-code-marketplace`, `claude-code-plugins`, `claude-plugins-official`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `knowledge-work-plugins`, `life-sciences`. `official-claude-plugins` 또는 `anthropic-tools-v2`와 같이 공식 marketplace를 사칭하는 이름도 차단됩니다.
:::

### 소유자 필드

| 필드    | 타입   | 필수 여부 | 설명                          |
| :------ | :----- | :-------- | :---------------------------- |
| `name`  | string | 예        | 관리자 또는 팀의 이름          |
| `email` | string | 아니오    | 관리자의 연락처 이메일         |

### 선택적 메타데이터

| 필드                   | 타입   | 설명                                                                                                                                                    |
| :--------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metadata.description` | string | 간략한 marketplace 설명                                                                                                                                  |
| `metadata.version`     | string | Marketplace 버전                                                                                                                                         |
| `metadata.pluginRoot`  | string | 상대적 plugin 소스 경로에 추가되는 기본 디렉토리(예: `"./plugins"`를 사용하면 `"source": "./plugins/formatter"` 대신 `"source": "formatter"`로 작성 가능) |

## Plugin 항목

`plugins` 배열의 각 plugin 항목은 plugin과 해당 위치를 설명합니다. [Plugin 매니페스트 스키마](/plugins-reference#plugin-manifest-schema)의 모든 필드(예: `description`, `version`, `author`, `commands`, `hooks` 등)를 포함할 수 있으며, 다음 marketplace 전용 필드도 사용할 수 있습니다: `source`, `category`, `tags`, `strict`.

### 필수 필드

| 필드     | 타입           | 설명                                                                                                                       |
| :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `name`   | string         | Plugin 식별자(kebab-case, 공백 없음). 공개용으로, 사용자가 설치 시 표시됩니다(예: `/plugin install my-plugin@marketplace`). |
| `source` | string\|object | Plugin을 가져올 위치([Plugin 소스](#plugin-소스) 참조)                                                                      |

### 선택적 plugin 필드

**표준 메타데이터 필드:**

| 필드          | 타입    | 설명                                                          |
| :------------ | :------ | :------------------------------------------------------------ |
| `description` | string  | 간략한 plugin 설명                                             |
| `version`     | string  | Plugin 버전                                                    |
| `author`      | object  | Plugin 작성자 정보(`name` 필수, `email` 선택)                  |
| `homepage`    | string  | Plugin 홈페이지 또는 문서 URL                                  |
| `repository`  | string  | 소스 코드 저장소 URL                                           |
| `license`     | string  | SPDX 라이센스 식별자(예: MIT, Apache-2.0)                      |
| `keywords`    | array   | Plugin 검색 및 분류를 위한 태그                                |
| `category`    | string  | 정리를 위한 plugin 카테고리                                    |
| `tags`        | array   | 검색 가능성을 위한 태그                                        |
| `strict`      | boolean | `plugin.json`이 컴포넌트 정의의 권한인지 여부 제어(기본값: true). [Strict 모드](#strict-모드) 참조. |

**컴포넌트 구성 필드:**

| 필드         | 타입           | 설명                                                             |
| :----------- | :------------- | :--------------------------------------------------------------- |
| `skills`     | string\|array  | `<name>/SKILL.md`를 포함하는 skill 디렉토리의 사용자 정의 경로   |
| `commands`   | string\|array  | 플랫 `.md` skill 파일 또는 디렉토리의 사용자 정의 경로           |
| `agents`     | string\|array  | Agent 파일의 사용자 정의 경로                                     |
| `hooks`      | string\|object | 사용자 정의 hooks 구성 또는 hooks 파일 경로                       |
| `mcpServers` | string\|object | MCP 서버 구성 또는 MCP 설정 경로                                  |
| `lspServers` | string\|object | LSP 서버 구성 또는 LSP 설정 경로                                  |

## Plugin 소스

Plugin 소스는 Claude Code에게 marketplace에 나열된 각 개별 plugin을 가져올 위치를 알려줍니다. 이는 `marketplace.json`의 각 plugin 항목의 `source` 필드에 설정됩니다.

Plugin이 로컬 머신으로 클론되거나 복사되면, `~/.claude/plugins/cache`의 로컬 버전 관리 plugin 캐시에 복사됩니다.

| 소스          | 타입                            | 필드                               | 비고                                                                                                                                              |
| ------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상대 경로     | `string` (예: `"./my-plugin"`) | 없음                               | Marketplace 저장소 내의 로컬 디렉토리. `./`로 시작해야 합니다. `.claude-plugin/` 디렉토리가 아닌 marketplace 루트 기준으로 해석됩니다 |
| `github`      | object                          | `repo`, `ref?`, `sha?`             |                                                                                                                                                   |
| `url`         | object                          | `url`, `ref?`, `sha?`              | Git URL 소스                                                                                                                                       |
| `git-subdir`  | object                          | `url`, `path`, `ref?`, `sha?`      | Git 저장소의 하위 디렉토리. 모노레포의 대역폭 최소화를 위해 sparse 클론 사용                                                                       |
| `npm`         | object                          | `package`, `version?`, `registry?` | `npm install`을 통해 설치                                                                                                                          |

::: info
**Marketplace 소스 vs plugin 소스**: 이 두 개념은 서로 다른 것을 제어합니다.

* **Marketplace 소스** — `marketplace.json` 카탈로그 자체를 가져올 위치. 사용자가 `/plugin marketplace add`를 실행하거나 `extraKnownMarketplaces` 설정에서 설정됩니다. `ref`(브랜치/태그)를 지원하지만 `sha`는 지원하지 않습니다.
* **Plugin 소스** — marketplace에 나열된 개별 plugin을 가져올 위치. `marketplace.json`의 각 plugin 항목의 `source` 필드에 설정됩니다. `ref`(브랜치/태그)와 `sha`(정확한 커밋) 모두 지원합니다.

예를 들어, `acme-corp/plugin-catalog`에 호스팅된 marketplace(marketplace 소스)는 `acme-corp/code-formatter`에서 가져온 plugin(plugin 소스)을 나열할 수 있습니다. Marketplace 소스와 plugin 소스는 서로 다른 저장소를 가리키며 독립적으로 고정됩니다.
:::

### 상대 경로

같은 저장소에 있는 plugin의 경우 `./`로 시작하는 경로를 사용합니다:

```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin"
}
```

경로는 `.claude-plugin/`을 포함하는 디렉토리인 marketplace 루트를 기준으로 해석됩니다. 위 예에서 `./plugins/my-plugin`은 `marketplace.json`이 `<repo>/.claude-plugin/marketplace.json`에 있더라도 `<repo>/plugins/my-plugin`을 가리킵니다. `../`를 사용하여 marketplace 루트 외부의 경로를 참조하지 마세요.

::: info
상대 경로는 사용자가 Git(GitHub, GitLab 또는 git URL)을 통해 marketplace를 추가할 때만 작동합니다. 사용자가 `marketplace.json` 파일에 대한 직접 URL로 marketplace를 추가하면 상대 경로가 올바르게 해석되지 않습니다. URL 기반 배포의 경우 GitHub, npm 또는 git URL 소스를 사용하세요. 자세한 내용은 [문제 해결](#url-기반-marketplace에서-상대-경로-plugin-실패)을 참조하세요.
:::

### GitHub 저장소

```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo"
  }
}
```

특정 브랜치, 태그 또는 커밋에 고정할 수 있습니다:

```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| 필드   | 타입   | 설명                                                        |
| :----- | :----- | :---------------------------------------------------------- |
| `repo` | string | 필수. `owner/repo` 형식의 GitHub 저장소                      |
| `ref`  | string | 선택. Git 브랜치 또는 태그(기본값: 저장소 기본 브랜치)        |
| `sha`  | string | 선택. 정확한 버전에 고정하기 위한 40자 git 커밋 SHA           |

### Git 저장소

```json
{
  "name": "git-plugin",
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git"
  }
}
```

특정 브랜치, 태그 또는 커밋에 고정할 수 있습니다:

```json
{
  "name": "git-plugin",
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| 필드  | 타입   | 설명                                                                                                                                   |
| :---- | :----- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `url` | string | 필수. 전체 git 저장소 URL(`https://` 또는 `git@`). `.git` 접미사는 선택 사항으로, Azure DevOps와 AWS CodeCommit URL도 지원됩니다 |
| `ref` | string | 선택. Git 브랜치 또는 태그(기본값: 저장소 기본 브랜치)                                                                                  |
| `sha` | string | 선택. 정확한 버전에 고정하기 위한 40자 git 커밋 SHA                                                                                    |

### Git 하위 디렉토리

`git-subdir`을 사용하여 git 저장소의 하위 디렉토리에 있는 plugin을 가리킵니다. Claude Code는 sparse 부분 클론을 사용하여 해당 하위 디렉토리만 가져와 대형 모노레포의 대역폭을 최소화합니다.

```json
{
  "name": "my-plugin",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/acme-corp/monorepo.git",
    "path": "tools/claude-plugin"
  }
}
```

특정 브랜치, 태그 또는 커밋에 고정할 수 있습니다:

```json
{
  "name": "my-plugin",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/acme-corp/monorepo.git",
    "path": "tools/claude-plugin",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

`url` 필드는 GitHub 축약형(`owner/repo`) 또는 SSH URL(`git@github.com:owner/repo.git`)도 허용합니다.

| 필드   | 타입   | 설명                                                                                           |
| :----- | :----- | :--------------------------------------------------------------------------------------------- |
| `url`  | string | 필수. Git 저장소 URL, GitHub `owner/repo` 축약형, 또는 SSH URL                                  |
| `path` | string | 필수. plugin이 포함된 저장소 내 하위 디렉토리 경로(예: `"tools/claude-plugin"`)                 |
| `ref`  | string | 선택. Git 브랜치 또는 태그(기본값: 저장소 기본 브랜치)                                          |
| `sha`  | string | 선택. 정확한 버전에 고정하기 위한 40자 git 커밋 SHA                                            |

### npm 패키지

npm 패키지로 배포된 plugin은 `npm install`을 사용하여 설치됩니다. 공개 npm 레지스트리 또는 팀이 호스팅하는 프라이빗 레지스트리의 모든 패키지에서 작동합니다.

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin"
  }
}
```

특정 버전에 고정하려면 `version` 필드를 추가합니다:

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin",
    "version": "2.1.0"
  }
}
```

프라이빗 또는 내부 레지스트리에서 설치하려면 `registry` 필드를 추가합니다:

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin",
    "version": "^2.0.0",
    "registry": "https://npm.example.com"
  }
}
```

| 필드       | 타입   | 설명                                                                              |
| :--------- | :----- | :-------------------------------------------------------------------------------- |
| `package`  | string | 필수. 패키지 이름 또는 스코프 패키지(예: `@org/plugin`)                            |
| `version`  | string | 선택. 버전 또는 버전 범위(예: `2.1.0`, `^2.0.0`, `~1.5.0`)                        |
| `registry` | string | 선택. 사용자 정의 npm 레지스트리 URL. 기본값은 시스템 npm 레지스트리(일반적으로 npmjs.org) |

### 고급 plugin 항목

이 예제는 commands, agents, hooks, MCP 서버에 대한 사용자 정의 경로를 포함하여 다양한 선택적 필드를 사용하는 plugin 항목을 보여줍니다:

```json
{
  "name": "enterprise-tools",
  "source": {
    "source": "github",
    "repo": "company/enterprise-plugin"
  },
  "description": "Enterprise workflow automation tools",
  "version": "2.1.0",
  "author": {
    "name": "Enterprise Team",
    "email": "enterprise@example.com"
  },
  "homepage": "https://docs.example.com/plugins/enterprise-tools",
  "repository": "https://github.com/company/enterprise-plugin",
  "license": "MIT",
  "keywords": ["enterprise", "workflow", "automation"],
  "category": "productivity",
  "commands": [
    "./commands/core/",
    "./commands/enterprise/",
    "./commands/experimental/preview.md"
  ],
  "agents": ["./agents/security-reviewer.md", "./agents/compliance-checker.md"],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "enterprise-db": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  },
  "strict": false
}
```

주목할 사항:

* **`commands`와 `agents`**: 여러 디렉토리 또는 개별 파일을 지정할 수 있습니다. 경로는 plugin 루트를 기준으로 합니다.
* **`${CLAUDE_PLUGIN_ROOT}`**: hooks와 MCP 서버 구성에서 plugin의 설치 디렉토리 내 파일을 참조하는 데 이 변수를 사용합니다. Plugin 업데이트 후에도 유지되어야 하는 의존성이나 상태는 [`${CLAUDE_PLUGIN_DATA}`](/plugins-reference#persistent-data-directory)를 사용하세요.
* **`strict: false`**: false로 설정하면 plugin에 자체 `plugin.json`이 필요하지 않습니다. Marketplace 항목이 모든 것을 정의합니다. 아래 [Strict 모드](#strict-모드)를 참조하세요.

### Strict 모드

`strict` 필드는 `plugin.json`이 컴포넌트 정의(skills, agents, hooks, MCP 서버, output 스타일)의 권한인지 여부를 제어합니다.

| 값               | 동작                                                                                                                                                     |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `true` (기본값) | `plugin.json`이 권한. Marketplace 항목은 추가 컴포넌트로 보완할 수 있으며, 두 소스가 병합됩니다.                                                         |
| `false`          | Marketplace 항목이 전체 정의. Plugin에 컴포넌트를 선언하는 `plugin.json`도 있으면 충돌이 발생하여 plugin이 로드되지 않습니다. |

**각 모드를 사용하는 경우:**

* **`strict: true`**: plugin에 자체 `plugin.json`이 있고 자체 컴포넌트를 관리합니다. Marketplace 항목은 추가 skills나 hooks를 추가할 수 있습니다. 이것이 기본값이며 대부분의 plugin에 적합합니다.
* **`strict: false`**: Marketplace 운영자가 완전한 제어를 원할 때 사용합니다. Plugin 저장소는 원시 파일을 제공하고, marketplace 항목은 해당 파일 중 어떤 것이 skills, agents, hooks 등으로 노출될지 정의합니다. Marketplace가 plugin 작성자의 의도와 다르게 plugin의 컴포넌트를 재구성하거나 큐레이션할 때 유용합니다.

## Marketplace 호스팅 및 배포

### GitHub에 호스팅(권장)

GitHub는 가장 쉬운 배포 방법을 제공합니다:

1. **저장소 생성**: Marketplace를 위한 새 저장소를 설정합니다
2. **Marketplace 파일 추가**: Plugin 정의가 포함된 `.claude-plugin/marketplace.json`을 만듭니다
3. **팀과 공유**: 사용자는 `/plugin marketplace add owner/repo`로 marketplace를 추가합니다

**이점**: 내장된 버전 관리, 이슈 추적, 팀 협업 기능을 제공합니다.

### 다른 git 서비스에 호스팅

GitLab, Bitbucket, 자체 호스팅 서버 등 모든 git 호스팅 서비스를 사용할 수 있습니다. 사용자는 전체 저장소 URL로 추가합니다:

```shell
/plugin marketplace add https://gitlab.com/company/plugins.git
```

### 프라이빗 저장소

Claude Code는 프라이빗 저장소에서 plugin 설치를 지원합니다. 수동 설치 및 업데이트의 경우, Claude Code는 기존 git 자격 증명 도우미를 사용합니다. 터미널에서 프라이빗 저장소에 대해 `git clone`이 작동한다면 Claude Code에서도 작동합니다. 일반적인 자격 증명 도우미에는 GitHub용 `gh auth login`, macOS Keychain, `git-credential-store`가 있습니다.

백그라운드 자동 업데이트는 시작 시 자격 증명 도우미 없이 실행됩니다. 대화형 프롬프트가 Claude Code 시작을 차단하기 때문입니다. 프라이빗 marketplace의 자동 업데이트를 활성화하려면 환경에서 적절한 인증 토큰을 설정하세요:

| 제공자    | 환경 변수                    | 비고                                    |
| :-------- | :--------------------------- | :-------------------------------------- |
| GitHub    | `GITHUB_TOKEN` 또는 `GH_TOKEN` | 개인 액세스 토큰 또는 GitHub App 토큰    |
| GitLab    | `GITLAB_TOKEN` 또는 `GL_TOKEN` | 개인 액세스 토큰 또는 프로젝트 토큰      |
| Bitbucket | `BITBUCKET_TOKEN`            | 앱 비밀번호 또는 저장소 액세스 토큰      |

쉘 구성 파일(예: `.bashrc`, `.zshrc`)에서 토큰을 설정하거나 Claude Code를 실행할 때 전달합니다:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

::: info
CI/CD 환경의 경우 토큰을 시크릿 환경 변수로 구성하세요. GitHub Actions는 같은 조직의 저장소에 대해 자동으로 `GITHUB_TOKEN`을 제공합니다.
:::

### 배포 전 로컬 테스트

공유하기 전에 marketplace를 로컬에서 테스트하세요:

```shell
/plugin marketplace add ./my-local-marketplace
/plugin install test-plugin@my-local-marketplace
```

추가 명령(GitHub, Git URL, 로컬 경로, 원격 URL)의 전체 범위는 [Marketplace 추가](/discover-plugins#add-marketplaces)를 참조하세요.

### 팀에 marketplace 필수화

저장소를 구성하여 사용자가 프로젝트 폴더를 신뢰할 때 자동으로 marketplace 설치를 안내받도록 할 수 있습니다. `.claude/settings.json`에 marketplace를 추가하세요:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```

기본적으로 활성화되어야 하는 plugin을 지정할 수도 있습니다:

```json
{
  "enabledPlugins": {
    "code-formatter@company-tools": true,
    "deployment-tools@company-tools": true
  }
}
```

전체 구성 옵션은 [Plugin 설정](/settings#plugin-settings)을 참조하세요.

::: info
상대 경로를 사용하는 로컬 `directory` 또는 `file` 소스를 사용하는 경우, 경로는 저장소의 메인 체크아웃을 기준으로 해석됩니다. git worktree에서 Claude Code를 실행할 때도 경로는 메인 체크아웃을 가리키므로, 모든 worktree가 같은 marketplace 위치를 공유합니다. Marketplace 상태는 프로젝트별이 아닌 `~/.claude/plugins/known_marketplaces.json`에 사용자별로 한 번 저장됩니다.
:::

### 컨테이너용 plugin 사전 배포

컨테이너 이미지와 CI 환경의 경우, Claude Code가 런타임에 아무것도 클론하지 않고 marketplace와 plugin을 이미 사용 가능하게 빌드 시간에 plugins 디렉토리를 미리 채울 수 있습니다. `CLAUDE_CODE_PLUGIN_SEED_DIR` 환경 변수를 이 디렉토리를 가리키도록 설정하세요.

여러 시드 디렉토리를 레이어링하려면 Unix에서는 `:`로, Windows에서는 `;`로 경로를 구분합니다. Claude Code는 각 디렉토리를 순서대로 검색하며, 특정 marketplace 또는 plugin 캐시를 포함하는 첫 번째 시드가 우선합니다.

시드 디렉토리는 `~/.claude/plugins`의 구조를 미러링합니다:

```
$CLAUDE_CODE_PLUGIN_SEED_DIR/
  known_marketplaces.json
  marketplaces/<name>/...
  cache/<marketplace>/<plugin>/<version>/...
```

시드 디렉토리를 빌드하려면 이미지 빌드 중에 Claude Code를 한 번 실행하고, 필요한 plugin을 설치한 다음, 결과 `~/.claude/plugins` 디렉토리를 이미지에 복사하고 `CLAUDE_CODE_PLUGIN_SEED_DIR`이 이를 가리키도록 설정합니다.

복사 단계를 건너뛰려면, 빌드 중에 `CLAUDE_CODE_PLUGIN_CACHE_DIR`을 대상 시드 경로로 설정하여 plugin이 직접 그곳에 설치되도록 합니다:

```bash
CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed claude plugin marketplace add your-org/plugins
CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed claude plugin install my-tool@your-plugins
```

그런 다음 컨테이너의 런타임 환경에서 `CLAUDE_CODE_PLUGIN_SEED_DIR=/opt/claude-seed`를 설정하여 Claude Code가 시작 시 시드에서 읽도록 합니다.

시작 시 Claude Code는 시드의 `known_marketplaces.json`에 있는 marketplace를 기본 구성에 등록하고, `cache/` 아래에 있는 plugin 캐시를 재클론 없이 그대로 사용합니다. 이는 인터랙티브 모드와 `-p` 플래그를 사용하는 비인터랙티브 모드 모두에서 작동합니다.

동작 세부 사항:

* **읽기 전용**: 시드 디렉토리에는 절대 쓰기가 발생하지 않습니다. 읽기 전용 파일시스템에서 git pull이 실패하므로 시드 marketplace의 자동 업데이트는 비활성화됩니다.
* **시드 항목 우선**: 시드에 선언된 marketplace는 각 시작 시 사용자 구성의 일치하는 항목을 덮어씁니다. 시드 plugin을 사용 중지하려면 marketplace를 제거하는 대신 `/plugin disable`을 사용하세요.
* **경로 해석**: Claude Code는 시드의 JSON 내에 저장된 경로를 신뢰하지 않고, 런타임에 `$CLAUDE_CODE_PLUGIN_SEED_DIR/marketplaces/<name>/`을 탐색하여 marketplace 콘텐츠를 찾습니다. 이는 빌드된 경로와 다른 경로에 마운트되더라도 시드가 올바르게 작동함을 의미합니다.
* **변경 차단**: 시드 관리 marketplace에 대해 `/plugin marketplace remove` 또는 `/plugin marketplace update`를 실행하면 시드 이미지 업데이트를 관리자에게 요청하라는 안내와 함께 실패합니다.
* **설정과 조합**: `extraKnownMarketplaces` 또는 `enabledPlugins`이 시드에 이미 존재하는 marketplace를 선언하면, Claude Code는 클론하는 대신 시드 복사본을 사용합니다.

### 관리형 marketplace 제한

Plugin 소스에 대한 엄격한 제어가 필요한 조직의 경우, 관리자는 관리 설정의 [`strictKnownMarketplaces`](/settings#strictknownmarketplaces) 설정을 사용하여 사용자가 추가할 수 있는 plugin marketplace를 제한할 수 있습니다.

관리 설정에 `strictKnownMarketplaces`가 구성되면, 값에 따라 제한 동작이 달라집니다:

| 값                 | 동작                                                  |
| ------------------- | ----------------------------------------------------- |
| 미정의(기본값)      | 제한 없음. 사용자가 모든 marketplace를 추가할 수 있음  |
| 빈 배열 `[]`        | 완전 잠금. 사용자가 새 marketplace를 추가할 수 없음    |
| 소스 목록           | 사용자는 허용 목록과 정확히 일치하는 marketplace만 추가 가능 |

#### 일반적인 구성

모든 marketplace 추가 비활성화:

```json
{
  "strictKnownMarketplaces": []
}
```

특정 marketplace만 허용:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme-corp/approved-plugins"
    },
    {
      "source": "github",
      "repo": "acme-corp/security-tools",
      "ref": "v2.0"
    },
    {
      "source": "url",
      "url": "https://plugins.example.com/marketplace.json"
    }
  ]
}
```

호스트에 대한 regex 패턴 매칭을 사용하여 내부 git 서버의 모든 marketplace를 허용합니다. 이는 [GitHub Enterprise Server](/github-enterprise-server#plugin-marketplaces-on-ghes) 또는 자체 호스팅 GitLab 인스턴스에 권장되는 방법입니다:

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

경로에 대한 regex 패턴 매칭을 사용하여 특정 디렉토리의 파일시스템 기반 marketplace를 허용합니다:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "pathPattern",
      "pathPattern": "^/opt/approved/"
    }
  ]
}
```

`".*"`를 `pathPattern`으로 사용하면 `hostPattern`으로 네트워크 소스를 제어하면서 모든 파일시스템 경로를 허용할 수 있습니다.

::: info
`strictKnownMarketplaces`는 사용자가 추가할 수 있는 것을 제한하지만, 그 자체로 marketplace를 등록하지는 않습니다. 사용자가 `/plugin marketplace add`를 실행하지 않고도 허용된 marketplace를 자동으로 사용할 수 있게 하려면, 같은 `managed-settings.json`에서 [`extraKnownMarketplaces`](/settings#extraknownmarketplaces)와 함께 사용하세요. [함께 사용하기](/settings#strictknownmarketplaces)를 참조하세요.
:::

#### 제한 작동 방식

제한은 네트워크 요청이나 파일시스템 작업이 발생하기 전, plugin 설치 프로세스 초기에 검증됩니다. 이는 승인되지 않은 marketplace 액세스 시도를 방지합니다.

허용 목록은 대부분의 소스 유형에 대해 정확한 매칭을 사용합니다. Marketplace가 허용되려면 지정된 모든 필드가 정확히 일치해야 합니다:

* GitHub 소스의 경우: `repo`가 필수이며, 허용 목록에 지정된 경우 `ref` 또는 `path`도 일치해야 합니다
* URL 소스의 경우: 전체 URL이 정확히 일치해야 합니다
* `hostPattern` 소스의 경우: marketplace 호스트가 regex 패턴과 매칭됩니다
* `pathPattern` 소스의 경우: marketplace의 파일시스템 경로가 regex 패턴과 매칭됩니다

`strictKnownMarketplaces`는 [관리 설정](/settings#settings-files)에서 설정되므로, 개별 사용자와 프로젝트 구성이 이 제한을 재정의할 수 없습니다.

지원되는 모든 소스 유형 및 `extraKnownMarketplaces`와의 비교를 포함한 전체 구성 세부 정보는 [strictKnownMarketplaces 참조](/settings#strictknownmarketplaces)를 참조하세요.

### 버전 해석 및 릴리스 채널

Plugin 버전은 캐시 경로와 업데이트 감지를 결정합니다. Plugin 매니페스트(`plugin.json`) 또는 marketplace 항목(`marketplace.json`)에서 버전을 지정할 수 있습니다.

::: warning
가능하면 두 곳에 모두 버전을 설정하지 마세요. Plugin 매니페스트가 항상 자동으로 우선하므로, marketplace 버전이 무시될 수 있습니다. 상대 경로 plugin의 경우 marketplace 항목에 버전을 설정하세요. 다른 모든 plugin 소스의 경우 plugin 매니페스트에 설정하세요.
:::

#### 릴리스 채널 설정

Plugin에 "stable"과 "latest" 릴리스 채널을 지원하려면, 같은 저장소의 다른 ref 또는 SHA를 가리키는 두 개의 marketplace를 설정할 수 있습니다. 그런 다음 [관리 설정](/settings#settings-files)을 통해 두 marketplace를 다른 사용자 그룹에 할당할 수 있습니다.

::: warning
Plugin의 `plugin.json`은 각 고정된 ref 또는 커밋에서 다른 `version`을 선언해야 합니다. 두 ref 또는 커밋이 같은 매니페스트 버전을 가지면, Claude Code는 이를 동일한 것으로 처리하고 업데이트를 건너뜁니다.
:::

##### 예시

```json
{
  "name": "stable-tools",
  "plugins": [
    {
      "name": "code-formatter",
      "source": {
        "source": "github",
        "repo": "acme-corp/code-formatter",
        "ref": "stable"
      }
    }
  ]
}
```

```json
{
  "name": "latest-tools",
  "plugins": [
    {
      "name": "code-formatter",
      "source": {
        "source": "github",
        "repo": "acme-corp/code-formatter",
        "ref": "latest"
      }
    }
  ]
}
```

##### 사용자 그룹에 채널 할당

관리 설정을 통해 각 marketplace를 적절한 사용자 그룹에 할당합니다. 예를 들어, stable 그룹은 다음을 받습니다:

```json
{
  "extraKnownMarketplaces": {
    "stable-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/stable-tools"
      }
    }
  }
}
```

얼리 액세스 그룹은 대신 `latest-tools`를 받습니다:

```json
{
  "extraKnownMarketplaces": {
    "latest-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/latest-tools"
      }
    }
  }
}
```

## 검증 및 테스트

공유하기 전에 marketplace를 테스트하세요.

Marketplace JSON 구문 검증:

```bash
claude plugin validate .
```

또는 Claude Code 내에서:

```shell
/plugin validate .
```

테스트를 위해 marketplace 추가:

```shell
/plugin marketplace add ./path/to/marketplace
```

모든 것이 작동하는지 확인하기 위해 테스트 plugin 설치:

```shell
/plugin install test-plugin@marketplace-name
```

전체 plugin 테스트 워크플로우는 [Plugin 로컬 테스트](/plugins#test-your-plugins-locally)를 참조하세요. 기술적인 문제 해결은 [Plugin 참조](/plugins-reference)를 참조하세요.

## CLI에서 Marketplace 관리

Claude Code는 스크립팅 및 자동화를 위한 비인터랙티브 `claude plugin marketplace` 서브커맨드를 제공합니다. 이는 인터랙티브 세션 내에서 사용 가능한 `/plugin marketplace` 명령과 동일합니다.

### Plugin marketplace add

GitHub 저장소, git URL, 원격 URL 또는 로컬 경로에서 marketplace를 추가합니다.

```bash
claude plugin marketplace add <source> [options]
```

**인수:**

* `<source>`: GitHub `owner/repo` 축약형, git URL, `marketplace.json` 파일에 대한 원격 URL, 또는 로컬 디렉토리 경로. 브랜치나 태그에 고정하려면 GitHub 축약형에 `@ref`를 추가하거나 git URL에 `#ref`를 추가합니다

**옵션:**

| 옵션                  | 설명                                                                                                                                                 | 기본값  |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `--scope <scope>`     | Marketplace를 선언할 위치: `user`, `project`, 또는 `local`. [Plugin 설치 스코프](/plugins-reference#plugin-installation-scopes) 참조 | `user`  |
| `--sparse <paths...>` | git sparse-checkout을 통해 특정 디렉토리로 체크아웃 제한. 모노레포에 유용                                                                            |         |

`owner/repo` 축약형을 사용하여 GitHub에서 marketplace 추가:

```bash
claude plugin marketplace add acme-corp/claude-plugins
```

`@ref`로 특정 브랜치나 태그에 고정:

```bash
claude plugin marketplace add acme-corp/claude-plugins@v2.0
```

GitHub가 아닌 호스트의 git URL에서 추가:

```bash
claude plugin marketplace add https://gitlab.example.com/team/plugins.git
```

`marketplace.json` 파일을 직접 제공하는 원격 URL에서 추가:

```bash
claude plugin marketplace add https://example.com/marketplace.json
```

테스트를 위해 로컬 디렉토리에서 추가:

```bash
claude plugin marketplace add ./my-marketplace
```

`.claude/settings.json`을 통해 팀과 공유되도록 project 스코프에서 marketplace 선언:

```bash
claude plugin marketplace add acme-corp/claude-plugins --scope project
```

모노레포의 경우, plugin 콘텐츠가 포함된 디렉토리로 체크아웃 제한:

```bash
claude plugin marketplace add acme-corp/monorepo --sparse .claude-plugin plugins
```

### Plugin marketplace list

구성된 모든 marketplace를 나열합니다.

```bash
claude plugin marketplace list [options]
```

**옵션:**

| 옵션     | 설명          |
| :------- | :------------ |
| `--json` | JSON으로 출력 |

### Plugin marketplace remove

구성된 marketplace를 제거합니다. 별칭 `rm`도 허용됩니다.

```bash
claude plugin marketplace remove <name>
```

**인수:**

* `<name>`: `claude plugin marketplace list`에 표시된 대로 제거할 marketplace 이름. 이는 `add`에 전달한 소스가 아닌 `marketplace.json`의 `name`입니다

::: warning
Marketplace를 제거하면 해당 marketplace에서 설치한 plugin도 함께 제거됩니다. 설치된 plugin을 잃지 않고 marketplace를 새로 고치려면 `claude plugin marketplace update`를 사용하세요.
:::

### Plugin marketplace update

소스에서 marketplace를 새로 고쳐 새 plugin과 버전 변경 사항을 가져옵니다.

```bash
claude plugin marketplace update [name]
```

**인수:**

* `[name]`: `claude plugin marketplace list`에 표시된 대로 업데이트할 marketplace 이름. 생략하면 모든 marketplace를 업데이트합니다

`remove`와 `update` 모두 읽기 전용인 시드 관리 marketplace에 대해 실행하면 실패합니다. 모든 marketplace를 업데이트할 때 시드 관리 항목은 건너뛰고 다른 marketplace는 계속 업데이트됩니다. 시드 제공 plugin을 변경하려면 관리자에게 시드 이미지 업데이트를 요청하세요. [컨테이너용 plugin 사전 배포](#컨테이너용-plugin-사전-배포)를 참조하세요.

## 문제 해결

### Marketplace가 로드되지 않음

**증상**: Marketplace를 추가할 수 없거나 marketplace에서 plugin을 볼 수 없음

**해결 방법**:

* Marketplace URL에 액세스할 수 있는지 확인
* 지정된 경로에 `.claude-plugin/marketplace.json`이 존재하는지 확인
* `claude plugin validate` 또는 `/plugin validate`를 사용하여 JSON 구문이 유효하고 frontmatter가 올바른지 확인
* 프라이빗 저장소의 경우 액세스 권한이 있는지 확인

### Marketplace 검증 오류

문제를 확인하려면 marketplace 디렉토리에서 `claude plugin validate .` 또는 `/plugin validate .`를 실행하세요. 검증기는 `plugin.json`, skill/agent/command frontmatter, `hooks/hooks.json`의 구문 및 스키마 오류를 확인합니다. 일반적인 오류:

| 오류                                                  | 원인                                            | 해결 방법                                                                                    |
| :---------------------------------------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `File not found: .claude-plugin/marketplace.json`    | 매니페스트 없음                                  | 필수 필드가 포함된 `.claude-plugin/marketplace.json` 생성                                     |
| `Invalid JSON syntax: Unexpected token...`            | marketplace.json의 JSON 구문 오류               | 누락된 쉼표, 추가 쉼표, 또는 인용되지 않은 문자열 확인                                         |
| `Duplicate plugin name "x" found in marketplace`     | 두 plugin이 같은 이름을 공유함                   | 각 plugin에 고유한 `name` 값 부여                                                             |
| `plugins[0].source: Path contains ".."`               | 소스 경로에 `..`가 포함됨                        | `..` 없이 marketplace 루트에 상대적인 경로 사용. [상대 경로](#상대-경로) 참조                  |
| `YAML frontmatter failed to parse: ...`               | skill, agent, 또는 command 파일의 잘못된 YAML   | frontmatter 블록의 YAML 구문 수정. 런타임에 이 파일은 메타데이터 없이 로드됩니다.              |
| `Invalid JSON syntax: ...` (hooks.json)               | 잘못된 형식의 `hooks/hooks.json`                | JSON 구문 수정. 잘못된 형식의 `hooks/hooks.json`은 전체 plugin이 로드되지 않게 합니다.         |

**경고** (비차단):

* `Marketplace has no plugins defined`: `plugins` 배열에 최소한 하나의 plugin 추가
* `No marketplace description provided`: 사용자가 marketplace를 이해할 수 있도록 `metadata.description` 추가
* `Plugin name "x" is not kebab-case`: plugin 이름에 대문자, 공백, 또는 특수 문자가 포함됨. 소문자, 숫자, 하이픈만 사용하도록 이름 변경(예: `my-plugin`). Claude Code는 다른 형식도 허용하지만, Claude.ai marketplace 동기화는 이를 거부합니다.

### Plugin 설치 실패

**증상**: Marketplace는 표시되지만 plugin 설치가 실패함

**해결 방법**:

* Plugin 소스 URL에 액세스할 수 있는지 확인
* Plugin 디렉토리에 필수 파일이 포함되어 있는지 확인
* GitHub 소스의 경우 저장소가 공개이거나 액세스 권한이 있는지 확인
* 클론/다운로드로 plugin 소스를 수동으로 테스트

### 프라이빗 저장소 인증 실패

**증상**: 프라이빗 저장소에서 plugin 설치 시 인증 오류

**해결 방법**:

수동 설치 및 업데이트의 경우:

* git 제공자로 인증되어 있는지 확인(예: GitHub의 경우 `gh auth status` 실행)
* 자격 증명 도우미가 올바르게 구성되어 있는지 확인: `git config --global credential.helper`
* 저장소를 수동으로 클론하여 자격 증명이 작동하는지 확인

백그라운드 자동 업데이트의 경우:

* 환경에서 적절한 토큰을 설정: `echo $GITHUB_TOKEN`
* 토큰이 필요한 권한(저장소에 대한 읽기 액세스)을 가지고 있는지 확인
* GitHub의 경우 토큰이 프라이빗 저장소에 대해 `repo` 스코프를 가지고 있는지 확인
* GitLab의 경우 토큰이 최소 `read_repository` 스코프를 가지고 있는지 확인
* 토큰이 만료되지 않았는지 확인

### 오프라인 환경에서 Marketplace 업데이트 실패

**증상**: Marketplace `git pull`이 실패하고 Claude Code가 기존 캐시를 지워 plugin을 사용할 수 없게 됨.

**원인**: 기본적으로 `git pull`이 실패하면 Claude Code는 오래된 클론을 제거하고 재클론을 시도합니다. 오프라인 또는 에어갭 환경에서는 재클론이 같은 방식으로 실패하여 marketplace 디렉토리가 비어 있게 됩니다.

**해결 방법**: `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE=1`을 설정하여 pull이 실패해도 기존 캐시를 지우지 않고 유지합니다:

```bash
export CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE=1
```

이 변수를 설정하면 Claude Code는 `git pull` 실패 시 오래된 marketplace 클론을 유지하고 마지막으로 알려진 정상 상태를 계속 사용합니다. 저장소에 절대 접근할 수 없는 완전 오프라인 배포의 경우, 빌드 시간에 plugins 디렉토리를 미리 채우기 위해 [`CLAUDE_CODE_PLUGIN_SEED_DIR`](#컨테이너용-plugin-사전-배포)을 사용하세요.

### Git 작업 타임아웃

**증상**: Plugin 설치 또는 marketplace 업데이트가 "Git clone timed out after 120s" 또는 "Git pull timed out after 120s"와 같은 타임아웃 오류로 실패함.

**원인**: Claude Code는 plugin 저장소 클론 및 marketplace 업데이트 pull을 포함한 모든 git 작업에 120초 타임아웃을 사용합니다. 대형 저장소나 느린 네트워크 연결이 이 제한을 초과할 수 있습니다.

**해결 방법**: `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` 환경 변수를 사용하여 타임아웃을 늘립니다. 값은 밀리초 단위입니다:

```bash
export CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS=300000  # 5분
```

### URL 기반 Marketplace에서 상대 경로 Plugin 실패

**증상**: URL을 통해 marketplace를 추가했지만(예: `https://example.com/marketplace.json`), `"./plugins/my-plugin"`과 같은 상대 경로 소스를 가진 plugin이 "path not found" 오류로 설치에 실패함.

**원인**: URL 기반 marketplace는 `marketplace.json` 파일 자체만 다운로드합니다. 서버에서 plugin 파일을 다운로드하지 않습니다. Marketplace 항목의 상대 경로는 다운로드되지 않은 원격 서버의 파일을 참조합니다.

**해결 방법**:

* **외부 소스 사용**: 상대 경로 대신 GitHub, npm 또는 git URL 소스를 사용하도록 plugin 항목을 변경합니다:
  ```json
  { "name": "my-plugin", "source": { "source": "github", "repo": "owner/repo" } }
  ```
* **Git 기반 marketplace 사용**: Git 저장소에 marketplace를 호스팅하고 git URL로 추가합니다. Git 기반 marketplace는 전체 저장소를 클론하여 상대 경로가 올바르게 작동합니다.

### 설치 후 파일을 찾을 수 없음

**증상**: Plugin은 설치되지만 파일 참조가 실패함, 특히 plugin 디렉토리 외부의 파일

**원인**: Plugin은 제자리에서 사용되지 않고 캐시 디렉토리에 복사됩니다. Plugin 디렉토리 외부의 파일을 참조하는 경로(예: `../shared-utils`)는 해당 파일이 복사되지 않으므로 작동하지 않습니다.

**해결 방법**: 심볼릭 링크 및 디렉토리 재구성을 포함한 해결 방법은 [Plugin 캐싱 및 파일 해석](/plugins-reference#plugin-caching-and-file-resolution)을 참조하세요.

추가 디버깅 도구 및 일반적인 문제는 [디버깅 및 개발 도구](/plugins-reference#debugging-and-development-tools)를 참조하세요.

## 참고 항목

* [사전 빌드된 plugin 검색 및 설치](/discover-plugins) - 기존 marketplace에서 plugin 설치
* [Plugins](/plugins) - 자체 plugin 만들기
* [Plugin 참조](/plugins-reference) - 완전한 기술 사양 및 스키마
* [Plugin 설정](/settings#plugin-settings) - Plugin 구성 옵션
* [strictKnownMarketplaces 참조](/settings#strictknownmarketplaces) - 관리형 marketplace 제한
