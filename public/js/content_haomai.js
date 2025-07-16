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

        // 获取 class="temputure" 的元素
        const tempEls = document.getElementsByClassName('temputure');
        console.log('tempEls:', tempEls);
        if (tempEls.length > 0) {
          const text = tempEls[0].innerText;
          console.log('text:', text);
          // 匹配“市场温度(07-15):”后面的内容
          const regex1 = /(?<=\()\d{2}-\d{2}(?=\))/;
          const match = text.match(regex1);
          console.log('match:', match);
          if (match) {
            const value = match[0];
            console.log('市场温度后的内容:', value);
            chrome.storage.local.set({ 'haomai_date': value }, function() {
              console.log('haomai_date 已存储到 chrome.storage.local:', value);
            });
          } else {
            console.log('未找到市场温度后的内容');
          }
        }
    }, 3000); // 延迟1秒
};




