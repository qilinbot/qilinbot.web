
export const tools: Array<ITool> = [
  {
    title: '文件夹',
    icon: 'qilin-QT_wenjianshezhi_mianxing',
    component: 'fileFolder'
  },
  {
    title: '脚本配置',
    icon: 'qilin-QT_canshushezhi_mianxing',
    component: 'editorSettings'
  },
  {
    title: '变量监控',
    icon: 'qilin-QT_bianliang_mianxing',
    component: 'variableWatcher'
  },
  {
    title: '大纲树',
    icon: 'qilin-QT_dagang_mianxing',
    component: 'outlineTree'
  },
]


export interface ITool {
  title: string
  icon: string
  component: any
  isActive?: boolean,
  size?: number
}
