---
title: Agent SDK 레퍼런스 - TypeScript
description: TypeScript Agent SDK의 전체 API 레퍼런스. 모든 함수, 타입, 인터페이스를 포함합니다.
---

# Agent SDK 레퍼런스 - TypeScript

> TypeScript Agent SDK의 전체 API 레퍼런스. 모든 함수, 타입, 인터페이스를 포함합니다.

::: info
**새로운 V2 인터페이스를 사용해 보세요 (미리보기):** 멀티턴 대화를 더 쉽게 구현할 수 있는 `send()`와 `stream()` 패턴의 간소화된 인터페이스가 제공됩니다. [TypeScript V2 미리보기에 대해 더 알아보기](/agent-sdk/typescript-v2-preview)
:::

## 설치

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## 함수

### `query()`

Claude Code와 상호작용하는 기본 함수입니다. 메시지가 도착하는 대로 스트리밍하는 비동기 제너레이터를 생성합니다.

```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;
```

#### 파라미터

| 파라미터  | 타입                                                              | 설명                                                              |
| :-------- | :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `prompt`  | `string \| AsyncIterable<`[`SDKUserMessage`](#sdkuser-message)`>` | 문자열 또는 스트리밍 모드용 비동기 이터러블로 전달하는 입력 프롬프트 |
| `options` | [`Options`](#options)                                             | 선택적 설정 객체 (아래 Options 타입 참고)                          |

#### 반환값

`AsyncGenerator<`[`SDKMessage`](#sdk-message)`, void>`를 확장하고 추가 메서드를 제공하는 [`Query`](#query-object) 객체를 반환합니다.

### `tool()`

SDK MCP 서버에서 사용할 타입 안전한 MCP 툴 정의를 생성합니다.

```typescript
function tool<Schema extends AnyZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  handler: (args: InferShape<Schema>, extra: unknown) => Promise<CallToolResult>,
  extras?: { annotations?: ToolAnnotations }
): SdkMcpToolDefinition<Schema>;
```

#### 파라미터

| 파라미터      | 타입                                                                | 설명                                                                     |
| :------------ | :------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `name`        | `string`                                                            | 툴 이름                                                                  |
| `description` | `string`                                                            | 툴의 동작에 대한 설명                                                    |
| `inputSchema` | `Schema extends AnyZodRawShape`                                     | 툴 입력 파라미터를 정의하는 Zod 스키마 (Zod 3과 Zod 4 모두 지원)        |
| `handler`     | `(args, extra) => Promise<`[`CallToolResult`](#call-tool-result)`>` | 툴 로직을 실행하는 비동기 함수                                           |
| `extras`      | `{ annotations?: `[`ToolAnnotations`](#tool-annotations)` }`        | 클라이언트에 동작 힌트를 제공하는 선택적 MCP 툴 어노테이션              |

#### `ToolAnnotations`

`@modelcontextprotocol/sdk/types.js`에서 재내보내기(re-export)됩니다. 모든 필드는 선택적 힌트이며, 클라이언트는 보안 결정에 이를 의존해선 안 됩니다.

| 필드              | 타입      | 기본값      | 설명                                                                                                                                                |
| :---------------- | :-------- | :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`           | `string`  | `undefined` | 사람이 읽을 수 있는 툴 제목                                                                                                                         |
| `readOnlyHint`    | `boolean` | `false`     | `true`이면 툴이 환경을 수정하지 않음                                                                                                                |
| `destructiveHint` | `boolean` | `true`      | `true`이면 툴이 파괴적인 업데이트를 수행할 수 있음 (`readOnlyHint`가 `false`일 때만 의미 있음)                                                      |
| `idempotentHint`  | `boolean` | `false`     | `true`이면 동일한 인수로 반복 호출해도 추가 효과가 없음 (`readOnlyHint`가 `false`일 때만 의미 있음)                                                 |
| `openWorldHint`   | `boolean` | `true`      | `true`이면 툴이 외부 엔터티(예: 웹 검색)와 상호작용함. `false`이면 툴의 도메인이 닫혀 있음 (예: 메모리 툴)                                          |

```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const searchTool = tool(
  "search",
  "Search the web",
  { query: z.string() },
  async ({ query }) => {
    return { content: [{ type: "text", text: `Results for: ${query}` }] };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```

### `createSdkMcpServer()`

애플리케이션과 동일한 프로세스에서 실행되는 MCP 서버 인스턴스를 생성합니다.

```typescript
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance;
```

#### 파라미터

| 파라미터          | 타입                          | 설명                                                      |
| :---------------- | :---------------------------- | :-------------------------------------------------------- |
| `options.name`    | `string`                      | MCP 서버 이름                                             |
| `options.version` | `string`                      | 선택적 버전 문자열                                        |
| `options.tools`   | `Array<SdkMcpToolDefinition>` | [`tool()`](#tool)로 생성된 툴 정의 배열                   |

### `listSessions()`

가벼운 메타데이터와 함께 과거 세션을 검색하고 나열합니다. 프로젝트 디렉토리별로 필터링하거나 모든 프로젝트에 걸쳐 세션을 나열할 수 있습니다.

```typescript
function listSessions(options?: ListSessionsOptions): Promise<SDKSessionInfo[]>;
```

#### 파라미터

| 파라미터                   | 타입      | 기본값      | 설명                                                                           |
| :------------------------- | :-------- | :---------- | :----------------------------------------------------------------------------- |
| `options.dir`              | `string`  | `undefined` | 세션을 나열할 디렉토리. 생략하면 모든 프로젝트의 세션을 반환                  |
| `options.limit`            | `number`  | `undefined` | 반환할 최대 세션 수                                                            |
| `options.includeWorktrees` | `boolean` | `true`      | `dir`이 git 저장소 내부에 있을 때, 모든 worktree 경로의 세션도 포함           |

#### 반환 타입: `SDKSessionInfo`

| 속성           | 타입                  | 설명                                                                        |
| :------------- | :-------------------- | :-------------------------------------------------------------------------- |
| `sessionId`    | `string`              | 고유 세션 식별자 (UUID)                                                     |
| `summary`      | `string`              | 표시 제목: 커스텀 제목, 자동 생성 요약, 또는 첫 번째 프롬프트               |
| `lastModified` | `number`              | epoch 이후 밀리초 단위의 마지막 수정 시간                                   |
| `fileSize`     | `number \| undefined` | 세션 파일 크기(바이트). 로컬 JSONL 저장소에서만 값이 채워짐                 |
| `customTitle`  | `string \| undefined` | 사용자가 설정한 세션 제목 (`/rename` 명령으로 설정)                         |
| `firstPrompt`  | `string \| undefined` | 세션에서 처음으로 의미 있는 사용자 프롬프트                                 |
| `gitBranch`    | `string \| undefined` | 세션 종료 시점의 Git 브랜치                                                 |
| `cwd`          | `string \| undefined` | 세션의 작업 디렉토리                                                        |
| `tag`          | `string \| undefined` | 사용자가 설정한 세션 태그 ([`tagSession()`](#tag-session) 참고)             |
| `createdAt`    | `number \| undefined` | epoch 이후 밀리초 단위의 생성 시간. 첫 번째 항목의 타임스탬프에서 가져옴   |

#### 예시

프로젝트의 가장 최근 세션 10개를 출력합니다. 결과는 `lastModified` 내림차순으로 정렬되므로 첫 번째 항목이 가장 최신입니다. `dir`을 생략하면 모든 프로젝트에서 검색합니다.

```typescript
import { listSessions } from "@anthropic-ai/claude-agent-sdk";

const sessions = await listSessions({ dir: "/path/to/project", limit: 10 });

for (const session of sessions) {
  console.log(`${session.summary} (${session.sessionId})`);
}
```

### `getSessionMessages()`

과거 세션 트랜스크립트에서 사용자 및 어시스턴트 메시지를 읽어옵니다.

```typescript
function getSessionMessages(
  sessionId: string,
  options?: GetSessionMessagesOptions
): Promise<SessionMessage[]>;
```

#### 파라미터

| 파라미터         | 타입     | 기본값      | 설명                                                                    |
| :--------------- | :------- | :---------- | :---------------------------------------------------------------------- |
| `sessionId`      | `string` | 필수        | 읽어올 세션 UUID (`listSessions()` 참고)                                |
| `options.dir`    | `string` | `undefined` | 세션을 찾을 프로젝트 디렉토리. 생략하면 모든 프로젝트에서 검색          |
| `options.limit`  | `number` | `undefined` | 반환할 최대 메시지 수                                                   |
| `options.offset` | `number` | `undefined` | 처음부터 건너뛸 메시지 수                                               |

#### 반환 타입: `SessionMessage`

| 속성                 | 타입                    | 설명                                      |
| :------------------- | :---------------------- | :---------------------------------------- |
| `type`               | `"user" \| "assistant"` | 메시지 역할                               |
| `uuid`               | `string`                | 고유 메시지 식별자                        |
| `session_id`         | `string`                | 이 메시지가 속한 세션                     |
| `message`            | `unknown`               | 트랜스크립트의 원시 메시지 페이로드       |
| `parent_tool_use_id` | `null`                  | 예약됨                                    |

#### 예시

```typescript
import { listSessions, getSessionMessages } from "@anthropic-ai/claude-agent-sdk";

const [latest] = await listSessions({ dir: "/path/to/project", limit: 1 });

if (latest) {
  const messages = await getSessionMessages(latest.sessionId, {
    dir: "/path/to/project",
    limit: 20
  });

  for (const msg of messages) {
    console.log(`[${msg.type}] ${msg.uuid}`);
  }
}
```

### `getSessionInfo()`

전체 프로젝트 디렉토리를 스캔하지 않고 ID로 단일 세션의 메타데이터를 읽어옵니다.

```typescript
function getSessionInfo(
  sessionId: string,
  options?: GetSessionInfoOptions
): Promise<SDKSessionInfo | undefined>;
```

#### 파라미터

| 파라미터      | 타입     | 기본값      | 설명                                                               |
| :------------ | :------- | :---------- | :----------------------------------------------------------------- |
| `sessionId`   | `string` | 필수        | 조회할 세션의 UUID                                                 |
| `options.dir` | `string` | `undefined` | 프로젝트 디렉토리 경로. 생략하면 모든 프로젝트 디렉토리에서 검색  |

세션을 찾으면 [`SDKSessionInfo`](#return-type-sdk-session-info)를 반환하고, 찾지 못하면 `undefined`를 반환합니다.

### `renameSession()`

커스텀 제목 항목을 추가하여 세션 이름을 변경합니다. 반복 호출해도 안전하며, 가장 최근 제목이 적용됩니다.

```typescript
function renameSession(
  sessionId: string,
  title: string,
  options?: SessionMutationOptions
): Promise<void>;
```

#### 파라미터

| 파라미터      | 타입     | 기본값      | 설명                                                               |
| :------------ | :------- | :---------- | :----------------------------------------------------------------- |
| `sessionId`   | `string` | 필수        | 이름을 변경할 세션의 UUID                                          |
| `title`       | `string` | 필수        | 새 제목. 공백 제거 후 비어 있지 않아야 함                          |
| `options.dir` | `string` | `undefined` | 프로젝트 디렉토리 경로. 생략하면 모든 프로젝트 디렉토리에서 검색  |

### `tagSession()`

세션에 태그를 붙입니다. `null`을 전달하면 태그가 제거됩니다. 반복 호출해도 안전하며, 가장 최근 태그가 적용됩니다.

```typescript
function tagSession(
  sessionId: string,
  tag: string | null,
  options?: SessionMutationOptions
): Promise<void>;
```

#### 파라미터

| 파라미터      | 타입             | 기본값      | 설명                                                               |
| :------------ | :--------------- | :---------- | :----------------------------------------------------------------- |
| `sessionId`   | `string`         | 필수        | 태그를 붙일 세션의 UUID                                            |
| `tag`         | `string \| null` | 필수        | 태그 문자열, 또는 태그를 제거하려면 `null`                         |
| `options.dir` | `string`         | `undefined` | 프로젝트 디렉토리 경로. 생략하면 모든 프로젝트 디렉토리에서 검색  |

## 타입

### `Options`

`query()` 함수의 설정 객체입니다.

| 속성                              | 타입                                                                                                 | 기본값                                      | 설명                                                                                                                                                                                                                                                               |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------- | :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abortController`                 | `AbortController`                                                                                    | `new AbortController()`                     | 작업 취소를 위한 컨트롤러                                                                                                                                                                                                                                          |
| `additionalDirectories`           | `string[]`                                                                                           | `[]`                                        | Claude가 접근할 수 있는 추가 디렉토리                                                                                                                                                                                                                              |
| `agent`                           | `string`                                                                                             | `undefined`                                 | 메인 스레드의 에이전트 이름. `agents` 옵션이나 설정에 정의된 에이전트여야 함                                                                                                                                                                                       |
| `agents`                          | `Record<string, [`AgentDefinition`](#agent-definition)>`                                             | `undefined`                                 | 프로그래밍 방식으로 서브에이전트를 정의                                                                                                                                                                                                                            |
| `allowDangerouslySkipPermissions` | `boolean`                                                                                            | `false`                                     | 권한 우회 활성화. `permissionMode: 'bypassPermissions'` 사용 시 필수                                                                                                                                                                                               |
| `allowedTools`                    | `string[]`                                                                                           | `[]`                                        | 프롬프트 없이 자동 승인할 툴 목록. Claude가 이 툴들만 사용하도록 제한하지 않음. 목록에 없는 툴은 `permissionMode`와 `canUseTool`로 처리됨. 툴을 차단하려면 `disallowedTools` 사용. [권한](/agent-sdk/permissions#allow-and-deny-rules) 참고                         |
| `betas`                           | [`SdkBeta`](#sdk-beta)`[]`                                                                           | `[]`                                        | 베타 기능 활성화                                                                                                                                                                                                                                                   |
| `canUseTool`                      | [`CanUseTool`](#can-use-tool)                                                                        | `undefined`                                 | 툴 사용 제어를 위한 커스텀 권한 함수                                                                                                                                                                                                                               |
| `continue`                        | `boolean`                                                                                            | `false`                                     | 가장 최근 대화를 이어서 진행                                                                                                                                                                                                                                       |
| `cwd`                             | `string`                                                                                             | `process.cwd()`                             | 현재 작업 디렉토리                                                                                                                                                                                                                                                 |
| `debug`                           | `boolean`                                                                                            | `false`                                     | Claude Code 프로세스의 디버그 모드 활성화                                                                                                                                                                                                                          |
| `debugFile`                       | `string`                                                                                             | `undefined`                                 | 디버그 로그를 특정 파일 경로에 기록. 디버그 모드를 암묵적으로 활성화                                                                                                                                                                                               |
| `disallowedTools`                 | `string[]`                                                                                           | `[]`                                        | 항상 거부할 툴 목록. 거부 규칙이 먼저 확인되며 `allowedTools`와 `permissionMode`(`bypassPermissions` 포함)를 재정의함                                                                                                                                               |
| `effort`                          | `'low' \| 'medium' \| 'high' \| 'max'`                                                               | `'high'`                                    | Claude가 응답에 얼마나 많은 노력을 기울일지 제어. 적응형 사고(adaptive thinking)와 함께 작동하여 사고 깊이를 안내                                                                                                                                                   |
| `enableFileCheckpointing`         | `boolean`                                                                                            | `false`                                     | 되감기(rewinding)를 위한 파일 변경 추적 활성화. [파일 체크포인팅](/agent-sdk/file-checkpointing) 참고                                                                                                                                                              |
| `env`                             | `Record<string, string \| undefined>`                                                                | `process.env`                               | 환경 변수. `CLAUDE_AGENT_SDK_CLIENT_APP`을 설정하여 User-Agent 헤더에 앱을 식별                                                                                                                                                                                    |
| `executable`                      | `'bun' \| 'deno' \| 'node'`                                                                          | 자동 감지                                   | 사용할 JavaScript 런타임                                                                                                                                                                                                                                           |
| `executableArgs`                  | `string[]`                                                                                           | `[]`                                        | 실행 파일에 전달할 인수                                                                                                                                                                                                                                            |
| `extraArgs`                       | `Record<string, string \| null>`                                                                     | `{}`                                        | 추가 인수                                                                                                                                                                                                                                                          |
| `fallbackModel`                   | `string`                                                                                             | `undefined`                                 | 기본 모델 실패 시 사용할 모델                                                                                                                                                                                                                                      |
| `forkSession`                     | `boolean`                                                                                            | `false`                                     | `resume`으로 재개할 때 원래 세션을 이어가는 대신 새 세션 ID로 분기                                                                                                                                                                                                 |
| `hooks`                           | `Partial<Record<`[`HookEvent`](#hook-event)`, `[`HookCallbackMatcher`](#hook-callback-matcher)`[]>>` | `{}`                                        | 이벤트에 대한 훅 콜백                                                                                                                                                                                                                                              |
| `includePartialMessages`          | `boolean`                                                                                            | `false`                                     | 부분 메시지 이벤트 포함                                                                                                                                                                                                                                            |
| `maxBudgetUsd`                    | `number`                                                                                             | `undefined`                                 | 쿼리의 최대 예산 (USD)                                                                                                                                                                                                                                             |
| `maxThinkingTokens`               | `number`                                                                                             | `undefined`                                 | *사용 중단:* 대신 `thinking`을 사용하세요. 사고 프로세스의 최대 토큰 수                                                                                                                                                                                            |
| `maxTurns`                        | `number`                                                                                             | `undefined`                                 | 최대 에이전트 턴 수 (툴 사용 왕복 횟수)                                                                                                                                                                                                                            |
| `mcpServers`                      | `Record<string, [`McpServerConfig`](#mcp-server-config)>`                                            | `{}`                                        | MCP 서버 설정                                                                                                                                                                                                                                                      |
| `model`                           | `string`                                                                                             | CLI 기본값                                  | 사용할 Claude 모델                                                                                                                                                                                                                                                 |
| `outputFormat`                    | `{ type: 'json_schema', schema: JSONSchema }`                                                        | `undefined`                                 | 에이전트 결과의 출력 형식 정의. 자세한 내용은 [구조화된 출력](/agent-sdk/structured-outputs) 참고                                                                                                                                                                  |
| `pathToClaudeCodeExecutable`      | `string`                                                                                             | 내장 실행 파일 사용                         | Claude Code 실행 파일 경로                                                                                                                                                                                                                                         |
| `permissionMode`                  | [`PermissionMode`](#permission-mode)                                                                 | `'default'`                                 | 세션의 권한 모드                                                                                                                                                                                                                                                   |
| `permissionPromptToolName`        | `string`                                                                                             | `undefined`                                 | 권한 프롬프트를 위한 MCP 툴 이름                                                                                                                                                                                                                                   |
| `persistSession`                  | `boolean`                                                                                            | `true`                                      | `false`이면 디스크에 세션을 저장하지 않음. 세션을 나중에 재개할 수 없음                                                                                                                                                                                            |
| `plugins`                         | [`SdkPluginConfig`](#sdk-plugin-config)`[]`                                                          | `[]`                                        | 로컬 경로에서 커스텀 플러그인 로드. 자세한 내용은 [플러그인](/agent-sdk/plugins) 참고                                                                                                                                                                              |
| `promptSuggestions`               | `boolean`                                                                                            | `false`                                     | 프롬프트 제안 활성화. 각 턴 후 예측된 다음 사용자 프롬프트와 함께 `prompt_suggestion` 메시지를 내보냄                                                                                                                                                              |
| `resume`                          | `string`                                                                                             | `undefined`                                 | 재개할 세션 ID                                                                                                                                                                                                                                                     |
| `resumeSessionAt`                 | `string`                                                                                             | `undefined`                                 | 특정 메시지 UUID에서 세션 재개                                                                                                                                                                                                                                     |
| `sandbox`                         | [`SandboxSettings`](#sandbox-settings)                                                               | `undefined`                                 | 프로그래밍 방식으로 샌드박스 동작 설정. 자세한 내용은 [샌드박스 설정](#sandbox-settings) 참고                                                                                                                                                                      |
| `sessionId`                       | `string`                                                                                             | 자동 생성                                   | 자동 생성 대신 세션에 특정 UUID 사용                                                                                                                                                                                                                               |
| `settingSources`                  | [`SettingSource`](#setting-source)`[]`                                                               | `[]` (설정 없음)                            | 로드할 파일시스템 설정 소스 제어. 생략하면 파일시스템 설정을 로드하지 않음. **참고:** CLAUDE.md 파일을 로드하려면 `'project'`를 포함해야 함                                                                                                                        |
| `spawnClaudeCodeProcess`          | `(options: SpawnOptions) => SpawnedProcess`                                                          | `undefined`                                 | Claude Code 프로세스를 생성하는 커스텀 함수. VM, 컨테이너, 원격 환경에서 Claude Code를 실행할 때 사용                                                                                                                                                              |
| `stderr`                          | `(data: string) => void`                                                                             | `undefined`                                 | stderr 출력에 대한 콜백                                                                                                                                                                                                                                            |
| `strictMcpConfig`                 | `boolean`                                                                                            | `false`                                     | 엄격한 MCP 유효성 검사 적용                                                                                                                                                                                                                                        |
| `systemPrompt`                    | `string \| { type: 'preset'; preset: 'claude_code'; append?: string }`                               | `undefined` (최소 프롬프트)                 | 시스템 프롬프트 설정. 커스텀 프롬프트는 문자열로 전달하고, Claude Code의 시스템 프롬프트를 사용하려면 `{ type: 'preset', preset: 'claude_code' }`를 사용. 프리셋 객체 형식에서 `append`를 추가하면 추가 지침으로 시스템 프롬프트를 확장할 수 있음                   |
| `thinking`                        | [`ThinkingConfig`](#thinking-config)                                                                 | 지원되는 모델의 경우 `{ type: 'adaptive' }` | Claude의 사고/추론 동작을 제어. 옵션은 [`ThinkingConfig`](#thinking-config) 참고                                                                                                                                                                                   |
| `toolConfig`                      | [`ToolConfig`](#tool-config)                                                                         | `undefined`                                 | 내장 툴 동작 설정. 자세한 내용은 [`ToolConfig`](#tool-config) 참고                                                                                                                                                                                                 |
| `tools`                           | `string[] \| { type: 'preset'; preset: 'claude_code' }`                                              | `undefined`                                 | 툴 설정. 툴 이름 배열을 전달하거나 프리셋을 사용하여 Claude Code의 기본 툴을 가져옴                                                                                                                                                                                |

### `Query` 객체

`query()` 함수가 반환하는 인터페이스입니다.

```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  rewindFiles(
    userMessageId: string,
    options?: { dryRun?: boolean }
  ): Promise<RewindFilesResult>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;
  initializationResult(): Promise<SDKControlInitializeResponse>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  supportedAgents(): Promise<AgentInfo[]>;
  mcpServerStatus(): Promise<McpServerStatus[]>;
  accountInfo(): Promise<AccountInfo>;
  reconnectMcpServer(serverName: string): Promise<void>;
  toggleMcpServer(serverName: string, enabled: boolean): Promise<void>;
  setMcpServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult>;
  streamInput(stream: AsyncIterable<SDKUserMessage>): Promise<void>;
  stopTask(taskId: string): Promise<void>;
  close(): void;
}
```

#### 메서드

| 메서드                                 | 설명                                                                                                                                                                                        |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `interrupt()`                          | 쿼리를 중단합니다 (스트리밍 입력 모드에서만 사용 가능)                                                                                                                                      |
| `rewindFiles(userMessageId, options?)` | 지정한 사용자 메시지 시점으로 파일을 복원합니다. `{ dryRun: true }`를 전달하면 변경 사항을 미리 볼 수 있음. `enableFileCheckpointing: true` 필요. [파일 체크포인팅](/agent-sdk/file-checkpointing) 참고 |
| `setPermissionMode()`                  | 권한 모드를 변경합니다 (스트리밍 입력 모드에서만 사용 가능)                                                                                                                                 |
| `setModel()`                           | 모델을 변경합니다 (스트리밍 입력 모드에서만 사용 가능)                                                                                                                                      |
| `setMaxThinkingTokens()`               | *사용 중단:* 대신 `thinking` 옵션을 사용하세요. 최대 사고 토큰 수를 변경합니다                                                                                                              |
| `initializationResult()`               | 지원되는 명령어, 모델, 계정 정보, 출력 스타일 설정을 포함한 전체 초기화 결과를 반환합니다                                                                                                   |
| `supportedCommands()`                  | 사용 가능한 슬래시 명령어를 반환합니다                                                                                                                                                      |
| `supportedModels()`                    | 표시 정보와 함께 사용 가능한 모델을 반환합니다                                                                                                                                              |
| `supportedAgents()`                    | 사용 가능한 서브에이전트를 [`AgentInfo`](#agent-info)`[]`로 반환합니다                                                                                                                      |
| `mcpServerStatus()`                    | 연결된 MCP 서버의 상태를 반환합니다                                                                                                                                                         |
| `accountInfo()`                        | 계정 정보를 반환합니다                                                                                                                                                                      |
| `reconnectMcpServer(serverName)`       | 이름으로 MCP 서버에 재연결합니다                                                                                                                                                            |
| `toggleMcpServer(serverName, enabled)` | 이름으로 MCP 서버를 활성화하거나 비활성화합니다                                                                                                                                             |
| `setMcpServers(servers)`               | 이 세션의 MCP 서버 세트를 동적으로 교체합니다. 추가, 제거된 서버와 오류 정보를 반환합니다                                                                                                   |
| `streamInput(stream)`                  | 멀티턴 대화를 위해 쿼리에 입력 메시지를 스트리밍합니다                                                                                                                                      |
| `stopTask(taskId)`                     | ID로 실행 중인 백그라운드 작업을 중지합니다                                                                                                                                                 |
| `close()`                              | 쿼리를 닫고 기반 프로세스를 종료합니다. 쿼리를 강제로 종료하고 모든 리소스를 정리합니다                                                                                                     |

### `SDKControlInitializeResponse`

`initializationResult()`의 반환 타입. 세션 초기화 데이터를 포함합니다.

```typescript
type SDKControlInitializeResponse = {
  commands: SlashCommand[];
  agents: AgentInfo[];
  output_style: string;
  available_output_styles: string[];
  models: ModelInfo[];
  account: AccountInfo;
  fast_mode_state?: "off" | "cooldown" | "on";
};
```

### `AgentDefinition`

프로그래밍 방식으로 정의된 서브에이전트의 설정입니다.

```typescript
type AgentDefinition = {
  description: string;
  tools?: string[];
  disallowedTools?: string[];
  prompt: string;
  model?: "sonnet" | "opus" | "haiku" | "inherit";
  mcpServers?: AgentMcpServerSpec[];
  skills?: string[];
  maxTurns?: number;
  criticalSystemReminder_EXPERIMENTAL?: string;
};
```

| 필드                                  | 필수 여부 | 설명                                                                         |
| :------------------------------------ | :-------- | :--------------------------------------------------------------------------- |
| `description`                         | 필수      | 이 에이전트를 언제 사용할지에 대한 자연어 설명                               |
| `tools`                               | 선택      | 허용된 툴 이름 배열. 생략하면 부모로부터 모든 툴을 상속                      |
| `disallowedTools`                     | 선택      | 이 에이전트에서 명시적으로 비허용할 툴 이름 배열                             |
| `prompt`                              | 필수      | 에이전트의 시스템 프롬프트                                                   |
| `model`                               | 선택      | 이 에이전트의 모델 재정의. 생략하거나 `'inherit'`이면 메인 모델 사용         |
| `mcpServers`                          | 선택      | 이 에이전트의 MCP 서버 사양                                                  |
| `skills`                              | 선택      | 에이전트 컨텍스트에 사전 로드할 스킬 이름 배열                               |
| `maxTurns`                            | 선택      | 중지 전 최대 에이전트 턴 수 (API 왕복 횟수)                                  |
| `criticalSystemReminder_EXPERIMENTAL` | 선택      | 실험적: 시스템 프롬프트에 추가되는 중요 알림                                 |

### `AgentMcpServerSpec`

서브에이전트에서 사용할 MCP 서버를 지정합니다. 서버 이름(부모의 `mcpServers` 설정에서 서버를 참조하는 문자열) 또는 서버 이름을 설정에 매핑하는 인라인 서버 설정 레코드가 될 수 있습니다.

```typescript
type AgentMcpServerSpec = string | Record<string, McpServerConfigForProcessTransport>;
```

`McpServerConfigForProcessTransport`는 `McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfig`입니다.

### `SettingSource`

SDK가 로드할 파일시스템 기반 설정 소스를 제어합니다.

```typescript
type SettingSource = "user" | "project" | "local";
```

| 값          | 설명                                  | 위치                          |
| :---------- | :------------------------------------ | :---------------------------- |
| `'user'`    | 전역 사용자 설정                      | `~/.claude/settings.json`     |
| `'project'` | 공유 프로젝트 설정 (버전 관리됨)      | `.claude/settings.json`       |
| `'local'`   | 로컬 프로젝트 설정 (gitignore됨)      | `.claude/settings.local.json` |

#### 기본 동작

`settingSources`가 **생략**되거나 **undefined**이면, SDK는 파일시스템 설정을 **로드하지 않습니다**. 이는 SDK 애플리케이션의 격리성을 보장합니다.

#### settingSources를 사용하는 이유

**모든 파일시스템 설정 로드 (이전 동작):**

```typescript
// SDK v0.0.x처럼 모든 설정 로드
const result = query({
  prompt: "Analyze this code",
  options: {
    settingSources: ["user", "project", "local"] // 모든 설정 로드
  }
});
```

**특정 설정 소스만 로드:**

```typescript
// 프로젝트 설정만 로드, 사용자 및 로컬 설정 무시
const result = query({
  prompt: "Run CI checks",
  options: {
    settingSources: ["project"] // .claude/settings.json만
  }
});
```

**테스트 및 CI 환경:**

```typescript
// 로컬 설정을 제외하여 CI에서 일관된 동작 보장
const result = query({
  prompt: "Run tests",
  options: {
    settingSources: ["project"], // 팀 공유 설정만
    permissionMode: "bypassPermissions"
  }
});
```

**SDK 전용 애플리케이션:**

```typescript
// 모든 것을 프로그래밍 방식으로 정의 (기본 동작)
// 파일시스템 의존성 없음 - settingSources 기본값은 []
const result = query({
  prompt: "Review this PR",
  options: {
    // settingSources: [] 가 기본값이므로 지정할 필요 없음
    agents: {
      /* ... */
    },
    mcpServers: {
      /* ... */
    },
    allowedTools: ["Read", "Grep", "Glob"]
  }
});
```

**CLAUDE.md 프로젝트 지침 로드:**

```typescript
// CLAUDE.md 파일을 포함하기 위해 프로젝트 설정 로드
const result = query({
  prompt: "Add a new feature following project conventions",
  options: {
    systemPrompt: {
      type: "preset",
      preset: "claude_code" // CLAUDE.md 사용에 필요
    },
    settingSources: ["project"], // 프로젝트 디렉토리에서 CLAUDE.md 로드
    allowedTools: ["Read", "Write", "Edit"]
  }
});
```

#### 설정 우선순위

여러 소스가 로드되면, 다음 우선순위(높은 순)로 설정이 병합됩니다:

1. 로컬 설정 (`.claude/settings.local.json`)
2. 프로젝트 설정 (`.claude/settings.json`)
3. 사용자 설정 (`~/.claude/settings.json`)

프로그래밍 방식의 옵션(`agents`, `allowedTools` 등)은 항상 파일시스템 설정을 재정의합니다.

### `PermissionMode`

```typescript
type PermissionMode =
  | "default" // 표준 권한 동작
  | "acceptEdits" // 파일 편집 자동 수락
  | "bypassPermissions" // 모든 권한 검사 우회
  | "plan" // 계획 모드 - 실행 없음
  | "dontAsk" // 권한 프롬프트 없이, 사전 승인되지 않으면 거부
  | "auto"; // 모델 분류기로 각 툴 호출을 승인 또는 거부
```

### `CanUseTool`

툴 사용을 제어하는 커스텀 권한 함수 타입입니다.

```typescript
type CanUseTool = (
  toolName: string,
  input: Record<string, unknown>,
  options: {
    signal: AbortSignal;
    suggestions?: PermissionUpdate[];
    blockedPath?: string;
    decisionReason?: string;
    toolUseID: string;
    agentID?: string;
  }
) => Promise<PermissionResult>;
```

| 옵션             | 타입                                         | 설명                                                                       |
| :--------------- | :------------------------------------------- | :------------------------------------------------------------------------- |
| `signal`         | `AbortSignal`                                | 작업을 중단해야 할 때 시그널이 전달됨                                      |
| `suggestions`    | [`PermissionUpdate`](#permission-update)`[]` | 이 툴에 대해 다시 프롬프트하지 않도록 제안된 권한 업데이트                 |
| `blockedPath`    | `string`                                     | 권한 요청을 트리거한 파일 경로 (해당하는 경우)                             |
| `decisionReason` | `string`                                     | 이 권한 요청이 트리거된 이유를 설명                                        |
| `toolUseID`      | `string`                                     | 어시스턴트 메시지 내 이 특정 툴 호출의 고유 식별자                         |
| `agentID`        | `string`                                     | 서브에이전트 내에서 실행 중이면 해당 서브에이전트의 ID                     |

### `PermissionResult`

권한 검사 결과입니다.

```typescript
type PermissionResult =
  | {
      behavior: "allow";
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: PermissionUpdate[];
      toolUseID?: string;
    }
  | {
      behavior: "deny";
      message: string;
      interrupt?: boolean;
      toolUseID?: string;
    };
```

### `ToolConfig`

내장 툴 동작 설정입니다.

```typescript
type ToolConfig = {
  askUserQuestion?: {
    previewFormat?: "markdown" | "html";
  };
};
```

| 필드                            | 타입                   | 설명                                                                                                                                                                   |
| :------------------------------ | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `askUserQuestion.previewFormat` | `'markdown' \| 'html'` | [`AskUserQuestion`](/agent-sdk/user-input#question-format) 옵션의 `preview` 필드를 활성화하고 콘텐츠 형식을 설정. 미설정 시 Claude는 미리보기를 내보내지 않음         |

### `McpServerConfig`

MCP 서버 설정입니다.

```typescript
type McpServerConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfigWithInstance;
```

#### `McpStdioServerConfig`

```typescript
type McpStdioServerConfig = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
};
```

#### `McpSSEServerConfig`

```typescript
type McpSSEServerConfig = {
  type: "sse";
  url: string;
  headers?: Record<string, string>;
};
```

#### `McpHttpServerConfig`

```typescript
type McpHttpServerConfig = {
  type: "http";
  url: string;
  headers?: Record<string, string>;
};
```

#### `McpSdkServerConfigWithInstance`

```typescript
type McpSdkServerConfigWithInstance = {
  type: "sdk";
  name: string;
  instance: McpServer;
};
```

#### `McpClaudeAIProxyServerConfig`

```typescript
type McpClaudeAIProxyServerConfig = {
  type: "claudeai-proxy";
  url: string;
  id: string;
};
```

### `SdkPluginConfig`

SDK에서 플러그인을 로드하는 설정입니다.

```typescript
type SdkPluginConfig = {
  type: "local";
  path: string;
};
```

| 필드   | 타입      | 설명                                                       |
| :----- | :-------- | :--------------------------------------------------------- |
| `type` | `'local'` | `'local'`이어야 함 (현재 로컬 플러그인만 지원)             |
| `path` | `string`  | 플러그인 디렉토리의 절대 또는 상대 경로                    |

**예시:**

```typescript
plugins: [
  { type: "local", path: "./my-plugin" },
  { type: "local", path: "/absolute/path/to/plugin" }
];
```

플러그인 생성 및 사용에 대한 전체 정보는 [플러그인](/agent-sdk/plugins)을 참고하세요.

## 메시지 타입

### `SDKMessage`

쿼리가 반환하는 모든 가능한 메시지의 유니온 타입입니다.

```typescript
type SDKMessage =
  | SDKAssistantMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKResultMessage
  | SDKSystemMessage
  | SDKPartialAssistantMessage
  | SDKCompactBoundaryMessage
  | SDKStatusMessage
  | SDKLocalCommandOutputMessage
  | SDKHookStartedMessage
  | SDKHookProgressMessage
  | SDKHookResponseMessage
  | SDKToolProgressMessage
  | SDKAuthStatusMessage
  | SDKTaskNotificationMessage
  | SDKTaskStartedMessage
  | SDKTaskProgressMessage
  | SDKFilesPersistedEvent
  | SDKToolUseSummaryMessage
  | SDKRateLimitEvent
  | SDKPromptSuggestionMessage;
```

### `SDKAssistantMessage`

어시스턴트 응답 메시지입니다.

```typescript
type SDKAssistantMessage = {
  type: "assistant";
  uuid: UUID;
  session_id: string;
  message: BetaMessage; // Anthropic SDK에서
  parent_tool_use_id: string | null;
  error?: SDKAssistantMessageError;
};
```

`message` 필드는 Anthropic SDK의 [`BetaMessage`](https://platform.claude.com/docs/en/api/messages/create)입니다. `id`, `content`, `model`, `stop_reason`, `usage` 등의 필드를 포함합니다.

`SDKAssistantMessageError`는 다음 중 하나입니다: `'authentication_failed'`, `'billing_error'`, `'rate_limit'`, `'invalid_request'`, `'server_error'`, `'max_output_tokens'`, 또는 `'unknown'`.

### `SDKUserMessage`

사용자 입력 메시지입니다.

```typescript
type SDKUserMessage = {
  type: "user";
  uuid?: UUID;
  session_id: string;
  message: MessageParam; // Anthropic SDK에서
  parent_tool_use_id: string | null;
  isSynthetic?: boolean;
  tool_use_result?: unknown;
};
```

### `SDKUserMessageReplay`

UUID가 있는 재생된 사용자 메시지입니다.

```typescript
type SDKUserMessageReplay = {
  type: "user";
  uuid: UUID;
  session_id: string;
  message: MessageParam;
  parent_tool_use_id: string | null;
  isSynthetic?: boolean;
  tool_use_result?: unknown;
  isReplay: true;
};
```

### `SDKResultMessage`

최종 결과 메시지입니다.

```typescript
type SDKResultMessage =
  | {
      type: "result";
      subtype: "success";
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      result: string;
      stop_reason: string | null;
      total_cost_usd: number;
      usage: NonNullableUsage;
      modelUsage: { [modelName: string]: ModelUsage };
      permission_denials: SDKPermissionDenial[];
      structured_output?: unknown;
    }
  | {
      type: "result";
      subtype:
        | "error_max_turns"
        | "error_during_execution"
        | "error_max_budget_usd"
        | "error_max_structured_output_retries";
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      stop_reason: string | null;
      total_cost_usd: number;
      usage: NonNullableUsage;
      modelUsage: { [modelName: string]: ModelUsage };
      permission_denials: SDKPermissionDenial[];
      errors: string[];
    };
```

### `SDKSystemMessage`

시스템 초기화 메시지입니다.

```typescript
type SDKSystemMessage = {
  type: "system";
  subtype: "init";
  uuid: UUID;
  session_id: string;
  agents?: string[];
  apiKeySource: ApiKeySource;
  betas?: string[];
  claude_code_version: string;
  cwd: string;
  tools: string[];
  mcp_servers: {
    name: string;
    status: string;
  }[];
  model: string;
  permissionMode: PermissionMode;
  slash_commands: string[];
  output_style: string;
  skills: string[];
  plugins: { name: string; path: string }[];
};
```

### `SDKPartialAssistantMessage`

스트리밍 부분 메시지 (`includePartialMessages`가 true일 때만).

```typescript
type SDKPartialAssistantMessage = {
  type: "stream_event";
  event: BetaRawMessageStreamEvent; // Anthropic SDK에서
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
};
```

### `SDKCompactBoundaryMessage`

대화 압축(compaction) 경계를 나타내는 메시지입니다.

```typescript
type SDKCompactBoundaryMessage = {
  type: "system";
  subtype: "compact_boundary";
  uuid: UUID;
  session_id: string;
  compact_metadata: {
    trigger: "manual" | "auto";
    pre_tokens: number;
  };
};
```

### `SDKPermissionDenial`

거부된 툴 사용에 대한 정보입니다.

```typescript
type SDKPermissionDenial = {
  tool_name: string;
  tool_use_id: string;
  tool_input: Record<string, unknown>;
};
```

## 훅 타입

예시와 일반적인 패턴을 포함한 훅 사용에 대한 종합 가이드는 [훅 가이드](/agent-sdk/hooks)를 참고하세요.

### `HookEvent`

사용 가능한 훅 이벤트입니다.

```typescript
type HookEvent =
  | "PreToolUse"
  | "PostToolUse"
  | "PostToolUseFailure"
  | "Notification"
  | "UserPromptSubmit"
  | "SessionStart"
  | "SessionEnd"
  | "Stop"
  | "SubagentStart"
  | "SubagentStop"
  | "PreCompact"
  | "PermissionRequest"
  | "Setup"
  | "TeammateIdle"
  | "TaskCompleted"
  | "ConfigChange"
  | "WorktreeCreate"
  | "WorktreeRemove";
```

### `HookCallback`

훅 콜백 함수 타입입니다.

```typescript
type HookCallback = (
  input: HookInput, // 모든 훅 입력 타입의 유니온
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;
```

### `HookCallbackMatcher`

선택적 매처가 있는 훅 설정입니다.

```typescript
interface HookCallbackMatcher {
  matcher?: string;
  hooks: HookCallback[];
  timeout?: number; // 이 매처의 모든 훅에 대한 타임아웃 (초)
}
```

### `HookInput`

모든 훅 입력 타입의 유니온 타입입니다.

```typescript
type HookInput =
  | PreToolUseHookInput
  | PostToolUseHookInput
  | PostToolUseFailureHookInput
  | NotificationHookInput
  | UserPromptSubmitHookInput
  | SessionStartHookInput
  | SessionEndHookInput
  | StopHookInput
  | SubagentStartHookInput
  | SubagentStopHookInput
  | PreCompactHookInput
  | PermissionRequestHookInput
  | SetupHookInput
  | TeammateIdleHookInput
  | TaskCompletedHookInput
  | ConfigChangeHookInput
  | WorktreeCreateHookInput
  | WorktreeRemoveHookInput;
```

### `BaseHookInput`

모든 훅 입력 타입이 확장하는 기본 인터페이스입니다.

```typescript
type BaseHookInput = {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode?: string;
  agent_id?: string;
  agent_type?: string;
};
```

#### `PreToolUseHookInput`

```typescript
type PreToolUseHookInput = BaseHookInput & {
  hook_event_name: "PreToolUse";
  tool_name: string;
  tool_input: unknown;
  tool_use_id: string;
};
```

#### `PostToolUseHookInput`

```typescript
type PostToolUseHookInput = BaseHookInput & {
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: unknown;
  tool_response: unknown;
  tool_use_id: string;
};
```

#### `PostToolUseFailureHookInput`

```typescript
type PostToolUseFailureHookInput = BaseHookInput & {
  hook_event_name: "PostToolUseFailure";
  tool_name: string;
  tool_input: unknown;
  tool_use_id: string;
  error: string;
  is_interrupt?: boolean;
};
```

#### `NotificationHookInput`

```typescript
type NotificationHookInput = BaseHookInput & {
  hook_event_name: "Notification";
  message: string;
  title?: string;
  notification_type: string;
};
```

#### `UserPromptSubmitHookInput`

```typescript
type UserPromptSubmitHookInput = BaseHookInput & {
  hook_event_name: "UserPromptSubmit";
  prompt: string;
};
```

#### `SessionStartHookInput`

```typescript
type SessionStartHookInput = BaseHookInput & {
  hook_event_name: "SessionStart";
  source: "startup" | "resume" | "clear" | "compact";
  agent_type?: string;
  model?: string;
};
```

#### `SessionEndHookInput`

```typescript
type SessionEndHookInput = BaseHookInput & {
  hook_event_name: "SessionEnd";
  reason: ExitReason; // EXIT_REASONS 배열의 문자열
};
```

#### `StopHookInput`

```typescript
type StopHookInput = BaseHookInput & {
  hook_event_name: "Stop";
  stop_hook_active: boolean;
  last_assistant_message?: string;
};
```

#### `SubagentStartHookInput`

```typescript
type SubagentStartHookInput = BaseHookInput & {
  hook_event_name: "SubagentStart";
  agent_id: string;
  agent_type: string;
};
```

#### `SubagentStopHookInput`

```typescript
type SubagentStopHookInput = BaseHookInput & {
  hook_event_name: "SubagentStop";
  stop_hook_active: boolean;
  agent_id: string;
  agent_transcript_path: string;
  agent_type: string;
  last_assistant_message?: string;
};
```

#### `PreCompactHookInput`

```typescript
type PreCompactHookInput = BaseHookInput & {
  hook_event_name: "PreCompact";
  trigger: "manual" | "auto";
  custom_instructions: string | null;
};
```

#### `PermissionRequestHookInput`

```typescript
type PermissionRequestHookInput = BaseHookInput & {
  hook_event_name: "PermissionRequest";
  tool_name: string;
  tool_input: unknown;
  permission_suggestions?: PermissionUpdate[];
};
```

#### `SetupHookInput`

```typescript
type SetupHookInput = BaseHookInput & {
  hook_event_name: "Setup";
  trigger: "init" | "maintenance";
};
```

#### `TeammateIdleHookInput`

```typescript
type TeammateIdleHookInput = BaseHookInput & {
  hook_event_name: "TeammateIdle";
  teammate_name: string;
  team_name: string;
};
```

#### `TaskCompletedHookInput`

```typescript
type TaskCompletedHookInput = BaseHookInput & {
  hook_event_name: "TaskCompleted";
  task_id: string;
  task_subject: string;
  task_description?: string;
  teammate_name?: string;
  team_name?: string;
};
```

#### `ConfigChangeHookInput`

```typescript
type ConfigChangeHookInput = BaseHookInput & {
  hook_event_name: "ConfigChange";
  source:
    | "user_settings"
    | "project_settings"
    | "local_settings"
    | "policy_settings"
    | "skills";
  file_path?: string;
};
```

#### `WorktreeCreateHookInput`

```typescript
type WorktreeCreateHookInput = BaseHookInput & {
  hook_event_name: "WorktreeCreate";
  name: string;
};
```

#### `WorktreeRemoveHookInput`

```typescript
type WorktreeRemoveHookInput = BaseHookInput & {
  hook_event_name: "WorktreeRemove";
  worktree_path: string;
};
```

### `HookJSONOutput`

훅 반환값입니다.

```typescript
type HookJSONOutput = AsyncHookJSONOutput | SyncHookJSONOutput;
```

#### `AsyncHookJSONOutput`

```typescript
type AsyncHookJSONOutput = {
  async: true;
  asyncTimeout?: number;
};
```

#### `SyncHookJSONOutput`

```typescript
type SyncHookJSONOutput = {
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: "approve" | "block";
  systemMessage?: string;
  reason?: string;
  hookSpecificOutput?:
    | {
        hookEventName: "PreToolUse";
        permissionDecision?: "allow" | "deny" | "ask";
        permissionDecisionReason?: string;
        updatedInput?: Record<string, unknown>;
        additionalContext?: string;
      }
    | {
        hookEventName: "UserPromptSubmit";
        additionalContext?: string;
      }
    | {
        hookEventName: "SessionStart";
        additionalContext?: string;
      }
    | {
        hookEventName: "Setup";
        additionalContext?: string;
      }
    | {
        hookEventName: "SubagentStart";
        additionalContext?: string;
      }
    | {
        hookEventName: "PostToolUse";
        additionalContext?: string;
        updatedMCPToolOutput?: unknown;
      }
    | {
        hookEventName: "PostToolUseFailure";
        additionalContext?: string;
      }
    | {
        hookEventName: "Notification";
        additionalContext?: string;
      }
    | {
        hookEventName: "PermissionRequest";
        decision:
          | {
              behavior: "allow";
              updatedInput?: Record<string, unknown>;
              updatedPermissions?: PermissionUpdate[];
            }
          | {
              behavior: "deny";
              message?: string;
              interrupt?: boolean;
            };
      };
};
```

## 툴 입력 타입

모든 내장 Claude Code 툴의 입력 스키마 문서입니다. 이 타입들은 `@anthropic-ai/claude-agent-sdk`에서 내보내지며 타입 안전한 툴 상호작용에 사용할 수 있습니다.

### `ToolInputSchemas`

`@anthropic-ai/claude-agent-sdk`에서 내보내는 모든 툴 입력 타입의 유니온입니다.

```typescript
type ToolInputSchemas =
  | AgentInput
  | AskUserQuestionInput
  | BashInput
  | TaskOutputInput
  | ConfigInput
  | EnterWorktreeInput
  | ExitPlanModeInput
  | FileEditInput
  | FileReadInput
  | FileWriteInput
  | GlobInput
  | GrepInput
  | ListMcpResourcesInput
  | McpInput
  | MonitorInput
  | NotebookEditInput
  | ReadMcpResourceInput
  | SubscribeMcpResourceInput
  | SubscribePollingInput
  | TaskStopInput
  | TodoWriteInput
  | UnsubscribeMcpResourceInput
  | UnsubscribePollingInput
  | WebFetchInput
  | WebSearchInput;
```

### Agent

**툴 이름:** `Agent` (이전 이름 `Task`도 별칭으로 허용됨)

```typescript
type AgentInput = {
  description: string;
  prompt: string;
  subagent_type: string;
  model?: "sonnet" | "opus" | "haiku";
  resume?: string;
  run_in_background?: boolean;
  max_turns?: number;
  name?: string;
  team_name?: string;
  mode?: "acceptEdits" | "bypassPermissions" | "default" | "dontAsk" | "plan";
  isolation?: "worktree";
};
```

복잡한 멀티스텝 작업을 자율적으로 처리하는 새 에이전트를 시작합니다.

### AskUserQuestion

**툴 이름:** `AskUserQuestion`

```typescript
type AskUserQuestionInput = {
  questions: Array<{
    question: string;
    header: string;
    options: Array<{ label: string; description: string; preview?: string }>;
    multiSelect: boolean;
  }>;
};
```

실행 중 사용자에게 명확한 질문을 합니다. 사용 방법은 [승인 및 사용자 입력 처리](/agent-sdk/user-input#handle-clarifying-questions)를 참고하세요.

### Bash

**툴 이름:** `Bash`

```typescript
type BashInput = {
  command: string;
  timeout?: number;
  description?: string;
  run_in_background?: boolean;
  dangerouslyDisableSandbox?: boolean;
};
```

선택적 타임아웃과 백그라운드 실행을 지원하는 지속적인 셸 세션에서 bash 명령어를 실행합니다.

### Monitor

**툴 이름:** `Monitor`

```typescript
type MonitorInput = {
  command: string;
  description: string;
  timeout_ms?: number;
  persistent?: boolean;
};
```

백그라운드 스크립트를 실행하고 각 stdout 줄을 Claude에게 이벤트로 전달하여 폴링 없이 반응할 수 있게 합니다. 로그 추적과 같은 세션 길이의 감시에는 `persistent: true`를 설정하세요. Monitor는 Bash와 동일한 권한 규칙을 따릅니다. 동작과 제공자 가용성은 [Monitor 툴 레퍼런스](/tools-reference#monitor-tool)를 참고하세요.

### TaskOutput

**툴 이름:** `TaskOutput`

```typescript
type TaskOutputInput = {
  task_id: string;
  block: boolean;
  timeout: number;
};
```

실행 중이거나 완료된 백그라운드 작업의 출력을 가져옵니다.

### Edit

**툴 이름:** `Edit`

```typescript
type FileEditInput = {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
};
```

파일에서 정확한 문자열 대체를 수행합니다.

### Read

**툴 이름:** `Read`

```typescript
type FileReadInput = {
  file_path: string;
  offset?: number;
  limit?: number;
  pages?: string;
};
```

텍스트, 이미지, PDF, Jupyter 노트북을 포함한 로컬 파일시스템의 파일을 읽습니다. PDF 페이지 범위에는 `pages`를 사용하세요 (예: `"1-5"`).

### Write

**툴 이름:** `Write`

```typescript
type FileWriteInput = {
  file_path: string;
  content: string;
};
```

로컬 파일시스템에 파일을 씁니다. 파일이 존재하면 덮어씁니다.

### Glob

**툴 이름:** `Glob`

```typescript
type GlobInput = {
  pattern: string;
  path?: string;
};
```

어떤 크기의 코드베이스에서도 작동하는 빠른 파일 패턴 매칭입니다.

### Grep

**툴 이름:** `Grep`

```typescript
type GrepInput = {
  pattern: string;
  path?: string;
  glob?: string;
  type?: string;
  output_mode?: "content" | "files_with_matches" | "count";
  "-i"?: boolean;
  "-n"?: boolean;
  "-B"?: number;
  "-A"?: number;
  "-C"?: number;
  context?: number;
  head_limit?: number;
  offset?: number;
  multiline?: boolean;
};
```

정규식을 지원하는 ripgrep 기반의 강력한 검색 툴입니다.

### TaskStop

**툴 이름:** `TaskStop`

```typescript
type TaskStopInput = {
  task_id?: string;
  shell_id?: string; // 사용 중단: task_id를 사용하세요
};
```

ID로 실행 중인 백그라운드 작업이나 셸을 중지합니다.

### NotebookEdit

**툴 이름:** `NotebookEdit`

```typescript
type NotebookEditInput = {
  notebook_path: string;
  cell_id?: string;
  new_source: string;
  cell_type?: "code" | "markdown";
  edit_mode?: "replace" | "insert" | "delete";
};
```

Jupyter 노트북 파일의 셀을 편집합니다.

### WebFetch

**툴 이름:** `WebFetch`

```typescript
type WebFetchInput = {
  url: string;
  prompt: string;
};
```

URL에서 콘텐츠를 가져와 AI 모델로 처리합니다.

### WebSearch

**툴 이름:** `WebSearch`

```typescript
type WebSearchInput = {
  query: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
};
```

웹을 검색하여 형식화된 결과를 반환합니다.

### TodoWrite

**툴 이름:** `TodoWrite`

```typescript
type TodoWriteInput = {
  todos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
};
```

진행 상황을 추적하는 구조화된 작업 목록을 생성하고 관리합니다.

### ExitPlanMode

**툴 이름:** `ExitPlanMode`

```typescript
type ExitPlanModeInput = {
  allowedPrompts?: Array<{
    tool: "Bash";
    prompt: string;
  }>;
};
```

계획 모드를 종료합니다. 선택적으로 계획 구현에 필요한 프롬프트 기반 권한을 지정합니다.

### ListMcpResources

**툴 이름:** `ListMcpResources`

```typescript
type ListMcpResourcesInput = {
  server?: string;
};
```

연결된 서버에서 사용 가능한 MCP 리소스를 나열합니다.

### ReadMcpResource

**툴 이름:** `ReadMcpResource`

```typescript
type ReadMcpResourceInput = {
  server: string;
  uri: string;
};
```

서버에서 특정 MCP 리소스를 읽습니다.

### Config

**툴 이름:** `Config`

```typescript
type ConfigInput = {
  setting: string;
  value?: string | boolean | number;
};
```

설정 값을 가져오거나 설정합니다.

### EnterWorktree

**툴 이름:** `EnterWorktree`

```typescript
type EnterWorktreeInput = {
  name?: string;
  path?: string;
};
```

격리된 작업을 위한 임시 git worktree를 생성하고 진입합니다. `path`를 전달하면 새로 생성하는 대신 현재 저장소의 기존 worktree로 전환합니다. `name`과 `path`는 함께 사용할 수 없습니다.

## 툴 출력 타입

모든 내장 Claude Code 툴의 출력 스키마 문서입니다. 이 타입들은 `@anthropic-ai/claude-agent-sdk`에서 내보내지며 각 툴이 반환하는 실제 응답 데이터를 나타냅니다.

### `ToolOutputSchemas`

모든 툴 출력 타입의 유니온입니다.

```typescript
type ToolOutputSchemas =
  | AgentOutput
  | AskUserQuestionOutput
  | BashOutput
  | ConfigOutput
  | EnterWorktreeOutput
  | ExitPlanModeOutput
  | FileEditOutput
  | FileReadOutput
  | FileWriteOutput
  | GlobOutput
  | GrepOutput
  | ListMcpResourcesOutput
  | MonitorOutput
  | NotebookEditOutput
  | ReadMcpResourceOutput
  | TaskStopOutput
  | TodoWriteOutput
  | WebFetchOutput
  | WebSearchOutput;
```

### Agent

**툴 이름:** `Agent` (이전 이름 `Task`도 별칭으로 허용됨)

```typescript
type AgentOutput =
  | {
      status: "completed";
      agentId: string;
      content: Array<{ type: "text"; text: string }>;
      totalToolUseCount: number;
      totalDurationMs: number;
      totalTokens: number;
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_creation_input_tokens: number | null;
        cache_read_input_tokens: number | null;
        server_tool_use: {
          web_search_requests: number;
          web_fetch_requests: number;
        } | null;
        service_tier: ("standard" | "priority" | "batch") | null;
        cache_creation: {
          ephemeral_1h_input_tokens: number;
          ephemeral_5m_input_tokens: number;
        } | null;
      };
      prompt: string;
    }
  | {
      status: "async_launched";
      agentId: string;
      description: string;
      prompt: string;
      outputFile: string;
      canReadOutputFile?: boolean;
    }
  | {
      status: "sub_agent_entered";
      description: string;
      message: string;
    };
```

서브에이전트의 결과를 반환합니다. `status` 필드로 구분: 완료된 작업은 `"completed"`, 백그라운드 작업은 `"async_launched"`, 인터랙티브 서브에이전트는 `"sub_agent_entered"`.

### AskUserQuestion

**툴 이름:** `AskUserQuestion`

```typescript
type AskUserQuestionOutput = {
  questions: Array<{
    question: string;
    header: string;
    options: Array<{ label: string; description: string; preview?: string }>;
    multiSelect: boolean;
  }>;
  answers: Record<string, string>;
};
```

질문과 사용자의 답변을 반환합니다.

### Bash

**툴 이름:** `Bash`

```typescript
type BashOutput = {
  stdout: string;
  stderr: string;
  rawOutputPath?: string;
  interrupted: boolean;
  isImage?: boolean;
  backgroundTaskId?: string;
  backgroundedByUser?: boolean;
  dangerouslyDisableSandbox?: boolean;
  returnCodeInterpretation?: string;
  structuredContent?: unknown[];
  persistedOutputPath?: string;
  persistedOutputSize?: number;
};
```

stdout/stderr가 분리된 명령 출력을 반환합니다. 백그라운드 명령에는 `backgroundTaskId`가 포함됩니다.

### Monitor

**툴 이름:** `Monitor`

```typescript
type MonitorOutput = {
  taskId: string;
  timeoutMs: number;
  persistent?: boolean;
};
```

실행 중인 모니터의 백그라운드 작업 ID를 반환합니다. 이 ID를 `TaskStop`과 함께 사용하면 감시를 조기에 취소할 수 있습니다.

### Edit

**툴 이름:** `Edit`

```typescript
type FileEditOutput = {
  filePath: string;
  oldString: string;
  newString: string;
  originalFile: string;
  structuredPatch: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
  }>;
  userModified: boolean;
  replaceAll: boolean;
  gitDiff?: {
    filename: string;
    status: "modified" | "added";
    additions: number;
    deletions: number;
    changes: number;
    patch: string;
  };
};
```

편집 작업의 구조화된 diff를 반환합니다.

### Read

**툴 이름:** `Read`

```typescript
type FileReadOutput =
  | {
      type: "text";
      file: {
        filePath: string;
        content: string;
        numLines: number;
        startLine: number;
        totalLines: number;
      };
    }
  | {
      type: "image";
      file: {
        base64: string;
        type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        originalSize: number;
        dimensions?: {
          originalWidth?: number;
          originalHeight?: number;
          displayWidth?: number;
          displayHeight?: number;
        };
      };
    }
  | {
      type: "notebook";
      file: {
        filePath: string;
        cells: unknown[];
      };
    }
  | {
      type: "pdf";
      file: {
        filePath: string;
        base64: string;
        originalSize: number;
      };
    }
  | {
      type: "parts";
      file: {
        filePath: string;
        originalSize: number;
        count: number;
        outputDir: string;
      };
    };
```

파일 타입에 적합한 형식으로 파일 내용을 반환합니다. `type` 필드로 구분됩니다.

### Write

**툴 이름:** `Write`

```typescript
type FileWriteOutput = {
  type: "create" | "update";
  filePath: string;
  content: string;
  structuredPatch: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
  }>;
  originalFile: string | null;
  gitDiff?: {
    filename: string;
    status: "modified" | "added";
    additions: number;
    deletions: number;
    changes: number;
    patch: string;
  };
};
```

구조화된 diff 정보와 함께 쓰기 결과를 반환합니다.

### Glob

**툴 이름:** `Glob`

```typescript
type GlobOutput = {
  durationMs: number;
  numFiles: number;
  filenames: string[];
  truncated: boolean;
};
```

수정 시간순으로 정렬된 glob 패턴과 일치하는 파일 경로를 반환합니다.

### Grep

**툴 이름:** `Grep`

```typescript
type GrepOutput = {
  mode?: "content" | "files_with_matches" | "count";
  numFiles: number;
  filenames: string[];
  content?: string;
  numLines?: number;
  numMatches?: number;
  appliedLimit?: number;
  appliedOffset?: number;
};
```

검색 결과를 반환합니다. `mode`에 따라 형태가 다릅니다: 파일 목록, 매칭 내용, 또는 일치 횟수.

### TaskStop

**툴 이름:** `TaskStop`

```typescript
type TaskStopOutput = {
  message: string;
  task_id: string;
  task_type: string;
  command?: string;
};
```

백그라운드 작업 중지 후 확인 메시지를 반환합니다.

### NotebookEdit

**툴 이름:** `NotebookEdit`

```typescript
type NotebookEditOutput = {
  new_source: string;
  cell_id?: string;
  cell_type: "code" | "markdown";
  language: string;
  edit_mode: string;
  error?: string;
  notebook_path: string;
  original_file: string;
  updated_file: string;
};
```

원본 및 업데이트된 파일 내용과 함께 노트북 편집 결과를 반환합니다.

### WebFetch

**툴 이름:** `WebFetch`

```typescript
type WebFetchOutput = {
  bytes: number;
  code: number;
  codeText: string;
  result: string;
  durationMs: number;
  url: string;
};
```

HTTP 상태와 메타데이터와 함께 가져온 콘텐츠를 반환합니다.

### WebSearch

**툴 이름:** `WebSearch`

```typescript
type WebSearchOutput = {
  query: string;
  results: Array<
    | {
        tool_use_id: string;
        content: Array<{ title: string; url: string }>;
      }
    | string
  >;
  durationSeconds: number;
};
```

웹 검색 결과를 반환합니다.

### TodoWrite

**툴 이름:** `TodoWrite`

```typescript
type TodoWriteOutput = {
  oldTodos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
  newTodos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
};
```

이전 및 업데이트된 작업 목록을 반환합니다.

### ExitPlanMode

**툴 이름:** `ExitPlanMode`

```typescript
type ExitPlanModeOutput = {
  plan: string | null;
  isAgent: boolean;
  filePath?: string;
  hasTaskTool?: boolean;
  awaitingLeaderApproval?: boolean;
  requestId?: string;
};
```

계획 모드 종료 후 계획 상태를 반환합니다.

### ListMcpResources

**툴 이름:** `ListMcpResources`

```typescript
type ListMcpResourcesOutput = Array<{
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
  server: string;
}>;
```

사용 가능한 MCP 리소스 배열을 반환합니다.

### ReadMcpResource

**툴 이름:** `ReadMcpResource`

```typescript
type ReadMcpResourceOutput = {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
  }>;
};
```

요청한 MCP 리소스의 내용을 반환합니다.

### Config

**툴 이름:** `Config`

```typescript
type ConfigOutput = {
  success: boolean;
  operation?: "get" | "set";
  setting?: string;
  value?: unknown;
  previousValue?: unknown;
  newValue?: unknown;
  error?: string;
};
```

설정 get 또는 set 작업의 결과를 반환합니다.

### EnterWorktree

**툴 이름:** `EnterWorktree`

```typescript
type EnterWorktreeOutput = {
  worktreePath: string;
  worktreeBranch?: string;
  message: string;
};
```

생성된 git worktree에 대한 정보를 반환합니다.

## 권한 타입

### `PermissionUpdate`

권한 업데이트 작업입니다.

```typescript
type PermissionUpdate =
  | {
      type: "addRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "replaceRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "removeRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "setMode";
      mode: PermissionMode;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "addDirectories";
      directories: string[];
      destination: PermissionUpdateDestination;
    }
  | {
      type: "removeDirectories";
      directories: string[];
      destination: PermissionUpdateDestination;
    };
```

### `PermissionBehavior`

```typescript
type PermissionBehavior = "allow" | "deny" | "ask";
```

### `PermissionUpdateDestination`

```typescript
type PermissionUpdateDestination =
  | "userSettings" // 전역 사용자 설정
  | "projectSettings" // 디렉토리별 프로젝트 설정
  | "localSettings" // gitignore된 로컬 설정
  | "session" // 현재 세션만
  | "cliArg"; // CLI 인수
```

### `PermissionRuleValue`

```typescript
type PermissionRuleValue = {
  toolName: string;
  ruleContent?: string;
};
```

## 기타 타입

### `ApiKeySource`

```typescript
type ApiKeySource = "user" | "project" | "org" | "temporary" | "oauth";
```

### `SdkBeta`

`betas` 옵션으로 활성화할 수 있는 베타 기능입니다. 자세한 내용은 [베타 헤더](https://platform.claude.com/docs/en/api/beta-headers)를 참고하세요.

```typescript
type SdkBeta = "context-1m-2025-08-07";
```

::: warning
`context-1m-2025-08-07` 베타는 2026년 4월 30일부로 종료되었습니다. Claude Sonnet 4.5 또는 Sonnet 4와 함께 이 값을 전달해도 효과가 없으며, 표준 200k 토큰 컨텍스트 윈도우를 초과하는 요청은 오류를 반환합니다. 1M 토큰 컨텍스트 윈도우를 사용하려면 [Claude Sonnet 4.6 또는 Claude Opus 4.6](https://platform.claude.com/docs/en/about-claude/models/overview)으로 마이그레이션하세요. 이 모델들은 추가 베타 헤더 없이 표준 가격으로 1M 컨텍스트를 제공합니다.
:::

### `SlashCommand`

사용 가능한 슬래시 명령어에 대한 정보입니다.

```typescript
type SlashCommand = {
  name: string;
  description: string;
  argumentHint: string;
};
```

### `ModelInfo`

사용 가능한 모델에 대한 정보입니다.

```typescript
type ModelInfo = {
  value: string;
  displayName: string;
  description: string;
  supportsEffort?: boolean;
  supportedEffortLevels?: ("low" | "medium" | "high" | "max")[];
  supportsAdaptiveThinking?: boolean;
  supportsFastMode?: boolean;
};
```

### `AgentInfo`

Agent 툴을 통해 호출할 수 있는 서브에이전트에 대한 정보입니다.

```typescript
type AgentInfo = {
  name: string;
  description: string;
  model?: string;
};
```

| 필드          | 타입                  | 설명                                                                   |
| :------------ | :-------------------- | :--------------------------------------------------------------------- |
| `name`        | `string`              | 에이전트 타입 식별자 (예: `"Explore"`, `"general-purpose"`)            |
| `description` | `string`              | 이 에이전트를 언제 사용할지에 대한 설명                                |
| `model`       | `string \| undefined` | 이 에이전트가 사용하는 모델 별칭. 생략하면 부모의 모델을 상속          |

### `McpServerStatus`

연결된 MCP 서버의 상태입니다.

```typescript
type McpServerStatus = {
  name: string;
  status: "connected" | "failed" | "needs-auth" | "pending" | "disabled";
  serverInfo?: {
    name: string;
    version: string;
  };
  error?: string;
  config?: McpServerStatusConfig;
  scope?: string;
  tools?: {
    name: string;
    description?: string;
    annotations?: {
      readOnly?: boolean;
      destructive?: boolean;
      openWorld?: boolean;
    };
  }[];
};
```

### `McpServerStatusConfig`

`mcpServerStatus()`가 보고하는 MCP 서버 설정입니다. 모든 MCP 서버 전송 타입의 유니온입니다.

```typescript
type McpServerStatusConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfig
  | McpClaudeAIProxyServerConfig;
```

각 전송 타입의 자세한 내용은 [`McpServerConfig`](#mcp-server-config)를 참고하세요.

### `AccountInfo`

인증된 사용자의 계정 정보입니다.

```typescript
type AccountInfo = {
  email?: string;
  organization?: string;
  subscriptionType?: string;
  tokenSource?: string;
  apiKeySource?: string;
};
```

### `ModelUsage`

결과 메시지에 반환되는 모델별 사용 통계입니다.

```typescript
type ModelUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
  contextWindow: number;
  maxOutputTokens: number;
};
```

### `ConfigScope`

```typescript
type ConfigScope = "local" | "user" | "project";
```

### `NonNullableUsage`

모든 nullable 필드를 non-nullable로 만든 [`Usage`](#usage) 버전입니다.

```typescript
type NonNullableUsage = {
  [K in keyof Usage]: NonNullable<Usage[K]>;
};
```

### `Usage`

토큰 사용 통계 (`@anthropic-ai/sdk`에서).

```typescript
type Usage = {
  input_tokens: number | null;
  output_tokens: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};
```

### `CallToolResult`

MCP 툴 결과 타입 (`@modelcontextprotocol/sdk/types.js`에서).

```typescript
type CallToolResult = {
  content: Array<{
    type: "text" | "image" | "resource";
    // 추가 필드는 타입에 따라 다름
  }>;
  isError?: boolean;
};
```

### `ThinkingConfig`

Claude의 사고/추론 동작을 제어합니다. 사용 중단된 `maxThinkingTokens`보다 우선합니다.

```typescript
type ThinkingConfig =
  | { type: "adaptive" } // 모델이 언제 얼마나 추론할지 결정 (Opus 4.6+)
  | { type: "enabled"; budgetTokens?: number } // 고정 사고 토큰 예산
  | { type: "disabled" }; // 확장 사고 없음
```

### `SpawnedProcess`

커스텀 프로세스 생성을 위한 인터페이스 (`spawnClaudeCodeProcess` 옵션과 함께 사용). `ChildProcess`는 이미 이 인터페이스를 만족합니다.

```typescript
interface SpawnedProcess {
  stdin: Writable;
  stdout: Readable;
  readonly killed: boolean;
  readonly exitCode: number | null;
  kill(signal: NodeJS.Signals): boolean;
  on(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  on(event: "error", listener: (error: Error) => void): void;
  once(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  once(event: "error", listener: (error: Error) => void): void;
  off(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  off(event: "error", listener: (error: Error) => void): void;
}
```

### `SpawnOptions`

커스텀 spawn 함수에 전달되는 옵션입니다.

```typescript
interface SpawnOptions {
  command: string;
  args: string[];
  cwd?: string;
  env: Record<string, string | undefined>;
  signal: AbortSignal;
}
```

### `McpSetServersResult`

`setMcpServers()` 작업의 결과입니다.

```typescript
type McpSetServersResult = {
  added: string[];
  removed: string[];
  errors: Record<string, string>;
};
```

### `RewindFilesResult`

`rewindFiles()` 작업의 결과입니다.

```typescript
type RewindFilesResult = {
  canRewind: boolean;
  error?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
};
```

### `SDKStatusMessage`

상태 업데이트 메시지 (예: 압축 중).

```typescript
type SDKStatusMessage = {
  type: "system";
  subtype: "status";
  status: "compacting" | null;
  permissionMode?: PermissionMode;
  uuid: UUID;
  session_id: string;
};
```

### `SDKTaskNotificationMessage`

백그라운드 작업이 완료, 실패 또는 중지될 때 알림입니다. 백그라운드 작업에는 `run_in_background` Bash 명령어, [Monitor](#monitor) 감시, 백그라운드 서브에이전트가 포함됩니다.

```typescript
type SDKTaskNotificationMessage = {
  type: "system";
  subtype: "task_notification";
  task_id: string;
  tool_use_id?: string;
  status: "completed" | "failed" | "stopped";
  output_file: string;
  summary: string;
  usage?: {
    total_tokens: number;
    tool_uses: number;
    duration_ms: number;
  };
  uuid: UUID;
  session_id: string;
};
```

### `SDKToolUseSummaryMessage`

대화에서 툴 사용 요약입니다.

```typescript
type SDKToolUseSummaryMessage = {
  type: "tool_use_summary";
  summary: string;
  preceding_tool_use_ids: string[];
  uuid: UUID;
  session_id: string;
};
```

### `SDKHookStartedMessage`

훅 실행이 시작될 때 발생합니다.

```typescript
type SDKHookStartedMessage = {
  type: "system";
  subtype: "hook_started";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKHookProgressMessage`

훅이 실행 중일 때 stdout/stderr 출력과 함께 발생합니다.

```typescript
type SDKHookProgressMessage = {
  type: "system";
  subtype: "hook_progress";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  stdout: string;
  stderr: string;
  output: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKHookResponseMessage`

훅 실행이 완료될 때 발생합니다.

```typescript
type SDKHookResponseMessage = {
  type: "system";
  subtype: "hook_response";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  output: string;
  stdout: string;
  stderr: string;
  exit_code?: number;
  outcome: "success" | "error" | "cancelled";
  uuid: UUID;
  session_id: string;
};
```

### `SDKToolProgressMessage`

툴 실행 중 진행 상황을 나타내기 위해 주기적으로 발생합니다.

```typescript
type SDKToolProgressMessage = {
  type: "tool_progress";
  tool_use_id: string;
  tool_name: string;
  parent_tool_use_id: string | null;
  elapsed_time_seconds: number;
  task_id?: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKAuthStatusMessage`

인증 플로우 중 발생합니다.

```typescript
type SDKAuthStatusMessage = {
  type: "auth_status";
  isAuthenticating: boolean;
  output: string[];
  error?: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKTaskStartedMessage`

백그라운드 작업이 시작될 때 발생합니다. `task_type` 필드는 백그라운드 Bash 명령어와 [Monitor](#monitor) 감시의 경우 `"local_bash"`, 서브에이전트의 경우 `"local_agent"`, 또는 `"remote_agent"`입니다.

```typescript
type SDKTaskStartedMessage = {
  type: "system";
  subtype: "task_started";
  task_id: string;
  tool_use_id?: string;
  description: string;
  task_type?: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKTaskProgressMessage`

백그라운드 작업이 실행 중일 때 주기적으로 발생합니다.

```typescript
type SDKTaskProgressMessage = {
  type: "system";
  subtype: "task_progress";
  task_id: string;
  tool_use_id?: string;
  description: string;
  usage: {
    total_tokens: number;
    tool_uses: number;
    duration_ms: number;
  };
  last_tool_name?: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKFilesPersistedEvent`

파일 체크포인트가 디스크에 저장될 때 발생합니다.

```typescript
type SDKFilesPersistedEvent = {
  type: "system";
  subtype: "files_persisted";
  files: { filename: string; file_id: string }[];
  failed: { filename: string; error: string }[];
  processed_at: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKRateLimitEvent`

세션에서 속도 제한에 걸릴 때 발생합니다.

```typescript
type SDKRateLimitEvent = {
  type: "rate_limit_event";
  rate_limit_info: {
    status: "allowed" | "allowed_warning" | "rejected";
    resetsAt?: number;
    utilization?: number;
  };
  uuid: UUID;
  session_id: string;
};
```

### `SDKLocalCommandOutputMessage`

로컬 슬래시 명령어의 출력 (예: `/voice` 또는 `/cost`). 트랜스크립트에서 어시스턴트 스타일의 텍스트로 표시됩니다.

```typescript
type SDKLocalCommandOutputMessage = {
  type: "system";
  subtype: "local_command_output";
  content: string;
  uuid: UUID;
  session_id: string;
};
```

### `SDKPromptSuggestionMessage`

`promptSuggestions`가 활성화된 경우 각 턴 후 발생합니다. 예측된 다음 사용자 프롬프트를 포함합니다.

```typescript
type SDKPromptSuggestionMessage = {
  type: "prompt_suggestion";
  suggestion: string;
  uuid: UUID;
  session_id: string;
};
```

### `AbortError`

중단 작업을 위한 커스텀 에러 클래스입니다.

```typescript
class AbortError extends Error {}
```

## 샌드박스 설정

### `SandboxSettings`

샌드박스 동작 설정입니다. 명령 샌드박싱을 활성화하고 네트워크 제한을 프로그래밍 방식으로 설정하는 데 사용합니다.

```typescript
type SandboxSettings = {
  enabled?: boolean;
  autoAllowBashIfSandboxed?: boolean;
  excludedCommands?: string[];
  allowUnsandboxedCommands?: boolean;
  network?: SandboxNetworkConfig;
  filesystem?: SandboxFilesystemConfig;
  ignoreViolations?: Record<string, string[]>;
  enableWeakerNestedSandbox?: boolean;
  ripgrep?: { command: string; args?: string[] };
};
```

| 속성                        | 타입                                                    | 기본값      | 설명                                                                                                                                                                                                                                    |
| :-------------------------- | :------------------------------------------------------ | :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                   | `boolean`                                               | `false`     | 명령 실행을 위한 샌드박스 모드 활성화                                                                                                                                                                                                   |
| `autoAllowBashIfSandboxed`  | `boolean`                                               | `true`      | 샌드박스가 활성화된 경우 bash 명령을 자동 승인                                                                                                                                                                                          |
| `excludedCommands`          | `string[]`                                              | `[]`        | 항상 샌드박스 제한을 우회하는 명령 (예: `['docker']`). 모델 개입 없이 자동으로 샌드박스 없이 실행됨                                                                                                                                     |
| `allowUnsandboxedCommands`  | `boolean`                                               | `true`      | 모델이 샌드박스 외부에서 명령 실행을 요청할 수 있도록 허용. `true`이면 모델이 툴 입력에 `dangerouslyDisableSandbox`를 설정할 수 있으며, 이는 [권한 시스템](#permissions-fallback-for-unsandboxed-commands)으로 폴백됨                    |
| `network`                   | [`SandboxNetworkConfig`](#sandbox-network-config)       | `undefined` | 네트워크 관련 샌드박스 설정                                                                                                                                                                                                             |
| `filesystem`                | [`SandboxFilesystemConfig`](#sandbox-filesystem-config) | `undefined` | 읽기/쓰기 제한을 위한 파일시스템 관련 샌드박스 설정                                                                                                                                                                                    |
| `ignoreViolations`          | `Record<string, string[]>`                              | `undefined` | 위반 카테고리를 무시할 패턴에 매핑 (예: `{ file: ['/tmp/*'], network: ['localhost'] }`)                                                                                                                                                 |
| `enableWeakerNestedSandbox` | `boolean`                                               | `false`     | 호환성을 위한 약한 중첩 샌드박스 활성화                                                                                                                                                                                                 |
| `ripgrep`                   | `{ command: string; args?: string[] }`                  | `undefined` | 샌드박스 환경을 위한 커스텀 ripgrep 바이너리 설정                                                                                                                                                                                       |

#### 사용 예시

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Build and test my project",
  options: {
    sandbox: {
      enabled: true,
      autoAllowBashIfSandboxed: true,
      network: {
        allowLocalBinding: true
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

::: warning
**Unix 소켓 보안:** `allowUnixSockets` 옵션은 강력한 시스템 서비스에 대한 접근을 허용할 수 있습니다. 예를 들어, `/var/run/docker.sock`을 허용하면 Docker API를 통해 샌드박스 격리를 우회하여 호스트 시스템에 대한 전체 접근 권한을 사실상 부여하게 됩니다. 꼭 필요한 Unix 소켓만 허용하고 각각의 보안 영향을 이해하세요.
:::

### `SandboxNetworkConfig`

샌드박스 모드의 네트워크 관련 설정입니다.

```typescript
type SandboxNetworkConfig = {
  allowedDomains?: string[];
  allowManagedDomainsOnly?: boolean;
  allowLocalBinding?: boolean;
  allowUnixSockets?: string[];
  allowAllUnixSockets?: boolean;
  httpProxyPort?: number;
  socksProxyPort?: number;
};
```

| 속성                      | 타입       | 기본값      | 설명                                                        |
| :------------------------ | :--------- | :---------- | :---------------------------------------------------------- |
| `allowedDomains`          | `string[]` | `[]`        | 샌드박스 프로세스가 접근할 수 있는 도메인 이름              |
| `allowManagedDomainsOnly` | `boolean`  | `false`     | `allowedDomains`의 도메인으로만 네트워크 접근 제한          |
| `allowLocalBinding`       | `boolean`  | `false`     | 프로세스가 로컬 포트에 바인딩할 수 있도록 허용 (예: 개발 서버) |
| `allowUnixSockets`        | `string[]` | `[]`        | 프로세스가 접근할 수 있는 Unix 소켓 경로 (예: Docker 소켓)  |
| `allowAllUnixSockets`     | `boolean`  | `false`     | 모든 Unix 소켓에 대한 접근 허용                             |
| `httpProxyPort`           | `number`   | `undefined` | 네트워크 요청을 위한 HTTP 프록시 포트                       |
| `socksProxyPort`          | `number`   | `undefined` | 네트워크 요청을 위한 SOCKS 프록시 포트                      |

### `SandboxFilesystemConfig`

샌드박스 모드의 파일시스템 관련 설정입니다.

```typescript
type SandboxFilesystemConfig = {
  allowWrite?: string[];
  denyWrite?: string[];
  denyRead?: string[];
};
```

| 속성         | 타입       | 기본값 | 설명                                |
| :----------- | :--------- | :----- | :---------------------------------- |
| `allowWrite` | `string[]` | `[]`   | 쓰기 접근을 허용할 파일 경로 패턴   |
| `denyWrite`  | `string[]` | `[]`   | 쓰기 접근을 거부할 파일 경로 패턴   |
| `denyRead`   | `string[]` | `[]`   | 읽기 접근을 거부할 파일 경로 패턴   |

### 샌드박스 해제 명령의 권한 폴백

`allowUnsandboxedCommands`가 활성화되면 모델은 툴 입력에 `dangerouslyDisableSandbox: true`를 설정하여 샌드박스 외부에서 명령 실행을 요청할 수 있습니다. 이러한 요청은 기존 권한 시스템으로 폴백되어 `canUseTool` 핸들러가 호출되므로, 커스텀 인증 로직을 구현할 수 있습니다.

::: info
**`excludedCommands` vs `allowUnsandboxedCommands`:**

* `excludedCommands`: 항상 자동으로 샌드박스를 우회하는 명령의 정적 목록 (예: `['docker']`). 모델이 이를 제어할 수 없습니다.
* `allowUnsandboxedCommands`: 모델이 런타임에 툴 입력에 `dangerouslyDisableSandbox: true`를 설정하여 샌드박스 해제 실행을 요청할지 여부를 결정하게 합니다.
:::

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Deploy my application",
  options: {
    sandbox: {
      enabled: true,
      allowUnsandboxedCommands: true // 모델이 샌드박스 해제 실행을 요청할 수 있음
    },
    permissionMode: "default",
    canUseTool: async (tool, input) => {
      // 모델이 샌드박스를 우회하려는지 확인
      if (tool === "Bash" && input.dangerouslyDisableSandbox) {
        // 모델이 이 명령을 샌드박스 외부에서 실행하도록 요청 중
        console.log(`Unsandboxed command requested: ${input.command}`);

        if (isCommandAuthorized(input.command)) {
          return { behavior: "allow" as const, updatedInput: input };
        }
        return {
          behavior: "deny" as const,
          message: "Command not authorized for unsandboxed execution"
        };
      }
      return { behavior: "allow" as const, updatedInput: input };
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

이 패턴을 통해 다음이 가능합니다:

* **모델 요청 감사:** 모델이 샌드박스 해제 실행을 요청할 때 로그 기록
* **허용 목록 구현:** 특정 명령만 샌드박스 없이 실행 허용
* **승인 워크플로 추가:** 권한이 필요한 작업에 명시적 인증 요구

::: warning
`dangerouslyDisableSandbox: true`로 실행되는 명령은 전체 시스템 접근 권한을 가집니다. `canUseTool` 핸들러에서 이러한 요청을 신중하게 검증하세요.

`permissionMode`가 `bypassPermissions`로 설정되고 `allowUnsandboxedCommands`가 활성화된 경우, 모델은 승인 프롬프트 없이 자율적으로 샌드박스 외부에서 명령을 실행할 수 있습니다. 이 조합은 사실상 모델이 조용히 샌드박스 격리를 탈출하도록 허용합니다.
:::

## 참고 자료

* [SDK 개요](/agent-sdk/overview) - 일반 SDK 개념
* [Python SDK 레퍼런스](/agent-sdk/python) - Python SDK 문서
* [CLI 레퍼런스](/cli-reference) - 명령줄 인터페이스
* [일반 워크플로](/common-workflows) - 단계별 가이드
