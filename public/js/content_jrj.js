// content_jrj.js
// 这个脚本将在 manifest.json 中配置的所有匹配网站上运行

console.log("主内容脚本 content_jrj.js 已加载到页面:", window.location.href);

window.onload = function() {
    setTimeout(function() {
        // 获取所有 class="el-table__body-wrapper is-scrolling-none" 对应的元素
        const tableWrappers = document.querySelectorAll('.el-table__body-wrapper.is-scrolling-none');
        const tableWrapper = tableWrappers.length > 1 ? tableWrappers[1] : null;
        
        // 输出 log
        console.log('找到的元素总数:', tableWrappers.length);
        console.log('获取第二个元素:', tableWrapper);
        console.log('第二个元素是否存在:', tableWrapper ? '是' : '否');
        if (tableWrapper) {
            console.log('元素详细信息:', {
                tagName: tableWrapper.tagName,
                className: tableWrapper.className,
                id: tableWrapper.id,
                innerText: tableWrapper.innerText ? tableWrapper.innerText.substring(0, 100) + '...' : '无文本内容'
            });
        }
    }, 3000); // 延迟1秒
};




