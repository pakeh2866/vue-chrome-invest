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
            
            // 获取表格中的所有行
            const rows = tableWrapper.querySelectorAll('tr');
            console.log('找到的行数:', rows.length);
            
            // 存储Trading Volume数据
            const Trading_Volume = [];
            
            // 遍历每一行，获取第一列和第6列的内容
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 6) {
                    const date = cells[0].innerText.trim();  // 第一列是日期
                    const volume = cells[5].innerText.trim();  // 第6列是Trading Volume
                    
                    Trading_Volume.push({
                        date: date,
                        volume: volume
                    });
                    
                    console.log(`第${index + 1}行数据:`, { date, volume });
                }
            });
            
            console.log('Trading_Volume数据:', Trading_Volume);
            
            // 将 Trading_Volume 数据存储到 chrome.storage.local
            chrome.storage.local.set({ 'Trading_Volume': Trading_Volume }, function() {
                console.log('Trading_Volume 已存储到 chrome.storage.local');
            });
        }
    }, 3000); // 延迟1秒
};




