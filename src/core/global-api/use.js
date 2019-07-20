/* @flow */

import { toArray } from '../util/index'
//用use来使用插件
/**
 * 
 * @param {*} Vue 
 * 
 */
export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    //定义一个数组，保存已经注册的插件 如果插件已经注册，返回该插件
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    /**
     * 参数本身是函数，则改变函数的this并调用
     * 参数的属性install是函数，则调用install
     * 最后将插件插入已经注册的数组
     */
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
