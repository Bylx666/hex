# Events

# 事件

编辑器开放了几乎所有API对应的事件，不论用户操作,插件介入,系统内部调用等全部都会经过事件

‍

## 写在前面

1. API并无法保证调用安全性，不要随便运行和导入陌生人的js代码和插件
2. ​`from`​值在可能向更根本的api传递时会写更详细些,比如剪切相当于复制加删除，那么会触发复制和删除事件并取得同样的`from`​比如`user-key-cut`​
3. 事件是在**发生前**发送，**不能**访问发生后的结果。但是不用担心，event提供了一切本身将要调用的东西，甚至只靠插件就有能力重写API(记得使用from参数帮自己辨认API调用来源)

‍

## 固定属性

一切作者写的事件都有三个固定属性

1. ​`e.from`​-`String`​ 说明用户操作，可以多`console.log`​看看，几乎每一种操作都对应独一无二的from
2. ​`e.cancel()`​->`void`​ 除了极个别事件，一切事件都可以取消，并在其`event`​对象中捕获操作详细
3. ​`e.type`​-`String`​ 说明事件类型，和on后面写的相同，可以用来遍历事件

‍

## 事件父类`EventEmitter`​

事件对象类，使用`EventEmitter.extBy(Object)`​使字面对象继承(ExtendsBy)或者->

```js
function MyClass() {
  EventEmitter.call(this)
}
MyClass.prototype = Object.create(
  EventEmitter.prototype, Object.getOwnPropertyDescriptors({
    func1() {}, 
    func2() {}   
}));
```

‍

## 编辑器`Editor`​

编辑器事件，只有一个`render`​

### `render`​

render代表渲染，频率并不高，一般只在数据改变和滚动时频繁触发  
‍`js Editor.on("render", ()=> {   e.file===Hex // true }) ‍`​

#### `e.from`​

render来源杂乱，无法取得from并统一使用`unknown`​。但你可以在调用时使用from参数让from成为参数内容(作为弱语言js，你甚至可以往from传非字符参数)

#### `e.file`​

就是`window.Hex`​的引用

‍

## 文件管理`HexFiles`​

就是文件列表，如果发现下面函数不知道怎么来的请去对应API文档查看

### `upload`​

​`e.files`​上传的文件列表，可能由[DataTransfer](https://developer.mozilla.org/zh-CN/docs/Web/API/DragEvent/dataTransfer)得到

### `open`​

​`e.file`​打开的文件，为`HexFile`​类

### `focus`​

​`e.file`​聚焦的文件，也是`HexFile`​

## 文件类`HexFile`​

每一个`HexFiles.list`​的项都是`HexFile`​类。有一个`window.Hex`​属性是对目前正在编辑的(聚焦的)`HexFile`​的引用，非常方便，但是需要注意的是事件是在发生前发送，不能访问发生后的结果。典型例子是focus事件

```js
HexFiles.on("focus", (e)=> 
  var sel = Hex.selection // 不行，只能访问focus之前的文件
  var sel = e.file.selection // 正解，访问被聚焦的文件
);
```

### `reset`​

在长度被改变时会被调用，对应API**并非**​`reset`​而是`setBuffer`​

​`before`​重置前的长度

​`after`​重置后的长度

什么？为什么是长度而不是buffer？你也不想看着你的代码内存泄漏吧

#### `insert`​

​`length`​插入的`arraybuffer`​的`byte`​长度

​`data`​插入的`arraybuffer`​-由于insert接受数字参数，此项有可能为null请主动判断

​`index`​插入位置的索引(就是插入前的`this.cursor`​)

#### `delete`​

和insert一样，除了`data`​不可能为`null`​

#### `write`​

​`length`​写入的`arraybuffer`​的长度

​`index`​写入位置索引

​`before`​写入前对应位置的`arraybuffer`​

​`after`​写入后对应位置的`arraybuffer`​

这就不内存泄漏了吗？但是你撤回的时候要用的。

#### `copy`​

​`data`​复制的`arraybuffer`​

​`index`​复制起点

​`length`​复制的`byteLength`​

#### `set`​

在调用`this.view.setUint8`​这种函数时会发生`set`​事件，当然不需要跑`this.view.on("set")`​来监听，请直接用`this.on("set")`​

​`index`​set时的位置

​`set`​-`String`​对应set的函数名，`setUint8`​的`set`​值就是`Uint8`​

​`before`​-`Num`​设置前的数字

​`after`​-`Num`​函数调用时传入的设置后的数字

​`le`​-`Bool`​是否`Little-Endian`​

#### 其他

其他的API都使用以上底层API，所以只要用以上事件再读取其`from`​就能获得对应事件了。具体`from`​值列出来谁看啊，`console.log`​一个一个试吧。

#### 注意

要使用文件API你需要这样

```js
HexFiles.on("open", (e)=> {
  e.file.on(event, myFunction);
});
```

这样来使每个文件都能运行到callback。请注意这样是错误的

```js
Hex.on(event, callback) // 大错特错
```

虽然能正常运行，但是无法为你新打开的文件真正附上事件。

‍

### 历史类`HexStory`​

#### `push`​

​`data`​-`Object`​不一定是什么`Object`​，先用`e.data.type`​得到数字，对应关系如下

```txt
0 Insert
1 Delete
2 Set
3 Write
```

0和1的`Object`​格式

```js
{
  index: Number, 
  len: Number, 
  buf: ArrayBuffer||null
}
```

2和3的格式

```js
{
  set: Number/* write */||String/* set */, 
  index: Number, 
  before: ArrayBuffer||Number, 
  after: ArrayBuffer||Number
}
```

​`index`​推入后这个`data`​在`HexStory.list`​的位置

### `undo`​和`redo`​

​`data`​如上

​`index`​此`data`​在`list`​的位置

‍
