import{_ as k,C as e,o as d,c as r,ae as h,E as a,w as l,a as n,j as i}from"./chunks/framework.BEtfQoF7.js";const m=JSON.parse('{"title":"Skills로 Claude 확장하기","description":"Claude Code에서 Claude의 기능을 확장하는 Skills를 생성, 관리, 공유하세요. 커스텀 명령어와 번들 Skills를 포함합니다.","frontmatter":{"title":"Skills로 Claude 확장하기","description":"Claude Code에서 Claude의 기능을 확장하는 Skills를 생성, 관리, 공유하세요. 커스텀 명령어와 번들 Skills를 포함합니다."},"headers":[],"relativePath":"skills.md","filePath":"skills.md","lastUpdated":1776205703000}'),o={name:"skills.md"};function E(c,s,g,F,y,C){const t=e("Step"),p=e("Steps");return d(),r("div",null,[s[3]||(s[3]=h("",11)),a(p,null,{default:l(()=>[a(t,{title:"Skill 디렉토리 생성"},{default:l(()=>[...s[0]||(s[0]=[n(" 개인 Skills 폴더에 Skill 디렉토리를 만드세요. 개인 Skills는 모든 프로젝트에서 사용 가능합니다. ",-1),i("pre",null,[i("code",null,"```bash\nmkdir -p ~/.claude/skills/explain-code\n```\n")],-1)])]),_:1}),a(t,{title:"SKILL.md 작성"},{default:l(()=>[...s[1]||(s[1]=[n(" 모든 Skill에는 두 부분으로 구성된 `SKILL.md` 파일이 필요합니다: Skill을 언제 사용할지 Claude에게 알려주는 YAML 프론트매터(`---` 마커 사이)와, Skill이 호출될 때 Claude가 따르는 지침이 담긴 마크다운 내용. `name` 필드는 `/slash-command`가 되고, `description`은 Claude가 자동으로 로드할 시기를 결정하는 데 도움을 줍니다. ",-1),i("pre",null,[i("code",null,`\`~/.claude/skills/explain-code/SKILL.md\` 생성:

\`\`\`yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
\`\`\`
`)],-1)])]),_:1}),a(t,{title:"Skill 테스트"},{default:l(()=>[...s[2]||(s[2]=[n(" 두 가지 방법으로 테스트할 수 있습니다: ",-1),i("pre",null,[i("code",null,`**Claude가 자동으로 호출하도록 하기** — 설명과 일치하는 질문하기:

\`\`\`text
How does this code work?
\`\`\`

**또는 직접 호출하기** — Skill 이름으로:

\`\`\`text
/explain-code src/auth/login.ts
\`\`\`

어느 방법이든 Claude는 설명에 비유와 ASCII 다이어그램을 포함해야 합니다.
`)],-1)])]),_:1})]),_:1}),s[4]||(s[4]=h("",131))])}const B=k(o,[["render",E]]);export{m as __pageData,B as default};
