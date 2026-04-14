---
title: Claude Code에서 Chrome 사용하기 (베타)
description: Claude Code를 Chrome 브라우저에 연결하여 웹 앱을 테스트하고, 콘솔 로그로 디버깅하고, 폼 자동 입력 및 웹 페이지에서 데이터를 추출합니다.
---

# Claude Code에서 Chrome 사용하기 (베타)

Claude Code는 Claude in Chrome 브라우저 확장 프로그램과 통합되어 CLI 또는 [VS Code 확장 프로그램](/vs-code#automate-browser-tasks-with-chrome)에서 브라우저 자동화 기능을 제공합니다. 코드를 빌드한 다음 컨텍스트를 전환하지 않고 브라우저에서 테스트하고 디버깅할 수 있습니다.

Claude는 브라우저 작업을 위해 새 탭을 열고 브라우저의 로그인 상태를 공유하므로 이미 로그인한 모든 사이트에 접근할 수 있습니다. 브라우저 작업은 실시간으로 보이는 Chrome 창에서 실행됩니다. Claude가 로그인 페이지나 CAPTCHA를 만나면 일시 정지하고 수동으로 처리하도록 요청합니다.

::: info
Chrome 통합은 베타 버전이며 현재 Google Chrome과 Microsoft Edge에서 작동합니다. Brave, Arc 또는 기타 Chromium 기반 브라우저에서는 아직 지원되지 않습니다. WSL(Windows Subsystem for Linux)도 지원되지 않습니다.
:::

## 기능

Chrome이 연결되면 단일 워크플로에서 브라우저 작업과 코딩 작업을 연결할 수 있습니다:

* **실시간 디버깅**: 콘솔 오류와 DOM 상태를 직접 읽은 다음 원인이 된 코드를 수정합니다
* **디자인 검증**: Figma 목업에서 UI를 빌드한 다음 브라우저에서 열어 일치하는지 확인합니다
* **웹 앱 테스트**: 폼 유효성 검사를 테스트하고, 시각적 회귀를 확인하거나, 사용자 플로를 검증합니다
* **인증된 웹 앱**: API 커넥터 없이 Google Docs, Gmail, Notion 또는 로그인한 모든 앱과 상호작용합니다
* **데이터 추출**: 웹 페이지에서 구조화된 정보를 가져와 로컬에 저장합니다
* **작업 자동화**: 데이터 입력, 폼 작성 또는 다중 사이트 워크플로와 같은 반복적인 브라우저 작업을 자동화합니다
* **세션 녹화**: 브라우저 상호작용을 GIF로 녹화하여 문서화하거나 공유합니다

## 사전 요구 사항

Claude Code에서 Chrome을 사용하기 전에 다음이 필요합니다:

* [Google Chrome](https://www.google.com/chrome/) 또는 [Microsoft Edge](https://www.microsoft.com/edge) 브라우저
* [Claude in Chrome 확장 프로그램](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) 버전 1.0.36 이상 (두 브라우저 모두 Chrome Web Store에서 사용 가능)
* [Claude Code](/quickstart#step-1-install-claude-code) 버전 2.0.73 이상
* Anthropic 직접 플랜 (Pro, Max, Team 또는 Enterprise)

::: info
Chrome 통합은 Amazon Bedrock, Google Cloud Vertex AI 또는 Microsoft Foundry와 같은 타사 제공업체를 통해 사용할 수 없습니다. 타사 제공업체를 통해서만 Claude에 접근하는 경우, 이 기능을 사용하려면 별도의 claude.ai 계정이 필요합니다.
:::

## CLI에서 시작하기

1. **Chrome과 함께 Claude Code 시작하기**

   `--chrome` 플래그와 함께 Claude Code를 시작합니다:

   ```bash
   claude --chrome
   ```

   기존 세션 내에서 `/chrome`을 실행하여 Chrome을 활성화할 수도 있습니다.

2. **Claude에게 브라우저 사용 요청하기**

   이 예제는 페이지로 이동하여 상호작용하고 발견한 내용을 보고합니다. 모두 터미널이나 에디터에서 수행됩니다:

   ```text
   Go to code.claude.com/docs, click on the search box,
   type "hooks", and tell me what results appear
   ```

언제든지 `/chrome`을 실행하여 연결 상태를 확인하고, 권한을 관리하거나, 확장 프로그램을 다시 연결할 수 있습니다.

VS Code의 경우 [VS Code에서 브라우저 자동화](/vs-code#automate-browser-tasks-with-chrome)를 참조하세요.

### 기본적으로 Chrome 활성화

매 세션마다 `--chrome`을 전달하지 않으려면 `/chrome`을 실행하고 "Enabled by default"를 선택하세요.

[VS Code 확장 프로그램](/vs-code#automate-browser-tasks-with-chrome)에서는 Chrome 확장 프로그램이 설치되어 있으면 Chrome을 바로 사용할 수 있습니다. 추가 플래그가 필요하지 않습니다.

::: info
CLI에서 Chrome을 기본적으로 활성화하면 브라우저 도구가 항상 로드되므로 컨텍스트 사용량이 증가합니다. 컨텍스트 소비가 증가한 것을 발견하면 이 설정을 비활성화하고 필요할 때만 `--chrome`을 사용하세요.
:::

### 사이트 권한 관리

사이트 수준 권한은 Chrome 확장 프로그램에서 상속됩니다. Chrome 확장 프로그램 설정에서 권한을 관리하여 Claude가 탐색, 클릭 및 입력할 수 있는 사이트를 제어하세요.

## 예제 워크플로

이 예제들은 브라우저 작업과 코딩 작업을 결합하는 일반적인 방법을 보여줍니다. `/mcp`를 실행하고 `claude-in-chrome`을 선택하면 사용 가능한 브라우저 도구의 전체 목록을 확인할 수 있습니다.

### 로컬 웹 애플리케이션 테스트

웹 앱을 개발할 때 Claude에게 변경 사항이 올바르게 작동하는지 확인하도록 요청합니다:

```text
I just updated the login form validation. Can you open localhost:3000,
try submitting the form with invalid data, and check if the error
messages appear correctly?
```

Claude는 로컬 서버로 이동하여 폼과 상호작용하고 관찰한 내용을 보고합니다.

### 콘솔 로그로 디버깅

Claude는 문제 진단을 돕기 위해 콘솔 출력을 읽을 수 있습니다. 로그가 장황할 수 있으므로 모든 콘솔 출력을 요청하는 대신 Claude에게 찾을 패턴을 알려주세요:

```text
Open the dashboard page and check the console for any errors when
the page loads.
```

Claude는 콘솔 메시지를 읽고 특정 패턴이나 오류 유형을 필터링할 수 있습니다.

### 폼 자동 입력

반복적인 데이터 입력 작업을 빠르게 처리합니다:

```text
I have a spreadsheet of customer contacts in contacts.csv. For each row,
go to the CRM at crm.example.com, click "Add Contact", and fill in the
name, email, and phone fields.
```

Claude는 로컬 파일을 읽고, 웹 인터페이스를 탐색하며, 각 레코드의 데이터를 입력합니다.

### Google Docs에서 콘텐츠 작성

API 설정 없이 Claude를 사용하여 문서에 직접 작성합니다:

```text
Draft a project update based on the recent commits and add it to my
Google Doc at docs.google.com/document/d/abc123
```

Claude는 문서를 열고 에디터를 클릭한 다음 내용을 입력합니다. 이는 로그인한 모든 웹 앱에서 작동합니다: Gmail, Notion, Sheets 등.

### 웹 페이지에서 데이터 추출

웹사이트에서 구조화된 정보를 가져옵니다:

```text
Go to the product listings page and extract the name, price, and
availability for each item. Save the results as a CSV file.
```

Claude는 페이지로 이동하여 콘텐츠를 읽고 데이터를 구조화된 형식으로 정리합니다.

### 다중 사이트 워크플로 실행

여러 웹사이트에 걸친 작업을 조율합니다:

```text
Check my calendar for meetings tomorrow, then for each meeting with
an external attendee, look up their company website and add a note
about what they do.
```

Claude는 탭 간을 이동하며 정보를 수집하고 워크플로를 완료합니다.

### 데모 GIF 녹화

브라우저 상호작용의 공유 가능한 녹화를 만듭니다:

```text
Record a GIF showing how to complete the checkout flow, from adding
an item to the cart through to the confirmation page.
```

Claude는 상호작용 시퀀스를 녹화하고 GIF 파일로 저장합니다.

## 문제 해결

### 확장 프로그램이 감지되지 않음

Claude Code에서 "Chrome extension not detected"가 표시되면:

1. `chrome://extensions`에서 Chrome 확장 프로그램이 설치되어 있고 활성화되어 있는지 확인합니다
2. `claude --version`을 실행하여 Claude Code가 최신 버전인지 확인합니다
3. Chrome이 실행 중인지 확인합니다
4. `/chrome`을 실행하고 "Reconnect extension"을 선택하여 연결을 다시 설정합니다
5. 문제가 계속되면 Claude Code와 Chrome을 모두 재시작합니다

Chrome 통합을 처음 활성화하면 Claude Code가 네이티브 메시징 호스트 설정 파일을 설치합니다. Chrome은 시작 시 이 파일을 읽으므로 첫 시도에서 확장 프로그램이 감지되지 않으면 Chrome을 재시작하여 새 설정을 적용하세요.

연결이 여전히 실패하면 호스트 설정 파일이 존재하는지 확인하세요:

Chrome의 경우:

* **macOS**: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
* **Linux**: `~/.config/google-chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
* **Windows**: Windows 레지스트리의 `HKCU\Software\Google\Chrome\NativeMessagingHosts\`를 확인하세요

Edge의 경우:

* **macOS**: `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
* **Linux**: `~/.config/microsoft-edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
* **Windows**: Windows 레지스트리의 `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\`를 확인하세요

### 브라우저가 응답하지 않음

Claude의 브라우저 명령이 작동을 멈추면:

1. 모달 대화 상자(alert, confirm, prompt)가 페이지를 차단하고 있는지 확인합니다. JavaScript 대화 상자는 브라우저 이벤트를 차단하고 Claude가 명령을 수신하지 못하게 합니다. 수동으로 대화 상자를 닫은 다음 Claude에게 계속하라고 알려주세요.
2. Claude에게 새 탭을 만들어 다시 시도하도록 요청합니다
3. `chrome://extensions`에서 Chrome 확장 프로그램을 비활성화하고 다시 활성화하여 재시작합니다

### 긴 세션 중 연결 끊김

Chrome 확장 프로그램의 서비스 워커는 장시간 세션 중에 유휴 상태가 되어 연결이 끊길 수 있습니다. 비활성 기간 후 브라우저 도구가 작동을 멈추면 `/chrome`을 실행하고 "Reconnect extension"을 선택하세요.

### Windows 관련 문제

Windows에서는 다음과 같은 문제가 발생할 수 있습니다:

* **Named pipe 충돌 (EADDRINUSE)**: 다른 프로세스가 동일한 named pipe를 사용하고 있으면 Claude Code를 재시작하세요. Chrome을 사용하고 있을 수 있는 다른 Claude Code 세션을 닫으세요.
* **네이티브 메시징 호스트 오류**: 네이티브 메시징 호스트가 시작 시 충돌하면 Claude Code를 재설치하여 호스트 설정을 다시 생성해 보세요.

### 일반적인 오류 메시지

가장 자주 발생하는 오류와 해결 방법입니다:

| 오류 | 원인 | 해결 방법 |
| ------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------- |
| "Browser extension is not connected" | 네이티브 메시징 호스트가 확장 프로그램에 연결할 수 없음 | Chrome과 Claude Code를 재시작한 다음 `/chrome`을 실행하여 다시 연결 |
| "Extension not detected" | Chrome 확장 프로그램이 설치되지 않았거나 비활성화됨 | `chrome://extensions`에서 확장 프로그램을 설치하거나 활성화 |
| "No tab available" | 탭이 준비되기 전에 Claude가 작업을 시도함 | Claude에게 새 탭을 만들어 다시 시도하도록 요청 |
| "Receiving end does not exist" | 확장 프로그램 서비스 워커가 유휴 상태가 됨 | `/chrome`을 실행하고 "Reconnect extension" 선택 |

## 관련 문서

* [컴퓨터 사용](/computer-use): 브라우저에서 수행할 수 없는 작업에 네이티브 macOS 앱을 제어
* [VS Code에서 Claude Code 사용하기](/vs-code#automate-browser-tasks-with-chrome): VS Code 확장 프로그램에서의 브라우저 자동화
* [CLI 레퍼런스](/cli-reference): `--chrome`을 포함한 명령줄 플래그
* [일반적인 워크플로](/common-workflows): Claude Code를 사용하는 더 많은 방법
* [데이터 및 개인정보](/data-usage): Claude Code가 데이터를 처리하는 방식
* [Claude in Chrome 시작하기](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome): 단축키, 예약 및 권한을 포함한 Chrome 확장 프로그램 전체 문서
