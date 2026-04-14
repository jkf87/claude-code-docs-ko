---
title: Claude Code Desktop 사용하기
description: "Claude Code Desktop의 컴퓨터 사용, Dispatch 세션, 병렬 세션과 Git 격리, 비주얼 diff 리뷰, 앱 미리보기, PR 모니터링, 커넥터, 엔터프라이즈 설정 등 다양한 기능을 활용하세요."
---

# Claude Code Desktop 사용하기

> Claude Code Desktop의 컴퓨터 사용, 휴대폰에서 Dispatch 세션 전송, Git 격리를 통한 병렬 세션, 비주얼 diff 리뷰, 앱 미리보기, PR 모니터링, 커넥터, 엔터프라이즈 설정 등 다양한 기능을 활용하세요.

Claude Desktop 앱의 Code 탭을 사용하면 터미널 대신 그래픽 인터페이스를 통해 Claude Code를 사용할 수 있습니다.

Desktop은 표준 Claude Code 경험에 다음과 같은 기능을 추가합니다:

* [비주얼 diff 리뷰](#변경-사항을-diff-뷰로-리뷰하기) - 인라인 코멘트 지원
* [라이브 앱 미리보기](#앱-미리보기) - 개발 서버 연동
* [컴퓨터 사용](#claude가-컴퓨터를-사용하도록-허용) - macOS와 Windows에서 앱을 열고 화면 제어
* [GitHub PR 모니터링](#pull-request-상태-모니터링) - 자동 수정 및 자동 병합
* [병렬 세션](#세션으로-병렬-작업하기) - 자동 Git worktree 격리
* [Dispatch](#dispatch에서의-세션) 연동 - 휴대폰에서 작업을 보내고 여기서 세션 확인
* [예약 작업](/desktop-scheduled-tasks) - 반복 일정으로 Claude 실행
* [커넥터](#외부-도구-연결) - GitHub, Slack, Linear 등
* 로컬, [SSH](#ssh-세션), [클라우드](#원격에서-장시간-작업-실행) 환경

::: tip
Desktop이 처음이신가요? [시작하기](/desktop-quickstart)에서 앱 설치와 첫 편집 방법을 확인하세요.
:::

이 페이지에서는 [코드 작업](#코드-작업), [컴퓨터 사용](#claude가-컴퓨터를-사용하도록-허용), [세션 관리](#세션-관리), [Claude Code 확장](#claude-code-확장), [설정](#환경-설정)을 다룹니다. 또한 [CLI 비교](#cli에서-전환하기)와 [문제 해결](#문제-해결)도 포함되어 있습니다.

## 세션 시작하기

첫 메시지를 보내기 전에 프롬프트 영역에서 네 가지를 설정하세요:

* **환경**: Claude가 실행되는 위치를 선택합니다. **Local**은 내 컴퓨터, **Remote**는 Anthropic 호스팅 클라우드 세션, [**SSH 연결**](#ssh-세션)은 직접 관리하는 원격 머신입니다. [환경 설정](#환경-설정)을 참조하세요.
* **프로젝트 폴더**: Claude가 작업할 폴더 또는 리포지토리를 선택합니다. 원격 세션에서는 [여러 리포지토리](#원격에서-장시간-작업-실행)를 추가할 수 있습니다.
* **모델**: 전송 버튼 옆의 드롭다운에서 [모델](/model-config#available-models)을 선택합니다. 세션이 시작되면 모델은 고정됩니다.
* **권한 모드**: [모드 선택기](#권한-모드-선택)에서 Claude의 자율성 수준을 선택합니다. 세션 중에도 변경할 수 있습니다.

작업 내용을 입력하고 **Enter**를 눌러 시작하세요. 각 세션은 자체 컨텍스트와 변경 사항을 독립적으로 추적합니다.

## 코드 작업

Claude에게 적절한 컨텍스트를 제공하고, 자율성 수준을 제어하며, 변경 사항을 리뷰하세요.

### 프롬프트 박스 사용하기

Claude에게 원하는 작업을 입력하고 **Enter**를 눌러 전송합니다. Claude는 프로젝트 파일을 읽고, 변경하고, [권한 모드](#권한-모드-선택)에 따라 명령을 실행합니다. 언제든지 Claude를 중단할 수 있습니다: 중지 버튼을 클릭하거나 수정 사항을 입력하고 **Enter**를 누르세요. Claude는 하던 작업을 멈추고 입력에 따라 조정합니다.

프롬프트 박스 옆의 **+** 버튼으로 파일 첨부, [스킬](#스킬-사용), [커넥터](#외부-도구-연결), [플러그인](#플러그인-설치)에 접근할 수 있습니다.

### 프롬프트에 파일과 컨텍스트 추가하기

프롬프트 박스는 외부 컨텍스트를 가져오는 두 가지 방법을 지원합니다:

* **@멘션 파일**: `@` 뒤에 파일명을 입력하여 대화 컨텍스트에 파일을 추가합니다. Claude가 해당 파일을 읽고 참조할 수 있습니다. @멘션은 원격 세션에서는 사용할 수 없습니다.
* **파일 첨부**: 첨부 버튼을 사용하거나 파일을 프롬프트에 직접 드래그 앤 드롭하여 이미지, PDF 및 기타 파일을 첨부합니다. 버그 스크린샷, 디자인 목업, 참고 문서를 공유할 때 유용합니다.

### 권한 모드 선택

권한 모드는 세션 중 Claude의 자율성 수준을 제어합니다: 파일 편집, 명령 실행 또는 둘 다 수행하기 전에 확인을 요청할지 여부입니다. 전송 버튼 옆의 모드 선택기를 사용하여 언제든지 모드를 전환할 수 있습니다. Ask permissions로 시작하여 Claude가 정확히 무엇을 하는지 확인한 후, 익숙해지면 Auto accept edits나 Plan 모드로 전환하세요.

| 모드 | 설정 키 | 동작 |
| --- | --- | --- |
| **Ask permissions** | `default` | Claude가 파일 편집이나 명령 실행 전에 확인을 요청합니다. diff를 보고 각 변경을 수락하거나 거부할 수 있습니다. 새 사용자에게 권장됩니다. |
| **Auto accept edits** | `acceptEdits` | Claude가 파일 편집과 `mkdir`, `touch`, `mv` 같은 일반 파일시스템 명령을 자동 수락하지만, 다른 터미널 명령 실행 전에는 여전히 확인을 요청합니다. 파일 변경을 신뢰하고 빠른 반복을 원할 때 사용하세요. |
| **Plan mode** | `plan` | Claude가 파일을 읽고 명령을 실행하여 탐색한 후, 소스 코드를 편집하지 않고 계획을 제안합니다. 접근 방식을 먼저 검토하고 싶은 복잡한 작업에 적합합니다. |
| **Auto** | `auto` | Claude가 요청과의 일치를 확인하는 백그라운드 안전 검사와 함께 모든 작업을 실행합니다. 감독을 유지하면서 권한 프롬프트를 줄입니다. 현재 리서치 프리뷰입니다. Team, Enterprise, API 플랜에서 사용 가능합니다. Claude Sonnet 4.6 또는 Opus 4.6이 필요합니다. Settings → Claude Code에서 활성화하세요. |
| **Bypass permissions** | `bypassPermissions` | Claude가 권한 프롬프트 없이 실행됩니다. CLI의 `--dangerously-skip-permissions`와 동일합니다. Settings → Claude Code의 "Allow bypass permissions mode"에서 활성화하세요. 샌드박스 컨테이너나 VM에서만 사용하세요. 엔터프라이즈 관리자가 이 옵션을 비활성화할 수 있습니다. |

`dontAsk` 권한 모드는 [CLI](/permission-modes#allow-only-pre-approved-tools-with-dontask-mode)에서만 사용할 수 있습니다.

::: tip 모범 사례
복잡한 작업은 Plan 모드에서 시작하여 Claude가 변경하기 전에 접근 방식을 설계하도록 하세요. 계획을 승인한 후 Auto accept edits나 Ask permissions로 전환하여 실행하세요. 이 워크플로에 대한 자세한 내용은 [먼저 탐색하고, 계획하고, 코딩하기](/best-practices#explore-first-then-plan-then-code)를 참조하세요.
:::

원격 세션은 Auto accept edits와 Plan 모드를 지원합니다. Ask permissions는 원격 세션에서 기본적으로 파일 편집이 자동 수락되므로 사용할 수 없으며, Bypass permissions는 원격 환경이 이미 샌드박스되어 있으므로 사용할 수 없습니다.

엔터프라이즈 관리자는 사용 가능한 권한 모드를 제한할 수 있습니다. 자세한 내용은 [엔터프라이즈 설정](#엔터프라이즈-설정)을 참조하세요.

### 앱 미리보기

Claude는 개발 서버를 시작하고 내장 브라우저를 열어 변경 사항을 확인할 수 있습니다. 이는 프론트엔드 웹 앱뿐만 아니라 백엔드 서버에서도 작동합니다: Claude는 API 엔드포인트를 테스트하고, 서버 로그를 확인하고, 발견한 문제를 반복적으로 수정할 수 있습니다. 대부분의 경우 Claude는 프로젝트 파일을 편집한 후 자동으로 서버를 시작합니다. 언제든지 Claude에게 미리보기를 요청할 수도 있습니다. 기본적으로 Claude는 모든 편집 후 [변경 사항을 자동 검증](#변경-사항-자동-검증)합니다.

미리보기 패널에서 할 수 있는 작업:

* 내장 브라우저에서 실행 중인 앱과 직접 상호작용
* Claude가 자동으로 변경 사항을 검증하는 과정 관찰: 스크린샷 촬영, DOM 검사, 요소 클릭, 폼 작성, 발견된 문제 수정
* 세션 도구 모음의 **Preview** 드롭다운에서 서버 시작 또는 중지
* 드롭다운에서 **Persist sessions**를 선택하여 서버 재시작 시에도 쿠키와 로컬 스토리지 유지 - 개발 중 재로그인 불필요
* 서버 설정 편집 또는 모든 서버 한 번에 중지

Claude는 프로젝트를 기반으로 초기 서버 설정을 생성합니다. 앱이 사용자 정의 개발 명령을 사용하는 경우 `.claude/launch.json`을 수정하여 설정에 맞추세요. 전체 참조는 [미리보기 서버 설정](#미리보기-서버-설정)을 확인하세요.

저장된 세션 데이터를 지우려면 Settings → Claude Code에서 **Persist preview sessions**를 끄세요. 미리보기를 완전히 비활성화하려면 Settings → Claude Code에서 **Preview**를 끄세요.

### 변경 사항을 diff 뷰로 리뷰하기

Claude가 코드를 변경한 후, diff 뷰를 사용하여 pull request를 생성하기 전에 파일별로 수정 사항을 검토할 수 있습니다.

Claude가 파일을 변경하면 `+12 -1`과 같이 추가 및 삭제된 줄 수를 보여주는 diff 통계 표시기가 나타납니다. 이 표시기를 클릭하면 왼쪽에 파일 목록, 오른쪽에 각 파일의 변경 사항을 표시하는 diff 뷰어가 열립니다.

특정 줄에 코멘트를 달려면 diff에서 아무 줄이나 클릭하여 코멘트 박스를 엽니다. 피드백을 입력하고 **Enter**를 눌러 코멘트를 추가합니다. 여러 줄에 코멘트를 추가한 후 모든 코멘트를 한 번에 제출합니다:

* **macOS**: **Cmd+Enter** 누르기
* **Windows**: **Ctrl+Enter** 누르기

Claude는 코멘트를 읽고 요청된 변경을 수행하며, 새로운 diff로 리뷰할 수 있습니다.

### 코드 리뷰하기

diff 뷰에서 오른쪽 상단 도구 모음의 **Review code**를 클릭하여 커밋하기 전에 Claude에게 변경 사항을 평가하도록 요청합니다. Claude는 현재 diff를 검토하고 diff 뷰에 직접 코멘트를 남깁니다. 코멘트에 응답하거나 Claude에게 수정을 요청할 수 있습니다.

리뷰는 높은 중요도의 문제에 집중합니다: 컴파일 오류, 확실한 로직 오류, 보안 취약점, 명백한 버그. 스타일, 포매팅, 기존 문제, 린터가 감지할 수 있는 것은 표시하지 않습니다.

### Pull request 상태 모니터링

Pull request를 열면 세션에 CI 상태 바가 나타납니다. Claude Code는 GitHub CLI를 사용하여 체크 결과를 폴링하고 실패를 표시합니다.

* **Auto-fix**: 활성화하면 Claude가 자동으로 실패한 CI 체크를 수정합니다. 실패 출력을 읽고 반복적으로 수정합니다.
* **Auto-merge**: 활성화하면 모든 체크가 통과한 후 Claude가 PR을 병합합니다. 병합 방법은 squash입니다. 이 기능이 작동하려면 [GitHub 리포지토리 설정에서 Auto-merge를 활성화](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-auto-merge-for-pull-requests-in-your-repository)해야 합니다.

CI 상태 바의 **Auto-fix** 및 **Auto-merge** 토글을 사용하여 각 옵션을 활성화하세요. Claude Code는 CI가 완료되면 데스크톱 알림도 보냅니다.

::: info
PR 모니터링에는 [GitHub CLI (`gh`)](https://cli.github.com/)가 설치되고 인증되어 있어야 합니다. `gh`가 설치되어 있지 않으면 Desktop에서 PR을 처음 생성하려고 할 때 설치를 안내합니다.
:::

## Claude가 컴퓨터를 사용하도록 허용

컴퓨터 사용을 통해 Claude가 앱을 열고, 화면을 제어하고, 여러분이 하는 것처럼 컴퓨터에서 직접 작업할 수 있습니다. Claude에게 모바일 시뮬레이터에서 네이티브 앱 테스트, CLI가 없는 데스크톱 도구 조작, GUI를 통해서만 작동하는 작업 자동화 등을 요청하세요.

::: info
컴퓨터 사용은 Pro 또는 Max 플랜이 필요한 macOS 및 Windows의 리서치 프리뷰입니다. Team 또는 Enterprise 플랜에서는 사용할 수 없습니다. Claude Desktop 앱이 실행 중이어야 합니다.
:::

컴퓨터 사용은 기본적으로 꺼져 있습니다. Claude가 화면을 제어하기 전에 [Settings에서 활성화](#컴퓨터-사용-활성화)하세요. macOS에서는 접근성 및 화면 녹화 권한도 부여해야 합니다.

::: warning
[샌드박스된 Bash 도구](/sandboxing)와 달리 컴퓨터 사용은 승인한 모든 항목에 접근할 수 있는 실제 데스크톱에서 실행됩니다. Claude는 각 작업을 확인하고 화면 콘텐츠의 잠재적 프롬프트 인젝션을 표시하지만, 신뢰 경계가 다릅니다. 모범 사례는 [컴퓨터 사용 안전 가이드](https://support.claude.com/en/articles/14128542)를 참조하세요.
:::

### 컴퓨터 사용이 적용되는 경우

Claude는 앱이나 서비스와 상호작용하는 여러 방법을 가지고 있으며, 컴퓨터 사용은 가장 광범위하고 느린 방법입니다. 가장 정확한 도구를 먼저 시도합니다:

* 서비스에 대한 [커넥터](#외부-도구-연결)가 있으면 Claude는 커넥터를 사용합니다.
* 작업이 셸 명령이면 Claude는 Bash를 사용합니다.
* 작업이 브라우저 작업이고 [Claude in Chrome](/chrome)이 설정되어 있으면 Claude는 그것을 사용합니다.
* 위 어느 것도 해당하지 않으면 Claude는 컴퓨터 사용을 사용합니다.

[앱별 접근 수준](#앱-권한)이 이를 강화합니다: 브라우저는 보기 전용으로, 터미널과 IDE는 클릭 전용으로 제한되어 컴퓨터 사용이 활성화되어 있어도 Claude를 전용 도구로 유도합니다. 화면 제어는 네이티브 앱, 하드웨어 제어 패널, 모바일 시뮬레이터, API가 없는 독점 도구 등 다른 것으로는 접근할 수 없는 대상을 위해 예약되어 있습니다.

### 컴퓨터 사용 활성화

컴퓨터 사용은 기본적으로 꺼져 있습니다. 꺼져 있는 상태에서 Claude에게 컴퓨터 사용이 필요한 작업을 요청하면, Claude는 Settings에서 컴퓨터 사용을 활성화하면 해당 작업을 수행할 수 있다고 알려줍니다.

### 1. 데스크톱 앱 업데이트

최신 버전의 Claude Desktop을 사용하고 있는지 확인하세요. [claude.com/download](https://claude.com/download)에서 다운로드하거나 업데이트한 후 앱을 다시 시작하세요.

### 2. 토글 켜기

데스크톱 앱에서 **Settings > General** (Desktop app 아래)로 이동합니다. **Computer use** 토글을 찾아 켭니다. Windows에서는 토글이 즉시 적용되며 설정이 완료됩니다. macOS에서는 다음 단계로 계속하세요.

토글이 보이지 않으면 Pro 또는 Max 플랜의 macOS 또는 Windows인지 확인한 후 앱을 업데이트하고 다시 시작하세요.

### 3. macOS 권한 부여

macOS에서는 토글이 적용되기 전에 두 가지 시스템 권한을 부여합니다:

* **접근성**: Claude가 클릭, 타이핑, 스크롤할 수 있게 합니다
* **화면 녹화**: Claude가 화면에 표시된 내용을 볼 수 있게 합니다

Settings 페이지에 각 권한의 현재 상태가 표시됩니다. 거부된 경우 배지를 클릭하여 해당 시스템 설정 패널을 엽니다.

### 앱 권한

Claude가 앱을 처음 사용해야 할 때 세션에 프롬프트가 나타납니다. **Allow for this session** 또는 **Deny**를 클릭하세요. 승인은 현재 세션 동안 유효하며, [Dispatch에서 생성된 세션](#dispatch에서의-세션)에서는 30분입니다.

프롬프트에는 Claude가 해당 앱에 대해 어떤 수준의 제어를 갖는지도 표시됩니다. 이 수준은 앱 카테고리별로 고정되어 있으며 변경할 수 없습니다:

| 수준 | Claude가 할 수 있는 것 | 적용 대상 |
| :--- | :--- | :--- |
| 보기 전용 | 스크린샷에서 앱 확인 | 브라우저, 거래 플랫폼 |
| 클릭 전용 | 클릭과 스크롤은 가능하지만 타이핑이나 키보드 단축키는 불가 | 터미널, IDE |
| 전체 제어 | 클릭, 타이핑, 드래그, 키보드 단축키 사용 | 그 외 모든 것 |

터미널, Finder 또는 파일 탐색기, 시스템 설정 등 광범위한 접근 권한을 가진 앱은 프롬프트에 추가 경고를 표시하여 승인 시 어떤 권한이 부여되는지 알려줍니다.

**Settings > General** (Desktop app 아래)에서 두 가지 설정을 구성할 수 있습니다:

* **Denied apps**: 여기에 앱을 추가하면 프롬프트 없이 거부됩니다. Claude는 허용된 앱에서의 작업을 통해 거부된 앱에 간접적으로 영향을 줄 수 있지만, 거부된 앱과 직접 상호작용할 수는 없습니다.
* **Unhide apps when Claude finishes**: Claude가 작업하는 동안 다른 창은 숨겨져 승인된 앱과만 상호작용합니다. Claude가 완료되면 숨겨진 창이 복원되지만 이 설정을 끄면 복원되지 않습니다.

## 세션 관리

각 세션은 자체 컨텍스트와 변경 사항을 가진 독립적인 대화입니다. 여러 세션을 병렬로 실행하고, 클라우드로 작업을 보내거나, Dispatch가 휴대폰에서 세션을 시작하도록 할 수 있습니다.

### 세션으로 병렬 작업하기

사이드바에서 **+ New session**을 클릭하여 여러 작업을 병렬로 수행합니다. Git 리포지토리의 경우 각 세션은 [Git worktree](/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)를 사용하여 프로젝트의 격리된 복사본을 갖게 되므로, 한 세션의 변경 사항이 커밋하기 전까지 다른 세션에 영향을 미치지 않습니다.

worktree는 기본적으로 `<project-root>/.claude/worktrees/`에 저장됩니다. Settings → Claude Code의 "Worktree location"에서 사용자 정의 디렉토리로 변경할 수 있습니다. 또한 모든 worktree 브랜치 이름 앞에 추가되는 브랜치 접두사를 설정할 수 있어 Claude가 만든 브랜치를 체계적으로 관리할 수 있습니다. worktree를 제거하려면 사이드바에서 세션 위에 마우스를 올리고 아카이브 아이콘을 클릭하세요.

새 worktree에 `.env` 같은 gitignore된 파일을 포함하려면 프로젝트 루트에 [`.worktreeinclude` 파일](/common-workflows#copy-gitignored-files-to-worktrees)을 만드세요.

::: info
세션 격리에는 [Git](https://git-scm.com/downloads)이 필요합니다. 대부분의 Mac에는 Git이 기본으로 포함되어 있습니다. 터미널에서 `git --version`을 실행하여 확인하세요. Windows에서는 Code 탭이 작동하려면 Git이 필수입니다: [Git for Windows를 다운로드](https://git-scm.com/downloads/win)하고 설치한 후 앱을 다시 시작하세요. Git 오류가 발생하면 Cowork 세션을 시도하여 설정 문제를 해결하세요.
:::

사이드바 상단의 필터 아이콘을 사용하여 상태(Active, Archived)와 환경(Local, Cloud)별로 세션을 필터링하세요. 세션 이름을 변경하거나 컨텍스트 사용량을 확인하려면 활성 세션 상단 도구 모음의 세션 제목을 클릭하세요. 컨텍스트가 가득 차면 Claude가 자동으로 대화를 요약하고 작업을 계속합니다. `/compact`를 입력하여 요약을 일찍 트리거하고 컨텍스트 공간을 확보할 수도 있습니다. 압축 작동 방식에 대한 자세한 내용은 [컨텍스트 윈도우](/how-claude-code-works#the-context-window)를 참조하세요.

### 원격에서 장시간 작업 실행

대규모 리팩토링, 테스트 스위트, 마이그레이션 또는 기타 장시간 작업의 경우 세션 시작 시 **Local** 대신 **Remote**를 선택하세요. 원격 세션은 Anthropic의 클라우드 인프라에서 실행되며 앱을 닫거나 컴퓨터를 종료해도 계속됩니다. 언제든지 돌아와서 진행 상황을 확인하거나 Claude의 방향을 변경할 수 있습니다. [claude.ai/code](https://claude.ai/code)나 Claude iOS 앱에서도 원격 세션을 모니터링할 수 있습니다.

원격 세션은 여러 리포지토리도 지원합니다. 클라우드 환경을 선택한 후 리포지토리 필 옆의 **+** 버튼을 클릭하여 추가 리포지토리를 세션에 추가합니다. 각 리포지토리에는 자체 브랜치 선택기가 있습니다. 공유 라이브러리와 그 소비자를 업데이트하는 등 여러 코드베이스에 걸친 작업에 유용합니다.

원격 세션 작동 방식에 대한 자세한 내용은 [웹에서의 Claude Code](/claude-code-on-the-web)를 참조하세요.

### 다른 환경에서 계속하기

세션 도구 모음 오른쪽 하단의 VS Code 아이콘에서 접근할 수 있는 **Continue in** 메뉴를 사용하여 세션을 다른 환경으로 이동할 수 있습니다:

* **Claude Code on the Web**: 로컬 세션을 원격으로 계속 실행하도록 보냅니다. Desktop은 브랜치를 push하고, 대화 요약을 생성하고, 전체 컨텍스트로 새 원격 세션을 만듭니다. 그런 다음 로컬 세션을 아카이브하거나 유지할 수 있습니다. 깨끗한 작업 트리가 필요하며 SSH 세션에서는 사용할 수 없습니다.
* **Your IDE**: 현재 작업 디렉토리에서 지원되는 IDE로 프로젝트를 엽니다.

### Dispatch에서의 세션

[Dispatch](https://support.claude.com/en/articles/13947068)는 [Cowork](https://claude.com/product/cowork#dispatch-and-computer-use) 탭에 있는 Claude와의 지속적인 대화입니다. Dispatch에 작업을 메시지로 보내면 처리 방법을 결정합니다.

작업이 Code 세션이 되는 경우는 두 가지입니다: "Claude Code 세션을 열고 로그인 버그를 수정해줘"와 같이 직접 요청하거나, Dispatch가 해당 작업이 개발 작업이라고 판단하여 자동으로 생성하는 경우입니다. 일반적으로 Code로 라우팅되는 작업에는 버그 수정, 의존성 업데이트, 테스트 실행, pull request 열기가 포함됩니다. 리서치, 문서 편집, 스프레드시트 작업은 Cowork에 남습니다.

어느 경우든 Code 세션은 Code 탭의 사이드바에 **Dispatch** 배지와 함께 나타납니다. 완료되거나 승인이 필요할 때 휴대폰으로 푸시 알림을 받습니다.

[컴퓨터 사용](#claude가-컴퓨터를-사용하도록-허용)이 활성화되어 있으면 Dispatch에서 생성된 Code 세션에서도 사용할 수 있습니다. 이러한 세션에서의 앱 승인은 일반 Code 세션처럼 전체 세션이 아닌 30분 후 만료되고 다시 프롬프트됩니다.

설정, 페어링, Dispatch 설정에 대해서는 [Dispatch 도움말 문서](https://support.claude.com/en/articles/13947068)를 참조하세요. Dispatch는 Pro 또는 Max 플랜이 필요하며 Team이나 Enterprise 플랜에서는 사용할 수 없습니다.

Dispatch는 터미널을 떠나 있을 때 Claude와 작업하는 여러 방법 중 하나입니다. Remote Control, Channels, Slack, 예약 작업과 비교하려면 [플랫폼 및 통합](/platforms#work-when-you-are-away-from-your-terminal)을 참조하세요.

## Claude Code 확장

외부 서비스를 연결하고, 재사용 가능한 워크플로를 추가하고, Claude의 동작을 커스터마이즈하고, 미리보기 서버를 설정합니다.

### 외부 도구 연결

로컬 및 [SSH](#ssh-세션) 세션의 경우 프롬프트 박스 옆의 **+** 버튼을 클릭하고 **Connectors**를 선택하여 Google Calendar, Slack, GitHub, Linear, Notion 등의 통합을 추가합니다. 세션 전이나 도중에 커넥터를 추가할 수 있습니다. **+** 버튼은 원격 세션에서는 사용할 수 없지만, [예약 작업](/web-scheduled-tasks)은 작업 생성 시 커넥터를 설정합니다.

커넥터를 관리하거나 연결을 해제하려면 데스크톱 앱에서 Settings → Connectors로 이동하거나 프롬프트 박스의 Connectors 메뉴에서 **Manage connectors**를 선택하세요.

연결되면 Claude가 캘린더를 읽고, 메시지를 보내고, 이슈를 만들고, 도구와 직접 상호작용할 수 있습니다. Claude에게 세션에 어떤 커넥터가 설정되어 있는지 물어볼 수 있습니다.

커넥터는 그래픽 설정 흐름이 있는 [MCP 서버](/mcp)입니다. 지원되는 서비스와의 빠른 통합에 사용하세요. Connectors에 나열되지 않은 통합의 경우 [설정 파일](/mcp#installing-mcp-servers)을 통해 MCP 서버를 수동으로 추가하세요. [사용자 정의 커넥터를 만들](https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp) 수도 있습니다.

### 스킬 사용

[스킬](/skills)은 Claude의 기능을 확장합니다. Claude는 관련 스킬을 자동으로 로드하거나, 직접 호출할 수 있습니다: 프롬프트 박스에서 `/`를 입력하거나 **+** 버튼을 클릭하고 **Slash commands**를 선택하여 사용 가능한 항목을 찾아보세요. 여기에는 [내장 명령](/commands), [사용자 정의 스킬](/skills#create-your-first-skill), 코드베이스의 프로젝트 스킬, [설치된 플러그인](/plugins)의 스킬이 포함됩니다. 하나를 선택하면 입력 필드에 강조 표시됩니다. 작업을 입력하고 평소처럼 전송하세요.

### 플러그인 설치

[플러그인](/plugins)은 스킬, 에이전트, Hooks, MCP 서버, LSP 설정을 Claude Code에 추가하는 재사용 가능한 패키지입니다. 터미널을 사용하지 않고도 데스크톱 앱에서 플러그인을 설치할 수 있습니다.

로컬 및 [SSH](#ssh-세션) 세션의 경우 프롬프트 박스 옆의 **+** 버튼을 클릭하고 **Plugins**를 선택하여 설치된 플러그인과 스킬을 확인합니다. 플러그인을 추가하려면 하위 메뉴에서 **Add plugin**을 선택하여 플러그인 브라우저를 엽니다. 공식 Anthropic 마켓플레이스를 포함한 설정된 [마켓플레이스](/plugin-marketplaces)의 사용 가능한 플러그인이 표시됩니다. **Manage plugins**를 선택하여 플러그인을 활성화, 비활성화 또는 제거합니다.

플러그인은 사용자 계정, 특정 프로젝트 또는 로컬 전용으로 범위를 지정할 수 있습니다. 플러그인은 원격 세션에서 사용할 수 없습니다. 자체 플러그인 만들기를 포함한 전체 플러그인 참조는 [플러그인](/plugins)을 확인하세요.

### 미리보기 서버 설정

Claude는 개발 서버 설정을 자동으로 감지하고 세션 시작 시 선택한 폴더의 루트에 있는 `.claude/launch.json`에 설정을 저장합니다. Preview는 이 폴더를 작업 디렉토리로 사용하므로, 상위 폴더를 선택한 경우 자체 개발 서버가 있는 하위 폴더는 자동으로 감지되지 않습니다. 하위 폴더의 서버로 작업하려면 해당 폴더에서 직접 세션을 시작하거나 설정을 수동으로 추가하세요.

서버 시작 방법을 커스터마이즈하려면(예: `npm run dev` 대신 `yarn dev` 사용 또는 포트 변경) 파일을 직접 편집하거나 Preview 드롭다운에서 **Edit configuration**을 클릭하여 코드 편집기에서 엽니다. 파일은 주석이 있는 JSON을 지원합니다.

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "my-app",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

같은 프로젝트에서 프론트엔드와 API 등 다른 서버를 실행하기 위해 여러 설정을 정의할 수 있습니다. 아래 [예제](#예제)를 참조하세요.

#### 변경 사항 자동 검증

`autoVerify`가 활성화되면 Claude가 파일 편집 후 자동으로 코드 변경을 검증합니다. 스크린샷을 촬영하고, 오류를 확인하고, 응답을 완료하기 전에 변경이 제대로 작동하는지 확인합니다.

자동 검증은 기본적으로 켜져 있습니다. `.claude/launch.json`에 `"autoVerify": false`를 추가하여 프로젝트별로 비활성화하거나 **Preview** 드롭다운 메뉴에서 토글하세요.

```json
{
  "version": "0.0.1",
  "autoVerify": false,
  "configurations": [...]
}
```

비활성화해도 미리보기 도구는 여전히 사용 가능하며 언제든지 Claude에게 검증을 요청할 수 있습니다. 자동 검증은 모든 편집 후 자동으로 수행되도록 합니다.

#### 설정 필드

`configurations` 배열의 각 항목은 다음 필드를 허용합니다:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `name` | string | 이 서버의 고유 식별자 |
| `runtimeExecutable` | string | 실행할 명령. `npm`, `yarn`, `node` 등 |
| `runtimeArgs` | string[] | `runtimeExecutable`에 전달되는 인수. `["run", "dev"]` 등 |
| `port` | number | 서버가 수신하는 포트. 기본값은 3000 |
| `cwd` | string | 프로젝트 루트 기준 작업 디렉토리. 기본값은 프로젝트 루트. `${workspaceFolder}`를 사용하여 프로젝트 루트를 명시적으로 참조 |
| `env` | object | `{ "NODE_ENV": "development" }` 같은 키-값 쌍의 추가 환경 변수. 이 파일은 리포지토리에 커밋되므로 시크릿을 여기에 넣지 마세요. 개발 서버에 시크릿을 전달하려면 [로컬 환경 편집기](#로컬-세션)에서 설정하세요. |
| `autoPort` | boolean | 포트 충돌 처리 방법. 아래 참조 |
| `program` | string | `node`로 실행할 스크립트. [`program` vs `runtimeExecutable` 사용 시기](#program-vs-runtimeexecutable-사용-시기) 참조 |
| `args` | string[] | `program`에 전달되는 인수. `program`이 설정된 경우에만 사용 |

##### `program` vs `runtimeExecutable` 사용 시기

패키지 매니저를 통해 개발 서버를 시작하려면 `runtimeExecutable`과 `runtimeArgs`를 사용하세요. 예를 들어 `"runtimeExecutable": "npm"`과 `"runtimeArgs": ["run", "dev"]`는 `npm run dev`를 실행합니다.

`node`로 직접 실행할 독립 스크립트가 있는 경우 `program`을 사용하세요. 예를 들어 `"program": "server.js"`는 `node server.js`를 실행합니다. `args`로 추가 플래그를 전달합니다.

#### 포트 충돌

`autoPort` 필드는 선호하는 포트가 이미 사용 중일 때의 동작을 제어합니다:

* **`true`**: Claude가 자동으로 사용 가능한 포트를 찾아 사용합니다. 대부분의 개발 서버에 적합합니다.
* **`false`**: Claude가 오류와 함께 실패합니다. OAuth 콜백이나 CORS 허용 목록 등 서버가 특정 포트를 사용해야 하는 경우 사용하세요.
* **설정하지 않음(기본값)**: Claude가 서버에 해당 포트가 정확히 필요한지 물어본 후 답변을 저장합니다.

Claude가 다른 포트를 선택하면 `PORT` 환경 변수를 통해 할당된 포트를 서버에 전달합니다.

#### 예제

다음은 다양한 프로젝트 유형에 대한 일반적인 설정을 보여주는 예제입니다:

**Next.js**

이 설정은 Yarn을 사용하여 포트 3000에서 Next.js 앱을 실행합니다:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "web",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["dev"],
      "port": 3000
    }
  ]
}
```

**여러 서버**

프론트엔드와 API 서버가 있는 모노레포의 경우 여러 설정을 정의합니다. 프론트엔드는 3000번 포트가 사용 중이면 빈 포트를 선택하도록 `autoPort: true`를 사용하고, API 서버는 정확히 8080번 포트가 필요합니다:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "apps/web",
      "port": 3000,
      "autoPort": true
    },
    {
      "name": "api",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start"],
      "cwd": "server",
      "port": 8080,
      "env": { "NODE_ENV": "development" },
      "autoPort": false
    }
  ]
}
```

**Node.js 스크립트**

패키지 매니저 명령 대신 Node.js 스크립트를 직접 실행하려면 `program` 필드를 사용합니다:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "server",
      "program": "server.js",
      "args": ["--verbose"],
      "port": 4000
    }
  ]
}
```

## 환경 설정

[세션 시작](#세션-시작하기) 시 선택한 환경에 따라 Claude가 실행되는 위치와 연결 방법이 결정됩니다:

* **Local**: 파일에 직접 접근하여 내 컴퓨터에서 실행
* **Remote**: Anthropic의 클라우드 인프라에서 실행. 앱을 닫아도 세션이 계속됩니다.
* **SSH**: SSH를 통해 연결하는 원격 머신(자체 서버, 클라우드 VM, 개발 컨테이너 등)에서 실행

### 로컬 세션

데스크톱 앱은 항상 전체 셸 환경을 상속하지는 않습니다. macOS에서 Dock이나 Finder에서 앱을 실행하면 `~/.zshrc`나 `~/.bashrc` 같은 셸 프로필을 읽어 `PATH`와 고정된 Claude Code 변수 세트를 추출하지만, 거기서 export한 다른 변수는 반영되지 않습니다. Windows에서는 앱이 사용자 및 시스템 환경 변수를 상속하지만 PowerShell 프로필은 읽지 않습니다.

모든 플랫폼에서 로컬 세션과 개발 서버의 환경 변수를 설정하려면 프롬프트 박스에서 환경 드롭다운을 열고, **Local** 위에 마우스를 올리고, 기어 아이콘을 클릭하여 로컬 환경 편집기를 엽니다. 여기서 저장한 변수는 컴퓨터에 암호화되어 저장되며 시작하는 모든 로컬 세션과 미리보기 서버에 적용됩니다. `~/.claude/settings.json` 파일의 `env` 키에도 변수를 추가할 수 있지만, 이는 Claude 세션에만 전달되고 개발 서버에는 전달되지 않습니다. 지원되는 변수의 전체 목록은 [환경 변수](/env-vars)를 참조하세요.

[확장 사고](/common-workflows#use-extended-thinking-thinking-mode)는 기본적으로 활성화되어 있으며, 복잡한 추론 작업에서 성능을 향상시키지만 추가 토큰을 사용합니다. 사고를 완전히 비활성화하려면 로컬 환경 편집기에서 `MAX_THINKING_TOKENS`를 `0`으로 설정하세요. Opus 4.6과 Sonnet 4.6에서는 적응형 추론이 사고 깊이를 제어하므로 다른 `MAX_THINKING_TOKENS` 값은 무시됩니다. 이러한 모델에서 고정된 사고 예산을 사용하려면 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING`도 `1`로 설정하세요.

### 원격 세션

원격 세션은 앱을 닫아도 백그라운드에서 계속됩니다. 사용량은 별도의 컴퓨팅 요금 없이 [구독 플랜 한도](/costs)에 포함됩니다.

다양한 네트워크 접근 수준과 환경 변수로 사용자 정의 클라우드 환경을 만들 수 있습니다. 원격 세션 시작 시 환경 드롭다운을 선택하고 **Add environment**를 선택하세요. 네트워크 접근 및 환경 변수 설정에 대한 자세한 내용은 [클라우드 환경](/claude-code-on-the-web#the-cloud-environment)을 참조하세요.

### SSH 세션

SSH 세션을 사용하면 데스크톱 앱을 인터페이스로 사용하면서 원격 머신에서 Claude Code를 실행할 수 있습니다. 클라우드 VM, 개발 컨테이너, 특정 하드웨어나 의존성이 있는 서버에 있는 코드베이스로 작업할 때 유용합니다.

SSH 연결을 추가하려면 세션 시작 전 환경 드롭다운을 클릭하고 **+ Add SSH connection**을 선택합니다. 대화상자에서 다음을 입력합니다:

* **Name**: 이 연결의 표시 이름
* **SSH Host**: `user@hostname` 또는 `~/.ssh/config`에 정의된 호스트
* **SSH Port**: 비워두면 기본값 22 또는 SSH 설정의 포트 사용
* **Identity File**: `~/.ssh/id_rsa` 같은 개인 키 경로. 기본 키 또는 SSH 설정을 사용하려면 비워두세요.

추가하면 환경 드롭다운에 연결이 나타납니다. 선택하여 해당 머신에서 세션을 시작합니다. Claude는 원격 머신에서 파일과 도구에 접근하여 실행됩니다.

원격 머신에 Claude Code가 설치되어 있어야 합니다. 연결되면 SSH 세션은 권한 모드, 커넥터, 플러그인, MCP 서버를 지원합니다.

## 엔터프라이즈 설정

Team 또는 Enterprise 플랜의 조직은 관리 콘솔 제어, 관리 설정 파일, 기기 관리 정책을 통해 데스크톱 앱 동작을 관리할 수 있습니다.

### 관리 콘솔 제어

이 설정은 [관리 설정 콘솔](https://claude.ai/admin-settings/claude-code)을 통해 구성됩니다:

* **Code in the desktop**: 조직 사용자가 데스크톱 앱에서 Claude Code에 접근할 수 있는지 제어
* **Code in the web**: 조직의 [웹 세션](/claude-code-on-the-web) 활성화 또는 비활성화
* **Remote Control**: 조직의 [Remote Control](/remote-control) 활성화 또는 비활성화
* **Disable Bypass permissions mode**: 조직 사용자가 bypass permissions 모드를 활성화하지 못하도록 방지

### 관리 설정

관리 설정은 프로젝트 및 사용자 설정을 재정의하며 Desktop이 CLI 세션을 생성할 때 적용됩니다. 조직의 [관리 설정](/settings#settings-precedence) 파일에서 이러한 키를 설정하거나 관리 콘솔을 통해 원격으로 푸시할 수 있습니다.

| 키 | 설명 |
| --- | --- |
| `permissions.disableBypassPermissionsMode` | `"disable"`로 설정하여 사용자가 Bypass permissions 모드를 활성화하지 못하도록 방지합니다. |
| `disableAutoMode` | `"disable"`로 설정하여 사용자가 [Auto](/permission-modes#eliminate-prompts-with-auto-mode) 모드를 활성화하지 못하도록 방지합니다. 모드 선택기에서 Auto를 제거합니다. `permissions` 아래에서도 허용됩니다. |
| `autoMode` | 조직 전체에서 Auto 모드 분류기가 신뢰하고 차단하는 항목을 커스터마이즈합니다. [Auto 모드 분류기 설정](/permissions#configure-the-auto-mode-classifier)을 참조하세요. |

`permissions.disableBypassPermissionsMode`와 `disableAutoMode`는 사용자 및 프로젝트 설정에서도 작동하지만, 관리 설정에 배치하면 사용자가 재정의할 수 없습니다. `autoMode`는 사용자 설정, `.claude/settings.local.json`, 관리 설정에서 읽히지만 체크인된 `.claude/settings.json`에서는 읽히지 않습니다: 복제된 리포지토리가 자체 분류기 규칙을 주입할 수 없습니다. `allowManagedPermissionRulesOnly`와 `allowManagedHooksOnly`를 포함한 관리 전용 설정의 전체 목록은 [관리 전용 설정](/permissions#managed-only-settings)을 참조하세요.

관리 콘솔을 통해 업로드된 원격 관리 설정은 현재 CLI 및 IDE 세션에만 적용됩니다. Desktop 전용 제한의 경우 위의 관리 콘솔 제어를 사용하세요.

### 기기 관리 정책

IT 팀은 macOS에서 MDM 또는 Windows에서 그룹 정책을 통해 데스크톱 앱을 관리할 수 있습니다. 사용 가능한 정책에는 Claude Code 기능 활성화/비활성화, 자동 업데이트 제어, 사용자 정의 배포 URL 설정이 포함됩니다.

* **macOS**: Jamf 또는 Kandji 같은 도구를 사용하여 `com.anthropic.Claude` 기본 설정 도메인으로 구성
* **Windows**: `SOFTWARE\Policies\Claude` 레지스트리에서 구성

### 인증 및 SSO

Enterprise 조직은 모든 사용자에게 SSO를 요구할 수 있습니다. 플랜별 세부 사항은 [인증](/authentication)을, SAML 및 OIDC 구성은 [SSO 설정](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso)을 참조하세요.

### 데이터 처리

Claude Code는 로컬 세션에서는 로컬로, 원격 세션에서는 Anthropic의 클라우드 인프라에서 코드를 처리합니다. 대화와 코드 컨텍스트는 처리를 위해 Anthropic의 API로 전송됩니다. 데이터 보존, 개인정보 보호, 규정 준수에 대한 자세한 내용은 [데이터 처리](/data-usage)를 참조하세요.

### 배포

Desktop은 엔터프라이즈 배포 도구를 통해 배포할 수 있습니다:

* **macOS**: Jamf 또는 Kandji 같은 MDM을 사용하여 `.dmg` 설치 프로그램으로 배포
* **Windows**: MSIX 패키지 또는 `.exe` 설치 프로그램으로 배포. 자동 설치를 포함한 엔터프라이즈 배포 옵션은 [Windows용 Claude Desktop 배포](https://support.claude.com/en/articles/12622703-deploy-claude-desktop-for-windows)를 참조하세요

프록시 설정, 방화벽 허용 목록, LLM 게이트웨이 등 네트워크 설정에 대해서는 [네트워크 설정](/network-config)을 참조하세요.

전체 엔터프라이즈 설정 참조는 [엔터프라이즈 설정 가이드](https://support.claude.com/en/articles/12622667-enterprise-configuration)를 확인하세요.

## CLI에서 전환하기

이미 Claude Code CLI를 사용하고 있다면 Desktop은 동일한 기본 엔진을 그래픽 인터페이스로 실행합니다. 같은 컴퓨터에서, 같은 프로젝트에서도 둘을 동시에 실행할 수 있습니다. 각각 별도의 세션 기록을 유지하지만 CLAUDE.md 파일을 통해 설정과 프로젝트 메모리를 공유합니다.

CLI 세션을 Desktop으로 이동하려면 터미널에서 `/desktop`을 실행하세요. Claude가 세션을 저장하고 데스크톱 앱에서 열고 CLI를 종료합니다. 이 명령은 macOS와 Windows에서만 사용할 수 있습니다.

::: tip
Desktop vs CLI 사용 시기: 비주얼 diff 리뷰, 파일 첨부, 사이드바 세션 관리가 필요할 때 Desktop을 사용하세요. 스크립팅, 자동화, 타사 제공업체가 필요하거나 터미널 워크플로를 선호할 때 CLI를 사용하세요.
:::

### CLI 플래그 대응표

이 표는 일반적인 CLI 플래그의 데스크톱 앱 대응 항목을 보여줍니다. 나열되지 않은 플래그는 스크립팅이나 자동화를 위해 설계되었으므로 데스크톱 대응 항목이 없습니다.

| CLI | Desktop 대응 |
| --- | --- |
| `--model sonnet` | 세션 시작 전 전송 버튼 옆 모델 드롭다운 |
| `--resume`, `--continue` | 사이드바에서 세션 클릭 |
| `--permission-mode` | 전송 버튼 옆 모드 선택기 |
| `--dangerously-skip-permissions` | Bypass permissions 모드. Settings → Claude Code → "Allow bypass permissions mode"에서 활성화. 엔터프라이즈 관리자가 이 설정을 비활성화할 수 있습니다. |
| `--add-dir` | 원격 세션에서 **+** 버튼으로 여러 리포지토리 추가 |
| `--allowedTools`, `--disallowedTools` | Desktop에서 사용 불가 |
| `--verbose` | 사용 불가. 시스템 로그 확인: macOS에서 Console.app, Windows에서 이벤트 뷰어 → Windows 로그 → 애플리케이션 |
| `--print`, `--output-format` | 사용 불가. Desktop은 대화형 전용입니다. |
| `ANTHROPIC_MODEL` 환경 변수 | 전송 버튼 옆 모델 드롭다운 |
| `MAX_THINKING_TOKENS` 환경 변수 | 로컬 환경 편집기에서 설정. [환경 설정](#환경-설정) 참조. |

### 공유 설정

Desktop과 CLI는 같은 설정 파일을 읽으므로 설정이 그대로 적용됩니다:

* **[CLAUDE.md](/memory)**와 `CLAUDE.local.md` 파일은 프로젝트에서 둘 다 사용
* **[MCP 서버](/mcp)**: `~/.claude.json`이나 `.mcp.json`에 설정된 것은 둘 다에서 작동
* **[Hooks](/hooks)**와 **[스킬](/skills)**: 설정에 정의된 것은 둘 다에 적용
* **[설정](/settings)**: `~/.claude.json`과 `~/.claude/settings.json`은 공유됨. `settings.json`의 권한 규칙, 허용된 도구 및 기타 설정은 Desktop 세션에 적용됩니다.
* **모델**: Sonnet, Opus, Haiku 모두 사용 가능. Desktop에서는 세션 시작 전 전송 버튼 옆 드롭다운에서 모델을 선택합니다. 활성 세션 중에는 모델을 변경할 수 없습니다.

::: info
**MCP 서버: 데스크톱 채팅 앱 vs Claude Code**: Claude Desktop 채팅 앱의 `claude_desktop_config.json`에 설정된 MCP 서버는 Claude Code와 별개이며 Code 탭에 나타나지 않습니다. Claude Code에서 MCP 서버를 사용하려면 `~/.claude.json`이나 프로젝트의 `.mcp.json` 파일에 설정하세요. 자세한 내용은 [MCP 설정](/mcp#installing-mcp-servers)을 참조하세요.
:::

### 기능 비교

이 표는 CLI와 Desktop 간의 핵심 기능을 비교합니다. CLI 플래그의 전체 목록은 [CLI 참조](/cli-reference)를 확인하세요.

| 기능 | CLI | Desktop |
| --- | --- | --- |
| 권한 모드 | `dontAsk` 포함 모든 모드 | Ask permissions, Auto accept edits, Plan mode, Auto, Settings를 통한 Bypass permissions |
| `--dangerously-skip-permissions` | CLI 플래그 | Bypass permissions 모드. Settings → Claude Code → "Allow bypass permissions mode"에서 활성화 |
| [타사 제공업체](/third-party-integrations) | Bedrock, Vertex, Foundry | 사용 불가. Desktop은 Anthropic의 API에 직접 연결됩니다. |
| [MCP 서버](/mcp) | 설정 파일에서 구성 | 로컬 및 SSH 세션의 Connectors UI 또는 설정 파일 |
| [플러그인](/plugins) | `/plugin` 명령 | 플러그인 관리자 UI |
| @멘션 파일 | 텍스트 기반 | 자동 완성 포함; 로컬 및 SSH 세션에서만 |
| 파일 첨부 | 사용 불가 | 이미지, PDF |
| 세션 격리 | [`--worktree`](/cli-reference) 플래그 | 자동 worktree |
| 여러 세션 | 별도 터미널 | 사이드바 탭 |
| 반복 작업 | Cron 작업, CI 파이프라인 | [예약 작업](/desktop-scheduled-tasks) |
| 컴퓨터 사용 | macOS에서 [`/mcp`를 통해 활성화](/computer-use) | macOS 및 Windows에서 [앱 및 화면 제어](#claude가-컴퓨터를-사용하도록-허용) |
| Dispatch 연동 | 사용 불가 | 사이드바의 [Dispatch 세션](#dispatch에서의-세션) |
| 스크립팅 및 자동화 | [`--print`](/cli-reference), [Agent SDK](/headless) | 사용 불가 |

### Desktop에서 사용할 수 없는 기능

다음 기능은 CLI 또는 VS Code 확장에서만 사용할 수 있습니다:

* **타사 제공업체**: Desktop은 Anthropic의 API에 직접 연결됩니다. Bedrock, Vertex, Foundry를 사용하려면 [CLI](/quickstart)를 사용하세요.
* **Linux**: 데스크톱 앱은 macOS와 Windows에서만 사용할 수 있습니다.
* **인라인 코드 제안**: Desktop은 자동 완성 스타일의 제안을 제공하지 않습니다. 대화형 프롬프트와 명시적 코드 변경을 통해 작동합니다.
* **에이전트 팀**: 멀티 에이전트 오케스트레이션은 [CLI](/agent-teams)와 [Agent SDK](/headless)를 통해 사용할 수 있으며, Desktop에서는 사용할 수 없습니다.

## 문제 해결

### 버전 확인

실행 중인 데스크톱 앱의 버전을 확인하려면:

* **macOS**: 메뉴 바에서 **Claude**를 클릭한 다음 **About Claude**
* **Windows**: **Help**를 클릭한 다음 **About**

버전 번호를 클릭하여 클립보드에 복사합니다.

### Code 탭에서 403 또는 인증 오류

Code 탭 사용 시 `Error 403: Forbidden` 또는 기타 인증 실패가 발생하면:

1. 앱 메뉴에서 로그아웃한 후 다시 로그인합니다. 이것이 가장 일반적인 해결책입니다.
2. 활성 유료 구독이 있는지 확인합니다: Pro, Max, Team 또는 Enterprise.
3. CLI는 작동하지만 Desktop이 작동하지 않으면 데스크톱 앱을 완전히 종료하고(창을 닫는 것이 아님) 다시 열어 로그인합니다.
4. 인터넷 연결과 프록시 설정을 확인합니다.

### 실행 시 빈 화면 또는 응답 없음

앱이 열리지만 빈 화면이나 응답 없는 화면이 표시되면:

1. 앱을 다시 시작합니다.
2. 보류 중인 업데이트를 확인합니다. 앱은 실행 시 자동 업데이트됩니다.
3. Windows에서는 이벤트 뷰어의 **Windows 로그 → 애플리케이션**에서 충돌 로그를 확인합니다.

### "Failed to load session"

`Failed to load session`이 표시되면 선택한 폴더가 더 이상 존재하지 않거나, Git 리포지토리에 설치되지 않은 Git LFS가 필요하거나, 파일 권한이 접근을 막고 있을 수 있습니다. 다른 폴더를 선택하거나 앱을 다시 시작해 보세요.

### 세션에서 설치된 도구를 찾지 못하는 경우

Claude가 `npm`, `node` 또는 기타 CLI 명령을 찾지 못하면 일반 터미널에서 도구가 작동하는지 확인하고, 셸 프로필이 PATH를 올바르게 설정하는지 확인하고, 데스크톱 앱을 다시 시작하여 환경 변수를 다시 로드하세요.

### Git 및 Git LFS 오류

Windows에서 로컬 세션을 시작하려면 Code 탭에 Git이 필요합니다. "Git is required"가 표시되면 [Git for Windows](https://git-scm.com/downloads/win)를 설치하고 앱을 다시 시작하세요.

"Git LFS is required by this repository but is not installed"가 표시되면 [git-lfs.com](https://git-lfs.com/)에서 Git LFS를 설치하고, `git lfs install`을 실행하고, 앱을 다시 시작하세요.

### Windows에서 MCP 서버가 작동하지 않는 경우

Windows에서 MCP 서버 토글이 응답하지 않거나 서버 연결에 실패하면 설정에서 서버가 올바르게 구성되어 있는지 확인하고, 앱을 다시 시작하고, 작업 관리자에서 서버 프로세스가 실행 중인지 확인하고, 서버 로그에서 연결 오류를 검토하세요.

### 앱이 종료되지 않는 경우

* **macOS**: Cmd+Q를 누릅니다. 앱이 응답하지 않으면 Cmd+Option+Esc로 강제 종료를 사용하고 Claude를 선택한 후 강제 종료를 클릭합니다.
* **Windows**: Ctrl+Shift+Esc로 작업 관리자를 사용하여 Claude 프로세스를 종료합니다.

### Windows 관련 문제

* **설치 후 PATH가 업데이트되지 않음**: 새 터미널 창을 엽니다. PATH 업데이트는 새 터미널 세션에만 적용됩니다.
* **동시 설치 오류**: 다른 설치가 진행 중이라는 오류가 표시되지만 실제로는 아닌 경우, 관리자 권한으로 설치 프로그램을 실행해 보세요.
* **ARM64**: Windows ARM64 기기는 완전히 지원됩니다.

### Intel Mac에서 Cowork 탭 사용 불가

Cowork 탭은 macOS에서 Apple Silicon(M1 이상)이 필요합니다. Windows에서는 지원되는 모든 하드웨어에서 Cowork를 사용할 수 있습니다. Chat 및 Code 탭은 Intel Mac에서 정상적으로 작동합니다.

### CLI에서 열 때 "Branch doesn't exist yet"

원격 세션은 로컬 머신에 없는 브랜치를 생성할 수 있습니다. 세션 도구 모음에서 브랜치 이름을 클릭하여 복사한 후 로컬에서 가져옵니다:

```bash
git fetch origin <branch-name>
git checkout <branch-name>
```

### 여전히 해결되지 않나요?

* [GitHub Issues](https://github.com/anthropics/claude-code/issues)에서 검색하거나 버그를 제출하세요
* [Claude 지원 센터](https://support.claude.com/)를 방문하세요

버그를 제출할 때 데스크톱 앱 버전, 운영 체제, 정확한 오류 메시지, 관련 로그를 포함하세요. macOS에서는 Console.app을, Windows에서는 이벤트 뷰어 → Windows 로그 → 애플리케이션을 확인하세요.
