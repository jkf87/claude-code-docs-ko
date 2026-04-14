---
title: Fast 모드로 응답 속도 높이기
description: Fast 모드를 토글하여 Claude Code에서 더 빠른 Opus 4.6 응답을 받으세요.
---

# Fast 모드로 응답 속도 높이기

::: info
Fast 모드는 [리서치 프리뷰](#리서치-프리뷰) 상태입니다. 기능, 가격 및 가용성은 피드백에 따라 변경될 수 있습니다.
:::

Fast 모드는 Claude Opus 4.6의 고속 구성으로, 더 높은 토큰당 비용으로 모델을 2.5배 빠르게 만듭니다. 빠른 반복이나 실시간 디버깅 같은 대화형 작업에서 속도가 필요할 때 `/fast`로 켜고, 지연 시간보다 비용이 중요할 때 끄세요.

Fast 모드는 별도의 모델이 아닙니다. 비용 효율성보다 속도를 우선시하는 다른 API 구성으로 동일한 Opus 4.6을 사용합니다. 동일한 품질과 기능을 제공하며, 응답만 더 빠릅니다.

::: info
Fast 모드는 Claude Code v2.1.36 이상이 필요합니다. `claude --version`으로 버전을 확인하세요.
:::

알아야 할 사항:

* Claude Code CLI에서 `/fast`를 사용하여 Fast 모드를 토글합니다. Claude Code VS Code Extension에서도 `/fast`로 사용 가능합니다.
* Opus 4.6 Fast 모드 가격은 $30/150 MTok입니다.
* 구독 플랜(Pro/Max/Team/Enterprise)과 Claude Console의 모든 Claude Code 사용자가 이용 가능합니다.
* 구독 플랜(Pro/Max/Team/Enterprise)의 Claude Code 사용자는 Fast 모드를 추가 사용량으로만 이용할 수 있으며, 구독 요금 한도에 포함되지 않습니다.

이 페이지에서는 [Fast 모드 토글](#fast-모드-토글), [비용 트레이드오프](#비용-트레이드오프-이해하기), [사용 시점](#fast-모드-사용-시점-결정), [요구 사항](#요구-사항), [세션별 옵트인](#세션별-옵트인-요구), [속도 제한 동작](#속도-제한-처리)을 다룹니다.

## Fast 모드 토글

다음 두 가지 방법으로 Fast 모드를 토글할 수 있습니다:

* `/fast`를 입력하고 Tab을 눌러 켜거나 끄기
* [사용자 설정 파일](/settings)에서 `"fastMode": true` 설정

기본적으로 Fast 모드는 세션 간에 유지됩니다. 관리자는 Fast 모드가 각 세션마다 초기화되도록 구성할 수 있습니다. 자세한 내용은 [세션별 옵트인 요구](#세션별-옵트인-요구)를 참조하세요.

최적의 비용 효율성을 위해 대화 중간이 아닌 세션 시작 시 Fast 모드를 활성화하세요. 자세한 내용은 [비용 트레이드오프 이해하기](#비용-트레이드오프-이해하기)를 참조하세요.

Fast 모드를 활성화하면:

* 다른 모델을 사용 중이라면 Claude Code가 자동으로 Opus 4.6으로 전환합니다
* 확인 메시지가 표시됩니다: "Fast mode ON"
* Fast 모드가 활성화된 동안 프롬프트 옆에 작은 `↯` 아이콘이 나타납니다
* 언제든 `/fast`를 다시 실행하여 Fast 모드가 켜져 있는지 꺼져 있는지 확인할 수 있습니다

`/fast`로 Fast 모드를 비활성화하면 Opus 4.6에 그대로 남습니다. 모델이 이전 모델로 되돌아가지 않습니다. 다른 모델로 전환하려면 `/model`을 사용하세요.

## 비용 트레이드오프 이해하기

Fast 모드는 표준 Opus 4.6보다 높은 토큰당 가격이 적용됩니다:

| 모드                        | 입력 (MTok) | 출력 (MTok) |
| --------------------------- | ----------- | ----------- |
| Opus 4.6 Fast 모드          | \$30        | \$150       |

Fast 모드 가격은 전체 1M 토큰 컨텍스트 윈도우에 걸쳐 동일하게 적용됩니다.

대화 중간에 Fast 모드로 전환하면 전체 대화 컨텍스트에 대해 Fast 모드의 캐시되지 않은 전체 입력 토큰 가격을 지불합니다. 이는 처음부터 Fast 모드를 활성화했을 때보다 비용이 더 듭니다.

## Fast 모드 사용 시점 결정

Fast 모드는 비용보다 응답 지연 시간이 더 중요한 대화형 작업에 가장 적합합니다:

* 코드 변경의 빠른 반복
* 실시간 디버깅 세션
* 촉박한 마감 기한이 있는 시간에 민감한 작업

표준 모드가 더 적합한 경우:

* 속도가 덜 중요한 장시간 자율 작업
* 배치 처리 또는 CI/CD 파이프라인
* 비용에 민감한 워크로드

### Fast 모드 vs 노력 수준

Fast 모드와 노력 수준 모두 응답 속도에 영향을 미치지만 방식이 다릅니다:

| 설정             | 효과                                                            |
| ---------------- | --------------------------------------------------------------- |
| **Fast 모드**    | 동일한 모델 품질, 낮은 지연 시간, 높은 비용                     |
| **낮은 노력 수준** | 적은 사고 시간, 더 빠른 응답, 복잡한 작업에서 잠재적으로 낮은 품질 |

둘을 결합할 수 있습니다: 간단한 작업에서 최대 속도를 위해 낮은 [노력 수준](/model-config#adjust-effort-level)과 함께 Fast 모드를 사용하세요.

## 요구 사항

Fast 모드는 다음 모든 조건이 필요합니다:

* **서드파티 클라우드 제공자에서는 사용 불가**: Fast 모드는 Amazon Bedrock, Google Vertex AI 또는 Microsoft Azure Foundry에서는 사용할 수 없습니다. Fast 모드는 Anthropic Console API와 추가 사용량을 사용하는 Claude 구독 플랜에서 사용할 수 있습니다.
* **추가 사용량 활성화**: 계정에 추가 사용량이 활성화되어 있어야 하며, 이를 통해 플랜에 포함된 사용량 이상의 요금 청구가 가능합니다. 개인 계정의 경우 [Console 결제 설정](https://platform.claude.com/settings/organization/billing)에서 활성화하세요. Team 및 Enterprise의 경우 관리자가 조직에 대해 추가 사용량을 활성화해야 합니다.

::: info
Fast 모드 사용량은 플랜에 남은 사용량이 있더라도 추가 사용량으로 직접 청구됩니다. 즉, Fast 모드 토큰은 플랜에 포함된 사용량에 포함되지 않으며 첫 번째 토큰부터 Fast 모드 요금으로 청구됩니다.
:::

* **Team 및 Enterprise 관리자 활성화**: Fast 모드는 Team 및 Enterprise 조직에서 기본적으로 비활성화되어 있습니다. 사용자가 접근하려면 관리자가 명시적으로 [Fast 모드를 활성화](#조직에서-fast-모드-활성화)해야 합니다.

::: info
관리자가 조직에서 Fast 모드를 활성화하지 않은 경우, `/fast` 명령은 "Fast mode has been disabled by your organization."을 표시합니다.
:::

### 조직에서 Fast 모드 활성화

관리자는 다음에서 Fast 모드를 활성화할 수 있습니다:

* **Console** (API 고객): [Claude Code preferences](https://platform.claude.com/claude-code/preferences)
* **Claude AI** (Team 및 Enterprise): [Admin Settings > Claude Code](https://claude.ai/admin-settings/claude-code)

Fast 모드를 완전히 비활성화하는 또 다른 옵션은 `CLAUDE_CODE_DISABLE_FAST_MODE=1`을 설정하는 것입니다. [환경 변수](/env-vars)를 참조하세요.

### 세션별 옵트인 요구

기본적으로 Fast 모드는 세션 간에 유지됩니다: 사용자가 Fast 모드를 활성화하면 향후 세션에서도 유지됩니다. [Team](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=fast_mode_teams#team-&-enterprise) 또는 [Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=fast_mode_enterprise) 플랜의 관리자는 [관리 설정](/settings#settings-files) 또는 [서버 관리 설정](/server-managed-settings)에서 `fastModePerSessionOptIn`을 `true`로 설정하여 이를 방지할 수 있습니다. 이렇게 하면 각 세션이 Fast 모드가 꺼진 상태로 시작되어 사용자가 `/fast`로 명시적으로 활성화해야 합니다.

```json
{
  "fastModePerSessionOptIn": true
}
```

이는 사용자가 여러 동시 세션을 실행하는 조직에서 비용을 제어하는 데 유용합니다. 사용자는 속도가 필요할 때 `/fast`로 Fast 모드를 활성화할 수 있지만, 각 새 세션이 시작될 때 초기화됩니다. 사용자의 Fast 모드 기본 설정은 여전히 저장되므로, 이 설정을 제거하면 기본 유지 동작이 복원됩니다.

## 속도 제한 처리

Fast 모드는 표준 Opus 4.6과 별도의 속도 제한을 가집니다. Fast 모드 속도 제한에 도달하거나 추가 사용량이 소진되면:

1. Fast 모드가 자동으로 표준 Opus 4.6으로 폴백합니다
2. `↯` 아이콘이 회색으로 변하여 쿨다운을 나타냅니다
3. 표준 속도와 가격으로 작업을 계속합니다
4. 쿨다운이 만료되면 Fast 모드가 자동으로 다시 활성화됩니다

쿨다운을 기다리지 않고 수동으로 Fast 모드를 비활성화하려면 `/fast`를 다시 실행하세요.

## 리서치 프리뷰

Fast 모드는 리서치 프리뷰 기능입니다. 이는 다음을 의미합니다:

* 피드백에 따라 기능이 변경될 수 있습니다
* 가용성과 가격은 변경될 수 있습니다
* 기반 API 구성이 발전할 수 있습니다

일반적인 Anthropic 지원 채널을 통해 문제나 피드백을 보고하세요.

## 참고

* [모델 구성](/model-config): 모델 전환 및 노력 수준 조정
* [비용 효과적으로 관리](/costs): 토큰 사용량 추적 및 비용 절감
* [상태 줄 구성](/statusline): 모델 및 컨텍스트 정보 표시
