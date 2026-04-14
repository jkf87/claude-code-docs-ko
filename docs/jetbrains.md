---
title: JetBrains IDE
description: IntelliJ, PyCharm, WebStorm 등 JetBrains IDE에서 Claude Code를 사용하세요.
---

# JetBrains IDE

Claude Code는 전용 플러그인을 통해 JetBrains IDE와 통합되어 인터랙티브 diff 보기, 선택 컨텍스트 공유 등의 기능을 제공합니다.

## 지원되는 IDE

Claude Code 플러그인은 다음을 포함한 대부분의 JetBrains IDE에서 작동합니다:

* IntelliJ IDEA
* PyCharm
* Android Studio
* WebStorm
* PhpStorm
* GoLand

## 기능

* **빠른 실행**: `Cmd+Esc` (Mac) 또는 `Ctrl+Esc` (Windows/Linux)를 사용하여 편집기에서 직접 Claude Code를 열거나, UI의 Claude Code 버튼을 클릭합니다
* **Diff 보기**: 코드 변경 사항을 터미널 대신 IDE diff 뷰어에서 직접 표시할 수 있습니다
* **선택 컨텍스트**: IDE에서 현재 선택/탭이 자동으로 Claude Code와 공유됩니다
* **파일 참조 단축키**: `Cmd+Option+K` (Mac) 또는 `Alt+Ctrl+K` (Linux/Windows)를 사용하여 파일 참조를 삽입합니다 (예: @File#L1-99)
* **진단 공유**: IDE의 진단 오류(lint, 구문 등)가 작업 중 자동으로 Claude와 공유됩니다

## 설치

### 마켓플레이스 설치

JetBrains 마켓플레이스에서 [Claude Code 플러그인](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-)을 찾아 설치하고 IDE를 재시작하세요.

아직 Claude Code를 설치하지 않았다면 설치 방법은 [빠른 시작 가이드](/quickstart)를 참조하세요.

::: info 참고
플러그인을 설치한 후 적용하려면 IDE를 완전히 재시작해야 할 수 있습니다.
:::

## 사용법

### IDE에서 사용

IDE의 통합 터미널에서 `claude`를 실행하면 모든 통합 기능이 활성화됩니다.

### 외부 터미널에서 사용

외부 터미널에서 `/ide` 명령을 사용하여 Claude Code를 JetBrains IDE에 연결하고 모든 기능을 활성화합니다:

```bash  theme={null}
claude
```

```text  theme={null}
/ide
```

Claude가 IDE와 동일한 파일에 접근하려면 IDE 프로젝트 루트와 동일한 디렉토리에서 Claude Code를 시작하세요.

## 설정

### Claude Code 설정

Claude Code 설정을 통해 IDE 통합을 구성합니다:

1. `claude`를 실행합니다
2. `/config` 명령을 입력합니다
3. diff 도구를 `auto`로 설정하여 자동 IDE 감지를 활성화합니다

### 플러그인 설정

**Settings → Tools → Claude Code [Beta]**로 이동하여 Claude Code 플러그인을 구성합니다:

#### 일반 설정

* **Claude command**: Claude를 실행할 커스텀 명령을 지정합니다 (예: `claude`, `/usr/local/bin/claude` 또는 `npx @anthropic-ai/claude-code`)
* **Suppress notification for Claude command not found**: Claude 명령을 찾을 수 없다는 알림을 건너뜁니다
* **Enable using Option+Enter for multi-line prompts** (macOS 전용): 활성화하면 Option+Enter가 Claude Code 프롬프트에서 새 줄을 삽입합니다. Option 키가 예기치 않게 캡처되는 문제가 발생하면 비활성화하세요 (터미널 재시작 필요)
* **Enable automatic updates**: 플러그인 업데이트를 자동으로 확인하고 설치합니다 (재시작 시 적용)

::: tip
WSL 사용자의 경우: Claude 명령으로 `wsl -d Ubuntu -- bash -lic "claude"`를 설정하세요 (`Ubuntu`를 WSL 배포판 이름으로 교체)
:::

#### ESC 키 설정

JetBrains 터미널에서 ESC 키가 Claude Code 작업을 중단하지 않는 경우:

1. **Settings → Tools → Terminal**로 이동합니다
2. 다음 중 하나를 수행합니다:
   * "Move focus to the editor with Escape" 체크를 해제하거나
   * "Configure terminal keybindings"를 클릭하고 "Switch focus to Editor" 단축키를 삭제합니다
3. 변경 사항을 적용합니다

이렇게 하면 ESC 키가 Claude Code 작업을 올바르게 중단할 수 있습니다.

## 특수 설정

### 원격 개발

::: warning 주의
JetBrains 원격 개발을 사용할 때는 **Settings → Plugin (Host)**에서 원격 호스트에 플러그인을 설치해야 합니다.
:::

플러그인은 로컬 클라이언트 머신이 아닌 원격 호스트에 설치해야 합니다.

### WSL 설정

::: warning 주의
WSL 사용자는 IDE 감지가 제대로 작동하려면 추가 설정이 필요할 수 있습니다. 자세한 설정 방법은 [WSL 문제 해결 가이드](/troubleshooting#jetbrains-ide-not-detected-on-wsl2)를 참조하세요.
:::

WSL 설정에는 다음이 필요할 수 있습니다:

* 올바른 터미널 설정
* 네트워킹 모드 조정
* 방화벽 설정 업데이트

## 문제 해결

### 플러그인이 작동하지 않음

* 프로젝트 루트 디렉토리에서 Claude Code를 실행하고 있는지 확인하세요
* IDE 설정에서 JetBrains 플러그인이 활성화되어 있는지 확인하세요
* IDE를 완전히 재시작하세요 (여러 번 해야 할 수 있습니다)
* 원격 개발의 경우 원격 호스트에 플러그인이 설치되어 있는지 확인하세요

### IDE가 감지되지 않음

* 플러그인이 설치되고 활성화되어 있는지 확인하세요
* IDE를 완전히 재시작하세요
* 통합 터미널에서 Claude Code를 실행하고 있는지 확인하세요
* WSL 사용자의 경우 [WSL 문제 해결 가이드](/troubleshooting#jetbrains-ide-not-detected-on-wsl2)를 참조하세요

### 명령을 찾을 수 없음

Claude 아이콘을 클릭했을 때 "command not found"가 표시되는 경우:

1. Claude Code가 설치되어 있는지 확인합니다: `npm list -g @anthropic-ai/claude-code`
2. 플러그인 설정에서 Claude 명령 경로를 구성합니다
3. WSL 사용자의 경우 설정 섹션에서 언급된 WSL 명령 형식을 사용합니다

## 보안 고려 사항

Claude Code가 자동 편집 권한이 활성화된 JetBrains IDE에서 실행될 때, IDE에 의해 자동으로 실행될 수 있는 IDE 설정 파일을 수정할 수 있습니다. 이는 자동 편집 모드에서 Claude Code를 실행하는 위험을 증가시키고 bash 실행에 대한 Claude Code의 권한 프롬프트를 우회할 수 있습니다.

JetBrains IDE에서 실행할 때 다음을 고려하세요:

* 편집에 대해 수동 승인 모드 사용
* Claude가 신뢰할 수 있는 프롬프트에서만 사용되도록 각별히 주의
* Claude Code가 수정할 수 있는 파일을 인식

추가 도움이 필요하면 [문제 해결 가이드](/troubleshooting)를 참조하세요.
