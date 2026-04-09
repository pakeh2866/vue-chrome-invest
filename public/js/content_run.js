// content_run.js

const currentUrl = window.location.href;
console.log(currentUrl);
console.log("主内容脚本 content_run.js 已加载到页面:", window.location.href);



setTimeout(function() {
  const marketCardElements = document.getElementsByClassName('group block rounded-lg border border-primary/20 p-4 ring-1 ring-border/60 transition-all hover:scale-[1.02]');
  let market_pe = null;
  let market_percentile = null;
  
  for (const card of marketCardElements) {
      const text = card.textContent;
      const peMatch = text.match(/全市场市盈率[：:\s]*(\d+\.?\d*)/);
      const percentileMatch = text.match(/分位[：:\s]*(\d+\.?\d*%)/);
      
      if (peMatch && !market_pe) {
          market_pe = parseFloat(peMatch[1]);
      }
      if (percentileMatch && !market_percentile) {
          market_percentile = percentileMatch[1];
      }
      
      if (market_pe && market_percentile) break;
  }
  
  console.log('全市场市盈率:', market_pe);
  console.log('百分位:', market_percentile);
  
  if (market_pe !== null || market_percentile !== null) {
      chrome.storage.local.get('market_data', function(result) {
          const marketData = result.market_data || {};
          if (index_code) {
              marketData[index_code] = {
                  pe: market_pe,
                  percentile: market_percentile,
                  updateTime: new Date().toISOString()
              };
              chrome.storage.local.set({ 'market_data': marketData }, function() {
                  console.log('市场数据已保存:', marketData[index_code]);
              });
          }
      });
  }
}, 1000);
