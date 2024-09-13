import * as string_decoder from "string_decoder";

export const ArgusConfig: Argument[] = [
  {argusName: 'proxy', title: '是否启用代理',
    editorConfig: [
      {title: "代理IP：", placeHolder: '请输入代理IP'}
    ]
  },
  {argusName: 'login', title: '是否需要登录',
    editorConfig: [
      {title: "登录账号：", placeHolder: '选择登录账号'},
      {title: "网站URL：", placeHolder: '请输入登录网站URL'},
      {title: "登录脚本：", placeHolder: '选择登录的脚本'},
      {title: "登录超时：", placeHolder: '登录最大超时时间'}
    ]
  },
  {argusName: 'cancelHeader', title: '启用无头模式'},
  {argusName: 'autoRelease', title: '是否自动释放'},
  {argusName: 'startVNC', title: '是否启用VNC'},
]


export interface Argument {
  argusName: string,
  title: string,
  editorConfig?: {
    title: string,
    placeHolder?: string
  }[];
}
