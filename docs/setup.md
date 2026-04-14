---
title: 고급 설정
description: Claude Code의 시스템 요구사항, 플랫폼별 설치, 버전 관리, 제거 방법을 설명합니다.
---

# 고급 설정

이 페이지에서는 시스템 요구사항, 플랫폼별 설치 세부 사항, 업데이트 및 제거 방법을 안내합니다. 첫 번째 세션을 단계별로 살펴보려면 [빠른 시작](/quickstart)을 참조하세요. 터미널을 처음 사용하는 경우 [터미널 가이드](/terminal-guide)를 참조하세요.

## 시스템 요구사항

Claude Code는 다음 플랫폼 및 구성에서 실행됩니다:

* **운영 체제**:
  * macOS 13.0+
  * Windows 10 1809+ 또는 Windows Server 2019+
  * Ubuntu 20.04+
  * Debian 10+
  * Alpine Linux 3.19+
* **하드웨어**: RAM 4 GB 이상, x64 또는 ARM64 프로세서
* **네트워크**: 인터넷 연결 필요. [네트워크 구성](/network-config#network-access-requirements)을 참조하세요.
* **셸**: Bash, Zsh, PowerShell 또는 CMD. 네이티브 Windows 설정에는 [Git for Windows](https://git-scm.com/downloads/win)가 필요합니다. WSL 설정에는 필요하지 않습니다.
* **위치**: [Anthropic 지원 국가](https://www.anthropic.com/supported-countries)

### 추가 의존성

* **ripgrep**: 일반적으로 Claude Code에 포함되어 있습니다. 검색이 실패하면 [검색 문제 해결](/troubleshooting#search-and-discovery-issues)을 참조하세요.

## Claude Code 설치

::: tip
그래픽 인터페이스를 선호하시나요? [데스크탑 앱](/desktop-quickstart)을 사용하면 터미널 없이 Claude Code를 사용할 수 있습니다. [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code\&utm_medium=docs) 또는 [Windows](https://claude.com/download?utm_source=claude_code\&utm_medium=docs)용으로 다운로드하세요.

터미널이 처음이신가요? 단계별 안내는 [터미널 가이드](/terminal-guide)를 참조하세요.
:::

Claude Code를 설치하려면 다음 방법 중 하나를 사용하세요:

::: tabs

== 네이티브 설치 (권장)

**macOS, Linux, WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

`The token '&&' is not a valid statement separator`라는 오류가 표시되면 CMD가 아닌 PowerShell에 있는 것입니다. 위의 PowerShell 명령을 대신 사용하세요. PowerShell에 있을 때는 프롬프트에 `PS C:\`가 표시됩니다.

**네이티브 Windows 설정에는 [Git for Windows](https://git-scm.com/downloads/win)가 필요합니다.** 없는 경우 먼저 설치하세요. WSL 설정에는 필요하지 않습니다.

::: info
네이티브 설치는 최신 버전을 유지하기 위해 백그라운드에서 자동으로 업데이트됩니다.
:::

== Homebrew

```bash
brew install --cask claude-code
```

Homebrew는 두 가지 cask를 제공합니다. `claude-code`는 안정 릴리스 채널을 추적하며, 일반적으로 약 1주일 뒤처져 있고 주요 회귀가 있는 릴리스를 건너뜁니다. `claude-code@latest`는 최신 채널을 추적하며 새 버전이 출시되는 즉시 받습니다.

::: info
Homebrew 설치는 자동 업데이트되지 않습니다. 설치한 cask에 따라 `brew upgrade claude-code` 또는 `brew upgrade claude-code@latest`를 실행하여 최신 기능과 보안 수정 사항을 받으세요.
:::

== WinGet

```powershell
winget install Anthropic.ClaudeCode
```

::: info
WinGet 설치는 자동 업데이트되지 않습니다. 최신 기능과 보안 수정 사항을 받으려면 주기적으로 `winget upgrade Anthropic.ClaudeCode`를 실행하세요.
:::

:::

설치가 완료되면 작업하려는 프로젝트에서 터미널을 열고 Claude Code를 시작하세요:

```bash
claude
```

설치 중 문제가 발생하면 [문제 해결 가이드](/troubleshooting)를 참조하세요.

### Windows에서 설정

Claude Code는 Windows에서 네이티브로 실행하거나 WSL 내부에서 실행할 수 있습니다. 프로젝트 위치와 필요한 기능에 따라 선택하세요:

| 옵션 | 필요사항 | [샌드박싱](/sandboxing) | 사용 시점 |
| --- | --- | --- | --- |
| 네이티브 Windows | [Git for Windows](https://git-scm.com/downloads/win) | 지원 안 됨 | Windows 네이티브 프로젝트 및 도구 |
| WSL 2 | WSL 2 활성화 | 지원됨 | Linux 툴체인 또는 샌드박스 명령 실행 |
| WSL 1 | WSL 1 활성화 | 지원 안 됨 | WSL 2를 사용할 수 없는 경우 |

**옵션 1: Git Bash를 사용한 네이티브 Windows**

[Git for Windows](https://git-scm.com/downloads/win)를 설치한 후 PowerShell 또는 CMD에서 설치 명령을 실행하세요. 관리자 권한으로 실행할 필요가 없습니다.

PowerShell 또는 CMD에서 설치하는 것은 어떤 설치 명령을 실행할지에만 영향을 줍니다. PowerShell에서는 프롬프트가 `PS C:\Users\YourName>`으로 표시되고, CMD에서는 `PS` 없이 `C:\Users\YourName>`으로 표시됩니다. 터미널이 처음이라면 [터미널 가이드](/terminal-guide#windows)에서 각 단계를 안내합니다.

설치 후 PowerShell, CMD 또는 Git Bash에서 `claude`를 실행하세요. Claude Code는 어디서 실행했든 상관없이 내부적으로 Git Bash를 사용하여 명령을 실행합니다. Claude Code가 Git Bash 설치 경로를 찾을 수 없는 경우 [settings.json 파일](/settings)에서 경로를 설정하세요:

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

Claude Code는 또한 옵트인 미리 보기로 Windows에서 PowerShell을 네이티브로 실행할 수 있습니다. 설정 및 제한 사항은 [PowerShell 도구](/tools-reference#powershell-tool)를 참조하세요.

**옵션 2: WSL**

WSL 배포판을 열고 위의 [설치 지침](#claude-code-설치)에서 Linux 설치 프로그램을 실행하세요. PowerShell 또는 CMD가 아닌 WSL 터미널 내부에서 `claude`를 설치하고 실행합니다.

### Alpine Linux 및 musl 기반 배포판

Alpine 및 기타 musl/uClibc 기반 배포판의 네이티브 설치 프로그램에는 `libgcc`, `libstdc++`, `ripgrep`이 필요합니다. 배포판의 패키지 관리자를 사용하여 설치한 다음 `USE_BUILTIN_RIPGREP=0`을 설정하세요.

다음 예시는 Alpine에서 필요한 패키지를 설치합니다:

```bash
apk add libgcc libstdc++ ripgrep
```

그런 다음 [`settings.json`](/settings#available-settings) 파일에서 `USE_BUILTIN_RIPGREP`을 `0`으로 설정하세요:

```json
{
  "env": {
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```

## 설치 확인

설치 후 Claude Code가 작동하는지 확인하세요:

```bash
claude --version
```

설치 및 구성에 대한 더 자세한 확인을 위해 [`claude doctor`](/troubleshooting#get-more-help)를 실행하세요:

```bash
claude doctor
```

## 인증

Claude Code를 사용하려면 Pro, Max, Team, Enterprise 또는 Console 계정이 필요합니다. 무료 Claude.ai 플랜은 Claude Code 접근을 포함하지 않습니다. [Amazon Bedrock](/amazon-bedrock), [Google Vertex AI](/google-vertex-ai) 또는 [Microsoft Foundry](/microsoft-foundry)와 같은 서드파티 API 제공자와 함께 Claude Code를 사용할 수도 있습니다.

설치 후 `claude`를 실행하고 브라우저 안내에 따라 로그인하세요. 모든 계정 유형 및 팀 설정 옵션은 [인증](/authentication)을 참조하세요.

## Claude Code 업데이트

네이티브 설치는 백그라운드에서 자동으로 업데이트됩니다. [릴리스 채널 구성](#릴리스-채널-구성)을 통해 업데이트를 즉시 받을지 지연된 안정 일정에 따라 받을지 제어하거나, [자동 업데이트를 완전히 비활성화](#자동-업데이트-비활성화)할 수 있습니다. Homebrew 및 WinGet 설치는 수동 업데이트가 필요합니다.

### 자동 업데이트

Claude Code는 시작 시와 실행 중 주기적으로 업데이트를 확인합니다. 업데이트는 백그라운드에서 다운로드 및 설치되며, 다음 번에 Claude Code를 시작할 때 적용됩니다.

::: note
Homebrew 및 WinGet 설치는 자동 업데이트되지 않습니다. Homebrew의 경우 설치한 cask에 따라 `brew upgrade claude-code` 또는 `brew upgrade claude-code@latest`를 실행하세요. WinGet의 경우 `winget upgrade Anthropic.ClaudeCode`를 실행하세요.

**알려진 문제:** 새 버전이 이러한 패키지 관리자에서 사용 가능하기 전에 Claude Code가 업데이트 알림을 표시할 수 있습니다. 업그레이드가 실패하면 잠시 기다렸다가 다시 시도하세요.

Homebrew는 업그레이드 후에도 이전 버전을 디스크에 보관합니다. 주기적으로 `brew cleanup`을 실행하여 디스크 공간을 확보하세요.
:::

### 릴리스 채널 구성

`autoUpdatesChannel` 설정을 사용하여 자동 업데이트와 `claude update`에 대해 Claude Code가 따르는 릴리스 채널을 제어하세요:

* `"latest"` (기본값): 새 기능이 출시되는 즉시 받기
* `"stable"`: 일반적으로 약 1주일 전 버전을 사용하며, 주요 회귀가 있는 릴리스를 건너뜀

`/config` → **Auto-update channel**을 통해 구성하거나 [settings.json 파일](/settings)에 추가하세요:

```json
{
  "autoUpdatesChannel": "stable"
}
```

엔터프라이즈 배포의 경우 [관리형 설정](/permissions#managed-settings)을 사용하여 조직 전체에 일관된 릴리스 채널을 강제할 수 있습니다.

Homebrew 설치는 이 설정 대신 cask 이름으로 채널을 선택합니다: `claude-code`는 stable을 추적하고 `claude-code@latest`는 latest를 추적합니다.

### 자동 업데이트 비활성화

[`settings.json`](/settings#available-settings) 파일의 `env` 키에서 `DISABLE_AUTOUPDATER`를 `"1"`로 설정하세요:

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

### 수동 업데이트

다음 백그라운드 확인을 기다리지 않고 즉시 업데이트를 적용하려면 다음을 실행하세요:

```bash
claude update
```

## 고급 설치 옵션

이 옵션들은 버전 고정, npm에서 마이그레이션, 바이너리 무결성 확인을 위한 것입니다.

### 특정 버전 설치

네이티브 설치 프로그램은 특정 버전 번호 또는 릴리스 채널(`latest` 또는 `stable`)을 허용합니다. 설치 시 선택하는 채널이 자동 업데이트의 기본값이 됩니다. 자세한 내용은 [릴리스 채널 구성](#릴리스-채널-구성)을 참조하세요.

최신 버전(기본값) 설치:

::: tabs

== macOS, Linux, WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

== Windows PowerShell

```powershell
irm https://claude.ai/install.ps1 | iex
```

== Windows CMD

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

:::

stable 버전 설치:

::: tabs

== macOS, Linux, WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash -s stable
```

== Windows PowerShell

```powershell
& ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable
```

== Windows CMD

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd stable && del install.cmd
```

:::

특정 버전 번호 설치:

::: tabs

== macOS, Linux, WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash -s 2.1.89
```

== Windows PowerShell

```powershell
& ([scriptblock]::Create((irm https://claude.ai/install.ps1))) 2.1.89
```

== Windows CMD

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd 2.1.89 && del install.cmd
```

:::

### 더 이상 사용되지 않는 npm 설치

npm 설치는 더 이상 사용되지 않습니다. 네이티브 설치 프로그램은 더 빠르고, 의존성이 필요 없으며, 백그라운드에서 자동 업데이트됩니다. 가능하면 [네이티브 설치](#claude-code-설치) 방법을 사용하세요.

#### npm에서 네이티브로 마이그레이션

이전에 npm으로 Claude Code를 설치한 경우 네이티브 설치 프로그램으로 전환하세요:

```bash
# 네이티브 바이너리 설치
curl -fsSL https://claude.ai/install.sh | bash

# 이전 npm 설치 제거
npm uninstall -g @anthropic-ai/claude-code
```

기존 npm 설치에서 `claude install`을 실행하여 네이티브 바이너리를 함께 설치한 다음 npm 버전을 제거할 수도 있습니다.

#### npm으로 설치

호환성 이유로 npm 설치가 필요한 경우 [Node.js 18+](https://nodejs.org/en/download)가 설치되어 있어야 합니다. 패키지를 전역으로 설치하세요:

```bash
npm install -g @anthropic-ai/claude-code
```

::: warning
`sudo npm install -g`는 권한 문제 및 보안 위험을 초래할 수 있으므로 사용하지 마세요. 권한 오류가 발생하면 [설치 중 권한 오류 해결](/troubleshooting#permission-errors-during-installation)을 참조하세요.
:::

### 바이너리 무결성 및 코드 서명

각 릴리스는 모든 플랫폼 바이너리에 대한 SHA256 체크섬이 포함된 `manifest.json`을 게시합니다. 매니페스트는 Anthropic GPG 키로 서명되어 있으므로 매니페스트의 서명을 확인하면 나열된 모든 바이너리를 간접적으로 확인할 수 있습니다.

#### 매니페스트 서명 확인

1-3단계에는 `gpg`와 `curl`이 있는 POSIX 셸이 필요합니다. Windows에서는 Git Bash 또는 WSL에서 실행하세요. 4단계에는 PowerShell 옵션이 포함됩니다.

**1단계: 공개 키 다운로드 및 가져오기**

릴리스 서명 키는 고정 URL에 게시됩니다.

```bash
curl -fsSL https://downloads.claude.ai/keys/claude-code.asc | gpg --import
```

가져온 키의 지문을 표시하세요.

```bash
gpg --fingerprint security@anthropic.com
```

출력에 다음 지문이 포함되어 있는지 확인하세요:

```text
31DD DE24 DDFA B679 F42D  7BD2 BAA9 29FF 1A7E CACE
```

**2단계: 매니페스트 및 서명 다운로드**

`VERSION`을 확인하려는 릴리스로 설정하세요.

```bash
REPO=https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases
VERSION=2.1.89
curl -fsSLO "$REPO/$VERSION/manifest.json"
curl -fsSLO "$REPO/$VERSION/manifest.json.sig"
```

**3단계: 서명 확인**

매니페스트에 대한 분리된 서명을 확인하세요.

```bash
gpg --verify manifest.json.sig manifest.json
```

유효한 결과는 `Good signature from "Anthropic Claude Code Release Signing <security@anthropic.com>"`를 보고합니다.

`gpg`는 새로 가져온 키에 대해 `WARNING: This key is not certified with a trusted signature!`도 출력합니다. 이는 정상적입니다. `Good signature` 줄은 암호화 확인이 통과되었음을 확인합니다. 1단계의 지문 비교는 키 자체가 진짜임을 확인합니다.

**4단계: 매니페스트와 바이너리 비교**

다운로드한 바이너리의 SHA256 체크섬을 `manifest.json`의 `platforms.<platform>.checksum`에 나열된 값과 비교하세요.

::: tabs

== Linux

```bash
sha256sum claude
```

== macOS

```bash
shasum -a 256 claude
```

== Windows PowerShell

```powershell
(Get-FileHash claude.exe -Algorithm SHA256).Hash.ToLower()
```

:::

::: note
매니페스트 서명은 `2.1.89` 이후 릴리스부터 사용 가능합니다. 이전 릴리스는 분리된 서명 없이 `manifest.json`에 체크섬을 게시합니다.
:::

#### 플랫폼 코드 서명

서명된 매니페스트 외에도 개별 바이너리는 지원되는 경우 플랫폼 네이티브 코드 서명을 가집니다.

* **macOS**: "Anthropic PBC"가 서명하고 Apple이 공증합니다. `codesign --verify --verbose ./claude`로 확인하세요.
* **Windows**: "Anthropic, PBC"가 서명합니다. `Get-AuthenticodeSignature .\claude.exe`로 확인하세요.
* **Linux**: 위의 매니페스트 서명을 사용하여 무결성을 확인하세요. Linux 바이너리는 개별적으로 코드 서명되지 않습니다.

## Claude Code 제거

Claude Code를 제거하려면 설치 방법에 맞는 지침을 따르세요.

### 네이티브 설치

Claude Code 바이너리 및 버전 파일을 제거하세요:

::: tabs

== macOS, Linux, WSL

```bash
rm -f ~/.local/bin/claude
rm -rf ~/.local/share/claude
```

== Windows PowerShell

```powershell
Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force
Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force
```

:::

### Homebrew 설치

설치한 Homebrew cask를 제거하세요. stable cask를 설치한 경우:

```bash
brew uninstall --cask claude-code
```

latest cask를 설치한 경우:

```bash
brew uninstall --cask claude-code@latest
```

### WinGet 설치

WinGet 패키지를 제거하세요:

```powershell
winget uninstall Anthropic.ClaudeCode
```

### npm

전역 npm 패키지를 제거하세요:

```bash
npm uninstall -g @anthropic-ai/claude-code
```

### 구성 파일 제거

::: warning
구성 파일을 제거하면 모든 설정, 허용된 도구, MCP 서버 구성 및 세션 기록이 삭제됩니다.
:::

Claude Code 설정 및 캐시된 데이터를 제거하려면:

::: tabs

== macOS, Linux, WSL

```bash
# 사용자 설정 및 상태 제거
rm -rf ~/.claude
rm ~/.claude.json

# 프로젝트별 설정 제거 (프로젝트 디렉토리에서 실행)
rm -rf .claude
rm -f .mcp.json
```

== Windows PowerShell

```powershell
# 사용자 설정 및 상태 제거
Remove-Item -Path "$env:USERPROFILE\.claude" -Recurse -Force
Remove-Item -Path "$env:USERPROFILE\.claude.json" -Force

# 프로젝트별 설정 제거 (프로젝트 디렉토리에서 실행)
Remove-Item -Path ".claude" -Recurse -Force
Remove-Item -Path ".mcp.json" -Force
```

:::
