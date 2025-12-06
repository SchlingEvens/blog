# 使用Paper.js

在html文件中引入Paper.js的语法如下：

```html
<script type="text/paperscript" canvas="canvasName" src=""></script>
```

- `type`：类型必须设置为`type="text/paperscript"` 或 `"text/x-paperscript"`。
- `canvas`：绑定操作的Canvas。
- `resize` （可选）：设置为`true`时，Canvas大小为自适应浏览器窗口。
- `hidip`（可选）：设置为`off`时，会关闭高分辨率设备上的高精度渲染以降低内存占用和消耗。
- `keepalive`（可选）：设置为`true`时，窗口失焦位于后台时动画仍然会渲染。

## 作用域

每个引用paper文件的`script`标签为一个作用域，作用域之间不能相互访问其中的对象，但同名函数和对象可能会被覆盖。



# 几何类型

Papar.js提供了两种模型：图形对象（Graphical items）和几何对象（Geometric Objects）。

- 图形对象：真正呈现在Canvas上的、可见的图形，包括`Path`、`Shape`等。
- 几何对象：用于存储图形对象的数据（如坐标、顶点信息等）结构与容器，包括`Point`、`Rectangle`和`size`等。几何对象本身是不可见的。

# 几何对象（Geometric Objects）

## Point——点对象

用于描述二维空间中的一个位置，具有`x`和`y`两个属性。

### 构造方法

创建Point共有以下方式：

- `var p=new Point()`：创建一个无初始值的点对象，默认位置为（0，0）。
- `var p=new Point(2,3)`：创建一个点对象并传入初始坐标。
- `var p=new Point(pFirst)`：创建已有点（`pFirst`）的副本，该方法为深拷贝。
- `var p=pFirst`：创建已有点（`pFirst`）的引用，该方法为浅拷贝。

### 属性

point还有`angle`和`length`两个属性，为点的极坐标表示。`(length,angle)`与`(x,y)`的值互相影响，且可以通过极坐标创建`Point`：

```javascript
var p=new Point({
    angle:45,      //使用角度值
    length:1
})
```

## Size——尺寸

用于描述二维空间中的大小，包括`width`和`height`两个属性。在构造上与`Point`相同，此处略。

## Rectangle——矩形

同时描述x，y，width和height四个属性，以表示二维位置大小。

- `x/y`：描述左上角顶点的坐标；
- `width/height`：描述矩形的尺寸。

### 构造方法

构建一个矩形有以下方式：

- `var rect=new Rectangle(topLeft,rectSize)`：通过传入点和尺寸创建矩形对象，其中两个参数的类型分别是`Point`和`Size`。
- `var rect=new Rectangle(x,y,width,height)`：通过分别传入左上顶点的坐标和矩形的宽高构造一个矩形。
- `var rect=new Rectangle(point1,point2)`：通过传入矩形两个不相邻的顶点构造矩形。Paper会自行判断如何在这两个点中构造矩形。

### 属性

除去基础的四个属性外，矩形还具有如下属性：

- `center`：Point类型，矩形的中心点坐标；
- `topLeft/topRight/bottomLeft.bottomRight`：Point类型，矩形的四个顶点的坐标。
- `leftCenter/rightCenter/topCenter/bottomCenter`：Point类型，矩形的四条边的中点坐标。
- `left/right`：Number类型，矩形左边界/右边界的x坐标。
- `top/bottom`：Number类型，矩形上边界/下边界的y坐标。

## 几何对象的自动类型转换

 Paper.js的类型具有灵活的自动类型转换机制。

在需要的情况选，Point和Size可以互相转换，Rectangle能按对应属性向Point、Size转换。

在js中，这三种类型会被识别为`{key:value}`的格式。




