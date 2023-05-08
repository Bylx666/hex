# Editor

见[/js/editor.js](/js/editor.js)-编辑器全局的属性

## `Editor`​-`Object`​

### 属性

​`file: HexFile`​聚焦的文件

​`status: 0||1`​0就是覆盖模式，1就是插入模式

​`clipboard: ArrayBuffer`​剪切板的`buffer`​

​`littleEndian: Boolean`​数据查看器是否在小字节序

### 方法

​`render(from?)`​渲染一下，最常用的函数没有之一`Editor.render()`​

‍
