# 권한 설정

> Claude Code가 접근하고 수행할 수 있는 작업을 세밀한 권한 규칙, 모드, 관리형 정책으로 제어합니다.

Claude Code는 에이전트가 수행할 수 있는 작업과 수행할 수 없는 작업을 정확하게 지정할 수 있도록 세밀한 권한을 지원합니다. 권한 설정은 버전 관리에 체크인하여 조직의 모든 개발자에게 배포할 수 있으며, 개별 개발자가 맞춤 설정할 수도 있습니다.

## 권한 시스템

Claude Code는 강력함과 안전성의 균형을 맞추기 위해 계층형 권한 시스템을 사용합니다:

| 도구 유형     | 예시             | 승인 필요 여부 | "예, 다시 묻지 않기" 동작                |
| :------------ | :--------------- | :------------- | :--------------------------------------- |
| 읽기 전용     | 파일 읽기, Grep  | 아니오         | 해당 없음                                |
| Bash 명령어   | 셸 실행          | 예             | 프로젝트 디렉토리 및 명령어별 영구 적용  |
| 파일 수정     | 파일 편집/쓰기   | 예             | 세션 종료 시까지                         |

## 권한 관리

`/permissions`로 Claude Code의 도구 권한을 확인하고 관리할 수 있습니다. 이 UI는 모든 권한 규칙과 해당 규칙이 참조하는 settings.json 파일을 표시합니다.

* **Allow** 규칙은 Claude Code가 수동 승인 없이 지정된 도구를 사용할 수 있도록 허용합니다.
* **Ask** 규칙은 Claude Code가 지정된 도구를 사용하려고 할 때 확인을 요청합니다.
* **Deny** 규칙은 Claude Code가 지정된 도구를 사용하지 못하도록 차단합니다.

규칙은 다음 순서로 평가됩니다: **deny -> ask -> allow**. 첫 번째로 일치하는 규칙이 적용되므로, deny 규칙이 항상 우선합니다.

## 권한 모드

Claude Code는 도구 승인 방식을 제어하는 여러 권한 모드를 지원합니다. 각 모드를 언제 사용해야 하는지는 [권한 모드](/permission-modes)를 참조하세요. [설정 파일](/settings#settings-files)에서 `defaultMode`를 설정하세요:

| 모드                | 설명                                                                                                                                           |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`           | 표준 동작: 각 도구의 첫 사용 시 권한을 요청합니다                                                                                              |
| `acceptEdits`       | 작업 디렉토리 또는 `additionalDirectories`의 경로에 대해 파일 편집 및 일반 파일시스템 명령어(`mkdir`, `touch`, `mv`, `cp` 등)를 자동 승인합니다 |
| `plan`              | Plan 모드: Claude가 파일을 분석할 수 있지만 수정하거나 명령어를 실행할 수 없습니다                                                              |
| `auto`              | 작업이 요청과 일치하는지 확인하는 백그라운드 안전 검사와 함께 도구 호출을 자동 승인합니다. 현재 리서치 프리뷰 중입니다                           |
| `dontAsk`           | `/permissions` 또는 `permissions.allow` 규칙으로 사전 승인되지 않은 도구를 자동 거부합니다                                                     |
| `bypassPermissions` | 보호된 디렉토리 쓰기를 제외하고 권한 프롬프트를 건너뜁니다 (아래 경고 참조)                                                                    |

::: warning
`bypassPermissions` 모드는 권한 프롬프트를 건너뜁니다. `.git`, `.claude`, `.vscode`, `.idea`, `.husky` 디렉토리에 대한 쓰기는 저장소 상태, 에디터 설정, git 훅의 실수로 인한 손상을 방지하기 위해 여전히 확인을 요청합니다. `.claude/commands`, `.claude/agents`, `.claude/skills`에 대한 쓰기는 예외이며 프롬프트가 표시되지 않습니다. Claude가 스킬, 서브에이전트, 명령어를 생성할 때 일상적으로 해당 위치에 쓰기 때문입니다. 이 모드는 Claude Code가 손상을 일으킬 수 없는 컨테이너나 VM과 같은 격리된 환경에서만 사용하세요. 관리자는 [관리형 설정](#managed-settings)에서 `permissions.disableBypassPermissionsMode`를 `"disable"`로 설정하여 이 모드를 차단할 수 있습니다.
:::

`bypassPermissions` 또는 `auto` 모드 사용을 방지하려면 [설정 파일](/settings#settings-files)에서 `permissions.disableBypassPermissionsMode` 또는 `permissions.disableAutoMode`를 `"disable"`로 설정하세요. 이 설정은 재정의할 수 없는 [관리형 설정](#managed-settings)에서 가장 유용합니다.

## 권한 규칙 구문

권한 규칙은 `Tool` 또는 `Tool(specifier)` 형식을 따릅니다.

### 도구의 모든 사용 매칭

도구의 모든 사용을 매칭하려면 괄호 없이 도구 이름만 사용합니다:

| 규칙       | 효과                            |
| :--------- | :------------------------------ |
| `Bash`     | 모든 Bash 명령어를 매칭합니다   |
| `WebFetch` | 모든 웹 가져오기 요청을 매칭합니다 |
| `Read`     | 모든 파일 읽기를 매칭합니다     |

`Bash(*)`는 `Bash`와 동일하며 모든 Bash 명령어를 매칭합니다.

### 세밀한 제어를 위한 지정자 사용

괄호 안에 지정자를 추가하여 특정 도구 사용을 매칭합니다:

| 규칙                           | 효과                                                  |
| :----------------------------- | :---------------------------------------------------- |
| `Bash(npm run build)`          | 정확히 `npm run build` 명령어를 매칭합니다            |
| `Read(./.env)`                 | 현재 디렉토리의 `.env` 파일 읽기를 매칭합니다         |
| `WebFetch(domain:example.com)` | example.com에 대한 가져오기 요청을 매칭합니다         |

### 와일드카드 패턴

Bash 규칙은 `*`를 사용한 글로브 패턴을 지원합니다. 와일드카드는 명령어의 어느 위치에나 나타날 수 있습니다. 이 설정은 npm과 git commit 명령어를 허용하면서 git push를 차단합니다:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Bash(git * main)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "deny": [
      "Bash(git push *)"
    ]
  }
}
```

`*` 앞의 공백이 중요합니다: `Bash(ls *)`는 `ls -la`와 매칭되지만 `lsof`와는 매칭되지 않으며, `Bash(ls*)`는 둘 다 매칭됩니다. `:*` 접미사는 후행 와일드카드를 작성하는 동등한 방법이므로 `Bash(ls:*)`는 `Bash(ls *)`와 같은 명령어를 매칭합니다.

권한 대화상자는 명령어 접두사에 대해 "예, 다시 묻지 않기"를 선택하면 `:*` 형식을 기록합니다. 이 형식은 패턴 끝에서만 인식됩니다. `Bash(git:* push)`와 같은 패턴에서 콜론은 리터럴 문자로 취급되며 git 명령어와 매칭되지 않습니다.

## 도구별 권한 규칙

### Bash

Bash 권한 규칙은 `*`를 사용한 와일드카드 매칭을 지원합니다. 와일드카드는 시작, 중간, 끝을 포함하여 명령어의 어느 위치에나 나타날 수 있습니다:

* `Bash(npm run build)`는 정확히 `npm run build` Bash 명령어를 매칭합니다
* `Bash(npm run test *)`는 `npm run test`로 시작하는 Bash 명령어를 매칭합니다
* `Bash(npm *)`는 `npm `으로 시작하는 모든 명령어를 매칭합니다
* `Bash(* install)`은 ` install`로 끝나는 모든 명령어를 매칭합니다
* `Bash(git * main)`은 `git checkout main`, `git log --oneline main`과 같은 명령어를 매칭합니다

단일 `*`는 공백을 포함한 모든 문자 시퀀스를 매칭하므로 하나의 와일드카드가 여러 인수에 걸칠 수 있습니다. `Bash(git:*)`는 `git log --oneline --all`과 매칭되고, `Bash(git * main)`은 `git push origin main`과 `git merge main`을 모두 매칭합니다.

`*`가 앞에 공백이 있는 끝에 나타나면(`Bash(ls *)`처럼), 단어 경계를 강제하여 접두사 뒤에 공백이나 문자열 끝이 필요합니다. 예를 들어, `Bash(ls *)`는 `ls -la`와 매칭되지만 `lsof`와는 매칭되지 않습니다. 반면 공백 없는 `Bash(ls*)`는 단어 경계 제약이 없으므로 `ls -la`와 `lsof` 모두 매칭됩니다.

#### 복합 명령어

::: tip
Claude Code는 셸 연산자를 인식하므로, `Bash(safe-cmd *)`와 같은 규칙은 `safe-cmd && other-cmd` 명령어 실행 권한을 부여하지 않습니다. 인식되는 명령어 구분자는 `&&`, `||`, `;`, `|`, `|&`, `&`, 줄바꿈입니다. 규칙은 각 하위 명령어를 독립적으로 매칭해야 합니다.
:::

"예, 다시 묻지 않기"로 복합 명령어를 승인하면 Claude Code는 전체 복합 문자열에 대한 단일 규칙 대신 승인이 필요한 각 하위 명령어에 대해 별도의 규칙을 저장합니다. 예를 들어, `git status && npm test`를 승인하면 `npm test`에 대한 규칙이 저장되므로 `&&` 앞에 무엇이 오든 관계없이 향후 `npm test` 호출이 인식됩니다. 하위 디렉토리로의 `cd`와 같은 하위 명령어는 해당 경로에 대한 자체 Read 규칙을 생성합니다. 단일 복합 명령어에 대해 최대 5개의 규칙이 저장될 수 있습니다.

#### 프로세스 래퍼

Bash 규칙 매칭 전에 Claude Code는 고정된 프로세스 래퍼 집합을 제거하므로 `Bash(npm test *)`와 같은 규칙이 `timeout 30 npm test`와도 매칭됩니다. 인식되는 래퍼는 `timeout`, `time`, `nice`, `nohup`, `stdbuf`입니다.

단독 `xargs`도 제거되므로 `Bash(grep *)`는 `xargs grep pattern`과 매칭됩니다. 제거는 `xargs`에 플래그가 없을 때만 적용됩니다: `xargs -n1 grep pattern`과 같은 호출은 `xargs` 명령어로 매칭되므로 내부 명령어에 대한 규칙으로는 처리되지 않습니다.

이 래퍼 목록은 내장되어 있으며 설정할 수 없습니다. `direnv exec`, `devbox run`, `mise exec`, `npx`, `docker exec`와 같은 개발 환경 실행기는 목록에 없습니다. 이러한 도구는 인수를 명령어로 실행하므로 `Bash(devbox run *)`과 같은 규칙은 `devbox run rm -rf .`를 포함하여 `run` 뒤에 오는 모든 것과 매칭됩니다. 환경 실행기 내부에서 작업을 승인하려면 실행기와 내부 명령어를 모두 포함하는 특정 규칙을 작성하세요. 예: `Bash(devbox run npm test)`. 허용하려는 내부 명령어당 하나의 규칙을 추가하세요.

::: warning
명령어 인수를 제한하려는 Bash 권한 패턴은 취약합니다. 예를 들어, `Bash(curl http://github.com/ *)`는 curl을 GitHub URL로 제한하려 하지만 다음과 같은 변형은 매칭하지 못합니다:

* URL 앞 옵션: `curl -X GET http://github.com/...`
* 다른 프로토콜: `curl https://github.com/...`
* 리다이렉트: `curl -L http://bit.ly/xyz` (github으로 리다이렉트)
* 변수: `URL=http://github.com && curl $URL`
* 추가 공백: `curl  http://github.com`

더 안정적인 URL 필터링을 위해 다음을 고려하세요:

* **Bash 네트워크 도구 제한**: deny 규칙으로 `curl`, `wget` 및 유사 명령어를 차단한 다음, 허용된 도메인에 대해 `WebFetch(domain:github.com)` 권한과 함께 WebFetch 도구를 사용
* **PreToolUse 훅 사용**: Bash 명령어에서 URL을 검증하고 허용되지 않은 도메인을 차단하는 훅 구현
* CLAUDE.md를 통해 허용된 curl 패턴에 대해 Claude Code에 지시

WebFetch만 사용해도 네트워크 접근을 방지하지 못합니다. Bash가 허용되면 Claude는 여전히 `curl`, `wget` 또는 다른 도구를 사용하여 모든 URL에 접근할 수 있습니다.
:::

### Read와 Edit

`Edit` 규칙은 파일을 편집하는 모든 내장 도구에 적용됩니다. Claude는 Grep, Glob과 같은 파일을 읽는 모든 내장 도구에 `Read` 규칙을 적용하기 위해 최선을 다합니다.

::: warning
Read와 Edit deny 규칙은 Claude의 내장 파일 도구에 적용되며, Bash 하위 프로세스에는 적용되지 않습니다. `Read(./.env)` deny 규칙은 Read 도구를 차단하지만 Bash에서 `cat .env`는 차단하지 않습니다. 모든 프로세스의 경로 접근을 차단하는 OS 수준 시행을 위해서는 [샌드박스를 활성화](/sandboxing)하세요.
:::

Read와 Edit 규칙은 모두 네 가지 패턴 유형을 갖는 [gitignore](https://git-scm.com/docs/gitignore) 사양을 따릅니다:

| 패턴               | 의미                             | 예시                             | 매칭                           |
| ------------------ | -------------------------------- | -------------------------------- | ------------------------------ |
| `//path`           | 파일시스템 루트부터의 **절대** 경로 | `Read(//Users/alice/secrets/**)` | `/Users/alice/secrets/**`      |
| `~/path`           | **홈** 디렉토리부터의 경로       | `Read(~/Documents/*.pdf)`        | `/Users/alice/Documents/*.pdf` |
| `/path`            | **프로젝트 루트 상대** 경로      | `Edit(/src/**/*.ts)`             | `<project root>/src/**/*.ts`   |
| `path` 또는 `./path` | **현재 디렉토리 상대** 경로    | `Read(*.env)`                    | `<cwd>/*.env`                  |

::: warning
`/Users/alice/file`과 같은 패턴은 절대 경로가 아닙니다. 프로젝트 루트에 대한 상대 경로입니다. 절대 경로에는 `//Users/alice/file`을 사용하세요.
:::

Windows에서는 매칭 전에 경로가 POSIX 형식으로 정규화됩니다. `C:\Users\alice`는 `/c/Users/alice`가 되므로 해당 드라이브의 어디서든 `.env` 파일을 매칭하려면 `//c/**/.env`를 사용하세요. 모든 드라이브에서 매칭하려면 `//**/.env`를 사용하세요.

예시:

* `Edit(/docs/**)`: `<project>/docs/`의 편집 (`/docs/`나 `<project>/.claude/docs/`가 아님)
* `Read(~/.zshrc)`: 홈 디렉토리의 `.zshrc` 읽기
* `Edit(//tmp/scratch.txt)`: 절대 경로 `/tmp/scratch.txt` 편집
* `Read(src/**)`: `<current-directory>/src/`에서 읽기

::: info
gitignore 패턴에서 `*`는 단일 디렉토리 내의 파일을 매칭하고 `**`는 디렉토리를 재귀적으로 매칭합니다. 모든 파일 접근을 허용하려면 괄호 없이 도구 이름만 사용하세요: `Read`, `Edit` 또는 `Write`.
:::

### WebFetch

* `WebFetch(domain:example.com)`은 example.com에 대한 가져오기 요청을 매칭합니다

### MCP

* `mcp__puppeteer`는 `puppeteer` 서버가 제공하는 모든 도구를 매칭합니다 (Claude Code에서 설정된 이름)
* `mcp__puppeteer__*`는 `puppeteer` 서버의 모든 도구를 매칭하는 와일드카드 구문입니다
* `mcp__puppeteer__puppeteer_navigate`는 `puppeteer` 서버가 제공하는 `puppeteer_navigate` 도구를 매칭합니다

### Agent (서브에이전트)

`Agent(AgentName)` 규칙을 사용하여 Claude가 사용할 수 있는 [서브에이전트](/sub-agents)를 제어합니다:

* `Agent(Explore)`는 Explore 서브에이전트를 매칭합니다
* `Agent(Plan)`은 Plan 서브에이전트를 매칭합니다
* `Agent(my-custom-agent)`는 `my-custom-agent`라는 사용자 정의 서브에이전트를 매칭합니다

이러한 규칙을 설정의 `deny` 배열에 추가하거나 `--disallowedTools` CLI 플래그를 사용하여 특정 에이전트를 비활성화합니다. Explore 에이전트를 비활성화하려면:

```json
{
  "permissions": {
    "deny": ["Agent(Explore)"]
  }
}
```

## 훅으로 권한 확장

[Claude Code 훅](/hooks-guide)은 런타임에 권한 평가를 수행하기 위해 사용자 정의 셸 명령어를 등록하는 방법을 제공합니다. Claude Code가 도구를 호출하면 PreToolUse 훅이 권한 프롬프트 전에 실행됩니다. 훅 출력은 도구 호출을 거부하거나, 프롬프트를 강제하거나, 프롬프트를 건너뛰어 호출을 진행할 수 있습니다.

훅 결정은 권한 규칙을 우회하지 않습니다. Deny와 ask 규칙은 PreToolUse 훅이 반환하는 것과 관계없이 평가되므로, 매칭되는 deny 규칙은 호출을 차단하고 매칭되는 ask 규칙은 훅이 `"allow"` 또는 `"ask"`를 반환해도 여전히 프롬프트를 표시합니다. 이는 관리형 설정의 deny 규칙을 포함하여 [권한 관리](#권한-관리)에서 설명한 deny 우선 순위를 보존합니다.

차단 훅도 allow 규칙보다 우선합니다. 종료 코드 2로 종료되는 훅은 권한 규칙이 평가되기 전에 도구 호출을 중단하므로, allow 규칙이 호출을 허용하더라도 차단이 적용됩니다. 차단하려는 몇 가지를 제외하고 모든 Bash 명령어를 프롬프트 없이 실행하려면 allow 목록에 `"Bash"`를 추가하고 해당 특정 명령어를 거부하는 PreToolUse 훅을 등록하세요. 적용할 수 있는 훅 스크립트는 [보호된 파일 편집 차단](/hooks-guide#block-edits-to-protected-files)을 참조하세요.

## 작업 디렉토리

기본적으로 Claude는 실행된 디렉토리의 파일에 접근할 수 있습니다. 이 접근을 확장할 수 있습니다:

* **시작 시**: `--add-dir <path>` CLI 인수 사용
* **세션 중**: `/add-dir` 명령어 사용
* **영구 설정**: [설정 파일](/settings#settings-files)의 `additionalDirectories`에 추가

추가 디렉토리의 파일은 원래 작업 디렉토리와 동일한 권한 규칙을 따릅니다: 프롬프트 없이 읽을 수 있게 되며, 파일 편집 권한은 현재 권한 모드를 따릅니다.

### 추가 디렉토리는 파일 접근을 부여하며 설정은 아닙니다

디렉토리를 추가하면 Claude가 파일을 읽고 편집할 수 있는 범위가 확장됩니다. 해당 디렉토리를 전체 설정 루트로 만들지는 않습니다: 대부분의 `.claude/` 설정은 추가 디렉토리에서 검색되지 않지만, 예외적으로 일부 유형이 로드됩니다.

다음 설정 유형은 `--add-dir` 디렉토리에서 로드됩니다:

| 설정                                                              | `--add-dir`에서 로드                                                                                                                               |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/`의 [스킬](/skills)                               | 예, 라이브 리로드 포함                                                                                                                             |
| `.claude/settings.json`의 플러그인 설정                           | `enabledPlugins`와 `extraKnownMarketplaces`만                                                                                                      |
| [CLAUDE.md](/memory) 파일, `.claude/rules/`, `CLAUDE.local.md`    | `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`이 설정된 경우에만. `CLAUDE.local.md`는 기본으로 활성화된 `local` 설정 소스도 추가로 필요합니다      |

서브에이전트, 명령어, 출력 스타일, 훅 및 기타 설정을 포함한 그 외 모든 것은 현재 작업 디렉토리와 상위 디렉토리, `~/.claude/`의 사용자 디렉토리, 관리형 설정에서만 검색됩니다. 프로젝트 간에 해당 설정을 공유하려면 다음 방법 중 하나를 사용하세요:

* **사용자 수준 설정**: `~/.claude/agents/`, `~/.claude/output-styles/` 또는 `~/.claude/settings.json`에 파일을 배치하여 모든 프로젝트에서 사용 가능하게 합니다
* **플러그인**: 팀이 설치할 수 있는 [플러그인](/plugins)으로 설정을 패키지화하고 배포합니다
* **설정 디렉토리에서 실행**: 원하는 `.claude/` 설정이 포함된 디렉토리에서 Claude Code를 실행합니다

## 권한과 샌드박싱의 상호작용

권한과 [샌드박싱](/sandboxing)은 상호 보완적인 보안 계층입니다:

* **권한**은 Claude Code가 사용할 수 있는 도구와 접근할 수 있는 파일 또는 도메인을 제어합니다. 모든 도구(Bash, Read, Edit, WebFetch, MCP 등)에 적용됩니다.
* **샌드박싱**은 Bash 도구의 파일시스템 및 네트워크 접근을 제한하는 OS 수준 시행을 제공합니다. Bash 명령어와 하위 프로세스에만 적용됩니다.

심층 방어를 위해 둘 다 사용하세요:

* 권한 deny 규칙은 Claude가 제한된 리소스에 접근을 시도하는 것조차 차단합니다
* 샌드박스 제한은 프롬프트 인젝션이 Claude의 의사 결정을 우회하더라도 Bash 명령어가 정의된 경계 외부의 리소스에 도달하는 것을 방지합니다
* 샌드박스의 파일시스템 제한은 별도의 샌드박스 설정이 아닌 Read와 Edit deny 규칙을 사용합니다
* 네트워크 제한은 WebFetch 권한 규칙과 샌드박스의 `allowedDomains` 목록을 결합합니다

기본값인 `autoAllowBashIfSandboxed: true`로 샌드박싱이 활성화되면, 권한에 `ask: Bash(*)`가 포함되어 있어도 샌드박스된 Bash 명령어는 프롬프트 없이 실행됩니다. 샌드박스 경계가 명령어별 프롬프트를 대체합니다. 이 동작을 변경하려면 [샌드박스 모드](/sandboxing#sandbox-modes)를 참조하세요.

## 관리형 설정

Claude Code 설정에 대한 중앙 집중식 제어가 필요한 조직의 경우, 관리자는 사용자 또는 프로젝트 설정으로 재정의할 수 없는 관리형 설정을 배포할 수 있습니다. 이러한 정책 설정은 일반 설정 파일과 동일한 형식을 따르며 MDM/OS 수준 정책, 관리형 설정 파일, [서버 관리형 설정](/server-managed-settings)을 통해 전달할 수 있습니다. 전달 메커니즘과 파일 위치는 [설정 파일](/settings#settings-files)을 참조하세요.

### 관리형 전용 설정

다음 설정은 관리형 설정에서만 읽힙니다. 사용자 또는 프로젝트 설정 파일에 배치해도 효과가 없습니다.

| 설정                                           | 설명                                                                                                                                                                                                          |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `allowedChannelPlugins`                         | 메시지를 푸시할 수 있는 채널 플러그인의 허용 목록. 설정 시 기본 Anthropic 허용 목록을 대체합니다. `channelsEnabled: true`가 필요합니다. [채널 플러그인 실행 제한](/channels#restrict-which-channel-plugins-can-run) 참조 |
| `allowManagedHooksOnly`                         | `true`이면 관리형 훅, SDK 훅, 관리형 설정 `enabledPlugins`에서 강제 활성화된 플러그인의 훅만 로드됩니다. 사용자, 프로젝트, 기타 모든 플러그인 훅이 차단됩니다                                                  |
| `allowManagedMcpServersOnly`                    | `true`이면 관리형 설정의 `allowedMcpServers`만 적용됩니다. `deniedMcpServers`는 여전히 모든 소스에서 병합됩니다. [관리형 MCP 설정](/mcp#managed-mcp-configuration) 참조                                         |
| `allowManagedPermissionRulesOnly`               | `true`이면 사용자 및 프로젝트 설정에서 `allow`, `ask`, `deny` 권한 규칙 정의를 방지합니다. 관리형 설정의 규칙만 적용됩니다                                                                                    |
| `blockedMarketplaces`                           | 마켓플레이스 소스 차단 목록. 차단된 소스는 다운로드 전에 확인되므로 파일시스템에 접촉하지 않습니다. [관리형 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions) 참조                        |
| `channelsEnabled`                               | Team 및 Enterprise 사용자를 위한 [채널](/channels) 허용. 미설정 또는 `false`이면 사용자가 `--channels`에 전달하는 것과 관계없이 채널 메시지 전달을 차단합니다                                                   |
| `forceRemoteSettingsRefresh`                    | `true`이면 원격 관리형 설정이 새로 가져올 때까지 CLI 시작을 차단하고 가져오기 실패 시 종료합니다. [실패 시 차단 시행](/server-managed-settings#enforce-fail-closed-startup) 참조                                 |
| `pluginTrustMessage`                            | 설치 전에 표시되는 플러그인 신뢰 경고에 추가되는 사용자 정의 메시지                                                                                                                                           |
| `sandbox.filesystem.allowManagedReadPathsOnly`  | `true`이면 관리형 설정의 `filesystem.allowRead` 경로만 적용됩니다. `denyRead`는 여전히 모든 소스에서 병합됩니다                                                                                                |
| `sandbox.network.allowManagedDomainsOnly`       | `true`이면 관리형 설정의 `allowedDomains`와 `WebFetch(domain:...)` allow 규칙만 적용됩니다. 허용되지 않은 도메인은 사용자에게 프롬프트 없이 자동으로 차단됩니다. 거부된 도메인은 여전히 모든 소스에서 병합됩니다 |
| `strictKnownMarketplaces`                       | 사용자가 추가할 수 있는 플러그인 마켓플레이스를 제어합니다. [관리형 마켓플레이스 제한](/plugin-marketplaces#managed-marketplace-restrictions) 참조                                                              |

`disableBypassPermissionsMode`는 일반적으로 조직 정책을 시행하기 위해 관리형 설정에 배치하지만 어떤 범위에서든 작동합니다. 사용자가 자신의 설정에서 이를 설정하여 스스로 bypass 모드를 잠글 수 있습니다.

::: info
[Remote Control](/remote-control)과 [웹 세션](/claude-code-on-the-web)에 대한 접근은 관리형 설정 키로 제어되지 않습니다. Team 및 Enterprise 플랜에서 관리자는 [Claude Code 관리 설정](https://claude.ai/admin-settings/claude-code)에서 이러한 기능을 활성화하거나 비활성화합니다.
:::

## auto 모드 거부 검토

[auto 모드](/permission-modes#eliminate-prompts-with-auto-mode)가 도구 호출을 거부하면 알림이 표시되고 거부된 작업이 `/permissions`의 최근 거부 탭에 기록됩니다. 거부된 작업에서 `r`을 눌러 재시도 표시를 하세요: 대화상자를 종료하면 Claude Code가 모델에 해당 도구 호출을 재시도할 수 있다는 메시지를 보내고 대화를 재개합니다.

거부에 프로그래밍 방식으로 대응하려면 [`PermissionDenied` 훅](/hooks#permissiondenied)을 사용하세요.

## auto 모드 분류기 설정

[auto 모드](/permission-modes#eliminate-prompts-with-auto-mode)는 분류기 모델을 사용하여 각 작업을 프롬프트 없이 실행해도 안전한지 결정합니다. 기본적으로 작업 디렉토리와 현재 저장소의 리모트만 신뢰합니다. 회사의 소스 컨트롤 조직에 푸시하거나 팀 클라우드 버킷에 쓰기와 같은 작업은 잠재적 데이터 유출로 차단됩니다. `autoMode` 설정 블록을 사용하여 조직이 신뢰하는 인프라를 분류기에 알릴 수 있습니다.

분류기는 사용자 설정, `.claude/settings.local.json`, 관리형 설정에서 `autoMode`를 읽습니다. 체크인된 저장소가 자체 allow 규칙을 주입할 수 있기 때문에 `.claude/settings.json`의 공유 프로젝트 설정에서는 읽지 않습니다.

| 범위                 | 파일                          | 용도                                         |
| :------------------- | :---------------------------- | :------------------------------------------- |
| 개인 개발자          | `~/.claude/settings.json`     | 개인 신뢰 인프라                             |
| 한 프로젝트, 한 개발자 | `.claude/settings.local.json` | 프로젝트별 신뢰 버킷 또는 서비스, gitignored |
| 조직 전체            | 관리형 설정                   | 모든 개발자에게 적용되는 신뢰 인프라         |

각 범위의 항목이 결합됩니다. 개발자는 개인 항목으로 `environment`, `allow`, `soft_deny`를 확장할 수 있지만 관리형 설정이 제공하는 항목은 제거할 수 없습니다. allow 규칙은 분류기 내부에서 차단 규칙의 예외로 작용하므로, 개발자가 추가한 `allow` 항목이 조직의 `soft_deny` 항목을 재정의할 수 있습니다: 조합은 가산적이지 엄격한 정책 경계가 아닙니다. 개발자가 우회할 수 없는 규칙이 필요하면 분류기 전에 작업을 차단하는 관리형 설정의 `permissions.deny`를 사용하세요.

### 신뢰할 수 있는 인프라 정의

대부분의 조직에서는 `autoMode.environment`만 설정하면 됩니다. 이는 내장 차단 및 허용 규칙을 건드리지 않고 신뢰할 수 있는 저장소, 버킷, 도메인을 분류기에 알려줍니다. 분류기는 `environment`를 사용하여 "외부"가 무엇인지 결정합니다: 나열되지 않은 대상은 잠재적 유출 대상입니다.

```json
{
  "autoMode": {
    "environment": [
      "Source control: github.example.com/acme-corp and all repos under it",
      "Trusted cloud buckets: s3://acme-build-artifacts, gs://acme-ml-datasets",
      "Trusted internal domains: *.corp.example.com, api.internal.example.com",
      "Key internal services: Jenkins at ci.example.com, Artifactory at artifacts.example.com"
    ]
  }
}
```

항목은 정규식이나 도구 패턴이 아닌 산문입니다. 분류기는 이를 자연어 규칙으로 읽습니다. 새 엔지니어에게 인프라를 설명하는 것처럼 작성하세요. 철저한 environment 섹션은 다음을 포함합니다:

* **조직**: 회사 이름과 Claude Code의 주요 용도(소프트웨어 개발, 인프라 자동화, 데이터 엔지니어링 등)
* **소스 컨트롤**: 개발자가 푸시하는 모든 GitHub, GitLab, Bitbucket 조직
* **클라우드 제공자 및 신뢰할 수 있는 버킷**: Claude가 읽고 쓸 수 있어야 하는 버킷 이름 또는 접두사
* **신뢰할 수 있는 내부 도메인**: `*.internal.example.com`과 같은 API, 대시보드, 서비스의 호스트명
* **주요 내부 서비스**: CI, 아티팩트 레지스트리, 내부 패키지 인덱스, 인시던트 도구
* **추가 컨텍스트**: 분류기가 위험으로 취급해야 하는 것에 영향을 미치는 규제 산업 제약, 멀티 테넌트 인프라, 컴플라이언스 요구사항

유용한 시작 템플릿: 괄호 안의 필드를 채우고 적용되지 않는 줄을 제거하세요:

```json
{
  "autoMode": {
    "environment": [
      "Organization: {COMPANY_NAME}. Primary use: {PRIMARY_USE_CASE, e.g. software development, infrastructure automation}",
      "Source control: {SOURCE_CONTROL, e.g. GitHub org github.example.com/acme-corp}",
      "Cloud provider(s): {CLOUD_PROVIDERS, e.g. AWS, GCP, Azure}",
      "Trusted cloud buckets: {TRUSTED_BUCKETS, e.g. s3://acme-builds, gs://acme-datasets}",
      "Trusted internal domains: {TRUSTED_DOMAINS, e.g. *.internal.example.com, api.example.com}",
      "Key internal services: {SERVICES, e.g. Jenkins at ci.example.com, Artifactory at artifacts.example.com}",
      "Additional context: {EXTRA, e.g. regulated industry, multi-tenant infrastructure, compliance requirements}"
    ]
  }
}
```

제공하는 구체적 컨텍스트가 많을수록 분류기가 일상적인 내부 작업과 유출 시도를 더 잘 구별할 수 있습니다.

한 번에 모든 것을 채울 필요는 없습니다. 합리적인 배포: 기본값으로 시작하고 소스 컨트롤 조직과 주요 내부 서비스를 추가하면 자체 저장소에 푸시하는 것과 같은 가장 일반적인 오탐을 해결합니다. 다음으로 신뢰할 수 있는 도메인과 클라우드 버킷을 추가하세요. 차단이 발생하면 나머지를 채우세요.

### 차단 및 허용 규칙 재정의

두 가지 추가 필드를 사용하여 분류기의 내장 규칙 목록을 대체할 수 있습니다: `autoMode.soft_deny`는 차단 대상을 제어하고, `autoMode.allow`는 적용할 예외를 제어합니다. 각각은 자연어 규칙으로 읽히는 산문 설명의 배열입니다.

분류기 내부에서 우선순위는 다음과 같습니다: `soft_deny` 규칙이 먼저 차단하고, `allow` 규칙이 예외로 재정의하며, 명시적 사용자 의도가 둘 다 재정의합니다. 사용자의 메시지가 Claude가 수행하려는 정확한 작업을 직접적이고 구체적으로 설명하면 `soft_deny` 규칙이 매칭되어도 분류기가 허용합니다. 일반적인 요청은 해당되지 않습니다: Claude에게 "저장소를 정리해"라고 요청해도 force-push가 승인되지 않지만, "이 브랜치를 force-push해"라고 요청하면 승인됩니다.

느슨하게 하려면: 기본값이 파이프라인이 이미 PR 리뷰, CI, 스테이징 환경으로 보호하는 항목을 차단하는 경우 `soft_deny`에서 규칙을 제거하거나, 기본 예외가 다루지 않는 일상적인 패턴을 분류기가 반복적으로 표시하는 경우 `allow`에 추가하세요. 엄격하게 하려면: 기본값이 놓치는 환경 특정 위험에 대해 `soft_deny`에 추가하거나, 차단 규칙에 대한 기본 예외를 유지하기 위해 `allow`에서 제거하세요. 모든 경우에 `claude auto-mode defaults`를 실행하여 전체 기본 목록을 가져온 다음 복사하고 편집하세요: 빈 목록에서 시작하지 마세요.

```json
{
  "autoMode": {
    "environment": [
      "Source control: github.example.com/acme-corp and all repos under it"
    ],
    "allow": [
      "Deploying to the staging namespace is allowed: staging is isolated from production and resets nightly",
      "Writing to s3://acme-scratch/ is allowed: ephemeral bucket with a 7-day lifecycle policy"
    ],
    "soft_deny": [
      "Never run database migrations outside the migrations CLI, even against dev databases",
      "Never modify files under infra/terraform/prod/: production infrastructure changes go through the review workflow",
      "...copy full default soft_deny list here first, then add your rules..."
    ]
  }
}
```

::: danger
`allow` 또는 `soft_deny`를 설정하면 해당 섹션의 전체 기본 목록이 대체됩니다. 단일 항목으로 `soft_deny`를 설정하면 모든 내장 차단 규칙이 삭제됩니다: force push, 데이터 유출, `curl | bash`, 프로덕션 배포 및 기타 모든 기본 차단 규칙이 허용됩니다. 안전하게 맞춤 설정하려면 `claude auto-mode defaults`를 실행하여 내장 규칙을 출력하고 설정 파일에 복사한 다음 자체 파이프라인과 위험 허용 범위에 대해 각 규칙을 검토하세요. 인프라가 이미 완화하는 위험에 대한 규칙만 제거하세요.
:::

세 섹션은 독립적으로 평가되므로 `environment`만 설정하면 기본 `allow` 및 `soft_deny` 목록은 그대로 유지됩니다.

### 기본값과 유효 설정 검사

`allow` 또는 `soft_deny`를 설정하면 기본값이 대체되므로, 전체 기본 목록을 복사하여 맞춤 설정을 시작하세요. 세 가지 CLI 하위 명령어를 사용하여 검사하고 검증할 수 있습니다:

```bash
claude auto-mode defaults  # 내장 environment, allow, soft_deny 규칙
claude auto-mode config    # 분류기가 실제로 사용하는 것: 설정이 있으면 해당 설정, 그렇지 않으면 기본값
claude auto-mode critique  # 사용자 정의 allow 및 soft_deny 규칙에 대한 AI 피드백
```

`claude auto-mode defaults`의 출력을 파일에 저장하고, 정책에 맞게 목록을 편집한 다음 설정 파일에 붙여넣으세요. 저장 후 `claude auto-mode config`를 실행하여 유효 규칙이 예상대로인지 확인하세요. 사용자 정의 규칙을 작성한 경우 `claude auto-mode critique`가 모호하거나, 중복되거나, 오탐을 유발할 가능성이 있는 항목을 검토하고 표시합니다.

## 설정 우선순위

권한 규칙은 다른 모든 Claude Code 설정과 동일한 [설정 우선순위](/settings#settings-precedence)를 따릅니다:

1. **관리형 설정**: 명령줄 인수를 포함한 다른 어떤 수준에서도 재정의할 수 없습니다
2. **명령줄 인수**: 임시 세션 재정의
3. **로컬 프로젝트 설정** (`.claude/settings.local.json`)
4. **공유 프로젝트 설정** (`.claude/settings.json`)
5. **사용자 설정** (`~/.claude/settings.json`)

도구가 어떤 수준에서든 거부되면 다른 수준에서 허용할 수 없습니다. 예를 들어, 관리형 설정의 deny는 `--allowedTools`로 재정의할 수 없으며, `--disallowedTools`는 관리형 설정이 정의하는 것 이상의 제한을 추가할 수 있습니다.

사용자 설정에서 허용된 권한이 프로젝트 설정에서 거부되면 프로젝트 설정이 우선하여 권한이 차단됩니다.

## 예시 설정

이 [저장소](https://github.com/anthropics/claude-code/tree/main/examples/settings)에는 일반적인 배포 시나리오를 위한 시작 설정 구성이 포함되어 있습니다. 이를 시작점으로 사용하고 필요에 맞게 조정하세요.

## 참고 자료

* [설정](/settings): 권한 설정 테이블을 포함한 전체 설정 참조
* [샌드박싱](/sandboxing): Bash 명령어를 위한 OS 수준 파일시스템 및 네트워크 격리
* [인증](/authentication): Claude Code에 대한 사용자 접근 설정
* [보안](/security): 보안 보호 장치 및 모범 사례
* [훅](/hooks-guide): 워크플로 자동화 및 권한 평가 확장
