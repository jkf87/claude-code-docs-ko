---
title: 터미널 환경 최적화
description: Claude Code에서 최상의 경험을 위한 터미널 설정 방법
---

# 터미널 환경 최적화

> Claude Code는 터미널이 올바르게 설정되어 있을 때 가장 잘 작동합니다. 아래 가이드라인을 따라 환경을 최적화하세요.

### 테마 및 외관

Claude는 터미널의 테마를 직접 제어할 수 없습니다. 테마는 터미널 애플리케이션에서 설정합니다. `/config` 명령어를 통해 언제든지 Claude Code의 테마를 터미널에 맞게 변경할 수 있습니다.

Claude Code 인터페이스 자체를 추가로 커스터마이징하려면 [사용자 정의 상태 표시줄](/statusline)을 설정하여 현재 모델, 작업 디렉토리, git 브랜치 등의 상황별 정보를 터미널 하단에 표시할 수 있습니다.

### 줄 바꿈

Claude Code에서 줄 바꿈을 입력하는 방법은 여러 가지가 있습니다:

* **빠른 이스케이프**: `\` 를 입력한 후 Enter를 눌러 새 줄 삽입
* **Ctrl+J**: 라인 피드 문자를 전송하며, 별도 설정 없이 모든 터미널에서 줄 바꿈으로 작동
* **Shift+Enter**: iTerm2, WezTerm, Ghostty, Kitty에서 기본 지원
* **키보드 단축키**: 다른 터미널에서 새 줄을 삽입하는 키 바인딩 설정 가능

#### /terminal-setup으로 Shift+Enter 설정하기

Claude Code 내에서 `/terminal-setup`을 실행하면 VS Code, Alacritty, Zed, Warp에서 Shift+Enter를 자동으로 설정합니다.

:::info
`/terminal-setup` 명령어는 수동 설정이 필요한 터미널에서만 표시됩니다. iTerm2, WezTerm, Ghostty, Kitty를 사용 중이라면 Shift+Enter가 기본적으로 작동하므로 이 명령어가 나타나지 않습니다.
:::

#### tmux에서 Shift+Enter 설정하기

tmux 내부에서는 확장 키 보고(extended key reporting)가 활성화되지 않으면 `Shift+Enter`가 새 줄 삽입 대신 제출로 작동합니다. `~/.tmux.conf`에 다음 줄을 추가하고 `tmux source-file ~/.tmux.conf`를 실행하여 설정을 다시 불러오세요:

```text
set -s extended-keys on
set -as terminal-features 'xterm*:extkeys'
```

Claude Code는 시작 시 확장 키를 요청하지만, `extended-keys`가 `on`으로 설정되지 않으면 tmux가 이 요청을 무시합니다. `terminal-features` 줄은 외부 터미널이 해당 시퀀스를 전송할 수 있음을 tmux에 알려줍니다.

#### macOS에서 Option+Enter 설정하기

macOS에서는 Option-as-Meta 설정을 활성화한 후 Terminal.app, iTerm2, VS Code 터미널에서 Option+Enter를 줄 바꿈 키 바인딩으로 사용할 수 있습니다.

**Terminal.app**

1. 설정 → 프로파일 → 키보드 열기
2. "Use Option as Meta Key" 체크

**iTerm2**

1. 설정 → 프로파일 → Keys 열기
2. General에서 Left/Right Option key를 "Esc+"로 설정

**VS Code**

VS Code 설정에서 `"terminal.integrated.macOptionIsMeta": true`로 설정합니다.

### 알림 설정

Claude가 작업을 완료하고 입력을 기다릴 때 알림 이벤트가 발생합니다. 이 이벤트를 터미널을 통해 데스크톱 알림으로 표시하거나 [알림 훅](/hooks#notification)으로 사용자 지정 동작을 실행할 수 있습니다.

#### 터미널 알림

Kitty와 Ghostty는 별도 설정 없이 데스크톱 알림을 지원합니다. iTerm 2는 다음과 같이 설정해야 합니다:

1. iTerm 2 설정 → 프로파일 → Terminal 열기
2. "Notification Center Alerts" 활성화
3. "Filter Alerts"를 클릭하고 "Send escape sequence-generated alerts" 체크

알림이 표시되지 않는 경우, OS 설정에서 터미널 앱의 알림 권한이 허용되어 있는지 확인하세요.

tmux 내에서 Claude Code를 실행할 때, 알림과 [터미널 진행 표시줄](/settings#global-config-settings)이 iTerm2, Kitty, Ghostty 등의 외부 터미널에 전달되려면 tmux 설정에서 passthrough를 활성화해야 합니다:

```
set -g allow-passthrough on
```

이 설정이 없으면 tmux가 이스케이프 시퀀스를 가로채어 터미널 애플리케이션에 전달되지 않습니다.

기본 macOS Terminal을 포함한 다른 터미널은 네이티브 알림을 지원하지 않습니다. 대신 [알림 훅](/hooks#notification)을 사용하세요.

#### 알림 훅

알림이 발생할 때 소리 재생이나 메시지 전송과 같은 사용자 지정 동작을 추가하려면 [알림 훅](/hooks#notification)을 설정하세요. 훅은 터미널 알림과 함께 실행되며, 대체 수단이 아닙니다.

### 화면 깜박임 및 메모리 사용 줄이기

긴 세션 중에 화면이 깜박이거나 Claude가 작업하는 동안 터미널 스크롤 위치가 상단으로 이동하는 경우, [전체 화면 렌더링](/fullscreen)을 시도해 보세요. 이 방식은 메모리를 일정하게 유지하고 마우스 지원을 추가하는 별도 렌더링 경로를 사용합니다. `CLAUDE_CODE_NO_FLICKER=1`로 활성화할 수 있습니다.

### 대용량 입력 처리

방대한 코드나 긴 지시사항을 다룰 때:

* **직접 붙여넣기 지양**: Claude Code는 매우 긴 붙여넣기 내용을 처리하는 데 어려움을 겪을 수 있습니다
* **파일 기반 워크플로우 사용**: 내용을 파일에 작성하고 Claude에게 해당 파일을 읽도록 요청하세요
* **VS Code 제한 사항 인지**: VS Code 터미널은 긴 붙여넣기를 잘라내는 경향이 있습니다

### Vim 모드

Claude Code는 `/config` → Editor mode를 통해 활성화할 수 있는 Vim 키 바인딩의 일부를 지원합니다. 설정 파일에서 직접 모드를 설정하려면 `~/.claude.json`의 [`editorMode`](/settings#global-config-settings) 전역 설정 키를 `"vim"`으로 설정하세요.

지원되는 기능은 다음과 같습니다:

* 모드 전환: `Esc` (NORMAL), `i`/`I`, `a`/`A`, `o`/`O` (INSERT)
* 탐색: `h`/`j`/`k`/`l`, `w`/`e`/`b`, `0`/`$`/`^`, `gg`/`G`, `f`/`F`/`t`/`T` (`;`/`,` 반복 포함)
* 편집: `x`, `dw`/`de`/`db`/`dd`/`D`, `cw`/`ce`/`cb`/`cc`/`C`, `.` (반복)
* Yank/붙여넣기: `yy`/`Y`, `yw`/`ye`/`yb`, `p`/`P`
* 텍스트 객체: `iw`/`aw`, `iW`/`aW`, `i"`/`a"`, `i'`/`a'`, `i(`/`a(`, `i[`/`a[`, `i{`/`a{`
* 들여쓰기: `>>`/`<<`
* 줄 조작: `J` (줄 합치기)

전체 참고 사항은 [대화형 모드](/interactive-mode#vim-editor-mode)를 참조하세요.
