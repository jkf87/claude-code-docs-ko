# CLI에서 Claude가 컴퓨터를 사용하도록 하기

> Claude Code CLI에서 computer use를 활성화하면 Claude가 macOS에서 앱을 열고, 클릭하고, 타이핑하고, 화면을 볼 수 있습니다. 네이티브 앱 테스트, 시각적 문제 디버깅, GUI 전용 도구 자동화를 터미널을 떠나지 않고 수행할 수 있습니다.

::: info
Computer use는 Pro 또는 Max 플랜이 필요한 macOS 리서치 프리뷰입니다. Team 또는 Enterprise 플랜에서는 사용할 수 없습니다. Claude Code v2.1.85 이상과 대화형 세션이 필요하므로, `-p` 플래그를 사용한 비대화형 모드에서는 사용할 수 없습니다.
:::

Computer use를 통해 Claude는 앱을 열고, 화면을 제어하고, 여러분이 하는 것처럼 컴퓨터에서 작업할 수 있습니다. CLI에서 Claude는 Swift 앱을 컴파일하고, 실행하고, 모든 버튼을 클릭하고, 결과를 스크린샷으로 캡처하는 것을 코드를 작성한 동일한 대화에서 모두 수행할 수 있습니다.

이 페이지에서는 CLI에서 computer use가 작동하는 방식을 다룹니다. macOS 또는 Windows의 Desktop 앱에 대해서는 [Desktop에서의 computer use](/desktop#let-claude-use-your-computer)를 참조하세요.

## computer use로 할 수 있는 것

Computer use는 GUI가 필요한 작업, 즉 일반적으로 터미널을 벗어나 수동으로 해야 하는 모든 작업을 처리합니다.

* **네이티브 앱 빌드 및 검증**: Claude에게 macOS 메뉴 바 앱을 빌드하도록 요청하세요. Claude가 Swift를 작성하고, 컴파일하고, 실행하고, 모든 컨트롤을 클릭하여 여러분이 열기 전에 작동하는지 확인합니다.
* **엔드투엔드 UI 테스트**: Claude에게 로컬 Electron 앱을 가리키고 "온보딩 플로우를 테스트해줘"라고 말하세요. Claude가 앱을 열고, 가입을 클릭하고, 각 단계를 스크린샷으로 캡처합니다. Playwright 설정이나 테스트 하니스가 필요 없습니다.
* **시각적 및 레이아웃 문제 디버깅**: Claude에게 "작은 창에서 모달이 잘린다"고 말하세요. Claude가 창 크기를 조정하고, 버그를 재현하고, 스크린샷을 캡처하고, CSS를 패치하고, 수정을 확인합니다. Claude는 여러분이 보는 것을 봅니다.
* **GUI 전용 도구 조작**: 디자인 도구, 하드웨어 제어 패널, iOS Simulator, 또는 CLI나 API가 없는 독점 앱과 상호작용합니다.

## computer use가 적용되는 경우

Claude는 앱이나 서비스와 상호작용하는 여러 방법을 가지고 있습니다. Computer use는 가장 광범위하지만 가장 느리므로, Claude는 가장 정확한 도구를 먼저 시도합니다:

* 서비스에 대한 [MCP 서버](/mcp)가 있으면 Claude는 그것을 사용합니다.
* 작업이 셸 명령이면 Claude는 Bash를 사용합니다.
* 작업이 브라우저 작업이고 [Claude in Chrome](/chrome)이 설정되어 있으면 Claude는 그것을 사용합니다.
* 위의 어느 것도 해당되지 않으면 Claude는 computer use를 사용합니다.

화면 제어는 다른 것으로는 접근할 수 없는 것, 즉 네이티브 앱, 시뮬레이터, API가 없는 도구를 위해 예약됩니다.

## computer use 활성화

Computer use는 `computer-use`라는 내장 MCP 서버로 제공됩니다. 활성화하기 전까지는 기본적으로 꺼져 있습니다.

### 1. MCP 메뉴 열기

대화형 Claude Code 세션에서 다음을 실행합니다:

```text  theme={null}
/mcp
```

서버 목록에서 `computer-use`를 찾습니다. 비활성화로 표시됩니다.

### 2. 서버 활성화

`computer-use`를 선택하고 **Enable**을 선택합니다. 설정은 프로젝트별로 유지되므로 computer use를 원하는 각 프로젝트에서 한 번만 수행하면 됩니다.

### 3. macOS 권한 부여

Claude가 처음으로 컴퓨터를 사용하려고 할 때, 두 가지 macOS 권한을 부여하라는 프롬프트가 표시됩니다:

* **접근성(Accessibility)**: Claude가 클릭, 타이핑, 스크롤할 수 있게 합니다
* **화면 기록(Screen Recording)**: Claude가 화면에 있는 것을 볼 수 있게 합니다

프롬프트에는 관련 시스템 설정 패널을 여는 링크가 포함되어 있습니다. 두 가지 모두 부여한 다음 프롬프트에서 **Try again**을 선택합니다. macOS는 화면 기록을 부여한 후 Claude Code를 재시작해야 할 수 있습니다.

설정 후 GUI가 필요한 작업을 Claude에게 요청하세요:

```text  theme={null}
Build the app target, launch it, and click through each tab to make
sure nothing crashes. Screenshot any error states you find.
```

## 세션별 앱 승인

`computer-use` 서버를 활성화해도 Claude에게 컴퓨터의 모든 앱에 대한 접근 권한이 부여되지는 않습니다. Claude가 세션에서 특정 앱이 처음 필요할 때, 터미널에 다음을 보여주는 프롬프트가 나타납니다:

* Claude가 제어하려는 앱
* 클립보드 접근 등 요청된 추가 권한
* Claude가 작업하는 동안 숨겨질 다른 앱 수

**Allow for this session** 또는 **Deny**를 선택합니다. 승인은 현재 세션 동안 유지됩니다. Claude가 함께 요청할 때 여러 앱을 한 번에 승인할 수 있습니다.

광범위한 접근 권한을 가진 앱은 프롬프트에 추가 경고를 표시하여 승인 시 무엇이 부여되는지 알 수 있습니다:

| 경고 | 적용 대상 |
| :--- | :--- |
| 셸 접근과 동등 | Terminal, iTerm, VS Code, Warp 및 기타 터미널과 IDE |
| 모든 파일 읽기 또는 쓰기 가능 | Finder |
| 시스템 설정 변경 가능 | System Settings |

이러한 앱이 차단되지는 않습니다. 경고를 통해 해당 작업이 그 수준의 접근 권한을 보증하는지 결정할 수 있습니다.

Claude의 제어 수준도 앱 카테고리에 따라 다릅니다: 브라우저와 거래 플랫폼은 보기 전용, 터미널과 IDE는 클릭 전용, 그 외 모든 것은 전체 제어가 가능합니다. 전체 티어 분류는 [Desktop의 앱 권한](/desktop#app-permissions)을 참조하세요.

## Claude가 화면에서 작업하는 방식

작동 흐름을 이해하면 Claude가 무엇을 할지, 어떻게 개입할지 예측하는 데 도움이 됩니다.

### 한 번에 하나의 세션

Computer use는 활성 상태에서 머신 전체 잠금을 유지합니다. 다른 Claude Code 세션이 이미 컴퓨터를 사용 중이면 새로운 시도는 어떤 세션이 잠금을 보유하고 있는지 알려주는 메시지와 함께 실패합니다. 해당 세션을 먼저 완료하거나 종료하세요.

### Claude가 작업하는 동안 앱이 숨겨짐

Claude가 화면 제어를 시작하면 승인된 앱만 상호작용하도록 다른 보이는 앱들이 숨겨집니다. 터미널 창은 계속 보이며 스크린샷에서 제외되므로 세션을 지켜볼 수 있고 Claude는 자체 출력을 볼 수 없습니다.

Claude가 턴을 완료하면 숨겨진 앱이 자동으로 복원됩니다.

### 스크린샷 자동 축소

Claude Code는 모델에 보내기 전에 모든 스크린샷을 축소합니다. Retina 또는 기타 고해상도 디스플레이에서 디스플레이 해상도를 낮추거나 창 크기를 조정할 필요가 없습니다. 16인치 MacBook Pro의 네이티브 Retina 해상도는 3456x2234로 캡처되어 대략 1372x887로 축소되며 종횡비는 유지됩니다.

대상 크기를 변경하는 설정은 없습니다. 축소 후 화면의 텍스트나 컨트롤이 Claude가 읽기에 너무 작으면 디스플레이 해상도를 변경하는 대신 앱에서 크기를 늘리세요.

### 언제든지 중지

Claude가 잠금을 획득하면 macOS 알림이 나타납니다: "Claude is using your computer - press Esc to stop." 어디서든 `Esc`를 눌러 현재 작업을 즉시 중단하거나, 터미널에서 `Ctrl+C`를 누르세요. 어느 쪽이든 Claude는 잠금을 해제하고 앱을 다시 표시하며 제어를 돌려줍니다.

Claude가 완료되면 두 번째 알림이 나타납니다.

## 안전성과 신뢰 경계

::: warning
[샌드박스된 Bash 도구](/sandboxing)와 달리 computer use는 승인한 앱에 접근할 수 있는 실제 데스크톱에서 실행됩니다. Claude는 각 작업을 확인하고 화면 콘텐츠에서의 잠재적 프롬프트 인젝션을 표시하지만, 신뢰 경계는 다릅니다. 모범 사례에 대해서는 [computer use 안전 가이드](https://support.claude.com/en/articles/14128542)를 참조하세요.
:::

내장 가드레일은 설정 없이 위험을 줄입니다:

* **앱별 승인**: Claude는 현재 세션에서 승인한 앱만 제어할 수 있습니다.
* **센티넬 경고**: 셸, 파일 시스템 또는 시스템 설정 접근을 부여하는 앱은 승인 전에 표시됩니다.
* **스크린샷에서 터미널 제외**: Claude는 터미널 창을 볼 수 없으므로 세션의 화면 프롬프트가 모델에 피드백될 수 없습니다.
* **글로벌 이스케이프**: `Esc` 키는 어디서든 computer use를 중단하며, 키 입력이 소비되므로 프롬프트 인젝션이 이를 사용하여 대화 상자를 닫을 수 없습니다.
* **잠금 파일**: 한 번에 하나의 세션만 컴퓨터를 제어할 수 있습니다.

## 예제 워크플로우

이 예제들은 computer use를 코딩 작업과 결합하는 일반적인 방법을 보여줍니다.

### 네이티브 빌드 검증

macOS 또는 iOS 앱을 변경한 후 Claude가 한 번에 컴파일하고 검증하도록 합니다:

```text  theme={null}
Build the MenuBarStats target, launch it, open the preferences window,
and verify the interval slider updates the label. Screenshot the
preferences window when you're done.
```

Claude는 `xcodebuild`를 실행하고, 앱을 실행하고, UI와 상호작용하며, 발견한 내용을 보고합니다.

### 레이아웃 버그 재현

시각적 버그가 특정 창 크기에서만 나타날 때 Claude가 찾도록 합니다:

```text  theme={null}
The settings modal clips its footer on narrow windows. Resize the app
window down until you can reproduce it, screenshot the clipped state,
then check the CSS for the modal container.
```

Claude는 창 크기를 조정하고, 깨진 상태를 캡처하고, 관련 스타일시트를 읽습니다.

### 시뮬레이터 플로우 테스트

XCTest를 작성하지 않고 iOS Simulator를 조작합니다:

```text  theme={null}
Open the iOS Simulator, launch the app, tap through the onboarding
screens, and tell me if any screen takes more than a second to load.
```

Claude는 마우스로 하는 것과 같은 방식으로 시뮬레이터를 제어합니다.

## Desktop 앱과의 차이점

CLI와 Desktop은 동일한 computer use 엔진을 공유하지만 몇 가지 차이점이 있습니다:

| 기능 | Desktop | CLI |
| :--- | :--- | :--- |
| 플랫폼 | macOS 및 Windows | macOS 전용 |
| 활성화 | **Settings > General**에서 토글 (**Desktop app** 아래) | `/mcp`에서 `computer-use` 활성화 |
| 거부된 앱 목록 | Settings에서 설정 가능 | 아직 사용 불가 |
| 자동 숨기기 해제 토글 | 선택 사항 | 항상 켜짐 |
| Dispatch 통합 | Dispatch로 생성된 세션에서 computer use 사용 가능 | 해당 없음 |

## 문제 해결

### "Computer use is in use by another Claude session"

다른 Claude Code 세션이 잠금을 보유하고 있습니다. 해당 세션에서 작업을 완료하거나 종료하세요. 다른 세션이 충돌한 경우 Claude가 프로세스가 더 이상 실행되지 않음을 감지하면 잠금이 자동으로 해제됩니다.

### macOS 권한 프롬프트가 계속 나타남

macOS는 화면 기록을 부여한 후 요청 프로세스를 재시작해야 하는 경우가 있습니다. Claude Code를 완전히 종료하고 새 세션을 시작하세요. 프롬프트가 지속되면 **시스템 설정 > 개인 정보 보호 및 보안 > 화면 기록**을 열고 터미널 앱이 목록에 있고 활성화되어 있는지 확인하세요.

### `/mcp`에서 `computer-use`가 나타나지 않음

서버는 적격한 설정에서만 나타납니다. 다음을 확인하세요:

* macOS를 사용 중인지. CLI에서의 computer use는 Linux나 Windows에서 사용할 수 없습니다. Windows에서는 대신 [Desktop에서의 computer use](/desktop#let-claude-use-your-computer)를 사용하세요.
* Claude Code v2.1.85 이상을 실행 중인지. `claude --version`으로 확인하세요.
* Pro 또는 Max 플랜인지. `/status`로 구독을 확인하세요.
* claude.ai를 통해 인증했는지. Computer use는 Amazon Bedrock, Google Cloud Vertex AI 또는 Microsoft Foundry와 같은 타사 제공업체에서는 사용할 수 없습니다. 타사 제공업체를 통해서만 Claude에 접근하는 경우 이 기능을 사용하려면 별도의 claude.ai 계정이 필요합니다.
* 대화형 세션인지. Computer use는 `-p` 플래그를 사용한 비대화형 모드에서는 사용할 수 없습니다.

## 참고 항목

* [Desktop에서의 computer use](/desktop#let-claude-use-your-computer): 그래픽 설정 페이지가 있는 동일한 기능
* [Claude in Chrome](/chrome): 웹 기반 작업을 위한 브라우저 자동화
* [MCP](/mcp): Claude를 구조화된 도구 및 API에 연결
* [샌드박싱](/sandboxing): Claude의 Bash 도구가 파일 시스템 및 네트워크 접근을 격리하는 방법
* [Computer use 안전 가이드](https://support.claude.com/en/articles/14128542): 안전한 computer use를 위한 모범 사례
