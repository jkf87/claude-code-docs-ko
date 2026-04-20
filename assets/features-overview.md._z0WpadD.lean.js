import{_ as c,C as n,o as u,c as h,ae as p,E as a,w as d,a as s,j as e}from"./chunks/framework.BEtfQoF7.js";const y=JSON.parse('{"title":"Claude Code 확장하기","description":"CLAUDE.md, Skills, 서브에이전트, Hooks, MCP, 플러그인을 언제 사용해야 하는지 이해하기","frontmatter":{"title":"Claude Code 확장하기","description":"CLAUDE.md, Skills, 서브에이전트, Hooks, MCP, 플러그인을 언제 사용해야 하는지 이해하기"},"headers":[],"relativePath":"features-overview.md","filePath":"features-overview.md","lastUpdated":1776205703000}'),g={name:"features-overview.md"};function m(k,t,b,C,f,v){const o=n("Tab"),r=n("Tabs"),l=n("Card"),i=n("CardGroup");return u(),h("div",null,[t[13]||(t[13]=p("",26)),a(r,null,{default:d(()=>[a(o,{title:"CLAUDE.md"},{default:d(()=>[...t[0]||(t[0]=[s(" **시점:** 세션 시작 ",-1),e("pre",null,[e("code",null,`**로드되는 것:** [CLAUDE.md](/memory) 파일의 모든 CLAUDE.md 파일의 전체 콘텐츠(관리형, 사용자, 프로젝트 수준).

**상속:** Claude는 작업 디렉토리에서 루트까지 CLAUDE.md 파일을 읽고, 하위 디렉토리의 파일은 접근할 때 발견되면 로드합니다. [CLAUDE.md 파일 로드 방법](/memory#how-claude-md-files-load)에 대한 상세 내용은 참조하세요.

::: tip
CLAUDE.md는 200줄 이하로 유지하세요. 참조 자료는 \`.claude/rules/\` 파일로 분리하세요.
:::
`)],-1)])]),_:1}),a(o,{title:"Skills"},{default:d(()=>[...t[1]||(t[1]=[s(" **시점:** 사용자 지정 또는 Claude가 관련성이 있을 때 ",-1),e("pre",null,[e("code",null,`**로드되는 것:** 모델 인보케이션용 이름과 설명. 사용자만 호출하는 스킬의 경우 전체 콘텐츠도 모델에 추가됩니다.

**상속:** 모델 인보케이션은 스킬의 전체 콘텐츠를 대체하지 않습니다. 이름이 충돌하면 우선순위에 따라 하나의 정의가 승리됩니다.

::: tip
사용자만 스킬(\`disable-model-invocation: true\`)가 있는 스킬은 0 컨텍스트 비용을 유지합니다.
:::
`)],-1)])]),_:1}),a(o,{title:"MCP 서버"},{default:d(()=>[...t[2]||(t[2]=[s(" **시점:** 세션 시작 ",-1),e("pre",null,[e("code",null,`**로드되는 것:** 도구 이름. 전체 JSON 스키마는 사용 시까지 지연됩니다.

**상속:** 도구 사용 시까지 도구 이름만 노출되며, Claude가 특정 도구를 필요로 할 때 전체 스키마를 요청합니다.

**신뢰성 참고:** MCP 연결은 세션 중에 조용히 실패할 수 있습니다. 서버가 연결이 끊기면 경고 없이 도구가 사라집니다. Claude가 이전에 접근할 수 있었던 MCP 도구를 계속 사용하려 하면, \`/mcp\`로 연결을 확인하세요.
:::
`)],-1)])]),_:1}),a(o,{title:"서브에이전트"},{default:d(()=>[...t[3]||(t[3]=[s(" **시점:** 요청 시 (또는 스폰) ",-1),e("pre",null,[e("code",null,`**로드되는 것:** 고립 컨텍스트. 시스템 프롬프트와 공유 스킬, 전체 CLAUDE.md 파일, 그리고 작업 프롬프트가 포함된 새 컨텍스트.

**상속:** 서브에이전트는 메인 세션과 컨텍스트를 공유하지 않습니다. 결과만 메인 에이전트에게 반환됩니다.
:::
`)],-1)])]),_:1}),a(o,{title:"Hooks"},{default:d(()=>[...t[4]||(t[4]=[s(" **시점:** 이벤트 시점 ",-1),e("pre",null,[e("code",null,`**로드되는 것:** 없음(훅은 외부에서 실행됩니다).

**상속:** 훅이 결과를 추가 컨텍스트에 전달하지 않습니다. 하지만 훅이 알림이나 사이드 이펙트(예: 편집 후 Slack 전송)를 구현할 때는 훅이 메인 컨텍스트에 아무것도 추가하지 않습니다.
:::
`)],-1)])]),_:1})]),_:1}),t[14]||(t[14]=p("",32)),a(i,{cols:"{2}"},{default:d(()=>[a(l,{title:"CLAUDE.md",icon:"file-lines",href:"/memory"},{default:d(()=>[...t[5]||(t[5]=[s(" 프로젝트 컨텍스트, 규칙, 명령어 저장 ",-1)])]),_:1}),a(l,{title:"Skills",icon:"brain",href:"/skills"},{default:d(()=>[...t[6]||(t[6]=[s(" 재사용 가능한 지식과 호출 가능한 워크플로우 ",-1)])]),_:1}),a(l,{title:"서브에이전트",icon:"users",href:"/sub-agents"},{default:d(()=>[...t[7]||(t[7]=[s(" 고립된 작업을 위한 실행 컨텍스트 ",-1)])]),_:1}),a(l,{title:"에이전트 팀",icon:"network",href:"/agent-teams"},{default:d(()=>[...t[8]||(t[8]=[s(" 독립 세션 조율 ",-1)])]),_:1}),a(l,{title:"MCP",icon:"plug",href:"/mcp"},{default:d(()=>[...t[9]||(t[9]=[s(" 외부 서비스 연결 ",-1)])]),_:1}),a(l,{title:"Hooks",icon:"bolt",href:"/hooks"},{default:d(()=>[...t[10]||(t[10]=[s(" 이벤트 기반 자동화 ",-1)])]),_:1}),a(l,{title:"플러그인",icon:"puzzle-piece",href:"/plugins"},{default:d(()=>[...t[11]||(t[11]=[s(" 기능 패키징 및 배포 ",-1)])]),_:1}),a(l,{title:"마켓플레이스",icon:"store",href:"/plugin-marketplaces"},{default:d(()=>[...t[12]||(t[12]=[s(" 플러그인 공유 및 배포 ",-1)])]),_:1})]),_:1})])}const x=c(g,[["render",m]]);export{y as __pageData,x as default};
