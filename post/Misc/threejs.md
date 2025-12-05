## 环境配置

以下内容均需安装在项目根目录下，在项目根目录cmd执行命令。

- `yarn init  -y`：初始化文件夹，创建package.json文件
- `yarn add -D vite`：安装构建工具vite
- `yarn add -D three`：安装three.js
- `"scripts": {  "dev":"vite"}`：在package.json文件里添加键值对，设置开发环境
- `yarn dev`：构建环境，返回的网址后接  根目录起相对路径即可打开网页。



## Three.js三要素

- Scene：容器，用于存放所有显示在三维空间中的对象，如几何体、纹理、材质。
- Camera：Three.js提供多种相机模式，包括正交相机、透视相机、立方相机和立体相机，大多数时候（包括后续笔记）都使用PerspectiveCamera（透视相机）。
- Renderer（渲染器）：常用WebGLRenderer。



## 基本语法

### 初始化场景

```javascript
//引入模块中的所有内容
import * as THREE from "three"
//创建场景
const scene=new THREE.Scene();
//创建透视相机
const camera=new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeght,
    0.1,
    1000
);
//创建渲染器
const renderer=new THREE.WebGLRenderer();
//设置渲染器的宽高为相机的宽高
renderer.setSize(window.innerWidth,window.innerHeght);
//将渲染器渲染的界面插入到body中
document.body.appendChild(renderer.domElement);

//应用渲染器
renderer.render(scene,camera);
```

### 创建物体

```javascript
//创建物体并初始化
const cube=new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new MeshBasicMaterial()
);
//向已有场景中添加物体
scene.add(cube);
```

### 物体运动

```javascript
function animate(){
    requestAnimatuonFrame(animate);
    //控制运动
    cube.rotation.x+=0.01;
    cube.rotation.y+=0.01;
    //应用渲染器：每次更新物体状态都要手动应用渲染器
    renderer.render(scene,camera);
}
```

### 更改场景背景

- 更改背景颜色：`scene.background=new THREE.Color()`
  参数可传0x开头的十六进制颜色、rgb、hsl等，除了十六进制以外都必须传字符串形式. 
- 更改背景图片：异步加载







## PerspectiveCamera（透视相机）

### 构造函数

`PerspectiveCamera()`共有以下四个参数，均为Number类型：

- fov：视锥角
- aspect：视野范围的长宽比
- near和far：进行透视投影的计算时的近平面与远平面，在这个范围外的部分会被裁切

### 成员

整体思路和unity类似。

- `position`：位置坐标，有x、y和z三个属性。
  额外的，可以使用`obj.position.set()`来设置摄像机的整体坐标，三个参数为坐标的x、y和z值。
- `lookAt`：面朝向量，即摄像机朝向的方向向量。三个参数为看向目标的坐标的x、y和z值。



## Renderer（渲染器）

### 构造函数

`WebGLRenderer()`的参数均为可选参数，列表如下：

- `canvas`：指定渲染器的目标位置，值为Element类型。如果不指定，则会自动创建一个默认300px*150px的Canvas。
- `antialias`：抗锯齿选项，值为布尔。如果不指定，默认为false。



其它暂略，详见[WebGLRenderer – three.js docs](https://threejs.org/docs/index.html#api/zh/renderers/WebGLRenderer)



### 成员

- `renderer.domElement`：返回当前渲染器渲染的目标元素 。
- `renderer.setSize(w,h)`：设置渲染区域的宽高。



## 轨道控制器（OrbitControls）

THREE.js提供的附加组件，通过获取鼠标的输入，使相机能够围绕目标进行轨道运动。

可应用的运动类型包括旋转、缩放、以及拖拽。

使用时，需导入该模块。

```javascript
import {OriitControls} from "three/examples/jsm/controls/OrbitContorls.js"
```

### 构造函数

```javascript
const contorl= new OrbitContorls();
```

构造函数接收两个参数。

- `carmera`：被控制的相机，类型为Element。这个参数是必须的。

- `domElement`：用于事件监听的元素，类型是Element。这个参数是可选的。

  该元素决定了事件监听依附的元素。通常情况下，该参数被设置为对应的`renderer.domElement`，它会将事件监听绑定到renderer所在的`canvas`上。

  不设置时，将会默认绑定到 `Document`元素上。

### 事件

OrbitContorls提供以下事件用于事件回调。

- `change`：当摄像机被该组件改变时触发。

  通常会把渲染语句`renderer.render(scene,camera)`写在事件内，以在每次更新相机时重新渲染。

- `start`：初始化交互时触发。

- `end`：交互结束时触发 。



### 常用属性

- `enablePan`：布尔值，是否允许右键拖拽。

- `enableZoom`：布尔值，是否允许缩放，默认值为True。

- `enableRotate`：布尔值，是否允许旋转，默认为True。

- `minZoom`/`maxZoom`：Number，设置缩放范围，值为相对原始大小的倍率。

- `minPolarAngle`/`maxPolarAngle`：Number，设置上下旋转范围（绕右手坐标系x轴），值为弧度制。

- `minAzimuthAngle`/`maxAzimuthAngle`：Number，设置左右旋转范围（绕右手坐标系y轴），值为弧度制。

- `enableDamping`：布尔值，是否启用摄像机的惯性。

  启用时，必须在`animate`调用`contorl.update()`。

- `damplingFactor`：Number，摄像机的惯性大小。

  启用时，必须在`animate`调用`contorl.update()`。





### 常用方法

OrbitContotls提供了以下方法：

- `update()`：该方法没有参数，提供了控制器变换的位置同步和后处理，后处理包括惯性与阻尼计算、自动旋转、角度与距离约束、change事件分发等。

  通常情况下，都需要将 `contorl.update()`写在`animate`中。 

  

## 坐标网格辅助线（GridHelper）

THREE.js提供的一种可视化工具，用于调试时进行视觉参考。

### 构造函数

```javascript
const gridHelper = new THREE.GridHelper();
```

共有以下四个参数：

- `size`：Number类型，控制每个坐标格的尺寸，默认为10。

- `divisions`：坐标格细分次数，默认为10.

- `colorCenterLine`：中线颜色，值为Color类型，十六进制值或CSS颜色名。

- `colorGrid`：坐标格网格线颜色，值同上。

  

## 几何体

创建不同的默认几何体将使用不同的构造函数，函数列表详见[BoxGeometry – three.js docs](https://threejs.org/docs/index.html#api/zh/geometries/BoxGeometry)，此处仅作简略说明。

### 构造函数常用参数

- `heigthSegments/depthSegments`：横向/纵向分段数，控制生成模型的平滑程度，近似blender的细分。

## BufferGeometry

所有默认几何体都基于BufferGeometry创建，因此，通过BufferGeometry能够创建任何形状的物体。

### 构造函数

```javascript
const geometry=new BufferGeometry();
```

创建一个BufferGeometry对象并将属性初始化为默认值。该构造函数没有参数。



### 属性

- `geometry.attributes`：存储该几何体的几何数据，包括但不限于顶点坐标等，通过set和get添加与访问。
- `boundingBox`：外边界矩形，默认为null，可以通过`.computeBoundingBox()`方法计算。
- `boundingSphere`：外边界球体，默认为null，可以通过`.computeBoundingSphere()`方法计算。

### 常用方法

- `geometry.setAttribute(name:String,attribute:BufferAttribute)`：为当前几何体设置一个attribute。

  arrtibute以哈希表的方式存储，其中键为该方法的第一个参数，值为该方法的第二个参数。



## BufferAttribute

一种用于存储`BufferGeometry`的数据的数据结构。

### 构造函数

```javascript
const attribute = new BufferAttribute(array:TypedArray,itemSize:Int,normalized:Boolean);
```

构造函数共三个参数，其中`normalized`是可选参数。

- `array`：将构造的图形的顶点列表。该列表的元素数量应该是顶点数量\*itemSize。

- `itemSize`：每个数据在array中由几个元素构成。例如，当存储三维空间中的顶点坐标时，`itemSize`的值应该是3。

- `normalized`：是否进行归一化处理，默认值为false。

  此处的归一化是指GPU将接收数据映射到`[-1,1]`范围内（无符号类型时是`[0,1]`），不涉及光栅化阶段的投影变换和视图变换。

  通常情况下，不需要设置为true。

## Material（材质）

material提供颜色、纹理和光照相应等属性 的管理。

