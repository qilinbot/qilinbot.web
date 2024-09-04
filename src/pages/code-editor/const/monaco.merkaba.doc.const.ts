export const merkabaDoc = `
declare const webClient:WebClient
declare const trace:Trace
declare const page:WebPage
declare const context:Context
declare const pushService:PushService
declare const pushContext:object
declare const pushResults: Array<any>

type ErrorType = "DupOrdered" | "SupplierOutOfStock" | "ErrorInfo"
type PlatformHandleName = "CPS_WEB" | "O2O_WEB" |"O2O_API"
type PlatformType = "ExportedOrder"

/**
 * 推单对象
 */
declare class PushService {
  // 是否有待检查的Items数据
  checkRequired: boolean
  // 是否有待检查的Items数据
  toCheckItems: Array<object>
  // Items数据
  items: Array<object>
  // 错误的条目
  errorItems: Array<object>

  /**
   * 推单初始化
   * @param uri 业务初始化uri
   * @param pushContext 上下文参数
   * @return boolean
   */
  initialize(uri:string,pushContext:object) :boolean

  /**
   * 生成要下单的csv文件
   * @param pushContext 上下文参数
   * @return 文件绝对路径地址
   */
  generateOrderingCsvFile(pushContext:object) :string


  /**
   * 生成要下单的Xlsx文件
   * @param pushContext 上下文参数
   * @return 文件绝对路径地址
   */
  generateOrderingXlsxFile(pushContext:object) :string

  /**
   * 增加错误数据
   * @param errType 错误类型 |DupOrdered重复下单|SupplierOutOfStock供应商缺货|ErrorInfo错误信息
   * @param errObject 错误的相关数据对象
   */
  addErrorItem(errType:ErrorType,errObject:object):void


  /**
   * 删除指定位置的下单的货品，防止重复推单
   * @param index 指定位置
   */
  removeItemAtIndex(index:number):boolean

  /**
   * 删除指定位置的错误数据
   * @param index 指定位置
   */
  removeErrorAtIndex(index:number):boolean

  /**
   * 写excel文件,返回文件名称
   * @param heads excels表头
   * @param cells 内容
   * @return 文件名称
   */
  writeExcelX(heads:string[], cells:any[][]): string


  /**
   * 写csv文件,返回文件名称
   * @param cells 内容
   * @return 文件名称
   */
  writeCsv(cells:any[][]): string

  /**
   * 读取excel文件,返回文件内容
   * @param fileName 文件名称
   * @param fileExt 默认文件扩展名
   * @param charset 字符集【可选】
   * @return cells内容数组
   */
  readExcel(fileName:string,fileExt:string,charset?:string): string[][]

  /**
   * 开始推单，标注那些货品开始推单，如果失败便于回滚
   * @param  pushContext 上下文参数
   * @return 推单事务是否创建成功
   */
  startTx(pushContext:object): boolean


  /**
   * 回滚推单事务，回滚
   * @param  pushContext 上下文参数
   * @return 推单事务是否创建成功
   */
  rollbackTx(pushContext:object): boolean

  /**
   * 提交推单事务，标注具体哪些货品推单成功
   * @param  pushContext 上下文参数
   * @param  results 推单最后的结果数据返回
   * @return 推单事务是否结束
   */
  commitTx(pushContext:object,results:Array<object>): boolean

  /**
   * 读取平台同步的时间戳返回
   * @param platformHandleId 平台处理器 CPS_WEB,O2O_WEB,O2O_API等
   * @param platformTimeType 平台时间类型 ExportedOrder等
   * @return 返回平台同步时间对象{fromTime,toTime,clickDownTime}
   */
  readPlatformTime(platformHandleId:PlatformHandleName, platformTimeType:PlatformType):object

  /**
   * 同步已下单的订单数据
   * @param pushContext 上下文参数
   * @param fileName 已下单的excel文件
   * @return 返回本次多少条数据已经更新
   */
  syncOrderedItems(pushContext:Object, fileName:string):object

  /**
   * 处理推单的错误数据
   * @param pushContext 上下文参数
   * @param fileName[可选] 错误的exel文件
   * @return 返回错误的处理状态
   */
  handleError(pushContext:Object, fileName?:string):object
}



/**
 * 日志跟踪对象
 */
declare class Trace {
  /**
   * 在当前trace，增加消息
   * @param spanName 段落名称
   * @param message 消息
   * @return Trace
   */
  write(spanName:string,message:string) :Trace


  /**
   * 在当前trace下，增加子节点，并在子节点上增加消息
   * @param spanName 段落名称
   * @param message 消息
   * @return Trace
   */
  writeChild(spanName:string,message:string) :Trace

}

declare interface Context {
  //登录url
  loginUrl: string
  // 登录用户名
  loginUser: string,
  loginUserName:string,
  // 登录密码
  loginPassword: string,
  // 支付密码
  payPassword: string,
  //business Id
  bizId:string,
  //business Name
  bizName:string,
  //website name
  platform:string,
  //webSite type
  platormType:string,
  //当前登录账号id
  accountId:string,
  //是否要求登录
  requireLogin:boolean,
  //本次运行的任务id
  jobId:string,
  //本次运行的参数
  params:object,
  //绑定手机号
  mobile:string,
}


declare interface IImageTextInfo {
  // 序号
  index:number,
  // 文本
  text: string,
  // 准确率
  rate: number,
  // 起始坐标x
  x: number,
  // 起始坐标y
  y: number,
  // 文本所在区域宽度
  w: number,
  // 文本所在区域高度
  h: number
}
declare interface IOrcObj {
  isSuccess: boolean
  items: Array<IImageTextInfo>
}

declare interface ICoordinateInfo {
  y: number
  x: number
  width: number,
  height: number
}

declare interface IDeskBox extends ICoordinateInfo {
  frameIndex: number
}

declare interface IDecodeSlider {
  isSuccess: boolean
  // 背景图片的宽度
  w: number,
  // 要拖动的距离
  x: number
}

declare class WebPage {
  // 页面的Html源码
  html: string
  // 当前页面真实的网页地址
  location: string
  // 最初加载页面时传入的网页地址
  url: string
  /* WebClient对象 */
  client:WebClient
  /**
   * 在当前页面里面，加载一个页面,可以用此方法刷新或切换到新的页面
   * @param url
   * @param timeout 等待页面loaded完成最长等待时间
   */
  load(url:string, timeout:number)

  /**
   * 打开一个新页面url,返回新的页面对象
   * @param url   新页面地址
   * @param timeout 等待页面loaded完成最长等待时间
   */
  open(url:string,timeout:number):WebPage

  /* 关闭页面 */
  close()
  /**
   * 刷新页面
   */
  refresh()

  /**
   * 等待直到指定元素可见 page.waitVisible("div.items",5)
   * @param queryPath
   * @param second 最多等待多少秒
   * @return 如果可见返回1,否则0
   */
  waitVisible(queryPath:string,second:number):number

  /**
   * 等待直到指定元素可见[queryPath或queryPath2]其中的一个可见
   * @param queryPath
   * @param queryPath2[可选参数]
   * @param second 最多等待多少秒
   * @return 如果可见返回1或2[如果为2则queryPath2可见]，否则返回0
   */
  waitVisible(queryPath:string,queryPath2?:string,second?:number):number

  /**
   * 等待直到指定元素不可见
   * @param queryPath
   * @param second 最多等待多少秒
   * @return 如果不可见返回1,否则0
   */
  waitNotVisible(queryPath:string,second:number):number


  /**
   * 等待直到指定元素[queryPath或queryPath2]其中的一个可见
   * @param queryPath
   * @param queryPath2【可选参数】
   * @param second 最多等待多少秒
   * @return 如果不可见返回1或2[如果为2则queryPath2不可见]，否则返回0
   */
  waitNotVisible(queryPath:string,queryPath2:string,second?:number):number


  /**
   * 等待直到指定元素在dom不存在
   * @param queryPath
   * @param second
   * @return 如果在dom不存在返回1,否则0
   */
  waitNotPresent(queryPath:string,second:number):boolean

  /**
   * 等待直到指定元素[queryPath,queryPath2]其中的一个dom不存在
   * @param queryPath
   * @param queryPath2【可选参数】
   * @param second
   * @return 如果不存在返回1或2[如果为2则queryPath2不存在]，否则返回0
   */
  waitNotPresent(queryPath:string,queryPath2:string,second?:number):boolean

  /**
   * 等待元素的数组数量大于指定的count
   * @param queryPath
   * @param count
   */
  waitMoreThan(queryPath:string,count:number):boolean

  /**
   * 等待多少秒
   * @param 等待时间[秒]
   */
  wait(second:number)

  /**
   * 等待expression为true
   * @param expression 表达式，比如waitFor("!!document.querySelector('.foo')",10) 等待页面元素.foo不为空
   * @param timeout 最长等待时间[秒]
   * @return 表达式的返回值
   */
  waitFor(expression:string,timeout:number):string

  /**
   * 等待直到指定元素的属性值为attrValue
   * @param queryPath
   * @param attrName 属性名称
   * @param attrValue 属性值
   * @param second 最多等待多少秒
   * @return 如果相等返回true,否则false
   */
  waitAttrValue(queryPath:string,attrName,attrValue:String,second?:number):boolean

  /**
   * 等待直到指定元素的样式值为styleValue
   * @param queryPath
   * @param styleName 样式名称
   * @param styleValue 样式值
   * @param second 最多等待多少秒
   * @return 如果相等返回true,否则false
   */
  waitStyleValue(queryPath:string,styleName,styleValue:String,second?:number):boolean

  /**
   * 等待window或iframe加载完毕
   * @param queryPath 注意：仅仅支持css query表达式，比如waitLoad("window",10);waitLoad("iframe",10)
   * @param timeout 最长等待时间[秒]
   * @return 表达式的返回值
   */
  waitLoad(queryPath:string,timeout:number):string

  /**
   * 读取指定元素对应的文本内容
   * @param queryPath
   */
  text(queryPath:string)

  /**
   * 读取指定元素对应的值，比如Input对象
   * @param queryPath
   */
  value(queryPath:string)

  /**
   * 给指定元素设置值，比如对input ,select设置值
   * @param queryPath
   * @param value
   */
  setValue(queryPath:string,value:string)

  /**
   * 在指定的元素里面，模拟键盘输入
   * @param queryPath
   * @param value
   */
  sendKeys(queryPath:string,value:string)

  /**
   * 计算元素的样式，并返回指定样式名称的值，如width,height等
   * @param queryPath
   */
  styles(queryPath:string):object

  /**
   * 等待指定的图片元素加载完毕，返回src的链接
   * @param queryPath
   */
  imageReady(queryPath:string):string

  /**
   * 等待指定的图片元素src变化，并返回src的变化后的新值
   * @param queryPath
   * @param oldValue
   */
  imageChanged(queryPath:string,oldValue:string)

  /**
   * 鼠标点击指定的元素
   * @param queryPath
   */
  click(queryPath:string)

  /**
   *
   * @param queryPath
   * @param offset 拖动的横向距离
   */
  mouseDrag(queryPath:string,offset:number)

  /**
   *
   * @param queryPath
   */
  mouseOver(queryPath:string)

  /**
   * 选择满足条件的元素
   * @param query 支持两种查询方式 css query和xpath
   * @param timeout 该参数可选，可以指定最多等待多少秒
   */
  select(query:string,timeout?:number):WebElement

  /**
   * 选择满足条件的元素
   * @param query 支持两种查询方式 css query和xpath
   * @param timeout 该参数可选，可以指定最多等待多少秒
   */
  selects(query:string,timeout?:number):Array<WebElement>

  /**
   *
   * @param queryPath
   * @param fileName 本地文件名
   */
  upload(queryPath:String,fileName:String)

  /**
   * 在当前页面运行脚本
   * @param script
   */
  injectScript(script:string)

  /**
   * 读取当前页面代码中的变量
   * @param name
   */
  readScriptVar(name:string)

  /**
   * 下载图片
   * @param 图片url
   * @return 返回图片base64编码
   */
  downImage(url:string):string

  /**
   * 点击下载文件
   * @param query 支持两种查询方式 css query和xpath
   * @param timeout 该参数可选，可以指定最多等待多少秒
   * @return 返回文件名路径
   */
  clickDown(query:string,timeout?:number):string

  /**
   * 保存当前页面的html到tmp目录
   * @param fileName 文件名
   * @param timeout 该参数可选，可以指定最多等待多少秒
   * @return 返回文件名路径
   */
  saveHtml(fileName)

  /**
   * 回退到上一页
   */
  goBack()
}

/** 一个WebElement,对应一个页面的Dom元素 */
declare class WebElement {
  // 元素的Html
  html:any
  // 元素的文本
  text:string
  // 元素的值
  value:any
  // 元素的样式map
  styles:any
  // 元素的坐标信息
  clientRect: ICoordinateInfo
  /* 读取元素所有的属性，不包含计算属性如width,height等 */
  attrs:object

  /**
   * 读取元素属性的值，比如offsetTop等
   * @param key
   */
  attr(key:string):object

  /**
   * 显示这个元素
   */
  show()

  /**
   * 设置元素属性值
   * @param key
   * @param value
   */
  setAttr(key:string,value:string)
  /* 给元素快照，返回base64编码后的值 */
  shot():string
  /* 在元素上鼠标点击 */
  click()
  /* 在元素上鼠标点击，并返回新页面(在点击打开新页面的情况下使用) */
  clickPage():WebPage

  /**
   * 在当前元素下，选择满足条件的子元素列表
   * @param query 支持两种查询方式 css query和xpath
   * @param timeout 该参数可选，可以指定最多等待多少秒
   */
  select(query:string,timeout?:number):WebElement

  /**
   * 在当前元素下，选择满足条件的子元素列表
   * @param query 支持两种查询方式 css query和xpath
   * @param timeout 该参数可选，可以指定最多等待多少秒
   */
  selects(query:string,timeout?:number):Array<WebElement>

  /**
   * 给指定元素设置值，比如对input ,select设置值
   * @param value
   */
  setValue(value:string)

  /**
   * 在指定的元素里面，模拟键盘输入
   * @param value
   */
  sendKeys(value:string)

  /**
   * 等待指定的图片元素加载完毕，返回src的链接
   * @param queryPath
   */
  imageReady(queryPath:string):string

  /**
   * 等待指定的图片元素src变化，并返回src的变化后的新值
   * @param queryPath
   * @param oldValue
   */
  imageChanged(queryPath:string,oldValue:string)

  /**
   *
   * @param queryPath
   * @param offset offset为拖动的横向距离
   */
  mouseDrag(queryPath:string,offset:number)

  /*  */
  mouseOver(queryPath:string)

  /* 将元素滚动到可见区域 */
  scrollIntoView()

  /**
   * 等待直到指定元素可见
   * @param queryPath
   * @param second  最多等待多少秒
   * @return 如果可见返回1,否则0
   */
  waitVisible(queryPath:string,second:number):number

  /**
   * 等待直到指定元素可见[queryPath或queryPath2]其中的一个可见
   * @param queryPath
   * @param queryPath2[可选参数]
   * @param second 最多等待多少秒
   * @return 如果可见返回1或2[如果为2则queryPath2可见]，否则返回0
   */
  waitVisible(queryPath:string,queryPath2:string,second:number):number

  /**
   * 等待直到指定元素的内容和以前的oldHtml的值不同
   * @param queryPath
   * @param oldhtml
   * @param second  最多等待多少秒
   * @return boolean 如果变化返回true,否则false
   */
  waitChanged(queryPath:string,oldhtml:string,second:number):boolean


}

/** 一个WebClient对象，对应一个Chrome浏览器 */
declare class WebClient {

  /**
   * 当前的页面对象
   * */
  page: WebPage

  /**
   * 返回一个WebPage对象
   * @param {string} url
   */
  pageBy(url:string): WebPage

  /**
   * 在当前页面，加载一个页面,返回一个WebPage对象 例如：client.load("https://www.google.com/search?keyword=iphone");
   * @param url 地址
   * @param timeout 最长等待时间[秒]
   */
  load(url:string,timeout:number):WebPage

  /**
   * 在新建的窗口，加载指定的页面,返回一个WebPage对象 例如：client.load("https://www.google.com/search?keyword=iphone");
   * @param url 地址
   * @param timeout 最长等待时间[秒]
   */
  open(url:string,timeout:number):WebPage

  /**
   * 创建一个新的tab浏览器
   * @param domain,页面的域名
   */
  clone(domain:string): WebClient

  /**
   *保存cookies的数据到conf目录下，文件名为"$taskName".json
   */
  saveCookies()

  /**
   * 删除conf目录下cookie文件"$taskName".json
   * */
  clearCookies()

  /**
   *刷新浏览器
   * */
  refresh()

  /**
   *  关闭浏览器
   * */
  close()

  /**
   * 滑块验证登录
   * @param background 背景图片
   * @param templateWidth 滑块像素px宽度
   * @return IDecodeSlider
   */
  decodeSlider1(background: string, templateWidth: number):IDecodeSlider

  /**
   * 京东登录页面的滑块验证登录
   * @param template 滑块的图片
   * @param background 背景图片
   * @return IDecodeSlider
   */
  decodeSlider2(template: string, background: string): IDecodeSlider

  /**
   * 解析图片中的文字
   * @param image 图片的base64编码
   * @return IOrcObj
   */
  ocr(image:string):IOrcObj

  /**
   * 发送http post请求 如果错误，会返回{ "isSuccess":false, "error":"错误内容" }
   * @param url 指定的网址
   * @param param json对象
   * @return object 返回json对象
   */
  httpPost(url,param:object):object

}

declare class DeskClient {
  constructor(programName: string, debug: boolean)
  /**
   * 找到打开的窗口,返回DeskWindow对象
   * @param name 给窗口自定义一个名字
   * @param className 窗口在window系统中的类名
   * @param showMax[可选] 是否窗口以最大的方式显示
   * @return DeskWindow 返回DeskWidnow对象
   */
  findWindow(name:string,className:string,showMax?:boolean):DeskWindow

  /**
   * 等待指定的窗口出现，超过timeout秒窗口未出现返回为nil
   * @param name 给窗口自定义一个名字
   * @param className 窗口在window系统中的类名
   * @param timeout[可选] 超过timeout秒，如果窗口未出现返回为nil
   * @param showMax[可选] 是否窗口以最大的方式显示
   * @return DeskWindow 返回DeskWidnow对象
   */
  waitWindow(name:string,className:string,timeout?:number,showMax?:boolean):DeskWindow

  /**
   * 设置代码对应的屏幕坐标系，如果在大的显示器上运行，它会根据这个值等比缩放
   * @param width 屏幕宽度
   * @param height 屏幕高度
   * @param dpi 如果显示比例100则为1，如果为150则为1.5,以此类推
   */
  screen(width:number,height:number,dpi:number)
}

declare class DeskWindow {
  /**
   * 窗口的坐标
   * */
  bound:DeskBox

  /**
   * 刷新窗口的handle等属性，在切换账号窗口时使用比如JM
   * */
  refresh()

  sendKeys()

  /**
   * 找到子窗口,返回DeskWindow对象
   * @param name 给窗口自定义一个名字
   * @param className 窗口在window系统中的类名
   * @return DeskWindow 返回DeskWidnow对象
   */
  findWindow(name:string,className:string):DeskWindow

  /**
   * 等待指定的子窗口出现，超过timeout秒窗口未出现返回为nil
   * @param name 给窗口自定义一个名字
   * @param className 窗口在window系统中的类名
   * @param timeout[可选] 超过timeout秒，如果窗口未出现返回为nil
   * @return DeskWindow 返回DeskWidnow对象
   */
  waitWindow(name:string,className:string,timeout?:number):DeskWindow

  /**
   * 滚动到指定的位置
   * @param box DeskBox对象
   * @param texts[] 文本字符串数组
   * @param icons[] 图标数组
   * @param direction 滚动方向up|down|left|right
   * @param offset 仅仅识别box的边缘区域
   * */
  scrollUtil(box:DeskBox,texts:string[],icons:string[],direction:string,offset:number):boolean
  /**
   * 识别【整个窗口】
   * @param icons 要识别的图标列表，不识别传null即可
   * @return DeskView 返回视觉结果对象
   * */
  seeWindow(icons?:string[]):DeskView

  /**
   * 在指定的【视觉块中frameIndex】,选择一块指定的区块
   * @param name 自定义box的名字
   * @param frameIndex 视觉块序号
   * @param x 相对于视觉块起点的x坐标
   * @param y 相对于视觉块起点的y坐标
   * @param width 宽度
   * @param height 高度
   * @return DeskBox 返回区块对象
   * */
  selectBox(name:string,frameIndex:number,x:number,y:number,width:number,height:number):DeskBox

  /**
   * 视觉块的坐标
   * @param name 自定义box的名字
   * @param frameIndex 视觉块序号
   * @return DeskBox 返回区块对象
   * */
  boxOf(name:string,frameIndex:number):DeskBox


  /**
   * 在最左边的【视觉块】中,选择一块指定的区块
   * @param name 自定义box的名字
   * @param x 相对于视觉块起点的x坐标
   * @param y 相对于视觉块起点的y坐标
   * @param width 宽度
   * @param height 高度
   * @return DeskBox 返回区块对象
   * */
  leftBox(name:string,x:number,y:number,width:number,height:number):DeskBox

  /**
   * 在最右边的【视觉块】中,选择一块指定的区块
   * @param name 自定义box的名字
   * @param x 相对于视觉块起点的x坐标
   * @param y 相对于视觉块起点的y坐标
   * @param width 宽度
   * @param height 高度
   * @return DeskBox 返回区块对象
   * */
  rightBox(name:string,x:number,y:number,width:number,height:number):DeskBox

  /**
   * 识别【选择的区块】
   * @param box 区块对象
   * @param icons 要识别的图标列表，默认不识别传null即可
   * @return DeskView 返回视觉结果对象
   * */
  see(box:DeskBox,icons?:string[]):DeskView

  seeAll()

  /**
   * 识别【视觉块】对象
   * @param frameIndex 视觉块序号
   * @param icons 要识别的图标列表，不识别传null即可
   * @return DeskView 返回视觉结果对象
   * */
  seeFrame(frameIndex:number,icons?:string[]):DeskView


  /**
   * 等待窗口加载完成(>=最小布局数量),系统会识别当前窗口的视觉布局
   * @param minCount 最小布局数量
   * @param forceCheck 强制重新识别布局
   * @param timeout 最大等待时间(s)
   * @return 返回视觉布局块的数量
   * */
  waitFrames(minCount:number,forceCheck:boolean,timeout?:number):number

  /**
   * 等待文本或图标可见
   * @param box 区块对象
   * @param texts 要识别的文本列表，不识别传null即可
   * @param icons 要识别的图标列表，不识别传null即可
   * @param timeout 最长等待时间，默认为5秒
   * @return DeskView 返回视觉结果对象
   * */
  waitVisible(box:DeskBox,texts:string[],icons?:string[],timeout?:number):DeskView

  close()

  /**
   *
   * 键盘输入文本内容
   * @param text 文本内容
   * @return DeskWindow 返回对象本身
   * */
  sendKeys(text:string):DeskWindow

  /**
   *
   * 键盘输入特定键,比如keyTap('a',['ctrl'])，意思是全选
   * @param key 字符串
   * @param controls 控制键
   * @return DeskWindow 返回对象本身
   * */
  keyTap(text:string,controls:string[]):DeskWindow

  /**
   *
   * 关闭窗口
   * */
  close()

  // see() {}

  /**
   * 鼠标单击
   * @param x x坐标
   * @param x y坐标
   * @return DeskWindow 返回对象本身
   * */
  click(x:number,y:number):DeskWindow

  /**
   * 鼠标双击
   * @param x x坐标
   * @param x y坐标
   * @return DeskWindow 返回对象本身
   * */
  dblClick(x:number,y:number):DeskWindow

  /**
   * 鼠标滚动
   * @param x x坐标
   * @param x y坐标
   * @return DeskWindow 返回对象本身
   * */
  scroll(x:number,y:number):DeskWindow

  /**
   * 读取剪切板
   * @return string 返回字符串
   * */
  readClipboard():string

}

/** 一个指定【视觉块】中的区块对象*/
declare class DeskBox {
  /*指定的视觉块序号*/
  frameIndex: number
  /*区块的名称*/
  name: string
  /*相对于区块的x坐标*/
  x: number
  /*相对于区块的y坐标*/
  y: number
  /*区块的宽度*/
  width: number
  /*区块的高度*/
  height: number
  /**
   * 截取左侧区域
   * @param width 要截取的宽度
   * @param height 要截取的高度
   * @return DeskBox
   * */
  leftOf(width:number,height:number):DeskBox

  /**
   * 截取右侧区域
   * @param width 要截取的宽度
   * @param height 要截取的高度
   * @return DeskBox
   * */
  rightOf(width:number,height:number):DeskBox

}


/** 视图对象*/
declare class DeskView {
  /**
   * 是否包含文本内容
   * @param text 文本内容
   * @param fullMatch 是否完全匹配，如果false相识度要大于80
   * @return bool
   * */
  hasText(text:string,fullMatch?:boolean):boolean

  /**
   * 按行列查找文本元素
   * @param row 在第几行
   * @param col 在第几列
   * @return DeskElement 桌面元素
   * */
  cell(row:number,col:number):DeskElement

  /**
   * 查找文本元素
   * @param text 文本内容
   * @param fullMatch 是否完全匹配，如果false相识度要大于80
   * @param startRow 从第几行开始，默认0
   * @param size 找几行，默认全部行
   * @return DeskElement 桌面元素
   * */
  findText(text:string,fullMatch?:boolean,startRow?:number,size?:number):DeskElement

  /**
   * 查找文本元素列表
   * @param text 文本内容
   * @param fullMatch 是否完全匹配，如果false相识度要大于80
   * @param startRow 从第几行开始，默认0
   * @param size 找几行，默认全部行
   * @return Array<DeskElement> 桌面元素列表
   * */
  findTexts(text:string,fullMatch?:boolean,startRow?:number,size?:number):Array<DeskElement>

  /**
   * 查找图标元素
   * @param name 图标名称
   * @param startRow 从第几行开始，默认0
   * @param size 找几行，默认全部行
   * @return DeskElement 桌面元素
   * */
  findIcon(name:string,startRow?:number,size?:number):DeskElement

  /**
   * 查找图标元素列表
   * @param text 文本内容
   * @param startRow 从第几行开始，默认0
   * @param size 找几行，默认全部行
   * @return Array<DeskElement> 桌面元素列表
   * */
  findIcons(name:string,startRow?:number,size?:number):Array<DeskElement>
}

/** 桌面元素对象*/
declare class DeskElement {
  rightOf()
  bottomOf()
  /**
   * 元素的文本内容
   * */
  text:string

  /**
   * 鼠标单点
   * @return DeskElement 桌面元素
   * */
  click():DeskElement

  /**
   * 鼠标双击
   * @return DeskElement 桌面元素
   * */
  dblClick():DeskElement

  /**
   * 元素的位置移动到元素的最右边+偏移量
   * @return DeskElement 桌面元素
   * */
  right(offset:number):DeskElement
  /**
   * 元素的位置移动到元素的最右边+偏移量
   * @return DeskElement 桌面元素
   * */
  bottom(offset:number):DeskElement

}

/**
 *  发送业务数据data,到pulsar 队列
 * @param format 指定的格式名称
 * @param data
 * @return 如果返回true,即为发送成功
 */
declare function sendData(format:string,data:object) : boolean

/** 等待多少毫秒 */
declare function wait(tiemout:number):void

/** 读取输入的参数，如果不存在用默认值 */
declare function paramBy(name:string, defaultValue?:string)

/** 请手工在go的开发环境，打开builtin_global.go文件，定位到 builtin_breakPoint，进行设置断点调试。 */
declare function breakPoint(name:string)

/** 读取验证码，accountId为登录账号 */
declare function readSms(accountId: string):string


/** 远程调用server微服务，remoteCall("order.checker",{orderId:"000"})，其中fileName为可选,是否携带文件的字节码数据 */
declare function remoteCall(funcName: string, data: object, fileName?: string):object

/** grpc调用server里merkaba.onDataReceived方法,处理业务数据，并返回结果 */
declare function handleData(format:string, data:object):object

/** grpc调用server里merkaba.onFileReceived方法，处理字节流数据，并返回结果
 *@param data :json的参数，里面包含format，和业务数据
 *@param fileName： 你要发送的文件
 */
declare function handleFile(data:object, fileName:string):object

/** tryLock  锁，如果返回true就代表琐成功了
 *@param name:锁的名称
 *@param minutes:设置锁住的时间
 */
declare function tryLock(name:string, minutes?:number):boolean

/** unlock解锁
 *@param name:锁的名称
 */
declare function unlock(name:string):boolean
/**feedback
 * @param param
 * @param results
 * @return boolean
 * */
declare function feedback(param: map<string>, results:map<string>): boolean

/** 写文件，并返回文件绝对路径 */
declare function writeFile(fileName:string, fileContent:string):string
/** 读取文件，并返回文件内容,如果enableBase64=true,会转为base64 */
declare function readFile(fileName:string, enableBase64:boolean):string

/** 删除文件 返回布尔值  */
declare function removeFile(fileName:string):boolean

/** 下载url连接，保存到fileName中，并返回系统存储的绝对路径 */
declare function downFile(url:string, fileName:string):string

/** 比较两个字符串的相识度，返回0-100的相识度的浮点值 */
declare function compareText(source:string, dest:string):number

/** 其中level可选，默认为info,bizType和参数由接收端处理，示例
 writeServiceLog("log_order_customer_service",{"orderId":"1111111","title":"测试","content":"测试"}); */
declare function writeServiceLog(bizType:string, logParam:object, level?:string);

declare var exports: any;

`
