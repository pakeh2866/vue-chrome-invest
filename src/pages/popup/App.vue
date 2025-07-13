<template>
  <button @click="fetchData">获取数据</button>
  <h2>整体温度数据</h2>
  <table>
    <thead>
      <tr>
        <th>温度类型</th>
        <th>今日温度</th>
        <th>历史百分位</th>
        <th>2015-6-12</th>
        <th>2019-1-2</th>
        <th>2021-2-19</th>
        <th>2022-4-26</th>
        <th>2022-10-31</th>
        <th>2024-2-5</th>
        <th>2024-9-13</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in temperatureData" :key="index">
        <td>{{ item.name }}</td>
        <td>{{ item.temperature }}</td>
        <td>{{ item.yield }}</td>
        <td v-for="date in ['2015-6-12', '2019-1-2', '2021-2-19', '2022-4-26', '2022-10-31', '2024-2-5', '2024-9-13']" :key="date" :class="{ 'highlight': item[`${date}_isNext`], 'deep-green': (date === '2019-1-2' && shouldHighlight2019) || (date === '2024-2-5' && shouldHighlight2024) }">
          {{ item[date] || 'N/A' }}
        </td>
      </tr>
    </tbody>
  </table>
    <h2>指数参考</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>指数名称</th>
          <th>代码</th>
          <th>观点</th>
          <th>支撑点位</th>
          <th>距离支撑</th>
          <th>近年最低</th>
          <th>已反弹高</th>
          <th>最大跌幅</th>
          <th>极度价值</th>
          <th>价值区间下沿</th>
          <th>价值区间上沿</th>
          <th>正常区间下沿</th>
          <th>正常区间上沿</th>
          <th>压力位</th>
          <th>现市盈率</th>
          <th>建议仓位</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 表格内容将在后续步骤添加 -->
      </tbody>
    </table>
</template>

<script>

// 定义你要打开的多个页面的 URL 列表
const targetUrls = [
    "https://youzhiyouxing.cn/data", // 替换为你的第一个目标网站 URL
    "https://stock.cheesefortune.com/",  // 替换为你的第二个目标网站 URL
    "https://youzhiyouxing.cn/data/market", // 如果有更多，可以在这里添加
    "https://trade.ehowbuy.com/vue-newpig/tool/thermometerDetail"
];

export default {
  data() {
    return {
      targetUrls,
      temperatureData: [
          {
            name: '有知有行数据',
            temperature: '',
            yield: '',
          },
          {
            name: '好买温度',
            temperature: '',
            yield: '暂无数据',
            '2015-6-12': '96.4',
            '2019-1-2': '3.1',
            '2021-2-19': '86.5',
            '2022-4-26': '6.6',
            '2022-10-31': '4.2',
            '2024-2-5': '9.9',
            '2024-9-13': '7.3'
          }
        ],
      shouldHighlight2019: false,
      shouldHighlight2024: false,
      todayTempValue: 0
    }
  },
  methods: {
    fetchData() {
      this.targetUrls.forEach(url => {
        window.open(url, '_blank');
      });
    }
  },
  mounted() {
    chrome.storage.local.get(['todayTemp', 'dateDegreeDB', 'haomai_today-temp'], (result) => {
      console.log('chrome.storage.local 的值为:', result);
      this.temperatureData[1].temperature = result['haomai_today-temp'] ? `${result['haomai_today-temp']}°` : 'N/A';
        if (result.todayTemp) {
          this.todayTempValue = parseFloat(result.todayTemp);
          this.temperatureData[0].temperature = `${result.todayTemp}°`;
        if (result.dateDegreeDB) {
          const todayTempValue = parseFloat(result.todayTemp);
          const degreeValues = result.dateDegreeDB.map(item => parseFloat(item.degree));
          const lowerCount = degreeValues.filter(degree => degree < todayTempValue).length;
          const percentile = ((lowerCount / degreeValues.length) * 100).toFixed(0);
          this.temperatureData[0].yield = `${percentile}%`;
        }
      }
      if (result.dateDegreeDB) {
        // 对 dateDegreeDB 按日期排序
        const sortedData = [...result.dateDegreeDB].sort((a, b) => {
          return new Date(a.date.replace(/\./g, '-')) - new Date(b.date.replace(/\./g, '-'));
        });
        const dates = ['2015-6-12', '2019-1-2', '2021-2-19', '2022-4-26', '2022-10-31', '2024-2-5', '2024-9-13'];
        dates.forEach((date) => {
          const targetDate = new Date(date);
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth();
            const targetDay = targetDate.getDate();
            const record = sortedData.find(item => {
              const match = item.date.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
              if (!match) return false;
              const year = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1; // 转换为0-11
              const day = parseInt(match[3], 10);
              return year === targetYear && month === targetMonth && day === targetDay;
            });
          if (record) {
            this.temperatureData[0][date] = `${record.degree}°`;
            this.temperatureData[0][`${date}_isNext`] = false;
          } else {
            const targetDate = new Date(date.replace(/\./g, '-'));
            const nextRecord = sortedData.find(item => {
              return new Date(item.date.replace(/\./g, '-')) > targetDate;
            });
            if (nextRecord) {
              this.temperatureData[0][date] = `${nextRecord.degree}°`;
              this.temperatureData[0][`${date}_isNext`] = true;
            }
          }
        });
        // 检查是否需要高亮2019-1-2的单元格
        const targetDate2019 = '2019-1-2';
        const targetTemp2019 = parseFloat(this.temperatureData[0][targetDate2019]) || 0;
        this.shouldHighlight2019 = this.todayTempValue <= targetTemp2019;

        // 检查是否需要高亮2024-2-5的单元格
        const targetDate2024 = '2024-2-5';
        const targetTemp2024 = parseFloat(this.temperatureData[0][targetDate2024]) || 0;
        this.shouldHighlight2024 = this.todayTempValue <= targetTemp2024;
      }
    });
  }
}
</script>

<style scoped>
.table-container {
  padding: 12px;
  font-family: Arial, sans-serif;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background-color: #42b983;
  color: white;
  font-weight: bold;
  font-size: 8px;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.data-table tr:hover {
  background-color: #f0f8ff;
}

.highlight {
  background-color: #fff3cd !important;
  font-weight: bold;
  border-left: 3px solid #ffc107;
}

.deep-green {
  background-color: #006400 !important;
  color: white !important;
}

.data-table td:first-child {
  font-weight: bold;
}
</style>

<style lang="scss">
button {
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid #ddd;
}
th, td {
  padding: 8px;
  text-align: left;
}
th {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
