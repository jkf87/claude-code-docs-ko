---
title: Ultraplan으로 클라우드에서 계획 수립
description: CLI에서 계획을 시작하고, 웹의 Claude Code에서 초안을 작성한 뒤 원격 또는 터미널에서 실행하세요
---

# Ultraplan으로 클라우드에서 계획 수립

> CLI에서 계획을 시작하고, 웹의 Claude Code에서 초안을 작성한 뒤 원격 또는 터미널에서 실행하세요

:::info
Ultraplan은 리서치 프리뷰 단계이며 Claude Code v2.1.91 이상이 필요합니다. 피드백에 따라 동작과 기능이 변경될 수 있습니다.
:::

Ultraplan은 로컬 CLI의 계획 작업을 [plan mode](/permission-modes#analyze-before-you-edit-with-plan-mode)로 실행되는 [웹의 Claude Code](/claude-code-on-the-web) 세션에 넘깁니다. Claude가 클라우드에서 계획 초안을 작성하는 동안 터미널에서는 다른 작업을 계속할 수 있습니다. 계획이 완성되면 브라우저에서 열어 특정 섹션에 댓글을 달고, 수정을 요청하고, 어디서 실행할지 선택할 수 있습니다.

터미널이 제공하는 것보다 더 풍부한 검토 환경을 원할 때 유용합니다.

* **대상 피드백**: 전체 계획 대신 개별 섹션에 댓글을 달 수 있습니다
* **방해 없는 초안 작성**: 계획이 원격으로 생성되므로 터미널은 다른 작업에 자유롭게 사용할 수 있습니다
* **유연한 실행**: 계획을 승인해 웹에서 실행하고 pull request를 열거나, 터미널로 다시 보낼 수 있습니다

Ultraplan을 사용하려면 [웹의 Claude Code](/claude-code-on-the-web) 계정과 GitHub 저장소가 필요합니다. Anthropic의 클라우드 인프라에서 실행되므로 Amazon Bedrock, Google Cloud Vertex AI, Microsoft Foundry를 사용할 때는 이용할 수 없습니다. 클라우드 세션은 계정의 기본 [클라우드 환경](/claude-code-on-the-web#the-cloud-environment)에서 실행됩니다. 클라우드 환경이 아직 없다면 ultraplan이 처음 실행될 때 자동으로 생성합니다.

## CLI에서 ultraplan 실행

로컬 CLI 세션에서 ultraplan을 실행하는 방법은 세 가지입니다.

* **명령어**: `/ultraplan` 뒤에 프롬프트를 입력합니다
* **키워드**: 일반 프롬프트 어디에나 `ultraplan`이라는 단어를 포함합니다
* **로컬 계획에서**: Claude가 로컬 계획을 완료하고 승인 대화상자를 표시할 때 **No, refine with Ultraplan on Claude Code on the web**을 선택하면 초안을 클라우드로 보내 추가 반복 작업을 할 수 있습니다

예를 들어 명령어로 서비스 마이그레이션 계획을 수립하려면:

```
/ultraplan migrate the auth service from sessions to JWTs
```

명령어 및 키워드 방식은 실행 전에 확인 대화상자를 표시합니다. 로컬 계획 방식은 이미 해당 선택이 확인의 역할을 하므로 이 대화상자를 건너뜁니다. [Remote Control](/remote-control)이 활성화된 경우 ultraplan이 시작될 때 연결이 끊어집니다. 두 기능이 모두 claude.ai/code 인터페이스를 사용하며 동시에 하나만 연결할 수 있기 때문입니다.

클라우드 세션이 시작된 후 CLI의 프롬프트 입력란에는 원격 세션이 작동하는 동안 상태 표시가 나타납니다.

| 상태                              | 의미                                                            |
| :-------------------------------- | :-------------------------------------------------------------- |
| `◇ ultraplan`                    | Claude가 코드베이스를 조사하고 계획 초안을 작성 중입니다        |
| `◇ ultraplan needs your input`   | Claude에게 확인이 필요한 질문이 있습니다. 세션 링크를 열어 응답하세요 |
| `◆ ultraplan ready`              | 계획이 완성되어 브라우저에서 검토할 수 있습니다                  |

`/tasks`를 실행하고 ultraplan 항목을 선택하면 세션 링크, 에이전트 활동, **Stop ultraplan** 작업이 포함된 상세 보기가 열립니다. 중지하면 클라우드 세션이 보관되고 표시가 지워집니다. 터미널에는 아무것도 저장되지 않습니다.

## 브라우저에서 계획 검토 및 수정

상태가 `◆ ultraplan ready`로 바뀌면 세션 링크를 열어 claude.ai에서 계획을 확인합니다. 계획은 전용 검토 화면에 표시됩니다.

* **인라인 댓글**: 텍스트를 선택하고 Claude가 처리할 댓글을 남길 수 있습니다
* **이모지 반응**: 전체 댓글을 작성하지 않고 섹션에 반응을 달아 승인이나 우려를 표시할 수 있습니다
* **개요 사이드바**: 계획의 각 섹션으로 바로 이동할 수 있습니다

Claude에게 댓글을 처리하도록 요청하면 계획을 수정하고 업데이트된 초안을 제시합니다. 실행 위치를 선택하기 전까지 필요한 만큼 반복할 수 있습니다.

## 실행 위치 선택

계획이 완성되면 브라우저에서 Claude가 같은 클라우드 세션에서 구현할지, 대기 중인 터미널로 다시 보낼지 선택합니다.

### 웹에서 실행

브라우저에서 **Approve Claude's plan and start coding**을 선택하면 Claude가 같은 Claude Code on the web 세션에서 계획을 구현합니다. 터미널에 확인 메시지가 표시되고 상태 표시가 사라지며 작업이 클라우드에서 계속됩니다. 구현이 완료되면 [diff를 검토](/claude-code-on-the-web#review-changes)하고 웹 인터페이스에서 pull request를 생성합니다.

### 터미널로 계획 되돌리기

브라우저에서 **Approve plan and teleport back to terminal**을 선택하면 전체 환경에 접근할 수 있는 로컬에서 계획을 구현합니다. 이 옵션은 CLI에서 세션을 실행했고 터미널이 여전히 폴링 중일 때 표시됩니다. 병렬로 작업이 계속되지 않도록 웹 세션은 보관됩니다.

터미널에 **Ultraplan approved**라는 제목의 대화상자와 함께 세 가지 옵션이 표시됩니다.

* **Implement here**: 계획을 현재 대화에 주입하고 중단된 곳에서 계속합니다
* **Start new session**: 현재 대화를 지우고 계획만 컨텍스트로 삼아 새로 시작합니다
* **Cancel**: 실행하지 않고 계획을 파일로 저장합니다. Claude가 나중에 돌아올 수 있도록 파일 경로를 출력합니다

새 세션을 시작하면 Claude가 상단에 `claude --resume` 명령어를 출력하여 이전 대화로 돌아올 수 있게 합니다.

## 관련 자료

* [웹의 Claude Code](/claude-code-on-the-web): ultraplan이 실행되는 클라우드 인프라
* [Plan mode](/permission-modes#analyze-before-you-edit-with-plan-mode): 로컬 세션에서 계획이 동작하는 방식
* [Remote Control](/remote-control): 자신의 머신에서 실행 중인 세션에 claude.ai/code 인터페이스를 사용하는 방법
