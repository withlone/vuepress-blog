import { defineConfig } from "vuepress/config"

export default defineConfig({
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Never See',
      description: '不见'
    }
  },
  themeConfig: {
    lastUpdated: '最后更新时间',
    nav: [
      { text: '常用表', link: '/always/network' },
      { text: '基础知识', link: '/basic/network' },
      {
        text: 'Java',
        items: [
          {
            text: '基础理论',
            link: '/java/basic'
          },
          {
            text: '多进程',
            link: '/java/multi_process/basic'
          }
        ]
      },
      { text: '待整理', link: '/unorganized/' },
      { text: '摆烂', link: '/game/' },
      { text: '生活', link: '/life/' },
    ],
    sidebar: {
      '/always/': [{
        title: '常用表',
        collapsable: false,
        children: ['network', 'protocol']
      }],
      '/basic/': [{
        title: '基础知识',
        collapsable: false,
        children: ['network', 'theory']
      }],
      '/java/': [{
        title: '基础理论',
        collapsable: false,
        children: ['basic', 'mechanism', 'collection']
      },{
        title: '多线程',
        collapsable: false,
        children: ['multi_process/basic']
      }]
    },
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    ['vuepress-plugin-code-copy', {}]
  ],
  // base: '/camille.github.io/', // 构建到github上时使用该代码
  dest: './build'
});