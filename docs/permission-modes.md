# 권한 모드 선택

> Claude가 파일을 편집하거나 명령을 실행하기 전에 확인할지 여부를 제어합니다. CLI에서 Shift+Tab으로 모드를 전환하거나, VS Code, Desktop, claude.ai의 모드 선택기를 사용하세요.

Claude가 파일을 편집하거나, 셸 명령을 실행하거나, 네트워크 요청을 할 때 일시 중지하여 작업 승인을 요청합니다. 권한 모드는 이 일시 중지가 얼마나 자주 발생하는지를 제어합니다. 선택하는 모드가 세션의 흐름을 결정합니다: 기본 모드에서는 각 작업을 검토하고, 느슨한 모드에서는 Claude가 더 긴 중단 없는 작업을 수행하고 완료 시 보고합니다. 민감한 작업에는 더 많은 감독을, 방향을 신뢰할 때는 더 적은 중단을 선택하세요.

## 사용 가능한 모드

각 모드는 편의성과 감독 사이에서 다른 트레이드오프를 만듭니다. 아래 표는 각 모드에서 권한 프롬프트 없이 Claude가 수행할 수 있는 작업을 보여줍니다.

| 모드                                                                            | 확인 없이 실행되는 것                                                                  | 적합한 용도                              |
| :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- | :-------------------------------------- |
| `default`                                                                       | 읽기만                                                                                 | 시작하기, 민감한 작업                     |
| [`acceptEdits`](#acceptedits-모드로-파일-편집-자동-승인)                             | 읽기, 파일 편집, 일반 파일시스템 명령(`mkdir`, `touch`, `mv`, `cp` 등)                    | 검토 중인 코드 반복 작업                  |
| [`plan`](#plan-모드로-편집-전-분석)                                                 | 읽기만                                                                                 | 변경 전 코드베이스 탐색                   |
| [`auto`](#auto-모드로-프롬프트-제거)                                                | 모든 것, 백그라운드 안전 검사 포함                                                       | 긴 작업, 프롬프트 피로 줄이기             |
| [`dontAsk`](#dontask-모드로-사전-승인된-도구만-허용)                                 | 사전 승인된 도구만                                                                      | 잠금된 CI 및 스크립트                     |
| [`bypassPermissions`](#bypasspermissions-모드로-모든-검사-건너뛰기)                  | 보호된 경로를 제외한 모든 것                                                             | 격리된 컨테이너와 VM만                    |

모드에 관계없이, [보호된 경로](#보호된-경로)에 대한 쓰기는 절대 자동 승인되지 않아, 리포지토리 상태와 Claude의 자체 구성이 실수로 손상되는 것을 방지합니다.

모드는 기준선을 설정합니다. [권한 규칙](/permissions#manage-permissions)을 위에 추가하여 `bypassPermissions`를 제외한 모든 모드에서 특정 도구를 사전 승인하거나 차단할 수 있습니다. `bypassPermissions`는 권한 레이어를 완전히 건너뜁니다.

## 권한 모드 전환

세션 중, 시작 시 또는 기본값으로 모드를 전환할 수 있습니다. 모드는 채팅에서 Claude에게 요청하는 것이 아니라 이러한 컨트롤을 통해 설정됩니다. 아래에서 인터페이스를 선택하여 변경 방법을 확인하세요.

::: tabs

== CLI

**세션 중**: `Shift+Tab`을 눌러 `default` → `acceptEdits` → `plan`을 순환합니다. 현재 모드는 상태 바에 표시됩니다. 모든 모드가 기본 순환에 포함되지는 않습니다:

* `auto`: `--enable-auto-mode` 또는 설정의 동등한 지속 옵션으로 옵트인한 후 나타남
* `bypassPermissions`: `--permission-mode bypassPermissions`, `--dangerously-skip-permissions`, 또는 `--allow-dangerously-skip-permissions`로 시작한 후 나타남. `--allow-` 변형은 활성화하지 않고 순환에 모드를 추가함
* `dontAsk`: 순환에 나타나지 않음. `--permission-mode dontAsk`로 설정

활성화된 선택적 모드는 `plan` 다음에 삽입되며, `bypassPermissions`가 먼저, `auto`가 마지막입니다. 둘 다 활성화한 경우 `auto`로 가는 도중에 `bypassPermissions`를 거칩니다.

**시작 시**: 플래그로 모드를 전달합니다.

```bash
claude --permission-mode plan
```

**기본값으로**: [설정](/settings#settings-files)에서 `defaultMode`를 설정합니다.

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

동일한 `--permission-mode` 플래그가 [비대화형 실행](/headless)의 `-p`와 함께 작동합니다.

== VS Code

**세션 중**: 프롬프트 상자 하단의 모드 표시기를 클릭합니다.

**기본값으로**: VS Code 설정에서 `claudeCode.initialPermissionMode`를 설정하거나, Claude Code 확장 설정 패널을 사용합니다.

모드 표시기는 다음 레이블을 표시하며, 각각 적용되는 모드에 매핑됩니다:

| UI 레이블           | 모드                |
| :----------------- | :------------------ |
| Ask before edits   | `default`           |
| Edit automatically | `acceptEdits`       |
| Plan mode          | `plan`              |
| Auto mode          | `auto`              |
| Bypass permissions | `bypassPermissions` |

Auto 모드는 확장 설정에서 **Allow dangerously skip permissions**를 활성화한 후 모드 표시기에 나타나지만, [auto 모드 섹션](#auto-모드로-프롬프트-제거)에 나열된 모든 요구 사항을 계정이 충족할 때까지 사용할 수 없습니다. `claudeCode.initialPermissionMode` 설정은 `auto`를 허용하지 않습니다. 기본적으로 auto 모드로 시작하려면 Claude Code [`settings.json`](/settings#settings-files)에서 `defaultMode`를 설정하세요.

Bypass permissions도 모드 표시기에 나타나기 전에 **Allow dangerously skip permissions** 토글이 필요합니다.

자세한 내용은 [VS Code 가이드](/vs-code)를 참조하세요.

== JetBrains

JetBrains 플러그인은 IDE 터미널에서 Claude Code를 실행하므로, 모드 전환은 CLI와 동일하게 작동합니다: `Shift+Tab`을 눌러 순환하거나 실행 시 `--permission-mode`를 전달합니다.

== Desktop

보내기 버튼 옆의 모드 선택기를 사용합니다. Auto 및 Bypass permissions는 Desktop 설정에서 활성화한 후에만 나타납니다. [Desktop 가이드](/desktop#choose-a-permission-mode)를 참조하세요.

== 웹 및 모바일

[claude.ai/code](https://claude.ai/code)의 프롬프트 상자 옆 또는 모바일 앱의 모드 드롭다운을 사용합니다. 권한 프롬프트가 claude.ai에 승인을 위해 나타납니다. 표시되는 모드는 세션이 실행되는 위치에 따라 다릅니다:

* [Claude Code on the web](/claude-code-on-the-web)의 **클라우드 세션**: Auto accept edits 및 Plan mode. Ask permissions, Auto, Bypass permissions는 사용할 수 없습니다.
* 로컬 머신의 **[Remote Control](/remote-control) 세션**: Ask permissions, Auto accept edits, Plan mode. Auto 및 Bypass permissions는 사용할 수 없습니다.

Remote Control의 경우, 호스트를 시작할 때 시작 모드를 설정할 수도 있습니다:

```bash
claude remote-control --permission-mode acceptEdits
```

:::

## acceptEdits 모드로 파일 편집 자동 승인

`acceptEdits` 모드에서는 Claude가 프롬프트 없이 작업 디렉토리의 파일을 생성하고 편집할 수 있습니다. 이 모드가 활성화되면 상태 바에 `⏵⏵ accept edits on`이 표시됩니다.

파일 편집 외에도 `acceptEdits` 모드는 일반적인 파일시스템 Bash 명령도 자동 승인합니다: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed`. 이러한 명령은 `LANG=C`나 `NO_COLOR=1`과 같은 안전한 환경 변수 접두사, `timeout`, `nice`, `nohup`과 같은 프로세스 래퍼가 있을 때도 자동 승인됩니다. 파일 편집과 마찬가지로, 자동 승인은 작업 디렉토리 또는 `additionalDirectories` 내의 경로에만 적용됩니다. 해당 범위 밖의 경로, [보호된 경로](#보호된-경로)에 대한 쓰기, 기타 모든 Bash 명령은 여전히 프롬프트가 표시됩니다.

편집을 인라인으로 승인하는 대신 편집기나 `git diff`를 통해 사후에 변경 사항을 검토하려면 `acceptEdits`를 사용하세요. 기본 모드에서 `Shift+Tab`을 한 번 누르면 진입하거나, 직접 시작할 수 있습니다:

```bash
claude --permission-mode acceptEdits
```

## plan 모드로 편집 전 분석

Plan 모드는 Claude에게 변경 사항을 만들지 않고 조사하고 제안하도록 지시합니다. Claude는 파일을 읽고, 셸 명령을 실행하여 탐색하고, 계획을 작성하지만 소스를 편집하지는 않습니다. 권한 프롬프트는 기본 모드와 동일하게 적용됩니다.

`Shift+Tab`을 누르거나 단일 프롬프트 앞에 `/plan`을 접두사로 붙여 plan 모드에 진입합니다. CLI에서 plan 모드로 시작할 수도 있습니다:

```bash
claude --permission-mode plan
```

계획을 승인하지 않고 plan 모드를 떠나려면 `Shift+Tab`을 다시 누르세요.

계획이 준비되면 Claude가 계획을 제시하고 진행 방법을 묻습니다. 해당 프롬프트에서 다음을 선택할 수 있습니다:

* auto 모드로 승인 및 시작
* 편집 수락으로 승인
* 각 편집을 수동으로 검토하며 승인
* 피드백으로 계속 계획하기
* 브라우저 기반 리뷰를 위해 [Ultraplan](/ultraplan)으로 다듬기

각 승인 옵션은 먼저 계획 컨텍스트를 지우는 옵션도 제공합니다.

## auto 모드로 프롬프트 제거

::: info 참고
Auto 모드에는 Claude Code v2.1.83 이상이 필요합니다.
:::

Auto 모드에서는 Claude가 권한 프롬프트 없이 실행합니다. 별도의 분류기 모델이 작업 실행 전에 검토하여, 요청 범위를 벗어나거나, 인식되지 않는 인프라를 대상으로 하거나, Claude가 읽은 적대적 콘텐츠에 의해 유도된 것으로 보이는 작업을 차단합니다.

::: warning 주의
Auto 모드는 리서치 프리뷰입니다. 프롬프트를 줄이지만 안전을 보장하지는 않습니다. 일반적인 방향을 신뢰하는 작업에 사용하고, 민감한 작업에 대한 검토 대체물로 사용하지 마세요.
:::

Auto 모드는 계정이 다음 요구 사항을 모두 충족할 때만 사용할 수 있습니다:

* **플랜**: Team, Enterprise 또는 API. Pro 또는 Max에서는 사용할 수 없습니다.
* **관리자**: Team 및 Enterprise에서는 사용자가 켜기 전에 관리자가 [Claude Code 관리 설정](https://claude.ai/admin-settings/claude-code)에서 활성화해야 합니다. 관리자는 [관리 설정](/permissions#managed-settings)에서 `permissions.disableAutoMode`를 `"disable"`로 설정하여 잠금할 수도 있습니다.
* **모델**: Claude Sonnet 4.6 또는 Opus 4.6. Haiku나 claude-3 모델에서는 사용할 수 없습니다.
* **제공업체**: Anthropic API만. Bedrock, Vertex, Foundry에서는 사용할 수 없습니다.

Claude Code가 auto 모드를 사용할 수 없다고 보고하면 이러한 요구 사항 중 하나가 충족되지 않은 것입니다. 이는 일시적인 장애가 아닙니다.

활성화되면 플래그로 시작하고 `auto`가 `Shift+Tab` 순환에 참여합니다:

```bash
claude --enable-auto-mode
```

### 분류기가 기본적으로 차단하는 것

분류기는 작업 디렉토리와 리포지토리의 구성된 리모트를 신뢰합니다. 그 외의 모든 것은 [신뢰할 수 있는 인프라를 구성](/permissions#configure-the-auto-mode-classifier)할 때까지 외부로 취급됩니다.

**기본적으로 차단되는 것**:

* `curl | bash`와 같은 코드 다운로드 및 실행
* 외부 엔드포인트로 민감한 데이터 전송
* 프로덕션 배포 및 마이그레이션
* 클라우드 스토리지의 대량 삭제
* IAM 또는 리포지토리 권한 부여
* 공유 인프라 수정
* 세션 전에 존재했던 파일의 복구 불가능한 삭제
* Force push 또는 `main`에 직접 push

**기본적으로 허용되는 것**:

* 작업 디렉토리의 로컬 파일 작업
* 잠금 파일이나 매니페스트에 선언된 의존성 설치
* `.env` 읽기 및 해당 API에 자격 증명 전송
* 읽기 전용 HTTP 요청
* 시작한 브랜치 또는 Claude가 생성한 브랜치로 push
* 샌드박스 네트워크 접근 요청

`claude auto-mode defaults`를 실행하여 전체 규칙 목록을 확인하세요. 일상적인 작업이 차단되면 관리자가 `autoMode.environment` 설정을 통해 신뢰할 수 있는 리포지토리, 버킷, 서비스를 추가할 수 있습니다: [auto 모드 분류기 구성](/permissions#configure-the-auto-mode-classifier)을 참조하세요.

### auto 모드가 대체되는 경우

거부된 각 작업은 알림을 표시하고 `/permissions`의 Recently denied 탭에 나타나며, 여기서 `r`을 눌러 수동 승인으로 재시도할 수 있습니다.

분류기가 연속 3회 또는 총 20회 작업을 차단하면 auto 모드가 일시 중지되고 Claude Code가 프롬프트를 재개합니다. 프롬프트된 작업을 승인하면 auto 모드가 재개됩니다. 이러한 임계값은 구성할 수 없습니다. 허용된 작업은 연속 카운터를 재설정하고, 총 카운터는 세션 동안 유지되며 자체 한도가 대체를 트리거할 때만 재설정됩니다.

`-p` 플래그를 사용한 [비대화형 모드](/headless)에서는 사용자가 프롬프트할 수 없으므로 반복 차단 시 세션이 중단됩니다.

반복 차단은 일반적으로 분류기가 인프라에 대한 컨텍스트가 부족함을 의미합니다. `/feedback`을 사용하여 오탐을 보고하거나, 관리자에게 [신뢰할 수 있는 인프라를 구성](/permissions#configure-the-auto-mode-classifier)하도록 요청하세요.

::: details 분류기가 작업을 평가하는 방법
각 작업은 고정된 결정 순서를 거칩니다. 첫 번째 일치하는 단계가 적용됩니다:

1. [허용 또는 거부 규칙](/permissions#manage-permissions)과 일치하는 작업은 즉시 처리됨
2. 읽기 전용 작업과 작업 디렉토리의 파일 편집은 자동 승인됨, [보호된 경로](#보호된-경로)에 대한 쓰기 제외
3. 나머지 모든 것은 분류기로 전달
4. 분류기가 차단하면 Claude는 이유를 받고 대안을 시도

auto 모드 진입 시, 임의 코드 실행을 허용하는 광범위한 허용 규칙이 제거됩니다:

* 포괄적인 `Bash(*)`
* `Bash(python*)`과 같은 와일드카드 인터프리터
* 패키지 매니저 실행 명령
* `Agent` 허용 규칙

`Bash(npm test)`와 같은 좁은 규칙은 유지됩니다. 제거된 규칙은 auto 모드를 떠날 때 복원됩니다.

분류기는 사용자 메시지, 도구 호출, CLAUDE.md 콘텐츠를 봅니다. 도구 결과는 제거되므로, 파일이나 웹 페이지의 적대적 콘텐츠가 직접 조작할 수 없습니다. 별도의 서버 측 프로브가 들어오는 도구 결과를 스캔하고 Claude가 읽기 전에 의심스러운 콘텐츠를 표시합니다. 이러한 레이어가 함께 작동하는 방식에 대한 자세한 내용은 [auto 모드 발표](https://claude.com/blog/auto-mode) 및 [엔지니어링 심층 분석](https://www.anthropic.com/engineering/claude-code-auto-mode)을 참조하세요.
:::

::: details auto 모드가 서브에이전트를 처리하는 방법
분류기는 [서브에이전트](/sub-agents) 작업을 세 지점에서 확인합니다:

1. 서브에이전트가 시작하기 전에 위임된 작업 설명이 평가되므로, 위험해 보이는 작업은 생성 시점에 차단됩니다.
2. 서브에이전트가 실행되는 동안 각 작업은 상위 세션과 동일한 규칙으로 분류기를 거치며, 서브에이전트 frontmatter의 `permissionMode`는 무시됩니다.
3. 서브에이전트가 완료되면 분류기가 전체 작업 이력을 검토합니다. 반환 검사에서 우려 사항이 발견되면 서브에이전트 결과에 보안 경고가 추가됩니다.
:::

::: details 비용 및 지연 시간
분류기는 현재 메인 세션 모델에 관계없이 Claude Sonnet 4.6에서 실행됩니다. 분류기 호출은 토큰 사용량에 포함됩니다. 각 검사는 트랜스크립트의 일부와 보류 중인 작업을 전송하여 실행 전에 왕복 시간이 추가됩니다. 보호된 경로 외부의 읽기 및 작업 디렉토리 편집은 분류기를 건너뛰므로, 오버헤드는 주로 셸 명령과 네트워크 작업에서 발생합니다.
:::

## dontAsk 모드로 사전 승인된 도구만 허용

`dontAsk` 모드는 명시적으로 허용되지 않은 모든 도구를 자동 거부합니다. `permissions.allow` 규칙과 일치하는 작업만 실행할 수 있으며, 명시적 `ask` 규칙도 프롬프트 대신 거부됩니다. 이를 통해 Claude가 수행할 수 있는 작업을 정확히 사전 정의하는 CI 파이프라인이나 제한된 환경에서 완전히 비대화형으로 사용할 수 있습니다.

플래그로 시작 시 설정합니다:

```bash
claude --permission-mode dontAsk
```

## bypassPermissions 모드로 모든 검사 건너뛰기

`bypassPermissions` 모드는 권한 프롬프트와 안전 검사를 비활성화하여 도구 호출이 즉시 실행됩니다. [보호된 경로](#보호된-경로)에 대한 쓰기만 여전히 프롬프트가 표시됩니다. 인터넷 접근이 없는 컨테이너, VM, devcontainer와 같은 격리된 환경에서만 이 모드를 사용하세요. Claude Code가 호스트 시스템을 손상시킬 수 없는 경우에만 사용합니다.

활성화 플래그 없이 시작된 세션에서는 `bypassPermissions`에 진입할 수 없습니다. 활성화하려면 플래그 중 하나로 다시 시작하세요:

```bash
claude --permission-mode bypassPermissions
```

`--dangerously-skip-permissions` 플래그도 동일합니다.

::: warning 주의
`bypassPermissions`는 프롬프트 인젝션이나 의도하지 않은 작업에 대한 보호를 제공하지 않습니다. 프롬프트 없이 백그라운드 안전 검사를 원하면 대신 [auto 모드](#auto-모드로-프롬프트-제거)를 사용하세요. 관리자는 [관리 설정](/permissions#managed-settings)에서 `permissions.disableBypassPermissionsMode`를 `"disable"`로 설정하여 이 모드를 차단할 수 있습니다.
:::

## 보호된 경로

소수의 경로에 대한 쓰기는 모든 모드에서 자동 승인되지 않습니다. 이는 리포지토리 상태와 Claude 자체 구성의 우발적 손상을 방지합니다. `default`, `acceptEdits`, `plan`, `bypassPermissions`에서는 이러한 쓰기가 프롬프트를 표시하고, `auto`에서는 분류기로 라우팅되며, `dontAsk`에서는 거부됩니다.

보호된 디렉토리:

* `.git`
* `.vscode`
* `.idea`
* `.husky`
* `.claude` (Claude가 일상적으로 콘텐츠를 생성하는 `.claude/commands`, `.claude/agents`, `.claude/skills`, `.claude/worktrees` 제외)

보호된 파일:

* `.gitconfig`, `.gitmodules`
* `.bashrc`, `.bash_profile`, `.zshrc`, `.zprofile`, `.profile`
* `.ripgreprc`
* `.mcp.json`, `.claude.json`

## 참고

* [권한](/permissions): 허용, 확인, 거부 규칙; auto 모드 분류기 구성; 관리 정책
* [훅](/hooks): `PreToolUse` 및 `PermissionRequest` 훅을 통한 사용자 정의 권한 로직
* [Ultraplan](/ultraplan): 브라우저 기반 리뷰로 Claude Code on the web 세션에서 plan 모드 실행
* [보안](/security): 보안 장치 및 모범 사례
* [샌드박싱](/sandboxing): Bash 명령에 대한 파일시스템 및 네트워크 격리
* [비대화형 모드](/headless): `-p` 플래그로 Claude Code 실행
