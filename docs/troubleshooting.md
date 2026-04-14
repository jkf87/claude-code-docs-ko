---
title: 문제 해결
description: Claude Code 설치 및 사용 중 발생하는 일반적인 문제의 해결 방법을 확인하세요.
---

# 문제 해결

Claude Code 설치 및 사용 중 발생하는 일반적인 문제의 해결 방법을 확인하세요.

## 설치 문제 해결

:::tip
터미널 사용을 피하고 싶다면, [Claude Code 데스크톱 앱](/desktop-quickstart)을 통해 그래픽 인터페이스로 Claude Code를 설치하고 사용할 수 있습니다. [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs) 또는 [Windows](https://claude.com/download?utm_source=claude_code&utm_medium=docs)용으로 다운로드하면 커맨드라인 설정 없이 바로 코딩을 시작할 수 있습니다.
:::

표시되는 오류 메시지나 증상을 찾아보세요:

| 표시되는 내용                                                              | 해결 방법                                                                                                                       |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `command not found: claude` 또는 `'claude' is not recognized`              | [PATH 수정하기](#설치-후-command-not-found-claude)                                                                              |
| `syntax error near unexpected token '<'`                                   | [설치 스크립트가 HTML을 반환하는 경우](#설치-스크립트가-셸-스크립트-대신-html을-반환하는-경우)                                  |
| `curl: (56) Failure writing output to destination`                         | [스크립트를 먼저 다운로드한 후 실행하기](#curl-56-failure-writing-output-to-destination)                                        |
| Linux에서 설치 중 `Killed`                                                 | [메모리가 부족한 서버에 swap 공간 추가하기](#메모리가-부족한-linux-서버에서-설치-중단)                                          |
| `TLS connect error` 또는 `SSL/TLS secure channel`                          | [CA 인증서 업데이트하기](#tls-또는-ssl-연결-오류)                                                                              |
| `Failed to fetch version` 또는 다운로드 서버에 접근 불가                   | [네트워크 및 프록시 설정 확인하기](#네트워크-연결-확인)                                                                        |
| `irm is not recognized` 또는 `&& is not valid`                             | [사용하는 셸에 맞는 명령어 사용하기](#windows-잘못된-설치-명령어)                                                              |
| `'bash' is not recognized as the name of a cmdlet`                         | [Windows 설치 명령어 사용하기](#windows-잘못된-설치-명령어)                                                                    |
| `Claude Code on Windows requires git-bash`                                 | [Git Bash 설치 또는 구성하기](#windows-claude-code-on-windows-requires-git-bash)                                                |
| `Claude Code does not support 32-bit Windows`                              | [x86 항목이 아닌 Windows PowerShell 열기](#windows-claude-code-does-not-support-32-bit-windows)                                 |
| `Error loading shared library`                                             | [시스템에 맞지 않는 바이너리 변형](#linux-잘못된-바이너리-변형-설치-muslglibc-불일치)                                           |
| Linux에서 `Illegal instruction`                                            | [아키텍처 불일치](#linux에서-illegal-instruction)                                                                               |
| macOS에서 `dyld: cannot load`, `dyld: Symbol not found`, 또는 `Abort trap` | [바이너리 비호환성](#macos에서-dyld-cannot-load)                                                                                |
| `Invoke-Expression: Missing argument in parameter list`                    | [설치 스크립트가 HTML을 반환하는 경우](#설치-스크립트가-셸-스크립트-대신-html을-반환하는-경우)                                  |
| `App unavailable in region`                                                | Claude Code가 해당 국가에서 사용 불가합니다. [지원 국가](https://www.anthropic.com/supported-countries)를 확인하세요.          |
| `unable to get local issuer certificate`                                   | [기업 CA 인증서 구성하기](#tls-또는-ssl-연결-오류)                                                                             |
| `OAuth error` 또는 `403 Forbidden`                                         | [인증 문제 해결하기](#인증-문제)                                                                                                |

문제가 목록에 없으면 아래 진단 단계를 따라 진행하세요.

## 설치 문제 디버그

### 네트워크 연결 확인

설치 프로그램은 `storage.googleapis.com`에서 다운로드합니다. 접근 가능한지 확인하세요:

```bash
curl -sI https://storage.googleapis.com
```

이 명령이 실패하면 네트워크가 연결을 차단하고 있을 수 있습니다. 일반적인 원인:

* 기업 방화벽 또는 프록시가 Google Cloud Storage를 차단
* 지역 네트워크 제한: VPN 또는 다른 네트워크를 시도하세요
* TLS/SSL 문제: 시스템의 CA 인증서를 업데이트하거나, `HTTPS_PROXY`가 설정되어 있는지 확인하세요

기업 프록시를 사용하는 경우, 설치 전에 `HTTPS_PROXY`와 `HTTP_PROXY`를 프록시 주소로 설정하세요. 프록시 URL을 모른다면 IT 팀에 문의하거나 브라우저의 프록시 설정을 확인하세요.

다음 예시는 두 프록시 변수를 설정한 후 프록시를 통해 설치 프로그램을 실행합니다:

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
curl -fsSL https://claude.ai/install.sh | bash
```

### PATH 확인

설치가 완료됐지만 `claude` 실행 시 `command not found` 또는 `not recognized` 오류가 발생한다면, 설치 디렉터리가 PATH에 없는 것입니다. 셸은 PATH에 나열된 디렉터리에서 프로그램을 검색하며, 설치 프로그램은 macOS/Linux에서는 `~/.local/bin/claude`에, Windows에서는 `%USERPROFILE%\.local\bin\claude.exe`에 `claude`를 설치합니다.

PATH 항목을 나열하고 `local/bin`을 필터링하여 설치 디렉터리가 PATH에 있는지 확인하세요:

::: code-group

```bash [macOS/Linux]
echo $PATH | tr ':' '\n' | grep local/bin
```

출력이 없으면 해당 디렉터리가 없는 것입니다. 셸 구성에 추가하세요:

```bash [macOS/Linux (설정 추가)]
# Zsh (macOS 기본값)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Bash (Linux 기본값)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

또는 터미널을 닫았다가 다시 여세요.

수정이 적용됐는지 확인:

```bash [macOS/Linux (확인)]
claude --version
```

```powershell [Windows PowerShell]
$env:PATH -split ';' | Select-String 'local\\bin'
```

출력이 없으면 User PATH에 설치 디렉터리를 추가하세요:

```powershell [Windows PowerShell (설정 추가)]
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
```

변경 사항을 적용하려면 터미널을 재시작하세요.

수정이 적용됐는지 확인:

```powershell [Windows PowerShell (확인)]
claude --version
```

```batch [Windows CMD]
echo %PATH% | findstr /i "local\bin"
```

출력이 없으면 시스템 설정에서 환경 변수로 이동하여 User PATH 변수에 `%USERPROFILE%\.local\bin`을 추가하세요. 터미널을 재시작하세요.

수정이 적용됐는지 확인:

```batch [Windows CMD (확인)]
claude --version
```

:::

### 충돌하는 설치 확인

여러 Claude Code 설치가 있으면 버전 불일치나 예상치 못한 동작이 발생할 수 있습니다. 설치된 항목을 확인하세요:

::: code-group

```bash [macOS/Linux]
# PATH에서 찾은 모든 claude 바이너리 나열
which -a claude

# 네이티브 설치 프로그램과 npm 버전이 있는지 확인
ls -la ~/.local/bin/claude
ls -la ~/.claude/local/
npm -g ls @anthropic-ai/claude-code 2>/dev/null
```

```powershell [Windows PowerShell]
where.exe claude
Test-Path "$env:LOCALAPPDATA\Claude Code\claude.exe"
```

:::

여러 설치가 발견되면 하나만 유지하세요. `~/.local/bin/claude`의 네이티브 설치가 권장됩니다. 추가 설치는 제거하세요:

npm 전역 설치 제거:

```bash
npm uninstall -g @anthropic-ai/claude-code
```

macOS에서 Homebrew 설치 제거 (해당 cask를 설치한 경우 `claude-code@latest` 사용):

```bash
brew uninstall --cask claude-code
```

### 디렉터리 권한 확인

설치 프로그램은 `~/.local/bin/`과 `~/.claude/`에 대한 쓰기 권한이 필요합니다. 권한 오류로 설치가 실패하면 이 디렉터리들이 쓰기 가능한지 확인하세요:

```bash
test -w ~/.local/bin && echo "writable" || echo "not writable"
test -w ~/.claude && echo "writable" || echo "not writable"
```

디렉터리 중 하나라도 쓰기 불가능하면 설치 디렉터리를 생성하고 현재 사용자를 소유자로 설정하세요:

```bash
sudo mkdir -p ~/.local/bin
sudo chown -R $(whoami) ~/.local
```

### 바이너리 작동 확인

`claude`가 설치됐지만 시작 시 충돌하거나 중단되는 경우, 다음 확인 사항을 통해 원인을 파악하세요.

바이너리가 존재하고 실행 가능한지 확인:

```bash
ls -la $(which claude)
```

Linux에서는 누락된 공유 라이브러리를 확인하세요. `ldd`에서 누락된 라이브러리가 표시되면 시스템 패키지를 설치해야 할 수 있습니다. Alpine Linux 및 기타 musl 기반 배포판에서는 [Alpine Linux 설정](/setup#alpine-linux-and-musl-based-distributions)을 참조하세요.

```bash
ldd $(which claude) | grep "not found"
```

바이너리가 실행 가능한지 빠른 확인:

```bash
claude --version
```

## 일반적인 설치 문제

가장 자주 발생하는 설치 문제와 해결 방법입니다.

### 설치 스크립트가 셸 스크립트 대신 HTML을 반환하는 경우

설치 명령을 실행할 때 다음 오류 중 하나가 표시될 수 있습니다:

```text
bash: line 1: syntax error near unexpected token `<'
bash: line 1: `<!DOCTYPE html>'
```

PowerShell에서는 동일한 문제가 다음과 같이 나타납니다:

```text
Invoke-Expression: Missing argument in parameter list.
```

이는 설치 URL이 설치 스크립트 대신 HTML 페이지를 반환했다는 의미입니다. HTML 페이지에 "App unavailable in region"이라고 표시되면 Claude Code가 해당 국가에서 사용 불가합니다. [지원 국가](https://www.anthropic.com/supported-countries)를 확인하세요.

그 외의 경우, 네트워크 문제, 지역 라우팅 또는 일시적인 서비스 중단으로 인해 발생할 수 있습니다.

**해결 방법:**

1. **대체 설치 방법 사용**:

   macOS 또는 Linux에서는 Homebrew를 통해 설치:

   ```bash
   brew install --cask claude-code
   ```

   Windows에서는 WinGet을 통해 설치:

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

2. **몇 분 후 재시도**: 문제가 일시적인 경우가 많습니다. 잠시 기다린 후 원래 명령을 다시 시도하세요.

### 설치 후 `command not found: claude`

설치가 완료됐지만 `claude`가 작동하지 않습니다. 정확한 오류는 플랫폼에 따라 다릅니다:

| 플랫폼      | 오류 메시지                                                            |
| :---------- | :--------------------------------------------------------------------- |
| macOS       | `zsh: command not found: claude`                                       |
| Linux       | `bash: claude: command not found`                                      |
| Windows CMD | `'claude' is not recognized as an internal or external command`        |
| PowerShell  | `claude : The term 'claude' is not recognized as the name of a cmdlet` |

이는 설치 디렉터리가 셸의 검색 경로에 없다는 것을 의미합니다. 각 플랫폼별 해결 방법은 [PATH 확인](#path-확인)을 참조하세요.

### `curl: (56) Failure writing output to destination`

`curl ... | bash` 명령은 스크립트를 다운로드하면서 파이프(`|`)를 통해 Bash로 직접 전달하여 실행합니다. 이 오류는 스크립트 다운로드가 완료되기 전에 연결이 끊어졌다는 의미입니다. 일반적인 원인으로는 네트워크 중단, 다운로드 차단, 시스템 리소스 제한 등이 있습니다.

**해결 방법:**

1. **네트워크 안정성 확인**: Claude Code 바이너리는 Google Cloud Storage에 호스팅되어 있습니다. 접근 가능한지 테스트하세요:
   ```bash
   curl -fsSL https://storage.googleapis.com -o /dev/null
   ```
   명령이 조용히 완료되면 연결은 정상이며 문제가 일시적일 가능성이 높습니다. 설치 명령을 재시도하세요. 오류가 표시되면 네트워크가 다운로드를 차단하고 있을 수 있습니다.

2. **대체 설치 방법 사용**:

   macOS 또는 Linux에서:

   ```bash
   brew install --cask claude-code
   ```

   Windows에서:

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

### TLS 또는 SSL 연결 오류

`curl: (35) TLS connect error`, `schannel: next InitializeSecurityContext failed`, 또는 PowerShell의 `Could not establish trust relationship for the SSL/TLS secure channel` 같은 오류는 TLS 핸드셰이크 실패를 나타냅니다.

**해결 방법:**

1. **시스템 CA 인증서 업데이트**:

   Ubuntu/Debian에서:

   ```bash
   sudo apt-get update && sudo apt-get install ca-certificates
   ```

   Homebrew를 통한 macOS에서:

   ```bash
   brew install ca-certificates
   ```

2. **Windows에서 TLS 1.2 활성화**: 설치 프로그램을 실행하기 전에 PowerShell에서:
   ```powershell
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   irm https://claude.ai/install.ps1 | iex
   ```

3. **프록시 또는 방화벽 간섭 확인**: TLS 검사를 수행하는 기업 프록시는 `unable to get local issuer certificate`를 포함한 이러한 오류를 일으킬 수 있습니다. `NODE_EXTRA_CA_CERTS`를 기업 CA 인증서 번들로 설정하세요:
   ```bash
   export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
   ```
   인증서 파일이 없으면 IT 팀에 문의하세요. 직접 연결로 시도하여 프록시가 원인인지 확인할 수도 있습니다.

4. **Windows에서 인증서 해지 확인 우회**: `CRYPT_E_NO_REVOCATION_CHECK (0x80092012)` 또는 `CRYPT_E_REVOCATION_OFFLINE (0x80092013)`이 표시되면, 서버에는 도달했지만 네트워크가 인증서 해지 조회를 차단하는 것입니다. 기업 방화벽 뒤에서 흔히 발생합니다. 설치 명령에 `--ssl-revoke-best-effort`를 추가하세요:
   ```bat
   curl --ssl-revoke-best-effort -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
   ```
   또는 curl을 완전히 우회하는 `winget install Anthropic.ClaudeCode`로 설치하세요.

### `Failed to fetch version from storage.googleapis.com`

설치 프로그램이 다운로드 서버에 접근하지 못했습니다. 일반적으로 네트워크에서 `storage.googleapis.com`이 차단된 경우입니다.

**해결 방법:**

1. **직접 연결 테스트**:
   ```bash
   curl -sI https://storage.googleapis.com
   ```

2. **프록시 뒤에 있는 경우**, 설치 프로그램이 라우팅할 수 있도록 `HTTPS_PROXY`를 설정하세요. 자세한 내용은 [프록시 구성](/network-config#proxy-configuration)을 참조하세요.
   ```bash
   export HTTPS_PROXY=http://proxy.example.com:8080
   curl -fsSL https://claude.ai/install.sh | bash
   ```

3. **제한된 네트워크에 있는 경우**, 다른 네트워크나 VPN을 시도하거나 대체 설치 방법을 사용하세요:

   macOS 또는 Linux에서:

   ```bash
   brew install --cask claude-code
   ```

   Windows에서:

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

### Windows: 잘못된 설치 명령어

`'irm' is not recognized`, `The token '&&' is not valid`, 또는 `'bash' is not recognized as the name of a cmdlet`이 표시되면, 다른 셸이나 운영 체제용 설치 명령을 복사한 것입니다.

* **`irm`을 인식하지 못하는 경우**: PowerShell이 아닌 CMD에 있습니다. 두 가지 옵션이 있습니다:

  시작 메뉴에서 "PowerShell"을 검색하여 PowerShell을 열고 원래 설치 명령을 실행하세요:

  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

  또는 CMD에 머물면서 CMD 설치 프로그램을 사용하세요:

  ```batch
  curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
  ```

* **`&&`가 유효하지 않은 경우**: PowerShell에 있지만 CMD 설치 명령을 실행했습니다. PowerShell 설치 프로그램을 사용하세요:
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

* **`bash`를 인식하지 못하는 경우**: Windows에서 macOS/Linux 설치 프로그램을 실행했습니다. PowerShell 설치 프로그램을 사용하세요:
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

### 메모리가 부족한 Linux 서버에서 설치 중단

VPS 또는 클라우드 인스턴스에서 설치 중 `Killed`가 표시되는 경우:

```text
Setting up Claude Code...
Installing Claude Code native build latest...
bash: line 142: 34803 Killed    "$binary_path" install ${TARGET:+"$TARGET"}
```

Linux OOM 킬러가 메모리 부족으로 프로세스를 종료했습니다. Claude Code는 최소 4GB의 가용 RAM이 필요합니다.

**해결 방법:**

1. **swap 공간 추가**: 서버 RAM이 제한된 경우, swap을 사용하면 디스크 공간을 추가 메모리로 활용하여 물리적 RAM이 부족해도 설치를 완료할 수 있습니다.

   2GB swap 파일을 생성하고 활성화:

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

   그런 다음 설치를 재시도:

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

2. **다른 프로세스 종료**: 설치 전에 메모리를 해제하세요.

3. **더 큰 인스턴스 사용**: 가능하면 Claude Code는 최소 4GB RAM이 필요합니다.

### Docker에서 설치가 중단되는 경우

Docker 컨테이너에서 Claude Code를 설치할 때, root로 `/`에 설치하면 중단이 발생할 수 있습니다.

**해결 방법:**

1. **설치 프로그램 실행 전 작업 디렉터리 설정**: `/`에서 실행하면 설치 프로그램이 전체 파일시스템을 스캔하여 과도한 메모리 사용이 발생합니다. `WORKDIR`을 설정하면 스캔 범위가 작은 디렉터리로 제한됩니다:
   ```dockerfile
   WORKDIR /tmp
   RUN curl -fsSL https://claude.ai/install.sh | bash
   ```

2. **Docker Desktop 사용 시 Docker 메모리 제한 증가**:
   ```bash
   docker build --memory=4g .
   ```

### Windows: Claude Desktop이 `claude` CLI 명령을 재정의하는 경우

이전 버전의 Claude Desktop을 설치했다면, `WindowsApps` 디렉터리에 `Claude.exe`가 등록되어 Claude Code CLI보다 PATH 우선순위를 가질 수 있습니다. `claude` 실행 시 CLI 대신 데스크톱 앱이 열립니다.

이 문제를 해결하려면 Claude Desktop을 최신 버전으로 업데이트하세요.

### Windows: Claude Code on Windows requires git-bash

Windows 네이티브 환경에서 Claude Code를 사용하려면 Git Bash가 포함된 [Git for Windows](https://git-scm.com/downloads/win)가 필요합니다.

**Git이 설치되지 않은 경우**: [git-scm.com/downloads/win](https://git-scm.com/downloads/win)에서 다운로드하여 설치하세요. 설치 중에 "Add to PATH"를 선택하세요. 설치 후 터미널을 재시작하세요.

**Git이 이미 설치됐지만** Claude Code가 여전히 찾지 못하는 경우, [settings.json 파일](/settings)에서 경로를 설정하세요:

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

Git이 다른 위치에 설치된 경우, PowerShell에서 `where.exe git`을 실행하여 경로를 확인하고 해당 디렉터리의 `bin\bash.exe` 경로를 사용하세요.

### Windows: Claude Code does not support 32-bit Windows

Windows 시작 메뉴에는 두 개의 PowerShell 항목이 있습니다: `Windows PowerShell`과 `Windows PowerShell (x86)`. x86 항목은 64비트 컴퓨터에서도 32비트 프로세스로 실행되어 이 오류를 발생시킵니다. 어느 경우인지 확인하려면, 오류가 발생한 창에서 다음을 실행하세요:

```powershell
[Environment]::Is64BitOperatingSystem
```

`True`가 출력되면 운영 체제에는 문제가 없습니다. 창을 닫고 x86 접미사 없이 `Windows PowerShell`을 열어 설치 명령을 다시 실행하세요.

`False`가 출력되면 32비트 Windows에 있는 것입니다. Claude Code는 64비트 운영 체제가 필요합니다. [시스템 요구 사항](/setup#system-requirements)을 참조하세요.

### Linux: 잘못된 바이너리 변형 설치 (musl/glibc 불일치)

설치 후 `libstdc++.so.6` 또는 `libgcc_s.so.1` 같은 누락된 공유 라이브러리 오류가 표시되면, 설치 프로그램이 시스템에 맞지 않는 바이너리 변형을 다운로드했을 수 있습니다.

```text
Error loading shared library libstdc++.so.6: No such file or directory
```

이는 musl 크로스 컴파일 패키지가 설치된 glibc 기반 시스템에서 발생할 수 있으며, 설치 프로그램이 시스템을 musl로 잘못 감지합니다.

**해결 방법:**

1. **시스템이 사용하는 libc 확인**:
   ```bash
   ldd /bin/ls | head -1
   ```
   `linux-vdso.so`나 `/lib/x86_64-linux-gnu/`에 대한 참조가 표시되면 glibc를 사용하는 것입니다. `musl`이 표시되면 musl을 사용하는 것입니다.

2. **glibc를 사용하지만 musl 바이너리를 받은 경우**, 설치를 제거하고 재설치하세요. `https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases/{VERSION}/manifest.json`의 GCS 버킷에서 올바른 바이너리를 수동으로 다운로드할 수도 있습니다. `ldd /bin/ls`와 `ls /lib/libc.musl*` 출력과 함께 [GitHub 이슈](https://github.com/anthropics/claude-code/issues)를 제출하세요.

3. **실제로 musl을 사용하는 경우** (Alpine Linux), 필요한 패키지를 설치하세요:
   ```bash
   apk add libgcc libstdc++ ripgrep
   ```

### Linux에서 `Illegal instruction`

설치 프로그램이 OOM `Killed` 메시지 대신 `Illegal instruction`을 출력하면, 다운로드한 바이너리가 CPU 아키텍처와 맞지 않는 것입니다. x86 바이너리를 받은 ARM 서버나 필요한 명령어 셋이 없는 오래된 CPU에서 흔히 발생합니다.

```text
bash: line 142: 2238232 Illegal instruction    "$binary_path" install ${TARGET:+"$TARGET"}
```

**해결 방법:**

1. **아키텍처 확인**:
   ```bash
   uname -m
   ```
   `x86_64`는 64비트 Intel/AMD, `aarch64`는 ARM64를 의미합니다. 바이너리가 일치하지 않으면 해당 출력과 함께 [GitHub 이슈를 제출](https://github.com/anthropics/claude-code/issues)하세요.

2. **아키텍처 문제가 해결되는 동안 대체 설치 방법 시도**:
   ```bash
   brew install --cask claude-code
   ```

### macOS에서 `dyld: cannot load`

설치 중 `dyld: cannot load`, `dyld: Symbol not found`, 또는 `Abort trap: 6`이 표시되면, 바이너리가 macOS 버전이나 하드웨어와 호환되지 않는 것입니다.

```text
dyld: cannot load 'claude-2.1.42-darwin-x64' (load command 0x80000034 is unknown)
Abort trap: 6
```

`libicucore`를 참조하는 `Symbol not found` 오류도 macOS 버전이 바이너리가 지원하는 버전보다 오래됐음을 나타냅니다:

```text
dyld: Symbol not found: _ubrk_clone
  Referenced from: claude-darwin-x64 (which was built for Mac OS X 13.0)
  Expected in: /usr/lib/libicucore.A.dylib
```

**해결 방법:**

1. **macOS 버전 확인**: Claude Code는 macOS 13.0 이상이 필요합니다. Apple 메뉴를 열고 "이 Mac에 관하여"를 선택하여 버전을 확인하세요.

2. **macOS 업데이트**: 오래된 버전을 사용하고 있다면 업데이트하세요. 바이너리는 이전 macOS 버전이 지원하지 않는 로드 명령을 사용합니다.

3. **Homebrew를 대체 설치 방법으로 시도**:
   ```bash
   brew install --cask claude-code
   ```

### Windows 설치 문제: WSL에서 발생하는 오류

WSL에서 다음과 같은 문제가 발생할 수 있습니다:

**OS/플랫폼 감지 문제**: 설치 중 오류가 발생하면, WSL이 Windows `npm`을 사용하고 있을 수 있습니다. 시도해 보세요:

* 설치 전에 `npm config set os linux` 실행
* `npm install -g @anthropic-ai/claude-code --force --no-os-check`로 설치. `sudo`는 사용하지 마세요.

**Node를 찾을 수 없는 오류**: `claude` 실행 시 `exec: node: not found`가 표시되면, WSL 환경이 Windows의 Node.js 설치를 사용하고 있을 수 있습니다. `which npm`과 `which node`로 확인할 수 있으며, `/mnt/c/` 대신 `/usr/`로 시작하는 Linux 경로를 가리켜야 합니다. 이를 해결하려면 Linux 배포판의 패키지 관리자나 [`nvm`](https://github.com/nvm-sh/nvm)을 통해 Node를 설치해 보세요.

**nvm 버전 충돌**: WSL과 Windows 모두에 nvm이 설치된 경우, WSL에서 Node 버전을 전환할 때 버전 충돌이 발생할 수 있습니다. WSL이 기본적으로 Windows PATH를 가져오기 때문에 Windows nvm/npm이 WSL 설치보다 우선순위를 갖게 됩니다.

다음으로 이 문제를 확인할 수 있습니다:

* `which npm`과 `which node` 실행 - Windows 경로(`/mnt/c/`로 시작)를 가리키면 Windows 버전이 사용되고 있는 것
* WSL에서 nvm으로 Node 버전 전환 후 기능이 중단되는 경우

이 문제를 해결하려면 Linux PATH를 수정하여 Linux node/npm 버전이 우선순위를 갖도록 하세요:

**기본 해결 방법: 셸에서 nvm이 올바르게 로드되었는지 확인**

가장 흔한 원인은 비인터랙티브 셸에서 nvm이 로드되지 않는 것입니다. 셸 구성 파일(`~/.bashrc`, `~/.zshrc` 등)에 다음을 추가하세요:

```bash
# nvm이 있으면 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

또는 현재 세션에서 직접 실행:

```bash
source ~/.nvm/nvm.sh
```

**대안: PATH 순서 조정**

nvm이 올바르게 로드됐지만 Windows 경로가 여전히 우선순위를 갖는 경우, 셸 구성에서 Linux 경로를 PATH 앞에 명시적으로 추가하세요:

```bash
export PATH="$HOME/.nvm/versions/node/$(node -v)/bin:$PATH"
```

:::warning
`appendWindowsPath = false`를 통해 Windows PATH 가져오기를 비활성화하면 WSL에서 Windows 실행 파일을 호출하는 기능이 중단됩니다. 마찬가지로 Windows 개발에 사용하는 경우 Windows에서 Node.js를 제거하지 마세요.
:::

### WSL2 샌드박스 설정

[샌드박싱](/sandboxing)은 WSL2에서 지원되지만 추가 패키지 설치가 필요합니다. `/sandbox` 실행 시 `bubblewrap` 또는 `socat`이 없다는 오류가 표시되면 의존성을 설치하세요:

::: code-group

```bash [Ubuntu/Debian]
sudo apt-get install bubblewrap socat
```

```bash [Fedora]
sudo dnf install bubblewrap socat
```

:::

WSL1은 샌드박싱을 지원하지 않습니다. "Sandboxing requires WSL2"가 표시되면 WSL2로 업그레이드하거나 샌드박싱 없이 Claude Code를 실행해야 합니다.

샌드박스 명령은 `cmd.exe`, `powershell.exe`, `/mnt/c/` 하위 실행 파일 같은 Windows 바이너리를 실행할 수 없습니다. WSL은 Unix 소켓을 통해 이를 Windows 호스트에 전달하는데 샌드박스가 이를 차단합니다. Windows 바이너리를 호출해야 하는 명령이 있다면 [`excludedCommands`](/settings#sandbox-settings)에 추가하여 샌드박스 외부에서 실행하세요.

### 설치 중 권한 오류

네이티브 설치 프로그램이 권한 오류로 실패하면 대상 디렉터리가 쓰기 불가능한 것입니다. [디렉터리 권한 확인](#디렉터리-권한-확인)을 참조하세요.

이전에 npm으로 설치하여 npm 관련 권한 오류가 발생하는 경우, 네이티브 설치 프로그램으로 전환하세요:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## 권한 및 인증

이 섹션은 로그인 실패, 토큰 문제, 권한 프롬프트 동작에 대해 다룹니다.

### 반복적인 권한 프롬프트

동일한 명령을 반복적으로 승인해야 하는 경우, `/permissions` 명령을 사용하여 특정 도구가 승인 없이 실행되도록 허용할 수 있습니다. [권한 문서](/permissions#manage-permissions)를 참조하세요.

### 인증 문제

인증 문제가 있는 경우:

1. `/logout`을 실행하여 완전히 로그아웃
2. Claude Code 종료
3. `claude`로 재시작하고 인증 프로세스를 다시 완료

로그인 중 브라우저가 자동으로 열리지 않으면 `c`를 눌러 OAuth URL을 클립보드에 복사한 후 브라우저에 직접 붙여넣으세요.

### OAuth 오류: Invalid code

`OAuth error: Invalid code. Please make sure the full code was copied`가 표시되면, 로그인 코드가 만료됐거나 복사-붙여넣기 중에 잘린 것입니다.

**해결 방법:**

* Enter를 눌러 재시도하고 브라우저가 열린 후 빠르게 로그인을 완료하세요
* 브라우저가 자동으로 열리지 않으면 `c`를 입력하여 전체 URL을 복사하세요
* 원격/SSH 세션을 사용하는 경우, 브라우저가 잘못된 기기에서 열릴 수 있습니다. 터미널에 표시된 URL을 복사하여 로컬 브라우저에서 여세요.

### 로그인 후 403 Forbidden

로그인 후 `API Error: 403 {"error":{"type":"forbidden","message":"Request not allowed"}}`가 표시되는 경우:

* **Claude Pro/Max 사용자**: [claude.ai/settings](https://claude.ai/settings)에서 구독이 활성 상태인지 확인하세요
* **Console 사용자**: 관리자가 계정에 "Claude Code" 또는 "Developer" 역할을 할당했는지 확인하세요
* **프록시 뒤에 있는 경우**: 기업 프록시가 API 요청을 방해할 수 있습니다. 프록시 설정은 [네트워크 구성](/network-config)을 참조하세요.

### 모델을 찾을 수 없거나 접근 불가

`There's an issue with the selected model (...). It may not exist or you may not have access to it`가 표시되면, API가 구성된 모델 이름을 거부한 것입니다.

일반적인 원인:

* `--model`에 전달된 모델 이름의 오타
* 설정에 저장된 오래되거나 지원 중단된 모델 ID
* 현재 사용 등급에서 해당 모델에 접근 권한이 없는 API 키

모델이 설정된 위치를 [우선순위 순서](/model-config#setting-your-model)로 확인하세요:

* `--model` 플래그
* `ANTHROPIC_MODEL` 환경 변수
* `.claude/settings.local.json`의 `model` 필드
* 프로젝트의 `.claude/settings.json`의 `model` 필드
* `~/.claude/settings.json`의 `model` 필드

오래된 값을 지우려면 설정에서 `model` 필드를 제거하거나 `ANTHROPIC_MODEL`을 해제하면 Claude Code가 계정의 기본 모델로 돌아갑니다.

계정에서 사용 가능한 모델을 탐색하려면 `claude`를 인터랙티브 모드로 시작하고 `/model`을 실행하여 선택기를 열어보세요. Vertex AI 배포에 대해서는 [Vertex AI 문제 해결 섹션](/google-vertex-ai#troubleshooting)을 참조하세요.

### 활성 구독으로 조직이 비활성화됨

활성 Claude 구독이 있음에도 `API Error: 400 ... "This organization has been disabled"`가 표시되면, `ANTHROPIC_API_KEY` 환경 변수가 구독을 재정의하고 있는 것입니다. 이전 고용주나 프로젝트의 오래된 API 키가 셸 프로파일에 아직 설정되어 있을 때 흔히 발생합니다.

`ANTHROPIC_API_KEY`가 있고 승인한 경우, Claude Code는 구독의 OAuth 자격 증명 대신 해당 키를 사용합니다. 비인터랙티브 모드(`-p`)에서는 키가 있으면 항상 사용됩니다. 전체 우선 순서는 [인증 우선순위](/authentication#authentication-precedence)를 참조하세요.

구독을 사용하려면 환경 변수를 해제하고 셸 프로파일에서 제거하세요:

```bash
unset ANTHROPIC_API_KEY
claude
```

`~/.zshrc`, `~/.bashrc`, 또는 `~/.profile`에서 `export ANTHROPIC_API_KEY=...` 줄을 찾아 제거하면 변경이 영구적으로 유지됩니다. Claude Code 내에서 `/status`를 실행하여 활성 인증 방법을 확인하세요.

### WSL2에서 OAuth 로그인 실패

WSL2에서 브라우저 기반 로그인은 WSL이 Windows 브라우저를 열지 못하는 경우 실패할 수 있습니다. `BROWSER` 환경 변수를 설정하세요:

```bash
export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
claude
```

또는 URL을 수동으로 복사하세요: 로그인 프롬프트가 표시되면 `c`를 눌러 OAuth URL을 복사한 후 Windows 브라우저에 붙여넣으세요.

### 로그인되지 않았거나 토큰 만료

Claude Code가 세션 후 다시 로그인하라고 요청하면, OAuth 토큰이 만료됐을 수 있습니다.

`/login`을 실행하여 재인증하세요. 이 상황이 자주 발생하면 시스템 시계가 정확한지 확인하세요. 토큰 유효성 검사는 올바른 타임스탬프에 의존합니다.

macOS에서는 키체인이 잠겨 있거나 비밀번호가 계정 비밀번호와 동기화되지 않은 경우에도 로그인이 실패할 수 있으며, 이 경우 Claude Code가 자격 증명을 저장하지 못합니다. `claude doctor`를 실행하여 키체인 접근을 확인하세요. 키체인을 수동으로 잠금 해제하려면 `security unlock-keychain ~/Library/Keychains/login.keychain-db`를 실행하세요. 잠금 해제가 도움이 되지 않으면 키체인 접근을 열고, `login` 키체인을 선택한 후 편집 > "login" 키체인 비밀번호 변경을 선택하여 계정 비밀번호와 재동기화하세요.

## 구성 파일 위치

Claude Code는 여러 위치에 구성을 저장합니다:

| 파일                          | 용도                                                                                                          |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `~/.claude/settings.json`     | 사용자 설정 (권한, 훅, 모델 재정의)                                                                           |
| `.claude/settings.json`       | 프로젝트 설정 (소스 컨트롤에 체크인)                                                                          |
| `.claude/settings.local.json` | 로컬 프로젝트 설정 (커밋하지 않음)                                                                            |
| `~/.claude.json`              | 전역 상태 (테마, OAuth, MCP 서버)                                                                             |
| `.mcp.json`                   | 프로젝트 MCP 서버 (소스 컨트롤에 체크인)                                                                      |
| `managed-mcp.json`            | [관리형 MCP 서버](/mcp#managed-mcp-configuration)                                                            |
| 관리형 설정                   | [관리형 설정](/settings#settings-files) (서버 관리, MDM/OS 수준 정책, 또는 파일 기반)                        |

Windows에서 `~`는 `C:\Users\YourName`과 같은 사용자 홈 디렉터리를 의미합니다.

이 파일 구성에 대한 자세한 내용은 [설정](/settings)과 [MCP](/mcp)를 참조하세요.

### 구성 초기화

Claude Code를 기본 설정으로 초기화하려면 구성 파일을 제거하면 됩니다:

```bash
# 모든 사용자 설정 및 상태 초기화
rm ~/.claude.json
rm -rf ~/.claude/

# 프로젝트 특정 설정 초기화
rm -rf .claude/
rm .mcp.json
```

:::warning
이 작업은 모든 설정, MCP 서버 구성 및 세션 기록을 제거합니다.
:::

## 성능 및 안정성

이 섹션은 리소스 사용량, 반응성 및 검색 동작과 관련된 문제를 다룹니다.

### 높은 CPU 또는 메모리 사용량

Claude Code는 대부분의 개발 환경에서 작동하도록 설계됐지만, 대형 코드베이스를 처리할 때 상당한 리소스를 소비할 수 있습니다. 성능 문제가 있는 경우:

1. 컨텍스트 크기를 줄이기 위해 정기적으로 `/compact` 사용
2. 주요 작업 사이에 Claude Code 닫기 및 재시작
3. 큰 빌드 디렉터리를 `.gitignore` 파일에 추가하는 것을 고려

### 스래싱 오류로 자동 압축 중단

`Autocompact is thrashing: the context refilled to the limit...`가 표시되면, 자동 압축은 성공했지만 파일이나 도구 출력이 연속으로 여러 번 컨텍스트 창을 즉시 채운 것입니다. Claude Code는 진행이 없는 루프에서 API 호출을 낭비하지 않으려고 재시도를 중단합니다.

복구하려면:

1. Claude에게 전체 파일 대신 특정 줄 범위나 함수처럼 더 작은 청크로 큰 파일을 읽도록 요청
2. 큰 출력을 제거하는 포커스로 `/compact` 실행, 예: `/compact keep only the plan and the diff`
3. 큰 파일 작업을 별도의 컨텍스트 창에서 실행되는 [서브에이전트](/sub-agents)로 이동
4. 이전 대화가 더 이상 필요하지 않으면 `/clear` 실행

### 명령 중단 또는 정지

Claude Code가 응답하지 않는 것 같으면:

1. Ctrl+C를 눌러 현재 작업 취소 시도
2. 응답이 없으면 터미널을 닫고 재시작해야 할 수 있음

## 검색 및 탐색 문제

Search 도구, `@file` 멘션, 커스텀 에이전트 및 커스텀 스킬이 작동하지 않으면 시스템 `ripgrep`을 설치하세요:

```bash
# macOS (Homebrew)
brew install ripgrep

# Windows (winget)
winget install BurntSushi.ripgrep.MSVC

# Ubuntu/Debian
sudo apt install ripgrep

# Alpine Linux
apk add ripgrep

# Arch Linux
pacman -S ripgrep
```

그런 다음 [환경](/env-vars)에서 `USE_BUILTIN_RIPGREP=0`을 설정하세요.

### WSL에서 느리거나 불완전한 검색 결과

[WSL에서 파일 시스템 간 작업 시](https://learn.microsoft.com/en-us/windows/wsl/filesystems) 디스크 읽기 성능 저하로 인해 WSL에서 Claude Code를 사용할 때 예상보다 적은 일치 항목이 반환될 수 있습니다. 검색은 여전히 작동하지만 네이티브 파일 시스템보다 적은 결과를 반환합니다.

:::info
이 경우 `/doctor`는 Search를 OK로 표시합니다.
:::

**해결 방법:**

1. **더 구체적인 검색 제출**: 디렉터리 또는 파일 유형을 지정하여 검색 파일 수를 줄이세요: "auth-service 패키지의 JWT 유효성 검사 로직 검색" 또는 "JS 파일에서 md5 해시 사용 찾기".

2. **프로젝트를 Linux 파일 시스템으로 이동**: 가능하면 프로젝트가 Windows 파일 시스템(`/mnt/c/`) 대신 Linux 파일 시스템(`/home/`)에 있도록 하세요.

3. **네이티브 Windows 사용**: 더 나은 파일 시스템 성능을 위해 WSL 대신 Windows에서 직접 Claude Code를 실행하는 것을 고려하세요.

## IDE 통합 문제

Claude Code가 IDE에 연결되지 않거나 IDE 터미널 내에서 예상치 못하게 동작하면 아래 해결 방법을 시도하세요.

### WSL2에서 JetBrains IDE가 감지되지 않는 경우

WSL2에서 JetBrains IDE를 사용하는 Claude Code에서 "No available IDEs detected" 오류가 발생하면, WSL2 네트워킹 구성 또는 Windows 방화벽이 연결을 차단하기 때문일 가능성이 높습니다.

#### WSL2 네트워킹 모드

WSL2는 기본적으로 NAT 네트워킹을 사용하며, 이로 인해 IDE 감지가 방해받을 수 있습니다. 두 가지 옵션이 있습니다:

**옵션 1: Windows 방화벽 구성** (권장)

1. WSL2 IP 주소 확인:
   ```bash
   wsl hostname -I
   # 예시 출력: 172.21.123.45
   ```

2. 관리자 권한으로 PowerShell을 열고 방화벽 규칙 생성:
   ```powershell
   New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" -Direction Inbound -Protocol TCP -Action Allow -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
   ```
   1단계의 WSL2 서브넷에 따라 IP 범위를 조정하세요.

3. IDE와 Claude Code 모두 재시작

**옵션 2: 미러링 네트워킹으로 전환**

Windows 사용자 디렉터리의 `.wslconfig`에 추가:

```ini
[wsl2]
networkingMode=mirrored
```

그런 다음 PowerShell에서 `wsl --shutdown`으로 WSL을 재시작하세요.

:::info
이 네트워킹 문제는 WSL2에만 영향을 미칩니다. WSL1은 호스트의 네트워크를 직접 사용하므로 이러한 구성이 필요하지 않습니다.
:::

추가 JetBrains 구성 팁은 [JetBrains IDE 가이드](/jetbrains#plugin-settings)를 참조하세요.

### Windows IDE 통합 문제 보고

Windows에서 IDE 통합 문제가 있는 경우, 다음 정보와 함께 [이슈를 생성](https://github.com/anthropics/claude-code/issues)하세요:

* 환경 유형: 네이티브 Windows (Git Bash) 또는 WSL1/WSL2
* WSL 네트워킹 모드 (해당하는 경우): NAT 또는 mirrored
* IDE 이름 및 버전
* Claude Code 확장/플러그인 버전
* 셸 유형: Bash, Zsh, PowerShell 등

### JetBrains IDE 터미널에서 Esc 키가 작동하지 않는 경우

JetBrains 터미널에서 Claude Code를 사용할 때 `Esc` 키가 예상대로 에이전트를 중단하지 않는다면, JetBrains 기본 단축키와의 키 바인딩 충돌 때문일 가능성이 높습니다.

이 문제를 해결하려면:

1. 설정 → 도구 → 터미널로 이동
2. 다음 중 하나를 선택:
   * "Escape로 편집기로 포커스 이동" 체크 해제, 또는
   * "터미널 키 바인딩 구성"을 클릭하고 "편집기로 포커스 전환" 단축키 삭제
3. 변경 사항 적용

이렇게 하면 `Esc` 키가 Claude Code 작업을 올바르게 중단할 수 있습니다.

## 마크다운 서식 문제

Claude Code는 코드 펜스에 언어 태그가 없는 마크다운 파일을 생성하는 경우가 있어 GitHub, 편집기, 문서 도구에서의 구문 강조와 가독성에 영향을 줄 수 있습니다.

### 코드 블록에서 언어 태그 누락

생성된 마크다운에서 다음과 같은 코드 블록이 발견되는 경우:

````markdown
```
function example() {
  return "hello";
}
```
````

올바르게 태그된 블록 대신:

````markdown
```javascript
function example() {
  return "hello";
}
```
````

**해결 방법:**

1. **Claude에게 언어 태그 추가 요청**: "이 마크다운 파일의 모든 코드 블록에 적절한 언어 태그를 추가해 주세요"라고 요청하세요.

2. **후처리 훅 사용**: 누락된 언어 태그를 감지하고 추가하는 자동 서식 훅을 설정하세요. 예시는 [편집 후 코드 자동 서식](/hooks-guide#auto-format-code-after-edits)의 PostToolUse 서식 훅을 참조하세요.

3. **수동 검증**: 마크다운 파일 생성 후 올바른 코드 블록 서식을 검토하고 필요하면 수정을 요청하세요.

### 일관성 없는 간격 및 서식

생성된 마크다운에 과도한 빈 줄이나 일관성 없는 간격이 있는 경우:

**해결 방법:**

1. **서식 수정 요청**: Claude에게 "이 마크다운 파일의 간격 및 서식 문제를 수정해 주세요"라고 요청하세요.

2. **서식 도구 사용**: 생성된 마크다운 파일에서 `prettier` 또는 커스텀 서식 스크립트 같은 마크다운 포매터를 실행하는 훅을 설정하세요.

3. **서식 기본 설정 지정**: 프롬프트나 프로젝트 [메모리](/memory) 파일에 서식 요구 사항을 포함하세요.

### 마크다운 서식 문제 최소화

서식 문제를 최소화하려면:

* **요청에서 명확하게 지정**: "언어 태그가 있는 코드 블록이 포함된 올바르게 서식된 마크다운"을 요청하세요
* **프로젝트 규칙 사용**: 선호하는 마크다운 스타일을 [`CLAUDE.md`](/memory)에 문서화하세요
* **유효성 검사 훅 설정**: 일반적인 서식 문제를 자동으로 확인하고 수정하는 후처리 훅을 사용하세요

## 추가 도움 받기

여기서 다루지 않는 문제가 발생하는 경우:

1. Claude Code 내에서 `/feedback` 명령을 사용하여 Anthropic에 직접 문제 보고
2. 알려진 문제는 [GitHub 저장소](https://github.com/anthropics/claude-code)에서 확인
3. `/doctor`를 실행하여 문제 진단. 다음을 확인합니다:
   * 설치 유형, 버전 및 검색 기능
   * 자동 업데이트 상태 및 사용 가능한 버전
   * 잘못된 설정 파일 (잘못된 JSON, 올바르지 않은 유형)
   * MCP 서버 구성 오류
   * 키 바인딩 구성 문제
   * 컨텍스트 사용 경고 (큰 CLAUDE.md 파일, 높은 MCP 토큰 사용량, 도달할 수 없는 권한 규칙)
   * 플러그인 및 에이전트 로딩 오류
4. Claude에게 기능과 특징에 대해 직접 물어보세요 - Claude는 문서에 대한 내장 접근 권한을 가지고 있습니다
