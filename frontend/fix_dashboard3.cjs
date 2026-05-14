const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.vue');
let content = fs.readFileSync(filePath, 'utf8');

// Find the renderChart function by looking for the opening pattern
const regex = /const renderChart = \(data\) => \{[\s\S]*?\n\/\*\*\n \* 娓叉煋鎴愮哗/;
const match = content.match(regex);

if (match) {
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

/**`;

  content = content.replace(regex, newFunction);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed renderChart function!');
} else {
  console.log('Could not find renderChart function');
  // Show what we're looking for
  const idx = content.indexOf('const renderChart');
  if (idx !== -1) {
    console.log('Found at index:', idx);
    console.log('Context:', content.substring(idx, idx + 200));
  }
}
