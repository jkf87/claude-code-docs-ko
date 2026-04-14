# 출력 스타일

> 소프트웨어 엔지니어링 이외의 용도에 맞게 Claude Code를 조정합니다

출력 스타일은 Claude가 응답하는 방식을 변경하지, Claude가 아는 것을 변경하지는 않습니다. 시스템 프롬프트를 수정하여 역할, 톤, 출력 형식을 설정하면서 스크립트 실행, 파일 읽기 및 쓰기, TODO 추적과 같은 핵심 기능은 유지합니다. 매 턴마다 동일한 어조나 형식으로 다시 프롬프트를 입력하는 경우, 또는 Claude가 소프트웨어 엔지니어 이외의 역할을 수행하기를 원할 때 사용하세요.

프로젝트, 규칙, 코드베이스에 대한 지침은 대신 [CLAUDE.md](/memory)를 사용하세요.

## 기본 제공 출력 스타일

Claude Code의 **Default** 출력 스타일은 소프트웨어 엔지니어링 작업을 효율적으로 완료할 수 있도록 설계된 기존 시스템 프롬프트입니다.

코드베이스와 Claude의 작동 방식을 교육하는 데 중점을 둔 두 가지 추가 기본 제공 출력 스타일이 있습니다:

* **Explanatory**: 소프트웨어 엔지니어링 작업을 도와주는 동안 교육적인 "Insights"를 제공합니다. 구현 선택과 코드베이스 패턴을 이해하는 데 도움이 됩니다.

* **Learning**: Claude가 코딩하는 동안 "Insights"를 공유할 뿐만 아니라, 작은 전략적 코드 조각을 직접 작성하도록 요청하는 협업적인 실습 모드입니다. Claude Code는 사용자가 구현할 `TODO(human)` 마커를 코드에 추가합니다.

## 출력 스타일의 작동 방식

출력 스타일은 Claude Code의 시스템 프롬프트를 직접 수정합니다.

* 사용자 정의 출력 스타일은 `keep-coding-instructions`가 true가 아닌 한 코딩 관련 지침(예: 테스트로 코드 검증)을 제외합니다.
* 모든 출력 스타일에는 시스템 프롬프트 끝에 자체 사용자 정의 지침이 추가됩니다.
* 모든 출력 스타일은 대화 중 Claude가 출력 스타일 지침을 준수하도록 리마인더를 트리거합니다.

토큰 사용량은 스타일에 따라 다릅니다. 시스템 프롬프트에 지침을 추가하면 입력 토큰이 증가하지만, 프롬프트 캐싱으로 세션의 첫 번째 요청 이후에는 이 비용이 줄어듭니다. 기본 제공 Explanatory 및 Learning 스타일은 설계상 Default보다 더 긴 응답을 생성하여 출력 토큰이 증가합니다. 사용자 정의 스타일의 경우 출력 토큰 사용량은 지침에서 Claude에게 생성하라고 지시하는 내용에 따라 달라집니다.

## 출력 스타일 변경

`/config`를 실행하고 **Output style**을 선택하여 메뉴에서 스타일을 선택합니다. 선택 항목은 [로컬 프로젝트 수준](/settings)의 `.claude/settings.local.json`에 저장됩니다.

메뉴 없이 스타일을 설정하려면 설정 파일에서 `outputStyle` 필드를 직접 편집하세요:

```json
{
  "outputStyle": "Explanatory"
}
```

출력 스타일은 세션 시작 시 시스템 프롬프트에 설정되므로, 변경 사항은 다음에 새 세션을 시작할 때 적용됩니다. 이를 통해 대화 전체에서 시스템 프롬프트가 안정적으로 유지되어 프롬프트 캐싱이 지연 시간과 비용을 줄일 수 있습니다.

## 사용자 정의 출력 스타일 만들기

사용자 정의 출력 스타일은 frontmatter와 시스템 프롬프트에 추가될 텍스트가 포함된 Markdown 파일입니다:

```markdown
---
name: My Custom Style
description:
  A brief description of what this style does, to be displayed to the user
---

# Custom Style Instructions

You are an interactive CLI tool that helps users with software engineering
tasks. [Your custom instructions here...]

## Specific Behaviors

[Define how the assistant should behave in this style...]
```

이 파일은 사용자 수준(`~/.claude/output-styles`) 또는 프로젝트 수준(`.claude/output-styles`)에 저장할 수 있습니다. [플러그인](/plugins-reference)도 `output-styles/` 디렉토리에 출력 스타일을 포함할 수 있습니다.

### Frontmatter

출력 스타일 파일은 메타데이터를 지정하기 위한 frontmatter를 지원합니다:

| Frontmatter                | 목적                                                                     | 기본값                 |
| :------------------------- | :----------------------------------------------------------------------- | :---------------------- |
| `name`                     | 파일 이름이 아닌 경우 출력 스타일의 이름                                      | 파일 이름에서 상속       |
| `description`              | `/config` 선택기에 표시되는 출력 스타일의 설명                                | 없음                    |
| `keep-coding-instructions` | Claude Code의 시스템 프롬프트에서 코딩 관련 부분을 유지할지 여부               | false                   |

## 관련 기능과의 비교

### Output Styles vs. CLAUDE.md vs. --append-system-prompt

출력 스타일은 소프트웨어 엔지니어링에 특화된 Claude Code의 기본 시스템 프롬프트 부분을 완전히 "비활성화"합니다. CLAUDE.md나 `--append-system-prompt`는 Claude Code의 기본 시스템 프롬프트를 편집하지 않습니다. CLAUDE.md는 Claude Code의 기본 시스템 프롬프트 *다음에* 사용자 메시지로 내용을 추가합니다. `--append-system-prompt`는 시스템 프롬프트에 내용을 추가합니다.

### Output Styles vs. [Agents](/sub-agents)

출력 스타일은 메인 에이전트 루프에 직접 영향을 미치며 시스템 프롬프트에만 영향을 줍니다. Agents는 특정 작업을 처리하기 위해 호출되며, 사용할 모델, 사용 가능한 도구, 에이전트를 사용할 시점에 대한 컨텍스트와 같은 추가 설정을 포함할 수 있습니다.

### Output Styles vs. [Skills](/skills)

출력 스타일은 Claude가 응답하는 방식(형식, 톤, 구조)을 수정하며 한 번 선택하면 항상 활성 상태입니다. Skills는 `/skill-name`으로 호출하거나 관련성이 있을 때 Claude가 자동으로 로드하는 작업별 프롬프트입니다. 일관된 형식 기본 설정에는 출력 스타일을, 재사용 가능한 워크플로우와 작업에는 Skills를 사용하세요.
