<template>
  <button @click="fetchData">获取数据</button>
  <h2>整体温度数据</h2>
  <table>
    <thead>
      <tr>
        <th>指数名称</th>
        <th>指数温度</th>
        <th>内在收益率</th>
        <th>股息率</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in temperatureData" :key="index">
        <td>{{ item.name }}</td>
        <td>{{ item.temperature }}</td>
        <td>{{ item.yield }}</td>
        <td>{{ item.dividendRate }}</td>
      </tr>
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
        { name: '示例指数1', temperature: '0°', yield: '0%', dividendRate: '0%' },
        { name: '示例指数2', temperature: '0°', yield: '0%', dividendRate: '0%' }
      ]
    }
  },
  methods: {
    fetchData() {
      this.targetUrls.forEach(url => {
        window.open(url, '_blank');
      });
    }
  }
}
</script>

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
