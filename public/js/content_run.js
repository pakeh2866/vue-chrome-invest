// content_cheesefortune.js

const currentUrl = window.location.href;
console.log(currentUrl);
console.log("主内容脚本 content_cheesefortune.js 已加载到页面:", window.location.href);

const url = window.location.href;
const match = url.match(/code=([^&]+)/);
let index_code = null;
if (match) {
  index_code = match[1];
  console.log("匹配到的code:", index_code);
} else {
  console.log("未找到code参数");
}

setTimeout(function() {
  // 提取children中的PE数据
  function extractPEData(element) {
      if (!element) return [];
      // 将HTMLCollection转换为数组
      const childrenArray = Array.from(element.children);
      console.log(`找到${childrenArray.length}个子元素`);
      // 提取每个div的文本内容
      const values = childrenArray.map(child => child.textContent.trim());
      const result = values.map(item => {
          const date = item.slice(0, 10);
          const pe = item.slice(10,-1).trim();
          return { date, pe };
      });
      console.log(result);
      return result;
  }
  // 计算PE百分位数
  function calculatePEPercentiles(peData) {
      if (!peData || peData.length === 0) {
          throw new Error("PE数据不能为空！");
      }
      // 1. 排序数据（升序）
      const sortedPE = [...peData].sort((a, b) => a - b);
      const n = sortedPE.length;
      const result = {};
      // 2. 计算各分位点（0%~100%）
      for (let p = 0; p <= 100; p += 10) {
          // 连续型位置计算公式
          const position = ((n - 1) * (p / 100)) + 1;
          // 3. 线性插值
          if (position <= 1) {
              result[`p${p}`] = sortedPE[0]; // 最小值（0%分位）
          } else if (position >= n) {
              result[`p${p}`] = sortedPE[n - 1]; // 最大值（100%分位）
          } else {
              const lowerIdx = Math.floor(position) - 1; // 向下取整索引（JS数组从0开始）
              const upperIdx = lowerIdx + 1;
              const weight = position - Math.floor(position); // 小数部分权重
              const peLower = sortedPE[lowerIdx];
              const peUpper = sortedPE[upperIdx];
              result[`p${p}`] = peLower + weight * (peUpper - peLower); // 线性插值
          }
      }
      return result;
  }

  const validItems = document.getElementsByClassName('_pepTableBody_huefy_26');
  console.log('validItems', validItems);
  const table_data = validItems[0];
  console.log('table_data', table_data);

  // 1. 提取PE数据
  const pe_data = extractPEData(table_data);
  // 2. 得到PE历史数组
  const pe_his = pe_data.map(item => item.pe);
  // 3. 保存到插件本地
  if (index_code) {
    chrome.storage.local.get('all_pe_data', function(result) {
      let all_pe_data = result.all_pe_data || {};
      let old_pe_data = all_pe_data[index_code] || [];

      // 用日期去重，找出新增的数据
      const old_dates = new Set(old_pe_data.map(item => item.date));
      const new_items = pe_data.filter(item => !old_dates.has(item.date));

      if (new_items.length > 0) {
        // 合并历史和新增
        const merged = old_pe_data.concat(new_items);
        all_pe_data[index_code] = merged;
        chrome.storage.local.set({ 'all_pe_data': all_pe_data }, function() {
          console.log(`PE数据已增量保存到本地，code=${index_code}`);
          console.log('本次新增数据：', new_items);
        });
      } else {
        console.log(`没有新增PE数据，code=${index_code}`);
      }
    });
  }

}, 3000);
