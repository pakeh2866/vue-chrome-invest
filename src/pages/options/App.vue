<template>
    <h1>vue-chrome-extension-template</h1>
    <h2>options view</h2>
</template>
<script>
</script>
<style lang="scss">
</style>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="libs/tailwind.min.js"></script>
    <link href="libs/font-awesome.min.css" rel="stylesheet">
    <script src="libs/vue.global.js"></script>
    <script src="libs/chart.js"></script>
    <title>投资提醒</title>
    <style>
        /* 自定义样式 */
        .highlight {
            background-color: #ffcccc;
        }
    </style>
</head>

<body class="bg-gray-100 font-sans">
    <div id="app" class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-4 text-center">股票持仓比例提醒</h1>
        <div class="mt-6 bg-white p-6 rounded shadow-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">持仓列表</h2>
                <div class="space-x-2">
                    <button @click="updateStockPrices" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        更新行情
                    </button>
                    <button @click="exportData" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        导出数据
                    </button>
                    <button @click="importData" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        导入数据
                    </button>
                    <button @click="exportToGist" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        导出到云端
                    </button>
                    <button @click="importFromGist" class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        云端导入
                    </button>
                </div>
            </div>
            <table class="w-full table-auto">
                <thead>
                    <tr>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('category')">
                            分类
                            <span v-if="sortKey === 'category'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('code')">
                            股票代码
                            <span v-if="sortKey === 'code'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('name')">
                            股票名称
                            <span v-if="sortKey === 'name'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('quantity')">
                            持仓数量
                            <span v-if="sortKey === 'quantity'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('price')">
                            持仓价格
                            <span v-if="sortKey === 'price'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('currentPrice')">
                            现价
                            <span v-if="sortKey === 'currentPrice'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('value')">
                            持仓价值
                            <span v-if="sortKey === 'value'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('percentage')">
                            持仓比例
                            <span v-if="sortKey === 'percentage'">
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else-if="sortOrder === 'desc'">▼</span>
                                <span v-else>◇</span>
                            </span>
                            <span v-else>◇</span>
                        </th>
                        <th class="px-4 py-2">建议仓位</th>
                        <th class="px-4 py-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(stock, index) in getSortedStocks()" :key="index" :class="{ highlight: stock.percentage > 0.15 }">
                        <td class="border px-4 py-2">{{ stock.category.split('-')[0] }}<span class="text-sm text-gray-500 ml-1">{{ stock.category.split('-')[1] || '' }}</span></td>
                        <td class="border px-4 py-2">{{ stock.code }}</td>
                        <td class="border px-4 py-2">{{ stock.name }}</td>
                        <td class="border px-4 py-2">{{ stock.quantity }}</td>
                        <td class="border px-4 py-2">{{ stock.price }}</td>
                        <td class="border px-4 py-2">{{ stock.currentPrice }}</td>
                        <td class="border px-4 py-2">{{ stock.value.toFixed(2) }} </td>
                        <td class="border px-4 py-2">{{ (stock.percentage * 100).toFixed(2) }}%</td>
                        <td
                          class="border px-4 py-2"
                          :class="{ 'bg-yellow-200': shouldHighlightStockSuggestedPosition(stock) }"
                        >
                          {{ getSuggestedPosition(stock) }}
                        </td>
                        <td class="border px-4 py-2">
                            <button @click="editStock(stock)" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">修改</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="bg-white p-6 rounded shadow-md">
            <form @submit.prevent="addOrUpdateStock">
                <div class="grid grid-cols-3 gap-4">
                    <div class="mb-4">
                        <label for="stockCategory" class="block text-gray-700 font-bold mb-2">分类</label>
                        <select v-model="newStock.category" id="stockCategory" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <optgroup label="A股">
                                <option value="A股-ETF">ETF</option>
                                <option value="A股-个股">个股</option>
                            </optgroup>
                            <optgroup label="港股">
                                <option value="港股-ETF">ETF</option>
                                <option value="港股-个股">个股</option>
                            </optgroup>
                            <optgroup label="其他海外">
                                <option value="其他海外-ETF">ETF</option>
                                <option value="其他海外-个股">个股</option>
                            </optgroup>
                            <option value="国内债">国内债</option>
                            <option value="黄金">黄金</option>
                            <option value="石油">石油</option>
                            <option value="现金">现金</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="stockCode" class="block text-gray-700 font-bold mb-2">股票代码</label>
                        <input type="text" v-model="newStock.code" id="stockCode" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入股票代码">
                    </div>
                    <div class="mb-4">
                        <label for="stockName" class="block text-gray-700 font-bold mb-2">股票名称</label>
                        <input type="text" v-model="newStock.name" id="stockName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入股票名称">
                    </div>
                    <div class="mb-4">
                        <label for="quantity" class="block text-gray-700 font-bold mb-2">持仓数量</label>
                        <input type="number" v-model="newStock.quantity" id="quantity" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入持仓数量">
                    </div>
                    <div class="mb-4">
                        <label for="price" class="block text-gray-700 font-bold mb-2">持仓价格</label>
                        <input type="number" v-model="newStock.price" id="price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入持仓价格" min="0" max="10000" step="0.001">
                    </div>
                    <div class="mb-4">
                        <label for="peRatio" class="block text-gray-700 font-bold mb-2">当前PE</label>
                        <input type="number" v-model="newStock.peRatio" id="peRatio" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入当前PE" min="0" max="100" step="0.01">
                    </div>
                    <div class="mb-4">
                        <label for="pePercentiles" class="block text-gray-700 font-bold mb-2">PE分位数</label>
                        <input type="text" v-model="newStock.pePercentiles" id="pePercentiles" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="输入PE分位数">
                    </div>
                    <div class="mb-4 flex items-end">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                            {{ editingIndex!== -1? '保存修改' : '添加股票' }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div class="mb-6 bg-white p-6 rounded shadow-md flex flex-col items-center">
            <h2 class="text-xl font-bold mb-2">分类持仓比例</h2>
            <div style="max-width: 400px; width: 100%;">
                <canvas id="categoryChart" style="width:100%;height:100%;" width="300" height="300"></canvas>
            </div>
        </div>
        <div class="w-full overflow-x-auto mt-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold">指数参考</h3>
                <button @click="addNewIndex" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                    添加指数
                </button>
            </div>
            <table class="min-w-full table-auto border-collapse">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border px-4 py-2 text-sm">指数名称</th>
                        <th class="border px-4 py-2 text-sm">代码</th>
                        <th class="border px-4 py-2 text-sm">现点位</th>
                        <th class="border px-4 py-2 text-sm">支撑点位</th>
                        <th class="border px-4 py-2 text-sm">距离支撑</th>
                        <th class="border px-4 py-2 text-sm">近两年最低</th>
                        <th class="border px-4 py-2 text-sm">已反弹</th>
                        <th class="border px-4 py-2 text-sm">前高</th>
                        <th class="border px-4 py-2 text-sm">最大跌幅</th>
                        <th class="border px-4 py-2 text-sm">极度价值</th>
                        <th class="border px-4 py-2 text-sm">价值区间下沿</th>
                        <th class="border px-4 py-2 text-sm">价值区间上沿</th>
                        <th class="border px-4 py-2 text-sm">正常区间下沿</th>
                        <th class="border px-4 py-2 text-sm">正常区间上沿</th>
                        <th class="border px-4 py-2 text-sm">压力位</th>
                        <th class="border px-4 py-2 text-sm">现市盈率</th>
                        <th class="border px-4 py-2 text-sm">建议仓位</th>
                        <th class="border px-4 py-2 text-sm">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(index, idx) in indexData" :key="index.code">
                        <td class="border px-4 py-2 text-sm">{{ index.name }}</td>
                        <td class="border px-4 py-2 text-sm">{{ index.code }}</td>
                        <td class="border px-4 py-2 text-sm">{{ index.currentLevel }}</td>
                        <td class="border px-4 py-2 text-sm">{{ index.supportLevel }}</td>
                        <td class="border px-4 py-2 text-sm">
                            {{ typeof index.distanceToSupport === 'number' ? index.distanceToSupport.toFixed(2) : '' }}%
                        </td>
                        <td class="border px-4 py-2 text-sm">{{ index.twoYearLow }}</td>
                        <td class="border px-4 py-2 text-sm">
                            {{ typeof index.bounceRate === 'number' ? index.bounceRate.toFixed(2) : '' }}%
                        </td>
                        <td class="border px-4 py-2 text-sm">{{ index.previousHigh }}</td>
                        <td class="border px-4 py-2 text-sm">
                            {{ typeof index.maxDropRate === 'number' ? index.maxDropRate.toFixed(2) : '' }}%
                        </td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-green-200': index.currentLevel <= parseFloat(index.extremeValue) }">{{ index.extremeValue }}</td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-green-100': index.currentLevel > parseFloat(index.valueRangeLower) }">{{ index.valueRangeLower }}</td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-green-100': index.currentLevel > parseFloat(index.valueRangeUpper) }">{{ index.valueRangeUpper }}</td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-green-100': index.currentLevel > parseFloat(index.normalRangeLower) }">{{ index.normalRangeLower }}</td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-green-100': index.currentLevel > parseFloat(index.normalRangeUpper) }">{{ index.normalRangeUpper }}</td>
                        <td class="border px-4 py-2 text-sm" :class="{ 'bg-red-200': index.currentLevel > parseFloat(index.resistanceLevel) }">{{ index.resistanceLevel }}</td>
                        <td class="border px-4 py-2 text-sm">{{ index.peRatio || '-' }}</td>
                        <td class="border px-4 py-2 text-sm">
                            {{ index.suggestedPosition || '-' }}
                            <button @click="editSuggestedPosition(idx)" class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm">修改</button>
                        </td>
                        <td class="border px-4 py-2 text-sm">
                            <button @click="editIndex(idx)" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-1">修改</button>
                            <button @click="deleteIndex(idx)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="showIndexEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <h3 class="text-lg font-bold mb-4">{{ isNewIndex ? '添加指数' : '修改指数数据' }}</h3>
                <form @submit.prevent="saveIndexEdit" class="space-y-4">
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">指数名称</label>
                            <input type="text" v-model="editingIndex.name" class="w-full border rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">代码</label>
                            <input type="text" v-model="editingIndex.code" class="w-full border rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">现点位</label>
                            <input type="number" v-model.number="editingIndex.currentLevel" class="w-full border rounded px-3 py-2" required step="0.01">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">支撑点位</label>
                            <input type="number" v-model.number="editingIndex.supportLevel" class="w-full border rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">近两年最低</label>
                            <input type="number" v-model.number="editingIndex.twoYearLow" class="w-full border rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">前高</label>
                            <input type="number" v-model.number="editingIndex.previousHigh" class="w-full border rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">极度价值</label>
                            <input type="text" v-model="editingIndex.extremeValue" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">价值区间下沿</label>
                            <input type="text" v-model="editingIndex.valueRangeLower" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">价值区间上沿</label>
                            <input type="text" v-model="editingIndex.valueRangeUpper" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">正常区间下沿</label>
                            <input type="text" v-model="editingIndex.normalRangeLower" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">正常区间上沿</label>
                            <input type="text" v-model="editingIndex.normalRangeUpper" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">压力位</label>
                            <input type="number" v-model.number="editingIndex.resistanceLevel" class="w-full border rounded px-3 py-2">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" @click="closeIndexEdit" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">取消</button>
                        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">保存</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <script>
        const { createApp } = Vue;

        createApp({
            data() {
                return {
                    newStock: {
                        code: '',
                        name: '',
                        quantity: 0,
                        price: 0,
                        currentPrice: 0,
                        category: 'A股',
                        peRatio: 0,
                        pePercentiles: ''
                    },
                    stocks: JSON.parse(localStorage.getItem('stocks')) || [],
                    editingIndex: -1,
                    sortKey: '',
                    sortOrder: '',
                    categoryChart: null,
                    indexData: [],
                    showIndexEditModal: false,
                    editingIndexIdx: -1,
                    isNewIndex: false
                };
            },
            methods: {
                saveToLocalStorage() {
                    localStorage.setItem('stocks', JSON.stringify(this.stocks));
                },
                addOrUpdateStock() {
                    const { code, name, quantity, price, category, peRatio, pePercentiles } = this.newStock;
                    let currentPrice = this.newStock.currentPrice;
                    if (name === '现金') {
                        currentPrice = 1;
                    }
                    if (code && name && quantity > 0 && price >= 0.000 && price <= 10000.000) {
                        const value = quantity * currentPrice;
                        if (this.editingIndex !== -1) {
                            this.stocks[this.editingIndex] = {
                                code,
                                name,
                                quantity,
                                price,
                                currentPrice,
                                value,
                                category,
                                peRatio,
                                pePercentiles
                            };
                            this.editingIndex = -1;
                        } else {
                            this.stocks.push({
                                code,
                                name,
                                quantity,
                                price,
                                currentPrice,
                                value,
                                category,
                                peRatio,
                                pePercentiles
                            });
                        }
                        this.calculatePercentages();
                        this.saveToLocalStorage();
                        this.renderCategoryChart();
                        this.newStock = {
                            code: '',
                            name: '',
                            quantity: 0,
                            price: 0,
                            currentPrice: 0,
                            category: 'A股',
                            peRatio: 0,
                            pePercentiles: ''
                        };
                    }
                },
                calculatePercentages() {
                    const totalValue = this.stocks.reduce((sum, stock) => sum + stock.value, 0);
                    this.stocks.forEach(stock => {
                        stock.percentage = stock.value / totalValue;
                    });
                },
                editStock(stock) {
                    this.editingIndex = this.stocks.indexOf(stock);
                    this.newStock = {
                        code: stock.code,
                        name: stock.name,
                        quantity: stock.quantity,
                        price: stock.price,
                        currentPrice: stock.currentPrice,
                        category: stock.category || 'A股',
                        peRatio: stock.peRatio || 0,
                        pePercentiles: stock.pePercentiles || ''
                    };
                },
                buyStock(index) {
                    const stock = this.stocks[index];
                    const quantity = parseInt(prompt(`请输入要买入的${stock.name}数量：`));
                    if (quantity && quantity > 0) {
                        stock.quantity += quantity;
                        stock.value = stock.quantity * stock.price;
                        this.calculatePercentages();
                        this.saveToLocalStorage();
                    }
                },
                sellStock(index) {
                    const stock = this.stocks[index];
                    const quantity = parseInt(prompt(`请输入要卖出的${stock.name}数量：`));
                    if (quantity && quantity > 0 && quantity <= stock.quantity) {
                        stock.quantity -= quantity;
                        stock.value = stock.quantity * stock.price;
                        this.calculatePercentages();
                        this.saveToLocalStorage();
                    } else if (quantity >= stock.quantity) {
                        alert('卖出数量不能大于持仓数量！');
                    }
                },
                // 导出数据
                exportData() {
                    const data = {
                        stocks: this.stocks,
                        indexData: this.indexData
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `portfolio_and_index_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                },
                importData() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                try {
                                    const importedData = JSON.parse(event.target.result);
                                    // 兼容老格式（只有 stocks 数组）
                                    if (Array.isArray(importedData)) {
                                        this.stocks = importedData;
                                        this.calculatePercentages();
                                        this.saveToLocalStorage();
                                        this.renderCategoryChart();
                                        alert('持仓数据导入成功！');
                                    } else if (importedData.stocks && importedData.indexData) {
                                        this.stocks = importedData.stocks;
                                        this.indexData = importedData.indexData;
                                        this.calculatePercentages();
                                        this.saveToLocalStorage();
                                        localStorage.setItem('indexData', JSON.stringify(this.indexData));
                                        this.renderCategoryChart();
                                        alert('持仓和指数数据导入成功！');
                                    } else {
                                        alert('导入的数据格式不正确！');
                                    }
                                } catch (error) {
                                    alert('导入失败：文件格式错误！');
                                }
                            };
                            reader.readAsText(file);
                        }
                    };
                    input.click();
                },

                //  更新行情函数
                async updateStockPrices() {
                    try {
                        // 1. 获取所有股票和指数的代码
                        const stockCodes = this.stocks.map(stock => stock.code.trim());
                        const indexCodes = this.indexData.map(idx => idx.code.trim());
                        // 合并去重
                        const allCodes = Array.from(new Set([...stockCodes, ...indexCodes])).filter(Boolean);
                        console.log('allCodes:', allCodes);
                        if (allCodes.length === 0) {
                            console.log('没有有效的股票或指数代码可供查询。');
                            return;
                        }

                        // 2. 请求行情
                        const querySymbols = allCodes.join(',');
                        const response = await fetch(`https://qt.gtimg.cn/q=${querySymbols}`);
                        const text = await response.text();

                        // 3. 解析返回数据
                        const individualStockData = text.trim().split(';').filter(s => s.length > 0);
                        console.log('individualStockData:', individualStockData);
                        individualStockData.forEach(stockStr => {
                            // 直接使用 stockStr，不需要正则匹配
                            const fields = stockStr.split('~');
                            console.log('fields:', fields);
                            if (fields.length > 3) {
                                const currentPriceStr = fields[3];
                                const currentPrice = parseFloat(currentPriceStr);
                                const code = fields[2]; // 股票代码在第三个字段

                                // 4. 更新持仓股票
                                const stock = this.stocks.find(s => s.code.includes(code));
                                if (stock && !isNaN(currentPrice)) {
                                    stock.currentPrice = currentPrice;
                                    stock.value = stock.quantity * currentPrice;
                                }

                                // 5. 更新指数点位
                                const idx = this.indexData.find(i => i.code.includes(code));
                                if (idx && !isNaN(currentPrice)) {
                                    idx.currentLevel = currentPrice;
                                    // 获取市盈率
                                    console.log('处理指数:', idx.code, '字段数据:', fields);
                                    // 使用腾讯接口获取市盈率
                                    const peField = fields[39]; // 腾讯接口的市盈率字段
                                    console.log('peField:', peField);
                                    if (peField && peField !== '-') {
                                        idx.peRatio = parseFloat(peField);
                                        console.log('设置市盈率:', idx.peRatio);
                                    } else {
                                        idx.peRatio = null;
                                        console.log('市盈率数据无效');
                                    }
                                }
                            }
                        });

                        this.calculatePercentages();
                        this.saveToLocalStorage();
                        // 保存指数数据到本地
                        this.indexData.forEach(idx => {
                            if (
                                typeof idx.currentLevel === 'number' &&
                                typeof idx.supportLevel === 'number' &&
                                idx.supportLevel !== 0
                            ) {
                                idx.distanceToSupport = (idx.currentLevel - idx.supportLevel) / idx.supportLevel * 100;
                            }
                            if (
                                typeof idx.currentLevel === 'number' &&
                                typeof idx.twoYearLow === 'number' &&
                                idx.twoYearLow !== 0
                            ) {
                                idx.bounceRate = (idx.currentLevel - idx.twoYearLow) / idx.twoYearLow * 100;
                            }
                            if (
                                typeof idx.currentLevel === 'number' &&
                                typeof idx.previousHigh === 'number' &&
                                idx.previousHigh !== 0
                            ) {
                                idx.maxDropRate = (idx.currentLevel - idx.previousHigh) / idx.previousHigh * 100;
                            }
                        });
                        localStorage.setItem('indexData', JSON.stringify(this.indexData));
                        this.renderCategoryChart();
                        alert('股票和指数数据更新完成！');

                        // 保证现金现价为1
                        this.stocks.forEach(stock => {
                            if (stock.name === '现金') {
                                stock.currentPrice = 1;
                                stock.value = stock.quantity * 1;
                            }
                        });
                        this.calculatePercentages();
                        this.saveToLocalStorage();
                    } catch (error) {
                        console.error('获取股票数据失败:', error);
                        alert('获取股票数据失败，请稍后重试！\n可能原因：\n1. 网络连接问题\n2. 股票代码格式不正确\n3. 服务器暂时不可用');
                    }
                },

                // 自动更新数据
                startAutoUpdate() {
                    // 每4小时更新一次数据
                    setInterval(() => {
                        this.updateStockPrices();
                    }, 14400000); // 4小时 = 4 * 60 * 60 * 1000毫秒
                },

                //  排序函数
                sortBy(key) {
                    if (this.sortKey === key) {
                        if (this.sortOrder === '') {
                            this.sortOrder = 'asc';
                        } else if (this.sortOrder === 'asc') {
                            this.sortOrder = 'desc';
                        } else {
                            this.sortOrder = '';
                        }
                    } else {
                        this.sortKey = key;
                        this.sortOrder = 'asc';
                    }
                },
                getSortedStocks() {
                    if (!this.sortKey || this.sortOrder === '') {
                        return this.stocks;
                    }
                    return [...this.stocks].sort((a, b) => {
                        if (a[this.sortKey] === undefined || b[this.sortKey] === undefined) return 0;
                        if (typeof a[this.sortKey] === 'string') {
                            if (this.sortOrder === 'asc') {
                                return a[this.sortKey].localeCompare(b[this.sortKey]);
                            } else {
                                return b[this.sortKey].localeCompare(a[this.sortKey]);
                            }
                        } else {
                            if (this.sortOrder === 'asc') {
                                return a[this.sortKey] - b[this.sortKey];
                            } else {
                                return b[this.sortKey] - a[this.sortKey];
                            }
                        }
                    });
                },

                // 渲染分类图表
                renderCategoryChart() {
                    const categoryMap = {};
                    const totalValue = this.stocks.reduce((sum, stock) => sum + stock.value, 0);

                    // 计算每个主分类的市值和比例
                    this.stocks.forEach(stock => {
                        const mainCategory = stock.category.split('-')[0];
                        if (!categoryMap[mainCategory]) {
                            categoryMap[mainCategory] = 0;
                        }
                        categoryMap[mainCategory] += stock.value;
                    });

                    const categories = Object.keys(categoryMap);
                    const values = Object.values(categoryMap);
                    const colors = [
                        '#4F46E5', '#22D3EE', '#F59E42', '#F43F5E', '#10B981', '#FBBF24', '#6366F1'
                    ];

                    if (this.categoryChart) {
                        this.categoryChart.destroy();
                    }

                    const ctx = document.getElementById('categoryChart').getContext('2d');
                    this.categoryChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: categories,
                            datasets: [{
                                data: values,
                                backgroundColor: colors,
                            }]
                        },
                        options: {
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const percentage = (context.raw / totalValue * 100).toFixed(2);
                                            return `${context.label}: ${percentage}%`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                },
                addNewIndex() {
                    this.editingIndex = {
                        name: '',
                        code: '',
                        currentLevel: 0,
                        supportLevel: 0,
                        distanceToSupport: 0,
                        twoYearLow: 0,
                        bounceRate: 0,
                        previousHigh: 0,
                        maxDropRate: 0,
                        extremeValue: '',
                        valueRangeLower: '',
                        valueRangeUpper: '',
                        normalRangeLower: '',
                        normalRangeUpper: '',
                        resistanceLevel: 0
                    };
                    this.isNewIndex = true;
                    this.showIndexEditModal = true;
                },
                editIndex(idx) {
                    this.editingIndex = { ...this.indexData[idx] };
                    this.editingIndexIdx = idx;
                    this.isNewIndex = false;
                    this.showIndexEditModal = true;
                },
                closeIndexEdit() {
                    this.showIndexEditModal = false;
                    this.editingIndex = null;
                    this.editingIndexIdx = -1;
                },
                saveIndexEdit() {
                    // 基础校验
                    if (!this.editingIndex.name || !this.editingIndex.code) {
                        alert('指数名称和代码不能为空！');
                        return;
                    }
                    // 自动计算，存为数字
                    const idx = this.editingIndex;
                    idx.distanceToSupport = (idx.currentLevel - idx.supportLevel) / idx.supportLevel * 100;
                    idx.bounceRate = (idx.currentLevel - idx.twoYearLow) / idx.twoYearLow * 100;
                    idx.maxDropRate = (idx.currentLevel - idx.previousHigh) / idx.previousHigh * 100;

                    if (this.isNewIndex) {
                        this.indexData.push({ ...idx });
                    } else {
                        this.indexData[this.editingIndexIdx] = { ...idx };
                    }
                    localStorage.setItem('indexData', JSON.stringify(this.indexData));
                    this.closeIndexEdit();
                },
                deleteIndex(idx) {
                    if (confirm('确定要删除这个指数吗？')) {
                        this.indexData.splice(idx, 1);
                        localStorage.setItem('indexData', JSON.stringify(this.indexData));
                    }
                },
                exportToGist() {
                    let token = localStorage.getItem('githubToken') || '';
                    token = prompt('请输入你的 GitHub Token（只需 gist 权限）', token);
                    if (!token) return alert('未输入 Token，无法导出！');

                    // 将 Token 保存到 localStorage
                    localStorage.setItem('githubToken', token);

                    const data = {
                        stocks: this.stocks,
                        indexData: this.indexData
                    };
                    fetch('https://api.github.com/gists', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'token ' + token,
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify({
                            description: "股票持仓比例提醒数据",
                            public: false,
                            files: {
                                "portfolio.json": {
                                    content: JSON.stringify(data, null, 2)
                                }
                            }
                        })
                    })
                    .then(res => res.json())
                    .then(res => {
                        if (res.html_url) {
                            // 保存 gist URL 到 localStorage
                            localStorage.setItem('gistUrl', res.html_url);
                            alert('导出成功！Gist 地址：' + res.html_url + '\n请妥善保存此链接，后续可用于云端导入。');
                        } else {
                            alert('导出失败：' + (res.message || '未知错误'));
                        }
                    })
                    .catch(err => alert('导出失败：' + err));
                },
                importFromGist() {
                    const savedGistUrl = localStorage.getItem('gistUrl') || '';
                    const gistUrl = prompt('请输入 Gist 的 URL 或 ID', savedGistUrl);
                    if (!gistUrl) return;
                    // 支持直接输入 Gist ID 或完整 URL
                    let gistId = gistUrl.trim();
                    if (gistId.includes('/')) {
                        gistId = gistId.split('/').pop();
                    }
                    fetch('https://api.github.com/gists/' + gistId)
                        .then(res => res.json())
                        .then(res => {
                            if (res.files && res.files['portfolio.json']) {
                                const content = res.files['portfolio.json'].content;
                                const importedData = JSON.parse(content);
                                if (importedData.stocks && importedData.indexData) {
                                    this.stocks = importedData.stocks;
                                    this.indexData = importedData.indexData;
                                    this.calculatePercentages();
                                    this.saveToLocalStorage();
                                    localStorage.setItem('indexData', JSON.stringify(this.indexData));
                                    this.renderCategoryChart();
                                    alert('云端数据导入成功！');
                                } else {
                                    alert('Gist 文件内容格式不正确！');
                                }
                            } else {
                                alert('未找到 portfolio.json 文件！');
                            }
                        })
                        .catch(err => alert('导入失败：' + err));
                },

                
                editSuggestedPosition(idx) {
                    const index = this.indexData[idx];
                    const currentPE = parseFloat(index.peRatio);
                    if (!currentPE) {
                        alert('当前PE数据不可用，请先更新行情数据！');
                        return;
                    }

                    // 创建模态对话框
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    modal.innerHTML = `
                        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
                            <h3 class="text-lg font-bold mb-4">设置估值区间</h3>
                            <div class="space-y-4">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-1">PE分位数数据（用逗号分隔，从PE0到PE100）</label>
                                    <input type="text" id="pePercentiles" class="w-full border rounded px-3 py-2" 
                                        placeholder="例如：10,12,14,16,18,20,22,24,26,28,30" 
                                        value="${index.pePercentiles || ''}">
                                    <p class="text-sm text-gray-500 mt-1">请输入11个PE值，分别对应0%,10%,20%...100%分位数</p>
                                </div>
                                <div class="mt-4">
                                    <p class="text-sm text-gray-600">当前PE: ${currentPE.toFixed(2)}</p>
                                    <p class="text-sm text-gray-600">建议仓位: ${this.calculatePositionFromPercentiles(currentPE, index.pePercentiles)}%</p>
                                </div>
                                <div class="mt-4">
                                    <table class="min-w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr class="bg-gray-100">
                                                <th class="border px-4 py-2 text-sm">历史PE分位数</th>
                                                <th class="border px-4 py-2 text-sm">PE值</th>
                                                <th class="border px-4 py-2 text-sm">估值状态</th>
                                                <th class="border px-4 py-2 text-sm">建议仓位</th>
                                                <th class="border px-4 py-2 text-sm">操作信号</th>
                                            </tr>
                                        </thead>
                                        <tbody id="percentileTableBody">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="flex justify-end space-x-4 mt-6">
                                <button id="cancelBtn" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">取消</button>
                                <button id="saveBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">保存</button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(modal);

                    // 添加事件监听
                    const pePercentilesInput = modal.querySelector('#pePercentiles');
                    const cancelBtn = modal.querySelector('#cancelBtn');
                    const saveBtn = modal.querySelector('#saveBtn');
                    const tableBody = modal.querySelector('#percentileTableBody');

                    // 更新表格数据
                    const updateTable = () => {
                        const peValues = pePercentilesInput.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                        if (peValues.length !== 11) {
                            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">请输入11个有效的PE值</td></tr>';
                            return;
                        }

                        const percentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                        const positions = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
                        const statuses = ['极度低估', '极度低估', '低估', '低估', '偏低', '合理估值', '偏高', '高估', '严重高估', '严重高估', '极度高估'];
                        const signals = ['强烈买入', '买入', '买入', '买入', '观望', '观望', '减仓', '减仓', '卖出', '卖出', '清仓'];
                        const bgColors = ['bg-green-100', 'bg-green-100', 'bg-green-100', 'bg-green-100', 'bg-yellow-100', 'bg-yellow-100', 'bg-orange-100', 'bg-orange-100', 'bg-red-100', 'bg-red-100', 'bg-red-100'];
                        const textColors = ['text-green-600', 'text-green-600', 'text-green-600', 'text-green-600', 'text-yellow-600', 'text-yellow-600', 'text-orange-600', 'text-orange-600', 'text-red-600', 'text-red-600', 'text-red-600'];

                        let tableHTML = '';
                        for (let i = 0; i < percentiles.length; i++) {
                            tableHTML += `
                                <tr>
                                    <td class="border px-4 py-2 text-sm">${percentiles[i]}%</td>
                                    <td class="border px-4 py-2 text-sm">${peValues[i].toFixed(2)}</td>
                                    <td class="border px-4 py-2 text-sm ${bgColors[i]}">${statuses[i]}</td>
                                    <td class="border px-4 py-2 text-sm">${positions[i]}%</td>
                                    <td class="border px-4 py-2 text-sm ${textColors[i]}">${signals[i]}</td>
                                </tr>
                            `;
                        }

                        // 添加当前PE行
                        const currentPosition = this.calculatePositionFromPercentiles(currentPE, peValues);
                        let currentStatus = '';
                        let currentBgColor = '';
                        let currentSignal = '';
                        let currentTextColor = '';

                        if (currentPE <= peValues[0]) {
                            currentStatus = '极度低估';
                            currentBgColor = 'bg-green-100';
                            currentSignal = '强烈买入';
                            currentTextColor = 'text-green-600';
                        } else if (currentPE >= peValues[peValues.length - 1]) {
                            currentStatus = '极度高估';
                            currentBgColor = 'bg-red-100';
                            currentSignal = '清仓';
                            currentTextColor = 'text-red-600';
                        } else {
                            for (let i = 0; i < peValues.length - 1; i++) {
                                if (currentPE >= peValues[i] && currentPE < peValues[i + 1]) {
                                    currentStatus = statuses[i];
                                    currentBgColor = bgColors[i];
                                    currentSignal = signals[i];
                                    currentTextColor = textColors[i];
                                    break;
                                }
                            }
                        }

                        tableHTML += `
                            <tr class="bg-blue-50">
                                <td class="border px-4 py-2 text-sm font-bold">当前</td>
                                <td class="border px-4 py-2 text-sm font-bold">${currentPE.toFixed(2)}</td>
                                <td class="border px-4 py-2 text-sm font-bold ${currentBgColor}">${currentStatus}</td>
                                <td class="border px-4 py-2 text-sm font-bold">${currentPosition}%</td>
                                <td class="border px-4 py-2 text-sm font-bold ${currentTextColor}">${currentSignal}</td>
                            </tr>
                        `;

                        tableBody.innerHTML = tableHTML;
                    };

                    // 监听输入变化
                    pePercentilesInput.addEventListener('input', updateTable);

                    // 保存按钮事件
                    saveBtn.addEventListener('click', () => {
                        const peValues = pePercentilesInput.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                        
                        if (peValues.length !== 11) {
                            alert('请输入11个有效的PE值！');
                            return;
                        }

                        // 验证PE值是否递增
                        for (let i = 1; i < peValues.length; i++) {
                            if (peValues[i] <= peValues[i-1]) {
                                alert('PE值必须递增！');
                                return;
                            }
                        }

                        index.pePercentiles = peValues;
                        index.suggestedPosition = this.calculatePositionFromPercentiles(currentPE, peValues).toFixed(2) + '%';
                        localStorage.setItem('indexData', JSON.stringify(this.indexData));
                        document.body.removeChild(modal);
                    });

                    // 取消按钮事件
                    cancelBtn.addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });

                    // 初始化显示
                    updateTable();
                },

                // 根据PE分位数计算建议仓位
                calculatePositionFromPercentiles(currentPE, pePercentiles) {
                    if (!currentPE || !pePercentiles || pePercentiles.length !== 11) return 0;
                    
                    // 如果当前PE小于等于最低PE，返回100%仓位
                    if (currentPE <= pePercentiles[0]) return 100;
                    
                    // 如果当前PE大于等于最高PE，返回0%仓位
                    if (currentPE >= pePercentiles[pePercentiles.length - 1]) return 0;
                    
                    // 找到当前PE所在区间
                    for (let i = 0; i < pePercentiles.length - 1; i++) {
                        if (currentPE >= pePercentiles[i] && currentPE < pePercentiles[i + 1]) {
                            // 计算在当前区间内的相对位置
                            const range = pePercentiles[i + 1] - pePercentiles[i];
                            const position = (currentPE - pePercentiles[i]) / range;
                            
                            // 根据分位数计算仓位
                            const positions = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
                            return Math.round(positions[i] + (positions[i + 1] - positions[i]) * position);
                        }
                    }
                    
                    return 0;
                },

                getSuggestedPosition(stock) {
                    // 查找对应的指数（通过名称匹配）
                    console.log('当前股票:', stock.name);
                    console.log('所有指数:', this.indexData);
                    const index = this.indexData.find(idx => idx.name === stock.name);
                    console.log('找到的指数:', index);
                    if (index && index.suggestedPosition) {
                        // 从建议仓位字符串中提取数字（去掉%符号）
                        const suggestedPosition = parseFloat(index.suggestedPosition);
                        console.log('建议仓位原始值:', index.suggestedPosition);
                        console.log('解析后的建议仓位:', suggestedPosition);
                        if (!isNaN(suggestedPosition)) {
                            // 将建议仓位乘以10%
                            const finalPosition = (suggestedPosition * 0.15).toFixed(2) + '%';
                            console.log('最终建议仓位:', finalPosition);
                            return finalPosition;
                        }
                    }
                    return '-';
                },

                shouldHighlightStockSuggestedPosition(stock) {
                    // 获取建议仓位（去掉%并转为数字）
                    const index = this.indexData.find(idx => idx.name === stock.name);
                    if (!index || !index.suggestedPosition) return false;
                    const suggest = parseFloat(index.suggestedPosition);
                    if (isNaN(suggest)) return false;

                    // 获取实际持仓比例（百分比数值）
                    const holdPercent = (stock.percentage || 0) * 100;

                    // 输出调试信息
                    console.log(
                        `股票: ${stock.name}, 建议仓位: ${suggest}%, 实际持仓: ${holdPercent}%, 差值: ${Math.abs(suggest - holdPercent)}`
                    );

                    // 差值大于等于3%则高亮
                    return Math.abs(suggest - holdPercent) >= 3;
                }
            },
            mounted() {
                // 加载本地存储的指数数据
                const savedIndexData = localStorage.getItem('indexData');
                if (savedIndexData) {
                    try {
                        this.indexData = JSON.parse(savedIndexData);
                        console.log('加载的指数数据:', this.indexData);
                    } catch (e) {
                        console.error('解析指数数据失败:', e);
                    }
                }

                this.updateStockPrices();
                this.startAutoUpdate();
                this.renderCategoryChart();
            }
        }).mount('#app');
    </script>
</body>