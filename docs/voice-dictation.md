---
title: 음성 받아쓰기
description: Claude Code CLI에서 타이핑 대신 음성으로 프롬프트를 입력할 수 있는 Push-to-Talk 음성 받아쓰기 기능을 사용하세요.
---

# 음성 받아쓰기

키를 누른 채로 말하면 프롬프트를 받아쓰기할 수 있습니다. 음성은 실시간으로 프롬프트 입력란에 전사되므로, 같은 메시지 안에서 음성과 타이핑을 함께 사용할 수 있습니다. `/voice` 명령으로 받아쓰기를 활성화할 수 있습니다. 기본 Push-to-Talk 키는 `Space`이며, 짧은 대기 없이 첫 키 입력부터 즉시 활성화하려면 [수정자 키 조합으로 다시 바인딩](#push-to-talk-키-다시-바인딩)할 수 있습니다.

::: info
음성 받아쓰기는 Claude Code v2.1.69 이상이 필요합니다. `claude --version` 명령으로 버전을 확인하세요.
:::

## 요구 사항

음성 받아쓰기는 녹음된 오디오를 Anthropic 서버로 전송하여 전사 처리합니다. 오디오는 로컬에서 처리되지 않습니다. 음성-텍스트 서비스는 Claude.ai 계정으로 인증했을 때만 사용 가능하며, Anthropic API 키 직접 사용, Amazon Bedrock, Google Vertex AI, Microsoft Foundry로 구성된 경우에는 사용할 수 없습니다. Anthropic의 데이터 처리 방식은 [데이터 사용](/data-usage)을 참조하세요.

음성 받아쓰기는 로컬 마이크 접근이 필요하므로, [웹의 Claude Code](/claude-code-on-the-web)나 SSH 세션 같은 원격 환경에서는 작동하지 않습니다. WSL에서는 오디오 접근을 위한 WSLg가 필요하며, WSLg는 Windows 11의 WSL2에 포함되어 있습니다. Windows 10 또는 WSL1에서는 네이티브 Windows 환경에서 Claude Code를 실행하세요.

오디오 녹음은 macOS, Linux, Windows에서 내장 네이티브 모듈을 사용합니다. Linux에서 네이티브 모듈을 로드할 수 없는 경우, Claude Code는 ALSA utils의 `arecord` 또는 SoX의 `rec`으로 폴백합니다. 둘 다 설치되어 있지 않으면 `/voice` 명령이 패키지 관리자에 맞는 설치 명령을 출력합니다.

## 음성 받아쓰기 활성화

`/voice` 명령을 실행하면 음성 받아쓰기가 켜집니다. 처음 활성화할 때 Claude Code가 마이크 확인을 실행합니다. macOS에서는 터미널에 마이크 권한이 부여된 적 없으면 시스템 마이크 권한 요청 창이 나타납니다.

```
/voice
Voice mode enabled. Hold Space to record. Dictation language: en (/config to change).
```

음성 받아쓰기 설정은 세션 간에 유지됩니다. `/voice` 명령을 다시 실행하면 꺼지며, [사용자 설정 파일](/settings)에서 직접 설정할 수도 있습니다:

```json
{
  "voiceEnabled": true
}
```

음성 받아쓰기가 활성화된 상태에서 프롬프트가 비어 있으면 입력 영역 하단에 `hold Space to speak` 힌트가 표시됩니다. [커스텀 상태 표시줄](/statusline)이 설정된 경우에는 힌트가 나타나지 않습니다.

## 프롬프트 녹음

`Space`를 누른 채로 있으면 녹음이 시작됩니다. Claude Code는 터미널에서 빠른 키 반복 이벤트를 감지하여 키를 누르고 있는지 판단하므로, 녹음이 시작되기 전 짧은 준비 시간이 있습니다. 준비 중에는 하단에 `keep holding…`이 표시되고, 녹음이 활성화되면 실시간 파형으로 전환됩니다.

준비 시간 동안 키 반복 문자 한두 개가 입력란에 타이핑되지만, 녹음이 활성화될 때 자동으로 제거됩니다. 단순히 `Space`를 한 번 탭하면 여전히 공백이 입력되며, 홀드 감지는 빠른 반복 입력이 있을 때만 트리거됩니다.

::: tip
준비 시간을 건너뛰려면 `meta+k`와 같은 [수정자 키 조합으로 다시 바인딩](#push-to-talk-키-다시-바인딩)하세요. 수정자 키 조합은 첫 키 입력부터 즉시 녹음을 시작합니다.
:::

말하는 내용이 프롬프트에 실시간으로 나타나되, 전사가 완료될 때까지 흐리게 표시됩니다. `Space`를 놓으면 녹음이 멈추고 텍스트가 확정됩니다. 전사된 텍스트는 커서 위치에 삽입되며, 삽입된 텍스트의 끝에 커서가 위치하므로 타이핑과 받아쓰기를 순서에 관계없이 섞어 사용할 수 있습니다. `Space`를 다시 누른 채로 있으면 이어서 녹음을 추가할 수 있고, 커서를 먼저 이동하면 프롬프트의 원하는 위치에 음성을 삽입할 수 있습니다:

```
> refactor the auth middleware to ▮
  # hold Space, speak "use the new token validation helper"
> refactor the auth middleware to use the new token validation helper▮
```

전사는 코딩 관련 어휘에 최적화되어 있습니다. `regex`, `OAuth`, `JSON`, `localhost` 같은 일반적인 개발 용어가 올바르게 인식되며, 현재 프로젝트 이름과 git 브랜치 이름이 인식 힌트로 자동 추가됩니다.

## 받아쓰기 언어 변경

음성 받아쓰기는 Claude의 응답 언어를 제어하는 [`language` 설정](/settings)과 동일한 설정을 사용합니다. 해당 설정이 비어 있으면 받아쓰기 기본 언어는 영어입니다.

<details>
<summary>지원되는 받아쓰기 언어</summary>

| 언어       | 코드 |
| :--------- | :--- |
| Czech      | `cs` |
| Danish     | `da` |
| Dutch      | `nl` |
| English    | `en` |
| French     | `fr` |
| German     | `de` |
| Greek      | `el` |
| Hindi      | `hi` |
| Indonesian | `id` |
| Italian    | `it` |
| Japanese   | `ja` |
| Korean     | `ko` |
| Norwegian  | `no` |
| Polish     | `pl` |
| Portuguese | `pt` |
| Russian    | `ru` |
| Spanish    | `es` |
| Swedish    | `sv` |
| Turkish    | `tr` |
| Ukrainian  | `uk` |

</details>

`/config`에서 언어를 설정하거나 설정 파일에 직접 입력할 수 있습니다. [BCP 47 언어 코드](https://en.wikipedia.org/wiki/IETF_language_tag) 또는 언어 이름 중 하나를 사용할 수 있습니다:

```json
{
  "language": "japanese"
}
```

`language` 설정값이 지원 목록에 없으면, `/voice` 활성화 시 경고 메시지가 표시되고 받아쓰기는 영어로 폴백됩니다. Claude의 텍스트 응답은 이 폴백의 영향을 받지 않습니다.

## Push-to-Talk 키 다시 바인딩

Push-to-Talk 키는 `Chat` 컨텍스트에서 `voice:pushToTalk`에 바인딩되어 있으며 기본값은 `Space`입니다. [`~/.claude/keybindings.json`](/keybindings)에서 다시 바인딩할 수 있습니다:

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "meta+k": "voice:pushToTalk",
        "space": null
      }
    }
  ]
}
```

`"space": null`로 설정하면 기본 바인딩이 제거됩니다. 두 키를 모두 활성화하려면 이 줄을 생략하세요.

홀드 감지는 키 반복에 의존하므로, 준비 시간 동안 입력란에 타이핑되는 `v` 같은 일반 문자 키는 바인딩을 피하세요. `Space`를 사용하거나 `meta+k`와 같은 수정자 키 조합을 사용하면 준비 시간 없이 첫 키 입력부터 녹음이 시작됩니다. 전체 키 바인딩 문법은 [키보드 단축키 커스터마이즈](/keybindings)를 참조하세요.

## 문제 해결

음성 받아쓰기가 활성화되지 않거나 녹음되지 않을 때의 일반적인 문제:

* **`Voice mode requires a Claude.ai account`**: API 키 또는 서드파티 제공업체로 인증된 상태입니다. `/login` 명령을 실행하여 Claude.ai 계정으로 로그인하세요.
* **`Microphone access is denied`**: 시스템 설정에서 터미널에 마이크 권한을 부여하세요. macOS에서는 시스템 설정 → 개인 정보 보호 및 보안 → 마이크로 이동하여 터미널 앱을 활성화한 다음 `/voice` 명령을 다시 실행하세요. Windows에서는 설정 → 개인 정보 보호 및 보안 → 마이크로 이동하여 데스크톱 앱의 마이크 접근을 켠 다음 `/voice` 명령을 다시 실행하세요. macOS 설정에 터미널이 목록에 없으면 [macOS 마이크 설정에 터미널이 없는 경우](#macos-마이크-설정에-터미널이-없는-경우)를 참조하세요.
* **Linux에서 `No audio recording tool found`**: 네이티브 오디오 모듈을 로드할 수 없고 폴백도 설치되어 있지 않습니다. 오류 메시지에 표시된 명령으로 SoX를 설치하세요(예: `sudo apt-get install sox`).
* **`Space`를 눌러도 아무 일도 일어나지 않음**: 누르는 동안 프롬프트 입력란을 확인하세요. 계속 공백이 추가되면 음성 받아쓰기가 꺼진 상태이므로 `/voice` 명령으로 활성화하세요. 공백 한두 개가 입력되다가 아무 일도 일어나지 않으면 음성 받아쓰기는 켜져 있지만 홀드 감지가 트리거되지 않는 것입니다. 홀드 감지는 터미널이 키 반복 이벤트를 전송해야 하므로, OS 수준에서 키 반복이 비활성화된 경우 감지할 수 없습니다.
* **전사가 깨지거나 잘못된 언어로 출력됨**: 받아쓰기 기본 언어는 영어입니다. 다른 언어로 받아쓰기하려면 먼저 `/config`에서 언어를 설정하세요. [받아쓰기 언어 변경](#받아쓰기-언어-변경)을 참조하세요.

### macOS 마이크 설정에 터미널이 없는 경우

시스템 설정 → 개인 정보 보호 및 보안 → 마이크에 터미널 앱이 표시되지 않으면 활성화할 수 있는 토글이 없습니다. 터미널의 권한 상태를 초기화하여 다음 `/voice` 실행 시 새로운 macOS 권한 요청이 트리거되도록 하세요.

**1단계: 터미널의 마이크 권한 초기화**

`tccutil reset Microphone <bundle-id>` 명령을 실행합니다. `<bundle-id>`를 터미널의 식별자로 대체하세요: 기본 Terminal의 경우 `com.apple.Terminal`, iTerm2의 경우 `com.googlecode.iterm2`. 다른 터미널의 식별자는 `osascript -e 'id of app "AppName"'` 명령으로 확인할 수 있습니다.

::: warning
번들 ID 없이 `tccutil reset Microphone`을 실행할 수 있지만, 이 경우 Zoom이나 Slack 같은 앱을 포함하여 Mac의 모든 앱에서 마이크 접근 권한이 취소됩니다. 각 앱은 다음 실행 시 다시 권한을 요청해야 하므로, 통화 중에는 실행하지 마세요.
:::

**2단계: 터미널 종료 후 재실행**

macOS는 이미 실행 중인 프로세스에 다시 권한을 요청하지 않습니다. 창을 닫는 것이 아니라 Cmd+Q로 터미널 앱을 완전히 종료한 다음 다시 실행하세요.

**3단계: 새 권한 요청 트리거**

Claude Code를 시작하고 `/voice` 명령을 실행하세요. macOS가 마이크 접근 권한을 요청하면 허용합니다.

## 관련 문서

* [키보드 단축키 커스터마이즈](/keybindings): `voice:pushToTalk` 및 기타 CLI 키보드 동작 다시 바인딩
* [설정 구성](/settings): `voiceEnabled`, `language` 및 기타 설정 키 전체 참조
* [대화형 모드](/interactive-mode): 키보드 단축키, 입력 모드, 세션 제어
* [명령어](/commands): `/voice`, `/config` 및 모든 명령어 참조
