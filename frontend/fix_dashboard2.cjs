const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.vue');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the renderChart function
const renderChartNew = `/**
 * 娓叉煋鍥捐〃
 */
const renderChart = (data) => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const chartData = data.map(item => ({
    name: item.grade + '级',
    value: item.count
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}人'
      },
      data: chartData,
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
    }]
  }

  chartInstance.setOption(option)
}`;

// Find the start and end of the renderChart function
const startMarker = '/**\n * 娓叉煋鍥捐〃\n */\nconst renderChart';
const endMarker = '}\n\n/**\n * 娓叉煋鎴愮哗鍒嗗竷鍥捐〃\n */';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + renderChartNew + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed renderChart function!');
} else {
  console.log('Could not find function boundaries');
  console.log('Start found:', startIndex);
  console.log('End found:', endIndex);
}
