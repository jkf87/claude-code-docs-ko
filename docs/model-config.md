---
title: 모델 설정
description: "opusplan과 같은 모델 별칭을 포함한 Claude Code 모델 설정에 대해 알아보세요."
---

# 모델 설정

## 사용 가능한 모델

Claude Code의 `model` 설정에서 다음 중 하나를 구성할 수 있습니다:

* **모델 별칭**
* **모델 이름**
  * Anthropic API: 전체 **[모델 이름](https://platform.claude.com/docs/en/about-claude/models/overview)**
  * Bedrock: 추론 프로파일 ARN
  * Foundry: 배포 이름
  * Vertex: 버전 이름

### 모델 별칭

모델 별칭은 정확한 버전 번호를 기억하지 않고도 모델 설정을 편리하게 선택할 수 있는 방법을 제공합니다:

| 모델 별칭        | 동작                                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`default`**    | 모델 재정의를 지우고 계정 유형에 맞는 권장 모델로 되돌리는 특수 값. 자체적으로 모델 별칭은 아님                                    |
| **`best`**       | 현재 `opus`에 해당하는 가장 성능 좋은 모델 사용                                                                                |
| **`sonnet`**     | 일상적인 코딩 작업을 위한 최신 Sonnet 모델(현재 Sonnet 4.6) 사용                                                                                           |
| **`opus`**       | 복잡한 추론 작업을 위한 최신 Opus 모델(현재 Opus 4.6) 사용                                                                          |
| **`haiku`**      | 간단한 작업을 위한 빠르고 효율적인 Haiku 모델 사용                                                                                             |
| **`sonnet[1m]`** | 긴 세션을 위한 [100만 토큰 컨텍스트 창](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)이 있는 Sonnet 사용 |
| **`opus[1m]`**   | 긴 세션을 위한 [100만 토큰 컨텍스트 창](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)이 있는 Opus 사용   |
| **`opusplan`**   | 플랜 모드에서는 `opus`를 사용하고 실행 시에는 `sonnet`으로 전환하는 특수 모드                                                                              |

별칭은 항상 최신 버전을 가리킵니다. 특정 버전에 고정하려면 전체 모델 이름(예: `claude-opus-4-6`)을 사용하거나 `ANTHROPIC_DEFAULT_OPUS_MODEL`과 같은 해당 환경 변수를 설정하세요.

### 모델 설정하기

우선순위 순서대로 여러 가지 방법으로 모델을 구성할 수 있습니다:

1. **세션 중** - `/model <별칭|이름>`을 사용하여 세션 중 모델 전환
2. **시작 시** - `claude --model <별칭|이름>`으로 실행
3. **환경 변수** - `ANTHROPIC_MODEL=<별칭|이름>` 설정
4. **설정** - `model` 필드를 사용하여 설정 파일에 영구적으로 구성

사용 예시:

```bash
# Opus로 시작
claude --model opus

# 세션 중 Sonnet으로 전환
/model sonnet
```

설정 파일 예시:

```json
{
    "permissions": {
        ...
    },
    "model": "opus"
}
```

## 모델 선택 제한

엔터프라이즈 관리자는 [관리 또는 정책 설정](/settings#settings-files)의 `availableModels`를 사용하여 사용자가 선택할 수 있는 모델을 제한할 수 있습니다.

`availableModels`가 설정되면 사용자는 `/model`, `--model` 플래그, Config 도구 또는 `ANTHROPIC_MODEL` 환경 변수를 통해 목록에 없는 모델로 전환할 수 없습니다.

```json
{
  "availableModels": ["sonnet", "haiku"]
}
```

### 기본 모델 동작

모델 선택기의 Default 옵션은 `availableModels`의 영향을 받지 않습니다. 항상 사용 가능하며 [사용자의 구독 등급에 따른](#default-model-setting) 시스템의 런타임 기본값을 나타냅니다.

`availableModels: []`로 설정하더라도 사용자는 자신의 등급에 맞는 Default 모델로 Claude Code를 사용할 수 있습니다.

### 사용자가 실행하는 모델 제어

`model` 설정은 초기 선택이지, 강제 적용은 아닙니다. 세션 시작 시 어떤 모델이 활성화될지를 설정하지만, 사용자는 여전히 `/model`을 열고 Default를 선택할 수 있으며, 이는 `model`에 설정된 값에 관계없이 해당 등급의 시스템 기본값으로 해석됩니다.

모델 경험을 완전히 제어하려면 세 가지 설정을 함께 사용하세요:

* **`availableModels`**: 사용자가 전환할 수 있는 명명된 모델 제한
* **`model`**: 세션 시작 시 초기 모델 선택 설정
* **`ANTHROPIC_DEFAULT_SONNET_MODEL`** / **`ANTHROPIC_DEFAULT_OPUS_MODEL`** / **`ANTHROPIC_DEFAULT_HAIKU_MODEL`**: Default 옵션과 `sonnet`, `opus`, `haiku` 별칭이 해석되는 모델 제어

이 예시는 사용자를 Sonnet 4.5로 시작하고, 선택기를 Sonnet과 Haiku로 제한하며, Default가 최신 릴리스가 아닌 Sonnet 4.5로 해석되도록 고정합니다:

```json
{
  "model": "claude-sonnet-4-5",
  "availableModels": ["claude-sonnet-4-5", "haiku"],
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-5"
  }
}
```

`env` 블록 없이는 선택기에서 Default를 선택한 사용자가 최신 Sonnet 릴리스를 받게 되어 `model` 및 `availableModels`의 버전 고정을 우회하게 됩니다.

### 병합 동작

`availableModels`가 여러 수준(예: 사용자 설정과 프로젝트 설정)에서 설정되면 배열이 병합되고 중복이 제거됩니다. 엄격한 허용 목록을 적용하려면 가장 높은 우선순위를 갖는 관리 또는 정책 설정에서 `availableModels`를 설정하세요.

### Mantle 모델 ID

[Bedrock Mantle 엔드포인트](/amazon-bedrock#use-the-mantle-endpoint)가 활성화되면 `anthropic.`으로 시작하는 `availableModels`의 항목이 `/model` 선택기에 사용자 정의 옵션으로 추가되고 Mantle 엔드포인트로 라우팅됩니다. 이는 [서드파티 배포를 위한 모델 고정](#pin-models-for-third-party-deployments)에서 설명된 별칭 전용 매칭의 예외입니다. 설정은 여전히 나열된 항목으로만 선택기를 제한하므로 Mantle ID와 함께 표준 별칭도 포함하세요.

## 특수 모델 동작

### `default` 모델 설정

`default`의 동작은 계정 유형에 따라 다릅니다:

* **Max 및 Team Premium**: 기본값은 Opus 4.6
* **Pro 및 Team Standard**: 기본값은 Sonnet 4.6
* **Enterprise**: Opus 4.6을 사용할 수 있지만 기본값은 아님

Claude Code는 Opus 사용량 한도에 도달하면 자동으로 Sonnet으로 폴백할 수 있습니다.

### `opusplan` 모델 설정

`opusplan` 모델 별칭은 자동화된 하이브리드 방식을 제공합니다:

* **플랜 모드에서** - 복잡한 추론 및 아키텍처 결정에 `opus` 사용
* **실행 모드에서** - 코드 생성 및 구현을 위해 자동으로 `sonnet`으로 전환

이를 통해 두 가지 장점을 모두 얻을 수 있습니다: 계획에는 Opus의 뛰어난 추론 능력을, 실행에는 Sonnet의 효율성을 활용합니다.

### 노력 수준 조정

[노력 수준](https://platform.claude.com/docs/en/build-with-claude/effort)은 작업 복잡도에 따라 사고를 동적으로 할당하는 적응형 추론을 제어합니다. 낮은 노력은 간단한 작업에서 더 빠르고 저렴하며, 높은 노력은 복잡한 문제에 대해 더 깊은 추론을 제공합니다.

세 가지 수준이 세션 간에 유지됩니다: **low**, **medium**, **high**. 네 번째 수준인 **max**는 토큰 지출에 제약 없이 가장 깊은 추론을 제공하므로 응답이 `high`보다 느리고 비용이 더 많이 듭니다. `max`는 Opus 4.6에서만 사용 가능하며 `CLAUDE_CODE_EFFORT_LEVEL` 환경 변수를 통한 경우를 제외하고는 세션 간에 유지되지 않습니다.

기본 노력 수준은 플랜에 따라 다릅니다. Pro 및 Max 구독자는 기본적으로 medium 노력을 사용합니다. API 키, Team, Enterprise, 서드파티 제공자(Bedrock, Vertex AI, Foundry) 사용자를 포함한 다른 모든 사용자는 기본적으로 high 노력을 사용합니다.

플랜의 기본값은 대부분의 코딩 작업에 적합합니다. 어려운 디버깅 문제나 복잡한 아키텍처 결정과 같이 더 깊은 추론이 필요한 작업에는 노력 수준을 높이세요. 높은 수준은 일상적인 작업에서 모델이 과도하게 생각하게 할 수 있습니다.

세션 설정을 변경하지 않고 일회성 깊은 추론을 위해서는 프롬프트에 "ultrathink"를 포함하면 해당 턴에만 high 노력이 트리거됩니다. 세션이 이미 high 또는 max 상태라면 효과가 없습니다.

**노력 수준 설정:**

* **`/effort`**: `/effort low`, `/effort medium`, `/effort high`, 또는 `/effort max`를 실행하여 수준을 변경하거나, `/effort auto`로 모델 기본값으로 재설정
* **`/model`에서**: 모델 선택 시 왼쪽/오른쪽 화살표 키를 사용하여 노력 슬라이더 조정
* **`--effort` 플래그**: Claude Code 실행 시 `low`, `medium`, `high`, 또는 `max`를 전달하여 단일 세션의 수준 설정
* **환경 변수**: `CLAUDE_CODE_EFFORT_LEVEL`을 `low`, `medium`, `high`, `max`, 또는 `auto`로 설정
* **설정**: 설정 파일에서 `effortLevel`을 `"low"`, `"medium"`, 또는 `"high"`로 설정
* **스킬 및 서브에이전트 프론트매터**: [스킬](/skills#frontmatter-reference) 또는 [서브에이전트](/sub-agents#supported-frontmatter-fields) 마크다운 파일에서 `effort`를 설정하여 해당 스킬이나 서브에이전트가 실행될 때 노력 수준 재정의

환경 변수는 다른 모든 방법보다 우선하며, 그 다음으로 구성된 수준, 그 다음으로 모델 기본값이 적용됩니다. 프론트매터 노력은 해당 스킬이나 서브에이전트가 활성화될 때 적용되며, 세션 수준을 재정의하지만 환경 변수는 재정의하지 않습니다.

노력 수준은 Opus 4.6 및 Sonnet 4.6에서 지원됩니다. 지원되는 모델이 선택된 경우 `/model`에서 노력 슬라이더가 표시됩니다. 현재 노력 수준은 로고와 스피너 옆에도 표시됩니다(예: "with low effort"). 이를 통해 `/model`을 열지 않고도 어떤 설정이 활성화되어 있는지 확인할 수 있습니다.

Opus 4.6 및 Sonnet 4.6에서 적응형 추론을 비활성화하고 이전의 고정된 사고 예산으로 되돌리려면 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`을 설정하세요. 비활성화된 경우 이러한 모델은 `MAX_THINKING_TOKENS`로 제어되는 고정 예산을 사용합니다. [환경 변수](/env-vars)를 참조하세요.

### 확장 컨텍스트

Opus 4.6 및 Sonnet 4.6은 대규모 코드베이스를 사용하는 긴 세션을 위한 [100만 토큰 컨텍스트 창](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)을 지원합니다.

가용성은 모델과 플랜에 따라 다릅니다. Max, Team, Enterprise 플랜에서는 추가 구성 없이 Opus가 자동으로 1M 컨텍스트로 업그레이드됩니다. 이는 Team Standard 및 Team Premium 시트 모두에 적용됩니다.

| 플랜                      | 1M 컨텍스트의 Opus 4.6                                                                                  | 1M 컨텍스트의 Sonnet 4.6                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Max, Team, Enterprise | 구독에 포함                                                                                | [추가 사용량](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 필요 |
| Pro                       | [추가 사용량](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 필요 | [추가 사용량](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 필요 |
| API 및 종량제     | 전체 액세스                                                                               | 전체 액세스                                                                               |

1M 컨텍스트를 완전히 비활성화하려면 `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`을 설정하세요. 이렇게 하면 모델 선택기에서 1M 모델 변형이 제거됩니다. [환경 변수](/env-vars)를 참조하세요.

1M 컨텍스트 창은 200K를 초과하는 토큰에 대해 프리미엄 없이 표준 모델 가격을 사용합니다. 구독에 확장 컨텍스트가 포함된 플랜의 경우 사용량은 구독으로 처리됩니다. 추가 사용량을 통해 확장 컨텍스트에 액세스하는 플랜의 경우 토큰은 추가 사용량으로 청구됩니다.

계정이 1M 컨텍스트를 지원하는 경우 Claude Code의 최신 버전에서 모델 선택기(`/model`)에 옵션이 나타납니다. 보이지 않는다면 세션을 다시 시작해 보세요.

모델 별칭 또는 전체 모델 이름과 함께 `[1m]` 접미사를 사용할 수도 있습니다:

```bash
# opus[1m] 또는 sonnet[1m] 별칭 사용
/model opus[1m]
/model sonnet[1m]

# 또는 전체 모델 이름에 [1m] 추가
/model claude-opus-4-6[1m]
```

## 현재 모델 확인하기

현재 사용 중인 모델을 여러 가지 방법으로 확인할 수 있습니다:

1. [상태 표시줄](/statusline)에서 (구성된 경우)
2. `/status`에서, 계정 정보도 표시됩니다.

## 사용자 정의 모델 옵션 추가

`ANTHROPIC_CUSTOM_MODEL_OPTION`을 사용하여 기본 제공 별칭을 교체하지 않고 `/model` 선택기에 단일 사용자 정의 항목을 추가하세요. LLM 게이트웨이 배포나 Claude Code가 기본적으로 나열하지 않는 모델 ID를 테스트할 때 유용합니다.

이 예시는 게이트웨이를 통해 라우팅되는 Opus 배포를 선택 가능하도록 세 가지 변수를 모두 설정합니다:

```bash
export ANTHROPIC_CUSTOM_MODEL_OPTION="my-gateway/claude-opus-4-6"
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME="Opus via Gateway"
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION="Custom deployment routed through the internal LLM gateway"
```

사용자 정의 항목은 `/model` 선택기 하단에 나타납니다. `ANTHROPIC_CUSTOM_MODEL_OPTION_NAME` 및 `ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION`은 선택 사항입니다. 생략하면 모델 ID가 이름으로 사용되고 설명은 기본적으로 `Custom model (<model-id>)`가 됩니다.

Claude Code는 `ANTHROPIC_CUSTOM_MODEL_OPTION`에 설정된 모델 ID에 대한 검증을 건너뛰므로 API 엔드포인트가 허용하는 모든 문자열을 사용할 수 있습니다.

## 환경 변수

다음 환경 변수를 사용할 수 있으며, 이는 별칭이 매핑되는 모델 이름을 제어하기 위해 전체 **모델 이름**(또는 API 제공자에 해당하는 값)이어야 합니다.

| 환경 변수                        | 설명                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL`   | `opus`에 사용할 모델, 또는 Plan Mode가 활성화된 경우 `opusplan`에 사용할 모델                      |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `sonnet`에 사용할 모델, 또는 Plan Mode가 활성화되지 않은 경우 `opusplan`에 사용할 모델                |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL`  | `haiku`에 사용할 모델, 또는 [백그라운드 기능](/costs#background-token-usage) |
| `CLAUDE_CODE_SUBAGENT_MODEL`     | [서브에이전트](/sub-agents)에 사용할 모델                                              |

참고: `ANTHROPIC_SMALL_FAST_MODEL`은 `ANTHROPIC_DEFAULT_HAIKU_MODEL`을 위해 더 이상 사용되지 않습니다.

### 서드파티 배포를 위한 모델 고정

[Bedrock](/amazon-bedrock), [Vertex AI](/google-vertex-ai), 또는 [Foundry](/microsoft-foundry)를 통해 Claude Code를 배포할 때는 사용자에게 배포하기 전에 모델 버전을 고정하세요.

고정하지 않으면 Claude Code는 최신 버전으로 해석되는 모델 별칭(`sonnet`, `opus`, `haiku`)을 사용합니다. Anthropic이 사용자 계정에서 아직 활성화되지 않은 새 모델을 릴리스하면 Bedrock 및 Vertex AI 사용자는 알림을 보고 해당 세션에서 이전 버전으로 폴백하며, Foundry는 동등한 시작 검사가 없어 Foundry 사용자는 오류를 보게 됩니다.

::: warning
초기 설정의 일부로 세 가지 모델 환경 변수 모두를 특정 버전 ID로 설정하세요. 고정을 통해 사용자가 새 모델로 이동하는 시기를 제어할 수 있습니다.
:::

제공자별 버전별 모델 ID와 함께 다음 환경 변수를 사용하세요:

| 제공자  | 예시                                                                 |
| :-------- | :---------------------------------------------------------------------- |
| Bedrock   | `export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'` |
| Vertex AI | `export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'`                 |
| Foundry   | `export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'`                 |

`ANTHROPIC_DEFAULT_SONNET_MODEL` 및 `ANTHROPIC_DEFAULT_HAIKU_MODEL`에도 동일한 패턴을 적용하세요. 모든 제공자의 현재 및 이전 모델 ID는 [모델 개요](https://platform.claude.com/docs/en/about-claude/models/overview)를 참조하세요. 사용자를 새 모델 버전으로 업그레이드하려면 이 환경 변수를 업데이트하고 재배포하세요.

고정된 모델에 [확장 컨텍스트](#extended-context)를 활성화하려면 `ANTHROPIC_DEFAULT_OPUS_MODEL` 또는 `ANTHROPIC_DEFAULT_SONNET_MODEL`의 모델 ID에 `[1m]`을 추가하세요:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6[1m]'
```

`[1m]` 접미사는 `opusplan`을 포함한 해당 별칭의 모든 사용에 1M 컨텍스트 창을 적용합니다. Claude Code는 제공자에게 모델 ID를 보내기 전에 접미사를 제거합니다. Opus 4.6 또는 Sonnet 4.6과 같이 기반 모델이 1M 컨텍스트를 지원하는 경우에만 `[1m]`을 추가하세요.

::: info
`settings.availableModels` 허용 목록은 서드파티 제공자를 사용할 때도 여전히 적용됩니다. 필터링은 제공자별 모델 ID가 아닌 모델 별칭(`opus`, `sonnet`, `haiku`)을 기준으로 매칭됩니다.
:::

### 고정된 모델 표시 및 기능 사용자 정의

서드파티 제공자에서 모델을 고정하면 제공자별 ID가 `/model` 선택기에 그대로 나타나며 Claude Code가 모델이 지원하는 기능을 인식하지 못할 수 있습니다. 각 고정 모델에 대한 동반 환경 변수를 사용하여 표시 이름을 재정의하고 기능을 선언할 수 있습니다.

이러한 변수는 Bedrock, Vertex AI, Foundry와 같은 서드파티 제공자에서만 적용됩니다. Anthropic API를 직접 사용할 때는 효과가 없습니다.

| 환경 변수                                  | 설명                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_NAME`                   | `/model` 선택기에서 고정된 Opus 모델의 표시 이름. 설정하지 않으면 기본값은 모델 ID               |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION`            | `/model` 선택기에서 고정된 Opus 모델의 표시 설명. 설정하지 않으면 기본값은 `Custom Opus model` |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES` | 고정된 Opus 모델이 지원하는 기능의 쉼표로 구분된 목록                                                |

동일한 `_NAME`, `_DESCRIPTION`, `_SUPPORTED_CAPABILITIES` 접미사가 `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_CUSTOM_MODEL_OPTION`에도 사용 가능합니다.

Claude Code는 [노력 수준](#adjust-effort-level) 및 [확장 사고](/common-workflows#use-extended-thinking-thinking-mode)와 같은 기능을 모델 ID와 알려진 패턴을 매칭하여 활성화합니다. Bedrock ARN이나 사용자 정의 배포 이름과 같은 제공자별 ID는 종종 이러한 패턴과 일치하지 않아 지원되는 기능이 비활성화됩니다. `_SUPPORTED_CAPABILITIES`를 설정하여 Claude Code에 모델이 실제로 지원하는 기능을 알리세요:

| 기능 값                | 활성화 내용                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `effort`               | [노력 수준](#adjust-effort-level) 및 `/effort` 명령                 |
| `max_effort`           | `max` 노력 수준                                                          |
| `thinking`             | [확장 사고](/common-workflows#use-extended-thinking-thinking-mode)   |
| `adaptive_thinking`    | 작업 복잡도에 따라 사고를 동적으로 할당하는 적응형 추론 |
| `interleaved_thinking` | 도구 호출 사이의 사고                                                     |

`_SUPPORTED_CAPABILITIES`가 설정되면 나열된 기능이 활성화되고 나열되지 않은 기능은 매칭된 고정 모델에 대해 비활성화됩니다. 변수가 설정되지 않은 경우 Claude Code는 모델 ID를 기반으로 내장 감지로 폴백합니다.

이 예시는 Opus를 Bedrock 사용자 정의 모델 ARN에 고정하고, 친숙한 이름을 설정하며, 기능을 선언합니다:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='arn:aws:bedrock:us-east-1:123456789012:custom-model/abc'
export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME='Opus via Bedrock'
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION='Opus 4.6 routed through a Bedrock custom endpoint'
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES='effort,max_effort,thinking,adaptive_thinking,interleaved_thinking'
```

### 버전별 모델 ID 재정의

위의 패밀리 수준 환경 변수는 패밀리 별칭당 하나의 모델 ID를 구성합니다. 동일한 패밀리 내의 여러 버전을 서로 다른 제공자 ID에 매핑해야 하는 경우 `modelOverrides` 설정을 대신 사용하세요.

`modelOverrides`는 개별 Anthropic 모델 ID를 Claude Code가 제공자의 API에 보내는 제공자별 문자열에 매핑합니다. 사용자가 `/model` 선택기에서 매핑된 모델을 선택하면 Claude Code는 기본 제공 기본값 대신 구성된 값을 사용합니다.

이를 통해 엔터프라이즈 관리자는 거버넌스, 비용 할당 또는 지역 라우팅을 위해 각 모델 버전을 특정 Bedrock 추론 프로파일 ARN, Vertex AI 버전 이름 또는 Foundry 배포 이름으로 라우팅할 수 있습니다.

[설정 파일](/settings#settings-files)에서 `modelOverrides`를 설정하세요:

```json
{
  "modelOverrides": {
    "claude-opus-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-prod",
    "claude-opus-4-5-20251101": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-45-prod",
    "claude-sonnet-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/sonnet-prod"
  }
}
```

키는 [모델 개요](https://platform.claude.com/docs/en/about-claude/models/overview)에 나열된 대로 Anthropic 모델 ID여야 합니다. 날짜가 포함된 모델 ID의 경우 거기에 표시된 대로 날짜 접미사를 정확히 포함하세요. 알 수 없는 키는 무시됩니다.

재정의는 `/model` 선택기의 각 항목을 지원하는 기본 제공 모델 ID를 교체합니다. Bedrock에서 재정의는 Claude Code가 시작 시 자동으로 검색하는 추론 프로파일보다 우선합니다. `ANTHROPIC_MODEL`, `--model`, 또는 `ANTHROPIC_DEFAULT_*_MODEL` 환경 변수를 통해 직접 제공한 값은 그대로 제공자에게 전달되며 `modelOverrides`에 의해 변환되지 않습니다.

`modelOverrides`는 `availableModels`와 함께 작동합니다. 허용 목록은 재정의 값이 아닌 Anthropic 모델 ID를 기준으로 평가되므로 Opus 버전이 ARN에 매핑된 경우에도 `availableModels`의 `"opus"` 항목은 계속 매칭됩니다.

### 프롬프트 캐싱 구성

Claude Code는 성능 최적화 및 비용 절감을 위해 자동으로 [프롬프트 캐싱](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)을 사용합니다. 전역적으로 또는 특정 모델 등급에 대해 프롬프트 캐싱을 비활성화할 수 있습니다:

| 환경 변수                       | 설명                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `DISABLE_PROMPT_CACHING`        | `1`로 설정하면 모든 모델에 대해 프롬프트 캐싱 비활성화(모델별 설정보다 우선) |
| `DISABLE_PROMPT_CACHING_HAIKU`  | `1`로 설정하면 Haiku 모델에 대해서만 프롬프트 캐싱 비활성화                                     |
| `DISABLE_PROMPT_CACHING_SONNET` | `1`로 설정하면 Sonnet 모델에 대해서만 프롬프트 캐싱 비활성화                                    |
| `DISABLE_PROMPT_CACHING_OPUS`   | `1`로 설정하면 Opus 모델에 대해서만 프롬프트 캐싱 비활성화                                      |

이러한 환경 변수는 프롬프트 캐싱 동작에 대한 세밀한 제어를 제공합니다. 전역 `DISABLE_PROMPT_CACHING` 설정은 모델별 설정보다 우선하므로 필요할 때 모든 캐싱을 빠르게 비활성화할 수 있습니다. 모델별 설정은 특정 모델을 디버깅하거나 캐싱 구현이 다를 수 있는 클라우드 제공자와 작업할 때와 같이 선택적 제어에 유용합니다.
