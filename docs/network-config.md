# 엔터프라이즈 네트워크 구성

> 프록시 서버, 사용자 정의 인증 기관(CA), 상호 전송 계층 보안(mTLS) 인증을 사용하는 엔터프라이즈 환경에서 Claude Code를 구성합니다.

Claude Code는 환경 변수를 통해 다양한 엔터프라이즈 네트워크 및 보안 구성을 지원합니다. 여기에는 기업 프록시 서버를 통한 트래픽 라우팅, 사용자 정의 인증 기관(CA) 신뢰, 보안 강화를 위한 상호 전송 계층 보안(mTLS) 인증서 인증이 포함됩니다.

::: info 참고
이 페이지에 표시된 모든 환경 변수는 [`settings.json`](/settings)에서도 구성할 수 있습니다.
:::

## 프록시 구성

### 환경 변수

Claude Code는 표준 프록시 환경 변수를 인식합니다:

```bash
# HTTPS 프록시 (권장)
export HTTPS_PROXY=https://proxy.example.com:8080

# HTTP 프록시 (HTTPS를 사용할 수 없는 경우)
export HTTP_PROXY=http://proxy.example.com:8080

# 특정 요청에 대해 프록시 우회 - 공백 구분 형식
export NO_PROXY="localhost 192.168.1.1 example.com .example.com"
# 특정 요청에 대해 프록시 우회 - 쉼표 구분 형식
export NO_PROXY="localhost,192.168.1.1,example.com,.example.com"
# 모든 요청에 대해 프록시 우회
export NO_PROXY="*"
```

::: info 참고
Claude Code는 SOCKS 프록시를 지원하지 않습니다.
:::

### 기본 인증

프록시에 기본 인증이 필요한 경우 프록시 URL에 자격 증명을 포함하세요:

```bash
export HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

::: warning 주의
스크립트에 비밀번호를 하드코딩하지 마세요. 대신 환경 변수나 안전한 자격 증명 저장소를 사용하세요.
:::

::: tip 팁
고급 인증(NTLM, Kerberos 등)이 필요한 프록시의 경우, 해당 인증 방법을 지원하는 LLM Gateway 서비스 사용을 고려하세요.
:::

## CA 인증서 저장소

기본적으로 Claude Code는 번들된 Mozilla CA 인증서와 운영 체제의 인증서 저장소를 모두 신뢰합니다. CrowdStrike Falcon 및 Zscaler와 같은 엔터프라이즈 TLS 검사 프록시는 루트 인증서가 OS 신뢰 저장소에 설치되어 있으면 추가 구성 없이 작동합니다.

::: info 참고
시스템 CA 저장소 통합에는 네이티브 Claude Code 바이너리 배포가 필요합니다. Node.js 런타임에서 실행할 때는 시스템 CA 저장소가 자동으로 병합되지 않습니다. 이 경우 엔터프라이즈 루트 CA를 신뢰하려면 `NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem`을 설정하세요.
:::

`CLAUDE_CODE_CERT_STORE`는 쉼표로 구분된 소스 목록을 허용합니다. 인식되는 값은 Claude Code와 함께 제공되는 Mozilla CA 세트를 위한 `bundled`와 운영 체제 신뢰 저장소를 위한 `system`입니다. 기본값은 `bundled,system`입니다.

번들된 Mozilla CA 세트만 신뢰하려면:

```bash
export CLAUDE_CODE_CERT_STORE=bundled
```

OS 인증서 저장소만 신뢰하려면:

```bash
export CLAUDE_CODE_CERT_STORE=system
```

::: info 참고
`CLAUDE_CODE_CERT_STORE`에는 전용 `settings.json` 스키마 키가 없습니다. `~/.claude/settings.json`의 `env` 블록이나 프로세스 환경에서 직접 설정하세요.
:::

## 사용자 정의 CA 인증서

엔터프라이즈 환경에서 사용자 정의 CA를 사용하는 경우, Claude Code가 직접 신뢰하도록 구성하세요:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem
```

## mTLS 인증

클라이언트 인증서 인증이 필요한 엔터프라이즈 환경:

```bash
# 인증용 클라이언트 인증서
export CLAUDE_CODE_CLIENT_CERT=/path/to/client-cert.pem

# 클라이언트 개인 키
export CLAUDE_CODE_CLIENT_KEY=/path/to/client-key.pem

# 선택 사항: 암호화된 개인 키의 암호
export CLAUDE_CODE_CLIENT_KEY_PASSPHRASE="your-passphrase"
```

## 네트워크 접근 요구 사항

Claude Code는 다음 URL에 대한 접근이 필요합니다:

* `api.anthropic.com`: Claude API 엔드포인트
* `claude.ai`: claude.ai 계정 인증
* `platform.claude.com`: Anthropic Console 계정 인증

프록시 구성 및 방화벽 규칙에서 이러한 URL을 허용 목록에 추가하세요. 이는 컨테이너화된 환경이나 제한된 네트워크 환경에서 Claude Code를 사용할 때 특히 중요합니다.

네이티브 설치 프로그램 및 업데이트 확인에는 다음 URL도 필요합니다. 설치 프로그램과 자동 업데이터는 `storage.googleapis.com`에서 가져오고 플러그인 다운로드는 `downloads.claude.ai`를 사용하므로 두 가지 모두 허용 목록에 추가하세요. npm을 통해 Claude Code를 설치하거나 자체 바이너리 배포를 관리하는 경우, 최종 사용자에게는 접근이 필요하지 않을 수 있습니다:

* `storage.googleapis.com`: Claude Code 바이너리 및 자동 업데이터용 다운로드 버킷
* `downloads.claude.ai`: 설치 스크립트, 버전 포인터, 매니페스트, 서명 키, 플러그인 실행 파일을 호스팅하는 CDN

[Chrome 통합](/chrome)은 WebSocket 브리지를 통해 브라우저 확장 프로그램에 연결합니다. Chrome에서 Claude를 사용하는 경우 아웃바운드 WebSocket 연결을 위해 `bridge.claudeusercontent.com`을 허용 목록에 추가하세요.

[웹의 Claude Code](/claude-code-on-the-web) 및 [코드 리뷰](/code-review)는 Anthropic 관리 인프라에서 리포지토리에 연결합니다. GitHub Enterprise Cloud 조직에서 IP 주소로 접근을 제한하는 경우, [설치된 GitHub Apps에 대한 IP 허용 목록 상속](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization#allowing-access-by-github-apps)을 활성화하세요. Claude GitHub App은 IP 범위를 등록하므로 이 설정을 활성화하면 수동 구성 없이 접근이 허용됩니다. [허용 목록에 범위를 수동으로 추가](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization#adding-an-allowed-ip-address)하거나 다른 방화벽을 구성하려면 [Anthropic API IP 주소](https://platform.claude.com/docs/en/api/ip-addresses)를 참조하세요.

방화벽 뒤의 자체 호스팅 [GitHub Enterprise Server](/github-enterprise-server) 인스턴스의 경우, Anthropic 인프라가 GHES 호스트에 접근하여 리포지토리를 클론하고 리뷰 댓글을 게시할 수 있도록 동일한 [Anthropic API IP 주소](https://platform.claude.com/docs/en/api/ip-addresses)를 허용 목록에 추가하세요.

## 추가 리소스

* [Claude Code 설정](/settings)
* [환경 변수 참조](/env-vars)
* [문제 해결 가이드](/troubleshooting)
