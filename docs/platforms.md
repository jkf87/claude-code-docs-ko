# 플랫폼 및 통합

> Claude Code를 실행할 위치와 연결할 대상을 선택합니다. CLI, Desktop, VS Code, JetBrains, 웹, 모바일 및 Chrome, Slack, CI/CD 등의 통합을 비교합니다.

Claude Code는 모든 곳에서 동일한 기본 엔진을 실행하지만, 각 환경은 서로 다른 작업 방식에 맞게 조정되어 있습니다. 이 페이지는 워크플로에 맞는 적절한 플랫폼을 선택하고 이미 사용 중인 도구를 연결하는 데 도움을 줍니다.

## Claude Code 실행 위치

작업 방식과 프로젝트 위치에 따라 플랫폼을 선택하세요.

| 플랫폼                          | 적합한 용도                                                                                     | 제공하는 기능                                                                                                                                                            |
| :------------------------------ | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CLI](/quickstart)              | 터미널 워크플로, 스크립팅, 원격 서버                                                            | 전체 기능 세트, [Agent SDK](/headless), macOS에서 [computer use](/computer-use) (Pro 및 Max), 서드파티 제공자                                                             |
| [Desktop](/desktop)             | 시각적 검토, 병렬 세션, 관리형 설정                                                             | diff 뷰어, 앱 미리보기, Pro 및 Max에서 [computer use](/desktop#let-claude-use-your-computer) 및 [Dispatch](/desktop#sessions-from-dispatch)                               |
| [VS Code](/vs-code)             | 터미널로 전환하지 않고 VS Code 내에서 작업                                                      | 인라인 diff, 통합 터미널, 파일 컨텍스트                                                                                                                                  |
| [JetBrains](/jetbrains)         | IntelliJ, PyCharm, WebStorm 또는 기타 JetBrains IDE 내에서 작업                                 | diff 뷰어, 선택 공유, 터미널 세션                                                                                                                                        |
| [웹](/claude-code-on-the-web)   | 많은 조작이 필요 없는 장시간 작업이거나 오프라인일 때도 계속되어야 하는 작업                     | Anthropic 관리 클라우드, 연결 해제 후에도 계속 실행                                                                                                                      |
| 모바일                          | 컴퓨터에서 떨어져 있을 때 작업 시작 및 모니터링                                                 | iOS 및 Android용 Claude 앱의 클라우드 세션, 로컬 세션을 위한 [Remote Control](/remote-control), Pro 및 Max에서 Desktop으로 [Dispatch](/desktop#sessions-from-dispatch)     |

CLI는 터미널 네이티브 작업에 가장 완전한 환경입니다: 스크립팅, 서드파티 제공자, Agent SDK는 CLI 전용입니다. Desktop과 IDE 확장은 일부 CLI 전용 기능을 시각적 검토와 더 긴밀한 에디터 통합으로 대체합니다. 웹은 Anthropic 클라우드에서 실행되므로 연결 해제 후에도 작업이 계속됩니다. 모바일은 동일한 클라우드 세션이나 Remote Control을 통한 로컬 세션으로의 씬 클라이언트이며, Dispatch로 Desktop에 작업을 보낼 수 있습니다.

동일한 프로젝트에서 여러 환경을 혼합할 수 있습니다. 설정, 프로젝트 메모리, MCP 서버는 로컬 환경 간에 공유됩니다.

## 도구 연결

통합을 통해 Claude가 코드베이스 외부의 서비스와 작업할 수 있습니다.

| 통합                                | 기능                                            | 용도                                                               |
| :---------------------------------- | :---------------------------------------------- | :----------------------------------------------------------------- |
| [Chrome](/chrome)                   | 로그인된 세션으로 브라우저를 제어합니다          | 웹 앱 테스트, 양식 작성, API 없는 사이트 자동화                    |
| [GitHub Actions](/github-actions)   | CI 파이프라인에서 Claude를 실행합니다            | 자동 PR 리뷰, 이슈 분류, 예약된 유지보수                          |
| [GitLab CI/CD](/gitlab-ci-cd)       | GitLab용 GitHub Actions와 동일                   | GitLab에서의 CI 기반 자동화                                        |
| [Code Review](/code-review)         | 모든 PR을 자동으로 리뷰합니다                    | 사람이 리뷰하기 전에 버그 발견                                     |
| [Slack](/slack)                     | 채널에서 `@Claude` 멘션에 응답합니다             | 팀 채팅에서 버그 리포트를 풀 리퀘스트로 전환                       |

여기에 나열되지 않은 통합의 경우 [MCP 서버](/mcp)와 [커넥터](/desktop#connect-external-tools)를 사용하여 Linear, Notion, Google Drive 또는 자체 내부 API 등 거의 모든 것을 연결할 수 있습니다.

## 터미널에서 떨어져 있을 때 작업하기

Claude Code는 터미널에 없을 때 작업할 수 있는 여러 방법을 제공합니다. 작업을 트리거하는 것, Claude가 실행되는 위치, 설정에 필요한 정도가 다릅니다.

|                                                | 트리거                                                                                 | Claude 실행 위치                                                                                    | 설정                                                                                                                             | 적합한 용도                                                  |
| :--------------------------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| [Dispatch](/desktop#sessions-from-dispatch)     | Claude 모바일 앱에서 작업 메시지 전송                                                  | 사용자의 컴퓨터 (Desktop)                                                                           | [모바일 앱과 Desktop 페어링](https://support.claude.com/en/articles/13947068)                                                    | 자리를 비운 동안 작업 위임, 최소한의 설정                    |
| [Remote Control](/remote-control)               | [claude.ai/code](https://claude.ai/code) 또는 Claude 모바일 앱에서 실행 중인 세션 제어 | 사용자의 컴퓨터 (CLI 또는 VS Code)                                                                  | `claude remote-control` 실행                                                                                                     | 다른 기기에서 진행 중인 작업 조종                            |
| [Channels](/channels)                           | Telegram이나 Discord 같은 채팅 앱, 또는 자체 서버에서의 푸시 이벤트                    | 사용자의 컴퓨터 (CLI)                                                                               | [채널 플러그인 설치](/channels#quickstart) 또는 [직접 구축](/channels-reference)                                                  | CI 실패나 채팅 메시지 같은 외부 이벤트에 반응                |
| [Slack](/slack)                                 | 팀 채널에서 `@Claude` 멘션                                                             | Anthropic 클라우드                                                                                  | [Claude Code on the web](/claude-code-on-the-web) 활성화와 함께 [Slack 앱 설치](/slack#setting-up-claude-code-in-slack)           | 팀 채팅에서 PR 및 리뷰                                      |
| [예약 작업](/scheduled-tasks)                   | 일정 설정                                                                              | [CLI](/scheduled-tasks), [Desktop](/desktop-scheduled-tasks), 또는 [클라우드](/web-scheduled-tasks)  | 빈도 선택                                                                                                                        | 일일 리뷰와 같은 반복 자동화                                 |

어디서 시작해야 할지 모르겠다면 [CLI를 설치](/quickstart)하고 프로젝트 디렉토리에서 실행하세요. 터미널을 사용하고 싶지 않다면 [Desktop](/desktop-quickstart)이 그래픽 인터페이스로 동일한 엔진을 제공합니다.

## 관련 리소스

### 플랫폼

* [CLI 빠른 시작](/quickstart): 터미널에서 설치하고 첫 번째 명령어 실행
* [Desktop](/desktop): 시각적 diff 검토, 병렬 세션, computer use, Dispatch
* [VS Code](/vs-code): 에디터 내부의 Claude Code 확장
* [JetBrains](/jetbrains): IntelliJ, PyCharm 및 기타 JetBrains IDE용 확장
* [Claude Code on the web](/claude-code-on-the-web): 연결 해제 시에도 계속 실행되는 클라우드 세션
* 모바일: 컴퓨터에서 떨어져 있을 때 작업을 시작하고 모니터링하기 위한 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 및 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)용 Claude 앱

### 통합

* [Chrome](/chrome): 로그인된 세션으로 브라우저 작업 자동화
* [Computer use](/computer-use): macOS에서 Claude가 앱을 열고 화면을 제어하도록 허용
* [GitHub Actions](/github-actions): CI 파이프라인에서 Claude 실행
* [GitLab CI/CD](/gitlab-ci-cd): GitLab용 동일 기능
* [Code Review](/code-review): 모든 풀 리퀘스트에 대한 자동 리뷰
* [Slack](/slack): 팀 채팅에서 작업을 보내고 PR을 받기

### 원격 접근

* [Dispatch](/desktop#sessions-from-dispatch): 폰에서 작업 메시지를 보내면 Desktop 세션을 생성할 수 있습니다
* [Remote Control](/remote-control): 폰이나 브라우저에서 실행 중인 세션을 제어
* [Channels](/channels): 채팅 앱이나 자체 서버에서 세션으로 이벤트를 푸시
* [예약 작업](/scheduled-tasks): 반복 일정으로 프롬프트 실행
