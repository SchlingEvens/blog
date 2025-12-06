// 获取 Canvas 元素
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
// 1. 稍微增加一点数量以增强漩涡感，但保持清爽
const particleCount = 32;
// 视角距离 (FOV)
const viewDistance = 800;

// 鼠标交互变量
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 全局时间，用于呼吸动画
let time = 0;

// 3D 粒子类
class Particle {
    constructor() {
        this.centerX = mouseX;
        this.centerY = mouseY;

        // 跟随速度
        this.followSpeed = 0.02 + Math.random() * 0.04;

        // 呼吸相位
        this.phase = Math.random() * Math.PI * 2;

        // 自身旋转角度 (用于椭圆自转)
        this.selfAngle = 0;

        this.reset();
    }

    reset() {
        // 修改：改为圆盘/圆环分布，确保中间有真正的真空区
        const angle = Math.random() * Math.PI * 2;

        // 半径控制：
        // innerRadius (真空区半径)
        // spread (分布宽度)
        const innerRadius = 50;
        const spread = 40;

        // r 的范围
        const r = innerRadius + Math.random() * spread;

        // 计算位置 (圆盘状)
        this.x = r * Math.cos(angle);
        this.y = r * Math.sin(angle);

        // Z轴只给一点点厚度，保持扁平的漩涡形态
        this.z = (Math.random() - 0.5) * 50;

        // 粒子大小
        const baseSize = 1 + Math.random()*0.5 ;
        this.radiusX = baseSize;
        // 长轴
        this.radiusY = baseSize * (1.25 + Math.random()* 0.75);

        // 颜色
        this.hue = Math.floor(Math.random() * 360);

        // 新增：个体速度差异系数 (0.5 ~ 1.5)
        // 这样每个粒子的基础速度都不一样，有的快有的慢
        this.speedFactor = 0.5 + Math.random();
    }

    // 绕 Y 轴旋转
    rotateY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.z * sin;
        const z = this.z * cos + this.x * sin;
        this.x = x;
        this.z = z;
    }

    // 绕 X 轴旋转
    rotateX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = this.y * cos - this.z * sin;
        const z = this.z * cos + this.y * sin;
        this.y = y;
        this.z = z;
    }

    // 绕 Z 轴旋转 (这是形成 2D 平面漩涡感的关键)
    rotateZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.y * cos + this.x * sin;
        this.x = x;
        this.y = y;
    }

    // 3D -> 2D 投影
    project(breathing) {
        const effectiveX = this.x * breathing;
        const effectiveY = this.y * breathing;
        const effectiveZ = this.z * breathing;

        const distance = viewDistance + effectiveZ;
        if (distance <= 0) return null;

        const scale = viewDistance / distance;

        const x2d = effectiveX * scale + this.centerX;
        const y2d = effectiveY * scale + this.centerY;

        return { x: x2d, y: y2d, scale: scale };
    }
}

function initParticles() {
    resize();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    animate();
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

// 颜色生成
function getParticleColor(hue, isDark) {
    const saturation = '90%';
    const lightness = isDark ? '60%' : '50%';
    const alpha = isDark ? 0.9 : 0.7;
    return `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // 检测暗色模式
    const isDark = true;

    time += 0.01;

    particles.forEach(p => {
        // --- 4. 修改：漩涡物理与跟随逻辑 ---

        // 1. 中心点跟随鼠标 (平滑移动)
        p.centerX += (mouseX - p.centerX) * p.followSpeed;
        p.centerY += (mouseY - p.centerY) * p.followSpeed;

        // 2. 计算粒子在 3D 空间中距离中心的半径
        const r = Math.sqrt(p.x * p.x + p.y * p.y);

        // 3. 漩涡速度计算 (修改重点)
        // 现在的逻辑：r * 0.000x -> 距离越远越快
        // baseRotation 是基础旋转增量

        // --- 这里控制速度 ---
        // 改慢了：除数从 1000 改为 4000，基础值从 0.01 改为 0.002
        let baseRotation = 0.0075 + (r / 4000);

        // 乘上每个粒子独有的速度系数，实现“有快有慢”
        let vortexSpeed = baseRotation * p.speedFactor;

        // 应用旋转
        p.rotateZ(vortexSpeed);

        // 4. 呼吸效果
        const breathing = 1 + Math.sin(time + p.phase) * 0.2;

        // 投影
        const proj = p.project(breathing);

        if (proj) {
            // 5. 使用椭圆绘制
            ctx.fillStyle = getParticleColor(p.hue, isDark);
            ctx.beginPath();

            // 长轴始终垂直于粒子到中心的连线 (切向)
            const angle = Math.atan2(p.y, p.x);

            ctx.ellipse(
                proj.x,
                proj.y,
                p.radiusX * proj.scale,
                p.radiusY * proj.scale,
                angle,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('touchmove', e => {
    if(e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
});

initParticles();