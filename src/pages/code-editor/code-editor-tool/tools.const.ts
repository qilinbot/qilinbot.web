
export const tools: Array<ITool> = [
  {
    title: '工作区',
    icon: 'xpa-window-restore',
  },
  {
    title: '脚本配置',
    icon: 'xpa-shezhi',
  },
  {
    title: '大纲',
    icon: 'xpa-script_task',
  },
  {
    title: '调试',
    icon: 'xpa-debug',
  },
]


export interface ITool {
  title: string
  icon: string
  isActive?: boolean,
  size?: number
}
