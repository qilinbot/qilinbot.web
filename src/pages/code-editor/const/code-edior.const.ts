//梅尔卡巴页面的编辑状态

//  面板配置
export const MerkabaPanels = [
  {
    active: true,
    name: '脚本配置',
    disabled: false
  },
  {
    active: true,
    name: 'merkaba节点',
    disabled: false
  }, {
    active: true,
    disabled: false,
    name: '参数列表'
  },{
    active: true,
    disabled: false,
    name: '视觉识别'
  }, {
    active: true,
    disabled: false,
    name: '变量监视'
  }
];

export const MerkabaParamTypes: any = [
  {id: 0, name: 'string'},
  {id: 1, name: 'int'},
];

export const MerkabaFormFields = [
  {
    inputType: 'select',
    label: '类型',
    key: 'type',
    required: true,
    displayExpr: 'name',
    valueExpr: 'type',
    requiredMessage: '请选择类型'
  },
  {
    inputType: 'text',
    label: 'Name',
    key: 'name',
    required: true,
    requiredMessage: '请填写文件名称'
  },
  {
    inputType: 'text',
    label: 'Title',
    key: 'title',
    required: true,
    requiredMessage: '请填写文件描述'
  }
];

export const MerkabaFieldTypes = [
  { id: 0, name: '平台' },
  { id: 1, name: '文件夹' },
  { id: 2, name: '脚本' },
]
