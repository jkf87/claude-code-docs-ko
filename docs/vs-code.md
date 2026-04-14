---
title: VS Code에서 Claude Code 사용하기
description: VS Code용 Claude Code 확장 프로그램을 설치하고 설정하세요. 인라인 diff, @-멘션, 플랜 검토, 키보드 단축키로 AI 코딩 지원을 받을 수 있습니다.
---

# VS Code에서 Claude Code 사용하기

<img src="https://mintcdn.com/claude-code/-YhHHmtSxwr7W8gy/images/vs-code-extension-interface.jpg?fit=max&auto=format&n=-YhHHmtSxwr7W8gy&q=85&s=300652d5678c63905e6b0ea9e50835f8" alt="오른쪽에 Claude Code 확장 프로그램 패널이 열려 있는 VS Code 편집기, Claude와의 대화 표시" width="2500" height="1155" data-path="images/vs-code-extension-interface.jpg" />

VS Code 확장 프로그램은 IDE에 직접 통합된 Claude Code의 기본 그래픽 인터페이스를 제공합니다. 이것이 VS Code에서 Claude Code를 사용하는 권장 방법입니다.

확장 프로그램을 사용하면 Claude의 플랜을 수락하기 전에 검토하고 편집하거나, 편집 사항을 자동으로 수락하거나, 선택 영역에서 특정 줄 범위로 파일을 @-멘션하거나, 대화 기록에 액세스하거나, 별도의 탭이나 창에서 여러 대화를 열 수 있습니다.

## 사전 요구 사항

설치하기 전에 다음을 확인하세요:

* VS Code 1.98.0 이상
* Anthropic 계정 (확장 프로그램을 처음 열 때 로그인). Amazon Bedrock이나 Google Vertex AI와 같은 서드파티 공급자를 사용하는 경우 [서드파티 공급자 사용](#서드파티-공급자-사용)을 대신 참조하세요.

:::tip
확장 프로그램에는 CLI(명령줄 인터페이스)가 포함되어 있으며, 고급 기능을 위해 VS Code의 통합 터미널에서 액세스할 수 있습니다. 자세한 내용은 [VS Code 확장 프로그램 vs. Claude Code CLI](#vs-code-확장-프로그램-vs-claude-code-cli)를 참조하세요.
:::

## 확장 프로그램 설치

IDE 링크를 클릭하여 바로 설치하세요:

* [VS Code용 설치](vscode:extension/anthropic.claude-code)
* [Cursor용 설치](cursor:extension/anthropic.claude-code)

또는 VS Code에서 `Cmd+Shift+X` (Mac) 또는 `Ctrl+Shift+X` (Windows/Linux)를 눌러 확장 프로그램 보기를 열고, "Claude Code"를 검색한 다음 **설치**를 클릭하세요.

:::info
설치 후 확장 프로그램이 나타나지 않으면 VS Code를 다시 시작하거나 Command Palette에서 "Developer: Reload Window"를 실행하세요.
:::

## 시작하기

설치 후 VS Code 인터페이스를 통해 Claude Code를 사용할 수 있습니다:

**1단계: Claude Code 패널 열기**

VS Code 전반에 걸쳐 Spark 아이콘이 Claude Code를 나타냅니다: <img src="https://mintcdn.com/claude-code/c5r9_6tjPMzFdDDT/images/vs-code-spark-icon.svg?fit=max&auto=format&n=c5r9_6tjPMzFdDDT&q=85&s=3ca45e00deadec8c8f4b4f807da94505" alt="Spark 아이콘" style="display: inline; height: 0.85em; vertical-align: middle;" width="16" height="16" data-path="images/vs-code-spark-icon.svg" />

Claude를 여는 가장 빠른 방법은 **편집기 도구 모음**(편집기 오른쪽 상단)의 Spark 아이콘을 클릭하는 것입니다. 이 아이콘은 파일이 열려 있을 때만 나타납니다.

<img src="https://mintcdn.com/claude-code/mfM-EyoZGnQv8JTc/images/vs-code-editor-icon.png?fit=max&auto=format&n=mfM-EyoZGnQv8JTc&q=85&s=eb4540325d94664c51776dbbfec4cf02" alt="편집기 도구 모음에 Spark 아이콘이 표시된 VS Code 편집기" width="2796" height="734" data-path="images/vs-code-editor-icon.png" />

Claude Code를 여는 다른 방법:

* **Activity Bar**: 왼쪽 사이드바의 Spark 아이콘을 클릭하여 세션 목록을 엽니다. 세션을 클릭하면 전체 편집기 탭으로 열리거나 새로 시작할 수 있습니다. 이 아이콘은 Activity Bar에서 항상 표시됩니다.
* **Command Palette**: `Cmd+Shift+P` (Mac) 또는 `Ctrl+Shift+P` (Windows/Linux), "Claude Code"를 입력하고 "Open in New Tab"과 같은 옵션을 선택합니다.
* **Status Bar**: 창의 오른쪽 하단에서 **✱ Claude Code**를 클릭합니다. 파일이 열려 있지 않을 때도 작동합니다.

Claude 패널을 드래그하여 VS Code 어디에나 재배치할 수 있습니다. 자세한 내용은 [워크플로우 사용자 정의](#워크플로우-사용자-정의)를 참조하세요.

**2단계: 로그인**

처음 패널을 열면 로그인 화면이 나타납니다. **로그인**을 클릭하고 브라우저에서 인증을 완료하세요.

나중에 **Not logged in · Please run /login**이 표시되면 확장 프로그램이 자동으로 로그인 화면을 다시 엽니다. 나타나지 않으면 Command Palette에서 **Developer: Reload Window**로 창을 다시 로드하세요.

셸에 `ANTHROPIC_API_KEY`가 설정되어 있지만 로그인 프롬프트가 계속 표시되면 VS Code가 셸 환경을 상속하지 않았을 수 있습니다. `code .`로 터미널에서 VS Code를 실행하여 환경 변수를 상속받거나, Claude 계정으로 로그인하세요.

로그인 후 **Learn Claude Code** 체크리스트가 나타납니다. **Show me**를 클릭하여 각 항목을 진행하거나 X로 닫으세요. 나중에 다시 열려면 VS Code 설정의 Extensions → Claude Code에서 **Hide Onboarding** 체크를 해제하세요.

**3단계: 프롬프트 전송**

코드나 파일에 대해 Claude에게 도움을 요청하세요. 작동 방식 설명, 문제 디버깅, 변경 사항 적용 등을 물어볼 수 있습니다.

:::tip
Claude는 선택한 텍스트를 자동으로 봅니다. `Option+K` (Mac) / `Alt+K` (Windows/Linux)를 눌러 프롬프트에 @-멘션 참조(예: `@file.ts#5-10`)를 삽입할 수도 있습니다.
:::

파일의 특정 줄에 대해 질문하는 예시:

<img src="https://mintcdn.com/claude-code/FVYz38sRY-VuoGHA/images/vs-code-send-prompt.png?fit=max&auto=format&n=FVYz38sRY-VuoGHA&q=85&s=ede3ed8d8d5f940e01c5de636d009cfd" alt="Python 파일에서 2-3번째 줄이 선택된 VS Code 편집기와 @-멘션 참조를 사용하여 해당 줄에 대한 질문이 표시된 Claude Code 패널" width="3288" height="1876" data-path="images/vs-code-send-prompt.png" />

**4단계: 변경 사항 검토**

Claude가 파일을 편집하려고 할 때, 원본과 제안된 변경 사항을 나란히 비교하여 보여주고 권한을 요청합니다. 수락, 거부 또는 Claude에게 다른 방향을 제시할 수 있습니다.

<img src="https://mintcdn.com/claude-code/FVYz38sRY-VuoGHA/images/vs-code-edits.png?fit=max&auto=format&n=FVYz38sRY-VuoGHA&q=85&s=e005f9b41c541c5c7c59c082f7c4841c" alt="편집을 할지 묻는 권한 프롬프트와 함께 Claude의 제안된 변경 사항의 diff가 표시된 VS Code" width="3292" height="1876" data-path="images/vs-code-edits.png" />

Claude Code로 할 수 있는 더 많은 아이디어는 [일반 워크플로우](/common-workflows)를 참조하세요.

:::tip
Command Palette에서 "Claude Code: Open Walkthrough"를 실행하여 기본 사항에 대한 가이드 투어를 받을 수 있습니다.
:::

## 프롬프트 박스 사용

프롬프트 박스는 여러 기능을 지원합니다:

* **권한 모드**: 프롬프트 박스 하단의 모드 표시기를 클릭하여 모드를 전환합니다. 일반 모드에서는 Claude가 각 작업 전에 권한을 요청합니다. Plan 모드에서는 Claude가 수행할 내용을 설명하고 변경하기 전에 승인을 기다립니다. VS Code는 Claude가 시작하기 전에 피드백을 제공할 수 있도록 플랜을 전체 마크다운 문서로 자동으로 엽니다. 자동 수락 모드에서는 Claude가 묻지 않고 편집합니다. VS Code 설정의 `claudeCode.initialPermissionMode`에서 기본값을 설정할 수 있습니다.
* **명령 메뉴**: `/`를 클릭하거나 `/`를 입력하여 명령 메뉴를 엽니다. 파일 첨부, 모델 전환, 확장 사고 토글, 플랜 사용량 보기(`/usage`), [원격 제어](/remote-control) 세션 시작(`/remote-control`) 등의 옵션이 있습니다. Customize 섹션에서 MCP 서버, 훅, 메모리, 권한, 플러그인에 액세스할 수 있습니다. 터미널 아이콘이 있는 항목은 통합 터미널에서 열립니다.
* **컨텍스트 표시기**: 프롬프트 박스는 Claude의 컨텍스트 창을 얼마나 사용하고 있는지 보여줍니다. 필요할 때 Claude가 자동으로 압축하거나, `/compact`를 수동으로 실행할 수 있습니다.
* **확장 사고**: Claude가 복잡한 문제를 더 많은 시간을 들여 추론할 수 있게 합니다. 명령 메뉴(`/`)를 통해 켜세요. 자세한 내용은 [확장 사고](/common-workflows#use-extended-thinking-thinking-mode)를 참조하세요.
* **여러 줄 입력**: 전송하지 않고 새 줄을 추가하려면 `Shift+Enter`를 누르세요. 질문 대화 상자의 "Other" 자유 텍스트 입력에서도 작동합니다.

### 파일 및 폴더 참조

@-멘션을 사용하여 특정 파일이나 폴더에 대한 컨텍스트를 Claude에게 제공하세요. `@` 다음에 파일이나 폴더 이름을 입력하면 Claude가 해당 내용을 읽고 질문에 답하거나 변경할 수 있습니다. Claude Code는 퍼지 매칭을 지원하므로 부분 이름을 입력하여 원하는 항목을 찾을 수 있습니다:

```text
> Explain the logic in @auth (fuzzy matches auth.js, AuthService.ts, etc.)
> What's in @src/components/ (include a trailing slash for folders)
```

대용량 PDF의 경우 전체 파일 대신 특정 페이지를 읽도록 Claude에게 요청할 수 있습니다. 단일 페이지, 1-10페이지와 같은 범위, 또는 3페이지부터와 같은 개방형 범위를 지정할 수 있습니다.

편집기에서 텍스트를 선택하면 Claude가 강조 표시된 코드를 자동으로 볼 수 있습니다. 프롬프트 박스 하단에 선택된 줄 수가 표시됩니다. `Option+K` (Mac) / `Alt+K` (Windows/Linux)를 눌러 파일 경로와 줄 번호가 포함된 @-멘션(예: `@app.ts#5-10`)을 삽입하세요. 선택 표시기를 클릭하여 Claude가 강조 표시된 텍스트를 볼 수 있는지 토글합니다. 눈-슬래시 아이콘은 선택 영역이 Claude에게 숨겨져 있음을 의미합니다.

`Shift`를 누른 채로 파일을 프롬프트 박스로 드래그하여 첨부 파일로 추가할 수도 있습니다. 첨부 파일의 X를 클릭하면 컨텍스트에서 제거됩니다.

### 이전 대화 재개

Claude Code 패널 상단의 드롭다운을 클릭하여 대화 기록에 액세스하세요. 키워드로 검색하거나 시간별(오늘, 어제, 최근 7일 등)로 탐색할 수 있습니다. 대화를 클릭하면 전체 메시지 기록과 함께 재개됩니다. 새 세션은 첫 번째 메시지를 기반으로 AI가 생성한 제목을 받습니다. 세션 위에 마우스를 올리면 이름 변경 및 제거 작업이 표시됩니다. 이름을 변경하여 설명적인 제목을 부여하거나, 제거하여 목록에서 삭제하세요. 세션 재개에 대한 자세한 내용은 [일반 워크플로우](/common-workflows#resume-previous-conversations)를 참조하세요.

### Claude.ai의 원격 세션 재개

[웹에서 Claude Code](/claude-code-on-the-web)를 사용하는 경우 VS Code에서 직접 해당 원격 세션을 재개할 수 있습니다. 이 기능은 Anthropic Console이 아닌 **Claude.ai 구독**으로 로그인해야 합니다.

**1단계: 과거 대화 열기**

Claude Code 패널 상단의 **Past Conversations** 드롭다운을 클릭합니다.

**2단계: Remote 탭 선택**

대화 상자에는 Local과 Remote 두 탭이 표시됩니다. **Remote**를 클릭하여 claude.ai의 세션을 확인합니다.

**3단계: 재개할 세션 선택**

원격 세션을 탐색하거나 검색합니다. 세션을 클릭하면 다운로드되어 로컬에서 대화를 계속할 수 있습니다.

:::info
GitHub 저장소로 시작한 웹 세션만 Remote 탭에 표시됩니다. 재개하면 대화 기록이 로컬로 로드되며 변경 사항은 claude.ai에 다시 동기화되지 않습니다.
:::

## 워크플로우 사용자 정의

설정이 완료되면 Claude 패널을 재배치하거나, 여러 세션을 실행하거나, 터미널 모드로 전환할 수 있습니다.

### Claude 위치 선택

Claude 패널을 드래그하여 VS Code 어디에나 재배치할 수 있습니다. 패널의 탭이나 제목 표시줄을 잡고 드래그하세요:

* **보조 사이드바**: 창의 오른쪽. 코딩하는 동안 Claude를 계속 볼 수 있습니다.
* **기본 사이드바**: Explorer, Search 등의 아이콘이 있는 왼쪽 사이드바.
* **편집기 영역**: 파일 옆에 탭으로 Claude를 엽니다. 부가 작업에 유용합니다.

:::tip
주요 Claude 세션에는 사이드바를 사용하고 부가 작업에는 추가 탭을 여세요. Claude가 선호하는 위치를 기억합니다. Activity Bar 세션 목록 아이콘은 Claude 패널과 별개입니다. 세션 목록은 Activity Bar에 항상 표시되지만, Claude 패널 아이콘은 패널이 왼쪽 사이드바에 도킹된 경우에만 표시됩니다.
:::

### 여러 대화 실행

Command Palette에서 **Open in New Tab** 또는 **Open in New Window**를 사용하여 추가 대화를 시작하세요. 각 대화는 자체 기록과 컨텍스트를 유지하여 다른 작업을 병렬로 처리할 수 있습니다.

탭을 사용할 때, spark 아이콘의 작은 색상 점이 상태를 나타냅니다. 파란색은 권한 요청이 대기 중임을, 주황색은 탭이 숨겨진 동안 Claude가 완료되었음을 의미합니다.

### 터미널 모드로 전환

기본적으로 확장 프로그램은 그래픽 채팅 패널을 엽니다. CLI 스타일 인터페이스를 선호하는 경우 [Use Terminal 설정](vscode://settings/claudeCode.useTerminal)을 열고 체크박스를 선택하세요.

VS Code 설정(`Cmd+,` Mac 또는 `Ctrl+,` Windows/Linux)을 열고 Extensions → Claude Code로 이동하여 **Use Terminal**을 체크할 수도 있습니다.

## 플러그인 관리

VS Code 확장 프로그램에는 [플러그인](/plugins) 설치 및 관리를 위한 그래픽 인터페이스가 포함되어 있습니다. 프롬프트 박스에 `/plugins`를 입력하여 **플러그인 관리** 인터페이스를 엽니다.

### 플러그인 설치

플러그인 대화 상자에는 **Plugins**와 **Marketplaces** 두 탭이 있습니다.

Plugins 탭에서:

* **설치된 플러그인**은 상단에 활성화/비활성화 토글 스위치와 함께 표시됩니다
* 구성된 마켓플레이스의 **사용 가능한 플러그인**이 아래에 표시됩니다
* 이름이나 설명으로 플러그인을 필터링하여 검색합니다
* 사용 가능한 플러그인에서 **Install**을 클릭합니다

플러그인을 설치할 때 설치 범위를 선택하세요:

* **나를 위해 설치**: 모든 프로젝트에서 사용 가능 (사용자 범위)
* **이 프로젝트를 위해 설치**: 프로젝트 협력자와 공유 (프로젝트 범위)
* **로컬에 설치**: 이 저장소에서만, 나만 사용 (로컬 범위)

### 마켓플레이스 관리

**Marketplaces** 탭으로 전환하여 플러그인 소스를 추가하거나 제거하세요:

* GitHub 저장소, URL 또는 로컬 경로를 입력하여 새 마켓플레이스를 추가합니다
* 새로 고침 아이콘을 클릭하여 마켓플레이스의 플러그인 목록을 업데이트합니다
* 휴지통 아이콘을 클릭하여 마켓플레이스를 제거합니다

변경 사항을 적용하면 배너가 나타나 Claude Code를 다시 시작하라는 메시지가 표시됩니다.

:::info
VS Code의 플러그인 관리는 내부적으로 동일한 CLI 명령을 사용합니다. 확장 프로그램에서 구성한 플러그인과 마켓플레이스는 CLI에서도 사용할 수 있으며, 그 반대도 마찬가지입니다.
:::

플러그인 시스템에 대한 자세한 내용은 [플러그인](/plugins) 및 [플러그인 마켓플레이스](/plugin-marketplaces)를 참조하세요.

## Chrome으로 브라우저 작업 자동화

Claude를 Chrome 브라우저에 연결하여 웹 앱을 테스트하고, 콘솔 로그로 디버깅하고, VS Code를 떠나지 않고 브라우저 워크플로우를 자동화하세요. 이 기능은 [Claude in Chrome 확장 프로그램](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) 버전 1.0.36 이상이 필요합니다.

프롬프트 박스에 `@browser`를 입력하고 Claude에게 수행하려는 작업을 입력하세요:

```text
@browser go to localhost:3000 and check the console for errors
```

첨부 파일 메뉴를 열어 새 탭 열기나 페이지 콘텐츠 읽기와 같은 특정 브라우저 도구를 선택할 수도 있습니다.

Claude는 브라우저 작업을 위해 새 탭을 열고 브라우저의 로그인 상태를 공유하므로, 이미 로그인한 모든 사이트에 액세스할 수 있습니다.

설정 지침, 전체 기능 목록 및 문제 해결을 위해서는 [Chrome과 함께 Claude Code 사용하기](/chrome)를 참조하세요.

## VS Code 명령 및 단축키

Command Palette(`Cmd+Shift+P` Mac 또는 `Ctrl+Shift+P` Windows/Linux)를 열고 "Claude Code"를 입력하면 Claude Code 확장 프로그램에 사용 가능한 모든 VS Code 명령을 볼 수 있습니다.

일부 단축키는 어떤 패널이 "포커스"되어 있는지(키보드 입력을 받는지)에 따라 달라집니다. 커서가 코드 파일에 있으면 편집기가 포커스됩니다. 커서가 Claude의 프롬프트 박스에 있으면 Claude가 포커스됩니다. `Cmd+Esc` / `Ctrl+Esc`를 사용하여 둘 사이를 전환할 수 있습니다.

:::info
이것은 확장 프로그램을 제어하기 위한 VS Code 명령입니다. 모든 내장 Claude Code 명령이 확장 프로그램에서 사용 가능한 것은 아닙니다. 자세한 내용은 [VS Code 확장 프로그램 vs. Claude Code CLI](#vs-code-확장-프로그램-vs-claude-code-cli)를 참조하세요.
:::

| 명령 | 단축키 | 설명 |
| ---- | ------ | ---- |
| Focus Input | `Cmd+Esc` (Mac) / `Ctrl+Esc` (Windows/Linux) | 편집기와 Claude 간 포커스 전환 |
| Open in Side Bar | - | 왼쪽 사이드바에서 Claude 열기 |
| Open in Terminal | - | 터미널 모드에서 Claude 열기 |
| Open in New Tab | `Cmd+Shift+Esc` (Mac) / `Ctrl+Shift+Esc` (Windows/Linux) | 편집기 탭으로 새 대화 열기 |
| Open in New Window | - | 별도 창에서 새 대화 열기 |
| New Conversation | `Cmd+N` (Mac) / `Ctrl+N` (Windows/Linux) | 새 대화 시작. Claude가 포커스되고 `enableNewConversationShortcut`이 `true`로 설정되어 있어야 합니다 |
| Insert @-Mention Reference | `Option+K` (Mac) / `Alt+K` (Windows/Linux) | 현재 파일 및 선택 영역에 대한 참조 삽입 (편집기 포커스 필요) |
| Show Logs | - | 확장 프로그램 디버그 로그 보기 |
| Logout | - | Anthropic 계정 로그아웃 |

### 다른 도구에서 VS Code 탭 실행

확장 프로그램은 `vscode://anthropic.claude-code/open`에 URI 핸들러를 등록합니다. 셸 별칭, 브라우저 북마크릿 또는 URL을 열 수 있는 스크립트와 같은 자체 도구에서 새 Claude Code 탭을 열 때 사용하세요. VS Code가 아직 실행 중이 아니면 URL을 열 때 먼저 실행됩니다. VS Code가 이미 실행 중이면 URL이 현재 포커스된 창에서 열립니다.

운영 체제의 URL 오프너로 핸들러를 호출합니다. macOS에서:

```bash
open "vscode://anthropic.claude-code/open"
```

Linux에서는 `xdg-open`, Windows에서는 `start`를 사용하세요.

핸들러는 두 가지 선택적 쿼리 매개변수를 허용합니다:

| 매개변수 | 설명 |
| -------- | ---- |
| `prompt` | 프롬프트 박스에 미리 채울 텍스트. URL 인코딩이 필요합니다. 프롬프트는 미리 채워지지만 자동으로 전송되지 않습니다. |
| `session` | 새 대화를 시작하는 대신 재개할 세션 ID. VS Code에서 현재 열린 워크스페이스에 속한 세션이어야 합니다. 세션을 찾을 수 없으면 새 대화가 시작됩니다. 세션이 이미 탭에서 열려 있으면 해당 탭이 포커스됩니다. 세션 ID를 프로그래밍 방식으로 캡처하려면 [대화 계속하기](/headless#continue-conversations)를 참조하세요. |

예를 들어, "review my changes"가 미리 채워진 탭을 열려면:

```text
vscode://anthropic.claude-code/open?prompt=review%20my%20changes
```

## 설정 구성

확장 프로그램에는 두 가지 유형의 설정이 있습니다:

* **VS Code의 확장 프로그램 설정**: VS Code 내에서 확장 프로그램의 동작을 제어합니다. `Cmd+,` (Mac) 또는 `Ctrl+,` (Windows/Linux)로 열고 Extensions → Claude Code로 이동합니다. `/`를 입력하고 **General Config**를 선택하여 설정을 열 수도 있습니다.
* **`~/.claude/settings.json`의 Claude Code 설정**: 확장 프로그램과 CLI 간에 공유됩니다. 허용된 명령, 환경 변수, 훅 및 MCP 서버에 사용합니다. 자세한 내용은 [설정](/settings)을 참조하세요.

:::tip
`settings.json`에 `"$schema": "https://json.schemastore.org/claude-code-settings.json"`을 추가하면 VS Code에서 모든 사용 가능한 설정에 대한 자동 완성 및 인라인 유효성 검사를 받을 수 있습니다.
:::

### 확장 프로그램 설정

| 설정 | 기본값 | 설명 |
| ---- | ------ | ---- |
| `useTerminal` | `false` | 그래픽 패널 대신 터미널 모드에서 Claude 실행 |
| `initialPermissionMode` | `default` | 새 대화의 승인 프롬프트 제어: `default`, `plan`, `acceptEdits`, 또는 `bypassPermissions`. [권한 모드](/permission-modes)를 참조하세요. |
| `preferredLocation` | `panel` | Claude가 열리는 위치: `sidebar` (오른쪽) 또는 `panel` (새 탭) |
| `autosave` | `true` | Claude가 파일을 읽거나 쓰기 전에 자동 저장 |
| `useCtrlEnterToSend` | `false` | Enter 대신 Ctrl/Cmd+Enter를 사용하여 프롬프트 전송 |
| `enableNewConversationShortcut` | `false` | Cmd/Ctrl+N으로 새 대화 시작 활성화 |
| `hideOnboarding` | `false` | 온보딩 체크리스트 숨기기 (졸업모자 아이콘) |
| `respectGitIgnore` | `true` | 파일 검색에서 .gitignore 패턴 제외 |
| `usePythonEnvironment` | `true` | Claude 실행 시 워크스페이스의 Python 환경 활성화. Python 확장 프로그램이 필요합니다. |
| `environmentVariables` | `[]` | Claude 프로세스의 환경 변수 설정. 공유 구성에는 Claude Code 설정을 사용하세요. |
| `disableLoginPrompt` | `false` | 인증 프롬프트 건너뜀 (서드파티 공급자 설정용) |
| `allowDangerouslySkipPermissions` | `false` | 모드 선택기에 [Auto 모드](/permission-modes#eliminate-prompts-with-auto-mode)와 권한 우회를 추가합니다. Auto 모드에는 [플랜, 관리자, 모델 및 공급자 요구 사항](/permission-modes#eliminate-prompts-with-auto-mode)이 있으므로 이 토글을 켜도 사용 불가능할 수 있습니다. 인터넷 액세스 없는 샌드박스에서만 권한 우회를 사용하세요. |
| `claudeProcessWrapper` | - | Claude 프로세스를 시작하는 데 사용되는 실행 파일 경로 |

## VS Code 확장 프로그램 vs. Claude Code CLI

Claude Code는 VS Code 확장 프로그램(그래픽 패널)과 CLI(터미널의 명령줄 인터페이스) 모두로 사용할 수 있습니다. 일부 기능은 CLI에서만 사용할 수 있습니다. CLI 전용 기능이 필요하면 VS Code의 통합 터미널에서 `claude`를 실행하세요.

| 기능 | CLI | VS Code 확장 프로그램 |
| ---- | --- | --------------------- |
| 명령 및 스킬 | [모두](/commands) | 일부 (`/`를 입력하여 사용 가능한 항목 확인) |
| MCP 서버 구성 | 예 | 부분 (CLI로 서버 추가; 채팅 패널에서 `/mcp`로 기존 서버 관리) |
| 체크포인트 | 예 | 예 |
| `!` bash 단축키 | 예 | 아니오 |
| 탭 완성 | 예 | 아니오 |

### 체크포인트로 되돌리기

VS Code 확장 프로그램은 Claude의 파일 편집을 추적하고 이전 상태로 되돌릴 수 있는 체크포인트를 지원합니다. 메시지 위에 마우스를 올려 되돌리기 버튼을 표시하고 세 가지 옵션 중 하나를 선택하세요:

* **Fork conversation from here**: 모든 코드 변경 사항을 유지하면서 이 메시지에서 새 대화 분기 시작
* **Rewind code to here**: 전체 대화 기록을 유지하면서 대화의 이 시점으로 파일 변경 사항 되돌리기
* **Fork conversation and rewind code**: 새 대화 분기를 시작하고 파일 변경 사항을 이 시점으로 되돌리기

체크포인트의 작동 방식과 제한 사항에 대한 자세한 내용은 [체크포인팅](/checkpointing)을 참조하세요.

### VS Code에서 CLI 실행

VS Code에서 머물면서 CLI를 사용하려면 통합 터미널(Windows/Linux의 경우 `` Ctrl+` ``, Mac의 경우 `` Cmd+` ``)을 열고 `claude`를 실행하세요. CLI는 diff 보기 및 진단 공유와 같은 기능을 위해 IDE와 자동으로 통합됩니다.

외부 터미널을 사용하는 경우 Claude Code 내에서 `/ide`를 실행하여 VS Code에 연결하세요.

### 확장 프로그램과 CLI 간 전환

확장 프로그램과 CLI는 동일한 대화 기록을 공유합니다. 확장 프로그램 대화를 CLI에서 계속하려면 터미널에서 `claude --resume`을 실행하세요. 그러면 대화를 검색하고 선택할 수 있는 인터랙티브 선택기가 열립니다.

### 프롬프트에 터미널 출력 포함

`@terminal:name`을 사용하여 프롬프트에서 터미널 출력을 참조하세요. 여기서 `name`은 터미널의 제목입니다. 이렇게 하면 Claude가 복사-붙여넣기 없이 명령 출력, 오류 메시지 또는 로그를 볼 수 있습니다.

### 백그라운드 프로세스 모니터링

Claude가 장시간 실행되는 명령을 실행하면 확장 프로그램이 상태 표시줄에 진행 상황을 표시합니다. 그러나 백그라운드 작업의 가시성은 CLI에 비해 제한적입니다. 더 나은 가시성을 위해 Claude에게 명령을 출력하도록 요청하여 VS Code의 통합 터미널에서 실행할 수 있습니다.

### MCP로 외부 도구 연결

MCP (Model Context Protocol) 서버는 Claude에게 외부 도구, 데이터베이스 및 API에 대한 액세스를 제공합니다.

MCP 서버를 추가하려면 통합 터미널(`` Ctrl+` `` 또는 `` Cmd+` ``)을 열고 다음을 실행하세요:

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

구성 후 Claude에게 도구 사용을 요청합니다(예: "Review PR #456").

VS Code를 떠나지 않고 MCP 서버를 관리하려면 채팅 패널에 `/mcp`를 입력하세요. MCP 관리 대화 상자에서 서버를 활성화하거나 비활성화하고, 서버에 다시 연결하고, OAuth 인증을 관리할 수 있습니다. 사용 가능한 서버는 [MCP 설명서](/mcp)를 참조하세요.

## git으로 작업하기

Claude Code는 git과 통합되어 VS Code에서 직접 버전 제어 워크플로우를 지원합니다. Claude에게 변경 사항 커밋, 풀 리퀘스트 생성 또는 브랜치 간 작업을 요청하세요.

### 커밋 및 풀 리퀘스트 생성

Claude는 변경 사항 스테이징, 커밋 메시지 작성 및 작업을 기반으로 풀 리퀘스트를 생성할 수 있습니다:

```text
> commit my changes with a descriptive message
> create a pr for this feature
> summarize the changes I've made to the auth module
```

풀 리퀘스트를 생성할 때 Claude는 실제 코드 변경 사항을 기반으로 설명을 생성하고 테스트 또는 구현 결정에 대한 컨텍스트를 추가할 수 있습니다.

### 병렬 작업에 git worktree 사용

`--worktree` (`-w`) 플래그를 사용하여 자체 파일과 브랜치가 있는 격리된 worktree에서 Claude를 시작하세요:

```bash
claude --worktree feature-auth
```

각 worktree는 git 히스토리를 공유하면서 독립적인 파일 상태를 유지합니다. 이렇게 하면 다른 작업을 할 때 Claude 인스턴스들이 서로 방해하지 않습니다. 자세한 내용은 [Git worktree로 병렬 세션 실행하기](/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)를 참조하세요.

## 서드파티 공급자 사용

기본적으로 Claude Code는 Anthropic의 API에 직접 연결합니다. 조직에서 Amazon Bedrock, Google Vertex AI 또는 Microsoft Foundry를 사용하여 Claude에 액세스하는 경우 대신 공급자를 사용하도록 확장 프로그램을 구성하세요:

**1단계: 로그인 프롬프트 비활성화**

[Disable Login Prompt 설정](vscode://settings/claudeCode.disableLoginPrompt)을 열고 체크박스를 선택합니다.

VS Code 설정(`Cmd+,` Mac 또는 `Ctrl+,` Windows/Linux)을 열고 "Claude Code login"을 검색하여 **Disable Login Prompt**를 체크할 수도 있습니다.

**2단계: 공급자 구성**

공급자의 설정 가이드를 따르세요:

* [Amazon Bedrock의 Claude Code](/amazon-bedrock)
* [Google Vertex AI의 Claude Code](/google-vertex-ai)
* [Microsoft Foundry의 Claude Code](/microsoft-foundry)

이 가이드에서는 `~/.claude/settings.json`에 공급자를 구성하는 방법을 다루며, VS Code 확장 프로그램과 CLI 간에 설정이 공유됩니다.

## 보안 및 개인 정보 보호

코드는 비공개로 유지됩니다. Claude Code는 지원을 제공하기 위해 코드를 처리하지만 모델 학습에 사용하지 않습니다. 데이터 처리 및 로깅 옵트아웃 방법에 대한 자세한 내용은 [데이터 및 개인 정보 보호](/data-usage)를 참조하세요.

자동 편집 권한이 활성화된 경우 Claude Code는 VS Code가 자동으로 실행할 수 있는 VS Code 구성 파일(예: `settings.json` 또는 `tasks.json`)을 수정할 수 있습니다. 신뢰할 수 없는 코드를 다룰 때 위험을 줄이려면:

* 신뢰할 수 없는 워크스페이스에 [VS Code 제한 모드](https://code.visualstudio.com/docs/editor/workspace-trust#_restricted-mode) 활성화
* 자동 수락 대신 수동 승인 모드 사용
* 수락하기 전에 변경 사항을 주의 깊게 검토

### 내장 IDE MCP 서버

확장 프로그램이 활성화되면 CLI가 자동으로 연결하는 로컬 MCP 서버를 실행합니다. 이것이 CLI가 VS Code의 기본 diff 뷰어에서 diff를 열고, `@`-멘션을 위한 현재 선택 영역을 읽고, Jupyter 노트북에서 작업할 때 VS Code에 셀을 실행하도록 요청하는 방법입니다.

서버는 `ide`라는 이름으로 구성할 것이 없기 때문에 `/mcp`에서 숨겨져 있습니다. 그러나 조직에서 MCP 도구를 허용 목록에 추가하기 위해 `PreToolUse` 훅을 사용하는 경우 존재를 알아야 합니다.

**전송 및 인증.** 서버는 임의의 높은 포트에서 `127.0.0.1`에 바인딩되며 다른 컴퓨터에서는 접근할 수 없습니다. 각 확장 프로그램 활성화 시 CLI가 연결에 제공해야 하는 새로운 임의 인증 토큰이 생성됩니다. 토큰은 `0700` 디렉토리의 `0600` 권한으로 `~/.claude/ide/` 아래의 잠금 파일에 기록되므로 VS Code를 실행하는 사용자만 읽을 수 있습니다.

**모델에 노출되는 도구.** 서버는 수십 가지 도구를 호스팅하지만 모델에는 두 가지만 표시됩니다. 나머지는 CLI가 자체 UI에 사용하는 내부 RPC(diff 열기, 선택 읽기, 파일 저장)로 도구 목록이 Claude에 도달하기 전에 필터링됩니다.

| 도구 이름 (훅에서 표시되는 이름) | 기능 | 쓰기 여부 |
| --------------------------------- | ---- | --------- |
| `mcp__ide__getDiagnostics` | VS Code의 Problems 패널에 있는 언어 서버 진단(오류 및 경고)을 반환합니다. 선택적으로 하나의 파일로 범위를 지정할 수 있습니다. | 아니오 |
| `mcp__ide__executeCode` | 활성 Jupyter 노트북의 커널에서 Python 코드를 실행합니다. 아래의 확인 흐름을 참조하세요. | 예 |

**Jupyter 실행은 항상 먼저 확인합니다.** `mcp__ide__executeCode`는 자동으로 실행할 수 없습니다. 각 호출 시 코드가 활성 노트북 끝에 새 셀로 삽입되고 VS Code가 이를 보이게 스크롤하며, 기본 Quick Pick이 **Execute** 또는 **Cancel**을 묻습니다. `Esc`로 취소하거나 선택기를 닫으면 Claude에게 오류가 반환되고 아무것도 실행되지 않습니다. 이 도구는 활성 노트북이 없거나, Jupyter 확장 프로그램(`ms-toolsai.jupyter`)이 설치되어 있지 않거나, 커널이 Python이 아닌 경우에도 완전히 거부합니다.

:::info
Quick Pick 확인은 `PreToolUse` 훅과 별개입니다. `mcp__ide__executeCode`에 대한 허용 목록 항목은 Claude가 셀 실행을 *제안*할 수 있게 합니다. VS Code 내의 Quick Pick이 실제로 *실행*할 수 있게 합니다.
:::

<a id="troubleshooting" />

## 일반적인 문제 해결

### 확장 프로그램 설치 불가

* VS Code의 호환 가능한 버전(1.98.0 이상)이 있는지 확인하세요
* VS Code에 확장 프로그램을 설치할 권한이 있는지 확인하세요
* [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)에서 직접 설치해 보세요

### Spark 아이콘이 보이지 않음

Spark 아이콘은 파일이 열려 있을 때 **편집기 도구 모음**(편집기 오른쪽 상단)에 나타납니다. 표시되지 않는 경우:

1. **파일 열기**: 아이콘은 파일이 열려 있어야 합니다. 폴더만 열려 있는 것으로는 충분하지 않습니다.
2. **VS Code 버전 확인**: 1.98.0 이상이 필요합니다 (Help → About)
3. **VS Code 다시 시작**: Command Palette에서 "Developer: Reload Window" 실행
4. **충돌하는 확장 프로그램 비활성화**: 다른 AI 확장 프로그램(Cline, Continue 등)을 일시적으로 비활성화
5. **워크스페이스 신뢰 확인**: 확장 프로그램은 제한 모드에서 작동하지 않습니다

또는 **Status Bar**(오른쪽 하단)에서 "✱ Claude Code"를 클릭하세요. 파일 없이도 작동합니다. **Command Palette**(`Cmd+Shift+P` / `Ctrl+Shift+P`)를 사용하고 "Claude Code"를 입력할 수도 있습니다.

### Claude Code가 응답하지 않음

Claude Code가 프롬프트에 응답하지 않는 경우:

1. **인터넷 연결 확인**: 안정적인 인터넷 연결이 있는지 확인
2. **새 대화 시작**: 새 대화를 시작하여 문제가 지속되는지 확인
3. **CLI 시도**: 터미널에서 `claude`를 실행하여 더 자세한 오류 메시지 확인

문제가 지속되면 오류에 대한 자세한 내용과 함께 [GitHub에 이슈를 제출](https://github.com/anthropics/claude-code/issues)하세요.

## 확장 프로그램 제거

Claude Code 확장 프로그램을 제거하려면:

1. 확장 프로그램 보기 열기 (`Cmd+Shift+X` Mac 또는 `Ctrl+Shift+X` Windows/Linux)
2. "Claude Code" 검색
3. **제거** 클릭

확장 프로그램 데이터를 제거하고 모든 설정을 초기화하려면:

```bash
rm -rf ~/.vscode/globalStorage/anthropic.claude-code
```

추가 도움이 필요하면 [문제 해결 가이드](/troubleshooting)를 참조하세요.

## 다음 단계

VS Code에서 Claude Code를 설정했으니:

* [일반 워크플로우 탐색하기](/common-workflows)로 Claude Code를 최대한 활용하세요
* [MCP 서버 설정하기](/mcp)로 외부 도구로 Claude의 기능을 확장하세요. CLI로 서버를 추가한 다음 채팅 패널에서 `/mcp`로 관리하세요.
* [Claude Code 설정 구성하기](/settings)로 허용된 명령, 훅 등을 사용자 정의하세요. 이러한 설정은 확장 프로그램과 CLI 간에 공유됩니다.
