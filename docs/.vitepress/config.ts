import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code 한국어 문서',
  description: 'Anthropic Claude Code What\'s New 한국어 번역 — 매주 주요 업데이트 요약',
  lang: 'ko-KR',
  base: '/claude-code-docs-ko/',
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    ['meta', { name: 'author', content: '한준구' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
  ],

  sitemap: {
    hostname: 'https://jkf87.github.io/claude-code-docs-ko/',
  },

  themeConfig: {
    nav: [
      { text: '홈', link: '/' },
      { text: "What's New", link: '/whats-new/' },
    ],

    sidebar: [
      {
        text: "What's New",
        items: [
          { text: '전체 목록', link: '/whats-new/' },
          { text: 'Week 15 (4/6–10)', link: '/whats-new/2026-w15' },
          { text: 'Week 14 (3/30–4/3)', link: '/whats-new/2026-w14' },
          { text: 'Week 13 (3/23–27)', link: '/whats-new/2026-w13' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jkf87/claude-code-docs-ko' },
    ],

    outline: { label: '목차', level: [2, 3] },
    lastUpdated: { text: '마지막 수정' },
    docFooter: { prev: '이전', next: '다음' },
    returnToTopLabel: '맨 위로',
  },
})
