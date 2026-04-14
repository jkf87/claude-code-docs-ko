---
title: Remote Control로 어디서나 로컬 세션 계속하기
description: Remote Control을 사용해 전화기, 태블릿, 또는 모든 브라우저에서 로컬 Claude Code 세션을 이어서 작업하세요. claude.ai/code 및 Claude 모바일 앱에서 작동합니다.
---

# Remote Control로 어디서나 로컬 세션 계속하기

> Remote Control을 사용하면 전화기, 태블릿, 또는 모든 브라우저에서 로컬 Claude Code 세션을 이어서 작업할 수 있습니다. claude.ai/code 및 Claude 모바일 앱에서 작동합니다.

::: info
Remote Control은 모든 플랜에서 사용 가능합니다. Team 및 Enterprise 플랜에서는 기본적으로 비활성화되어 있으며, 관리자가 [Claude Code 관리자 설정](https://claude.ai/admin-settings/claude-code)에서 Remote Control 토글을 활성화해야 합니다.
:::

Remote Control은 [claude.ai/code](https://claude.ai/code)나 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 및 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)용 Claude 앱을 사용자의 로컬 머신에서 실행 중인 Claude Code 세션에 연결합니다. 책상에서 작업을 시작하고, 소파에서 전화기로 또는 다른 컴퓨터의 브라우저에서 계속 작업할 수 있습니다.

Remote Control 세션을 시작하면 Claude는 전체 시간 동안 로컬에서만 실행되므로, 아무것도 클라우드로 이동하지 않습니다. Remote Control을 사용하면 다음이 가능합니다:

* **전체 로컬 환경을 원격으로 사용**: 파일 시스템, [MCP 서버](/mcp), 도구, 프로젝트 설정이 모두 유지됩니다
* **두 기기에서 동시에 작업**: 대화가 연결된 모든 기기에서 동기화되므로 터미널, 브라우저, 전화기에서 번갈아가며 메시지를 보낼 수 있습니다
* **중단에서 복구**: 노트북이 절전 상태가 되거나 네트워크가 끊겨도, 머신이 다시 온라인 상태가 되면 세션이 자동으로 재연결됩니다

클라우드 인프라에서 실행되는 [웹의 Claude Code](/claude-code-on-the-web)와 달리, Remote Control 세션은 사용자의 로컬 머신에서 직접 실행되어 로컬 파일 시스템과 상호작용합니다. 웹 및 모바일 인터페이스는 해당 로컬 세션을 보는 창일 뿐입니다.

::: info
Remote Control은 Claude Code v2.1.51 이상이 필요합니다. `claude --version`으로 버전을 확인하세요.
:::

이 페이지에서는 설정 방법, 세션 시작 및 연결 방법, Remote Control과 웹의 Claude Code의 차이점을 설명합니다.

## 요구 사항

Remote Control을 사용하기 전에 환경이 다음 조건을 충족하는지 확인하세요:

* **구독**: Pro, Max, Team, Enterprise 플랜에서 사용 가능합니다. API 키는 지원되지 않습니다. Team 및 Enterprise 플랜에서는 관리자가 먼저 [Claude Code 관리자 설정](https://claude.ai/admin-settings/claude-code)에서 Remote Control 토글을 활성화해야 합니다.
* **인증**: `claude`를 실행하고 `/login`을 사용하여 아직 로그인하지 않았다면 claude.ai를 통해 로그인하세요.
* **워크스페이스 신뢰**: 프로젝트 디렉토리에서 `claude`를 최소 한 번 실행하여 워크스페이스 신뢰 대화상자에 동의하세요.

## Remote Control 세션 시작하기

Remote Control 세션은 CLI 또는 VS Code 익스텐션에서 시작할 수 있습니다. CLI는 세 가지 호출 모드를 제공하며, VS Code는 `/remote-control` 명령을 사용합니다.

::: code-group

```bash [서버 모드]
# 프로젝트 디렉토리로 이동 후 실행:
claude remote-control
```

:::

**서버 모드**: 프로젝트 디렉토리로 이동하여 다음을 실행합니다:

```bash
claude remote-control
```

이 프로세스는 서버 모드로 터미널에서 실행 상태를 유지하며 원격 연결을 기다립니다. [다른 기기에서 연결](#다른-기기에서-연결하기)하는 데 사용할 수 있는 세션 URL을 표시하며, 스페이스바를 누르면 전화기에서 빠르게 접근할 수 있는 QR 코드를 표시합니다. 원격 세션이 활성화된 동안 터미널은 연결 상태와 도구 활동을 표시합니다.

사용 가능한 플래그:

| 플래그 | 설명 |
| ------- | ---- |
| `--name "My Project"` | claude.ai/code의 세션 목록에 표시되는 사용자 지정 세션 제목을 설정합니다. |
| `--remote-control-session-name-prefix <prefix>` | 명시적인 이름이 설정되지 않았을 때 자동 생성된 세션 이름의 접두사입니다. 기본값은 머신의 호스트명이며 `myhost-graceful-unicorn`과 같은 이름을 생성합니다. 동일한 효과를 위해 `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX`를 설정할 수 있습니다. |
| `--spawn <mode>` | 서버가 세션을 생성하는 방식입니다.<br />• `same-dir` (기본값): 모든 세션이 현재 작업 디렉토리를 공유하므로 동일한 파일을 편집할 경우 충돌이 발생할 수 있습니다.<br />• `worktree`: 각 온디맨드 세션은 자체 [git worktree](/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)를 가집니다. git 저장소가 필요합니다.<br />• `session`: 단일 세션 모드입니다. 정확히 하나의 세션만 제공하고 추가 연결을 거부합니다. 시작 시에만 설정 가능합니다.<br />런타임에 `w`를 눌러 `same-dir`과 `worktree` 사이를 전환합니다. |
| `--capacity <N>` | 최대 동시 세션 수입니다. 기본값은 32입니다. `--spawn=session`과 함께 사용할 수 없습니다. |
| `--verbose` | 상세한 연결 및 세션 로그를 표시합니다. |
| `--sandbox` / `--no-sandbox` | 파일 시스템 및 네트워크 격리를 위한 [샌드박싱](/sandboxing)을 활성화하거나 비활성화합니다. 기본적으로 비활성화되어 있습니다. |

**대화형 세션**: Remote Control이 활성화된 일반 대화형 Claude Code 세션을 시작하려면 `--remote-control` 플래그(또는 `--rc`)를 사용하세요:

```bash
claude --remote-control
```

세션 이름을 선택적으로 전달할 수 있습니다:

```bash
claude --remote-control "My Project"
```

이를 통해 터미널에서 완전한 대화형 세션을 사용하면서 claude.ai나 Claude 앱에서도 제어할 수 있습니다. 서버 모드의 `claude remote-control`과 달리, 세션이 원격으로도 사용 가능한 동안 로컬에서 메시지를 입력할 수 있습니다.

**기존 세션에서**: 이미 Claude Code 세션에 있고 원격으로 계속하려면 `/remote-control`(또는 `/rc`) 명령을 사용하세요:

```text
/remote-control
```

사용자 지정 세션 제목을 설정하려면 인수로 이름을 전달하세요:

```text
/remote-control My Project
```

이는 현재 대화 기록을 이어받아 Remote Control 세션을 시작하고, [다른 기기에서 연결](#다른-기기에서-연결하기)하는 데 사용할 수 있는 세션 URL과 QR 코드를 표시합니다. `--verbose`, `--sandbox`, `--no-sandbox` 플래그는 이 명령과 함께 사용할 수 없습니다.

**VS Code**: [Claude Code VS Code 익스텐션](/vs-code)에서 프롬프트 상자에 `/remote-control` 또는 `/rc`를 입력하거나, `/`로 명령 메뉴를 열고 선택하세요. Claude Code v2.1.79 이상이 필요합니다.

```text
/remote-control
```

프롬프트 상자 위에 연결 상태를 보여주는 배너가 나타납니다. 연결되면 배너에서 **브라우저에서 열기**를 클릭하여 세션으로 직접 이동하거나 [claude.ai/code](https://claude.ai/code)의 세션 목록에서 찾을 수 있습니다. 세션 URL도 대화에 게시됩니다.

연결을 해제하려면 배너의 닫기 아이콘을 클릭하거나 `/remote-control`을 다시 실행하세요.

CLI와 달리, VS Code 명령은 이름 인수를 허용하거나 QR 코드를 표시하지 않습니다. 세션 제목은 대화 기록이나 첫 번째 프롬프트에서 파생됩니다.

### 다른 기기에서 연결하기

Remote Control 세션이 활성화되면 다른 기기에서 연결하는 몇 가지 방법이 있습니다:

* **세션 URL 열기**: 모든 브라우저에서 세션 URL을 열어 [claude.ai/code](https://claude.ai/code)의 세션으로 직접 이동합니다.
* **QR 코드 스캔**: 세션 URL 옆에 표시된 QR 코드를 스캔하여 Claude 앱에서 직접 열 수 있습니다. `claude remote-control`에서 스페이스바를 눌러 QR 코드 표시를 전환하세요.
* **[claude.ai/code](https://claude.ai/code) 또는 Claude 앱 열기**: 세션 목록에서 이름으로 세션을 찾으세요. Remote Control 세션은 온라인일 때 초록색 상태 점이 있는 컴퓨터 아이콘을 표시합니다.

원격 세션 제목은 다음 순서로 선택됩니다:

1. `--name`, `--remote-control`, 또는 `/remote-control`에 전달한 이름
2. `/rename`으로 설정한 제목
3. 기존 대화 기록의 마지막 의미 있는 메시지
4. `myhost-graceful-unicorn`과 같은 자동 생성 이름 (여기서 `myhost`는 머신의 호스트명이거나 `--remote-control-session-name-prefix`로 설정한 접두사)

명시적인 이름을 설정하지 않은 경우, 프롬프트를 전송하면 제목이 업데이트됩니다.

환경에 이미 활성 세션이 있는 경우, 계속할지 새로 시작할지 묻는 메시지가 표시됩니다.

아직 Claude 앱이 없다면, Claude Code 내에서 `/mobile` 명령을 사용하여 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 또는 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) 다운로드 QR 코드를 표시하세요.

### 모든 세션에 Remote Control 활성화하기

기본적으로 Remote Control은 `claude remote-control`, `claude --remote-control`, 또는 `/remote-control`을 명시적으로 실행할 때만 활성화됩니다. 모든 대화형 세션에서 자동으로 활성화하려면 Claude Code 내에서 `/config`를 실행하고 **모든 세션에 Remote Control 활성화**를 `true`로 설정하세요. 비활성화하려면 `false`로 되돌리세요.

이 설정이 켜져 있으면, 각 대화형 Claude Code 프로세스가 하나의 원격 세션을 등록합니다. 여러 인스턴스를 실행하면 각각 자체 환경과 세션을 가집니다. 단일 프로세스에서 여러 동시 세션을 실행하려면 [서버 모드](#remote-control-세션-시작하기)를 사용하세요.

## 연결 및 보안

로컬 Claude Code 세션은 아웃바운드 HTTPS 요청만 수행하며 머신에서 인바운드 포트를 열지 않습니다. Remote Control을 시작하면 Anthropic API에 등록하고 작업을 폴링합니다. 다른 기기에서 연결하면, 서버는 스트리밍 연결을 통해 웹 또는 모바일 클라이언트와 로컬 세션 사이에서 메시지를 라우팅합니다.

모든 트래픽은 TLS를 통해 Anthropic API를 통과하며, 이는 모든 Claude Code 세션과 동일한 전송 보안입니다. 연결은 각각 단일 목적으로 범위가 지정되고 독립적으로 만료되는 여러 단기 자격 증명을 사용합니다.

## Remote Control vs 웹의 Claude Code

Remote Control과 [웹의 Claude Code](/claude-code-on-the-web)는 모두 claude.ai/code 인터페이스를 사용합니다. 핵심 차이점은 세션이 실행되는 위치입니다: Remote Control은 사용자의 로컬 머신에서 실행되므로, 로컬 MCP 서버, 도구, 프로젝트 설정이 계속 사용 가능합니다. 웹의 Claude Code는 Anthropic이 관리하는 클라우드 인프라에서 실행됩니다.

로컬 작업 중에 다른 기기에서 계속 작업하려면 Remote Control을 사용하세요. 로컬 설정 없이 작업을 시작하거나, 클론하지 않은 저장소에서 작업하거나, 여러 작업을 병렬로 실행하려면 웹의 Claude Code를 사용하세요.

## 제한 사항

* **대화형 프로세스당 하나의 원격 세션**: 서버 모드 외에서는, 각 Claude Code 인스턴스가 한 번에 하나의 원격 세션만 지원합니다. 단일 프로세스에서 여러 동시 세션을 실행하려면 [서버 모드](#remote-control-세션-시작하기)를 사용하세요.
* **로컬 프로세스가 계속 실행되어야 함**: Remote Control은 로컬 프로세스로 실행됩니다. 터미널을 닫거나 VS Code를 종료하거나 `claude` 프로세스를 중지하면 세션이 종료됩니다.
* **장시간 네트워크 중단**: 머신이 깨어 있지만 약 10분 이상 네트워크에 연결할 수 없는 경우, 세션이 타임아웃되고 프로세스가 종료됩니다. `claude remote-control`을 다시 실행하여 새 세션을 시작하세요.
* **Ultraplan이 Remote Control 연결 해제**: [ultraplan](/ultraplan) 세션을 시작하면 활성 Remote Control 세션이 연결 해제됩니다. 두 기능 모두 claude.ai/code 인터페이스를 차지하므로 동시에 하나만 연결할 수 있습니다.

## 문제 해결

### "Remote Control requires a claude.ai subscription"

claude.ai 계정으로 인증되지 않았습니다. `claude auth login`을 실행하고 claude.ai 옵션을 선택하세요. 환경에 `ANTHROPIC_API_KEY`가 설정되어 있다면 먼저 해제하세요.

### "Remote Control requires a full-scope login token"

`claude setup-token` 또는 `CLAUDE_CODE_OAUTH_TOKEN` 환경 변수의 장기 토큰으로 인증되었습니다. 이 토큰은 추론 전용으로 제한되어 있으며 Remote Control 세션을 설정할 수 없습니다. `claude auth login`을 실행하여 전체 범위의 세션 토큰으로 인증하세요.

### "Unable to determine your organization for Remote Control eligibility"

캐시된 계정 정보가 오래되었거나 불완전합니다. `claude auth login`을 실행하여 갱신하세요.

### "Remote Control is not yet enabled for your account"

특정 환경 변수가 있을 때 적격성 확인이 실패할 수 있습니다:

* `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 또는 `DISABLE_TELEMETRY`: 설정을 해제하고 다시 시도하세요.
* `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, 또는 `CLAUDE_CODE_USE_FOUNDRY`: Remote Control은 claude.ai 인증이 필요하며 서드파티 공급자와는 작동하지 않습니다.

이 중 아무것도 설정되지 않은 경우, `/logout`한 다음 `/login`을 실행하여 갱신하세요.

### "Remote Control is disabled by your organization's policy"

이 오류는 세 가지 원인이 있습니다. 먼저 `/status`를 실행하여 사용 중인 로그인 방법과 구독을 확인하세요.

* **API 키나 Console 계정으로 인증됨**: Remote Control은 claude.ai OAuth가 필요합니다. `/login`을 실행하고 claude.ai 옵션을 선택하세요. 환경에 `ANTHROPIC_API_KEY`가 설정되어 있다면 해제하세요.
* **Team 또는 Enterprise 관리자가 활성화하지 않음**: Remote Control은 이 플랜에서 기본적으로 비활성화되어 있습니다. 관리자가 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)에서 **Remote Control** 토글을 켜서 활성화할 수 있습니다. 이는 [관리되는 설정](/permissions#managed-only-settings) 키가 아닌 서버 측 조직 설정입니다.
* **관리자 토글이 회색으로 표시됨**: 조직에 Remote Control과 호환되지 않는 데이터 보존 또는 규정 준수 설정이 있습니다. 관리자 패널에서 변경할 수 없습니다. 옵션을 논의하려면 Anthropic 지원에 문의하세요.

### "Remote credentials fetch failed"

Claude Code가 연결을 설정하기 위해 Anthropic API에서 단기 자격 증명을 가져올 수 없었습니다. `--verbose`와 함께 다시 실행하여 전체 오류를 확인하세요:

```bash
claude remote-control --verbose
```

일반적인 원인:

* 로그인하지 않음: `claude`를 실행하고 `/login`을 사용하여 claude.ai 계정으로 인증하세요. API 키 인증은 Remote Control에서 지원되지 않습니다.
* 네트워크 또는 프록시 문제: 방화벽이나 프록시가 아웃바운드 HTTPS 요청을 차단할 수 있습니다. Remote Control은 포트 443에서 Anthropic API에 접근해야 합니다.
* 세션 생성 실패: `Session creation failed — see debug log`도 표시된다면 설정의 초기 단계에서 실패한 것입니다. 구독이 활성화되어 있는지 확인하세요.

## 올바른 접근 방식 선택하기

Claude Code는 터미널에 없을 때 작업하는 여러 방법을 제공합니다. 작업을 트리거하는 방법, Claude가 실행되는 위치, 필요한 설정이 다릅니다.

|  | 트리거 | Claude 실행 위치 | 설정 | 최적 사용 사례 |
| :--- | :--- | :--- | :--- | :--- |
| [Dispatch](/desktop#sessions-from-dispatch) | Claude 모바일 앱에서 작업 메시지 전송 | 사용자의 머신 (Desktop) | [모바일 앱과 Desktop 페어링](https://support.claude.com/en/articles/13947068) | 자리를 비웠을 때 작업 위임, 최소 설정 |
| [Remote Control](/remote-control) | [claude.ai/code](https://claude.ai/code) 또는 Claude 모바일 앱에서 실행 중인 세션 제어 | 사용자의 머신 (CLI 또는 VS Code) | `claude remote-control` 실행 | 다른 기기에서 진행 중인 작업 제어 |
| [Channels](/channels) | Telegram, Discord 같은 채팅 앱이나 자체 서버에서 이벤트 푸시 | 사용자의 머신 (CLI) | [채널 플러그인 설치](/channels#quickstart) 또는 [직접 빌드](/channels-reference) | CI 실패나 채팅 메시지 같은 외부 이벤트에 반응 |
| [Slack](/slack) | 팀 채널에서 `@Claude` 언급 | Anthropic 클라우드 | [웹의 Claude Code](/claude-code-on-the-web) 활성화로 [Slack 앱 설치](/slack#setting-up-claude-code-in-slack) | 팀 채팅에서 PR 및 리뷰 |
| [예약 작업](/scheduled-tasks) | 일정 설정 | [CLI](/scheduled-tasks), [Desktop](/desktop-scheduled-tasks), 또는 [클라우드](/web-scheduled-tasks) | 빈도 선택 | 일일 리뷰 같은 반복 자동화 |

## 관련 리소스

* [웹의 Claude Code](/claude-code-on-the-web): 로컬 머신 대신 Anthropic이 관리하는 클라우드 환경에서 세션 실행
* [Ultraplan](/ultraplan): 터미널에서 클라우드 계획 세션을 시작하고 브라우저에서 계획 검토
* [Channels](/channels): Telegram, Discord, 또는 iMessage를 세션으로 전달하여 자리를 비운 동안 Claude가 메시지에 반응
* [Dispatch](/desktop#sessions-from-dispatch): 전화기에서 작업을 메시지로 전송하면 Desktop 세션이 처리
* [인증](/authentication): `/login` 설정 및 claude.ai 자격 증명 관리
* [CLI 참조](/cli-reference): `claude remote-control`을 포함한 전체 플래그 및 명령 목록
* [보안](/security): Remote Control 세션이 Claude Code 보안 모델에 맞는 방식
* [데이터 사용](/data-usage): 로컬 및 원격 세션 중 Anthropic API를 통해 흐르는 데이터
