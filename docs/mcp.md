---
title: MCP를 통해 Claude Code를 도구에 연결하기
description: Model Context Protocol을 사용하여 Claude Code를 도구에 연결하는 방법을 알아보세요.
---

# MCP를 통해 Claude Code를 도구에 연결하기

> Model Context Protocol을 사용하여 Claude Code를 도구에 연결하는 방법을 알아보세요.

Claude Code는 AI-도구 통합을 위한 오픈 소스 표준인 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction)을 통해 수백 개의 외부 도구 및 데이터 소스에 연결할 수 있습니다. MCP 서버는 Claude Code에 도구, 데이터베이스 및 API에 대한 액세스를 제공합니다.

이슈 트래커나 모니터링 대시보드와 같은 다른 도구에서 데이터를 채팅에 복사하고 있다면 서버를 연결하세요. 연결되면 Claude는 붙여넣은 내용으로 작업하는 대신 해당 시스템을 직접 읽고 조작할 수 있습니다.

## MCP로 할 수 있는 것

MCP 서버가 연결되면 Claude Code에 다음과 같은 요청을 할 수 있습니다:

* **이슈 트래커에서 기능 구현**: "JIRA 이슈 ENG-4521에 설명된 기능을 추가하고 GitHub에 PR을 만들어줘."
* **모니터링 데이터 분석**: "Sentry와 Statsig을 확인해서 ENG-4521에 설명된 기능의 사용량을 체크해줘."
* **데이터베이스 쿼리**: "PostgreSQL 데이터베이스를 기반으로 ENG-4521 기능을 사용한 무작위 사용자 10명의 이메일을 찾아줘."
* **디자인 통합**: "Slack에 게시된 새로운 Figma 디자인을 기반으로 표준 이메일 템플릿을 업데이트해줘"
* **워크플로우 자동화**: "이 10명의 사용자에게 새 기능에 대한 피드백 세션에 초대하는 Gmail 초안을 만들어줘."
* **외부 이벤트에 반응**: MCP 서버는 세션에 메시지를 푸시하는 [채널](/channels)로도 작동할 수 있어, 여러분이 자리를 비운 동안 Claude가 Telegram 메시지, Discord 채팅 또는 webhook 이벤트에 반응합니다.

## 인기 있는 MCP 서버

다음은 Claude Code에 연결할 수 있는 일반적으로 사용되는 MCP 서버입니다:

::: warning
서드파티 MCP 서버는 본인의 책임하에 사용하세요 - Anthropic이 이러한 모든 서버의 정확성이나 보안을 검증하지 않았습니다.
설치하는 MCP 서버를 신뢰할 수 있는지 확인하세요.
특히 신뢰할 수 없는 콘텐츠를 가져올 수 있는 MCP 서버를 사용할 때는 프롬프트 주입 위험에 노출될 수 있으므로 주의하세요.
:::

::: info
**특정 통합이 필요하신가요?** [GitHub에서 수백 개의 MCP 서버를 더 찾아보거나](https://github.com/modelcontextprotocol/servers), [MCP SDK](https://modelcontextprotocol.io/quickstart/server)를 사용하여 직접 만들 수 있습니다.
:::

## MCP 서버 설치

MCP 서버는 필요에 따라 세 가지 방법으로 구성할 수 있습니다:

### 옵션 1: 원격 HTTP 서버 추가

HTTP 서버는 원격 MCP 서버에 연결하는 데 권장되는 옵션입니다. 클라우드 기반 서비스에서 가장 널리 지원되는 전송 방식입니다.

```bash
# 기본 구문
claude mcp add --transport http <name> <url>

# 실제 예: Notion에 연결
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Bearer 토큰 사용 예
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

### 옵션 2: 원격 SSE 서버 추가

::: warning
SSE (Server-Sent Events) 전송은 더 이상 사용되지 않습니다. 가능한 경우 HTTP 서버를 대신 사용하세요.
:::

```bash
# 기본 구문
claude mcp add --transport sse <name> <url>

# 실제 예: Asana에 연결
claude mcp add --transport sse asana https://mcp.asana.com/sse

# 인증 헤더 사용 예
claude mcp add --transport sse private-api https://api.company.com/sse \
  --header "X-API-Key: your-key-here"
```

### 옵션 3: 로컬 stdio 서버 추가

stdio 서버는 로컬 머신에서 프로세스로 실행됩니다. 직접 시스템 액세스 또는 커스텀 스크립트가 필요한 도구에 적합합니다.

```bash
# 기본 구문
claude mcp add [options] <name> -- <command> [args...]

# 실제 예: Airtable 서버 추가
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```

::: info
**중요: 옵션 순서**

모든 옵션(`--transport`, `--env`, `--scope`, `--header`)은 서버 이름 **앞에** 와야 합니다. `--` (이중 대시)는 서버 이름과 MCP 서버에 전달되는 명령 및 인수를 구분합니다.

예를 들어:

* `claude mcp add --transport stdio myserver -- npx server` → `npx server`를 실행합니다
* `claude mcp add --transport stdio --env KEY=value myserver -- python server.py --port 8080` → 환경에 `KEY=value`를 설정하고 `python server.py --port 8080`을 실행합니다

이는 Claude의 플래그와 서버의 플래그 간의 충돌을 방지합니다.
:::

### 서버 관리

구성이 완료되면 다음 명령으로 MCP 서버를 관리할 수 있습니다:

```bash
# 구성된 모든 서버 목록 보기
claude mcp list

# 특정 서버의 세부 정보 가져오기
claude mcp get github

# 서버 제거
claude mcp remove github

# (Claude Code 내에서) 서버 상태 확인
/mcp
```

### 동적 도구 업데이트

Claude Code는 MCP `list_changed` 알림을 지원하여, MCP 서버가 연결을 끊고 다시 연결할 필요 없이 사용 가능한 도구, 프롬프트 및 리소스를 동적으로 업데이트할 수 있습니다. MCP 서버가 `list_changed` 알림을 보내면, Claude Code는 해당 서버에서 사용 가능한 기능을 자동으로 새로고침합니다.

### 채널을 통한 푸시 메시지

MCP 서버는 세션에 직접 메시지를 푸시하여 CI 결과, 모니터링 알림 또는 채팅 메시지와 같은 외부 이벤트에 Claude가 반응할 수 있게 합니다. 이를 활성화하려면 서버가 `claude/channel` 기능을 선언하고 시작 시 `--channels` 플래그로 옵트인하면 됩니다. 공식적으로 지원되는 채널을 사용하려면 [채널](/channels)을 참조하고, 직접 만들려면 [채널 레퍼런스](/channels-reference)를 참조하세요.

::: tip
팁:

* `--scope` 플래그를 사용하여 구성이 저장되는 위치를 지정하세요:
  * `local` (기본값): 현재 프로젝트에서 본인만 사용 가능 (이전 버전에서는 `project`라고 불렸음)
  * `project`: `.mcp.json` 파일을 통해 프로젝트의 모든 사용자와 공유
  * `user`: 모든 프로젝트에서 본인만 사용 가능 (이전 버전에서는 `global`이라고 불렸음)
* `--env` 플래그로 환경 변수를 설정하세요 (예: `--env KEY=value`)
* MCP_TIMEOUT 환경 변수를 사용하여 MCP 서버 시작 제한 시간을 구성하세요 (예: `MCP_TIMEOUT=10000 claude`로 10초 제한 시간 설정)
* Claude Code는 MCP 도구 출력이 10,000 토큰을 초과하면 경고를 표시합니다. 이 제한을 늘리려면 `MAX_MCP_OUTPUT_TOKENS` 환경 변수를 설정하세요 (예: `MAX_MCP_OUTPUT_TOKENS=50000`)
* `/mcp`를 사용하여 OAuth 2.0 인증이 필요한 원격 서버에 인증하세요
:::

::: warning
**Windows 사용자**: 네이티브 Windows(WSL이 아닌)에서 `npx`를 사용하는 로컬 MCP 서버는 올바른 실행을 위해 `cmd /c` 래퍼가 필요합니다.

```bash
# 이것은 Windows가 실행할 수 있는 command="cmd"을 생성합니다
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
```

`cmd /c` 래퍼 없이는 Windows가 `npx`를 직접 실행할 수 없기 때문에 "Connection closed" 오류가 발생합니다. (위의 참고 사항에서 `--` 매개변수에 대한 설명을 참조하세요.)
:::

### 플러그인 제공 MCP 서버

[플러그인](/plugins)은 MCP 서버를 번들로 제공하여 플러그인이 활성화되면 자동으로 도구와 통합을 제공할 수 있습니다. 플러그인 MCP 서버는 사용자가 구성한 서버와 동일하게 작동합니다.

**플러그인 MCP 서버 작동 방식**:

* 플러그인은 플러그인 루트의 `.mcp.json`이나 `plugin.json` 인라인에서 MCP 서버를 정의합니다
* 플러그인이 활성화되면 MCP 서버가 자동으로 시작됩니다
* 플러그인 MCP 도구는 수동으로 구성한 MCP 도구와 함께 표시됩니다
* 플러그인 서버는 플러그인 설치를 통해 관리됩니다 (`/mcp` 명령이 아님)

**플러그인 MCP 구성 예**:

플러그인 루트의 `.mcp.json`:

```json
{
  "mcpServers": {
    "database-tools": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```

또는 `plugin.json` 인라인:

```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

**플러그인 MCP 기능**:

* **자동 라이프사이클**: 세션 시작 시 활성화된 플러그인의 서버가 자동으로 연결됩니다. 세션 중에 플러그인을 활성화하거나 비활성화하면 `/reload-plugins`를 실행하여 MCP 서버를 연결하거나 연결 해제하세요
* **환경 변수**: 번들된 플러그인 파일에는 `${CLAUDE_PLUGIN_ROOT}`를, 플러그인 업데이트 후에도 유지되는 [영구 상태](/plugins-reference#persistent-data-directory)에는 `${CLAUDE_PLUGIN_DATA}`를 사용하세요
* **사용자 환경 액세스**: 수동으로 구성한 서버와 동일한 환경 변수에 액세스
* **다중 전송 유형 지원**: stdio, SSE, HTTP 전송 지원 (서버에 따라 전송 지원이 다를 수 있음)

**플러그인 MCP 서버 보기**:

```bash
# Claude Code 내에서 플러그인 포함 모든 MCP 서버 보기
/mcp
```

플러그인 서버는 플러그인에서 제공됨을 나타내는 표시와 함께 목록에 나타납니다.

**플러그인 MCP 서버의 이점**:

* **번들 배포**: 도구와 서버가 함께 패키징됨
* **자동 설정**: 수동 MCP 구성이 필요 없음
* **팀 일관성**: 플러그인 설치 시 모든 사용자가 동일한 도구를 사용

플러그인과 MCP 서버를 번들하는 자세한 내용은 [플러그인 컴포넌트 레퍼런스](/plugins-reference#mcp-servers)를 참조하세요.

## MCP 설치 스코프

MCP 서버는 세 가지 스코프로 구성할 수 있습니다. 선택한 스코프에 따라 서버가 로드되는 프로젝트와 구성이 팀과 공유되는지 여부가 결정됩니다.

| 스코프 | 로드 위치 | 팀과 공유 | 저장 위치 |
| --- | --- | --- | --- |
| [Local](#local-스코프) | 현재 프로젝트만 | 아니오 | `~/.claude.json` |
| [Project](#project-스코프) | 현재 프로젝트만 | 예, 버전 관리를 통해 | 프로젝트 루트의 `.mcp.json` |
| [User](#user-스코프) | 모든 프로젝트 | 아니오 | `~/.claude.json` |

### Local 스코프

Local 스코프가 기본값입니다. Local 스코프 서버는 추가한 프로젝트에서만 로드되며 본인에게만 비공개입니다. Claude Code는 해당 프로젝트의 경로 아래 `~/.claude.json`에 저장하므로, 같은 서버가 다른 프로젝트에 나타나지 않습니다. 개인 개발 서버, 실험적 구성 또는 버전 관리에 넣고 싶지 않은 자격 증명이 있는 서버에 Local 스코프를 사용하세요.

::: info
MCP 서버의 "local 스코프"라는 용어는 일반적인 로컬 설정과 다릅니다. MCP local 스코프 서버는 `~/.claude.json` (홈 디렉토리)에 저장되는 반면, 일반 로컬 설정은 `.claude/settings.local.json` (프로젝트 디렉토리)을 사용합니다. 설정 파일 위치에 대한 자세한 내용은 [설정](/settings#settings-files)을 참조하세요.
:::

```bash
# Local 스코프 서버 추가 (기본값)
claude mcp add --transport http stripe https://mcp.stripe.com

# 명시적으로 local 스코프 지정
claude mcp add --transport http stripe --scope local https://mcp.stripe.com
```

이 명령은 `~/.claude.json` 내부의 현재 프로젝트 항목에 서버를 작성합니다. 아래 예는 `/path/to/your/project`에서 실행했을 때의 결과를 보여줍니다:

```json
{
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "stripe": {
          "type": "http",
          "url": "https://mcp.stripe.com"
        }
      }
    }
  }
}
```

### Project 스코프

Project 스코프 서버는 프로젝트 루트 디렉토리의 `.mcp.json` 파일에 구성을 저장하여 팀 협업을 가능하게 합니다. 이 파일은 버전 관리에 체크인하도록 설계되어 모든 팀원이 동일한 MCP 도구와 서비스에 액세스할 수 있습니다. Project 스코프 서버를 추가하면 Claude Code가 적절한 구성 구조로 이 파일을 자동으로 생성하거나 업데이트합니다.

```bash
# Project 스코프 서버 추가
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp
```

결과 `.mcp.json` 파일은 표준화된 형식을 따릅니다:

```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

보안상의 이유로 Claude Code는 `.mcp.json` 파일의 Project 스코프 서버를 사용하기 전에 승인을 요청합니다. 이러한 승인 선택을 초기화해야 하는 경우 `claude mcp reset-project-choices` 명령을 사용하세요.

### User 스코프

User 스코프 서버는 `~/.claude.json`에 저장되며 프로젝트 간 접근성을 제공하여, 사용자 계정에 비공개로 유지하면서 머신의 모든 프로젝트에서 사용할 수 있습니다. 이 스코프는 개인 유틸리티 서버, 개발 도구 또는 여러 프로젝트에서 자주 사용하는 서비스에 적합합니다.

```bash
# User 서버 추가
claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```

### 스코프 계층 구조 및 우선순위

동일한 서버가 둘 이상의 위치에 정의된 경우, Claude Code는 가장 높은 우선순위 소스의 정의를 사용하여 한 번만 연결합니다:

1. Local 스코프
2. Project 스코프
3. User 스코프
4. [플러그인 제공 서버](/plugins)
5. [claude.ai 커넥터](#claude-ai의-mcp-서버-사용)

세 가지 스코프는 이름으로 중복을 매칭합니다. 플러그인과 커넥터는 엔드포인트로 매칭하므로, 위의 서버와 동일한 URL이나 명령을 가리키는 것은 중복으로 처리됩니다.

### `.mcp.json`의 환경 변수 확장

Claude Code는 `.mcp.json` 파일에서 환경 변수 확장을 지원하여, 팀이 머신별 경로와 API 키와 같은 민감한 값에 대한 유연성을 유지하면서 구성을 공유할 수 있습니다.

**지원되는 구문:**

* `${VAR}` - 환경 변수 `VAR`의 값으로 확장
* `${VAR:-default}` - `VAR`가 설정되어 있으면 해당 값으로, 그렇지 않으면 `default`를 사용

**확장 위치:**
환경 변수는 다음 위치에서 확장할 수 있습니다:

* `command` - 서버 실행 파일 경로
* `args` - 명령줄 인수
* `env` - 서버에 전달되는 환경 변수
* `url` - HTTP 서버 유형용
* `headers` - HTTP 서버 인증용

**변수 확장 예:**

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

필요한 환경 변수가 설정되지 않았고 기본값이 없으면 Claude Code는 구성을 파싱하지 못합니다.

## 실용적인 예제

### 예제: Sentry로 오류 모니터링

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

Sentry 계정으로 인증:

```text
/mcp
```

그런 다음 프로덕션 이슈를 디버그:

```text
지난 24시간 동안 가장 흔한 오류는 무엇인가요?
```

```text
오류 ID abc123의 스택 트레이스를 보여줘
```

```text
어떤 배포에서 이러한 새로운 오류가 도입되었나요?
```

### 예제: 코드 리뷰를 위해 GitHub에 연결

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

필요한 경우 GitHub에서 "Authenticate"를 선택하여 인증:

```text
/mcp
```

그런 다음 GitHub으로 작업:

```text
PR #456을 리뷰하고 개선 사항을 제안해줘
```

```text
방금 발견한 버그에 대한 새 이슈를 만들어줘
```

```text
내게 할당된 모든 열린 PR을 보여줘
```

### 예제: PostgreSQL 데이터베이스 쿼리

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

그런 다음 자연어로 데이터베이스를 쿼리:

```text
이번 달 총 매출은 얼마인가요?
```

```text
orders 테이블의 스키마를 보여줘
```

```text
90일 동안 구매하지 않은 고객을 찾아줘
```

## 원격 MCP 서버 인증

많은 클라우드 기반 MCP 서버는 인증이 필요합니다. Claude Code는 안전한 연결을 위해 OAuth 2.0을 지원합니다.

**1단계: 인증이 필요한 서버 추가**

예:

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

**2단계: Claude Code 내에서 /mcp 명령 사용**

Claude Code에서 다음 명령을 사용합니다:

```text
/mcp
```

그런 다음 브라우저에서 로그인 단계를 따릅니다.

::: tip
팁:

* 인증 토큰은 안전하게 저장되고 자동으로 갱신됩니다
* `/mcp` 메뉴에서 "Clear authentication"을 사용하여 액세스를 취소하세요
* 브라우저가 자동으로 열리지 않으면 제공된 URL을 복사하여 수동으로 여세요
* 인증 후 브라우저 리디렉트가 연결 오류로 실패하면, 브라우저 주소 표시줄의 전체 콜백 URL을 Claude Code에 나타나는 URL 프롬프트에 붙여넣으세요
* OAuth 인증은 HTTP 서버에서 작동합니다
:::

### 고정 OAuth 콜백 포트 사용

일부 MCP 서버는 사전에 등록된 특정 리디렉트 URI가 필요합니다. 기본적으로 Claude Code는 OAuth 콜백에 사용 가능한 임의의 포트를 선택합니다. `--callback-port`를 사용하여 `http://localhost:PORT/callback` 형식의 사전 등록된 리디렉트 URI와 일치하도록 포트를 고정하세요.

`--callback-port`는 단독으로(동적 클라이언트 등록 시) 또는 `--client-id`와 함께(사전 구성된 자격 증명 시) 사용할 수 있습니다.

```bash
# 동적 클라이언트 등록과 함께 고정 콜백 포트
claude mcp add --transport http \
  --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### 사전 구성된 OAuth 자격 증명 사용

일부 MCP 서버는 동적 클라이언트 등록을 통한 자동 OAuth 설정을 지원하지 않습니다. "Incompatible auth server: does not support dynamic client registration"과 같은 오류가 표시되면 서버에 사전 구성된 자격 증명이 필요합니다. Claude Code는 동적 클라이언트 등록 대신 Client ID Metadata Document (CIMD)를 사용하는 서버도 지원하며 자동으로 검색합니다. 자동 검색이 실패하면 먼저 서버의 개발자 포털을 통해 OAuth 앱을 등록한 다음 서버를 추가할 때 자격 증명을 제공하세요.

**1단계: 서버에 OAuth 앱 등록**

서버의 개발자 포털을 통해 앱을 만들고 클라이언트 ID와 클라이언트 시크릿을 기록하세요.

많은 서버는 리디렉트 URI도 필요합니다. 필요한 경우 포트를 선택하고 `http://localhost:PORT/callback` 형식으로 리디렉트 URI를 등록하세요. 다음 단계에서 `--callback-port`에 동일한 포트를 사용합니다.

**2단계: 자격 증명으로 서버 추가**

다음 방법 중 하나를 선택하세요. `--callback-port`에 사용되는 포트는 사용 가능한 포트면 됩니다. 이전 단계에서 등록한 리디렉트 URI와 일치하기만 하면 됩니다.

`claude mcp add` 사용:

`--client-id`를 사용하여 앱의 클라이언트 ID를 전달합니다. `--client-secret` 플래그는 마스크된 입력으로 시크릿을 요청합니다:

```bash
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

`claude mcp add-json` 사용:

JSON 구성에 `oauth` 객체를 포함하고 `--client-secret`를 별도 플래그로 전달합니다:

```bash
claude mcp add-json my-server \
  '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' \
  --client-secret
```

콜백 포트만 사용:

동적 클라이언트 등록을 사용하면서 포트를 고정하려면 클라이언트 ID 없이 `--callback-port`를 사용합니다:

```bash
claude mcp add-json my-server \
  '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"callbackPort":8080}}'
```

CI / 환경 변수:

대화형 프롬프트를 건너뛰려면 환경 변수를 통해 시크릿을 설정합니다:

```bash
MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

**3단계: Claude Code에서 인증**

Claude Code에서 `/mcp`를 실행하고 브라우저 로그인 플로우를 따릅니다.

::: tip
팁:

* 클라이언트 시크릿은 구성이 아닌 시스템 키체인(macOS) 또는 자격 증명 파일에 안전하게 저장됩니다
* 서버가 시크릿이 없는 공개 OAuth 클라이언트를 사용하는 경우 `--client-secret` 없이 `--client-id`만 사용하세요
* `--callback-port`는 `--client-id`와 함께 또는 없이 사용할 수 있습니다
* 이러한 플래그는 HTTP 및 SSE 전송에만 적용됩니다. stdio 서버에는 효과가 없습니다
* `claude mcp get <name>`을 사용하여 서버에 OAuth 자격 증명이 구성되었는지 확인하세요
:::

### OAuth 메타데이터 검색 재정의

MCP 서버의 표준 OAuth 메타데이터 엔드포인트가 오류를 반환하지만 서버가 작동하는 OIDC 엔드포인트를 노출하는 경우, Claude Code가 기본 검색 체인을 우회하도록 특정 메타데이터 URL을 지정할 수 있습니다. 기본적으로 Claude Code는 먼저 `/.well-known/oauth-protected-resource`의 RFC 9728 Protected Resource Metadata를 확인한 다음 `/.well-known/oauth-authorization-server`의 RFC 8414 인증 서버 메타데이터로 폴백합니다.

서버 구성의 `oauth` 객체에 `.mcp.json`으로 `authServerMetadataUrl`을 설정하세요:

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "authServerMetadataUrl": "https://auth.example.com/.well-known/openid-configuration"
      }
    }
  }
}
```

URL은 `https://`를 사용해야 합니다. 이 옵션은 Claude Code v2.1.64 이상이 필요합니다.

### 커스텀 인증을 위한 동적 헤더 사용

MCP 서버가 OAuth 이외의 인증 체계(예: Kerberos, 단기 토큰 또는 내부 SSO)를 사용하는 경우 `headersHelper`를 사용하여 연결 시 요청 헤더를 생성하세요. Claude Code는 명령을 실행하고 출력을 연결 헤더에 병합합니다.

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "/opt/bin/get-mcp-auth-headers.sh"
    }
  }
}
```

인라인 명령도 가능합니다:

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "echo '{\"Authorization\": \"Bearer '\"$(get-token)\"'\"}'"
    }
  }
}
```

**요구 사항:**

* 명령은 문자열 키-값 쌍의 JSON 객체를 stdout에 작성해야 합니다
* 명령은 10초 제한 시간으로 셸에서 실행됩니다
* 동적 헤더는 동일한 이름의 정적 `headers`를 재정의합니다

헬퍼는 각 연결(세션 시작 및 재연결 시)마다 새로 실행됩니다. 캐싱은 없으므로 스크립트가 토큰 재사용을 담당합니다.

Claude Code는 헬퍼를 실행할 때 다음 환경 변수를 설정합니다:

| 변수 | 값 |
| :--- | :--- |
| `CLAUDE_CODE_MCP_SERVER_NAME` | MCP 서버의 이름 |
| `CLAUDE_CODE_MCP_SERVER_URL` | MCP 서버의 URL |

이를 사용하여 여러 MCP 서버를 처리하는 단일 헬퍼 스크립트를 작성하세요.

::: info
`headersHelper`는 임의의 셸 명령을 실행합니다. project 또는 local 스코프에서 정의된 경우 작업 공간 신뢰 대화 상자를 수락한 후에만 실행됩니다.
:::

## JSON 구성에서 MCP 서버 추가

MCP 서버의 JSON 구성이 있는 경우 직접 추가할 수 있습니다:

**1단계: JSON에서 MCP 서버 추가**

```bash
# 기본 구문
claude mcp add-json <name> '<json>'

# 예: JSON 구성으로 HTTP 서버 추가
claude mcp add-json weather-api '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# 예: JSON 구성으로 stdio 서버 추가
claude mcp add-json local-weather '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'

# 예: 사전 구성된 OAuth 자격 증명으로 HTTP 서버 추가
claude mcp add-json my-server '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' --client-secret
```

**2단계: 서버가 추가되었는지 확인**

```bash
claude mcp get weather-api
```

::: tip
팁:

* 셸에서 JSON이 올바르게 이스케이프되었는지 확인하세요
* JSON은 MCP 서버 구성 스키마를 준수해야 합니다
* `--scope user`를 사용하여 프로젝트별 구성 대신 사용자 구성에 서버를 추가할 수 있습니다
:::

## Claude Desktop에서 MCP 서버 가져오기

Claude Desktop에서 이미 MCP 서버를 구성한 경우 가져올 수 있습니다:

**1단계: Claude Desktop에서 서버 가져오기**

```bash
# 기본 구문
claude mcp add-from-claude-desktop
```

**2단계: 가져올 서버 선택**

명령을 실행한 후 가져올 서버를 선택할 수 있는 대화형 대화 상자가 표시됩니다.

**3단계: 서버가 가져와졌는지 확인**

```bash
claude mcp list
```

::: tip
팁:

* 이 기능은 macOS 및 Windows Subsystem for Linux (WSL)에서만 작동합니다
* 해당 플랫폼의 표준 위치에서 Claude Desktop 구성 파일을 읽습니다
* `--scope user` 플래그를 사용하여 사용자 구성에 서버를 추가하세요
* 가져온 서버는 Claude Desktop에서와 동일한 이름을 갖습니다
* 같은 이름의 서버가 이미 존재하면 숫자 접미사가 붙습니다 (예: `server_1`)
:::

## Claude.ai의 MCP 서버 사용

[Claude.ai](https://claude.ai) 계정으로 Claude Code에 로그인한 경우, Claude.ai에서 추가한 MCP 서버를 Claude Code에서 자동으로 사용할 수 있습니다:

**1단계: Claude.ai에서 MCP 서버 구성**

[claude.ai/settings/connectors](https://claude.ai/settings/connectors)에서 서버를 추가합니다. Team 및 Enterprise 플랜에서는 관리자만 서버를 추가할 수 있습니다.

**2단계: MCP 서버 인증**

Claude.ai에서 필요한 인증 단계를 완료합니다.

**3단계: Claude Code에서 서버 보기 및 관리**

Claude Code에서 다음 명령을 사용합니다:

```text
/mcp
```

Claude.ai 서버는 Claude.ai에서 제공됨을 나타내는 표시와 함께 목록에 나타납니다.

Claude Code에서 claude.ai MCP 서버를 비활성화하려면 `ENABLE_CLAUDEAI_MCP_SERVERS` 환경 변수를 `false`로 설정합니다:

```bash
ENABLE_CLAUDEAI_MCP_SERVERS=false claude
```

## Claude Code를 MCP 서버로 사용

Claude Code 자체를 다른 애플리케이션이 연결할 수 있는 MCP 서버로 사용할 수 있습니다:

```bash
# Claude를 stdio MCP 서버로 시작
claude mcp serve
```

claude_desktop_config.json에 다음 구성을 추가하여 Claude Desktop에서 사용할 수 있습니다:

```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

::: warning
**실행 파일 경로 구성**: `command` 필드는 Claude Code 실행 파일을 참조해야 합니다. `claude` 명령이 시스템 PATH에 없는 경우 실행 파일의 전체 경로를 지정해야 합니다.

전체 경로를 찾으려면:

```bash
which claude
```

그런 다음 구성에서 전체 경로를 사용합니다:

```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "/full/path/to/claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

올바른 실행 파일 경로 없이는 `spawn claude ENOENT`와 같은 오류가 발생합니다.
:::

::: tip
팁:

* 서버는 Claude의 View, Edit, LS 등의 도구에 대한 액세스를 제공합니다
* Claude Desktop에서 디렉토리의 파일 읽기, 편집 등을 Claude에게 요청해 보세요
* 이 MCP 서버는 MCP 클라이언트에 Claude Code의 도구만 노출하므로, 개별 도구 호출에 대한 사용자 확인은 자체 클라이언트가 구현해야 합니다
:::

## MCP 출력 제한 및 경고

MCP 도구가 큰 출력을 생성할 때 Claude Code는 대화 컨텍스트가 과부하되는 것을 방지하기 위해 토큰 사용량을 관리합니다:

* **출력 경고 임계값**: Claude Code는 MCP 도구 출력이 10,000 토큰을 초과하면 경고를 표시합니다
* **구성 가능한 제한**: `MAX_MCP_OUTPUT_TOKENS` 환경 변수를 사용하여 최대 허용 MCP 출력 토큰을 조정할 수 있습니다
* **기본 제한**: 기본 최대값은 25,000 토큰입니다
* **범위**: 환경 변수는 자체 제한을 선언하지 않는 도구에 적용됩니다. [`anthropic/maxResultSizeChars`](#특정-도구의-제한-올리기)를 설정하는 도구는 `MAX_MCP_OUTPUT_TOKENS` 설정에 관계없이 텍스트 콘텐츠에 해당 값을 사용합니다. 이미지 데이터를 반환하는 도구는 여전히 `MAX_MCP_OUTPUT_TOKENS`의 적용을 받습니다

큰 출력을 생성하는 도구의 제한을 늘리려면:

```bash
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```

이는 다음과 같은 MCP 서버에서 작업할 때 특히 유용합니다:

* 대규모 데이터셋이나 데이터베이스를 쿼리
* 상세한 보고서나 문서 생성
* 광범위한 로그 파일이나 디버깅 정보 처리

### 특정 도구의 제한 올리기

MCP 서버를 구축하는 경우, 도구의 `tools/list` 응답 항목에서 `_meta["anthropic/maxResultSizeChars"]`를 설정하여 개별 도구가 기본 디스크 저장 임계값보다 큰 결과를 반환할 수 있도록 할 수 있습니다. Claude Code는 해당 도구의 임계값을 어노테이션된 값까지 올리며, 최대 500,000자까지 가능합니다.

이는 데이터베이스 스키마나 전체 파일 트리와 같이 본질적으로 크지만 필요한 출력을 반환하는 도구에 유용합니다. 어노테이션 없이 기본 임계값을 초과하는 결과는 디스크에 저장되고 대화에서 파일 참조로 대체됩니다.

```json
{
  "name": "get_schema",
  "description": "Returns the full database schema",
  "_meta": {
    "anthropic/maxResultSizeChars": 200000
  }
}
```

어노테이션은 텍스트 콘텐츠에 대해 `MAX_MCP_OUTPUT_TOKENS`와 독립적으로 적용되므로, 이를 선언하는 도구에 대해 사용자가 환경 변수를 올릴 필요가 없습니다. 이미지 데이터를 반환하는 도구는 여전히 토큰 제한의 적용을 받습니다.

::: warning
제어할 수 없는 특정 MCP 서버에서 출력 경고가 자주 발생하면 `MAX_MCP_OUTPUT_TOKENS` 제한을 늘리는 것을 고려하세요. 서버 작성자에게 `anthropic/maxResultSizeChars` 어노테이션을 추가하거나 응답을 페이지네이션하도록 요청할 수도 있습니다. 어노테이션은 이미지 콘텐츠를 반환하는 도구에는 효과가 없습니다; 이 경우 `MAX_MCP_OUTPUT_TOKENS`를 올리는 것이 유일한 옵션입니다.
:::

## MCP Elicitation 요청에 응답

MCP 서버는 작업 중 elicitation을 사용하여 구조화된 입력을 요청할 수 있습니다. 서버가 자체적으로 얻을 수 없는 정보가 필요할 때 Claude Code는 대화형 대화 상자를 표시하고 응답을 서버에 다시 전달합니다. 별도의 구성이 필요 없습니다: 서버가 요청하면 elicitation 대화 상자가 자동으로 나타납니다.

서버는 두 가지 방법으로 입력을 요청할 수 있습니다:

* **폼 모드**: Claude Code는 서버가 정의한 폼 필드(예: 사용자 이름 및 비밀번호 프롬프트)가 있는 대화 상자를 표시합니다. 필드를 채우고 제출합니다.
* **URL 모드**: Claude Code는 인증 또는 승인을 위한 브라우저 URL을 엽니다. 브라우저에서 플로우를 완료한 다음 CLI에서 확인합니다.

대화 상자를 표시하지 않고 elicitation 요청에 자동 응답하려면 [`Elicitation` 훅](/hooks#elicitation)을 사용하세요.

elicitation을 사용하는 MCP 서버를 구축하는 경우 프로토콜 세부 사항 및 스키마 예제는 [MCP elicitation 사양](https://modelcontextprotocol.io/docs/learn/client-concepts#elicitation)을 참조하세요.

## MCP 리소스 사용

MCP 서버는 파일을 참조하는 것과 유사하게 @ 멘션을 사용하여 참조할 수 있는 리소스를 노출할 수 있습니다.

### MCP 리소스 참조

**1단계: 사용 가능한 리소스 나열**

프롬프트에 `@`를 입력하면 연결된 모든 MCP 서버에서 사용 가능한 리소스를 볼 수 있습니다. 리소스는 자동 완성 메뉴에서 파일과 함께 나타납니다.

**2단계: 특정 리소스 참조**

`@server:protocol://resource/path` 형식을 사용하여 리소스를 참조합니다:

```text
@github:issue://123을 분석하고 수정 방법을 제안해줘
```

```text
@docs:file://api/authentication의 API 문서를 검토해줘
```

**3단계: 여러 리소스 참조**

단일 프롬프트에서 여러 리소스를 참조할 수 있습니다:

```text
@postgres:schema://users와 @docs:file://database/user-model을 비교해줘
```

::: tip
팁:

* 리소스는 참조될 때 자동으로 가져와져 첨부 파일로 포함됩니다
* 리소스 경로는 @ 멘션 자동 완성에서 퍼지 검색이 가능합니다
* 서버가 지원하는 경우 Claude Code는 MCP 리소스를 나열하고 읽는 도구를 자동으로 제공합니다
* 리소스는 MCP 서버가 제공하는 모든 유형의 콘텐츠(텍스트, JSON, 구조화된 데이터 등)를 포함할 수 있습니다
:::

## MCP Tool Search로 확장

Tool search는 Claude가 필요로 할 때까지 도구 정의를 지연시켜 MCP 컨텍스트 사용량을 낮게 유지합니다. 세션 시작 시 도구 이름만 로드되므로 더 많은 MCP 서버를 추가해도 컨텍스트 윈도우에 미치는 영향이 최소화됩니다.

### 작동 방식

Tool search는 기본적으로 활성화됩니다. MCP 도구는 미리 컨텍스트에 로드되지 않고 지연되며, Claude는 작업에 필요할 때 검색 도구를 사용하여 관련 도구를 발견합니다. Claude가 실제로 사용하는 도구만 컨텍스트에 들어갑니다. 사용자 관점에서 MCP 도구는 이전과 동일하게 작동합니다.

임계값 기반 로딩을 선호하는 경우 `ENABLE_TOOL_SEARCH=auto`를 설정하면 컨텍스트 윈도우의 10% 이내에 들어가는 스키마는 미리 로드하고 초과분만 지연시킵니다. 모든 옵션은 [Tool search 구성](#tool-search-구성)을 참조하세요.

### MCP 서버 작성자를 위해

MCP 서버를 구축하는 경우, Tool Search가 활성화되면 서버 instructions 필드가 더 유용해집니다. 서버 instructions는 [스킬](/skills)과 유사하게 Claude가 도구를 검색할 시기를 이해하는 데 도움이 됩니다.

도구에 대해 다음을 설명하는 명확하고 설명적인 서버 instructions를 추가하세요:

* 도구가 처리하는 작업 범주
* Claude가 도구를 검색해야 하는 시기
* 서버가 제공하는 주요 기능

Claude Code는 도구 설명과 서버 instructions를 각각 2KB에서 자릅니다. 잘림을 피하기 위해 간결하게 유지하고 중요한 세부 사항을 앞에 배치하세요.

### Tool search 구성

Tool search는 기본적으로 활성화됩니다: MCP 도구는 지연되고 요청 시 검색됩니다. `ANTHROPIC_BASE_URL`이 퍼스트 파티가 아닌 호스트를 가리키는 경우, 대부분의 프록시가 `tool_reference` 블록을 전달하지 않기 때문에 tool search가 기본적으로 비활성화됩니다. 프록시가 전달하는 경우 `ENABLE_TOOL_SEARCH`를 명시적으로 설정하세요. 이 기능은 `tool_reference` 블록을 지원하는 모델이 필요합니다: Sonnet 4 이상 또는 Opus 4 이상. Haiku 모델은 tool search를 지원하지 않습니다.

`ENABLE_TOOL_SEARCH` 환경 변수로 tool search 동작을 제어합니다:

| 값 | 동작 |
| :--- | :--- |
| (미설정) | 모든 MCP 도구가 지연되고 요청 시 로드됩니다. `ANTHROPIC_BASE_URL`이 퍼스트 파티가 아닌 호스트인 경우 미리 로드로 폴백합니다 |
| `true` | 퍼스트 파티가 아닌 `ANTHROPIC_BASE_URL`을 포함하여 모든 MCP 도구가 지연됩니다 |
| `auto` | 임계값 모드: 컨텍스트 윈도우의 10% 이내에 들어가면 미리 로드, 그렇지 않으면 지연 |
| `auto:<N>` | 커스텀 퍼센트를 사용한 임계값 모드, `<N>`은 0-100 (예: 5%의 경우 `auto:5`) |
| `false` | 모든 MCP 도구가 미리 로드, 지연 없음 |

```bash
# 커스텀 5% 임계값 사용
ENABLE_TOOL_SEARCH=auto:5 claude

# Tool search 완전히 비활성화
ENABLE_TOOL_SEARCH=false claude
```

또는 [settings.json `env` 필드](/settings#available-settings)에서 값을 설정하세요.

`ToolSearch` 도구를 구체적으로 비활성화할 수도 있습니다:

```json
{
  "permissions": {
    "deny": ["ToolSearch"]
  }
}
```

## MCP 프롬프트를 명령으로 사용

MCP 서버는 Claude Code에서 명령으로 사용할 수 있는 프롬프트를 노출할 수 있습니다.

### MCP 프롬프트 실행

**1단계: 사용 가능한 프롬프트 검색**

`/`를 입력하면 MCP 서버의 프롬프트를 포함하여 사용 가능한 모든 명령을 볼 수 있습니다. MCP 프롬프트는 `/mcp__servername__promptname` 형식으로 나타납니다.

**2단계: 인수 없이 프롬프트 실행**

```text
/mcp__github__list_prs
```

**3단계: 인수와 함께 프롬프트 실행**

많은 프롬프트는 인수를 받습니다. 명령 뒤에 공백으로 구분하여 전달합니다:

```text
/mcp__github__pr_review 456
```

```text
/mcp__jira__create_issue "Bug in login flow" high
```

::: tip
팁:

* MCP 프롬프트는 연결된 서버에서 동적으로 검색됩니다
* 인수는 프롬프트에 정의된 매개변수에 따라 파싱됩니다
* 프롬프트 결과는 대화에 직접 주입됩니다
* 서버 및 프롬프트 이름은 정규화됩니다 (공백은 밑줄로 변환)
:::

## 관리형 MCP 구성

조직에서 MCP 서버에 대한 중앙 집중식 제어가 필요한 경우 Claude Code는 두 가지 구성 옵션을 지원합니다:

1. **`managed-mcp.json`으로 독점 제어**: 사용자가 수정하거나 확장할 수 없는 고정된 MCP 서버 세트를 배포합니다
2. **허용 목록/거부 목록으로 정책 기반 제어**: 사용자가 자신의 서버를 추가할 수 있도록 허용하되 허용되는 서버를 제한합니다

이러한 옵션을 통해 IT 관리자는 다음을 수행할 수 있습니다:

* **직원이 액세스할 수 있는 MCP 서버 제어**: 조직 전체에 표준화된 승인된 MCP 서버 세트를 배포
* **무단 MCP 서버 방지**: 사용자가 승인되지 않은 MCP 서버를 추가하는 것을 제한
* **MCP 완전 비활성화**: 필요한 경우 MCP 기능을 완전히 제거

### 옵션 1: managed-mcp.json으로 독점 제어

`managed-mcp.json` 파일을 배포하면 모든 MCP 서버에 대한 **독점 제어**를 갖게 됩니다. 사용자는 이 파일에 정의된 것 이외의 MCP 서버를 추가, 수정 또는 사용할 수 없습니다. 이것은 완전한 제어를 원하는 조직에 가장 간단한 접근 방식입니다.

시스템 관리자가 시스템 전체 디렉토리에 구성 파일을 배포합니다:

* macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
* Linux 및 WSL: `/etc/claude-code/managed-mcp.json`
* Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

::: info
이들은 관리자 권한이 필요한 시스템 전체 경로입니다 (`~/Library/...`와 같은 사용자 홈 디렉토리가 아님). IT 관리자가 배포하도록 설계되었습니다.
:::

`managed-mcp.json` 파일은 표준 `.mcp.json` 파일과 동일한 형식을 사용합니다:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "company-internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server",
      "args": ["--config", "/etc/company/mcp-config.json"],
      "env": {
        "COMPANY_API_URL": "https://internal.company.com"
      }
    }
  }
}
```

### 옵션 2: 허용 목록 및 거부 목록으로 정책 기반 제어

독점 제어 대신 관리자는 사용자가 자신의 MCP 서버를 구성할 수 있도록 허용하면서 허용되는 서버에 대한 제한을 적용할 수 있습니다. 이 접근 방식은 [관리형 설정 파일](/settings#settings-files)의 `allowedMcpServers` 및 `deniedMcpServers`를 사용합니다.

::: info
**옵션 선택**: 사용자 커스터마이징 없이 고정된 서버 세트를 배포하려면 옵션 1(`managed-mcp.json`)을 사용하세요. 정책 제약 내에서 사용자가 자신의 서버를 추가할 수 있도록 하려면 옵션 2(허용 목록/거부 목록)를 사용하세요.
:::

#### 제한 옵션

허용 목록 또는 거부 목록의 각 항목은 세 가지 방법으로 서버를 제한할 수 있습니다:

1. **서버 이름으로** (`serverName`): 서버의 구성된 이름과 매칭
2. **명령으로** (`serverCommand`): stdio 서버를 시작하는 데 사용되는 정확한 명령 및 인수와 매칭
3. **URL 패턴으로** (`serverUrl`): 와일드카드를 지원하는 원격 서버 URL과 매칭

**중요**: 각 항목에는 `serverName`, `serverCommand` 또는 `serverUrl` 중 정확히 하나만 있어야 합니다.

#### 구성 예

```json
{
  "allowedMcpServers": [
    // 서버 이름으로 허용
    { "serverName": "github" },
    { "serverName": "sentry" },

    // 정확한 명령으로 허용 (stdio 서버용)
    { "serverCommand": ["npx", "-y", "@modelcontextprotocol/server-filesystem"] },
    { "serverCommand": ["python", "/usr/local/bin/approved-server.py"] },

    // URL 패턴으로 허용 (원격 서버용)
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverUrl": "https://*.internal.corp/*" }
  ],
  "deniedMcpServers": [
    // 서버 이름으로 차단
    { "serverName": "dangerous-server" },

    // 정확한 명령으로 차단 (stdio 서버용)
    { "serverCommand": ["npx", "-y", "unapproved-package"] },

    // URL 패턴으로 차단 (원격 서버용)
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

#### 명령 기반 제한 작동 방식

**정확한 매칭**:

* 명령 배열은 **정확히** 일치해야 합니다 - 명령과 모든 인수가 올바른 순서로 있어야 합니다
* 예: `["npx", "-y", "server"]`는 `["npx", "server"]` 또는 `["npx", "-y", "server", "--flag"]`와 일치하지 않습니다

**stdio 서버 동작**:

* 허용 목록에 **어떤** `serverCommand` 항목이 포함되어 있으면, stdio 서버는 해당 명령 중 하나와 **반드시** 일치해야 합니다
* 명령 제한이 있으면 stdio 서버는 이름만으로 통과할 수 없습니다
* 이를 통해 관리자가 실행 허용되는 명령을 강제할 수 있습니다

**비 stdio 서버 동작**:

* 원격 서버(HTTP, SSE, WebSocket)는 허용 목록에 `serverUrl` 항목이 있으면 URL 기반 매칭을 사용합니다
* URL 항목이 없으면 원격 서버는 이름 기반 매칭으로 폴백합니다
* 명령 제한은 원격 서버에 적용되지 않습니다

#### URL 기반 제한 작동 방식

URL 패턴은 `*`를 사용한 와일드카드를 지원하여 모든 문자 시퀀스와 매칭합니다. 이는 전체 도메인이나 하위 도메인을 허용하는 데 유용합니다.

**와일드카드 예**:

* `https://mcp.company.com/*` - 특정 도메인의 모든 경로 허용
* `https://*.example.com/*` - example.com의 모든 하위 도메인 허용
* `http://localhost:*/*` - localhost의 모든 포트 허용

**원격 서버 동작**:

* 허용 목록에 **어떤** `serverUrl` 항목이 포함되어 있으면, 원격 서버는 해당 URL 패턴 중 하나와 **반드시** 일치해야 합니다
* URL 제한이 있으면 원격 서버는 이름만으로 통과할 수 없습니다
* 이를 통해 관리자가 허용되는 원격 엔드포인트를 강제할 수 있습니다

#### 허용 목록 동작 (`allowedMcpServers`)

* `undefined` (기본값): 제한 없음 - 사용자가 모든 MCP 서버를 구성할 수 있음
* 빈 배열 `[]`: 완전 잠금 - 사용자가 MCP 서버를 구성할 수 없음
* 항목 목록: 사용자는 이름, 명령 또는 URL 패턴으로 매칭되는 서버만 구성할 수 있음

#### 거부 목록 동작 (`deniedMcpServers`)

* `undefined` (기본값): 차단되는 서버 없음
* 빈 배열 `[]`: 차단되는 서버 없음
* 항목 목록: 지정된 서버가 모든 스코프에서 명시적으로 차단됨

#### 중요 참고 사항

* **옵션 1과 옵션 2를 결합할 수 있습니다**: `managed-mcp.json`이 있으면 독점 제어가 적용되어 사용자가 서버를 추가할 수 없습니다. 허용 목록/거부 목록은 관리형 서버 자체에 여전히 적용됩니다.
* **거부 목록이 절대적 우선순위를 가집니다**: 서버가 거부 목록 항목과 일치하면(이름, 명령 또는 URL로) 허용 목록에 있더라도 차단됩니다
* 이름 기반, 명령 기반 및 URL 기반 제한이 함께 작동합니다: 서버는 이름 항목, 명령 항목 또는 URL 패턴 중 **하나라도** 일치하면 통과합니다 (거부 목록에 의해 차단되지 않는 한)

::: info
**`managed-mcp.json` 사용 시**: 사용자는 `claude mcp add` 또는 구성 파일을 통해 MCP 서버를 추가할 수 없습니다. `allowedMcpServers` 및 `deniedMcpServers` 설정은 실제로 로드되는 관리형 서버를 필터링하는 데 여전히 적용됩니다.
:::
