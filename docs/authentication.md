---
title: 인증
description: Claude Code에 로그인하고 개인, 팀 및 조직을 위한 인증을 구성합니다.
---

# 인증

Claude Code는 설정에 따라 여러 인증 방법을 지원합니다. 개인 사용자는 Claude.ai 계정으로 로그인할 수 있으며, 팀은 Claude for Teams 또는 Enterprise, Claude Console, 또는 Amazon Bedrock, Google Vertex AI, Microsoft Foundry와 같은 클라우드 제공자를 사용할 수 있습니다.

## Claude Code에 로그인

[Claude Code를 설치](/setup#install-claude-code)한 후 터미널에서 `claude`를 실행하세요. 처음 실행 시 Claude Code가 브라우저 창을 열어 로그인할 수 있게 합니다.

브라우저가 자동으로 열리지 않으면 `c`를 눌러 로그인 URL을 클립보드에 복사한 다음 브라우저에 붙여넣으세요.

로그인 후 브라우저가 리디렉션되지 않고 로그인 코드를 표시하는 경우, 터미널의 `Paste code here if prompted` 프롬프트에 코드를 붙여넣으세요.

다음 계정 유형 중 하나로 인증할 수 있습니다:

* **Claude Pro 또는 Max 구독**: Claude.ai 계정으로 로그인합니다. [claude.com/pricing](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_pro_max)에서 구독하세요.
* **Claude for Teams 또는 Enterprise**: 팀 관리자가 초대한 Claude.ai 계정으로 로그인합니다.
* **Claude Console**: Console 자격 증명으로 로그인합니다. 관리자가 먼저 [사용자를 초대](#claude-console-인증)해야 합니다.
* **클라우드 제공자**: 조직에서 [Amazon Bedrock](/amazon-bedrock), [Google Vertex AI](/google-vertex-ai) 또는 [Microsoft Foundry](/microsoft-foundry)를 사용하는 경우, `claude`를 실행하기 전에 필요한 환경 변수를 설정하세요. 브라우저 로그인이 필요하지 않습니다.

로그아웃하고 재인증하려면 Claude Code 프롬프트에서 `/logout`을 입력하세요.

로그인에 문제가 있는 경우 [인증 문제 해결](/troubleshooting#authentication-issues)을 참조하세요.

## 팀 인증 설정

팀 및 조직의 경우 다음 방법 중 하나로 Claude Code 접근을 구성할 수 있습니다:

* [Claude for Teams 또는 Enterprise](#claude-for-teams-또는-enterprise) - 대부분의 팀에 권장
* [Claude Console](#claude-console-인증)
* [Amazon Bedrock](/amazon-bedrock)
* [Google Vertex AI](/google-vertex-ai)
* [Microsoft Foundry](/microsoft-foundry)

### Claude for Teams 또는 Enterprise

[Claude for Teams](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_teams#team-&-enterprise)와 [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_enterprise)는 Claude Code를 사용하는 조직에 최적의 경험을 제공합니다. 팀 구성원은 중앙 집중식 청구 및 팀 관리와 함께 Claude Code와 웹의 Claude에 모두 접근할 수 있습니다.

* **Claude for Teams**: 협업 기능, 관리자 도구, 청구 관리가 포함된 셀프 서비스 플랜입니다. 소규모 팀에 적합합니다.
* **Claude for Enterprise**: SSO, 도메인 캡처, 역할 기반 권한, 컴플라이언스 API, 조직 전체 Claude Code 구성을 위한 관리형 정책 설정이 추가됩니다. 보안 및 컴플라이언스 요구사항이 있는 대규모 조직에 적합합니다.

1. **구독**: [Claude for Teams](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_teams_step#team-&-enterprise)를 구독하거나 [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_enterprise_step)는 영업팀에 문의하세요.

2. **팀 구성원 초대**: 관리자 대시보드에서 팀 구성원을 초대합니다.

3. **설치 및 로그인**: 팀 구성원이 Claude Code를 설치하고 Claude.ai 계정으로 로그인합니다.

### Claude Console 인증

API 기반 청구를 선호하는 조직의 경우 Claude Console을 통해 접근을 설정할 수 있습니다.

1. **Console 계정 생성 또는 사용**: 기존 Claude Console 계정을 사용하거나 새로 만듭니다.

2. **사용자 추가**: 다음 방법 중 하나로 사용자를 추가할 수 있습니다:
   * Console 내에서 사용자 일괄 초대: Settings -> Members -> Invite
   * [SSO 설정](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso)

3. **역할 할당**: 사용자를 초대할 때 다음 중 하나를 할당합니다:
   * **Claude Code** 역할: 사용자가 Claude Code API 키만 생성 가능
   * **Developer** 역할: 사용자가 모든 종류의 API 키 생성 가능

4. **사용자 설정 완료**: 초대된 각 사용자는 다음을 수행해야 합니다:
   * Console 초대 수락
   * [시스템 요구사항 확인](/setup#system-requirements)
   * [Claude Code 설치](/setup#install-claude-code)
   * Console 계정 자격 증명으로 로그인

### 클라우드 제공자 인증

Amazon Bedrock, Google Vertex AI 또는 Microsoft Foundry를 사용하는 팀의 경우:

1. **제공자 설정 따르기**: [Bedrock 문서](/amazon-bedrock), [Vertex 문서](/google-vertex-ai) 또는 [Microsoft Foundry 문서](/microsoft-foundry)를 참조하세요.

2. **구성 배포**: 환경 변수와 클라우드 자격 증명 생성 안내를 사용자에게 배포합니다. [구성 관리 방법](/settings)에서 자세한 내용을 확인하세요.

3. **Claude Code 설치**: 사용자가 [Claude Code를 설치](/setup#install-claude-code)할 수 있습니다.

## 자격 증명 관리

Claude Code는 인증 자격 증명을 안전하게 관리합니다:

* **저장 위치**: macOS에서는 암호화된 macOS Keychain에 자격 증명이 저장됩니다. Linux와 Windows에서는 `~/.claude/.credentials.json`에 저장되거나, `$CLAUDE_CONFIG_DIR` 변수가 설정된 경우 해당 경로에 저장됩니다. Linux에서는 파일이 모드 `0600`으로 작성되며, Windows에서는 사용자 프로필 디렉터리의 액세스 제어를 상속합니다.
* **지원되는 인증 유형**: Claude.ai 자격 증명, Claude API 자격 증명, Azure Auth, Bedrock Auth, Vertex Auth.
* **커스텀 자격 증명 스크립트**: [`apiKeyHelper`](/settings#available-settings) 설정을 통해 API 키를 반환하는 셸 스크립트를 실행하도록 구성할 수 있습니다.
* **갱신 주기**: 기본적으로 `apiKeyHelper`는 5분 후 또는 HTTP 401 응답 시 호출됩니다. `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 환경 변수로 커스텀 갱신 주기를 설정하세요.
* **느린 헬퍼 알림**: `apiKeyHelper`가 키를 반환하는 데 10초 이상 걸리면 Claude Code가 프롬프트 바에 경과 시간을 보여주는 경고 알림을 표시합니다. 이 알림이 자주 표시되면 자격 증명 스크립트를 최적화할 수 있는지 확인하세요.

`apiKeyHelper`, `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`은 터미널 CLI 세션에만 적용됩니다. Claude Desktop 및 원격 세션은 OAuth만 사용하며 `apiKeyHelper`를 호출하거나 API 키 환경 변수를 읽지 않습니다.

### 인증 우선순위

여러 자격 증명이 있는 경우 Claude Code는 다음 순서로 선택합니다:

1. 클라우드 제공자 자격 증명 - `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX` 또는 `CLAUDE_CODE_USE_FOUNDRY`가 설정된 경우. 설정은 [서드파티 연동](/third-party-integrations)을 참조하세요.
2. `ANTHROPIC_AUTH_TOKEN` 환경 변수. `Authorization: Bearer` 헤더로 전송됩니다. Anthropic API 키 대신 Bearer 토큰으로 인증하는 [LLM 게이트웨이 또는 프록시](/llm-gateway)를 통해 라우팅할 때 사용합니다.
3. `ANTHROPIC_API_KEY` 환경 변수. `X-Api-Key` 헤더로 전송됩니다. [Claude Console](https://platform.claude.com)에서 발급받은 키로 Anthropic API에 직접 접근할 때 사용합니다. 대화형 모드에서는 키 승인 또는 거부를 한 번 묻고 선택이 기억됩니다. 나중에 변경하려면 `/config`의 "Use custom API key" 토글을 사용하세요. 비대화형 모드(`-p`)에서는 키가 있으면 항상 사용됩니다.
4. [`apiKeyHelper`](/settings#available-settings) 스크립트 출력. Vault에서 가져온 단기 토큰과 같은 동적 또는 교체되는 자격 증명에 사용합니다.
5. `CLAUDE_CODE_OAUTH_TOKEN` 환경 변수. [`claude setup-token`](#장기-토큰-생성)으로 생성된 장기 OAuth 토큰입니다. 브라우저 로그인이 불가능한 CI 파이프라인 및 스크립트에 사용합니다.
6. `/login`의 구독 OAuth 자격 증명. Claude Pro, Max, Team, Enterprise 사용자의 기본값입니다.

활성 Claude 구독이 있지만 환경에 `ANTHROPIC_API_KEY`도 설정되어 있는 경우, 승인 후 API 키가 우선합니다. 키가 비활성화되었거나 만료된 조직에 속하면 인증 실패가 발생할 수 있습니다. 구독으로 폴백하려면 `unset ANTHROPIC_API_KEY`를 실행하고, `/status`에서 어떤 방법이 활성 상태인지 확인하세요.

[웹의 Claude Code](/claude-code-on-the-web)는 항상 구독 자격 증명을 사용합니다. 샌드박스 환경의 `ANTHROPIC_API_KEY`와 `ANTHROPIC_AUTH_TOKEN`은 이를 재정의하지 않습니다.

### 장기 토큰 생성

대화형 브라우저 로그인이 불가능한 CI 파이프라인, 스크립트 또는 기타 환경의 경우 `claude setup-token`으로 1년 유효 OAuth 토큰을 생성하세요:

```bash
claude setup-token
```

이 명령은 OAuth 인증을 안내하고 토큰을 터미널에 출력합니다. 토큰은 어디에도 저장되지 않으므로, 복사하여 인증이 필요한 곳에 `CLAUDE_CODE_OAUTH_TOKEN` 환경 변수로 설정하세요:

```bash
export CLAUDE_CODE_OAUTH_TOKEN=your-token
```

이 토큰은 Claude 구독으로 인증하며 Pro, Max, Team 또는 Enterprise 플랜이 필요합니다. 추론 전용으로 범위가 지정되며 [Remote Control](/remote-control) 세션을 설정할 수 없습니다.

[Bare 모드](/headless#start-faster-with-bare-mode)는 `CLAUDE_CODE_OAUTH_TOKEN`을 읽지 않습니다. 스크립트에서 `--bare`를 사용하는 경우 `ANTHROPIC_API_KEY` 또는 `apiKeyHelper`로 인증하세요.
