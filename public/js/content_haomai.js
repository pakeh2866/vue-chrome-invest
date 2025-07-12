// content_haomai.js
// 这个脚本将在 manifest.json 中配置的所有匹配网站上运行

console.log("主内容脚本 content_haomai.js 已加载到页面:", window.location.href);

window.onload = function() {
    setTimeout(function() {
        // 获取 class="num" 的内容，并保存到 haomai_today-temp
        const numEl = document.querySelector('.num');
        if (numEl) {
            // 先去掉末尾的"℃"和空格
            let haomaiTodayTemp = numEl.textContent.trim().replace(/℃$/, '').trim();
            chrome.storage.local.set({ 'haomai_today-temp': haomaiTodayTemp }, function() {
                console.log('haomai_today-temp 已存储到 chrome.storage.local:', haomaiTodayTemp);
            });
        }
    }, 1000); // 延迟1秒
};




