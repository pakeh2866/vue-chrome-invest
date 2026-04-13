import { Message } from "../utils/Message";
import { HttpServer } from "./HttpServer";

const httpServer = new HttpServer();//开启http服务，content_script才能进行http请求
httpServer.start()
//message测试
const message = new Message();
message.listening('hellow', (data) => {
    console.log('contentjs传来的数据1：', data);
})
message.listening('hellow', (data)=>{
    console.log('contentjs传来的数据2：', data);
})
message.listeningResponse('sum', (data) => {
    //需要返回响应数据
    console.log('sum1');
    return data.data.reduce((pre, cur) => pre + cur, 0)
})
//i18n测试
console.log('hellow background！！！', chrome.i18n.getMessage('extDescription'));

// 每日首次打开时自动打开options页面
console.log('=== 每日自动打开options检查开始 ===');
const today = new Date().toDateString();
const nowTime = new Date().toLocaleString();

console.log('当前时间:', nowTime);
console.log('今日日期标识:', today);
console.log('扩展ID:', chrome.runtime.id);

chrome.storage.local.get('lastVisitDate', function(data) {
    const lastVisitDate = data.lastVisitDate;
    console.log('存储中上次访问日期:', lastVisitDate);
    
    if (chrome.runtime.lastError) {
        console.error('读取存储错误:', chrome.runtime.lastError);
        return;
    }
    
    if (!lastVisitDate || lastVisitDate !== today) {
        console.log('判定: 新的一天，需要打开options页面');
        
        const optionsUrl = chrome.runtime.getURL('html/options.html');
        console.log('options页面完整路径:', optionsUrl);
        
        chrome.tabs.create({
            url: optionsUrl,
            active: true
        }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('创建标签页失败:', chrome.runtime.lastError);
            } else {
                console.log('✅ 创建标签页成功! tab id:', tab.id, 'url:', tab.url);
            }
        });
        
        chrome.storage.local.set({ lastVisitDate: today }, function() {
            if (chrome.runtime.lastError) {
                console.error('保存日期失败:', chrome.runtime.lastError);
            } else {
                console.log('✅ 已成功保存今日日期到存储');
            }
        });
    } else {
        console.log('ℹ️ 今日已经打开过options页面，跳过');
    }
    
    console.log('=== 每日检查结束 ===');
});


