const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.vue');
const content = fs.readFileSync(filePath, 'utf8');

// Get the position of the renderChart function
const startPos = content.indexOf('const renderChart = (data) => {');
const endPos = content.indexOf('/**\n * 娓叉煋鎴愮哗');

if (startPos === -1 || endPos === -1) {
  console.log('Cannot find positions');
  console.log('start:', startPos, 'end:', endPos);
  process.exit(1);
}

// Read the beginning of the file
const beginning = content.substring(0, startPos);

// Read the end of the file (after the renderChart function)
const afterEndPos = content.indexOf('const renderScoreChart', endPos);
const ending = content.substring(afterEndPos);

// The new renderChart function (clean version)
const newFunction = `const renderChart = (data) => {
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
}

`;

const newContent = beginning + newFunction + ending;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully fixed renderChart function!');
