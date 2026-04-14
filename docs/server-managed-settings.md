---
title: 서버 관리 설정 구성
description: 기기 관리 인프라 없이 서버를 통해 조직의 Claude Code를 중앙에서 구성합니다.
---

# 서버 관리 설정 구성

> 기기 관리 인프라 없이 서버를 통해 조직의 Claude Code를 중앙에서 구성합니다.

서버 관리 설정을 사용하면 관리자가 Claude.ai의 웹 기반 인터페이스를 통해 Claude Code를 중앙에서 구성할 수 있습니다. Claude Code 클라이언트는 사용자가 조직 자격 증명으로 인증할 때 이 설정을 자동으로 수신합니다.

이 방식은 기기 관리 인프라가 없거나, 관리되지 않는 기기의 사용자에 대한 설정을 관리해야 하는 조직을 위해 설계되었습니다.

:::info
서버 관리 설정은 [Claude for Teams](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=server_settings_teams#team-&-enterprise) 및 [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=server_settings_enterprise) 고객을 위해 제공됩니다.
:::

## 요구 사항

서버 관리 설정을 사용하려면 다음이 필요합니다:

* Claude for Teams 또는 Claude for Enterprise 플랜
* Claude for Teams의 경우 Claude Code 버전 2.1.38 이상, Claude for Enterprise의 경우 버전 2.1.30 이상
* `api.anthropic.com`에 대한 네트워크 접근

## 서버 관리 설정과 엔드포인트 관리 설정 비교

Claude Code는 중앙 집중식 구성을 위한 두 가지 방식을 지원합니다. 서버 관리 설정은 Anthropic 서버에서 구성을 전달합니다. [엔드포인트 관리 설정](/settings#settings-files)은 네이티브 OS 정책(macOS 관리 기본 설정, Windows 레지스트리) 또는 관리 설정 파일을 통해 기기에 직접 배포됩니다.

| 방식 | 적합한 경우 | 보안 모델 |
| :--- | :--- | :--- |
| **서버 관리 설정** | MDM이 없는 조직, 또는 관리되지 않는 기기의 사용자 | 인증 시 Anthropic 서버에서 설정 전달 |
| **[엔드포인트 관리 설정](/settings#settings-files)** | MDM 또는 엔드포인트 관리 솔루션이 있는 조직 | MDM 구성 프로파일, 레지스트리 정책, 또는 관리 설정 파일을 통해 기기에 설정 배포 |

기기가 MDM 또는 엔드포인트 관리 솔루션에 등록된 경우, 엔드포인트 관리 설정이 더 강력한 보안 보장을 제공합니다. 설정 파일이 OS 수준에서 사용자 수정으로부터 보호될 수 있기 때문입니다.

## 서버 관리 설정 구성

**1단계: 관리 콘솔 열기**

[Claude.ai](https://claude.ai)에서 **관리자 설정 > Claude Code > 관리 설정**으로 이동합니다.

**2단계: 설정 정의**

JSON으로 구성을 추가합니다. [hooks](/hooks), [환경 변수](/env-vars), `allowManagedPermissionRulesOnly`와 같은 [관리 전용 설정](/permissions#managed-only-settings)을 포함하여 [`settings.json`에서 사용 가능한 모든 설정](/settings#available-settings)이 지원됩니다.

다음 예시는 권한 거부 목록을 적용하고, 사용자가 권한을 우회하는 것을 방지하며, 권한 규칙을 관리 설정에 정의된 것으로 제한합니다:

```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true
}
```

Hook은 `settings.json`과 동일한 형식을 사용합니다.

다음 예시는 조직 전체에서 모든 파일 편집 후 감사 스크립트를 실행합니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "/usr/local/bin/audit-edit.sh" }
        ]
      }
    ]
  }
}
```

[auto 모드](/permission-modes#eliminate-prompts-with-auto-mode) 분류기가 조직에서 신뢰하는 저장소, 버킷, 도메인을 인식하도록 구성하려면:

```json
{
  "autoMode": {
    "environment": [
      "Source control: github.example.com/acme-corp and all repos under it",
      "Trusted cloud buckets: s3://acme-build-artifacts, gs://acme-ml-datasets",
      "Trusted internal domains: *.corp.example.com"
    ]
  }
}
```

Hook은 셸 명령을 실행하므로, 적용 전에 사용자에게 [보안 승인 대화 상자](#보안-승인-대화-상자)가 표시됩니다. `autoMode` 항목이 분류기의 차단 동작과 `allow` 및 `soft_deny` 필드에 대한 중요 경고에 미치는 영향은 [auto 모드 분류기 구성](/permissions#configure-the-auto-mode-classifier)을 참고하세요.

**3단계: 저장 및 배포**

변경 사항을 저장합니다. Claude Code 클라이언트는 다음 시작 시 또는 매시간 폴링 주기에 업데이트된 설정을 수신합니다.

### 설정 전달 확인

설정이 적용되고 있는지 확인하려면 사용자에게 Claude Code를 재시작하도록 요청합니다. 구성에 [보안 승인 대화 상자](#보안-승인-대화-상자)를 트리거하는 설정이 포함된 경우, 시작 시 관리 설정을 설명하는 프롬프트가 표시됩니다. 또한 사용자가 `/permissions`를 실행하여 유효한 권한 규칙을 확인함으로써 관리 권한 규칙이 활성 상태인지 검증할 수 있습니다.

### 접근 제어

다음 역할이 서버 관리 설정을 관리할 수 있습니다:

* **Primary Owner**
* **Owner**

설정 변경은 조직의 모든 사용자에게 적용되므로, 신뢰할 수 있는 담당자만 접근할 수 있도록 제한합니다.

### 관리 전용 설정

대부분의 [설정 키](/settings#available-settings)는 모든 범위에서 작동합니다. 일부 키는 관리 설정에서만 읽히며, 사용자 또는 프로젝트 설정 파일에 배치해도 효과가 없습니다. 전체 목록은 [관리 전용 설정](/permissions#managed-only-settings)을 참고하세요. 해당 목록에 없는 설정은 관리 설정에 배치할 수 있으며, 가장 높은 우선순위를 가집니다.

### 현재 제한 사항

서버 관리 설정에는 다음과 같은 제한 사항이 있습니다:

* 설정은 조직의 모든 사용자에게 일률적으로 적용됩니다. 그룹별 구성은 아직 지원되지 않습니다.
* [MCP 서버 구성](/mcp#managed-mcp-configuration)은 서버 관리 설정을 통해 배포할 수 없습니다.

## 설정 전달

### 설정 우선순위

서버 관리 설정과 [엔드포인트 관리 설정](/settings#settings-files)은 모두 Claude Code [설정 계층](/settings#settings-precedence)에서 가장 높은 계층을 차지합니다. 명령줄 인수를 포함한 다른 어떤 설정 수준도 이를 재정의할 수 없습니다.

관리 계층 내에서는 비어 있지 않은 구성을 전달하는 첫 번째 소스가 우선합니다. 서버 관리 설정이 먼저 확인되고, 그다음 엔드포인트 관리 설정이 확인됩니다. 소스는 병합되지 않습니다. 서버 관리 설정이 어떤 키라도 전달하면 엔드포인트 관리 설정은 완전히 무시됩니다. 서버 관리 설정이 아무것도 전달하지 않으면 엔드포인트 관리 설정이 적용됩니다.

엔드포인트 관리 plist 또는 레지스트리 정책으로 폴백하기 위해 관리 콘솔에서 서버 관리 구성을 지우려는 경우, [캐시된 설정](#가져오기-및-캐싱-동작)이 다음 성공적인 가져오기까지 클라이언트 기기에 유지된다는 점에 주의하세요. `/status`를 실행하여 어느 관리 소스가 활성 상태인지 확인할 수 있습니다.

### 가져오기 및 캐싱 동작

Claude Code는 시작 시 Anthropic 서버에서 설정을 가져오고, 활성 세션 중 매시간 업데이트를 폴링합니다.

**캐시된 설정 없이 처음 실행 시:**

* Claude Code가 비동기적으로 설정을 가져옵니다
* 가져오기가 실패하면 Claude Code는 관리 설정 없이 계속됩니다
* 설정이 로드되기 전 잠깐의 시간 동안 제한이 아직 적용되지 않습니다

**캐시된 설정이 있는 이후 실행 시:**

* 캐시된 설정이 시작 시 즉시 적용됩니다
* Claude Code가 백그라운드에서 최신 설정을 가져옵니다
* 캐시된 설정은 네트워크 오류가 발생해도 유지됩니다

Claude Code는 재시작 없이 설정 업데이트를 자동으로 적용합니다. 단, OpenTelemetry 구성과 같은 고급 설정은 전체 재시작이 필요합니다.

### 강제 페일-클로즈드 시작

기본적으로 시작 시 원격 설정 가져오기가 실패하면 CLI는 관리 설정 없이 계속됩니다. 이 짧은 미적용 시간이 허용되지 않는 환경의 경우, 관리 설정에 `forceRemoteSettingsRefresh: true`를 설정합니다.

이 설정이 활성화되면 CLI는 원격 설정이 새로 가져와질 때까지 시작 시 차단됩니다. 가져오기가 실패하면 CLI는 정책 없이 진행하는 대신 종료됩니다. 이 설정은 자기 지속적입니다. 서버에서 전달되면 로컬에도 캐시되므로, 새 세션의 첫 번째 성공적인 가져오기 이전에도 이후 시작 시 동일한 동작이 적용됩니다.

이 설정을 활성화하려면 관리 설정 구성에 해당 키를 추가합니다:

```json
{
  "forceRemoteSettingsRefresh": true
}
```

이 설정을 활성화하기 전에 네트워크 정책이 `api.anthropic.com`에 대한 연결을 허용하는지 확인하세요. 해당 엔드포인트에 접근할 수 없으면 CLI가 시작 시 종료되고 사용자는 Claude Code를 시작할 수 없습니다.

### 보안 승인 대화 상자

보안 위험을 야기할 수 있는 특정 설정은 적용 전에 사용자의 명시적 승인이 필요합니다:

* **셸 명령 설정**: 셸 명령을 실행하는 설정
* **커스텀 환경 변수**: 알려진 안전 허용 목록에 없는 변수
* **Hook 구성**: 모든 hook 정의

이러한 설정이 있으면 사용자에게 구성 내용을 설명하는 보안 대화 상자가 표시됩니다. 사용자는 계속 진행하려면 승인해야 합니다. 사용자가 설정을 거부하면 Claude Code가 종료됩니다.

:::info
`-p` 플래그를 사용하는 비대화형 모드에서 Claude Code는 보안 대화 상자를 건너뛰고 사용자 승인 없이 설정을 적용합니다.
:::

## 플랫폼 가용성

서버 관리 설정은 `api.anthropic.com`에 대한 직접 연결이 필요하며, 서드파티 모델 공급자를 사용할 때는 사용할 수 없습니다:

* Amazon Bedrock
* Google Vertex AI
* Microsoft Foundry
* `ANTHROPIC_BASE_URL` 또는 [LLM 게이트웨이](/llm-gateway)를 통한 커스텀 API 엔드포인트

## 감사 로깅

설정 변경에 대한 감사 로그 이벤트는 컴플라이언스 API 또는 감사 로그 내보내기를 통해 확인할 수 있습니다. 접근 권한은 Anthropic 계정 팀에 문의하세요.

감사 이벤트에는 수행된 작업 유형, 작업을 수행한 계정 및 기기, 이전 값과 새 값에 대한 참조가 포함됩니다.

## 보안 고려 사항

서버 관리 설정은 중앙 집중식 정책 적용을 제공하지만, 클라이언트 측 제어로 작동합니다. 관리되지 않는 기기에서 관리자 또는 sudo 권한이 있는 사용자는 Claude Code 바이너리, 파일 시스템, 또는 네트워크 구성을 수정할 수 있습니다.

| 시나리오 | 동작 |
| :--- | :--- |
| 사용자가 캐시된 설정 파일을 편집하는 경우 | 변조된 파일이 시작 시 적용되지만, 다음 서버 가져오기에서 올바른 설정으로 복원됩니다 |
| 사용자가 캐시된 설정 파일을 삭제하는 경우 | 첫 실행 동작 발생: 설정이 비동기적으로 가져와지며 잠깐의 미적용 시간이 있습니다 |
| API를 사용할 수 없는 경우 | 캐시된 설정이 있으면 적용되고, 그렇지 않으면 다음 성공적인 가져오기까지 관리 설정이 적용되지 않습니다. `forceRemoteSettingsRefresh: true`를 사용하면 CLI가 계속하는 대신 종료됩니다 |
| 사용자가 다른 조직으로 인증하는 경우 | 관리 조직 외부 계정에 대해서는 설정이 전달되지 않습니다 |
| 사용자가 기본값이 아닌 `ANTHROPIC_BASE_URL`을 설정하는 경우 | 서드파티 API 공급자를 사용할 때 서버 관리 설정이 우회됩니다 |

런타임 구성 변경을 감지하려면 [`ConfigChange` hook](/hooks#configchange)을 사용하여 수정 사항을 로그로 기록하거나 적용 전에 승인되지 않은 변경을 차단하세요.

더 강력한 적용 보장을 위해서는 MDM 솔루션에 등록된 기기에서 [엔드포인트 관리 설정](/settings#settings-files)을 사용하세요.

## 관련 문서

Claude Code 구성 관리를 위한 관련 페이지:

* [설정](/settings): 사용 가능한 모든 설정을 포함한 전체 구성 참조
* [엔드포인트 관리 설정](/settings#settings-files): IT 부서에서 기기에 배포하는 관리 설정
* [인증](/authentication): Claude Code에 대한 사용자 접근 설정
* [보안](/security): 보안 보호 장치 및 모범 사례
