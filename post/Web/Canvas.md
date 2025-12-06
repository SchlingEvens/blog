## Canvas

默认情况下，Canvas的大小为300*150px，并使用一个**上下文对象**进行绘图。

设置通用格式：

```javascript
//获取dom元素
const canvas=document.querySelector(".myCanvas");
//获取上下文
const ctx=canvas.getContext("2d")
```

### 替换内容

对于较低版本的浏览器，Canvas无法被正常渲染，因此可以在Canvas双标签之间写入替换内容。对于能够识别canvas的浏览器，双标签内的内容会被忽略。

### 画布大小

对于Canvas的绘图区域大小的设置，必须在js内通过`canvas.width`和`canvas.height`进行设置。

不应该使用使用CSS属性进行设置，否则会发生未经处理的错误。

### 空间坐标

Canvas以画布左上为顶点，向下为y轴正方向，向右为x轴正方向，单位为像素。