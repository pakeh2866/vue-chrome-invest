<template>
  <button @click="fetchData">获取数据</button>
  <button @click="exportData" style="margin-left: 10px;">导出数据</button>
  <input type="file" ref="importFile" style="display:none" @change="importData" accept=".json" />
  <button @click="triggerImport" style="margin-left: 10px;">导入数据</button>
  <h2>
    整体温度数据
    <span v-if="haomaiDate" style="font-size:14px;color:#888;margin-left:10px;">
      ({{ haomaiDate }})
    </span>
    <span style="font-size:14px;color:#888;margin-left:10px;cursor:pointer;text-decoration:underline;" @click="openPositionLogicModal">
     建议A股仓位：{{ suggestedPositionAH }}
   </span>
  </h2>
  <table class="temperature-table">
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
    <div style="display: flex; align-items: center; gap: 10px;">
        <h2 style="margin-right: 10px;">指数参考</h2>
        <button @click="addIndex">新增指数</button>
        <button @click="fetchZsData" style="margin-left: 10px;">一键zs数据</button>
      </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>指数名称</th>
          <th>代码</th>
          <th>现指数点位</th>
          <th>支撑点位</th>
          <th>距离支撑</th>
          <th>近年最低</th>
          <th>已反弹</th>
          <th>前高</th>
          <th>最大跌幅</th>
          <th>极度价值</th>
          <th>价值区间下沿</th>
          <th>价值区间上沿</th>
          <th>正常区间下沿</th>
          <th>正常区间上沿</th>
          <th>压力位</th>
          <th>TX市盈率</th>
          <th>五年平均值</th>
          <th>五年百分位</th>
          <th>十年平均值</th>
          <th>十年百分位</th>
          <th>历史百分位</th>
          <th>zs市盈率</th>
          <th>zs百分位</th>
          <th>建议仓位</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in indexData" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.code }}</td>
          <td :style="{ backgroundColor: getIndexColor(item), color: (getIndexColor(item) === '#006400' || getIndexColor(item) === '#ff4d4f') ? '#fff' : '#000' }">
            {{ item.currentIndexPoint }}
          </td>
          <td>{{ item.supportLevel }}</td>
          <td>
            <span v-if="item.currentIndexPoint && item.supportLevel && item.supportLevel != 0">
              {{ (((item.currentIndexPoint - item.supportLevel) / item.supportLevel) * 100).toFixed(2) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td>{{ item.recentLowest }}</td>
          <td>
            <span v-if="item.currentIndexPoint && item.recentLowest && item.recentLowest != 0">
              {{ (((item.currentIndexPoint - item.recentLowest) / item.recentLowest) * 100).toFixed(2) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td>{{ item.previousHigh }}</td>
          <td
            :style="item.currentIndexPoint && item.previousHigh && item.previousHigh != 0 && (((item.currentIndexPoint - item.previousHigh) / item.previousHigh) * 100) <= -70 ? { backgroundColor: '#90ee90', borderRight: '3px solid #333' } : { borderRight: '3px solid #333' }"
          >
            <span v-if="item.currentIndexPoint && item.previousHigh && item.previousHigh != 0">
              {{ (((item.currentIndexPoint - item.previousHigh) / item.previousHigh) * 100).toFixed(2) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.extremeValue && item.currentIndexPoint < item.extremeValue ? '#006400' : '', color: item.currentIndexPoint && item.extremeValue && item.currentIndexPoint < item.extremeValue ? '#fff' : '' }">
            {{ item.extremeValue }}
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.valueRangeLower && item.valueRangeUpper && item.currentIndexPoint >= item.valueRangeLower && item.currentIndexPoint <= item.valueRangeUpper ? '#90ee90' : '', color: item.currentIndexPoint && item.valueRangeLower && item.valueRangeUpper && item.currentIndexPoint >= item.valueRangeLower && item.currentIndexPoint <= item.valueRangeUpper ? '#000' : '' }">
            {{ item.valueRangeLower }}
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.valueRangeLower && item.valueRangeUpper && item.currentIndexPoint >= item.valueRangeLower && item.currentIndexPoint <= item.valueRangeUpper ? '#90ee90' : '', color: item.currentIndexPoint && item.valueRangeLower && item.valueRangeUpper && item.currentIndexPoint >= item.valueRangeLower && item.currentIndexPoint <= item.valueRangeUpper ? '#000' : '' }">
            {{ item.valueRangeUpper }}
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.normalRangeLower && item.normalRangeUpper && item.currentIndexPoint >= item.normalRangeLower && item.currentIndexPoint <= item.normalRangeUpper ? '#ffe066' : '', color: item.currentIndexPoint && item.normalRangeLower && item.normalRangeUpper && item.currentIndexPoint >= item.normalRangeLower && item.currentIndexPoint <= item.normalRangeUpper ? '#000' : '' }">
            {{ item.normalRangeLower }}
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.normalRangeLower && item.normalRangeUpper && item.currentIndexPoint >= item.normalRangeLower && item.currentIndexPoint <= item.normalRangeUpper ? '#ffe066' : '', color: item.currentIndexPoint && item.normalRangeLower && item.normalRangeUpper && item.currentIndexPoint >= item.normalRangeLower && item.currentIndexPoint <= item.normalRangeUpper ? '#000' : '' }">
            {{ item.normalRangeUpper }}
          </td>
          <td :style="{ backgroundColor: item.currentIndexPoint && item.pressureLevel && item.currentIndexPoint > item.pressureLevel ? '#ff4d4f' : '', color: item.currentIndexPoint && item.pressureLevel && item.currentIndexPoint > item.pressureLevel ? '#fff' : '', borderRight: '3px solid #333' }">
            {{ item.pressureLevel }}
          </td>
          <td :style="{
            color: isPERatioExceeded(item.currentPE, getLatestPe(codeToPeKey(item.code))) ? 'red' : '',
            backgroundColor: item.currentPE && getFiveYearAverage(codeToPeKey(item.code)) !== '--' && parseFloat(item.currentPE) < parseFloat(getFiveYearAverage(codeToPeKey(item.code))) ? 'lightgreen' : ''
          }">{{ item.currentPE }}</td>
          <td style="cursor: pointer; text-decoration: underline;" @click="showFiveYearAverageModal(item)">
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getFiveYearAverage(codeToPeKey(item.code)) }}
            </span>
            <span v-else>--</span>
          </td>
          <td style="cursor: pointer; text-decoration: underline;"
              :style="{ backgroundColor: getFiveYearPercentileColor(item) }"
              @click="showFiveYearPercentileModal(item)">
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getFiveYearPercentile(item.currentPE, codeToPeKey(item.code)) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td style="cursor: pointer; text-decoration: underline;" @click="showTenYearAverageModal(item)">
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getTenYearAverage(codeToPeKey(item.code)) }}
            </span>
            <span v-else>--</span>
          </td>
          <td style="cursor: pointer; text-decoration: underline;"
              :style="{ backgroundColor: getTenYearPercentileColor(item) }"
              @click="showTenYearPercentileModal(item)">
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getTenYearPercentile(item.currentPE, codeToPeKey(item.code)) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td style="cursor: pointer; text-decoration: underline;"
              :style="{ backgroundColor: getHistoryPercentileColor(item) }"
              @click="showHistoryPercentileModal(item)">
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getHistoryPercentileForDisplay(item) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td
            @mouseenter="showTooltip($event, getLatestPeWithDate(codeToPeKey(item.code)).date)"
            @mouseleave="hideTooltip"
            :style="{
              backgroundColor: peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0 && getFiveYearAverage(codeToPeKey(item.code)) !== '--' && getLatestPe(codeToPeKey(item.code)) < parseFloat(getFiveYearAverage(codeToPeKey(item.code))) ? 'lightgreen' : ''
            }"
          >
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getLatestPe(codeToPeKey(item.code)) }}
            </span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="peValuesMap[codeToPeKey(item.code)] && peValuesMap[codeToPeKey(item.code)].length > 0">
              {{ getPercentile(getLatestPe(codeToPeKey(item.code)), peValuesMap[codeToPeKey(item.code)]) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td style="cursor: pointer; text-decoration: underline;"
              :style="{ backgroundColor: getSuggestedPositionColor(item) }"
              @click="showSuggestedPositionModal(item)">
            {{ calculateSuggestedPosition(item) }}
          </td>
          <td class="action-buttons">
            <button @click="onCheeseDataClick(item)">芝士</button>
            <button @click="editIndex(index)">编辑</button>
            <button @click="deleteIndex(index)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div style="margin: 10px 0;">
      <span style="background:#006400;color:#fff;padding:2px 8px;">极度价值</span>
      <span style="background:#90ee90;padding:2px 8px;">价值区间</span>
      <span style="background:#ffe066;padding:2px 8px;">正常区间</span>
      <span style="background:#ffa940;padding:2px 8px;">接近压力位</span>
      <span style="background:#ff4d4f;color:#fff;padding:2px 8px;">压力位以上</span>
    </div>

    <!-- 新增持仓表格 -->
    <div style="display: flex; align-items: center; margin-top: 30px;">
      <h2 style="margin-right: 10px;">持仓表格</h2>
      <!-- 金额显示容器 -->
      <div style="margin-right: 20px; background-color: #e8f4f8; padding: 8px 12px; border-radius: 4px;">
        <!-- 总持仓金额显示 -->
        <div style="font-weight: bold; font-size: 15px;">
          总持仓金额：{{ totalPositionValue.toFixed(2) }}
        </div>
        <!-- 单份金额显示 -->
        <div style="font-weight: bold; font-size: 15px; margin-top: 5px;">
          单份金额：{{ Math.floor(totalPositionValue / 150) }}
        </div>
      </div>
      <!-- 分类持仓比例显示 -->
      <div style="font-size: 14px; margin-right: 20px;">
        <div style="background-color: #f5f5f5; padding: 12px; border-radius: 6px; display: flex; gap: 30px; max-width: 600px;">
          <div>
            <div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 4px;">大类分布</div>
            <div v-for="(ratio, category) in categoryRatios" :key="category" style="margin-bottom: 5px;">
              <span
                :style="category === '现金' && parseFloat(ratio) > 25 ? { backgroundColor: 'red', color: 'white', padding: '0 4px', borderRadius: '2px' } : { fontWeight: 'bold', color: '#333' }"
              >
                {{ category }}:
              </span>
              <span :style="category === '现金' && parseFloat(ratio) > 25 ? { backgroundColor: 'red', color: 'white', padding: '0 4px', borderRadius: '2px' } : {}">
                {{ ratio }}%
              </span>
            </div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 4px;">小类分布</div>
            <div v-for="(ratio, subCategory) in filteredSubCategoryRatios" :key="subCategory" style="margin-bottom: 3px; margin-left: 10px; color: #666;">
              {{ subCategory }}: {{ ratio }}%
            </div>
            <div v-if="equityAStockRatio"
                 style="margin-bottom: 3px; margin-left: 10px; color: #666; font-weight: bold;"
                 :style="shouldHighlightEquityAStock ? { backgroundColor: 'red', color: 'white', padding: '0 4px', borderRadius: '2px' } : {}">
              权益类-A股: {{ equityAStockRatio }}% ({{ (parseFloat(suggestedPositionAH.replace('%', '')) - parseFloat(equityAStockRatio)).toFixed(2) }})
            </div>
          </div>
        </div>
      </div>
      <div style="margin-left: auto; display: flex; gap: 10px;">
        <button @click="showAddPositionModal = true">增加持仓</button>
        <button @click="updateMarket" style="margin-left: 10px;">更新行情</button>
      </div>
    </div>
    <table class="hold-table">
      <thead>
        <tr>
          <th>分类</th>
          <th>股票代码</th>
          <th>股票名称</th>
          <th>持仓数量</th>
          <th>持仓价格</th>
          <th>现价</th>
          <th>持仓价值</th>
          <th @click="togglePositionSort" style="cursor:pointer;">
            持仓比例
            <span v-if="positionSortByRatio">↓</span>
          </th>
          <th>关联指数</th>
          <th>建议仓位</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in positions" :key="idx">
          <td>{{ item.category }}<span v-if="item.subCategory">-{{ item.subCategory }}</span></td>
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.amount }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.category === '现金' ? 1 : (item.currentPrice || '--') }}</td> <!-- 现价：现金固定为1 -->
          <td>{{ (item.amount * (item.category === '现金' ? 1 : (item.currentPrice || 0))).toFixed(2) }}</td> <!-- 持仓价值：现金现价为1 -->
          <td :style="getPositionRatioStyle(item)">
            <span v-if="totalPositionValue > 0">
              {{ ((item.amount * (item.category === '现金' ? 1 : (item.currentPrice || 0))) / totalPositionValue * 100).toFixed(2) }}%
            </span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.relatedIndex">
              {{ getIndexNameByCode(item.relatedIndex) }}
            </span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.relatedIndex">
              {{ calculatePositionSuggestedPosition(item) }}
            </span>
            <span v-else>--</span>
          </td>
          <td>
            <!-- 新增编辑按钮 -->
            <div style="display: flex; gap: 6px;">
              <button @click="editPosition(idx)">编辑</button>
              <button @click="deletePosition(idx)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 新增指数模态框 -->
    <div v-if="showAddIndexModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? '编辑指数' : '添加指数' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>指数名称</label>
            <input v-model="newIndexData.name" type="text" placeholder="请输入指数名称">
          </div>
          <div class="form-group">
            <label>代码</label>
            <input v-model="newIndexData.code" type="text" placeholder="请输入代码">
          </div>
          <div class="form-group">
            <label>现指数点位</label>
            <input v-model.number="newIndexData.currentIndexPoint" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>支撑点位</label>
            <input v-model.number="newIndexData.supportLevel" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>近两年最低</label>
            <input v-model.number="newIndexData.twoYearLow" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>已反弹</label>
            <input v-model.number="newIndexData.reboundHigh" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>前高</label>
            <input v-model.number="newIndexData.previousHigh" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>极度价值</label>
            <input v-model="newIndexData.extremeValue" type="text" placeholder="请输入极度价值">
          </div>
          <div class="form-group">
            <label>价值区间下沿</label>
            <input v-model="newIndexData.valueRangeLower" type="text" placeholder="请输入价值区间下沿">
          </div>
          <div class="form-group">
            <label>价值区间上沿</label>
            <input v-model="newIndexData.valueRangeUpper" type="text" placeholder="请输入价值区间上沿">
          </div>
          <div class="form-group">
            <label>正常区间下沿</label>
            <input v-model="newIndexData.normalRangeLower" type="text" placeholder="请输入正常区间下沿">
          </div>
          <div class="form-group">
            <label>正常区间上沿</label>
            <input v-model="newIndexData.normalRangeUpper" type="text" placeholder="请输入正常区间上沿">
          </div>
          <div class="form-group">
            <label>压力位</label>
            <input v-model.number="newIndexData.pressureLevel" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>芝士链接</label>
            <input v-model="newIndexData.cheeseUrl" type="text" placeholder="请输入芝士链接">
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="cancelAddIndex" class="cancel-btn">取消</button>
          <button @click="saveIndex" class="save-btn">{{ isEditing ? '更新' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 持仓新增弹窗 -->
    <div v-if="showAddPositionModal" class="modal-overlay" @keydown.enter="savePosition">
      <div class="modal-content">
        <h3>{{ isEditingPosition ? '编辑持仓' : '新增持仓' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>分类</label>
            <select v-model="newPosition.category">
              <option value="" disabled>请选择大类</option>
              <option v-for="cat in categoryOptions" :key="cat.label" :value="cat.label">{{ cat.label }}</option>
            </select>
          </div>
          <div class="form-group" v-if="newPosition.category">
            <label>子分类</label>
            <select v-model="newPosition.subCategory">
              <option value="" disabled>请选择子类</option>
              <option v-for="sub in (categoryOptions.find(c => c.label === newPosition.category)?.children || [])" :key="sub.value" :value="sub.value">{{ sub.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>股票代码</label>
            <input v-model="newPosition.code" type="text" placeholder="输入股票代码">
          </div>
          <div class="form-group">
            <label>股票名称</label>
            <input v-model="newPosition.name" type="text" placeholder="输入股票名称">
          </div>
          <div class="form-group">
            <label>持仓数量</label>
            <input v-model.number="newPosition.amount" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>持仓价格</label>
            <input v-model.number="newPosition.price" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label>关联指数</label>
            <select v-model="newPosition.relatedIndex">
              <option value="">请选择关联指数</option>
              <option v-for="index in indexData" :key="index.code" :value="index.code">{{ index.name }} ({{ index.code }})</option>
            </select>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="showAddPositionModal = false" class="cancel-btn">取消</button>
          <button @click="savePosition" class="save-btn">保存</button>
        </div>
      </div>
    </div>
    
    <!-- 建议仓位逻辑说明模态框 -->
    <div v-if="showPositionLogicModal" class="modal-overlay">
     <div class="modal-content" style="width: 500px;">
       <h3>建议A股仓位计算逻辑</h3>
       <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><strong>计算公式：</strong></p>
          <p>1. 计算平均温度 = (有知有行温度 + 好买温度) / 2</p>
          <p>2. 根据平均温度在温度-仓位对照表中进行线性插值计算建议仓位</p>
          <br>
          <p><strong>数据来源：</strong></p>
          <p>• 有知有行温度：{{ temperatureData[0]?.temperature || 'N/A' }}</p>
          <p>• 好买温度：{{ temperatureData[1]?.temperature || 'N/A' }}</p>
          <br>
          <p><strong>计算过程：</strong></p>
          <p v-if="temperatureData && temperatureData.length >= 2">
            平均温度 = ({{ parseFloat(temperatureData[0]?.temperature) || 'N/A' }} + {{ parseFloat(temperatureData[1]?.temperature) || 'N/A' }}) / 2<br>
            = {{ (parseFloat(temperatureData[0]?.temperature) + parseFloat(temperatureData[1]?.temperature)) / 2 || 'N/A' }}<br>
            建议仓位 = {{ suggestedPositionAH }}<br>
          </p>
          <p v-else>数据尚未加载完成</p>
          <br>
          <p><strong>温度-仓位对照表：</strong></p>
          <div style="width: 100%; height: 300px; margin-top: 10px;">
            <canvas id="temperaturePositionChart" width="400" height="300"></canvas>
          </div>
          <p>点击下方按钮可编辑温度-仓位对照表</p>
          <button @click="showTemperaturePositionModal = true" style="background-color: #42b983; color: white; border: none; padding: 8px 16px; cursor: pointer; margin-top: 10px;">编辑对照表</button>
        </div>
        <div class="modal-buttons">
          <button @click="closePositionLogicModal" class="save-btn">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 温度-仓位对照表模态框 -->
    <div v-if="showTemperaturePositionModal" class="modal-overlay">
      <div class="modal-content" style="width: 500px;">
        <h3>温度-仓位对照表</h3>
        <div style="text-align: left; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
          <p>根据当前温度在对照表中进行线性插值计算建议仓位</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">温度</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">仓位 (%)</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in temperaturePositionTable" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">
                <input v-model.number="item.temperature" type="number" min="0" max="100" style="width: 60px;" />
              </td>
              <td style="border: 1px solid #ddd; padding: 8px;">
                <input v-model.number="item.position" type="number" min="0" max="100" style="width: 60px;" />
              </td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                <button @click="deleteTemperaturePositionRow(index)" style="background-color: #ff4d4f; color: white; border: none; padding: 4px 8px; cursor: pointer;">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-bottom: 15px;">
          <button @click="addTemperaturePositionRow" style="background-color: #42b983; color: white; border: none; padding: 8px 16px; cursor: pointer;">添加行</button>
        </div>
        <div class="modal-buttons">
          <button @click="showTemperaturePositionModal = false" class="cancel-btn">取消</button>
          <button @click="saveTemperaturePositionTable" class="save-btn">保存</button>
        </div>
      </div>
    </div>
  <!-- 自定义提示框 -->
  <div v-if="tooltip.show" class="custom-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
    {{ tooltip.text }}
  </div>

  <!-- 图表容器 -->
  <div style="margin-top: 20px;">
    <canvas id="myChart" width="400" height="200"></canvas>
  </div>
  
  <!-- 十年平均值计算详情模态框 -->
  <div v-if="tenYearAverageModal.show" class="modal-overlay" @click="tenYearAverageModal.show = false">
    <div class="modal-content" style="width: 600px;" @click.stop>
      <h3>{{ tenYearAverageModal.name }} 十年平均值计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ tenYearAverageModal.tenYearAverage }}</p>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取当前日期到十年前的历史市盈率数据</p>
        <p>2. 过滤出有效数据（去除无效日期和PE值）</p>
        <p>3. 计算所有有效数据的算术平均值</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 数据时间范围：{{ tenYearAverageModal.calculationDetails.startDate }} 至 {{ tenYearAverageModal.calculationDetails.endDate }}</p>
        <p>• 有效数据数量：{{ tenYearAverageModal.calculationDetails.dataCount }}</p>
        <p>• PE值总和：{{ tenYearAverageModal.calculationDetails.sum.toFixed(2) }}</p>
        <p>• 平均值计算：{{ tenYearAverageModal.calculationDetails.sum.toFixed(2) }} ÷ {{ tenYearAverageModal.calculationDetails.dataCount }} = {{ tenYearAverageModal.calculationDetails.average.toFixed(2) }}</p>
        <br>
        <p><strong>数据样本（随机10条，按日期排序）：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">日期</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in tenYearAverageModal.calculationDetails.dataSample" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.date }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.pe }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-buttons">
        <button @click="tenYearAverageModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
  
  <!-- 五年平均值计算详情模态框 -->
  <div v-if="fiveYearAverageModal.show" class="modal-overlay" @click="fiveYearAverageModal.show = false">
    <div class="modal-content" style="width: 600px;" @click.stop>
      <h3>{{ fiveYearAverageModal.name }} 五年平均值计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ fiveYearAverageModal.fiveYearAverage }}</p>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取当前日期到五年前的历史市盈率数据</p>
        <p>2. 过滤出有效数据（去除无效日期和PE值）</p>
        <p>3. 计算所有有效数据的算术平均值</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 数据时间范围：{{ fiveYearAverageModal.calculationDetails.startDate }} 至 {{ fiveYearAverageModal.calculationDetails.endDate }}</p>
        <p>• 有效数据数量：{{ fiveYearAverageModal.calculationDetails.dataCount }}</p>
        <p>• PE值总和：{{ fiveYearAverageModal.calculationDetails.sum.toFixed(2) }}</p>
        <p>• 平均值计算：{{ fiveYearAverageModal.calculationDetails.sum.toFixed(2) }} ÷ {{ fiveYearAverageModal.calculationDetails.dataCount }} = {{ fiveYearAverageModal.calculationDetails.average.toFixed(2) }}</p>
        <br>
        <p><strong>数据样本（随机10条，按日期排序）：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">日期</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in fiveYearAverageModal.calculationDetails.dataSample" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.date }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.pe }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-buttons">
        <button @click="fiveYearAverageModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
  
  <!-- 五年百分位计算详情模态框 -->
  <div v-if="fiveYearPercentileModal.show" class="modal-overlay" @click="fiveYearPercentileModal.show = false">
    <div class="modal-content" style="width: 700px;" @click.stop>
      <h3>{{ fiveYearPercentileModal.name }} 五年百分位计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ fiveYearPercentileModal.percentile }}%</p>
        <p><strong>当前PE值：</strong>{{ fiveYearPercentileModal.currentPE }}</p>
        <div v-if="fiveYearPercentileModal.usedZsPE" style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #856404; margin: 0;"><strong>注意：</strong>由于TX市盈率为0或与zs市盈率差距超过10%，本次计算采用了zs市盈率。</p>
          <p style="color: #856404; margin: 5px 0 0 0;">TX市盈率：{{ fiveYearPercentileModal.originalPE }}，zs市盈率：{{ fiveYearPercentileModal.zsPE }}</p>
        </div>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取当前日期到五年前的历史市盈率数据</p>
        <p>2. 过滤出有效数据（去除无效日期和PE值）</p>
        <p>3. 计算当前PE值在历史数据中的百分位位置</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 数据时间范围：{{ fiveYearPercentileModal.calculationDetails.startDate }} 至 {{ fiveYearPercentileModal.calculationDetails.endDate }}</p>
        <p>• 有效数据数量：{{ fiveYearPercentileModal.calculationDetails.dataCount }}</p>
        <p>• 当前PE值：{{ fiveYearPercentileModal.currentPE }}</p>
        <p>• 历史数据中小于当前PE值的数量：{{ fiveYearPercentileModal.calculationDetails.lowerCount }}</p>
        <p>• 百分位计算：({{ fiveYearPercentileModal.calculationDetails.lowerCount }} ÷ {{ fiveYearPercentileModal.calculationDetails.dataCount }}) × 100 = {{ fiveYearPercentileModal.percentile }}%</p>
        <br>
        <p><strong>不同百分位的PE值：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">百分位</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">0% (最小值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['0'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">五年内最低PE值</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">10%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['10'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中10%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">25%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['25'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中25%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">50% (中位数)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['50'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中50%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">75%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['75'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中75%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">90%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['90'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中90%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">100% (最大值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ fiveYearPercentileModal.calculationDetails.percentileValues['100'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">五年内最高PE值</td>
            </tr>
          </tbody>
        </table>
        <br>
        <p><strong>数据样本（随机10条，按日期排序）：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">日期</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in fiveYearPercentileModal.calculationDetails.dataSample" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.date }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.pe }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-buttons">
        <button @click="fiveYearPercentileModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
  
  <!-- 十年百分位计算详情模态框 -->
  <div v-if="tenYearPercentileModal.show" class="modal-overlay" @click="tenYearPercentileModal.show = false">
    <div class="modal-content" style="width: 700px;" @click.stop>
      <h3>{{ tenYearPercentileModal.name }} 十年百分位计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ tenYearPercentileModal.percentile }}%</p>
        <p><strong>当前PE值：</strong>{{ tenYearPercentileModal.currentPE }}</p>
        <div v-if="tenYearPercentileModal.usedZsPE" style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #856404; margin: 0;"><strong>注意：</strong>由于TX市盈率为0或与zs市盈率差距超过10%，本次计算采用了zs市盈率。</p>
          <p style="color: #856404; margin: 5px 0 0 0;">TX市盈率：{{ tenYearPercentileModal.originalPE }}，zs市盈率：{{ tenYearPercentileModal.zsPE }}</p>
        </div>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取当前日期到十年前的历史市盈率数据</p>
        <p>2. 过滤出有效数据（去除无效日期和PE值）</p>
        <p>3. 计算当前PE值在历史数据中的百分位位置</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 数据时间范围：{{ tenYearPercentileModal.calculationDetails.startDate }} 至 {{ tenYearPercentileModal.calculationDetails.endDate }}</p>
        <p>• 有效数据数量：{{ tenYearPercentileModal.calculationDetails.dataCount }}</p>
        <p>• 当前PE值：{{ tenYearPercentileModal.currentPE }}</p>
        <p>• 历史数据中小于当前PE值的数量：{{ tenYearPercentileModal.calculationDetails.lowerCount }}</p>
        <p>• 百分位计算：({{ tenYearPercentileModal.calculationDetails.lowerCount }} ÷ {{ tenYearPercentileModal.calculationDetails.dataCount }}) × 100 = {{ tenYearPercentileModal.percentile }}%</p>
        <br>
        <p><strong>不同百分位的PE值：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">百分位</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">0% (最小值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['0'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">十年内最低PE值</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">10%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['10'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中10%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">25%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['25'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中25%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">50% (中位数)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['50'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中50%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">75%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['75'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中75%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">90%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['90'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中90%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">100% (最大值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ tenYearPercentileModal.calculationDetails.percentileValues['100'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">十年内最高PE值</td>
            </tr>
          </tbody>
        </table>
        <br>
        <p><strong>数据样本（随机10条，按日期排序）：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">日期</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in tenYearPercentileModal.calculationDetails.dataSample" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.date }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.pe }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-buttons">
        <button @click="tenYearPercentileModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
  
  <!-- 历史百分位计算详情模态框 -->
  <div v-if="historyPercentileModal.show" class="modal-overlay" @click="historyPercentileModal.show = false">
    <div class="modal-content" style="width: 700px;" @click.stop>
      <h3>{{ historyPercentileModal.name }} 历史百分位计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ historyPercentileModal.percentile }}%</p>
        <p><strong>当前PE值：</strong>{{ historyPercentileModal.currentPE }}</p>
        <div v-if="historyPercentileModal.usedZsPE" style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #856404; margin: 0;"><strong>注意：</strong>由于TX市盈率为0或与zs市盈率差距超过10%，本次计算采用了zs市盈率。</p>
          <p style="color: #856404; margin: 5px 0 0 0;">TX市盈率：{{ historyPercentileModal.originalPE }}，zs市盈率：{{ historyPercentileModal.zsPE }}</p>
        </div>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取所有历史市盈率数据</p>
        <p>2. 过滤出有效数据（去除无效日期和PE值）</p>
        <p>3. 计算当前PE值在历史数据中的百分位位置</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 数据时间范围：{{ historyPercentileModal.calculationDetails.startDate }} 至 {{ historyPercentileModal.calculationDetails.endDate }}</p>
        <p>• 有效数据数量：{{ historyPercentileModal.calculationDetails.dataCount }}</p>
        <p>• 当前PE值：{{ historyPercentileModal.currentPE }}</p>
        <p>• 历史数据中小于当前PE值的数量：{{ historyPercentileModal.calculationDetails.lowerCount }}</p>
        <p>• 百分位计算：({{ historyPercentileModal.calculationDetails.lowerCount }} ÷ {{ historyPercentileModal.calculationDetails.dataCount }}) × 100 = {{ historyPercentileModal.percentile }}%</p>
        <br>
        <p><strong>不同百分位的PE值：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">百分位</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">0% (最小值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['0'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史最低PE值</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">10%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['10'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中10%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">25%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['25'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中25%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">50% (中位数)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['50'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中50%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">75%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['75'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中75%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">90%</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['90'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史中90%的时间PE值低于此水平</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">100% (最大值)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ historyPercentileModal.calculationDetails.percentileValues['100'] || 'N/A' }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">历史最高PE值</td>
            </tr>
          </tbody>
        </table>
        <br>
        <p><strong>数据样本（随机10条，按日期排序）：</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">日期</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">PE值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in historyPercentileModal.calculationDetails.dataSample" :key="index">
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.date }}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">{{ data.pe }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-buttons">
        <button @click="historyPercentileModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
  
  <!-- 建议仓位计算详情模态框 -->
  <div v-if="suggestedPositionModal.show" class="modal-overlay" @click="suggestedPositionModal.show = false">
    <div class="modal-content" style="width: 700px;" @click.stop>
      <h3>{{ suggestedPositionModal.name }} 建议仓位计算详情</h3>
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <p><strong>计算结果：</strong>{{ suggestedPositionModal.suggestedPosition }}</p>
        <p><strong>当前PE值：</strong>{{ suggestedPositionModal.currentPE }}</p>
        <br>
        <p><strong>计算逻辑：</strong></p>
        <p>1. 获取五年、十年和历史百分位数据</p>
        <p>2. 计算综合百分位（加权平均：五年60%，十年30%，历史10%）</p>
        <p>3. 根据综合百分位计算建议仓位（1 - 综合百分位）</p>
        <br>
        <p><strong>计算过程：</strong></p>
        <p>• 五年百分位：{{ suggestedPositionModal.calculationDetails.fiveYearPercentile }}%</p>
        <p>• 十年百分位：{{ suggestedPositionModal.calculationDetails.tenYearPercentile }}%</p>
        <p>• 历史百分位：{{ suggestedPositionModal.calculationDetails.historyPercentile }}%</p>
        <p>• 综合百分位计算：({{ suggestedPositionModal.calculationDetails.fiveYearPercentile }} × 0.6) + ({{ suggestedPositionModal.calculationDetails.tenYearPercentile }} × 0.3) + ({{ suggestedPositionModal.calculationDetails.historyPercentile }} × 0.1) = {{ suggestedPositionModal.calculationDetails.combinedPercentile }}%</p>
        <p>• 建议仓位计算：1 - ({{ suggestedPositionModal.calculationDetails.combinedPercentile }} / 100) = {{ suggestedPositionModal.calculationDetails.finalPosition }}%</p>
        <br>
        <p><strong>权重说明：</strong></p>
        <p>• 五年百分位权重60%：反映近期市场估值水平</p>
        <p>• 十年百分位权重30%：反映中期市场估值水平</p>
        <p>• 历史百分位权重10%：反映长期市场估值水平</p>
        <br>
        <p><strong>投资建议：</strong></p>
        <div v-if="suggestedPositionModal.calculationDetails.finalPosition >= 80" style="background-color: #90ee90; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #006400; margin: 0;"><strong>建议大幅增持</strong>：当前估值水平较低，建议仓位{{ suggestedPositionModal.calculationDetails.finalPosition }}%，可考虑增加投资。</p>
        </div>
        <div v-else-if="suggestedPositionModal.calculationDetails.finalPosition >= 60" style="background-color: #e6f7ff; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #0050b3; margin: 0;"><strong>建议适度增持</strong>：当前估值水平适中，建议仓位{{ suggestedPositionModal.calculationDetails.finalPosition }}%，可考虑适度增加投资。</p>
        </div>
        <div v-else-if="suggestedPositionModal.calculationDetails.finalPosition >= 40" style="background-color: #fff7e6; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #d46b08; margin: 0;"><strong>建议持有观望</strong>：当前估值水平偏高，建议仓位{{ suggestedPositionModal.calculationDetails.finalPosition }}%，建议持有现有仓位观望。</p>
        </div>
        <div v-else style="background-color: #fff1f0; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #cf1322; margin: 0;"><strong>建议减持</strong>：当前估值水平很高，建议仓位{{ suggestedPositionModal.calculationDetails.finalPosition }}%，建议考虑减持部分仓位。</p>
        </div>
      </div>
      <div class="modal-buttons">
        <button @click="suggestedPositionModal.show = false" class="save-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>

// 定义你要打开的多个页面的 URL 列表
const targetUrls = [
    "https://youzhiyouxing.cn/data", // 替换为你的第一个目标网站 URL
    "https://stock.cheesefortune.com/",  // 替换为你的第二个目标网站 URL
    "https://youzhiyouxing.cn/data/market", // 如果有更多，可以在这里添加
    "https://trade.ehowbuy.com/vue-newpig/tool/thermometerDetail"
];

// 用于存储图表实例
let temperaturePositionChart = null;

export default {
  data() {
    return {
      showAddIndexModal: false,
      isEditing: false,
      currentEditIndex: -1,
      // 添加提示框相关数据
      tooltip: {
        show: false,
        text: '',
        x: 0,
        y: 0
      },
      // 十年平均值模态框相关数据
      tenYearAverageModal: {
        show: false,
        code: '',
        name: '',
        tenYearAverage: '',
        calculationDetails: {
          startDate: '',
          endDate: '',
          dataCount: 0,
          sum: 0,
          average: 0,
          dataSample: []
        }
      },
      // 五年平均值模态框相关数据
      fiveYearAverageModal: {
        show: false,
        code: '',
        name: '',
        fiveYearAverage: '',
        calculationDetails: {
          startDate: '',
          endDate: '',
          dataCount: 0,
          sum: 0,
          average: 0,
          dataSample: []
        }
      },
      // 五年百分位模态框相关数据
      fiveYearPercentileModal: {
        show: false,
        code: '',
        name: '',
        currentPE: '',
        percentile: '',
        calculationDetails: {
          startDate: '',
          endDate: '',
          dataCount: 0,
          percentileValues: {},
          dataSample: []
        }
      },
      // 十年百分位模态框相关数据
      tenYearPercentileModal: {
        show: false,
        code: '',
        name: '',
        currentPE: '',
        originalPE: '',
        zsPE: '',
        usedZsPE: false,
        percentile: '',
        calculationDetails: {
          startDate: '',
          endDate: '',
          dataCount: 0,
          lowerCount: 0,
          percentileValues: {},
          dataSample: []
        }
      },
      // 历史百分位模态框相关数据
      historyPercentileModal: {
        show: false,
        code: '',
        name: '',
        currentPE: '',
        percentile: '',
        calculationDetails: {
          startDate: '',
          endDate: '',
          dataCount: 0,
          percentileValues: {},
          dataSample: []
        }
      },
      newIndexData: {
        name: '',
        code: '',
        currentIndexPoint: 0,
        supportLevel: 0,
        twoYearLow: 0,
        previousHigh: 0,
        extremeValue: '',
        valueRangeLower: '',
        valueRangeUpper: '',
        normalRangeLower: '',
        normalRangeUpper: '',
        pressureLevel: 0,
        cheeseUrl: '',
        reboundHigh: 0
      },
      indexData: [],
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
      todayTempValue: 0,
      haomaiDate: '', // 新增
      showAddPositionModal: false,
      newPosition: {
        category: '',
        subCategory: '', // 新增：二级分类
        code: '',
        name: '',
        amount: 0,
        price: 0,
        relatedIndex: '' // 新增：关联指数
      },
      positions: [], // 新增：持仓数据数组
      categoryOptions: [
        {
                  label: '权益类',
                  children: [
                    { label: 'A股个股', value: 'A股个股' },
                    { label: 'A股大盘ETF', value: 'A股大盘ETF' },
                    { label: 'A股中小盘ETF', value: 'A股中小盘ETF' },
                    { label: 'A股行业ETF', value: 'A股行业ETF' },
                    { label: 'A股价值ETF', value: 'A股价值ETF' },
                    { label: '港股ETF', value: '港股ETF' },
                    { label: '海外ETF', value: '海外ETF' }
                  ]
                },
        {
          label: '债券类',
          children: [
            { label: '可转债', value: '可转债' },
            { label: '债券ETF', value: '债券ETF' }
          ]
        },
        {
          label: '商品类',
          children: [
            { label: '原油', value: '原油' },
            { label: '黄金', value: '黄金' },
            { label: '其他', value: '其他' }
          ]
        },
        {
          label: '现金',
          children: [
            { label: '现金', value: '现金' }
          ]
        }
      ],
      isEditingPosition: false,
      currentEditPositionIndex: -1,
      totalPositionValue: 0, // 新增：总持仓价值
      peValuesMap: {}, // code -> pe历史数组
      rawPeData: {}, // 新增：原始pe数据，用于获取最新pe
      positionSortByRatio: false, // 是否按持仓比例排序
      originalPositions: [],      // 保存原始顺序
      showPositionLogicModal: false, // 控制显示建议仓位逻辑的模态框
      // 温度-仓位对照表
      temperaturePositionTable: [
        { temperature: 0, position: 100 },
        { temperature: 20, position: 80 },
        { temperature: 40, position: 60 },
        { temperature: 60, position: 40 },
        { temperature: 80, position: 20 },
        { temperature: 100, position: 0 }
      ],
      showTemperaturePositionModal: false, // 控制显示温度-仓位对照表模态框
      isTemperaturePositionTableLoaded: false, // 标记温度-仓位对照表数据是否已从存储加载
      // 建议仓位计算详情模态框相关数据
      suggestedPositionModal: {
        show: false,
        code: '',
        name: '',
        currentPE: '',
        suggestedPosition: '',
        calculationDetails: {
          fiveYearPercentile: '',
          tenYearPercentile: '',
          historyPercentile: '',
          combinedPercentile: '',
          finalPosition: ''
        }
      },
    }
  },
  methods: {
    // 编辑指数，弹出编辑模态框并填充数据
    editIndex(index) {
      const item = this.indexData[index];
  this.newIndexData = {
    ...item,
    currentIndexPoint: item.viewPoint !== undefined ? item.viewPoint : item.currentIndexPoint,
    cheeseUrl: item.cheeseUrl || ''
  };
  delete this.newIndexData.viewPoint;
      this.showAddIndexModal = true;
      this.isEditing = true;
      this.currentEditIndex = index;
    },

    // 删除某条指数数据
    deleteIndex(index) {
      if (confirm('确定要删除这条指数数据吗？')) {
        this.indexData.splice(index, 1);
        chrome.storage.local.set({ 'indexData': this.indexData }, () => {
          console.log('指数数据已删除');
        });
      }
    },

    // 新增指数，弹出新增模态框
    addIndex() {
      this.showAddIndexModal = true;
    },

    // 保存指数（新增或编辑后）
    saveIndex() {
      // 验证必填字段
      if (!this.newIndexData.name || !this.newIndexData.code) {
        alert('指数名称和代码为必填项');
        return;
      }
      
      if (this.isEditing) {
        // 更新现有指数
        this.indexData[this.currentEditIndex] = {
          ...this.newIndexData,
          distanceToSupport: this.calculateDistanceToSupport(),
          recentLowest: this.newIndexData.twoYearLow,
          reboundHigh: this.newIndexData.reboundHigh,
          previousHigh: this.newIndexData.previousHigh,
          maxDrawdown: this.indexData[this.currentEditIndex].maxDrawdown,
          currentPE: this.indexData[this.currentEditIndex].currentPE,
          suggestedPosition: this.indexData[this.currentEditIndex].suggestedPosition
        };
        this.isEditing = false;
        this.currentEditIndex = -1;
      } else {
        // 添加新指数
        this.indexData.push({
          ...this.newIndexData,
          distanceToSupport: this.calculateDistanceToSupport(),
          recentLowest: this.newIndexData.twoYearLow,
          reboundHigh: this.newIndexData.reboundHigh,
          previousHigh: this.newIndexData.previousHigh,
          maxDrawdown: 0,
          currentPE: 0,
          suggestedPosition: '0%'
        });
      }
      
      // 保存到本地存储
      chrome.storage.local.set({ 'indexData': this.indexData }, () => {
        console.log(this.isEditing ? '指数数据已更新' : '指数数据已保存');
      });
      
      // 重置表单并关闭模态框
      this.resetForm();
      this.showAddIndexModal = false;
    },

    // 取消新增/编辑指数，重置表单
    cancelAddIndex() {
      this.resetForm();
      this.showAddIndexModal = false;
    },

    // 重置指数表单
    resetForm() {
      this.newIndexData = {
        name: '',
        code: '',
        currentIndexPoint: 0,
        supportLevel: 0,
        twoYearLow: 0,
        previousHigh: 0,
        extremeValue: '',
        valueRangeLower: '',
        valueRangeUpper: '',
        normalRangeLower: '',
        normalRangeUpper: '',
        pressureLevel: 0,
        cheeseUrl: '',
        reboundHigh: 0
      };
    },

    // 计算距离支撑位的百分比
    calculateDistanceToSupport() {
      // 简单计算距离支撑位的百分比
      return this.newIndexData.supportLevel ? '0%' : 'N/A';
    },

    // 一键打开目标网站
    fetchData() {
      this.targetUrls.forEach(url => {
        window.open(url, '_blank');
      });
    },

    // 跳转到芝士数据页面
    onCheeseDataClick(item) {
      // 这里可以自定义跳转或弹窗等逻辑
      const url = item.cheeseUrl && item.cheeseUrl.trim() ? item.cheeseUrl : 'https://stock.cheesefortune.com/';
      window.open(url, '_blank');
    },

    // 导出所有本地存储数据为JSON文件
    exportData() {
      // 读取所有本地存储数据
      chrome.storage.local.get(null, (result) => {
        const dataStr = JSON.stringify(result, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chrome_plugin_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    },

    // 触发导入文件选择
    triggerImport() {
      this.$refs.importFile.click();
    },

    // 导入本地JSON数据并写入storage
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          chrome.storage.local.set(data, () => {
            alert("数据导入成功！");
            location.reload(); // 可选：刷新页面以加载新数据
          });
        } catch (err) {
          alert("导入失败，文件格式不正确！");
        }
      };
      reader.readAsText(file);
    },

    // 新增持仓，保存到本地storage
    savePosition() {
      // 校验必填项
      if (!this.newPosition.code || !this.newPosition.name) {
        alert('股票代码和名称为必填项');
        return;
      }
      if (this.isEditingPosition) {
        // 编辑模式，更新对应项
        this.positions.splice(this.currentEditPositionIndex, 1, { ...this.newPosition });
        this.isEditingPosition = false;
        this.currentEditPositionIndex = -1;
      } else {
        // 新增模式
        this.positions.push({ ...this.newPosition });
      }
      // 保存到本地
      chrome.storage.local.set({ positions: this.positions }, () => {
        console.log('持仓数据已保存');
      });
      // 重置表单并关闭弹窗
      this.showAddPositionModal = false;
      this.newPosition = {
        category: '',
        subCategory: '', // 新增：二级分类
        code: '',
        name: '',
        amount: 0,
        price: 0,
        relatedIndex: '' // 新增：关联指数
      };
      this.originalPositions = this.positions.slice(); // 新增：保存原始顺序
    },

    // 删除某条持仓
    deletePosition(idx) {
      this.positions.splice(idx, 1);
      chrome.storage.local.set({ positions: this.positions }, () => {
        console.log('持仓已删除');
      });
      this.originalPositions = this.positions.slice(); // 新增：保存原始顺序
    },

    // 编辑持仓，弹出编辑模态框并填充数据
    editPosition(idx) {
      const item = this.positions[idx];
      this.newPosition = { ...item };
      this.showAddPositionModal = true;
      this.isEditingPosition = true;
      this.currentEditPositionIndex = idx;
    },

    // 更新行情（持仓和指数）
    async updateMarket() {
      try {
        // 1. 获取所有股票和指数的代码
        const stockCodes = this.positions.map(stock => stock.code.trim());
        const indexCodes = this.indexData.map(idx => idx.code.trim());
        // 合并去重
        const allCodes = Array.from(new Set([...stockCodes, ...indexCodes])).filter(Boolean);
        console.log('allCodes:', allCodes);
        if (allCodes.length === 0) {
          alert('没有有效的股票或指数代码可供查询。');
          return;
        }

        // 2. 请求行情（腾讯接口，A股需加前缀如 sh000001、sz000001）
        // 你可以根据实际情况调整前缀
        const querySymbols = allCodes.join(',');
        const response = await fetch(`https://qt.gtimg.cn/q=${querySymbols}`);
        const text = await response.text();

        // 3. 解析返回数据
        const individualStockData = text.trim().split(';').filter(s => s.length > 0);
        individualStockData.forEach(stockStr => {
          const fields = stockStr.split('~');
          if (fields.length > 3) {
            const currentPriceStr = fields[3];
            const currentPrice = parseFloat(currentPriceStr);
            const code = fields[2]; // 股票代码在第三个字段

            // 4. 更新持仓股票
            const stock = this.positions.find(s => s.code.includes(code));
            if (stock && !isNaN(currentPrice)) {
              stock.currentPrice = currentPrice;
              stock.value = stock.amount * currentPrice;
            }

            // 5. 更新指数点位
            const idx = this.indexData.find(i => i.code.includes(code));
            if (idx && !isNaN(currentPrice)) {
              idx.currentIndexPoint = currentPrice;
              // 获取市盈率
              const peField = fields[39]; // 腾讯接口的市盈率字段
              if (peField && peField !== '-') {
                idx.currentPE = parseFloat(peField);
              } else {
                idx.currentPE = null;
              }
            }
          }
        });

        // 6. 保存到本地
        chrome.storage.local.set({ positions: this.positions, indexData: this.indexData }, () => {
          alert('股票和指数数据更新完成！');
        });
      } catch (error) {
        console.error('获取股票数据失败:', error);
        alert('获取股票数据失败，请稍后重试！');
      }
    },

    // 判断现指数点位区间并返回对应颜色
    getIndexColor(item) {
      const v = Number(item.currentIndexPoint);
      const extreme = Number(item.extremeValue);
      const valueLow = Number(item.valueRangeLower);
      const valueHigh = Number(item.valueRangeUpper);
      const normalLow = Number(item.normalRangeLower);
      const normalHigh = Number(item.normalRangeUpper);
      const pressure = Number(item.pressureLevel);
      if (!v || isNaN(v)) return '';
      if (!isNaN(extreme) && v <= extreme) return '#006400'; // 极度价值
      if (!isNaN(valueLow) && !isNaN(valueHigh) && v > extreme && v <= valueHigh) return '#90ee90'; // 价值区间
      if (!isNaN(normalLow) && !isNaN(normalHigh) && v > valueHigh && v <= normalHigh) return '#ffe066'; // 正常区间
      if (!isNaN(pressure) && v > normalHigh && v <= pressure) return '#ffa940'; // 接近压力位
      if (!isNaN(pressure) && v > pressure) return '#ff4d4f'; // 超过压力位
      return '';
    },

    // 计算百分位
    getPercentile(currentPE, peArr) {
      if (!Array.isArray(peArr) || peArr.length === 0) return '--';
      const sorted = peArr.slice().sort((a, b) => a - b);
      let count = 0;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] < currentPE) count++;
      }
      return ((count / sorted.length) * 100).toFixed(0);
    },
    getLatestPe(peKey) {
      const result = this.getLatestPeWithDate(peKey);
      return result.pe;
    },
    getLatestPeWithDate(peKey) {
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return { pe: '--', date: '' };
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return { pe: '--', date: '' };
      // 找到日期最新的那一项
      let latest = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i].date > latest.date) {
          latest = arr[i];
        }
      }
      return {
        pe: latest && latest.pe ? parseFloat(latest.pe) : '--',
        date: latest && latest.date ? latest.date : ''
      };
    },
    // 计算五年平均值
    getFiveYearAverage(peKey) {
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '--';
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return '--';
      
      // 计算五年前的日期
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      // 过滤出五年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= fiveYearsAgo;
      });
      
      if (recentData.length === 0) return '--';
      
      // 计算平均值
      const sum = recentData.reduce((acc, item) => {
        const pe = parseFloat(item.pe);
        return !isNaN(pe) ? acc + pe : acc;
      }, 0);
      
      const average = sum / recentData.length;

      return average.toFixed(2);
    },
    // 计算五年百分位
    getFiveYearPercentile(currentPE, peKey) {
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '--';
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return '--';
      
      // 计算五年前的日期
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      // 过滤出五年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= fiveYearsAgo;
      });
      
      if (recentData.length === 0) return '--';
      
      // 提取有效的PE值
      const peValues = recentData.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return '--';
      
      // 计算当前PE在历史数据中的百分位
      let currentPEValue = parseFloat(currentPE);
      if (isNaN(currentPEValue)) currentPEValue = 0;
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
      }
      
      // 如果无法获取有效的PE值，返回'--'
      if (isNaN(currentPEValue) || currentPEValue === 0) return '--';
      
      // 统计小于当前PE值的数量
      let count = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) count++;
      }
      
      // 计算百分位
      const percentile = (count / peValues.length) * 100;
      return percentile.toFixed(0);
    },
    // 计算十年百分位
    getTenYearPercentile(currentPE, peKey) {
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '--';
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return '--';
      
      // 计算十年前的日期
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      
      // 过滤出十年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= tenYearsAgo;
      });
      
      if (recentData.length === 0) return '--';
      
      // 提取有效的PE值
      const peValues = recentData.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return '--';
      
      // 计算当前PE值在历史数据中的百分位
      let currentPEValue = parseFloat(currentPE);
      if (isNaN(currentPEValue)) currentPEValue = 0;
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
      }
      
      // 如果无法获取有效的PE值，返回'--'
      if (isNaN(currentPEValue) || currentPEValue === 0) return '--';
      
      // 统计小于当前PE值的数量
      let count = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) count++;
      }
      
      // 计算百分位
      const percentile = (count / peValues.length) * 100;
      return percentile.toFixed(0);
    },
    // 计算十年平均值
    getTenYearAverage(peKey) {
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '--';
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return '--';
      
      // 计算十年前的日期
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      
      // 过滤出十年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= tenYearsAgo;
      });
      
      if (recentData.length === 0) return '--';
      
      // 计算平均值
      const sum = recentData.reduce((acc, item) => {
        const pe = parseFloat(item.pe);
        return !isNaN(pe) ? acc + pe : acc;
      }, 0);
      
      const average = sum / recentData.length;
      
      return average.toFixed(2);
    },
    codeToPeKey(code) {
      if (!code) return '';
      // 特殊处理 sh000990 和 000990.CSI 的对应关系
      if (code === 'sh000990') {
        return '000990.CSI';
      }
      if (code.startsWith('sh')) return code.slice(2).toUpperCase() + '.SH';
      if (code.startsWith('sz')) return code.slice(2).toUpperCase() + '.SZ';
      if (code.startsWith('hk')) {
        // 特殊处理恒生指数代码
        if (code === 'hkHSI') {
          return 'HSI.HI';
        }
        if (code === 'hkHSTECH') {
          return 'HSTECH.HI';
        }
        return code.slice(2).toUpperCase() + '.HK';
      }
      return code.toUpperCase();
    },
    togglePositionSort() {
      this.positionSortByRatio = !this.positionSortByRatio;
      // 保存到本地
      chrome.storage.local.set({ positionSortByRatio: this.positionSortByRatio });
      if (this.positionSortByRatio) {
        // 按持仓比例从大到小排序
        this.positions.sort((a, b) => {
          const aValue = a.amount * (a.category === '现金' ? 1 : (a.currentPrice || 0));
          const bValue = b.amount * (b.category === '现金' ? 1 : (b.currentPrice || 0));
          return bValue - aValue;
        });
      } else {
        // 恢复原始顺序
        this.positions = this.originalPositions.slice();
      }
    },
    // 提示框相关方法
    showTooltip(event, text) {
      if (!text) return;
      this.tooltip.show = true;
      this.tooltip.text = text;
      // 设置提示框位置
      this.tooltip.x = event.clientX;
      this.tooltip.y = event.clientY + 20; // 在鼠标下方20px
    },
    hideTooltip() {
      this.tooltip.show = false;
    },
    // 添加温度-仓位对照表行
    addTemperaturePositionRow() {
      this.temperaturePositionTable.push({
        temperature: 0,
        position: 0
      });
    },
    // 删除温度-仓位对照表行
    deleteTemperaturePositionRow(index) {
      if (this.temperaturePositionTable.length > 1) {
        this.temperaturePositionTable.splice(index, 1);
      } else {
        alert('至少需要保留一行数据');
      }
    },
    // 保存温度-仓位对照表
    saveTemperaturePositionTable() {
      // 对表格按温度排序
      this.temperaturePositionTable.sort((a, b) => a.temperature - b.temperature);
      
      // 在保存前打印数据，以便检查格式
      console.log('准备保存温度-仓位对照表:', this.temperaturePositionTable);
      console.log('数据类型检查:');
      this.temperaturePositionTable.forEach((item, index) => {
        console.log(`  [${index}] temperature: ${typeof item.temperature} (${item.temperature}), position: ${typeof item.position} (${item.position})`);
      });
      
      // 保存到本地存储
      chrome.storage.local.set({ 'temperaturePositionTable': this.temperaturePositionTable }, () => {
        if (chrome.runtime.lastError) {
          console.error('保存温度-仓位对照表失败:', chrome.runtime.lastError);
          alert('温度-仓位对照表保存失败: ' + chrome.runtime.lastError.message);
        } else {
          console.log('温度-仓位对照表已保存:', this.temperaturePositionTable);
          // 添加用户可见的成功提示
          alert('温度-仓位对照表保存成功!');
        }
      });
      
      // 关闭模态框
      this.showTemperaturePositionModal = false;
      
      // 更新图表
      this.$nextTick(() => {
        this.updateTemperaturePositionChart();
      });
    },
    // 根据温度-仓位对照表进行线性插值计算
    calculatePositionFromTable(temperature) {
      // 确保表格按温度排序
      const sortedTable = [...this.temperaturePositionTable].sort((a, b) => a.temperature - b.temperature);
      
      // 如果温度小于等于最小温度，返回最大仓位
      if (temperature <= sortedTable[0].temperature) {
        return sortedTable[0].position;
      }
      
      // 如果温度大于等于最大温度，返回最小仓位
      if (temperature >= sortedTable[sortedTable.length - 1].temperature) {
        return sortedTable[sortedTable.length - 1].position;
      }
      
      // 找到温度所在的区间
      for (let i = 0; i < sortedTable.length - 1; i++) {
        if (temperature >= sortedTable[i].temperature && temperature <= sortedTable[i + 1].temperature) {
          // 线性插值计算
          const temp1 = sortedTable[i].temperature;
          const temp2 = sortedTable[i + 1].temperature;
          const pos1 = sortedTable[i].position;
          const pos2 = sortedTable[i + 1].position;
          
          // 计算插值
          const position = pos1 + (pos2 - pos1) * (temperature - temp1) / (temp2 - temp1);
          return position;
        }
      }
      
      // 如果没有找到合适的区间，返回默认值
      return 50;
    },
    // 初始化温度-仓位对照表图表
    initTemperaturePositionChart() {
      const ctx = document.getElementById('temperaturePositionChart');
      if (!ctx) return;
      
      // 按温度排序数据
      const sortedData = [...this.temperaturePositionTable].sort((a, b) => a.temperature - b.temperature);
      const temperatures = sortedData.map(item => item.temperature);
      const positions = sortedData.map(item => item.position);
      
      // 销毁之前的图表实例（如果存在）
      if (temperaturePositionChart) {
        temperaturePositionChart.destroy();
      }
      
      // 创建新的图表实例
      temperaturePositionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: temperatures,
          datasets: [{
            label: '仓位 (%)',
            data: positions,
            borderColor: '#42b983',
            backgroundColor: 'rgba(66, 185, 131, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: '温度'
              }
            },
            y: {
              title: {
                display: true,
                text: '仓位 (%)'
              },
              min: 0,
              max: 100
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    },
    // 更新温度-仓位对照表图表
    updateTemperaturePositionChart() {
      if (!temperaturePositionChart) return;
      
      // 按温度排序数据
      const sortedData = [...this.temperaturePositionTable].sort((a, b) => a.temperature - b.temperature);
      const temperatures = sortedData.map(item => item.temperature);
      const positions = sortedData.map(item => item.position);
      
      // 更新图表数据
      temperaturePositionChart.data.labels = temperatures;
      temperaturePositionChart.data.datasets[0].data = positions;
      temperaturePositionChart.update();
    },
    // 打开建议仓位逻辑模态框
    openPositionLogicModal() {
      // 先设置模态框显示
      this.showPositionLogicModal = true;
      
      // 在下一个事件循环中初始化图表，确保DOM已更新
      this.$nextTick(() => {
        // 如果Chart.js已经加载，则初始化图表
        if (typeof Chart !== 'undefined') {
          this.initTemperaturePositionChart();
        } else {
          // 如果Chart.js还未加载，则等待其加载完成
          const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
              this.initTemperaturePositionChart();
              clearInterval(checkChart);
            }
          }, 100);
          
          // 设置超时时间，避免无限等待
          setTimeout(() => {
            clearInterval(checkChart);
          }, 5000);
        }
      });
    },
    // 关闭建议仓位逻辑模态框
    closePositionLogicModal() {
      this.showPositionLogicModal = false;
    },

    // 一键zs数据按钮功能（暂空）
    fetchZsData() {
      // 遍历所有指数数据，打开芝士链接
      this.indexData.forEach(item => {
        if (item.cheeseUrl && item.cheeseUrl.trim()) {
          window.open(item.cheeseUrl, '_blank');
        }
      });
    },
    // 判断TX市盈率与zs市盈率差值是否超过2%
    isPERatioExceeded(txPE, zsPE) {
      // 确保两个值都存在且为有效数字
      if (!txPE || !zsPE || isNaN(txPE) || isNaN(zsPE) || zsPE === 0) {
        return false;
      }
      // 计算差值百分比
      const ratio = Math.abs((txPE - zsPE) / zsPE) * 100;
      return ratio > 2;
    },
    // 显示十年平均值计算详情模态框
    showTenYearAverageModal(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return;
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return;
      
      // 计算十年前的日期
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      
      // 过滤出十年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= tenYearsAgo;
      });
      
      if (recentData.length === 0) return;
      
      // 计算平均值
      const sum = recentData.reduce((acc, item) => {
        const pe = parseFloat(item.pe);
        return !isNaN(pe) ? acc + pe : acc;
      }, 0);
      
      const average = sum / recentData.length;
      
      // 获取数据样本（随机10条，然后按日期排序）
      const shuffledData = [...recentData].sort(() => 0.5 - Math.random()).slice(0, 10);
      const dataSample = shuffledData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 设置模态框数据
      this.tenYearAverageModal = {
        show: true,
        code: item.code,
        name: item.name,
        tenYearAverage: average.toFixed(2),
        calculationDetails: {
          startDate: tenYearsAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          dataCount: recentData.length,
          sum: sum,
          average: average,
          dataSample: dataSample.map(item => ({
            date: item.date,
            pe: parseFloat(item.pe).toFixed(2)
          }))
        }
      };
    },
    // 显示五年平均值计算详情模态框
    showFiveYearAverageModal(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return;
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return;
      
      // 计算五年前的日期
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      // 过滤出五年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= fiveYearsAgo;
      });
      
      if (recentData.length === 0) return;
      
      // 计算平均值
      const sum = recentData.reduce((acc, item) => {
        const pe = parseFloat(item.pe);
        return !isNaN(pe) ? acc + pe : acc;
      }, 0);
      
      const average = sum / recentData.length;
      
      // 获取数据样本（随机10条，然后按日期排序）
      const shuffledData = [...recentData].sort(() => 0.5 - Math.random()).slice(0, 10);
      const dataSample = shuffledData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 设置模态框数据
      this.fiveYearAverageModal = {
        show: true,
        code: item.code,
        name: item.name,
        fiveYearAverage: average.toFixed(2),
        calculationDetails: {
          startDate: fiveYearsAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          dataCount: recentData.length,
          sum: sum,
          average: average,
          dataSample: dataSample.map(item => ({
            date: item.date,
            pe: parseFloat(item.pe).toFixed(2)
          }))
        }
      };
    },
    // 显示五年百分位计算详情模态框
    showFiveYearPercentileModal(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return;
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return;
      
      // 计算五年前的日期
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      // 过滤出五年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= fiveYearsAgo;
      });
      
      if (recentData.length === 0) return;
      
      // 提取有效的PE值
      const peValues = recentData.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return;
      
      // 计算当前PE值在历史数据中的百分位
      let currentPEValue = parseFloat(item.currentPE);
      if (isNaN(currentPEValue)) return;
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      let usedZsPE = false;
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
        usedZsPE = true;
      }
      
      // 统计小于当前PE值的数量
      let lowerCount = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) lowerCount++;
      }
      
      // 计算百分位
      const percentile = (lowerCount / peValues.length) * 100;
      
      // 计算不同百分位的PE值
      const sortedPeValues = [...peValues].sort((a, b) => a - b);
      const percentileValues = {
        '0': sortedPeValues[0].toFixed(2), // 最小值
        '10': this.getPercentileValue(sortedPeValues, 10).toFixed(2),
        '25': this.getPercentileValue(sortedPeValues, 25).toFixed(2),
        '50': this.getPercentileValue(sortedPeValues, 50).toFixed(2), // 中位数
        '75': this.getPercentileValue(sortedPeValues, 75).toFixed(2),
        '90': this.getPercentileValue(sortedPeValues, 90).toFixed(2),
        '100': sortedPeValues[sortedPeValues.length - 1].toFixed(2) // 最大值
      };
      
      // 获取数据样本（随机10条，然后按日期排序）
      const shuffledData = [...recentData].sort(() => 0.5 - Math.random()).slice(0, 10);
      const dataSample = shuffledData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 设置模态框数据
      this.fiveYearPercentileModal = {
        show: true,
        code: item.code,
        name: item.name,
        currentPE: currentPEValue.toFixed(2),
        originalPE: item.currentPE,
        zsPE: zsPE,
        usedZsPE: usedZsPE,
        percentile: percentile.toFixed(0),
        calculationDetails: {
          startDate: fiveYearsAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          dataCount: peValues.length,
          lowerCount: lowerCount,
          percentileValues: percentileValues,
          dataSample: dataSample.map(item => ({
            date: item.date,
            pe: parseFloat(item.pe).toFixed(2)
          }))
        }
      };
    },
    // 显示十年百分位计算详情模态框
    showTenYearPercentileModal(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return;
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return;
      
      // 计算十年前的日期
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      
      // 过滤出十年内的数据
      const recentData = arr.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= tenYearsAgo;
      });
      
      if (recentData.length === 0) return;
      
      // 提取有效的PE值
      const peValues = recentData.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return;
      
      // 计算当前PE值在历史数据中的百分位
      let currentPEValue = parseFloat(item.currentPE);
      if (isNaN(currentPEValue)) return;
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      let usedZsPE = false;
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
        usedZsPE = true;
      }
      
      // 统计小于当前PE值的数量
      let lowerCount = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) lowerCount++;
      }
      
      // 计算百分位
      const percentile = (lowerCount / peValues.length) * 100;
      
      // 计算不同百分位的PE值
      const sortedPeValues = [...peValues].sort((a, b) => a - b);
      const percentileValues = {
        '0': sortedPeValues[0].toFixed(2), // 最小值
        '10': this.getPercentileValue(sortedPeValues, 10).toFixed(2),
        '25': this.getPercentileValue(sortedPeValues, 25).toFixed(2),
        '50': this.getPercentileValue(sortedPeValues, 50).toFixed(2), // 中位数
        '75': this.getPercentileValue(sortedPeValues, 75).toFixed(2),
        '90': this.getPercentileValue(sortedPeValues, 90).toFixed(2),
        '100': sortedPeValues[sortedPeValues.length - 1].toFixed(2) // 最大值
      };
      
      // 获取数据样本（随机10条，然后按日期排序）
      const shuffledData = [...recentData].sort(() => 0.5 - Math.random()).slice(0, 10);
      const dataSample = shuffledData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 设置模态框数据
      this.tenYearPercentileModal = {
        show: true,
        code: item.code,
        name: item.name,
        currentPE: currentPEValue.toFixed(2),
        originalPE: item.currentPE,
        zsPE: zsPE,
        usedZsPE: usedZsPE,
        percentile: percentile.toFixed(0),
        calculationDetails: {
          startDate: tenYearsAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          dataCount: peValues.length,
          lowerCount: lowerCount,
          percentileValues: percentileValues,
          dataSample: dataSample.map(item => ({
            date: item.date,
            pe: parseFloat(item.pe).toFixed(2)
          }))
        }
      };
    },
    // 显示历史百分位计算详情模态框
    showHistoryPercentileModal(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return;
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return;
      
      // 提取有效的PE值
      const peValues = arr.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return;
      
      // 计算当前PE值在历史数据中的百分位
      let currentPEValue = parseFloat(item.currentPE);
      if (isNaN(currentPEValue)) return;
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      let usedZsPE = false;
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
        usedZsPE = true;
      }
      
      // 统计小于当前PE值的数量
      let lowerCount = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) lowerCount++;
      }
      
      // 计算百分位
      const percentile = (lowerCount / peValues.length) * 100;
      
      // 计算不同百分位的PE值
      const sortedPeValues = [...peValues].sort((a, b) => a - b);
      const percentileValues = {
        '0': sortedPeValues[0].toFixed(2), // 最小值
        '10': this.getPercentileValue(sortedPeValues, 10).toFixed(2),
        '25': this.getPercentileValue(sortedPeValues, 25).toFixed(2),
        '50': this.getPercentileValue(sortedPeValues, 50).toFixed(2), // 中位数
        '75': this.getPercentileValue(sortedPeValues, 75).toFixed(2),
        '90': this.getPercentileValue(sortedPeValues, 90).toFixed(2),
        '100': sortedPeValues[sortedPeValues.length - 1].toFixed(2) // 最大值
      };
      
      // 获取数据样本（随机10条，然后按日期排序）
      const shuffledData = [...arr].sort(() => 0.5 - Math.random()).slice(0, 10);
      const dataSample = shuffledData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 获取日期范围
      const dates = arr.map(item => new Date(item.date)).filter(date => !isNaN(date));
      const startDate = new Date(Math.min(...dates));
      const endDate = new Date(Math.max(...dates));
      
      // 设置模态框数据
      this.historyPercentileModal = {
        show: true,
        code: item.code,
        name: item.name,
        currentPE: currentPEValue.toFixed(2),
        originalPE: item.currentPE,
        zsPE: zsPE,
        usedZsPE: usedZsPE,
        percentile: percentile.toFixed(0),
        calculationDetails: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dataCount: peValues.length,
          lowerCount: lowerCount,
          percentileValues: percentileValues,
          dataSample: dataSample.map(item => ({
            date: item.date,
            pe: parseFloat(item.pe).toFixed(2)
          }))
        }
      };
    },
    // 计算指定百分位的PE值
    getPercentileValue(sortedArray, percentile) {
      if (sortedArray.length === 0) return 0;
      
      const index = (percentile / 100) * (sortedArray.length - 1);
      const lowerIndex = Math.floor(index);
      const upperIndex = Math.ceil(index);
      
      if (lowerIndex === upperIndex) {
        return sortedArray[lowerIndex];
      }
      
      // 线性插值
      const weight = index - lowerIndex;
      return sortedArray[lowerIndex] * (1 - weight) + sortedArray[upperIndex] * weight;
    },
    // 计算历史百分位用于主页显示（与详情页面逻辑一致）
    getHistoryPercentileForDisplay(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '--';
      
      const arr = this.rawPeData[peKey];
      if (arr.length === 0) return '--';
      
      // 提取有效的PE值
      const peValues = arr.map(item => parseFloat(item.pe)).filter(pe => !isNaN(pe));
      if (peValues.length === 0) return '--';
      
      // 计算当前PE值在历史数据中的百分位
      let currentPEValue = parseFloat(item.currentPE);
      if (isNaN(currentPEValue)) return '--';
      
      // 获取zs市盈率
      const zsPE = this.getLatestPe(peKey);
      
      // 检查是否需要使用zs市盈率代替TX市盈率
      // 条件1: TX市盈率为0
      // 条件2: TX市盈率与zs市盈率差距在10%以上
      if (currentPEValue === 0 || (zsPE !== '--' && Math.abs((currentPEValue - parseFloat(zsPE)) / parseFloat(zsPE)) * 100 > 10)) {
        currentPEValue = parseFloat(zsPE);
      }
      
      // 如果无法获取有效的PE值，返回'--'
      if (isNaN(currentPEValue) || currentPEValue === 0) return '--';
      
      // 统计小于当前PE值的数量
      let count = 0;
      for (let i = 0; i < peValues.length; i++) {
        if (peValues[i] < currentPEValue) count++;
      }
      
      // 计算百分位
      const percentile = (count / peValues.length) * 100;
      return percentile.toFixed(0);
    },
    // 获取五年百分位的颜色
    getFiveYearPercentileColor(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '';
      
      const percentileValue = this.getFiveYearPercentile(item.currentPE, peKey);
      if (percentileValue === '--') return '';
      
      const percentile = parseFloat(percentileValue);
      if (isNaN(percentile)) return '';
      
      if (percentile < 25) return '#90ee90'; // 绿色
      if (percentile > 75) return '#ff4d4f'; // 红色
      return '';
    },
    // 获取历史百分位的颜色
    getHistoryPercentileColor(item) {
      const percentileValue = this.getHistoryPercentileForDisplay(item);
      if (percentileValue === '--') return '';
      
      const percentile = parseFloat(percentileValue);
      if (isNaN(percentile)) return '';
      
      if (percentile < 25) return '#90ee90'; // 绿色
      if (percentile > 75) return '#ff4d4f'; // 红色
      return '';
    },
    // 获取十年百分位的颜色
    getTenYearPercentileColor(item) {
      const peKey = this.codeToPeKey(item.code);
      if (!this.rawPeData || !this.rawPeData[peKey] || !Array.isArray(this.rawPeData[peKey])) return '';
      
      const percentileValue = this.getTenYearPercentile(item.currentPE, peKey);
      if (percentileValue === '--') return '';
      
      const percentile = parseFloat(percentileValue);
      if (isNaN(percentile)) return '';
      
      if (percentile < 25) return '#90ee90'; // 绿色
      if (percentile > 75) return '#ff4d4f'; // 红色
      return '';
    },
    // 计算建议仓位
    calculateSuggestedPosition(item) {
      try {
        // 直接使用表格中显示的百分位值
        const fiveYearPercentile = parseFloat(this.getFiveYearPercentile(item.currentPE, this.codeToPeKey(item.code))) || 0;
        const tenYearPercentile = parseFloat(this.getTenYearPercentile(item.currentPE, this.codeToPeKey(item.code))) || 0;
        const historyPercentile = parseFloat(this.getHistoryPercentileForDisplay(item)) || 0;
        
        // 计算综合百分位（加权平均）
        const combinedPercentile = (fiveYearPercentile * 0.6) + (tenYearPercentile * 0.3) + (historyPercentile * 0.1);
        
        // 计算建议仓位（1 - 综合百分位）
        const suggestedPosition = 1 - (combinedPercentile / 100);
        
        // 转换为百分比显示
        return (suggestedPosition * 100).toFixed(0) + '%';
      } catch (error) {
        console.error('计算建议仓位时出错:', error);
        return 'N/A';
      }
    },
    // 显示建议仓位计算详情模态框
    showSuggestedPositionModal(item) {
      // 获取各项百分位数据
      const fiveYearPercentile = this.getFiveYearPercentile(item.currentPE, this.codeToPeKey(item.code));
      const tenYearPercentile = this.getTenYearPercentile(item.currentPE, this.codeToPeKey(item.code));
      const historyPercentile = this.getHistoryPercentileForDisplay(item);
      
      // 计算综合百分位（加权平均）
      const fiveYearValue = parseFloat(fiveYearPercentile) || 0;
      const tenYearValue = parseFloat(tenYearPercentile) || 0;
      const historyValue = parseFloat(historyPercentile) || 0;
      const combinedPercentile = (fiveYearValue * 0.6) + (tenYearValue * 0.3) + (historyValue * 0.1);
      
      // 计算建议仓位（1 - 综合百分位）
      const suggestedPositionValue = 1 - (combinedPercentile / 100);
      const suggestedPosition = (suggestedPositionValue * 100).toFixed(0);
      
      // 设置模态框数据
      this.suggestedPositionModal = {
        show: true,
        code: item.code,
        name: item.name,
        currentPE: item.currentPE,
        suggestedPosition: suggestedPosition + '%',
        calculationDetails: {
          fiveYearPercentile: fiveYearPercentile,
          tenYearPercentile: tenYearPercentile,
          historyPercentile: historyPercentile,
          combinedPercentile: combinedPercentile.toFixed(0),
          finalPosition: suggestedPosition
        }
      };
    },
    // 根据指数代码获取指数名称
    getIndexNameByCode(code) {
      if (!code) return '';
      const index = this.indexData.find(item => item.code === code);
      return index ? `${index.name} (${index.code})` : code;
    },
    // 计算持仓的建议仓位（关联指数的建议仓位 × 0.15）
    calculatePositionSuggestedPosition(position) {
      if (!position.relatedIndex) return '--';
      
      // 找到关联的指数数据
      const relatedIndex = this.indexData.find(item => item.code === position.relatedIndex);
      if (!relatedIndex) return '--';
      
      try {
        // 获取关联指数的建议仓位
        const indexSuggestedPositionStr = this.calculateSuggestedPosition(relatedIndex);
        
        // 去掉百分号并转换为数字
        const indexSuggestedPosition = parseFloat(indexSuggestedPositionStr.replace('%', ''));
        
        if (isNaN(indexSuggestedPosition)) return '--';
        
        // 计算持仓建议仓位（关联指数的建议仓位 × 0.15）
        const positionSuggestedPosition = indexSuggestedPosition * 0.15;
        
        // 转换为百分比显示
        return positionSuggestedPosition.toFixed(2) + '%';
      } catch (error) {
       console.error('计算持仓建议仓位时出错:', error);
       return '--';
     }
   }, // 根据建议仓位值返回颜色
   getSuggestedPositionColor(item) {
     try {
        // 直接使用表格中显示的百分位值
        const fiveYearPercentile = parseFloat(this.getFiveYearPercentile(item.currentPE, this.codeToPeKey(item.code))) || 0;
        const tenYearPercentile = parseFloat(this.getTenYearPercentile(item.currentPE, this.codeToPeKey(item.code))) || 0;
        const historyPercentile = parseFloat(this.getHistoryPercentileForDisplay(item)) || 0;
        
        // 计算综合百分位（加权平均）
        const combinedPercentile = (fiveYearPercentile * 0.6) + (tenYearPercentile * 0.3) + (historyPercentile * 0.1);
        
        // 计算建议仓位（1 - 综合百分位）
        const suggestedPosition = 1 - (combinedPercentile / 100);
        
        // 转换为百分比数值
        const suggestedPositionPercent = suggestedPosition * 100;
        
        // 根据条件返回颜色
        if (suggestedPositionPercent > 75) {
          return '#90ee90'; // 绿色
        } else if (suggestedPositionPercent < 25) {
          return '#ff4d4f'; // 红色
        } else {
          return ''; // 无背景色
        }
      } catch (error) {
        console.error('计算建议仓位颜色时出错:', error);
        return ''; // 出错时无背景色
      }
    },
    // 判断持仓比例单元格是否需要标黄
    getPositionRatioStyle(item) {
      if (this.totalPositionValue <= 0) return {};
      
      // 计算持仓比例
      const positionValue = item.amount * (item.category === '现金' ? 1 : (item.currentPrice || 0));
      const ratio = (positionValue / this.totalPositionValue) * 100;
      
      // 检查是否满足仓位限制条件
      let exceedsPositionLimit = false;
      // 条件1: 如果对应分类为A股个股的比例大于4%时
      if (item.subCategory === 'A股个股' && ratio > 4) {
        exceedsPositionLimit = true;
      }
      // 条件2: 如果对应分类为权益类且不是A股个股，比例大于15%时
      if (item.category === '权益类' && item.subCategory !== 'A股个股' && ratio > 15) {
        exceedsPositionLimit = true;
      }
      
      // 检查是否满足建议仓位与实际比例相差4%以上
      let exceedsSuggestedDiff = false;
      if (item.relatedIndex) {
        const suggestedPositionStr = this.calculatePositionSuggestedPosition(item);
        if (suggestedPositionStr !== '--') {
          const suggestedPosition = parseFloat(suggestedPositionStr.replace('%', ''));
          if (!isNaN(suggestedPosition)) {
            const diff = Math.abs(ratio - suggestedPosition);
            if (diff >= 4) {
              exceedsSuggestedDiff = true;
            }
          }
        }
      }
      
      // 根据条件组合返回不同颜色
      if (exceedsPositionLimit && exceedsSuggestedDiff) {
        // 同时满足两个条件，使用浅红色表示最严重的情况
        return { backgroundColor: '#ff7875', color: 'white' };
      } else if (exceedsPositionLimit) {
        // 只满足仓位限制条件，使用橙色
        return { backgroundColor: '#ffa940', color: 'black' };
      } else if (exceedsSuggestedDiff) {
        // 只满足建议仓位差异条件，使用浅黄色
        return { backgroundColor: '#fff7e6', color: 'black' };
      }
      
      return {};
    }
  },
  mounted() {
    chrome.storage.local.get([
      'todayTemp', 'dateDegreeDB', 'haomai_today-temp', 'indexData', 'all_pe_data', 'haomai_date', 'positions', 'positionSortByRatio', 'temperaturePositionTable'
    ], (result) => {
      console.log('读取到的indexData:', result.indexData);
      console.log('读取到的pe_values:', result.all_pe_data);
      let arr = [];
      if (Array.isArray(result.indexData)) {
        arr = result.indexData;
      } else if (typeof result.indexData === 'object' && result.indexData !== null) {
        // 可能是 {0: {...}, 1: {...}} 这种对象
        arr = Object.values(result.indexData);
      }
      this.indexData = arr.map(item => {
        // 迁移旧数据中的viewPoint到currentIndexPoint
        if (item.viewPoint !== undefined) {
          return { ...item, currentIndexPoint: item.viewPoint, viewPoint: undefined };
        }
        return item;
      });
      this.temperatureData[1].temperature = result['haomai_today-temp'] ? `${result['haomai_today-temp']}` : 'N/A';
      if (result.todayTemp) {
        this.todayTempValue = parseFloat(result.todayTemp);
        this.temperatureData[0].temperature = `${result.todayTemp}`;
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
            this.temperatureData[0][date] = `${record.degree}`;
            this.temperatureData[0][`${date}_isNext`] = false;
          } else {
            const targetDate = new Date(date.replace(/\./g, '-'));
            const nextRecord = sortedData.find(item => {
              return new Date(item.date.replace(/\./g, '-')) > targetDate;
            });
            if (nextRecord) {
              this.temperatureData[0][date] = `${nextRecord.degree}`;
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
      if (result.haomai_date) {
        this.haomaiDate = result.haomai_date;
      }
      if (Array.isArray(result.positions)) {
        this.positions = result.positions;
      } else if (typeof result.positions === 'object' && result.positions !== null) {
        this.positions = Object.values(result.positions);
      } else {
        this.positions = [];
      }
      // 处理pe历史数据
      if (result.all_pe_data && typeof result.all_pe_data === 'object') {
        this.peValuesMap = {};
        Object.keys(result.all_pe_data).forEach(code => {
          this.peValuesMap[code] = result.all_pe_data[code].map(item => parseFloat(item.pe)).filter(v => !isNaN(v));
        });
      }
      // 保留原始pe数据
      if (result.all_pe_data && typeof result.all_pe_data === 'object') {
        this.rawPeData = result.all_pe_data;
      }
      console.log('storage.positions:', this.positions);
      // 保存原始顺序
      this.originalPositions = this.positions.slice();

      // 恢复排序状态
      if (result.positionSortByRatio) {
        this.positionSortByRatio = true;
        // 只排序，不反转
        this.positions.sort((a, b) => {
          const aValue = a.amount * (a.category === '现金' ? 1 : (a.currentPrice || 0));
          const bValue = b.amount * (b.category === '现金' ? 1 : (b.currentPrice || 0));
          return bValue - aValue;
        });
      } else {
        this.positionSortByRatio = false;
        this.positions = this.originalPositions.slice();
      }
      
      // 加载温度-仓位对照表数据
      console.log('尝试加载温度-仓位对照表:', result.temperaturePositionTable);
      let loadedTable = result.temperaturePositionTable;
      
      // 如果loadedTable是一个类数组对象（例如 {0: {...}, 1: {...}}），则转换为数组
      if (loadedTable && typeof loadedTable === 'object' && !Array.isArray(loadedTable)) {
        // 检查是否所有键都是数字字符串或数字, 且从0开始连续
        const keys = Object.keys(loadedTable).map(Number).sort((a, b) => a - b);
        const isSequential = keys.length > 0 && keys[0] === 0 && keys.every((key, index) => key === index);
        
        if (isSequential) {
          loadedTable = Array.from({length: keys.length}, (_, i) => loadedTable[i]);
          console.log('已将类数组对象转换为数组:', loadedTable);
        } else {
          // 如果键不连续，则直接使用Object.values
          loadedTable = Object.values(loadedTable);
          console.log('已将对象的值转换为数组:', loadedTable);
        }
      }
      
      if (loadedTable && Array.isArray(loadedTable) && loadedTable.length > 0) {
        // 验证数组中的每个元素是否具有 temperature 和 position 属性
        const isValidFormat = loadedTable.every(item =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.temperature === 'number' &&
          typeof item.position === 'number'
        );
        
        if (isValidFormat) {
          this.temperaturePositionTable = loadedTable;
          console.log('成功加载温度-仓位对照表:', this.temperaturePositionTable);
        } else {
          console.warn('存储中的温度-仓位对照表数据格式不正确，使用默认值');
        }
      } else {
        console.log('存储中没有有效的温度-仓位对照表数据，使用默认值');
      }
      
      // 标记温度-仓位对照表数据已加载
      this.isTemperaturePositionTableLoaded = true;
      
      // 初始化图表（如果Chart.js已经加载）
      if (typeof Chart !== 'undefined') {
        this.$nextTick(() => {
          this.initTemperaturePositionChart();
        });
      }
    });
    this.$watch(
      () => this.positions.map(item => item.amount * (item.category === '现金' ? 1 : (item.currentPrice || 0))),
      (values) => {
        this.totalPositionValue = values.reduce((sum, v) => sum + v, 0);
      },
      { immediate: true, deep: true }
    );
    
    // 页面加载完成后自动更新行情
    // 延迟2秒执行，确保数据加载完成
    setTimeout(() => {
      this.updateMarket();
    }, 2000);
    
    // 引入并初始化 Chart.js
    const script = document.createElement('script');
    script.src = '/js/chart.js';
    script.onload = () => {
      // Chart.js 已加载，可以在这里初始化图表
      console.log('Chart.js loaded');
      this.initTemperaturePositionChart();
    };
    document.head.appendChild(script);
  },
  computed: {
    suggestedPositionAH() {
      try {
        // 检查数据是否已加载
        if (!this.temperatureData || this.temperatureData.length < 2) {
          console.log('温度数据尚未加载');
          return 'N/A';
        }
        
        // 获取有知有行数据和好买温度
        const youzhiyouxingData = this.temperatureData[0]; // 有知有行数据
        const haomaiData = this.temperatureData[1]; // 好买温度
        
        // 检查数据对象是否存在
        if (!youzhiyouxingData || !haomaiData) {
          console.log('温度数据对象不存在');
          return 'N/A';
        }
        
        // 获取今日温度值
        const youzhiyouxingTemp = parseFloat(youzhiyouxingData.temperature);
        const haomaiTemp = parseFloat(haomaiData.temperature);
        
        // 调试信息
        console.log('有知有行温度:', youzhiyouxingData.temperature, '转换后:', youzhiyouxingTemp);
        console.log('好买温度:', haomaiData.temperature, '转换后:', haomaiTemp);
        
        // 检查数据是否有效
        if (isNaN(youzhiyouxingTemp) || isNaN(haomaiTemp)) {
          console.log('温度数据无效，返回N/A');
          return 'N/A';
        }
        
        // 计算平均温度
        const avgTemperature = (youzhiyouxingTemp + haomaiTemp) / 2;
        
        // 使用温度-仓位对照表进行线性插值计算
        const suggestedPosition = this.calculatePositionFromTable(avgTemperature);
        
        // 转换为百分比显示
        return suggestedPosition.toFixed(0) + '%';
      } catch (error) {
        console.error('计算建议仓位时出错:', error);
        return 'N/A';
      }
    },
    // 计算各大类持仓比例
    categoryRatios() {
      const ratios = {};
      // 初始化各大类
      this.categoryOptions.forEach(category => {
        ratios[category.label] = 0;
      });
      
      // 计算各大类持仓价值
      this.positions.forEach(position => {
        const value = position.amount * (position.category === '现金' ? 1 : (position.currentPrice || 0));
        if (ratios.hasOwnProperty(position.category)) {
          ratios[position.category] += value;
        }
      });
      
      // 转换为百分比
      Object.keys(ratios).forEach(key => {
        ratios[key] = this.totalPositionValue > 0 ? ((ratios[key] / this.totalPositionValue) * 100).toFixed(2) : '0.00';
      });
      
      return ratios;
    },
    // 计算各小类持仓比例
    subCategoryRatios() {
      const ratios = {};
      
      // 计算各小类持仓价值
      this.positions.forEach(position => {
        // 构造key，格式为"大类-小类"
        const key = position.subCategory ? `${position.category}-${position.subCategory}` : position.category;
        const value = position.amount * (position.category === '现金' ? 1 : (position.currentPrice || 0));
        if (ratios.hasOwnProperty(key)) {
          ratios[key] += value;
        } else {
          ratios[key] = value;
        }
      });
      
      // 转换为百分比
      Object.keys(ratios).forEach(key => {
        ratios[key] = this.totalPositionValue > 0 ? ((ratios[key] / this.totalPositionValue) * 100).toFixed(2) : '0.00';
      });
      
      return ratios;
    },
    // 过滤掉"现金-现金"的小类分布，并按categoryOptions定义的顺序排序
    filteredSubCategoryRatios() {
      // 先过滤掉"现金-现金"
      const filtered = {};
      Object.keys(this.subCategoryRatios).forEach(key => {
        // 过滤掉"现金-现金"
        if (key !== '现金-现金') {
          filtered[key] = this.subCategoryRatios[key];
        }
      });
    
      // 创建一个映射，用于确定每个分类的顺序
      const categoryOrder = {};
      const subCategoryOrder = {};
      
      this.categoryOptions.forEach((category, categoryIndex) => {
        categoryOrder[category.label] = categoryIndex;
        if (category.children) {
          category.children.forEach((subCategory, subCategoryIndex) => {
            subCategoryOrder[`${category.label}-${subCategory.value}`] = subCategoryIndex;
          });
        }
      });
    
      // 转换为数组并排序
      const sortedEntries = Object.entries(filtered).sort(([keyA], [keyB]) => {
        // 分离大类和小类
        const [categoryA, subCategoryA = ''] = keyA.includes('-') ? keyA.split('-') : [keyA, ''];
        const [categoryB, subCategoryB = ''] = keyB.includes('-') ? keyB.split('-') : [keyB, ''];
        
        // 获取大类的顺序
        const orderA = categoryOrder[categoryA] !== undefined ? categoryOrder[categoryA] : Infinity;
        const orderB = categoryOrder[categoryB] !== undefined ? categoryOrder[categoryB] : Infinity;
        
        // 如果大类不同，按大类排序
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // 如果大类相同，按小类排序
        const subOrderA = subCategoryOrder[keyA] !== undefined ? subCategoryOrder[keyA] : Infinity;
        const subOrderB = subCategoryOrder[keyB] !== undefined ? subCategoryOrder[keyB] : Infinity;
        
        return subOrderA - subOrderB;
      });
    
      // 转换回对象
      const sortedObject = {};
      sortedEntries.forEach(([key, value]) => {
        sortedObject[key] = value;
      });
    
      return sortedObject;
    },
    // 计算权益类中A股的合计比例
    equityAStockRatio() {
      // 计算以下几类的合计比例：
      // 权益类-A股个股
      // 权益类-A股大盘ETF
      // 权益类-A股中小盘ETF
      // 权益类-A股行业ETF
      // 权益类-A股价值ETF
      const aStock = parseFloat(this.subCategoryRatios['权益类-A股个股']) || 0;
      const aStockLargeETF = parseFloat(this.subCategoryRatios['权益类-A股大盘ETF']) || 0;
      const aStockSmallMediumETF = parseFloat(this.subCategoryRatios['权益类-A股中小盘ETF']) || 0;
      const aStockSectorETF = parseFloat(this.subCategoryRatios['权益类-A股行业ETF']) || 0;
      const aStockValueETF = parseFloat(this.subCategoryRatios['权益类-A股价值ETF']) || 0;
      return (aStock + aStockLargeETF + aStockSmallMediumETF + aStockSectorETF + aStockValueETF).toFixed(2);
    },
    // 判断权益类-A股ETF+A股个股比例与建议仓位差距是否大于10%
    shouldHighlightEquityAStock() {
      const equityAStockRatio = parseFloat(this.equityAStockRatio) || 0;
      const suggestedPosition = parseFloat(this.suggestedPositionAH.replace('%', '')) || 0;
      const diff = Math.abs(equityAStockRatio - suggestedPosition);
      return diff > 10;
    }
  }
}
</script>

<style scoped>
.table-container {
  padding: 8px;
  font-family: Arial, sans-serif;
}

.temperature-table {
  width: 100%;
  max-width: 900px; /* 限制最大宽度 */
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 14px; /* 恢复原来字体大小 */
  margin-bottom: 20px;
}

.temperature-table th,
.temperature-table td {
  padding: 4px 6px; /* 减小内边距 */
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.temperature-table th {
  background-color: #42b983;
  color: white;
  font-weight: bold;
  font-size: 14px; /* 增大表头字体大小 */
}

.temperature-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.temperature-table tr:hover {
  background-color: #f0f8ff;
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
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background-color: #42b983;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.data-table tr:hover {
  background-color: #f0f8ff;
}

.hold-table {
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 14px;
  margin-bottom: 20px;
}

.hold-table th,
.hold-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.hold-table th {
  background-color: #42b983;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.hold-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.hold-table tr:hover {
  background-color: #f0f8ff;
}

.hold-table td:first-child {
  font-weight: bold;
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 10px;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-buttons button {
  margin-bottom: 0; /* 去掉按钮下边距 */
  white-space: nowrap; /* 防止按钮文字换行 */
  padding: 4px 10px;
  font-size: 12px;
}
  /* 自定义提示框样式 */
  .custom-tooltip {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none; /* 防止提示框干扰鼠标事件 */
    white-space: nowrap;
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
.th, td {
  padding: 6px;
  text-align: left;
}
th {
  padding: 8px 15px;
  font-size: 11px;
}
</style>
