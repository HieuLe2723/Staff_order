// Chart configurations
function initializeCharts(stats) {
  // Initialize data arrays
  const labels = [];
  const revenueData = [];
  const orderData = [];

  // Get data from stats
  if (stats && stats.recentReports && stats.recentReports.length > 0) {
    stats.recentReports.forEach(function(report) {
      labels.push(report.ngay_bao_cao);
      revenueData.push(report.tong_doanh_thu);
      orderData.push(report.tong_don_hang);
    });
  }

  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  const revenueChart = new Chart(revenueCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tổng Doanh Thu (VND)',
        data: revenueData,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: false
        }
      }
    }
  });

  // Order Chart
  const orderCtx = document.getElementById('orderChart').getContext('2d');
  const orderChart = new Chart(orderCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số Lượng Đơn Hàng',
        data: orderData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: false
        }
      }
    }
  });

  // Update chart data based on time period
  function updateChart(period) {
    const chart = Chart.getChart('revenueChart');
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = revenueData;
      chart.update();
    }
  }

  function updateOrderChart(period) {
    const chart = Chart.getChart('orderChart');
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = orderData;
      chart.update();
    }
  }

  return {
    updateChart,
    updateOrderChart
  };
}
