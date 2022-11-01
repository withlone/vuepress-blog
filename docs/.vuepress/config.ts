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
      { text: '工具', link: '/tool/' },
      { text: '常用表', link: '/always/network' },
      { text: '基础知识', link: '/basic/network' },
      {
        text: '数据库',
        items: [
          {
            text: 'MySQL',
            link: '/database/mysql'
          }
        ]
      },
      {
        text: 'Java',
        items: [
          {
            text: '理论知识',
            items: [
              {
                text: '基础理论',
                link: '/java/theory/basic/basic'
              },
              {
                text: '多进程',
                link: '/java/theory/multi_process/basic'
              },
              {
                text: 'JVM',
                link: '/java/theory/jvm/basic'
              }
            ]
          },
          {
            text: 'SpringBoot',
            items: [
              {
                text: 'bugs',
                link: '/java/springboot/bug'
              }
            ]
          }
        ]
      },
      {
        text: '框架',
        items: [
          {
            text: 'SpringCloud',
            link: '/framework/springcloud/'
          },
          {
            text: 'Dubbo',
            link: '/framework/dubbo/'
          }
        ]
      },
      { text: '待整理', link: '/unorganized/' },
      { text: '生活', link: '/life/' },
      { text: '系统安装', link: '/system/' },
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
        children: ['network', 'theory', 'definition']
      }],
      '/java/theory/': [{
        title: '基础理论',
        collapsable: false,
        children: ['basic/basic', 'basic/mechanism', 'basic/collection']
      }, {
        title: '多线程',
        collapsable: false,
        children: ['multi_process/basic', 'multi_process/javalib']
      }, {
        title: 'JVM',
        collapsable: false,
        children: ['jvm/basic', 'jvm/gc']
      }],
      '/framework/springcloud/': [{
        title: 'SpringCloud',
        collapsable: false,
        children: ['', 'netflix', 'alibaba']
      }]
    },
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    ['vuepress-plugin-code-copy', {}], '@vuepress/plugin-medium-zoom'
  ],
  // base: '/camille/', // 构建到github上时使用该代码
  dest: './build'
});