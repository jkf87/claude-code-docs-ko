---
title: Slack에서 Claude Code 사용하기
description: Slack 워크스페이스에서 직접 코딩 작업을 위임하세요
---

# Slack에서 Claude Code 사용하기

> Slack 워크스페이스에서 직접 코딩 작업을 위임하세요

Slack의 Claude Code는 Claude Code의 강력한 기능을 Slack 워크스페이스로 직접 가져옵니다. `@Claude`를 멘션하며 코딩 작업을 요청하면, Claude가 자동으로 의도를 파악하고 웹에서 Claude Code 세션을 생성하여 팀 대화를 벗어나지 않고도 개발 작업을 위임할 수 있습니다.

이 통합은 기존 Claude for Slack 앱을 기반으로 하며, 코딩 관련 요청에 대해 웹의 Claude Code로 지능적으로 라우팅하는 기능이 추가되었습니다.

## 활용 사례

* **버그 조사 및 수정**: Slack 채널에서 버그가 보고되는 즉시 Claude에게 조사 및 수정을 요청하세요.
* **빠른 코드 리뷰 및 수정**: 팀 피드백을 바탕으로 Claude가 작은 기능을 구현하거나 코드를 리팩토링하도록 하세요.
* **협업 디버깅**: 팀 토론에서 중요한 맥락(예: 오류 재현 방법이나 사용자 리포트)이 제공되면, Claude가 그 정보를 디버깅 접근 방식에 활용할 수 있습니다.
* **병렬 작업 실행**: Slack에서 코딩 작업을 시작하고 다른 업무를 계속하다가 완료 알림을 받으세요.

## 사전 요구 사항

Slack에서 Claude Code를 사용하기 전에 다음 사항을 확인하세요:

| 요구 사항 | 세부 내용 |
| :--- | :--- |
| Claude 플랜 | Claude Code 접근 권한이 있는 Pro, Max, Team 또는 Enterprise (프리미엄 시트 또는 Chat + Claude Code 시트) |
| 웹의 Claude Code | [웹의 Claude Code](/claude-code-on-the-web) 접근이 활성화되어 있어야 함 |
| GitHub 계정 | 웹의 Claude Code에 연결되어 있고 최소 하나의 저장소가 인증되어 있어야 함 |
| Slack 인증 | Slack 계정이 Claude 앱을 통해 Claude 계정에 연결되어 있어야 함 |

## Slack에서 Claude Code 설정하기

**1단계: Slack에 Claude 앱 설치**

워크스페이스 관리자가 Slack App Marketplace에서 Claude 앱을 설치해야 합니다. [Slack App Marketplace](https://slack.com/marketplace/A08SF47R6P4)를 방문하여 "Add to Slack"을 클릭해 설치 과정을 시작하세요.

**2단계: Claude 계정 연결**

앱이 설치되면 개인 Claude 계정을 인증하세요:

1. Apps 섹션에서 "Claude"를 클릭하여 Slack의 Claude 앱을 엽니다
2. App Home 탭으로 이동합니다
3. "Connect"를 클릭하여 Slack 계정과 Claude 계정을 연결합니다
4. 브라우저에서 인증 절차를 완료합니다

**3단계: 웹의 Claude Code 구성**

웹의 Claude Code가 올바르게 구성되어 있는지 확인하세요:

* [claude.ai/code](https://claude.ai/code)를 방문하여 Slack에 연결한 것과 동일한 계정으로 로그인합니다
* GitHub 계정이 아직 연결되지 않았다면 연결합니다
* Claude가 작업할 저장소를 하나 이상 인증합니다

**4단계: 라우팅 모드 선택**

계정을 연결한 후, Slack에서 Claude가 메시지를 처리하는 방식을 구성합니다. Slack의 Claude App Home으로 이동하여 **라우팅 모드** 설정을 찾으세요.

| 모드 | 동작 방식 |
| :--- | :--- |
| **Code only** | Claude가 모든 @멘션을 Claude Code 세션으로 라우팅합니다. Slack에서 Claude를 개발 작업 전용으로만 사용하는 팀에 적합합니다. |
| **Code + Chat** | Claude가 각 메시지를 분석하여 코딩 작업은 Claude Code로, 글쓰기·분석·일반 질문은 Claude Chat으로 지능적으로 라우팅합니다. 모든 종류의 작업에 @Claude를 단일 진입점으로 사용하려는 팀에 적합합니다. |

:::info
Code + Chat 모드에서 Claude가 메시지를 Chat으로 라우팅했지만 코딩 세션을 원했다면, "Retry as Code"를 클릭하여 Claude Code 세션을 대신 생성할 수 있습니다. 반대로 Code로 라우팅되었지만 Chat 세션을 원한다면, 해당 스레드에서 그 옵션을 선택할 수 있습니다.
:::

**5단계: 채널에 Claude 추가**

설치 후 Claude는 어떤 채널에도 자동으로 추가되지 않습니다. 채널에서 Claude를 사용하려면 해당 채널에서 `/invite @Claude`를 입력하여 초대하세요. Claude는 추가된 채널의 @멘션에만 응답할 수 있습니다.

## 작동 방식

### 자동 감지

Slack 채널 또는 스레드에서 @Claude를 멘션하면, Claude가 자동으로 메시지를 분석하여 코딩 작업인지 판단합니다. 코딩 의도가 감지되면 일반 채팅 어시스턴트로 응답하는 대신 웹의 Claude Code로 요청을 라우팅합니다.

자동으로 감지되지 않더라도 Claude에게 명시적으로 코딩 작업으로 처리해 달라고 요청할 수도 있습니다.

:::info
Slack의 Claude Code는 채널(공개 또는 비공개)에서만 작동합니다. 다이렉트 메시지(DM)에서는 작동하지 않습니다.
:::

### 컨텍스트 수집

**스레드에서**: 스레드에서 Claude를 @멘션하면, 해당 스레드의 모든 메시지에서 컨텍스트를 수집하여 전체 대화를 파악합니다.

**채널에서**: 채널에서 직접 멘션하면, Claude는 최근 채널 메시지에서 관련 컨텍스트를 살펴봅니다.

이 컨텍스트를 통해 Claude는 문제를 이해하고, 적절한 저장소를 선택하며, 작업 접근 방식을 결정합니다.

:::warning
Slack에서 @Claude가 호출되면, Claude는 요청을 더 잘 이해하기 위해 대화 컨텍스트에 접근할 수 있습니다. Claude는 컨텍스트 내 다른 메시지의 지시를 따를 수 있으므로, 신뢰할 수 있는 Slack 대화에서만 Claude를 사용하세요.
:::

### 세션 흐름

1. **시작**: 코딩 요청으로 Claude를 @멘션합니다
2. **감지**: Claude가 메시지를 분석하여 코딩 의도를 파악합니다
3. **세션 생성**: claude.ai/code에서 새 Claude Code 세션이 생성됩니다
4. **진행 상황 업데이트**: 작업이 진행되는 동안 Claude가 Slack 스레드에 상태 업데이트를 게시합니다
5. **완료**: 완료되면 Claude가 요약과 액션 버튼과 함께 @멘션합니다
6. **검토**: "View Session"을 클릭하여 전체 트랜스크립트를 확인하거나, "Create PR"을 클릭하여 풀 리퀘스트를 생성합니다

## 사용자 인터페이스 요소

### App Home

App Home 탭에는 연결 상태가 표시되며, Slack에서 Claude 계정을 연결하거나 연결 해제할 수 있습니다.

### 메시지 액션

* **View Session**: 브라우저에서 전체 Claude Code 세션을 열어 수행된 모든 작업을 확인하거나, 세션을 계속하거나, 추가 요청을 할 수 있습니다.
* **Create PR**: 세션의 변경 사항으로 직접 풀 리퀘스트를 생성합니다.
* **Retry as Code**: Claude가 처음에 채팅 어시스턴트로 응답했지만 코딩 세션을 원했다면, 이 버튼을 클릭하여 Claude Code 작업으로 요청을 다시 시도합니다.
* **Change Repo**: Claude가 잘못된 저장소를 선택한 경우 다른 저장소를 선택할 수 있습니다.

### 저장소 선택

Claude는 Slack 대화의 컨텍스트를 기반으로 자동으로 저장소를 선택합니다. 여러 저장소가 해당될 수 있는 경우, Claude가 올바른 저장소를 선택할 수 있도록 드롭다운을 표시할 수 있습니다.

## 접근 권한 및 권한

### 사용자 수준 접근

| 접근 유형 | 요구 사항 |
| :--- | :--- |
| Claude Code 세션 | 각 사용자는 자신의 Claude 계정으로 세션을 실행합니다 |
| 사용량 및 속도 제한 | 세션은 개별 사용자의 플랜 제한에 포함됩니다 |
| 저장소 접근 | 사용자는 직접 연결한 저장소에만 접근할 수 있습니다 |
| 세션 기록 | 세션은 claude.ai/code의 Claude Code 기록에 표시됩니다 |

### 워크스페이스 수준 접근

Slack 워크스페이스 관리자는 Claude 앱의 워크스페이스 내 사용 가능 여부를 제어합니다:

| 제어 항목 | 설명 |
| :--- | :--- |
| 앱 설치 | 워크스페이스 관리자가 Slack App Marketplace에서 Claude 앱 설치 여부를 결정합니다 |
| Enterprise Grid 배포 | Enterprise Grid 조직의 경우, 조직 관리자가 어떤 워크스페이스에서 Claude 앱에 접근할 수 있는지 제어할 수 있습니다 |
| 앱 제거 | 워크스페이스에서 앱을 제거하면 해당 워크스페이스의 모든 사용자의 접근 권한이 즉시 취소됩니다 |

### 채널 기반 접근 제어

설치 후 Claude는 어떤 채널에도 자동으로 추가되지 않습니다. 사용자는 Claude를 사용하려는 채널에 명시적으로 초대해야 합니다:

* **초대 필요**: 채널에 Claude를 추가하려면 해당 채널에서 `/invite @Claude`를 입력합니다
* **채널 멤버십이 접근을 제어**: Claude는 추가된 채널의 @멘션에만 응답할 수 있습니다
* **채널을 통한 접근 제한**: 관리자는 Claude가 초대된 채널과 해당 채널에 접근할 수 있는 사용자를 관리하여 Claude Code 사용을 제어할 수 있습니다
* **비공개 채널 지원**: Claude는 공개 및 비공개 채널 모두에서 작동하여 팀이 가시성을 유연하게 제어할 수 있습니다

이 채널 기반 모델을 통해 팀은 Claude Code 사용을 특정 채널로 제한하여 워크스페이스 수준 권한 외에 추가적인 접근 제어 계층을 제공할 수 있습니다.

## 각 환경에서 접근 가능한 항목

**Slack에서**: 상태 업데이트, 완료 요약, 액션 버튼을 확인할 수 있습니다. 전체 트랜스크립트는 보존되어 언제든지 접근 가능합니다.

**웹에서**: 전체 대화 기록, 모든 코드 변경 사항, 파일 작업이 포함된 완전한 Claude Code 세션과 세션을 계속하거나 풀 리퀘스트를 생성하는 기능을 사용할 수 있습니다.

Enterprise 및 Team 계정의 경우, Slack의 Claude에서 생성된 세션은 자동으로 조직에 공유됩니다. 자세한 내용은 [웹의 Claude Code 세션 공유](/claude-code-on-the-web#share-sessions)를 참조하세요.

## 모범 사례

### 효과적인 요청 작성

* **구체적으로 작성**: 관련이 있는 경우 파일 이름, 함수 이름 또는 오류 메시지를 포함하세요.
* **컨텍스트 제공**: 대화에서 명확하지 않다면 저장소나 프로젝트를 언급하세요.
* **완료 기준 정의**: "완료"가 무엇을 의미하는지 설명하세요—Claude가 테스트를 작성해야 하나요? 문서를 업데이트해야 하나요? PR을 생성해야 하나요?
* **스레드 활용**: 버그나 기능을 논의할 때 스레드에서 답장하여 Claude가 전체 컨텍스트를 수집할 수 있도록 하세요.

### Slack vs. 웹 중 선택 기준

**Slack 사용 시기**: Slack 토론에 이미 컨텍스트가 있을 때, 비동기적으로 작업을 시작하고 싶을 때, 또는 가시성이 필요한 팀원들과 협업할 때.

**웹에서 직접 사용 시기**: 파일을 업로드해야 할 때, 개발 중에 실시간 상호작용을 원할 때, 또는 더 길고 복잡한 작업을 진행할 때.

## 문제 해결

### 세션이 시작되지 않는 경우

1. Claude App Home에서 Claude 계정이 연결되어 있는지 확인합니다
2. 웹의 Claude Code 접근이 활성화되어 있는지 확인합니다
3. Claude Code에 GitHub 저장소가 최소 하나 이상 연결되어 있는지 확인합니다

### 저장소가 표시되지 않는 경우

1. [claude.ai/code](https://claude.ai/code)의 웹의 Claude Code에서 저장소를 연결합니다
2. 해당 저장소에 대한 GitHub 권한을 확인합니다
3. GitHub 계정 연결을 해제하고 다시 연결해 보세요

### 잘못된 저장소가 선택된 경우

1. "Change Repo" 버튼을 클릭하여 다른 저장소를 선택합니다
2. 더 정확한 선택을 위해 요청에 저장소 이름을 포함하세요

### 인증 오류

1. App Home에서 Claude 계정을 연결 해제하고 다시 연결합니다
2. 브라우저에서 올바른 Claude 계정에 로그인되어 있는지 확인합니다
3. Claude 플랜에 Claude Code 접근 권한이 포함되어 있는지 확인합니다

### 세션 만료

1. 세션은 웹의 Claude Code 기록에서 계속 접근 가능합니다
2. [claude.ai/code](https://claude.ai/code)에서 이전 세션을 계속하거나 참조할 수 있습니다

## 현재 제한 사항

* **GitHub 전용**: 현재 GitHub의 저장소만 지원합니다.
* **PR 한 번에 하나**: 각 세션은 하나의 풀 리퀘스트만 생성할 수 있습니다.
* **속도 제한 적용**: 세션은 개별 Claude 플랜의 속도 제한을 사용합니다.
* **웹 접근 필요**: 사용자는 웹의 Claude Code 접근 권한이 있어야 하며, 그렇지 않은 경우 표준 Claude 채팅 응답만 받게 됩니다.

## 관련 리소스

* [웹의 Claude Code](/claude-code-on-the-web) - 웹의 Claude Code에 대해 자세히 알아보기
* [Claude for Slack](https://claude.com/claude-and-slack) - 일반 Claude for Slack 문서
* [Slack App Marketplace](https://slack.com/marketplace/A08SF47R6P4) - Slack Marketplace에서 Claude 앱 설치
* [Claude 도움말 센터](https://support.claude.com) - 추가 지원 받기
