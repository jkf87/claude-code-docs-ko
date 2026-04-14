---
title: 개발 컨테이너
description: 일관되고 안전한 환경이 필요한 팀을 위한 Claude Code 개발 컨테이너에 대해 알아보세요.
---

# 개발 컨테이너

레퍼런스 [devcontainer 설정](https://github.com/anthropics/claude-code/tree/main/.devcontainer)과 관련 [Dockerfile](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile)은 그대로 사용하거나 필요에 맞게 커스터마이즈할 수 있는 사전 구성된 개발 컨테이너를 제공합니다. 이 devcontainer는 Visual Studio Code [Dev Containers 확장](https://code.visualstudio.com/docs/devcontainers/containers) 및 유사한 도구와 함께 작동합니다.

컨테이너의 강화된 보안 조치(격리 및 방화벽 규칙)를 통해 `claude --dangerously-skip-permissions`를 실행하여 무인 운영 시 권한 프롬프트를 건너뛸 수 있습니다.

::: warning
devcontainer는 상당한 보호를 제공하지만, 어떤 시스템도 모든 공격에 완전히 면역이 되지는 않습니다.
`--dangerously-skip-permissions`로 실행할 때, devcontainer는 악의적인 프로젝트가 Claude Code 자격 증명을 포함하여 devcontainer에서 접근 가능한 모든 것을 유출하는 것을 방지하지 못합니다.
신뢰할 수 있는 저장소에서 개발할 때만 devcontainer를 사용하는 것을 권장합니다.
항상 좋은 보안 관행을 유지하고 Claude의 활동을 모니터링하세요.
:::

## 주요 기능

* **프로덕션 준비된 Node.js**: 필수 개발 의존성과 함께 Node.js 20 기반으로 구축
* **설계부터 보안**: 필요한 서비스에만 네트워크 접근을 제한하는 커스텀 방화벽
* **개발자 친화적 도구**: git, 생산성 향상 기능이 포함된 ZSH, fzf 등 포함
* **원활한 VS Code 통합**: 사전 구성된 확장 및 최적화된 설정
* **세션 지속성**: 컨테이너 재시작 간 명령 기록 및 구성 보존
* **어디서나 작동**: macOS, Windows, Linux 개발 환경과 호환

## 4단계로 시작하기

1. VS Code와 [Dev Containers 확장](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)을 설치합니다
2. [Claude Code 레퍼런스 구현](https://github.com/anthropics/claude-code/tree/main/.devcontainer) 저장소를 클론합니다
3. VS Code에서 저장소를 엽니다
4. 프롬프트가 표시되면 "Reopen in Container"를 클릭합니다 (또는 Command Palette: Cmd+Shift+P → "Dev Containers: Reopen in Container")

컨테이너 빌드가 완료되면 VS Code에서 `` Ctrl+` ``로 터미널을 열고 `claude`를 실행하여 인증하고 첫 번째 세션을 시작하세요. 컨테이너에는 Claude Code가 사전 설치되어 있으므로 즉시 작업을 시작할 수 있습니다. 프로젝트 파일은 컨테이너에 마운트되며, Claude가 작성하는 모든 코드는 로컬 저장소에 나타납니다.

## 구성 분석

devcontainer 설정은 세 가지 주요 구성 요소로 이루어져 있습니다:

* [**devcontainer.json**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json): 컨테이너 설정, 확장 및 볼륨 마운트를 제어합니다
* [**Dockerfile**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile): 컨테이너 이미지 및 설치된 도구를 정의합니다
* [**init-firewall.sh**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh): 네트워크 보안 규칙을 설정합니다

## 보안 기능

컨테이너는 방화벽 구성을 통해 다층 보안 접근 방식을 구현합니다:

* **정밀한 접근 제어**: 화이트리스트된 도메인(npm 레지스트리, GitHub, Claude API 등)에만 아웃바운드 연결을 제한합니다
* **허용된 아웃바운드 연결**: 방화벽은 아웃바운드 DNS 및 SSH 연결을 허용합니다
* **기본 거부 정책**: 다른 모든 외부 네트워크 접근을 차단합니다
* **시작 검증**: 컨테이너 초기화 시 방화벽 규칙을 검증합니다
* **격리**: 메인 시스템과 분리된 안전한 개발 환경을 생성합니다

## 커스터마이즈 옵션

devcontainer 구성은 필요에 맞게 조정할 수 있도록 설계되었습니다:

* 워크플로에 따라 VS Code 확장을 추가하거나 제거
* 다양한 하드웨어 환경에 맞게 리소스 할당 수정
* 네트워크 접근 권한 조정
* 셸 구성 및 개발자 도구 커스터마이즈

## 사용 사례 예시

### 보안 클라이언트 작업

devcontainer를 사용하여 서로 다른 클라이언트 프로젝트를 격리하고, 코드와 자격 증명이 환경 간에 혼합되지 않도록 합니다.

### 팀 온보딩

새로운 팀원이 필요한 모든 도구와 설정이 사전 설치된 완전히 구성된 개발 환경을 몇 분 안에 갖출 수 있습니다.

### 일관된 CI/CD 환경

CI/CD 파이프라인에서 devcontainer 구성을 미러링하여 개발과 프로덕션 환경이 일치하도록 합니다.

## 관련 리소스

* [VS Code devcontainers 문서](https://code.visualstudio.com/docs/devcontainers/containers)
* [Claude Code 보안 모범 사례](/security)
* [엔터프라이즈 네트워크 구성](/network-config)
