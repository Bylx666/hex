# Plugins

见[/js/plugin.js](/js/plugin.js)

## 插件编写须知

1. 插件是异步加载，意思就是插件不可能在文档之前加载好
2. 使用`this.require("http://a.com/jq.min.js", "http://b.com/vue.min.js").then((plugList)=> {plugList[0] instanceof HexPlugin})`​来使用插件依赖
3. 加载Jq框架的话你需要使用`var jq = jQuery.noConflict();`​
4. 插件的结束可以用return返回一个值，在另一个插件中`var plug = HexPlugins.load(src)`​的`plug.on("load", (e)=>e.return)`​获取返回值。(onload不能取消cancel，可以用loadstart拦截load事件)

插件的原理是下载代码然后传进new Function，所以可以有返回值。

在插件内可以使用`this`​自由访问`HexPlugin`​实例的属性和方法。

## 插件列表`HexPlugins`​-`Object`​

### 属性

​`enabled: String[]`​启用了的插件的url列表，插件名等信息会在插件加载完显示

​`disabled: Object{name,src,srcName,desc}[]`​禁用了的插件的信息列表

​`all: HexPlugin[]`​插件总列表

### 方法

​`load(src: String, from?)`​加载一个插件

‍

## 插件类`HexPlugin`​实例

### 构造函数

​`new HexPlugin(src: String, from?)`​返回一个插件对象

### 属性

​`conf: Object`​插件显示的详情

```js
{
  name: String, // 插件名
  src: String, // 插件url
  srcName: String, // 插件url显示名称
  desc: String // 介绍,可以用\n和html
 };
```

​`return: any`​插件返回值

​`loaded: Number`​0未调用load,1调用了load但没加载好,2加载好了

​`elem: Element`​插件的dom

​`from: String`​构造时指定的`from`​

### 方法

​`load(from?)`​开始加载插件并自动`enable()`​

​`enable(from?)`​启用插件，没加载的话自动加载`load()`​

​`disable(from?)`​禁用插件，不能立刻禁用只能改变状态，下次启动时不会立即加载

​`require(...src: String[])-> Promise.then((HexPlugin[])=>{})`​在插件中使用插件依赖。

‍
