const POST_ROOT = './post'; 

const DEFAULT_FILE_INDEX = [
    {
        "name": "HTML5",
        "type": "folder",
        "children": [
            "文本标记.md",
            "图像标记.md",
            "超链接标记.md",
            "列表标记.md",
            "音频.md",
            "视频.md",
            "结构化标记.md",
            "表单.md"
        ]
    },
    {
        "name": "CSS",
        "type": "folder",
        "children": [
            "简介.md",
            "引入.md",
            "选择器.md",
            "优先级.md",
            "关系选择器.md",
            "伪类选择器.md",
            "字体.md",
            "背景.md",
            "定位与布局.md",
            "浮动.md",
            "外边距塌陷与 BFC.md",
            "变形.md",
            "过渡.md",
            "动画.md"
        ]
    },
    {
        "name": "JavaScript",
        "type": "folder",
        "children": [
            "JavaScript.md"
        ]
    },
    {
        "name": "Misc",
        "type": "folder",
        "children": [
            "Canvas.md",
            "matterjs.md",
            "Paper.md",
            "threejs.md"
        ]
    },
    {
        "name": "Util",
        "type": "folder",
        "children": [
            "File Tool.md"
        ]
    },
    "README.md"
];

function buildTree(config, parentPath) {
    return config.map(item => {
        if (typeof item === 'string') {
            return {
                name: item,
                type: 'file',
                path: `${parentPath}/${item}`
            };
        } else {
            return {
                name: item.name,
                type: 'folder',
                children: buildTree(item.children, `${parentPath}/${item.name}`)
            };
        }
    });
}

const dom = {
    fileTree: document.getElementById('file-tree'),
    contentArea: document.getElementById('content-area'),
    markdownRender: document.getElementById('markdown-render'),
    tocContent: document.getElementById('toc-content'),
    breadcrumb: document.getElementById('breadcrumb'),
    settingsModal: document.getElementById('settings-modal'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('mobile-overlay'),
    customCssStyle: document.getElementById('dynamic-user-css'),
    customCssInput: document.getElementById('custom-css-input')
};

async function init() {
    let dataToRender = DEFAULT_FILE_INDEX;

    try {
        const response = await fetch('./FileConfig.json');
        if (response.ok) {
            dataToRender = await response.json();
            console.log('成功加载外部配置文件FileConfig.json');
        }
    } catch (e) {
        console.warn('使用内置默认配置。');
    }

    const appData = buildTree(dataToRender, POST_ROOT);
    renderSidebar(appData, dom.fileTree);

    const savedCss = localStorage.getItem('userCustomCss');
    if(savedCss) {
        dom.customCssInput.value = savedCss;
        applyCustomCSS();
    }

    const readmeNode = appData.find(node => node.name === 'README.md');
    if (readmeNode) {
        openFile(readmeNode, ['README.md']);
        setTimeout(() => {
            const allItems = document.querySelectorAll('.tree-item');
            for (const item of allItems) {
                const span = item.querySelector('span');
                if (span && span.textContent === 'README') {
                    item.classList.add('active');
                    break;
                }
            }
        }, 0);
    } else {
        dom.markdownRender.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 mt-10 text-center">
                <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <i class="fas fa-feather-alt text-3xl text-primary opacity-40"></i>
                </div>
                <h2 class="text-xl font-bold mb-2 text-gray-700 dark:text-gray-200">开始记录</h2>
                <p class="mb-6 max-w-sm mx-auto text-sm text-gray-500 dark:text-gray-400">
                    从左侧目录选择笔记。<br>未找到默认 README.md 文件。
                </p>
            </div>
        `;
    }
}

function renderSidebar(nodes, container, level = 0, pathPrefix = []) {
    const basePadding = 0.8; 
    const indentStep = 0.8; 
    
    nodes.forEach(node => {
        const itemDiv = document.createElement('div');
        const currentPath = [...pathPrefix, node.name];
        const paddingLeft = level === 0 ? basePadding : (basePadding + level * indentStep);

        if (node.type === 'folder') {
            const header = document.createElement('div');
            header.className = 'tree-item folder-header select-none';
            header.style.paddingLeft = `${paddingLeft}rem`;
            
            header.innerHTML = `
                <span class="truncate flex-1">${node.name}</span>
                <i class="fas fa-chevron-right folder-arrow"></i>
            `;
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'folder-content';
            
            header.onclick = () => {
                const isOpen = childrenContainer.classList.toggle('open');
                const arrow = header.querySelector('.folder-arrow');
                if (isOpen) {
                    arrow.classList.add('rotated');
                } else {
                    arrow.classList.remove('rotated');
                }
            };
            itemDiv.appendChild(header);
            itemDiv.appendChild(childrenContainer);
            container.appendChild(itemDiv);
            
            renderSidebar(node.children, childrenContainer, level + 1, currentPath);
        } else {
            const fileEl = document.createElement('div');
            fileEl.className = 'tree-item text-sm';
            fileEl.style.paddingLeft = `${paddingLeft}rem`;
            const displayName = node.name.replace(/\.md$/, '');
            
            fileEl.innerHTML = `<span class="truncate">${displayName}</span>`;
            
            fileEl.onclick = () => {
                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
                fileEl.classList.add('active');
                openFile(node, currentPath);
                if(window.innerWidth < 768) toggleSidebar(false);
            };
            container.appendChild(fileEl);
        }
    });
}

function generateTOC() {
    const headers = dom.markdownRender.querySelectorAll('h1, h2, h3');
    dom.tocContent.innerHTML = ''; 

    if (headers.length === 0) {
        dom.tocContent.innerHTML = '<p class="text-sm text-gray-400 italic">暂无目录</p>';
        return;
    }

    let hasValidHeader = false;

    headers.forEach((header, index) => {
        if (header.parentElement !== dom.markdownRender) {
            return;
        }

        hasValidHeader = true;

        const id = 'heading-' + index;
        header.id = id;

        const link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = header.textContent;
        link.className = 'toc-link';
        
        const tagName = header.tagName.toLowerCase();
        if (tagName === 'h1') link.classList.add('toc-h1');
        else if (tagName === 'h2') link.classList.add('toc-h2');
        else if (tagName === 'h3') link.classList.add('toc-h3');

        link.onclick = (e) => {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
        };

        dom.tocContent.appendChild(link);
    });

     if (!hasValidHeader) {
        dom.tocContent.innerHTML = '<p class="text-sm text-gray-400 italic">暂无目录</p>';
    }
}

function openFile(node, pathArray) {
    const breadcrumbPath = pathArray.map(p => p.replace(/\.md$/, ''));
    dom.breadcrumb.innerHTML = breadcrumbPath.join(' <span class="mx-1 opacity-30">/</span> ');
    dom.markdownRender.innerHTML = `<div class="flex h-full items-center justify-center text-gray-400"><i class="fas fa-circle-notch fa-spin text-3xl text-primary opacity-50"></i></div>`;
    dom.tocContent.innerHTML = ''; 

    fetch(node.path)
        .then(response => {
            if (!response.ok) throw new Error(`无法读取文件 (HTTP ${response.status})`);
            return response.text();
        })
        .then(text => {
            const htmlContent = marked.parse(text);
            dom.markdownRender.innerHTML = htmlContent;
            dom.contentArea.scrollTop = 0;
            
            generateTOC();
        })
        .catch(err => {
            console.error(err);
            let msg = "无法加载笔记内容。";
            if (window.location.protocol === 'file:') {
                msg += "<br><br><b>环境提示：</b><br>浏览器禁止直接读取本地文件 (CORS)。<br>请使用 'Live Server' 或本地服务器环境运行此 HTML。";
            } else {
                msg += `<br>路径: ${node.path}<br>错误信息: ${err.message}`;
            }
            dom.markdownRender.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-8 rounded-xl text-center max-w-md">
                        <i class="fas fa-bug text-4xl mb-4 opacity-50"></i>
                        <h3 class="font-bold text-lg mb-2">读取失败</h3>
                        <p class="text-sm opacity-80">${msg}</p>
                    </div>
                </div>
            `;
        });
}

const toggleSidebar = (show) => {
    if (show) {
        dom.sidebar.classList.remove('-translate-x-full');
        dom.overlay.classList.remove('hidden');
    } else {
        dom.sidebar.classList.add('-translate-x-full');
        dom.overlay.classList.add('hidden');
    }
};

document.getElementById('open-sidebar').onclick = () => toggleSidebar(true);
document.getElementById('close-sidebar').onclick = () => toggleSidebar(false);
dom.overlay.onclick = () => toggleSidebar(false);

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

document.getElementById('settings-toggle').onclick = () => toggleSettings(true);
function toggleSettings(show) {
    if(show) dom.settingsModal.classList.remove('hidden');
    else dom.settingsModal.classList.add('hidden');
}

function updateCSSVar(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}

function applyCustomCSS() {
    const css = dom.customCssInput.value;
    dom.customCssStyle.textContent = css;
    localStorage.setItem('userCustomCss', css);
    const btn = document.querySelector('#settings-modal button.bg-primary');
    const originalText = btn.textContent;
    btn.textContent = "已保存";
    setTimeout(() => btn.textContent = originalText, 1000);
}

init();