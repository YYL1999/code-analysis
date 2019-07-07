/* @flow */
/**
 * 新节点：Vue 编译生成的虚拟节点
 * 旧节点： 上一个虚拟节点
 */
import { emptyNode } from 'core/vdom/patch'
import { resolveAsset, handleError } from 'core/util/index'
import { mergeVNodeHook } from 'core/vdom/helpers/index'
/**
 * 创建自定义指令的操作
 * 即create,update,destory三个函数
 */
export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}
//更新指令 新旧节点任何一个含有data.directives属性就进行更新
function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}

function _update (oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode//旧节点是否为空对象
  const isDestroy = vnode === emptyNode//新节点是否为空对象
  /**
   * 得到每个具体的指令，暂时看来实现了两件事
   * 将数组转换成了对象，重写了每个指令的def属性
   */
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []
/**
 * 循环遍历新新节点的指令
 * 如果旧节点没有新节点的指令，创建一个新指令，调用每个指令本身def属性有个fn函数进行创建
 * 如果旧节点存在新节点的指令，将旧指令的值赋值给新指令（其实是一样的指令），然后进行更新
 */
  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]//将旧节点指令赋值，如果没有该指令则为undefined
    dir = newDirs[key]
    if (!oldDir) { 
      // new directive, bind
      callHook(dir, 'bind', vnode, oldVnode)//创建新指令，
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value
      dir.oldArg = oldDir.arg
      callHook(dir, 'update', vnode, oldVnode)
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }
  /**
   * 如果新创建了指令就执行
   * 
   */
  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }
 /**
  * 如果有相同的指令
  */
  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }
 /**
  * 如果旧节点不为空 把所有的旧指令与新指令比较
  * 不存在的指令则删除
  */
  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }
}
//创建一个空对象，下面要用到
const emptyModifiers = Object.create(null)

function normalizeDirectives (
  dirs: ?Array<VNodeDirective>,
  vm: Component
): { [key: string]: VNodeDirective } {
  const res = Object.create(null)//创建一个新的空对象
  //如果没有节点的指令，则返回一个空对象
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  let i, dir
  /**
   * 循环进行判断
   * 如果节点的每个指令有modifiers属性，就给res添加属性，且值为每个指令，并为每个指令的def属性重新赋值
   * 否则添加属性并赋初值为空对象
   * 最后返回res
   * 
   */
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i]
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers
    }
    res[getRawDirName(dir)] = dir
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true)//一系列操作  暂时只知道返回$options.type的某个属性
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir: VNodeDirective): string {
  return dir.rawName || `${dir.name}.${Object.keys(dir.modifiers || {}).join('.')}`
}

function callHook (dir, hook, vnode, oldVnode, isDestroy) {
  const fn = dir.def && dir.def[hook]
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy)
    } catch (e) {
      handleError(e, vnode.context, `directive ${dir.name} ${hook} hook`)
    }
  }
}
