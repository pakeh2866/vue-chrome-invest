// content_youzhiyouxing.js
// 这个脚本将在 manifest.json 中配置的所有匹配网站上运行

console.log("主内容脚本 content_youzhiyouxing.js 已加载到页面:", window.location.href);

// 获取所有 class="tw-text-[40px] tw-font-semibold" 的元素
const el = document.querySelector('.tw-text-\\[40px\\].tw-font-semibold');
let todayTemp = null;
if (el) {
    // 获取文本内容并去掉最后的"°"
    todayTemp = el.textContent.trim().replace(/°$/, '');
    console.log('今日有知温度计的值:', todayTemp);
    // 存储到 Chrome 扩展的 storage
    chrome.storage.local.set({ todayTemp: todayTemp }, function() {
        console.log('今日有知温度计的值已存储到 chrome.storage.local');
    });
}

const el_all = document.querySelector('.tw-aspect-w-16.tw-aspect-h-12.tw-select-none');
console.log(el_all);

// 获取canvas元素
const canvas = document.querySelector('.tw-aspect-w-16.tw-aspect-h-12.tw-select-none canvas[data-history]');
let dateDegreeDB = [];

if (canvas) {
    // 解析data-history属性为JSON
    const history = JSON.parse(canvas.getAttribute('data-history'));
    // 遍历每一项，提取date和degree
    dateDegreeDB = history.map(item => ({
        date: item.date,
        degree: item.degree
    }));
    console.log(dateDegreeDB);
    // 存储到 Chrome 扩展的 storage
    chrome.storage.local.set({ dateDegreeDB: dateDegreeDB }, function() {
        console.log('dateDegreeDB 已存储到 chrome.storage.local');
    });
} else {
    console.log('未找到canvas元素');
}

chrome.storage.local.get(['dateDegreeDB'], function(result) {
    const oldDB = Array.isArray(result.dateDegreeDB) ? result.dateDegreeDB : [];
    // 先把旧数据转成以date为key的对象
    const dbMap = {};
    oldDB.forEach(item => {
        dbMap[item.date] = item;
    });
    // 用新数据更新或新增
    dateDegreeDB.forEach(item => {
        dbMap[item.date] = item; // 新的覆盖旧的
    });
    // 合并结果转回数组
    const mergedDB = Object.values(dbMap);
    // 存回storage
    chrome.storage.local.set({ dateDegreeDB: mergedDB }, function() {
        console.log('dateDegreeDB 已增量合并并存储到 chrome.storage.local');
    });
});




