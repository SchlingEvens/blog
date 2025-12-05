# JaveScript

引用外部文件中的js文件：`<script src="Path"></script>`

和html文件相同，路径从index.html所在的根目录起。

js由ES、DOM、BOM三大部分组成，其中ES是js的语言标准，规定了js的核心和语法。 

使用方法时，可以直接在参数中定义新的函数。



# 输出

- `window.alert()` 弹出警告框

- `decument.write()`将内容写入到html文档中

  如果要修改html的值：`decument.write("id")="修改后的值"`，其中id是html文件中元素的id属性。

- ` innerHTML` 写入到html元素

- `console.log()`  写入控制台



# 变量

如果不使用下列关键字声明变量而是直接赋值，则该变量将会成为window的属性。

特别的，在对象中声明成员变量不需要使用下列关键字。

- `var varname` 

  通常使用`var`来声明一个变量并赋值，**具有函数级作用域**。

  使用`var`声明的变量会提升（Hoisting），即声明语句提前到作用域的最前面执行，但赋值部分不会提升。

  如果在赋值（包括初始化）前调用该变量，则它的值将是`undefined`（未定义/空）。

  如果两次声明同名变量，且第一次进行了赋值，第二次没有，该变量会保留第一次声明的值

- 使用`let`声明一个可变量，使用`const`声明一个不可变量，**具有块级作用域**，即向上的最近一个`{}`中的内容。



# 数据类型

和python类似，js的变量类型是**动态**的，在声明变量并初始化后，可以再给它赋一个完全不同类型的值。

声明新变量时，可以用`new`绑定其类型：`var v=new String`。

- **值类型**

  字符串、数字、布尔、空（null）、未定义（undefined）；

  未定义是变量在没有初始化时的默认值，空值则是显式声明，有意置空。

- **引用类型**

  对象、数组、函数、正则（RegExp)和日期。

所有数据类型都有`constructor`属性，返回该变量的**构造函数**。



# 数据类型转换

js存在自动数据类型转换，以下为强制数据类型转换。

- `String()`：将传入变量转换为字符串
- `Number()`：将传入字符串转换为数字
  特别的，传入空字符串返回0，传入非数字字符串返回`NaN`（不是数字）
- `parseFloat()`：将传入字符串转换为浮点数
- `parseInt()`：将传入字符串转换为整数
- `Operator +`：将后面的变量转换为数字。
  此处为一元运算符而非四则运算。



# 正则表达式

声明正则表达式时使用`/表达式主体/可选修饰符`的格式。

正则表达式通常用于以下两个字符串方法（字符串对象自带方法）：

- `str.search()`：检索字符串中指定的子字符串（传入参数），或检索与指定的正则表达式匹配的子字符串（传入参数），返回字符串起始位置。
- `str.replace()`：在字符串中用一些字符串替换另一些字符串，或者替换一个与正则表达式匹配的子串。

正则表达式对象提供了`exec()`方法，该方法要求传入一个字符串，在传入字符串中查找符合该正则表达式对象的子串，返回一个匹配子串的数组。如果没有符合匹配的子串，返回null。



# 模板字符串（ES6）

模板字符串是js字符串的强化，使用反引号(\`)包裹字符串，允许在字符串内换行，以及使用`${vname}`的形式在字符串中加入变量。



# 解构赋值（ES6）

对变量进行批量赋值，在js中的原型是对数组的赋值。

```js
let [a,b,c]=[1,2,3]
```

解构赋值对于对象也同样适用。 



# 类（ES6）





# 函数

声明函数使用关键字`function`，写法和其他编程语言类似：

```javascript
function myFunction(parameter1,parameter2,...){
    //the function's logic.
}
```

特别的，对象中的函数被称为方法(method)，有特殊的声明语法：

```javascript
functionName:function(parameter1,parameter2,...){
    //the function's logic.
}
```



# 结构语句

条件分支if语句、循环语句使用方法和java基本没有区别。



# 事件

事件是用户在网页上的操作，通常作为属性存在。

常用事件：[HTML DOM 事件对象 | 菜鸟教程](https://www.runoob.com/jsref/dom-obj-event.html)

如果需要在外部js文件为特定元素绑定事件监听和回调函数，可以使用`decument.getElementById("id")`和其他类似的方法获取对应元素，并通过`obj.addEventListener()`方法绑定回调函数。

例如，现在html文件中有以下内容：

```html
<button id="myButton">Test Text</button>
```

要在外部js文件中绑定回调函数，使该按键被点击时弹出窗口，应该有如下代码：

```javascript
// 等待页面加载完成
window.onload = function() {
    //获取元素
  let button = document.getElementById("myButton");
  button.addEventListener("click", function() {
    //alter()是浏览器提供的弹出警告框的方法
    alert("This is test text.");
  });
};
```

如果用户在页面加载完成前就尝试以某种方法访问元素，则浏览器会报错，原因是无法找到指定元素。因此必须在页面完成加载后再绑定回调函数。

除此之外，有一种更简单的方式进行绑定：

```javascript
window.onload = function() {
  let button = document.getElementById("myButton");
  // 通过赋值的方式为元素绑定点击事件
  button.onclick = function() {
    window.alert("This is test text.");
  };
};
```

这样做的缺点是，如果先前onclick已经绑定了一个回调函数，现在就会覆盖原有的。这是使用`obj.addEventListener()`进行绑定的一个优势：它是**追加**（Add）的绑定。



## 事件传播

事件传播按照时间顺序分为**捕获**和**冒泡**两个阶段。

- **捕获（capture）**：通过捕获，事件首先被最外面的元素捕获并传到内部元素。
- **冒泡**：通过冒泡，事件首先从最内层元素触发和处理，然后一层一层向外传递。

由此我们可以得出，如果事件在捕获阶段进行处理，它的执行顺序是从父级到子级；如果事件在冒泡阶段处理，则它的执行顺序是从子级到父级。

使用`addEventListenner()`方法为元素绑定事件时，可以通过`useCapture`参数控制事件的执行时机。默认值为`false`，使用冒泡传播；设置为`true`时，使用捕获传播。



# DOM

## 获取元素

dom是文档对象模型，js通过dom进行对网页标签的操作。

- `decument.getElementById()`：通过id获取dom元素，参数为id的字符串形式。
- `document.getElementsByClassName()`：通过类名获取dom元素，参数为类名的字符串形式，返回一个伪数组形式。
- `document.getElementsByTagName()`：通过标签名获取dom元素，参数为标签名的字符串形式，返回一个伪数组形式。
- `document.querySelector()`：通过css选择器获取dom元素，支持css选择器语法，参数为选择器的字符串形式。
  返回值为查找到的第一个符合要求的元素；如果没有符合要求的元素，将返回空值。
- `document.querySelectorAll()`：通过css选择器获取dom元素，支持css选择器语法，参数为选择器的字符串形式。
  返回值为查找到的所有符合要求的元素的列表（NodeList，使用方法和伪数组类似）；如果没有符合要求的元素，将返回空值。

通过以上方法获取到的元素（如果是数组，就是数组中的其中单个元素）可以进行以下操作：

- `item.previousElementSibling`：返回该元素同级的前一个元素
- `item.nextElementSibling`：返回该元素同级的后 一个元素
- `item.parentNode`：返回父元素。
- `item.chidren` :返回所有子元素的列表。

## 样式处理

- `item.style.cssPropertyName`：返回指定样式的值的字符串形式，通过这种方法可以修改Dom元素的指定样式。<span style="color:rgb(255, 1, 1);font-weight:bolder;">该方法只会返回内联样式设置的样式。</span>
- `window.getComputedStyle(item).cssPropertyName`：返回指定样式的字符串形式，该方法和上一方法的区别在于，返回的样式是经过外部js、css等操作后的值。<span style="color:rgb(255, 1, 1);font-weight:bolder;">该方法的返回值是只读的，不能通过修改值的途径修改布局</span>
- `item.className`：返回元素的类名的字符串形式。
  一种快速修改样式的方式是，将改变后的样式存在一个类中，使用该属性修改类名为目标样式的类名。

## 文本处理

- `item.textCentent="text"`：更改该元素中的文本内容。
  如果元素具有后代元素，且后代元素中有文字，则全部会被覆盖。
- `item.innerHTML="text"`：更改该元素中的文本内容，该方法支持html和css语法，但存在性能损耗。

## 事件处理

如果需要在外部js文件为特定元素绑定事件监听和回调函数，可以使用`decument.getElementById("id")`和其他类似的方法获取对应元素，并通过`obj.addEventListener()`方法绑定回调函数。

例如，现在html文件中有以下内容：

```html
<button id="myButton">Test Text</button>
```

要在外部js文件中绑定回调函数，使该按键被点击时弹出窗口，应该有如下代码：

```javascript
// 等待页面加载完成
window.onload = function() {
    //获取元素
  let button = document.getElementById("myButton");
  button.addEventListener("click", function() {
    //alter()是浏览器提供的弹出警告框的方法
    alert("This is test text.");
  });
};
```

如果用户在页面加载完成前就尝试以某种方法访问元素，则浏览器会报错，原因是无法找到指定元素。因此必须在页面完成加载后再绑定回调函数。

除此之外，有一种更简单的方式进行绑定：

```javascript
window.onload = function() {
  let button = document.getElementById("myButton");
  // 通过赋值的方式为元素绑定点击事件
  button.onclick = function() {
    window.alert("This is test text.");
  };
};
```

这样做的缺点是，如果先前onclick已经绑定了一个回调函数，现在就会覆盖原有的。这是使用`obj.addEventListener()`进行绑定的一个优势：它是**追加**（Add）的绑定。

# 定时器

- `setTimeout(func,time)`：延时计时器，第一个参数为延时执行的内容，第二个参数为延迟时间，单位为毫秒，数据类型为number。
- `setInterval(func,time)`：间隔延时计时器，每间隔指定秒重复执行func内容。
  该方法会返回一个对象，如需停止计时器，使用`clearInterval(obj)`方法。

一种常见的做法是，同时开启延时计时器和间隔计时器，使用延时计时器控制间隔计时器的中断。







