---
title: 데스크톱 앱 시작하기
description: Claude Code 데스크톱을 설치하고 첫 번째 코딩 세션 시작하기
---

# 데스크톱 앱 시작하기

데스크톱 앱은 그래픽 인터페이스로 Claude Code를 제공합니다: 비주얼 diff 리뷰, 라이브 앱 미리보기, 자동 병합이 가능한 GitHub PR 모니터링, Git worktree 격리를 통한 병렬 세션, 예약 작업, 원격 작업 실행 기능. 터미널이 필요 없습니다.

플랫폼별 Claude를 다운로드하세요:

- [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs) — Intel 및 Apple Silicon용 유니버설 빌드
- [Windows](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs) — x64 프로세서용

Windows ARM64의 경우 [ARM64 설치 프로그램](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs)을 다운로드하세요. Linux는 현재 지원되지 않습니다.

::: info
Claude Code는 [Pro, Max, Team 또는 Enterprise 구독](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=desktop_quickstart_pricing)이 필요합니다.
:::

이 페이지에서는 앱 설치와 첫 번째 세션 시작을 안내합니다. 이미 설정을 완료했다면 전체 참조는 [Claude Code Desktop 사용하기](/desktop)를 참조하세요.

데스크톱 앱에는 세 가지 탭이 있습니다:

* **Chat**: 파일 접근 없이 일반 대화, claude.ai와 유사합니다.
* **Cowork**: 자체 환경이 있는 클라우드 VM에서 작업하는 자율 백그라운드 에이전트입니다. 앱을 닫아도 독립적으로 실행될 수 있습니다.
* **Code**: 로컬 파일에 직접 접근하는 대화형 코딩 어시스턴트입니다. 각 변경 사항을 실시간으로 검토하고 승인합니다.

Chat과 Cowork는 [Claude Desktop 지원 문서](https://support.claude.com/en/collections/16163169-claude-desktop)에서 다룹니다. 이 페이지는 **Code** 탭에 초점을 맞춥니다.

## 설치

### 1. 설치 및 로그인

플랫폼용 Claude를 다운로드하고 설치 프로그램을 실행하세요:

* [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs): Intel 및 Apple Silicon용 유니버설 빌드
* [Windows x64](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs): x64 프로세서용
* [Windows ARM64](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs): ARM 프로세서용

Applications 폴더(macOS) 또는 시작 메뉴(Windows)에서 Claude를 실행하세요. Anthropic 계정으로 로그인하세요.

### 2. Code 탭 열기

상단 중앙의 **Code** 탭을 클릭하세요. Code를 클릭할 때 업그레이드 안내가 표시되면 먼저 [유료 플랜에 구독](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=desktop_quickstart_upgrade)해야 합니다. 온라인 로그인 안내가 표시되면 로그인을 완료하고 앱을 다시 시작하세요. 403 오류가 표시되면 [인증 문제 해결](/desktop#403-or-authentication-errors-in-the-code-tab)을 참조하세요.

데스크톱 앱에는 Claude Code가 포함되어 있습니다. Node.js나 CLI를 별도로 설치할 필요가 없습니다. 터미널에서 `claude`를 사용하려면 CLI를 별도로 설치하세요. [CLI 시작하기](/quickstart)를 참조하세요.

## 첫 번째 세션 시작

Code 탭을 열고 프로젝트를 선택한 다음 Claude에게 할 일을 알려주세요.

### 1. 환경 및 폴더 선택

**Local**을 선택하여 파일을 직접 사용하여 머신에서 Claude를 실행하세요. **Select folder**를 클릭하고 프로젝트 디렉토리를 선택하세요.

::: tip
잘 아는 작은 프로젝트로 시작하세요. Claude Code가 무엇을 할 수 있는지 가장 빠르게 확인할 수 있습니다. Windows에서는 로컬 세션이 작동하려면 [Git](https://git-scm.com/downloads/win)이 설치되어 있어야 합니다. 대부분의 Mac에는 Git이 기본으로 포함되어 있습니다.
:::

다음도 선택할 수 있습니다:

* **Remote**: 앱을 닫아도 계속되는 Anthropic의 클라우드 인프라에서 세션을 실행합니다. 원격 세션은 [웹에서 Claude Code](/claude-code-on-the-web)와 동일한 인프라를 사용합니다.
* **SSH**: SSH를 통해 원격 머신에 연결합니다(자체 서버, 클라우드 VM 또는 개발 컨테이너). 원격 머신에 Claude Code가 설치되어 있어야 합니다.

### 2. 모델 선택

보내기 버튼 옆의 드롭다운에서 모델을 선택하세요. Opus, Sonnet, Haiku 비교는 [모델](/model-config#available-models)을 참조하세요. 세션이 시작된 후에는 모델을 변경할 수 없습니다.

### 3. Claude에게 할 일 알려주기

Claude가 수행할 작업을 입력하세요:

* `TODO 주석을 찾아서 수정해`
* `메인 함수에 대한 테스트 추가해`
* `이 코드베이스에 대한 지시를 포함하는 CLAUDE.md를 만들어`

[세션](/desktop#work-in-parallel-with-sessions)은 코드에 대한 Claude와의 대화입니다. 각 세션은 자체 컨텍스트와 변경 사항을 추적하므로, 서로 간섭 없이 여러 작업을 진행할 수 있습니다.

### 4. 변경 사항 검토 및 수락

기본적으로 Code 탭은 [Ask permissions 모드](/desktop#choose-a-permission-mode)로 시작하며, Claude가 변경 사항을 제안하고 적용 전 승인을 기다립니다. 다음이 표시됩니다:

1. 각 파일에서 정확히 무엇이 변경되는지 보여주는 [diff 뷰](/desktop#review-changes-with-diff-view)
2. 각 변경 사항을 승인하거나 거절하는 Accept/Reject 버튼
3. Claude가 요청을 처리하는 동안의 실시간 업데이트

변경을 거절하면 Claude가 다른 방법으로 진행할 방법을 묻습니다. 수락할 때까지 파일은 수정되지 않습니다.

## 이제 무엇을 할까요?

첫 번째 편집을 완료했습니다. Desktop이 할 수 있는 모든 것에 대한 전체 참조는 [Claude Code Desktop 사용하기](/desktop)를 참조하세요. 다음으로 시도할 것들이 있습니다.

**중단하고 방향 전환하기.** 언제든지 Claude를 중단할 수 있습니다. 잘못된 방향으로 진행 중이면 중지 버튼을 클릭하거나 수정 사항을 입력하고 **Enter**를 누르세요. Claude가 하던 것을 멈추고 입력에 따라 조정합니다. 완료될 때까지 기다리거나 처음부터 다시 시작할 필요가 없습니다.

**Claude에게 더 많은 컨텍스트 제공하기.** 프롬프트 박스에 `@filename`을 입력하여 특정 파일을 대화에 가져오거나, 첨부 버튼을 사용하여 이미지와 PDF를 첨부하거나, 파일을 프롬프트에 직접 드래그 앤 드롭하세요. Claude에게 더 많은 컨텍스트를 제공할수록 결과가 좋아집니다. [파일 및 컨텍스트 추가](/desktop#add-files-and-context-to-prompts)를 참조하세요.

**반복 작업에 Skills 사용하기.** `/`를 입력하거나 **+** → **Slash commands**를 클릭하여 [내장 명령어](/commands), [커스텀 Skills](/skills), 플러그인 Skills를 탐색하세요. Skills는 코드 리뷰 체크리스트나 배포 단계처럼 필요할 때 호출할 수 있는 재사용 가능한 프롬프트입니다.

**커밋 전 변경 사항 검토하기.** Claude가 파일을 편집한 후 `+12 -1`과 같은 표시가 나타납니다. 클릭하여 [diff 뷰](/desktop#review-changes-with-diff-view)를 열고, 파일별로 수정 사항을 검토하고, 특정 줄에 코멘트를 달 수 있습니다. Claude가 코멘트를 읽고 수정합니다. **Review code**를 클릭하면 Claude가 직접 diff를 평가하고 인라인 제안을 남깁니다.

**제어 수준 조정하기.** [권한 모드](/desktop#choose-a-permission-mode)가 균형을 제어합니다. Ask permissions(기본)는 모든 편집 전에 승인을 요구합니다. Auto accept edits는 더 빠른 반복을 위해 파일 편집을 자동 수락합니다. Plan 모드는 파일을 건드리지 않고 Claude가 접근 방식을 계획하게 하며, 대규모 리팩토링 전에 유용합니다.

**더 많은 기능을 위해 플러그인 추가하기.** 프롬프트 박스 옆의 **+** 버튼을 클릭하고 **Plugins**를 선택하여 Skills, 에이전트, MCP 서버 등을 추가하는 [플러그인](/desktop#install-plugins)을 탐색하고 설치하세요.

**앱 미리보기.** **Preview** 드롭다운을 클릭하여 데스크톱에서 직접 개발 서버를 실행하세요. Claude가 실행 중인 앱을 보고, 엔드포인트를 테스트하고, 로그를 검사하고, 보이는 것을 기반으로 반복할 수 있습니다. [앱 미리보기](/desktop#preview-your-app)를 참조하세요.

**Pull Request 추적하기.** PR을 열면 Claude Code가 CI 체크 결과를 모니터링하고 실패를 자동으로 수정하거나 모든 체크가 통과하면 PR을 자동 병합할 수 있습니다. [Pull Request 상태 모니터링](/desktop#monitor-pull-request-status)을 참조하세요.

**Claude를 예약하기.** [예약 작업](/desktop-scheduled-tasks)을 설정하여 반복적으로 Claude를 자동 실행하세요: 매일 아침 코드 리뷰, 주간 종속성 감사, 또는 연결된 도구에서 정보를 가져오는 브리핑.

**준비가 되면 확장하기.** 사이드바에서 [병렬 세션](/desktop#work-in-parallel-with-sessions)을 열어 여러 작업을 동시에 작업하세요. 각각 자체 Git worktree에서 실행됩니다. [장기 실행 작업을 클라우드로 보내](/desktop#run-long-running-tasks-remotely) 앱을 닫아도 계속되게 하거나, 작업이 예상보다 오래 걸리면 [웹이나 IDE에서 세션을 계속](/desktop#continue-in-another-surface)하세요. [외부 도구를 연결](/desktop#extend-claude-code)하여 GitHub, Slack, Linear 등을 워크플로에 통합하세요.

## CLI에서 전환하시나요?

Desktop은 CLI와 동일한 엔진을 그래픽 인터페이스로 실행합니다. 동일한 프로젝트에서 두 가지를 동시에 실행할 수 있으며, 구성(CLAUDE.md 파일, MCP 서버, Hooks, Skills, 설정)을 공유합니다. 기능 비교, 플래그 대응, Desktop에서 사용할 수 없는 기능에 대한 전체 비교는 [CLI 비교](/desktop#coming-from-the-cli)를 참조하세요.

## 다음 단계

* [Claude Code Desktop 사용하기](/desktop): 권한 모드, 병렬 세션, diff 뷰, 커넥터, 엔터프라이즈 구성
* [문제 해결](/desktop#troubleshooting): 일반적인 오류 및 설정 문제 해결 방법
* [모범 사례](/best-practices): 효과적인 프롬프트 작성 및 Claude Code 활용 팁
* [일반적인 워크플로](/common-workflows): 디버깅, 리팩토링, 테스트 등의 튜토리얼
