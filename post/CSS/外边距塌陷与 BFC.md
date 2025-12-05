# 外边距塌陷与 BFC

CSS 中的“外边距塌陷”是一个常见的布局现象，而 BFC（块级格式化上下文）则是解决此类问题及控制布局流向的重要机制。

## 外边距塌陷

块级元素在垂直方向上的外边距（Margin）有时不会叠加，而是会发生“合并”或“塌陷”。

- **兄弟合并**：垂直排列的两个兄弟元素，上一个元素的下边距与下一个元素的上边距会合并。
    - **计算规则**：取两者中的**最大值**（`max(margin-bottom, margin-top)`），而不是简单相加。
- **父子塌陷**：当父元素没有边框（border）、内边距（padding）或行内内容时，子元素的上边距会“冲破”父元素，导致父元素整体下沉，而不是子元素在父元素内部下沉。

<div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden; margin: 20px 0;">
<div style="background-color: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; font-family: Consolas, monospace; font-size: 14px; color: #333;">
&lt;!-- CSS 源码 --&gt;<br>
.box-a { margin-bottom: 30px; }<br>
.box-b { margin-top: 20px; }<br>
<br>
&lt;!-- HTML 源码 --&gt;<br>
&lt;div class="box-a"&gt;盒子 A (下距 30px)&lt;/div&gt;<br>
&lt;div class="box-b"&gt;盒子 B (上距 20px)&lt;/div&gt;
</div>
<div style="padding: 20px; background-color: #fff;">
<div style="background: #e3f2fd; height: 30px; line-height: 30px; text-align: center; margin-bottom: 30px;">盒子 A (margin-bottom: 30px)</div>
<div style="height: 30px; border-left: 2px dashed red; margin-left: 50%; position: relative;">
<span style="position: absolute; left: 5px; top: 5px; color: red; font-size: 12px; font-weight: bold;">实际间距: 30px (非 50px)</span>
</div>
<div style="background: #ffccbc; height: 30px; line-height: 30px; text-align: center; margin-top: 20px;">盒子 B (margin-top: 20px)</div>
</div>
</div>

## BFC (块级格式化上下文)

BFC (Block Formatting Context) 是 Web 页面中一个独立的渲染区域。

- **核心特性**：BFC 内部的元素渲染不会影响到外部的元素，反之亦然。它就像一个封闭的容器。
- **触发条件**（满足任意一个即可）：
    1.  `float` 不为 `none`。
    2.  `position` 为 `absolute` 或 `fixed`。
    3.  `display` 为 `inline-block`, `flex`, `grid`, `table-cell` 等。
    4.  `overflow` 不为 `visible` (常用 `hidden` 或 `auto`)。

### BFC 的应用

1.  **解决外边距塌陷**：父元素触发 BFC 后，就有了“独立性”，子元素的 margin 无法冲破父元素。
2.  **清除浮动**：BFC 容器计算高度时，浮动元素也会参与计算（解决高度塌陷）。
3.  **防止覆盖**：浮动元素旁的 BFC 容器不会被覆盖（常用于两栏自适应布局）。

<div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden; margin: 20px 0;">
<div style="background-color: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; font-family: Consolas, monospace; font-size: 14px; color: #333;">
&lt;!-- 演示：父子嵌套塌陷与修复 --&gt;<br>
<br>
&lt;!-- 情况 1：塌陷 (灰色父盒子随子盒子一起掉下来) --&gt;<br>
&lt;div class="parent"&gt;<br>
&nbsp;&nbsp;&lt;div class="child" style="margin-top: 20px;"&gt;子元素&lt;/div&gt;<br>
&lt;/div&gt;<br>
<br>
&lt;!-- 情况 2：BFC 修复 (触发 overflow: hidden) --&gt;<br>
&lt;div class="parent" style="overflow: hidden;"&gt;<br>
&nbsp;&nbsp;&lt;div class="child" style="margin-top: 20px;"&gt;子元素&lt;/div&gt;<br>
&lt;/div&gt;
</div>
<div style="padding: 20px; background-color: #fff;">
<div style="display: flex; gap: 20px; align-items: flex-start;">
<div style="flex: 1;">
<div style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #d32f2f;">1. 未开启 BFC (塌陷)</div>
<div style="background-color: #eee; height: 80px;">
<div style="border: 1px dashed red; height: 80px;">
<div style="width: 80%; height: 40px; background-color: #d32f2f; color: white; margin-top: 20px; margin-left: auto; margin-right: auto; display: flex; align-items: center; justify-content: center; font-size: 12px;">子 Margin 穿透</div>
</div>
</div>
<div style="font-size: 10px; color: #666;">(灰色背景没包住上面的空隙)</div>
</div>

<div style="flex: 1;">
<div style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #388e3c;">2. 开启 BFC (修复)</div>
<div style="background-color: #eee; height: 80px; overflow: hidden;">
<div style="width: 80%; height: 40px; background-color: #388e3c; color: white; margin-top: 20px; margin-left: auto; margin-right: auto; display: flex; align-items: center; justify-content: center; font-size: 12px;">子 Margin 被隔离</div>
</div>
<div style="font-size: 10px; color: #666;">(灰色背景包住了空隙)</div>
</div>
</div>

</div>
</div>