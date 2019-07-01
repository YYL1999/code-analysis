/**
 * 由Vue源码灵感来得
 * 曾宇宙条有这样一道面试题，一个构造函数，每调用一次，其属性+1；
 * 今日得知其缘起VUE源码
 */

let uid=0

function Test(){
  this.init()
}
Test.prototype.init=function(){
    const v=this
    v.uid=uid++
}
var test1=new Test()
console.log(test1)
var test2=new Test()
console.log(test2)