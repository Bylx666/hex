# Utils

见[/js/h.js](/js/h.js)

## 文档document

### `$`​-`Object`​

不是jq,用jq做插件的话也注意用一下`noConflict`​模式

​`i(i: String)`​就是document.getElementById

​`c(tagName: String, innerHTML?: String, parentNode: Element)-> Element`​创建元素但是可以指定html和父元素

​`a(dis: Element[], act: Element)`​把dis组全部去掉`active`​class,给act写上`active`​

### `$main`​

就是​`document.querySelector("main")`​

### `Sub`​-`Object`​

是页面框架，提供页面跳转等能力

​`pages: Element[4]`​4个页面的dom对象

​`current: Number`​当前页面在`pages`​的索引

​`pageTo(i: Number)`​跳转到第`i`​页

​`tip(title: String, content? String, callback? ()=> void, warning? Boolean)`​右下角产生提示，指定`callback`​就会有确认键，点击后执行`callback`​，否则5秒自动消失

​`menu(Element[]: <p>||<hr>])`​目前只能这样用 `$node.oncontextmenu = menu([$p1, $hr, $p2])`​，属于自动化右键菜单

## 杂项

​`window.toHex(n: Number, l? Number)-> String`​让数字`n`​自动补零变成`l`​长度的十六进制数字符

​`window.concatBuffers(...ArrayBuffer[])-> ArrayBuffer`​多个arraybuffer合成并返回1个

‍

‍
