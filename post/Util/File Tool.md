# File Tool

做网站的时候用到的莫名其妙妙妙工具，感觉以后说不定有用，存一下。

## md文件分割

按H1标题对Markdown文件进行分割成多个文件并输出。

使用要求是写的时候排版比较规范。

<details>

<summary><strong>点击这里查看 Python 源码</strong></summary>

```Python
import os
import re


def split_markdown_by_h1(source_file, output_dir="output"):
    """
    读取 Markdown 文件并根据 H1 标签切割成多个文件。
    文件名将基于 H1 的标题内容。
    """

    # 确保输出目录存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"已创建输出目录: {output_dir}")

    try:
        with open(source_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"错误: 找不到文件 {source_file}")
        return

    current_file = None
    file_count = 0

    # 用于处理第一个 H1 之前的内容（前言/Preamble）
    # 如果不需要保留前言，可以将 initial_content 设为 None
    preamble_filename = os.path.join(output_dir, "00_preamble.md")
    current_file = open(preamble_filename, 'w', encoding='utf-8')
    is_writing_preamble = True

    for line in lines:
        # 检测 H1 标签 (以 # 开头，后跟空格)
        if line.startswith('# '):
            # 关闭上一个文件
            if current_file:
                current_file.close()
                # 如果前言文件为空，删除它
                if is_writing_preamble and os.path.getsize(preamble_filename) == 0:
                    os.remove(preamble_filename)
                is_writing_preamble = False

            # 提取标题内容并清洗非法字符
            title = line.strip('# \n').strip()
            # 替换文件名中的非法字符 (Windows/Linux/Mac 通用)
            safe_title = re.sub()   //  这里的参数是 r'[\\/*?:"<>|]', "_", title  ，但放在括号里会导致md的逻辑出现问题，所以放在注释了

            filename = f"{safe_title}.md"
            file_path = os.path.join(output_dir, filename)

            print(f"正在生成: {filename}")
            current_file = open(file_path, 'w', encoding='utf-8')
            file_count += 1

            # 写入标题行（如果不想在新文件中保留标题，注释掉下面这行）
            current_file.write(line)
        else:
            # 写入内容到当前打开的文件
            if current_file:
                current_file.write(line)

    # 关闭最后一个文件
    if current_file:
        current_file.close()
        # 再次检查前言是否为空（如果是整个文件都没有 H1 的情况）
        if is_writing_preamble and os.path.getsize(preamble_filename) == 0:
            os.remove(preamble_filename)

    print(f"\n处理完成！共生成 {file_count} 个基于 H1 的文件。")


# --- 使用示例 ---
if __name__ == "__main__":
    # 将此处替换为你的文件名
    source_md = "CSS.md"
    split_markdown_by_h1(source_md)

```

</details>


---

## json格式文件树生成器

读取已有目录递归地生成固定格式的json文件，也可以直接复制json代码过来调整和拼接，可视化看着比纯代码方便。

主要用于生成网站要用的文件树配置文件。

<details>

<summary><strong>点击这里查看 Python 源码</strong></summary>

```Python
import os
import json
import tkinter as tk
from tkinter import ttk, filedialog, messagebox


class DirectoryMapperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("目录结构生成器 (Directory to JSON)")
        self.root.geometry("1100x700")  # 增加窗口尺寸以适应双栏布局

        # 数据存储
        self.current_root_path = ""
        self.drag_source = None  # 用于存储当前正在拖拽的项

        # --- UI 布局 ---

        # 1. 顶部按钮区
        top_frame = tk.Frame(root, pady=10)
        top_frame.pack(fill=tk.X, padx=10)

        self.btn_load = ttk.Button(top_frame, text="1. 选择文件夹", command=self.select_directory)
        self.btn_load.pack(side=tk.LEFT, padx=5)

        self.btn_save = ttk.Button(top_frame, text="2. 导出 JSON 文件", command=self.save_json, state=tk.DISABLED)
        self.btn_save.pack(side=tk.LEFT, padx=5)

        self.lbl_path = tk.Label(top_frame, text="未选择文件夹 (可直接在右侧粘贴 JSON 生成)", fg="gray")
        self.lbl_path.pack(side=tk.LEFT, padx=10)

        # 2. 中间主内容区 (使用 PanedWindow 实现左右分栏可调整)
        self.paned_window = ttk.PanedWindow(root, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # --- 左侧：树状视图 ---
        left_frame = tk.Frame(self.paned_window)
        self.paned_window.add(left_frame, weight=1)  # 权重1，默认占一半

        tk.Label(left_frame, text="目录结构 (可视化 - 支持拖拽)", font=("Arial", 10, "bold")).pack(anchor=tk.W,
                                                                                                   pady=(0, 5))

        # 树状图滚动条
        tree_scroll = ttk.Scrollbar(left_frame)
        tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Treeview 设置
        self.tree = ttk.Treeview(left_frame, selectmode="browse", yscrollcommand=tree_scroll.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        tree_scroll.config(command=self.tree.yview)

        # 绑定拖拽事件
        self.tree.bind("<ButtonPress-1>", self.on_press)
        self.tree.bind("<B1-Motion>", self.on_motion)
        self.tree.bind("<ButtonRelease-1>", self.on_release)

        # 配置 Treeview 列
        self.tree["columns"] = ("type")
        self.tree.column("#0", width=300, anchor=tk.W)
        self.tree.heading("#0", text="名称")
        self.tree.column("type", width=80, anchor=tk.CENTER)
        self.tree.heading("type", text="类型")
        self.tree.tag_configure("folder", foreground="blue", font=("Arial", 10, "bold"))
        self.tree.tag_configure("file", foreground="black")

        # --- 右侧：JSON 代码预览 ---
        right_frame = tk.Frame(self.paned_window)
        self.paned_window.add(right_frame, weight=1)

        # 右侧标题栏
        preview_header = tk.Frame(right_frame)
        preview_header.pack(fill=tk.X, pady=(0, 5))

        tk.Label(preview_header, text="JSON 源码 (可编辑)", font=("Arial", 10, "bold")).pack(side=tk.LEFT)

        # 新增：反向生成按钮
        self.btn_apply = ttk.Button(preview_header, text="← 生成树结构", command=self.apply_json_to_tree)
        self.btn_apply.pack(side=tk.LEFT, padx=10)

        self.btn_copy = ttk.Button(preview_header, text="复制 JSON", command=self.copy_to_clipboard)
        self.btn_copy.pack(side=tk.RIGHT)

        # 文本框滚动条
        text_scroll = ttk.Scrollbar(right_frame)
        text_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # JSON 文本框 (始终允许编辑)
        self.json_text = tk.Text(right_frame, wrap=tk.NONE, yscrollcommand=text_scroll.set, font=("Consolas", 10))
        self.json_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        text_scroll.config(command=self.json_text.yview)

        # 3. 底部控制区 (移动顺序)
        control_frame = tk.Frame(root, pady=10)
        control_frame.pack(fill=tk.X, padx=10)

        tk.Label(control_frame, text="选中项排序:").pack(side=tk.LEFT)
        self.btn_up = ttk.Button(control_frame, text="↑ 上移", command=self.move_up)
        self.btn_up.pack(side=tk.LEFT, padx=5)
        self.btn_down = ttk.Button(control_frame, text="↓ 下移", command=self.move_down)
        self.btn_down.pack(side=tk.LEFT, padx=5)

    def on_press(self, event):
        """鼠标按下：记录准备拖拽的项"""
        item = self.tree.identify_row(event.y)
        if item:
            self.drag_source = item

    def on_motion(self, event):
        """鼠标移动：提供视觉反馈"""
        if not self.drag_source:
            return
        self.tree.config(cursor="fleur")
        target = self.tree.identify_row(event.y)
        if target:
            self.tree.selection_set(target)
            self.tree.focus(target)

    def on_release(self, event):
        """鼠标释放：执行移动操作并更新预览"""
        self.tree.config(cursor="")
        if not self.drag_source:
            return

        target = self.tree.identify_row(event.y)
        if not target or target == self.drag_source:
            self.drag_source = None
            return

        if self.is_descendant(self.drag_source, target):
            messagebox.showwarning("无效操作", "不能将文件夹拖入其自身的子目录中")
            self.drag_source = None
            return

        try:
            target_parent = self.tree.parent(target)
            target_index = self.tree.index(target)
            self.tree.move(self.drag_source, target_parent, target_index)
            # 移动完成后更新预览
            self.update_json_preview()
        except Exception as e:
            print(f"拖拽移动失败: {e}")

        self.drag_source = None

    def is_descendant(self, parent, child):
        """判断 child 是否是 parent 的后代节点"""
        node = child
        while node:
            if node == parent:
                return True
            node = self.tree.parent(node)
        return False

    def select_directory(self):
        """打开文件夹选择框并加载数据"""
        path = filedialog.askdirectory()
        if path:
            self.current_root_path = path
            self.lbl_path.config(text=path, fg="black")
            self.refresh_tree(path)
            self.btn_save.config(state=tk.NORMAL)
            self.update_json_preview()  # 加载完立即显示 JSON

    def refresh_tree(self, path):
        """清空并重新填充树"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        self._insert_node("", path)

    def _insert_node(self, parent_id, current_path):
        """递归扫描目录并插入到 Treeview"""
        try:
            items = os.listdir(current_path)
            items.sort(key=lambda x: (not os.path.isdir(os.path.join(current_path, x)), x.lower()))

            for item in items:
                full_path = os.path.join(current_path, item)
                is_dir = os.path.isdir(full_path)
                if item.startswith('.'):
                    continue

                item_type = "folder" if is_dir else "file"
                oid = self.tree.insert(
                    parent_id,
                    "end",
                    text=item,
                    values=(item_type,),
                    tags=(item_type,),
                    open=False
                )

                if is_dir:
                    self._insert_node(oid, full_path)
        except PermissionError:
            print(f"Permission denied: {current_path}")

    # --- 反向生成逻辑 ---
    def apply_json_to_tree(self):
        """读取右侧 JSON 并反向生成左侧树"""
        content = self.json_text.get(1.0, tk.END).strip()
        if not content:
            messagebox.showwarning("提示", "JSON 内容为空")
            return

        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            messagebox.showerror("JSON 解析错误", f"无法解析 JSON:\n{e}")
            return

        # 清空现有树
        for item in self.tree.get_children():
            self.tree.delete(item)

        try:
            self._build_tree_recursive("", data)
            self.lbl_path.config(text="[来自手动输入的 JSON 数据]", fg="blue")
            self.current_root_path = "JSON_SOURCE"  # 标记为非本地路径
            self.btn_save.config(state=tk.NORMAL)
        except Exception as e:
            messagebox.showerror("结构错误", f"构建树失败，请检查 JSON 结构:\n{e}")

    def _build_tree_recursive(self, parent_id, data):
        """递归解析 JSON 列表/字典并插入树"""
        # 如果是列表，遍历处理
        if isinstance(data, list):
            for item in data:
                self._build_tree_recursive(parent_id, item)
            return

        # 如果是字符串 (文件)
        if isinstance(data, str):
            self.tree.insert(parent_id, 'end', text=data, values=('file',), tags=('file',))
            return

        # 如果是字典 (文件夹)
        if isinstance(data, dict):
            name = data.get('name', '未命名')
            item_type = data.get('type', 'folder')
            children = data.get('children', [])

            # 插入文件夹节点
            oid = self.tree.insert(parent_id, 'end', text=name, values=(item_type,), tags=(item_type,), open=True)

            # 递归处理子节点
            self._build_tree_recursive(oid, children)
            return

    # --- 排序与导出 ---

    def move_up(self):
        """将选中的项目向上移动"""
        selected_item = self.tree.selection()
        if not selected_item:
            return
        item = selected_item[0]
        parent = self.tree.parent(item)
        index = self.tree.index(item)
        if index > 0:
            self.tree.move(item, parent, index - 1)
            self.update_json_preview()

    def move_down(self):
        """将选中的项目向下移动"""
        selected_item = self.tree.selection()
        if not selected_item:
            return
        item = selected_item[0]
        parent = self.tree.parent(item)
        current_siblings = self.tree.get_children(parent)
        index = self.tree.index(item)
        if index < len(current_siblings) - 1:
            self.tree.move(item, parent, index + 1)
            self.update_json_preview()

    def update_json_preview(self):
        """生成 JSON 并更新到右侧文本框"""
        data = self._tree_to_json("")
        json_str = json.dumps(data, indent=4, ensure_ascii=False)

        # 更新文本框 (保持可编辑状态)
        self.json_text.delete(1.0, tk.END)
        self.json_text.insert(tk.END, json_str)

    def copy_to_clipboard(self):
        """复制 JSON 内容到剪贴板"""
        content = self.json_text.get(1.0, tk.END)
        self.root.clipboard_clear()
        self.root.clipboard_append(content)
        messagebox.showinfo("提示", "JSON 代码已复制到剪贴板")

    def save_json(self):
        """根据当前 Treeview 的结构生成 JSON"""
        # 注意：这里不再强制检查 self.current_root_path 是否有真实路径
        # 只要树里有东西就可以导出

        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile="structure.json"
        )

        if not file_path:
            return

        data = self._tree_to_json("")

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            messagebox.showinfo("成功", "JSON 文件导出成功！")
        except Exception as e:
            messagebox.showerror("错误", f"保存失败: {str(e)}")

    def _tree_to_json(self, parent_id):
        """递归将 Treeview 节点转换为列表/字典结构"""
        result_list = []
        children = self.tree.get_children(parent_id)

        for child_id in children:
            item_data = self.tree.item(child_id)
            name = item_data['text']
            # 安全获取 values
            values = item_data.get('values', [])
            item_type = values[0] if values else 'file'

            if item_type == 'file':
                result_list.append(name)
            elif item_type == 'folder':
                folder_obj = {
                    "name": name,
                    "type": "folder",
                    "children": self._tree_to_json(child_id)
                }
                result_list.append(folder_obj)

        return result_list


if __name__ == "__main__":
    root = tk.Tk()
    try:
        from ctypes import windll

        windll.shcore.SetProcessDpiAwareness(1)
    except:
        pass

    app = DirectoryMapperApp(root)
    root.mainloop()
```

</details>