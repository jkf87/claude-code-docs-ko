---
title: 키보드 단축키 커스터마이즈
description: 키 바인딩 설정 파일로 Claude Code의 키보드 단축키를 커스터마이즈합니다.
---

# 키보드 단축키 커스터마이즈

::: info 참고
커스터마이즈 가능한 키보드 단축키는 Claude Code v2.1.18 이상이 필요합니다. `claude --version`으로 버전을 확인하세요.
:::

Claude Code는 커스터마이즈 가능한 키보드 단축키를 지원합니다. `/keybindings`를 실행하여 `~/.claude/keybindings.json`에 설정 파일을 생성하거나 엽니다.

## 설정 파일

키 바인딩 설정 파일은 `bindings` 배열을 가진 객체입니다. 각 블록은 컨텍스트와 키 입력-액션 매핑을 지정합니다.

::: info 참고
키 바인딩 파일의 변경 사항은 자동으로 감지되어 Claude Code를 재시작하지 않고도 적용됩니다.
:::

| 필드 | 설명 |
| :--------- | :------------------------------------------------- |
| `$schema` | 편집기 자동 완성을 위한 선택적 JSON Schema URL |
| `$docs` | 선택적 문서 URL |
| `bindings` | 컨텍스트별 바인딩 블록 배열 |

이 예시는 chat 컨텍스트에서 `Ctrl+E`를 외부 편집기 열기에 바인딩하고 `Ctrl+U`를 언바인딩합니다:

```json  theme={null}
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

## 컨텍스트

각 바인딩 블록은 바인딩이 적용되는 **컨텍스트**를 지정합니다:

| 컨텍스트 | 설명 |
| :---------------- | :----------------------------------------------------------- |
| `Global` | 앱 전체에 적용 |
| `Chat` | 메인 채팅 입력 영역 |
| `Autocomplete` | 자동 완성 메뉴가 열려 있을 때 |
| `Settings` | 설정 메뉴 |
| `Confirmation` | 권한 및 확인 대화 상자 |
| `Tabs` | 탭 탐색 컴포넌트 |
| `Help` | 도움말 메뉴가 표시될 때 |
| `Transcript` | 트랜스크립트 뷰어 |
| `HistorySearch` | 기록 검색 모드 (Ctrl+R) |
| `Task` | 백그라운드 작업 실행 중 |
| `ThemePicker` | 테마 선택 대화 상자 |
| `Attachments` | 선택 대화 상자에서 이미지 첨부 탐색 |
| `Footer` | 푸터 표시기 탐색 (작업, 팀, diff) |
| `MessageSelector` | 되감기 및 요약 대화 상자 메시지 선택 |
| `DiffDialog` | Diff 뷰어 탐색 |
| `ModelPicker` | 모델 선택기 노력 수준 |
| `Select` | 일반 선택/목록 컴포넌트 |
| `Plugin` | 플러그인 대화 상자 (찾아보기, 발견, 관리) |
| `Scroll` | 전체 화면 모드에서 대화 스크롤 및 텍스트 선택 |
| `Doctor` | `/doctor` 진단 화면 |

## 사용 가능한 액션

액션은 `namespace:action` 형식을 따릅니다. 예를 들어 `chat:submit`은 메시지 전송, `app:toggleTodos`는 작업 목록 표시입니다. 각 컨텍스트에는 특정 액션이 사용 가능합니다.

### App 액션

`Global` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :--------------------- | :-------- | :-------------------------- |
| `app:interrupt` | Ctrl+C | 현재 작업 취소 |
| `app:exit` | Ctrl+D | Claude Code 종료 |
| `app:redraw` | (미설정) | 터미널 강제 다시 그리기 |
| `app:toggleTodos` | Ctrl+T | 작업 목록 표시 토글 |
| `app:toggleTranscript` | Ctrl+O | 상세 트랜스크립트 토글 |

### History 액션

명령 기록 탐색을 위한 액션:

| 액션 | 기본값 | 설명 |
| :----------------- | :------ | :-------------------- |
| `history:search` | Ctrl+R | 기록 검색 열기 |
| `history:previous` | Up | 이전 기록 항목 |
| `history:next` | Down | 다음 기록 항목 |

### Chat 액션

`Chat` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :-------------------- | :------------------------ | :---------------------------------- |
| `chat:cancel` | Escape | 현재 입력 취소 |
| `chat:clearInput` | Ctrl+L | 프롬프트 입력 지우기 |
| `chat:killAgents` | Ctrl+X Ctrl+K | 모든 백그라운드 에이전트 종료 |
| `chat:cycleMode` | Shift+Tab\* | 권한 모드 순환 |
| `chat:modelPicker` | Cmd+P / Meta+P | 모델 선택기 열기 |
| `chat:fastMode` | Meta+O | 빠른 모드 토글 |
| `chat:thinkingToggle` | Cmd+T / Meta+T | 확장 사고 토글 |
| `chat:submit` | Enter | 메시지 전송 |
| `chat:newline` | Ctrl+J | 제출 없이 새 줄 삽입 |
| `chat:undo` | Ctrl+\_, Ctrl+Shift+- | 마지막 작업 실행 취소 |
| `chat:externalEditor` | Ctrl+G, Ctrl+X Ctrl+E | 외부 편집기에서 열기 |
| `chat:stash` | Ctrl+S | 현재 프롬프트 스태시 |
| `chat:imagePaste` | Ctrl+V (Windows에서 Alt+V) | 이미지 붙여넣기 |

\*VT 모드가 없는 Windows(Node \<24.2.0/\<22.17.0, Bun \<1.2.23)에서는 Meta+M이 기본값입니다.

### Autocomplete 액션

`Autocomplete` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------------- | :------ | :------------------ |
| `autocomplete:accept` | Tab | 제안 수락 |
| `autocomplete:dismiss` | Escape | 메뉴 닫기 |
| `autocomplete:previous` | Up | 이전 제안 |
| `autocomplete:next` | Down | 다음 제안 |

### Confirmation 액션

`Confirmation` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :-------------------------- | :-------- | :---------------------------- |
| `confirm:yes` | Y, Enter | 작업 확인 |
| `confirm:no` | N, Escape | 작업 거부 |
| `confirm:previous` | Up | 이전 옵션 |
| `confirm:next` | Down | 다음 옵션 |
| `confirm:nextField` | Tab | 다음 필드 |
| `confirm:previousField` | (미설정) | 이전 필드 |
| `confirm:toggle` | Space | 선택 토글 |
| `confirm:cycleMode` | Shift+Tab | 권한 모드 순환 |
| `confirm:toggleExplanation` | Ctrl+E | 권한 설명 토글 |

### Permission 액션

권한 대화 상자에서 `Confirmation` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :----------------------- | :------ | :--------------------------- |
| `permission:toggleDebug` | Ctrl+D | 권한 디버그 정보 토글 |

### Transcript 액션

`Transcript` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :------------------------- | :---------------- | :---------------------- |
| `transcript:toggleShowAll` | Ctrl+E | 모든 콘텐츠 표시 토글 |
| `transcript:exit` | q, Ctrl+C, Escape | 트랜스크립트 뷰 종료 |

### History search 액션

`HistorySearch` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------------- | :---------- | :----------------------- |
| `historySearch:next` | Ctrl+R | 다음 일치 항목 |
| `historySearch:accept` | Escape, Tab | 선택 수락 |
| `historySearch:cancel` | Ctrl+C | 검색 취소 |
| `historySearch:execute` | Enter | 선택한 명령 실행 |

### Task 액션

`Task` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------- | :------ | :---------------------- |
| `task:background` | Ctrl+B | 현재 작업을 백그라운드로 |

### Theme 액션

`ThemePicker` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :------------------------------- | :------ | :------------------------- |
| `theme:toggleSyntaxHighlighting` | Ctrl+T | 구문 강조 토글 |

### Help 액션

`Help` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :------------- | :------ | :-------------- |
| `help:dismiss` | Escape | 도움말 메뉴 닫기 |

### Tabs 액션

`Tabs` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :-------------- | :-------------- | :----------- |
| `tabs:next` | Tab, Right | 다음 탭 |
| `tabs:previous` | Shift+Tab, Left | 이전 탭 |

### Attachments 액션

`Attachments` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :--------------------- | :---------------- | :------------------------- |
| `attachments:next` | Right | 다음 첨부 |
| `attachments:previous` | Left | 이전 첨부 |
| `attachments:remove` | Backspace, Delete | 선택한 첨부 제거 |
| `attachments:exit` | Down, Escape | 첨부 탐색 종료 |

### Footer 액션

`Footer` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------------- | :------ | :--------------------------------------- |
| `footer:next` | Right | 다음 푸터 항목 |
| `footer:previous` | Left | 이전 푸터 항목 |
| `footer:up` | Up | 푸터에서 위로 탐색 (맨 위에서 선택 해제) |
| `footer:down` | Down | 푸터에서 아래로 탐색 |
| `footer:openSelected` | Enter | 선택한 푸터 항목 열기 |
| `footer:clearSelection` | Escape | 푸터 선택 지우기 |

### Message selector 액션

`MessageSelector` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :----------------------- | :---------------------------------------- | :---------------- |
| `messageSelector:up` | Up, K, Ctrl+P | 목록에서 위로 이동 |
| `messageSelector:down` | Down, J, Ctrl+N | 목록에서 아래로 이동 |
| `messageSelector:top` | Ctrl+Up, Shift+Up, Meta+Up, Shift+K | 맨 위로 점프 |
| `messageSelector:bottom` | Ctrl+Down, Shift+Down, Meta+Down, Shift+J | 맨 아래로 점프 |
| `messageSelector:select` | Enter | 메시지 선택 |

### Diff 액션

`DiffDialog` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :-------------------- | :----------------- | :--------------------- |
| `diff:dismiss` | Escape | diff 뷰어 닫기 |
| `diff:previousSource` | Left | 이전 diff 소스 |
| `diff:nextSource` | Right | 다음 diff 소스 |
| `diff:previousFile` | Up | diff에서 이전 파일 |
| `diff:nextFile` | Down | diff에서 다음 파일 |
| `diff:viewDetails` | Enter | diff 상세 보기 |
| `diff:back` | (컨텍스트별) | diff 뷰어에서 뒤로 가기 |

### Model picker 액션

`ModelPicker` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :--------------------------- | :------ | :-------------------- |
| `modelPicker:decreaseEffort` | Left | 노력 수준 낮추기 |
| `modelPicker:increaseEffort` | Right | 노력 수준 높이기 |

### Select 액션

`Select` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------- | :-------------- | :--------------- |
| `select:next` | Down, J, Ctrl+N | 다음 옵션 |
| `select:previous` | Up, K, Ctrl+P | 이전 옵션 |
| `select:accept` | Enter | 선택 수락 |
| `select:cancel` | Escape | 선택 취소 |

### Plugin 액션

`Plugin` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :--------------- | :------ | :----------------------- |
| `plugin:toggle` | Space | 플러그인 선택 토글 |
| `plugin:install` | I | 선택한 플러그인 설치 |

### Settings 액션

`Settings` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :---------------- | :------ | :-------------------------------------------------------------------------- |
| `settings:search` | / | 검색 모드 진입 |
| `settings:retry` | R | 사용량 데이터 로딩 재시도 (오류 시) |
| `settings:close` | Enter | 변경 사항을 저장하고 설정 패널을 닫습니다. Escape는 변경 사항을 취소하고 닫습니다 |

### Doctor 액션

`Doctor` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :----------- | :------ | :-------------------------------------------------------------------------------------------------- |
| `doctor:fix` | F | 보고된 문제를 수정하기 위해 진단 보고서를 Claude에 전송합니다. 문제가 발견된 경우에만 활성화됩니다 |

### Voice 액션

[음성 받아쓰기](/voice-dictation)가 활성화된 경우 `Chat` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :----------------- | :------ | :----------------------- |
| `voice:pushToTalk` | Space | 길게 눌러 프롬프트 받아쓰기 |

### Scroll 액션

[전체 화면 렌더링](/fullscreen)이 활성화된 경우 `Scroll` 컨텍스트에서 사용 가능한 액션:

| 액션 | 기본값 | 설명 |
| :-------------------- | :------------------- | :------------------------------------------------------------------------------------------------------ |
| `scroll:lineUp` | (미설정) | 한 줄 위로 스크롤. 마우스 휠 스크롤이 이 액션을 트리거합니다 |
| `scroll:lineDown` | (미설정) | 한 줄 아래로 스크롤. 마우스 휠 스크롤이 이 액션을 트리거합니다 |
| `scroll:pageUp` | PageUp | 뷰포트 높이의 절반만큼 위로 스크롤 |
| `scroll:pageDown` | PageDown | 뷰포트 높이의 절반만큼 아래로 스크롤 |
| `scroll:top` | Ctrl+Home | 대화 시작으로 점프 |
| `scroll:bottom` | Ctrl+End | 최신 메시지로 점프하고 자동 따라가기 재활성화 |
| `scroll:halfPageUp` | (미설정) | 뷰포트 높이의 절반만큼 위로 스크롤. vi 스타일 리바인드를 위해 `scroll:pageUp`과 동일한 동작 제공 |
| `scroll:halfPageDown` | (미설정) | 뷰포트 높이의 절반만큼 아래로 스크롤. vi 스타일 리바인드를 위해 `scroll:pageDown`과 동일한 동작 제공 |
| `scroll:fullPageUp` | (미설정) | 뷰포트 전체 높이만큼 위로 스크롤 |
| `scroll:fullPageDown` | (미설정) | 뷰포트 전체 높이만큼 아래로 스크롤 |
| `selection:copy` | Ctrl+Shift+C / Cmd+C | 선택한 텍스트를 클립보드에 복사 |
| `selection:clear` | (미설정) | 활성 텍스트 선택 지우기 |

## 키 입력 구문

### 수정자 키

`+` 구분자로 수정자 키를 사용합니다:

* `ctrl` 또는 `control` - Control 키
* `alt`, `opt` 또는 `option` - Alt/Option 키
* `shift` - Shift 키
* `meta`, `cmd` 또는 `command` - Meta/Command 키

예시:

```text  theme={null}
ctrl+k          수정자가 있는 단일 키
shift+tab       Shift + Tab
meta+p          Command/Meta + P
ctrl+shift+c    여러 수정자
```

### 대문자

단독 대문자는 Shift를 암시합니다. 예를 들어 `K`는 `shift+k`와 동일합니다. 이는 대소문자 키가 다른 의미를 가지는 vim 스타일 바인딩에 유용합니다.

수정자가 있는 대문자(예: `ctrl+K`)는 스타일적으로 처리되며 Shift를 암시하지 **않습니다**: `ctrl+K`는 `ctrl+k`와 동일합니다.

### 코드

코드는 공백으로 구분된 키 입력 시퀀스입니다:

```text  theme={null}
ctrl+k ctrl+s   Ctrl+K를 누르고 놓은 후, Ctrl+S를 누릅니다
```

### 특수 키

* `escape` 또는 `esc` - Escape 키
* `enter` 또는 `return` - Enter 키
* `tab` - Tab 키
* `space` - 스페이스바
* `up`, `down`, `left`, `right` - 화살표 키
* `backspace`, `delete` - 삭제 키

## 기본 단축키 언바인딩

액션을 `null`로 설정하여 기본 단축키를 언바인딩합니다:

```json  theme={null}
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+s": null
      }
    }
  ]
}
```

이는 코드 바인딩에서도 작동합니다. 프리픽스를 공유하는 모든 코드를 언바인딩하면 해당 프리픽스를 단일 키 바인딩으로 사용할 수 있습니다:

```json  theme={null}
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+x ctrl+k": null,
        "ctrl+x ctrl+e": null,
        "ctrl+x": "chat:newline"
      }
    }
  ]
}
```

프리픽스의 일부 코드만 언바인딩하면 프리픽스를 누를 때 나머지 바인딩을 위한 코드 대기 모드에 진입합니다.

## 예약된 단축키

다음 단축키는 다시 바인딩할 수 없습니다:

| 단축키 | 이유 |
| :------- | :--------------------------------------------- |
| Ctrl+C | 하드코딩된 인터럽트/취소 |
| Ctrl+D | 하드코딩된 종료 |
| Ctrl+M | 터미널에서 Enter와 동일 (둘 다 CR 전송) |

## 터미널 충돌

일부 단축키는 터미널 멀티플렉서와 충돌할 수 있습니다:

| 단축키 | 충돌 |
| :------- | :-------------------------------- |
| Ctrl+B | tmux 프리픽스 (전송하려면 두 번 누르기) |
| Ctrl+A | GNU screen 프리픽스 |
| Ctrl+Z | Unix 프로세스 일시 중지 (SIGTSTP) |

## Vim 모드 상호 작용

`/config` → Editor mode를 통해 vim 모드가 활성화되면, 키 바인딩과 vim 모드는 독립적으로 작동합니다:

* **Vim 모드**는 텍스트 입력 수준에서 입력을 처리합니다 (커서 이동, 모드, 모션)
* **키 바인딩**은 컴포넌트 수준에서 액션을 처리합니다 (작업 목록 토글, 제출 등)
* vim 모드에서 Escape 키는 INSERT를 NORMAL 모드로 전환합니다; `chat:cancel`을 트리거하지 않습니다
* 대부분의 Ctrl+키 단축키는 vim 모드를 통과하여 키 바인딩 시스템으로 전달됩니다
* vim NORMAL 모드에서 `?`는 도움말 메뉴를 표시합니다 (vim 동작)

## 유효성 검사

Claude Code는 키 바인딩을 검증하고 다음에 대해 경고를 표시합니다:

* 파싱 오류 (잘못된 JSON 또는 구조)
* 잘못된 컨텍스트 이름
* 예약된 단축키 충돌
* 터미널 멀티플렉서 충돌
* 같은 컨텍스트에서 중복 바인딩

키 바인딩 경고를 확인하려면 `/doctor`를 실행하세요.
