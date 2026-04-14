// content_run.js

const currentUrl = window.location.href;
console.log(currentUrl);
console.log("content_run.js 已加载:", window.location.href);


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
          marketData['current'] = {
              pe: market_pe,
              percentile: market_percentile,
              updateTime: new Date().toISOString()
          };
          chrome.storage.local.set({ 'market_data': marketData }, function() {
              console.log('市场数据已保存:', marketData['current']);
          });
      });
  }

  // 获取指数列表数据
  const tableRows = document.querySelectorAll('tr[data-slot="table-row"]');
  const indexRunData = {};
  
  for (const row of tableRows) {
      try {
          const cells = row.querySelectorAll('td[data-slot="table-cell"]');
          if (cells.length < 6) continue;
          
          // 指数名称
          const nameLink = cells[0].querySelector('a');
          const indexName = nameLink ? nameLink.textContent.trim() : null;
          
          // 指数代码
          const indexCode = cells[1].textContent.trim();
          
          // 市盈率 (第8个td，索引7)
          let runPE = null;
          if (cells.length >= 8) {
              const peDiv = cells[7].querySelector('div.font-mono');
              if (peDiv) {
                  const peText = peDiv.textContent.trim();
                  const peMatch = peText.match(/(\d+\.?\d*)/);
                  if (peMatch) {
                      runPE = parseFloat(peMatch[1]);
                  }
              }
          }
          
          // 市盈分位 (第9个td，索引8)
          let runPercentile = null;
          if (cells.length >= 9) {
              const percentileText = cells[8].textContent.trim();
              const percentileMatch = percentileText.match(/(\d+\.?\d*%?)/);
              if (percentileMatch) {
                  runPercentile = percentileMatch[1];
              }
          }
          
          if (indexCode && indexCode.match(/^\d+$/)) {
              indexRunData[indexCode] = {
                  name: indexName,
                  code: indexCode,
                  runPE: runPE,
                  runPercentile: runPercentile,
                  updateTime: new Date().toISOString()
              };
              
              console.log('获取到指数数据:', indexRunData[indexCode]);
          }
      } catch (e) {
          console.error('解析行数据出错:', e);
      }
  }
  
  console.log('全部指数数据:', indexRunData);
  
  if (Object.keys(indexRunData).length > 0) {
      chrome.storage.local.set({ 'index_run_data': indexRunData }, function() {
          console.log('指数数据已保存到 index_run_data, 共', Object.keys(indexRunData).length, '条');
      });
  }
  
}, 2000);
