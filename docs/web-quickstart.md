---
title: 웹에서 Claude Code 시작하기
description: 브라우저나 휴대폰에서 클라우드로 Claude Code를 실행하세요. GitHub 저장소를 연결하고 작업을 제출한 뒤, 로컬 설정 없이 PR을 검토할 수 있습니다.
---

# 웹에서 Claude Code 시작하기

> 브라우저나 휴대폰에서 클라우드로 Claude Code를 실행하세요. GitHub 저장소를 연결하고 작업을 제출한 뒤, 로컬 설정 없이 PR을 검토할 수 있습니다.

:::info
웹에서의 Claude Code는 Pro, Max, Team 사용자와 프리미엄 시트 또는 Chat + Claude Code 시트를 보유한 Enterprise 사용자를 대상으로 리서치 프리뷰 중입니다.
:::

웹에서의 Claude Code는 사용자 머신이 아닌 Anthropic이 관리하는 클라우드 인프라에서 실행됩니다. 브라우저의 [claude.ai/code](https://claude.ai/code) 또는 Claude 모바일 앱에서 작업을 제출하세요.

시작하려면 GitHub 저장소가 필요합니다. Claude는 이를 격리된 가상 머신에 클론하고, 변경 사항을 만들어 검토할 브랜치를 푸시합니다. 세션은 기기 간에 유지되므로, 노트북에서 시작한 작업을 나중에 휴대폰에서 검토할 수 있습니다.

웹에서의 Claude Code는 다음 상황에 적합합니다:

* **병렬 작업**: 여러 독립적인 작업을 동시에 실행하되, 각각 별도의 세션과 브랜치에서 worktree 관리 없이 진행
* **로컬에 없는 저장소**: Claude가 매 세션마다 저장소를 새로 클론하므로, 로컬에 체크아웃할 필요 없음
* **자주 방향을 조정하지 않아도 되는 작업**: 명확하게 정의된 작업을 제출하고, 다른 일을 하다가 Claude가 완료되면 결과 검토
* **코드 질문 및 탐색**: 로컬 체크아웃 없이 코드베이스를 이해하거나 기능이 어떻게 구현되었는지 추적

로컬 설정, 도구, 환경이 필요한 작업에는 Claude Code를 로컬에서 실행하거나 [Remote Control](/remote-control)을 사용하는 것이 더 적합합니다.

## 세션 실행 방식

작업을 제출하면:

1. **클론 및 준비**: 저장소가 Anthropic 관리 VM에 클론되고, 설정된 경우 [설정 스크립트](/claude-code-on-the-web#setup-scripts)가 실행됩니다.
2. **네트워크 구성**: 환경의 [액세스 수준](/claude-code-on-the-web#access-levels)에 따라 인터넷 접근이 설정됩니다.
3. **작업 진행**: Claude가 코드를 분석하고, 변경 사항을 만들고, 테스트를 실행하며 결과를 확인합니다. 진행 상황을 직접 지켜보며 방향을 조정하거나, 완료될 때까지 자리를 비울 수도 있습니다.
4. **브랜치 푸시**: Claude가 중단점에 도달하면 브랜치를 GitHub에 푸시합니다. diff를 검토하고, 인라인 댓글을 남기고, PR을 생성하거나, 메시지를 추가로 보내 계속 진행할 수 있습니다.

브랜치가 푸시되어도 세션은 종료되지 않습니다. PR 생성 및 추가 수정은 모두 동일한 대화 내에서 이루어집니다.

## Claude Code 실행 방식 비교

Claude Code는 어디서나 동일하게 동작합니다. 달라지는 것은 코드가 실행되는 위치와 로컬 설정의 사용 가능 여부입니다. Desktop 앱은 로컬 세션과 클라우드 세션 모두를 제공하므로, 아래 답변은 선택하는 유형에 따라 달라집니다:

|                                              | 웹                                                                                                               | Remote Control               | 터미널 CLI             | Desktop 앱                  |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :--------------------------- | :--------------------- | :-------------------------- |
| **코드 실행 위치**                           | Anthropic 클라우드 VM                                                                                            | 사용자 머신                  | 사용자 머신            | 사용자 머신 또는 클라우드 VM |
| **채팅 위치**                                | claude.ai 또는 모바일 앱                                                                                         | claude.ai 또는 모바일 앱     | 터미널                 | Desktop UI                  |
| **로컬 설정 사용**                           | 아니요, 저장소만                                                                                                 | 예                           | 예                     | 로컬은 예, 클라우드는 아니요 |
| **GitHub 필요**                              | 예, 또는 `--remote`로 [로컬 저장소 번들링](/claude-code-on-the-web#send-local-repositories-without-github) 가능 | 아니요                       | 아니요                 | 클라우드 세션만 필요         |
| **연결 해제 후에도 계속 실행**               | 예                                                                                                               | 터미널이 열려 있는 동안       | 아니요                 | 세션 유형에 따라 다름        |
| **[권한 모드](/permission-modes)**           | 편집 자동 수락, Plan                                                                                             | 요청, 편집 자동 수락, Plan   | 전체 모드              | 세션 유형에 따라 다름        |
| **네트워크 접근**                            | 환경별 설정 가능                                                                                                 | 사용자 머신 네트워크          | 사용자 머신 네트워크   | 세션 유형에 따라 다름        |

터미널 설정은 [터미널 빠른 시작](/quickstart), Desktop 앱은 [Desktop](/desktop), Remote Control은 [Remote Control](/remote-control) 문서를 참조하세요.

## GitHub 연결 및 환경 생성

설정은 한 번만 하면 됩니다. 이미 GitHub CLI를 사용 중이라면 브라우저 대신 [터미널에서 연결](#connect-from-your-terminal)할 수 있습니다.

**1단계: claude.ai/code 방문**

[claude.ai/code](https://claude.ai/code)로 이동하여 Anthropic 계정으로 로그인하세요.

**2단계: Claude GitHub App 설치**

로그인 후, claude.ai/code에서 GitHub 연결을 안내합니다. 프롬프트를 따라 Claude GitHub App을 설치하고 저장소에 대한 접근 권한을 부여하세요. 클라우드 세션은 기존 GitHub 저장소에서 작동하므로, 새 프로젝트를 시작하려면 먼저 [GitHub에서 빈 저장소를 생성](https://github.com/new)하세요.

**3단계: 환경 생성**

GitHub 연결 후, 클라우드 환경 생성 안내가 표시됩니다. 환경은 세션 중 Claude의 네트워크 접근 권한과 새 세션 생성 시 실행할 내용을 제어합니다. 별도 설정 없이 사용 가능한 항목은 [설치된 도구](/claude-code-on-the-web#installed-tools)를 참조하세요.

양식에는 다음 필드가 있습니다:

* **Name**: 표시용 레이블. 다양한 프로젝트나 액세스 수준에 대해 여러 환경이 있을 때 유용합니다.
* **Network access**: 세션이 인터넷에서 접근할 수 있는 범위를 제어합니다. 기본값인 `Trusted`는 npm, PyPI, RubyGems 등 [일반적인 패키지 레지스트리](/claude-code-on-the-web#default-allowed-domains)에 대한 연결을 허용하면서 일반 인터넷 접근은 차단합니다.
* **Environment variables**: 모든 세션에서 사용 가능한 선택적 변수로, `.env` 형식입니다. 값을 따옴표로 감싸지 마세요. 따옴표도 값의 일부로 저장됩니다. 이 환경을 편집할 수 있는 사람이라면 누구나 볼 수 있습니다.
* **Setup script**: 새 세션 생성 시 Claude Code가 실행되기 전에 실행되는 선택적 Bash 스크립트입니다. `apt install -y gh`와 같이 클라우드 VM에 포함되지 않은 시스템 도구를 설치하거나, 프로젝트에 필요한 서비스를 시작하는 데 사용합니다. 예시 및 디버깅 팁은 [설정 스크립트](/claude-code-on-the-web#setup-scripts)를 참조하세요.

처음 프로젝트라면 기본값을 유지하고 **Create environment**를 클릭하세요. 이후 [환경을 편집하거나 추가 환경을 생성](/claude-code-on-the-web#configure-your-environment)할 수 있습니다.

### 터미널에서 연결 {#connect-from-your-terminal}

이미 GitHub CLI(`gh`)를 사용 중이라면 브라우저를 열지 않고 웹에서의 Claude Code를 설정할 수 있습니다. [Claude Code CLI](/quickstart)가 필요합니다. `/web-setup`은 로컬 `gh` 토큰을 읽어 Claude 계정과 연결하고, 환경이 없는 경우 기본 클라우드 환경을 생성합니다.

:::info
[Zero Data Retention](/zero-data-retention)이 활성화된 조직은 `/web-setup` 또는 다른 클라우드 세션 기능을 사용할 수 없습니다. GitHub CLI가 설치되어 있지 않거나 인증되지 않은 경우, `/web-setup`은 브라우저 온보딩 흐름을 엽니다.
:::

**1단계: GitHub CLI로 인증**

아직 인증하지 않았다면 셸에서 GitHub CLI를 인증하세요:

```bash
gh auth login
```

**2단계: Claude에 로그인**

Claude Code CLI에서 `/login`을 실행하여 claude.ai 계정으로 로그인하세요. 이미 로그인되어 있다면 이 단계를 건너뜁니다.

**3단계: /web-setup 실행**

Claude Code CLI에서 다음을 실행하세요:

```text
/web-setup
```

이 명령은 `gh` 토큰을 Claude 계정과 동기화합니다. 클라우드 환경이 없는 경우, `/web-setup`은 Trusted 네트워크 접근과 설정 스크립트 없이 환경을 생성합니다. 이후 [환경을 편집하거나 변수를 추가](/claude-code-on-the-web#configure-your-environment)할 수 있습니다. `/web-setup` 완료 후, [`--remote`](/claude-code-on-the-web#from-terminal-to-web)로 터미널에서 클라우드 세션을 시작하거나 [`/schedule`](/web-scheduled-tasks)로 반복 작업을 설정할 수 있습니다.

## 작업 시작

GitHub가 연결되고 환경이 생성되면 작업을 제출할 준비가 된 것입니다.

**1단계: 저장소 및 브랜치 선택**

[claude.ai/code](https://claude.ai/code) 또는 Claude 모바일 앱의 Code 탭에서 입력 상자 아래의 저장소 선택기를 클릭하고 Claude가 작업할 저장소를 선택하세요. 각 저장소에는 브랜치 선택기가 표시됩니다. 기본값 대신 기능 브랜치에서 Claude를 시작하려면 변경하세요. 하나의 세션에서 여러 저장소에 걸쳐 작업하려면 저장소를 여러 개 추가할 수 있습니다.

**2단계: 권한 모드 선택**

입력 옆의 모드 드롭다운은 기본적으로 **Auto accept edits**로 설정되어 있으며, Claude가 승인 없이 변경 사항을 만들고 브랜치를 푸시합니다. 파일 수정 전에 Claude가 접근 방식을 제안하고 확인을 기다리도록 하려면 **Plan mode**로 전환하세요. 클라우드 세션은 Ask 권한, Auto 모드, Bypass 권한을 제공하지 않습니다. 전체 목록은 [권한 모드](/permission-modes)를 참조하세요.

**3단계: 작업 설명 및 제출**

원하는 내용을 입력하고 Enter를 누르세요. 구체적으로 작성하세요:

* 파일이나 함수 이름을 명시하세요: "설정 지침이 포함된 README 추가" 또는 "`tests/test_auth.py`의 실패하는 인증 테스트 수정"이 "테스트 수정"보다 낫습니다.
* 오류 출력이 있다면 붙여넣으세요.
* 증상만이 아닌 예상 동작을 설명하세요.

Claude가 저장소를 클론하고, 설정 스크립트가 있으면 실행한 뒤 작업을 시작합니다. 각 작업은 별도의 세션과 브랜치를 갖으므로, 하나가 완료될 때까지 기다리지 않고 다른 작업을 시작할 수 있습니다.

## 검토 및 반복

Claude가 완료되면 변경 사항을 검토하고, 특정 라인에 피드백을 남기고, diff가 올바르게 보일 때까지 계속 진행하세요.

**1단계: diff 뷰 열기**

diff 표시기에는 세션 전체에서 추가 및 삭제된 라인이 표시됩니다(예: `+42 -18`). 이를 선택하면 왼쪽에 파일 목록이, 오른쪽에 변경 사항이 있는 diff 뷰가 열립니다.

**2단계: 인라인 댓글 남기기**

diff에서 라인을 선택하고, 피드백을 입력한 뒤 Enter를 누르세요. 댓글은 다음 메시지를 보낼 때까지 대기했다가 함께 전달됩니다. Claude는 메인 지시사항과 함께 "`src/auth.ts:47`에서 오류를 여기서 잡지 마세요"라는 내용을 보게 되므로, 문제의 위치를 별도로 설명할 필요가 없습니다.

**3단계: 풀 리퀘스트 생성**

diff가 올바르게 보이면 diff 뷰 상단의 **Create PR**을 선택하세요. 전체 PR, 드래프트로 열거나, 생성된 제목과 설명이 포함된 GitHub 작성 페이지로 이동할 수 있습니다.

**4단계: PR 이후에도 반복**

세션은 PR이 생성된 후에도 활성 상태를 유지합니다. CI 실패 출력이나 리뷰어 댓글을 채팅에 붙여넣고 Claude에게 처리를 요청하세요. Claude가 PR을 자동으로 모니터링하도록 하려면 [Auto-fix pull requests](/claude-code-on-the-web#auto-fix-pull-requests)를 참조하세요.

## 설정 문제 해결

### GitHub 연결 후 저장소가 표시되지 않는 경우

Claude GitHub App은 사용하려는 각 저장소에 대해 명시적인 접근 권한이 필요합니다. github.com에서 **Settings → Applications → Claude → Configure**를 열고 **Repository access** 아래에 저장소가 나열되어 있는지 확인하세요. 비공개 저장소도 공개 저장소와 동일한 인증이 필요합니다.

### 페이지에 GitHub 로그인 버튼만 표시되는 경우

클라우드 세션에는 연결된 GitHub 계정이 필요합니다. 위의 브라우저 흐름으로 연결하거나, GitHub CLI를 사용한다면 터미널에서 `/web-setup`을 실행하세요. GitHub 연결을 원하지 않는다면 [Remote Control](/remote-control)을 참조하여 Claude Code를 자신의 머신에서 실행하고 웹에서 모니터링하세요.

### "Not available for the selected organization"

Enterprise 조직은 관리자가 웹에서의 Claude Code를 활성화해야 할 수 있습니다. Anthropic 계정 팀에 문의하세요.

### `/web-setup`이 "Unknown command"를 반환하는 경우

`/web-setup`은 셸이 아닌 Claude Code CLI 내에서 실행합니다. 먼저 `claude`를 실행한 다음 프롬프트에서 `/web-setup`을 입력하세요.

Claude Code 내에서 입력했는데도 오류가 표시된다면, CLI가 v2.1.80보다 오래되었거나 claude.ai 구독 대신 API 키 또는 서드파티 공급자로 인증된 것입니다. `claude update`를 실행한 후 `/login`으로 claude.ai 계정에 로그인하세요.

### `--remote` 또는 ultraplan 사용 시 "Could not create a cloud environment" 또는 "No cloud environment available"

원격 세션 기능은 환경이 없는 경우 기본 클라우드 환경을 자동으로 생성합니다. "Could not create a cloud environment"가 표시되면 자동 생성에 실패한 것입니다. "No cloud environment available"이 표시되면 CLI가 자동 생성 이전 버전입니다. 어느 경우든 Claude Code CLI에서 `/web-setup`을 실행하여 수동으로 생성하거나, [claude.ai/code](https://claude.ai/code)를 방문하여 위의 **환경 생성** 단계를 따르세요.

### 설정 스크립트 실패

설정 스크립트가 0이 아닌 상태 코드로 종료되어 세션 시작이 차단됩니다. 일반적인 원인:

* 레지스트리가 [네트워크 액세스 수준](/claude-code-on-the-web#access-levels)에 포함되지 않아 패키지 설치에 실패한 경우. `Trusted`는 대부분의 패키지 관리자를 지원하며, `None`은 모두 차단합니다.
* 스크립트가 새 클론에 존재하지 않는 파일 또는 경로를 참조하는 경우.
* 로컬에서 작동하는 명령이 Ubuntu에서는 다른 방식으로 호출해야 하는 경우.

디버깅하려면 스크립트 상단에 `set -x`를 추가하여 실패한 명령을 확인하세요. 중요하지 않은 명령에는 `|| true`를 추가하여 세션 시작을 차단하지 않도록 하세요.

### 탭을 닫아도 세션이 계속 실행되는 경우

이것은 의도된 동작입니다. 탭을 닫거나 다른 페이지로 이동해도 세션이 중지되지 않습니다. Claude가 현재 작업을 완료할 때까지 백그라운드에서 계속 실행된 후 유휴 상태가 됩니다. 사이드바에서 세션을 [아카이브](/claude-code-on-the-web#archive-sessions)하여 목록에서 숨기거나, [삭제](/claude-code-on-the-web#delete-sessions)하여 영구적으로 제거할 수 있습니다.

## 다음 단계

이제 작업 제출 및 검토가 가능합니다. 다음 페이지에서는 터미널에서 클라우드 세션 시작, 반복 작업 예약, Claude에게 지속적인 지시 사항 제공 방법을 다룹니다.

* [웹에서 Claude Code 사용](/claude-code-on-the-web): 터미널로 세션 전환, 설정 스크립트, 환경 변수, 네트워크 설정 등 전체 레퍼런스
* [웹에서 작업 예약](/web-scheduled-tasks): 일별 PR 검토, 의존성 감사 등 반복 작업 자동화
* [CLAUDE.md](/memory): 모든 세션 시작 시 로드되는 Claude의 지속적인 지시 사항 및 컨텍스트 제공
* Claude 모바일 앱을 설치하여 휴대폰에서 세션 모니터링: [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 또는 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude). Claude Code CLI에서 `/mobile`을 실행하면 QR 코드가 표시됩니다.
