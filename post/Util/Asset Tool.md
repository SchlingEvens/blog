



# 雨世界网格地图生成器

之前做来放进网页里当待机动画的素材的，和原作的其实不是很相似，主打一个神似。

有两个版本，一个跑很快，但没有噪点，可以用运气对冲随机性，之后再用csp处理；另一个用分形噪音做了噪点，跑很慢，而且效果没有好到哪里去。

## 快速版

<details>

<summary><strong>点击这里查看 Python 源码</strong></summary>

```python
import random
import math
from PIL import Image, ImageDraw, ImageColor
from opensimplex import OpenSimplex
import numpy as np

# --- 1. 可控参数 (您可以随意调整这些参数) ---

# --- 画布参数 ---
WIDTH = 1560
HEIGHT = 1192
COLOR_BG = (0, 0, 0, 0)  # 透明背景 (R,G,B,A)

# --- (新) 随机网格集群参数 (第 2 层) ---
# <--- 已重构: 这是"随机放置"的集群, 它们可以重叠 ---
NUM_GRID_CLUSTERS = 15  # <--- 总共生成 10 个"组" (值越大, 越密集且重叠越多)
CLUSTER_BLOCK_WIDTH_RANGE = (150, 1200)  # "组"的宽度范围
CLUSTER_BLOCK_HEIGHT_RANGE = (400, 900)  # "组"的高度范围
CLUSTER_TILT_CHANCE = 0.8  # <--- 70% 的"组"会发生倾斜
CLUSTER_TILT_ANGLE_RANGE = (-30, 45)  # "组"的倾斜角度范围

# --- (新) "组"内部的网格线参数 (第 2.5 层) ---
INTERNAL_GRID_MIN_RECT_SIZE = 40  # <--- "组"内部的最小网格大小
INTERNAL_GRID_SPLIT_CHANCE = 0.85
INTERNAL_GRID_SPLIT_RANGE = (0.05, 0.9)

# --- 网格线外观参数 (已恢复) ---
COLOR_GRID = (29,255, 162, 200)  # 网格颜色
GRID_LINE_WIDTH_RANGE = (1, 4)
GRID_BROKEN_DASH_RANGE = (30, 60)  # "破损线"中实线部分的长度
GRID_BROKEN_GAP_RANGE = (3, 10)  # "破损线"中缺口部分的长度

# --- 环境噪点参数 (第3层) ---
NOISE_DETAIL_SCALE = 50.0
NOISE_MASK_SCALE = 250.0
NOISE_MASK_CONTRAST = 2
NOISE_SPARSITY = 3
NOISE_THRESHOLD_1 = 0.55
NOISE_THRESHOLD_2 = 0.45
COLOR_NOISE_1 = (120, 0, 120)
COLOR_NOISE_2 = (200, 0, 50)

# --- POI 兴趣点参数 (第4层) ---
POI_NUM_CLUSTERS = 3
POI_PER_CLUSTER = (3, 7)
POI_CLUSTER_RADIUS = 45.0
POI_SIZE = 24
COLOR_POI_FILL = (255, 0, 0)
COLOR_POI_BORDER = (255, 100, 100)


# --- 2. 辅助函数：点旋转 (与之前相同) ---
def rotate_point(px, py, cx, cy, angle_deg):
    angle_rad = math.radians(angle_deg)
    s = math.sin(angle_rad)
    c = math.cos(angle_rad)
    px_c = px - cx;
    py_c = py - cy
    x_new = px_c * c - py_c * s;
    y_new = px_c * s + py_c * c
    return (x_new + cx, y_new + cy)


# --- 3. 辅助函数：绘制破损线段 (与之前相同) ---
def draw_broken_line(draw, p1, p2, fill, width, dash_range, gap_range):
    dx = p2[0] - p1[0];
    dy = p2[1] - p1[1]
    length = math.hypot(dx, dy)
    if length == 0: return
    dx /= length;
    dy /= length
    current_pos = 0.0
    while current_pos < length:
        dash_len = random.uniform(*dash_range)
        gap_len = random.uniform(*gap_range)
        start_draw = current_pos
        end_draw = min(current_pos + dash_len, length)
        if end_draw > start_draw:
            start_point = (p1[0] + dx * start_draw, p1[1] + dy * start_draw)
            end_point = (p1[0] + dx * end_draw, p1[1] + dy * end_draw)
            draw.line([start_point, end_point], fill=fill, width=width)
        current_pos += dash_len + gap_len


# --- 4. 核心网格生成器 (与之前相同) ---
def _generate_recursive_lines_list(x, y, w, h, min_size, split_chance, split_range):
    lines_list = []
    if (w < min_size or h < min_size) and (w < min_size and h < min_size): return []
    if random.random() > split_chance: return []
    split_vertical = (w > h)
    if w == h: split_vertical = random.choice([True, False])
    if split_vertical:
        split_x = x + int(random.uniform(*split_range) * w)
        lines_list.append(((split_x, y), (split_x, y + h)))
        lines_list.extend(_generate_recursive_lines_list(x, y, split_x - x, h, min_size, split_chance, split_range))
        lines_list.extend(
            _generate_recursive_lines_list(split_x + 1, y, w - (split_x - x) - 1, h, min_size, split_chance,
                                           split_range))
    else:
        split_y = y + int(random.uniform(*split_range) * h)
        lines_list.append(((x, split_y), (x + w, split_y)))
        lines_list.extend(_generate_recursive_lines_list(x, y, w, split_y - y, min_size, split_chance, split_range))
        lines_list.extend(
            _generate_recursive_lines_list(x, split_y + 1, w, h - (split_y - y) - 1, min_size, split_chance,
                                           split_range))
    return lines_list


# --- 5. (新) 绘制随机网格集群 (可重叠) ---
def draw_grid_clusters(draw):
    """
    在画布上随机放置 N 个网格集群, 它们可以重叠
    """
    print(f"Drawing {NUM_GRID_CLUSTERS} grid clusters (overlapping is allowed)...")

    for _ in range(NUM_GRID_CLUSTERS):

        # 1. 随机选择集群中心、大小和角度
        # (中心点可以在画布的任何地方)
        center_x = random.randint(0, WIDTH)
        center_y = random.randint(0, HEIGHT)

        angle = 0.0
        if random.random() < CLUSTER_TILT_CHANCE:
            angle = random.uniform(*CLUSTER_TILT_ANGLE_RANGE)

        block_w = random.uniform(*CLUSTER_BLOCK_WIDTH_RANGE)
        block_h = random.uniform(*CLUSTER_BLOCK_HEIGHT_RANGE)

        # 2. 在 "本地" 坐标系 (以 0,0 为中心) 生成内部网格线
        local_lines = _generate_recursive_lines_list(
            -block_w / 2.0, -block_h / 2.0, block_w, block_h,
            INTERNAL_GRID_MIN_RECT_SIZE,
            INTERNAL_GRID_SPLIT_CHANCE,
            INTERNAL_GRID_SPLIT_RANGE
        )

        # 3. 遍历所有本地线段, 将它们旋转并平移到"组"的正确位置
        for (lx1, ly1), (lx2, ly2) in local_lines:
            # 转换为 "预旋转" 的全局坐标
            pre_rot_p1 = (lx1 + center_x, ly1 + center_y)
            pre_rot_p2 = (lx2 + center_x, ly2 + center_y)

            # 旋转
            p1_final = rotate_point(pre_rot_p1[0], pre_rot_p1[1], center_x, center_y, angle)
            p2_final = rotate_point(pre_rot_p2[0], pre_rot_p2[1], center_x, center_y, angle)

            # 绘制旋转后的破损线
            draw_broken_line(
                draw, p1_final, p2_final,
                COLOR_GRID,
                random.randint(*GRID_LINE_WIDTH_RANGE),
                GRID_BROKEN_DASH_RANGE,
                GRID_BROKEN_GAP_RANGE
            )


# --- 6. 噪声生成函数 (与之前相同) ---
def draw_environmental_noise(draw):
    print("Generating noise map (this may take a second)...")
    simplex_gen_detail = OpenSimplex(seed=random.randint(0, 100000));
    simplex_gen_mask = OpenSimplex(seed=random.randint(0, 100000))
    x_indices = np.linspace(0, 1, WIDTH);
    y_indices = np.linspace(0, 1, HEIGHT);
    world_x, world_y = np.meshgrid(x_indices, y_indices)
    v_noise_detail = np.vectorize(simplex_gen_detail.noise2);
    detail_noise_map = v_noise_detail(world_x * NOISE_DETAIL_SCALE, world_y * NOISE_DETAIL_SCALE);
    detail_noise_map = (detail_noise_map + 1) / 2
    v_noise_mask = np.vectorize(simplex_gen_mask.noise2);
    mask_noise_map = v_noise_mask(world_x * NOISE_MASK_SCALE, world_y * NOISE_MASK_SCALE);
    mask_noise_map = (mask_noise_map + 1) / 2
    if NOISE_MASK_CONTRAST != 1.0: mask_noise_map = np.power(mask_noise_map, NOISE_MASK_CONTRAST)
    final_noise_map = detail_noise_map * mask_noise_map
    print("Drawing noise pixels...");
    draw_size = max(1, NOISE_SPARSITY)
    for y in range(0, HEIGHT, draw_size):
        for x in range(0, WIDTH, draw_size):
            val = final_noise_map[y, x]
            if val > NOISE_THRESHOLD_1:
                color = COLOR_NOISE_1
            elif val > NOISE_THRESHOLD_2:
                color = COLOR_NOISE_2
            else:
                continue
            if draw_size == 1:
                draw.point((x, y), fill=color)
            else:
                draw.rectangle([x, y, x + draw_size - 1, y + draw_size - 1], fill=color)


# --- 7. POI 兴趣点生成函数 (与之前相同) ---
def draw_poi(draw, x, y):
    draw.rectangle([x, y, x + POI_SIZE - 1, y + POI_SIZE - 1], fill=COLOR_POI_FILL, outline=COLOR_POI_BORDER, width=1)


def draw_poi_clusters(draw):
    print("Drawing POI clusters...")
    for _ in range(POI_NUM_CLUSTERS):
        center_x = random.randint(int(WIDTH * 0.1), int(WIDTH * 0.9));
        center_y = random.randint(int(HEIGHT * 0.1), int(HEIGHT * 0.9))
        num_pois = random.randint(*POI_PER_CLUSTER)
        for _ in range(num_pois):
            poi_x = int(random.normalvariate(center_x, POI_CLUSTER_RADIUS));
            poi_y = int(random.normalvariate(center_y, POI_CLUSTER_RADIUS))
            if not (0 < poi_x < WIDTH - POI_SIZE and 0 < poi_y < HEIGHT - POI_SIZE): continue
            draw_poi(draw, poi_x, poi_y)


# --- 8. 主执行函数 (已修改) ---
def generate_map():
    print(f"Creating new image ({WIDTH}x{HEIGHT})...")
    image = Image.new('RGBA', (WIDTH, HEIGHT), COLOR_BG)
    draw = ImageDraw.Draw(image)

    # <--- (已修改) ---
    # 移除了"拼布"函数 (v9)
    # 调用新的"集群"函数 (v10, 允许重叠)
    print("Generating grid clusters...")
    draw_grid_clusters(draw)

    # 绘制噪点和 POI (不变)
    draw_environmental_noise(draw)
    draw_poi_clusters(draw)

    output_filename = "generated_procedural_map_v10.png"
    image.save(output_filename)  # 直接保存RGBA图像
    print(f"Done! Map saved as '{output_filename}'")
    # image.show()


if __name__ == "__main__":
    generate_map()
```



</details>



## 分型噪声版

## 

<details>

<summary><strong>点击这里查看 Python 源码</strong></summary>

```python
import random
import math
from PIL import Image, ImageDraw
# 画布
WIDTH = 1560
HEIGHT = 1192
COLOR_BG = (0, 0, 0, 0)

NUM_GRID_CLUSTERS = 15
CLUSTER_BLOCK_WIDTH_RANGE = (150, 1200)
CLUSTER_BLOCK_HEIGHT_RANGE = (400, 900)
CLUSTER_TILT_CHANCE = 0.8
CLUSTER_TILT_ANGLE_RANGE = (-30, 45)
INTERNAL_GRID_MIN_RECT_SIZE = 30
INTERNAL_GRID_SPLIT_CHANCE = 0.85
INTERNAL_GRID_SPLIT_RANGE = (0.05, 0.9)

#网格线
COLOR_GRID = (29, 255, 162, 200)
GRID_LINE_WIDTH_RANGE = (1, 4)
GRID_BROKEN_DASH_RANGE = (30, 60)
GRID_BROKEN_GAP_RANGE = (3, 10)


# POI 参数
POI_NUM_CLUSTERS = 3
POI_PER_CLUSTER = (3, 8)
POI_CLUSTER_RADIUS = 45
POI_SIZE = 24
COLOR_POI_FILL = (255, 0, 0)
COLOR_POI_BORDER = (255, 100, 100)


# 点旋转
def rotate_point(px, py, cx, cy, angle_deg):
    angle_rad = math.radians(angle_deg)
    s = math.sin(angle_rad)
    c = math.cos(angle_rad)
    px_c = px - cx
    py_c = py - cy
    x_new = px_c * c - py_c * s
    y_new = px_c * s + py_c * c
    return (x_new + cx, y_new + cy)



def draw_broken_line(draw, p1, p2, fill, width, dash_range, gap_range):
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    length = math.hypot(dx, dy)
    if length == 0: return
    dx /= length
    dy /= length
    current_pos = 0.0
    while current_pos < length:
        dash_len = random.uniform(*dash_range)
        gap_len = random.uniform(*gap_range)
        start_draw = current_pos
        end_draw = min(current_pos + dash_len, length)
        if end_draw > start_draw:
            start_point = (p1[0] + dx * start_draw, p1[1] + dy * start_draw)
            end_point = (p1[0] + dx * end_draw, p1[1] + dy * end_draw)
            draw.line([start_point, end_point], fill=fill, width=width)
        current_pos += dash_len + gap_len


# 核心网格
def _generate_recursive_lines_list(x, y, w, h, min_size, split_chance, split_range):
    lines_list = []
    if (w < min_size or h < min_size) and (w < min_size and h < min_size): return []
    if random.random() > split_chance: return []
    split_vertical = (w > h)
    if w == h: split_vertical = random.choice([True, False])
    if split_vertical:
        split_x = x + int(random.uniform(*split_range) * w)
        lines_list.append(((split_x, y), (split_x, y + h)))
        lines_list.extend(_generate_recursive_lines_list(x, y, split_x - x, h, min_size, split_chance, split_range))
        lines_list.extend(
            _generate_recursive_lines_list(split_x + 1, y, w - (split_x - x) - 1, h, min_size, split_chance,
                                           split_range))
    else:
        split_y = y + int(random.uniform(*split_range) * h)
        lines_list.append(((x, split_y), (x + w, split_y)))
        lines_list.extend(_generate_recursive_lines_list(x, y, w, split_y - y, min_size, split_chance, split_range))
        lines_list.extend(
            _generate_recursive_lines_list(x, split_y + 1, w, h - (split_y - y) - 1, min_size, split_chance,
                                           split_range))
    return lines_list


# 随机网格集群
def draw_grid_clusters(draw):
    print(f"Drawing {NUM_GRID_CLUSTERS} grid clusters (overlapping is allowed)...")
    for _ in range(NUM_GRID_CLUSTERS):
        center_x = random.randint(0, WIDTH)
        center_y = random.randint(0, HEIGHT)
        angle = 0.0
        if random.random() < CLUSTER_TILT_CHANCE:
            angle = random.uniform(*CLUSTER_TILT_ANGLE_RANGE)
        block_w = random.uniform(*CLUSTER_BLOCK_WIDTH_RANGE)
        block_h = random.uniform(*CLUSTER_BLOCK_HEIGHT_RANGE)
        local_lines = _generate_recursive_lines_list(-block_w / 2.0, -block_h / 2.0, block_w, block_h,
                                                     INTERNAL_GRID_MIN_RECT_SIZE, INTERNAL_GRID_SPLIT_CHANCE,
                                                     INTERNAL_GRID_SPLIT_RANGE)
        for (lx1, ly1), (lx2, ly2) in local_lines:
            pre_rot_p1 = (lx1 + center_x, ly1 + center_y)
            pre_rot_p2 = (lx2 + center_x, ly2 + center_y)
            p1_final = rotate_point(pre_rot_p1[0], pre_rot_p1[1], center_x, center_y, angle)
            p2_final = rotate_point(pre_rot_p2[0], pre_rot_p2[1], center_x, center_y, angle)
            draw_broken_line(draw, p1_final, p2_final, COLOR_GRID, random.randint(*GRID_LINE_WIDTH_RANGE),
                             GRID_BROKEN_DASH_RANGE, GRID_BROKEN_GAP_RANGE)


#POI 兴趣点
def draw_poi(draw, x, y):
    draw.rectangle([x, y, x + POI_SIZE - 1, y + POI_SIZE - 1], fill=COLOR_POI_FILL, outline=COLOR_POI_BORDER, width=1)


def draw_poi_clusters(draw):
    print("Drawing POI clusters...")
    for _ in range(POI_NUM_CLUSTERS):
        center_x = random.randint(int(WIDTH * 0.1), int(WIDTH * 0.9))
        center_y = random.randint(int(HEIGHT * 0.1), int(HEIGHT * 0.9))
        num_pois = random.randint(*POI_PER_CLUSTER)
        for _ in range(num_pois):
            poi_x = int(random.normalvariate(center_x, POI_CLUSTER_RADIUS))
            poi_y = int(random.normalvariate(center_y, POI_CLUSTER_RADIUS))
            if not (0 < poi_x < WIDTH - POI_SIZE and 0 < poi_y < HEIGHT - POI_SIZE): continue
            draw_poi(draw, poi_x, poi_y)


#
def generate_map(file_index):
    print(f"Creating new image ({WIDTH}x{HEIGHT})...")
    image = Image.new('RGBA', (WIDTH, HEIGHT), COLOR_BG)
    draw = ImageDraw.Draw(image)

    print("Generating grid clusters...")
    draw_grid_clusters(draw)


    print("Drawing POI clusters...")
    draw_poi_clusters(draw)

    output_filename = f"generated_procedural_map_{file_index}.png"
    image.save(output_filename)
    print(f"Done! Map saved as '{output_filename}'")
    # image.show()


if __name__ == "__main__":
    num_images_to_generate = 20
    print(f"=== Starting Batch Generation for {num_images_to_generate} Maps ===")

    for i in range(1, num_images_to_generate + 1):
        print(f"\n--- Generating Map {i}/{num_images_to_generate} ---")
        generate_map(i)

    print(f"\n=== Batch Generation Complete. {num_images_to_generate} maps saved. ===")

```



</details>