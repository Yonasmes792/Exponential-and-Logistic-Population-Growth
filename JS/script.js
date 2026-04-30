document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.math-block').forEach(block => {
        const expression = block.textContent.trim();
        katex.render(expression, block, {
            displayMode: true,
            throwOnError: false
        });
    });
});

const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    updateChartThemes();
});

let expChart, logChart;

function getThemeColors() {
    const styles = getComputedStyle(document.body);
    return {
        text: styles.getPropertyValue('--text-color').trim(),
        grid: styles.getPropertyValue('--chart-grid').trim()
    };
}

function initCharts() {
    const colors = getThemeColors();
    Chart.defaults.color = colors.text;
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    const expCtx = document.getElementById('exponentialChart').getContext('2d');
    expChart = new Chart(expCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Population (Unlimited Resources)',
                data: [],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: getChartOptions('Time (h)', 'Cell Count')
    });

    const logCtx = document.getElementById('logisticChart').getContext('2d');
    logChart = new Chart(logCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Population (Subject to Environmental Constraints)',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: getChartOptions('Time (h)', 'Cell Count')
    });

    calculateExponential();
    calculateLogistic();
}

function getChartOptions(xTitle, yTitle) {
    const colors = getThemeColors();
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: xTitle, color: colors.text }, grid: { color: colors.grid } },
            y: { beginAtZero: true, title: { display: true, text: yTitle, color: colors.text }, grid: { color: colors.grid } }
        },
        plugins: {
            legend: { labels: { color: colors.text } },
            tooltip: { intersect: false, mode: 'index' }
        }
    };
}

function updateChartThemes() {
    const colors = getThemeColors();
    Chart.defaults.color = colors.text;
    
    [expChart, logChart].forEach(chart => {
        chart.options.scales.x.title.color = colors.text;
        chart.options.scales.x.grid.color = colors.grid;
        chart.options.scales.y.title.color = colors.text;
        chart.options.scales.y.grid.color = colors.grid;
        chart.options.plugins.legend.labels.color = colors.text;
        
        if (chart.data.datasets[1]) {
            chart.data.datasets[1].backgroundColor = colors.text;
            chart.data.datasets[1].borderColor = colors.text;
        }
        
        chart.update();
    });
}

function calculateExponential() {
    const P0 = parseFloat(document.getElementById('exp-P0').value) || 0;
    const k = parseFloat(document.getElementById('exp-k').value) || 0;
    const t_val = parseFloat(document.getElementById('exp-t').value) || 0;

    const maxT = Math.max(60, Math.ceil(t_val * 1.2));
    const labels = Array.from({length: maxT + 1}, (_, i) => i);
    
    const expData = labels.map(t => P0 * Math.exp(k * t));
    const exactVal = P0 * Math.exp(k * t_val);
    const pointData = labels.map(t => t === Math.round(t_val) ? exactVal : null);

    expChart.data.labels = labels;
    expChart.data.datasets[0].data = expData;

    const colors = getThemeColors();

    if (!expChart.data.datasets[1]) {
        expChart.data.datasets.push({
            label: 'Selected Time (t)',
            data: pointData,
            backgroundColor: colors.text,
            borderColor: colors.text,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false
        });
    } else {
        expChart.data.datasets[1].data = pointData;
    }

    expChart.update();

    document.getElementById('exp-out-t').innerText = t_val;
    document.getElementById('exp-calc-output').innerText = exactVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateLogistic() {
    const M = parseFloat(document.getElementById('log-M').value) || 0;
    const K = parseFloat(document.getElementById('log-K').value) || 0;
    const k = parseFloat(document.getElementById('log-k').value) || 0;
    const t_val = parseFloat(document.getElementById('log-t').value) || 0;

    const maxT = Math.max(60, Math.ceil(t_val * 1.2));
    const labels = Array.from({length: maxT + 1}, (_, i) => i);

    const logData = labels.map(t => M / (1 + K * Math.exp(-k * t)));
    const exactVal = M / (1 + K * Math.exp(-k * t_val));
    const pointData = labels.map(t => t === Math.round(t_val) ? exactVal : null);

    logChart.data.labels = labels;
    logChart.data.datasets[0].data = logData;

    const colors = getThemeColors();

    if (!logChart.data.datasets[1]) {
        logChart.data.datasets.push({
            label: 'Selected Time (t)',
            data: pointData,
            backgroundColor: colors.text,
            borderColor: colors.text,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false
        });
    } else {
        logChart.data.datasets[1].data = pointData;
    }

    logChart.update();

    document.getElementById('log-out-t').innerText = t_val;
    document.getElementById('log-calc-output').innerText = exactVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

document.getElementById('expCalcBtn').addEventListener('click', calculateExponential);
document.querySelectorAll('#exp-P0, #exp-k, #exp-t').forEach(el => el.addEventListener('input', calculateExponential));

document.getElementById('logCalcBtn').addEventListener('click', calculateLogistic);
document.querySelectorAll('#log-M, #log-K, #log-k, #log-t').forEach(el => el.addEventListener('input', calculateLogistic));

window.onload = initCharts;