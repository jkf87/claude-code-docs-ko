---
title: 법률 및 규정 준수
description: Claude Code의 법적 계약, 규정 준수 인증 및 보안 정보입니다.
---

# 법률 및 규정 준수

## 법적 계약

### 라이선스

Claude Code 사용에는 다음이 적용됩니다:

* [상업 약관](https://www.anthropic.com/legal/commercial-terms) - Team, Enterprise 및 Claude API 사용자용
* [소비자 서비스 약관](https://www.anthropic.com/legal/consumer-terms) - Free, Pro 및 Max 사용자용

### 상업 계약

Claude API를 직접(1P) 사용하든 AWS Bedrock 또는 Google Vertex(3P)를 통해 접근하든, 상호 합의하지 않는 한 기존 상업 계약이 Claude Code 사용에 적용됩니다.

## 규정 준수

### 의료 규정 준수 (BAA)

고객이 당사와 사업 제휴 계약(BAA)을 체결하고 Claude Code를 사용하려는 경우, 고객이 BAA를 체결하고 [제로 데이터 보존(ZDR)](/zero-data-retention)을 활성화했다면 BAA가 자동으로 Claude Code에 확장 적용됩니다. BAA는 Claude Code를 통해 흐르는 해당 고객의 API 트래픽에 적용됩니다. ZDR은 조직 단위로 활성화되므로 각 조직에서 BAA의 적용을 받으려면 별도로 ZDR을 활성화해야 합니다.

## 사용 정책

### 허용되는 사용

Claude Code 사용에는 [Anthropic 사용 정책](https://www.anthropic.com/legal/aup)이 적용됩니다. Pro 및 Max 플랜의 광고된 사용 제한은 Claude Code와 Agent SDK의 일반적인 개인 사용을 전제로 합니다.

### 인증 및 자격 증명 사용

Claude Code는 OAuth 토큰 또는 API 키를 사용하여 Anthropic 서버에 인증합니다. 이러한 인증 방법은 서로 다른 목적을 가집니다:

* **OAuth 인증**은 Claude Free, Pro, Max, Team 및 Enterprise 구독 플랜 구매자 전용이며, Claude Code 및 기타 네이티브 Anthropic 애플리케이션의 일반적인 사용을 지원하도록 설계되었습니다. 사용자가 OAuth 토큰으로 인증하는 방법에 대한 자세한 정보는 [Claude 계정 로그인](https://support.claude.com/en/articles/13189465-logging-in-to-your-claude-account)에서 확인할 수 있습니다.
* Claude의 기능과 상호 작용하는 제품이나 서비스를 구축하는 **개발자**([Agent SDK](/agent-sdk/overview) 사용 포함)는 [Claude Console](https://platform.claude.com/) 또는 지원되는 클라우드 제공자를 통한 API 키 인증을 사용해야 합니다. Anthropic은 타사 개발자가 Claude.ai 로그인을 제공하거나 사용자를 대신하여 Free, Pro 또는 Max 플랜 자격 증명을 통해 요청을 라우팅하는 것을 허용하지 않습니다.

Anthropic은 이러한 제한을 시행하기 위한 조치를 취할 권리를 보유하며, 사전 통지 없이 시행할 수 있습니다.

허용되는 인증 방법에 대한 질문은 [영업팀에 문의](https://www.anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=legal_compliance_contact_sales)하세요.

## 보안 및 신뢰

### 신뢰 및 안전

자세한 정보는 [Anthropic Trust Center](https://trust.anthropic.com) 및 [Transparency Hub](https://www.anthropic.com/transparency)에서 확인할 수 있습니다.

### 보안 취약점 보고

Anthropic은 HackerOne을 통해 보안 프로그램을 관리합니다. [이 양식을 사용하여 취약점을 보고](https://hackerone.com/anthropic-vdp/reports/new?type=team\&report_type=vulnerability)하세요.
