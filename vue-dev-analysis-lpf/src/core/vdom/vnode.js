/* @flow */
/**
 * 虚拟dom结构 
 * 
 */
export default class VNode {
  tag: string | void;//标签
  data: VNodeData | void;//数据,包括属性、、样式、数据、等等
  children: ?Array<VNode>;//子节点
  text: string | void;//文本
  elm: Node | void;//关联的原生节点
  ns: string | void;//命名空间 namespace
  context: Component | void; // 当前节点的编译作用域
  key: string | number | void;//唯一值 性能优化 
  componentOptions: VNodeComponentOptions | void;//创建组件实例会用到的选项信息
  componentInstance: Component | void; // 当期节点对应的组件实例
  parent: VNode | void; // 当前节点的父节点

  // strictly internal
  raw: boolean; // 判断是否为HTML或普通文本，innerHTML的时候为true，innerText的时候为false
  isStatic: boolean; // 静态节点的标识
  isRootInsert: boolean; // 是否作为根节点插入，被包裹的节点，该属性的值为false
  isComment: boolean; // 当前节点是否为注释节点
  isCloned: boolean; // 当前节点是否为克隆节点
  isOnce: boolean; // 是否有v-once指令
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
//没有内容的注释节点
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
//文本节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

//克隆节点 可以为任何类型 区别在于isClone为true
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
