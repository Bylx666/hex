# Files

见[/js/file.js](/js/file.js)

## 文件列表`HexFiles`​-`Object`​

主要用来管理文件列表和在文件页面的渲染

### 属性

​`list: HexFile[]`​经过`open`​的文件对象列表

​`current: Number`​聚焦的文件在`list`​的索引

### 方法

​`upload(files: ​`​`[FileList](https://developer.mozilla.org/zh-CN/docs/Web/API/FileList)`​`, from? String)`​解析`files`​并遍历`open()`​

​`open(buf: ArrayBuffer, name? String, from?)-> HexFile`​打开一个文件并推进文件列表

​`focus(i, from?)`​聚焦`list`​第`i`​个文件并跳到编辑器页面

‍

## 文件类`HexFile`​实例

这是文件编辑的主要api，在全局有一个`window.Hex`​指向目前聚焦的文件`HexFiles.list[HexFiles.current]`​，编辑器就是访问`Hex`​来编辑文件。编辑器本身对文件的修改都通过此实例的方法，并推送事件(参考[Event.md](Event.md))。

### 构造函数

​`new HexFile(buf: ArrayBuffer, name? String, from?)`​返回一个文件实例

### 属性

​`buffer: ArrayBuffer`​文件的`arraybuffer`​，不要直接修改，使用`setBuffer()`​

​`view: HexStoryDataView`​文件的`dataview`​，可以当普通`dataview`​用，见[History.md](History.md)

​`len: Number`​文件`byte`​长度

​`time: Number`​文件打开时间戳

​`name: String`​文件名

​`memo: Object`​文件中的注释（没做）

​`selection: Number[4]`​文件的选中部分`[0: 按下位置, 1: 松开位置, 2: 鼠标是否按下(0||1), 3: 选择是否有效(0||1)]`​

​`cursor: Number`​选中的位置在`buffer`​的索引，调用修改方法之前一般先修改cursor作为方法的索引

​`cursor1: Boolean`​一个byte有两个十六进制数，是true就代表你输入到了第二个

​`scroll: Number`​翻页位置，是列数的倍数

### 方法

​`setBuffer(buf: ArrayBuffer, from?)`​不要直接修改实例的`buffer`​属性，而是使用这个方法

​`insert(len: Number||ArrayBuffer, from?)`​在`cursor`​处插入`len`​长度的`bytes`​。`len`​可以指定为`ArrayBuffer`​直接插入

​`delete(len? Number, from?)`​在`cursor`​处**向后**删除`len`​长度。不指定就会直接删除`selection`​的部分

​`write(buf: ArrayBuffer, from?)`​在`cursor`​处向后写入`buffer`​

​`fill(val: Uint8, from?)`​用指定值填充`selection`​

​`copy(from?)`​将`selection`​部分放进剪切板`Editor.clipboard`​

​`cut(from?)`​复制`selection`​并删除选中部分

​`paste(from?)`​用`write()`​把剪切板的东西写到`cursor`​处

‍
