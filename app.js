const STORAGE_KEY = "fitness_records_v1";

const form = document.getElementById("record-form");
const listElement = document.getElementById("record-list");
const messageElement = document.getElementById("message");
const averageElement = document.getElementById("average-summary");

let records = loadRecords();
renderRecords();
setDefaultDate();

form.addEventListener("submit", function handleSubmit(event) {
  event.preventDefault();

  const newRecord = {
    date: form.date.value,
    weight: Number(form.weight.value),
    waist: Number(form.waist.value),
    calories: Number(form.calories.value),
    protein: Number(form.protein.value),
  };

  if (!isValidRecord(newRecord)) {
    showMessage("请完整填写所有字段，且数值不能小于 0。", "error");
    return;
  }

  records.unshift(newRecord);
  saveRecords(records);
  renderRecords();
  form.reset();
  setDefaultDate();
  showMessage("记录已保存。", "success");
});

function isValidRecord(record) {
  if (!record.date) {
    return false;
  }

  const values = [record.weight, record.waist, record.calories, record.protein];
  return values.every(function (value) {
    return Number.isFinite(value) && value >= 0;
  });
}

function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveRecords(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderRecords() {
  renderAverages();

  if (records.length === 0) {
    listElement.innerHTML = '<li class="empty-text">暂无历史记录。</li>';
    return;
  }

  const itemsHtml = records
    .map(function (record) {
      const status = getRecordStatus(record);
      return `
        <li class="record-item">
          <p><strong>日期：</strong>${record.date}</p>
          <p><strong>体重：</strong>${record.weight} kg</p>
          <p><strong>腰围：</strong>${record.waist} cm</p>
          <p><strong>热量：</strong>${record.calories} kcal</p>
          <p><strong>蛋白质：</strong>${record.protein} g</p>
          <p><strong>状态判断：</strong>${status}</p>
        </li>
      `;
    })
    .join("");

  listElement.innerHTML = itemsHtml;
}

function renderAverages() {
  if (!averageElement) {
    return;
  }

  if (records.length === 0) {
    averageElement.textContent = "平均值：暂无数据";
    return;
  }

  const averages = calculateAverages(records);
  averageElement.textContent =
    `平均值（${records.length} 条）：` +
    `体重 ${formatNumber(averages.weight)} kg，` +
    `腰围 ${formatNumber(averages.waist)} cm，` +
    `热量 ${formatNumber(averages.calories)} kcal，` +
    `蛋白质 ${formatNumber(averages.protein)} g`;
}

function calculateAverages(data) {
  const totals = data.reduce(
    function (accumulator, record) {
      accumulator.weight += record.weight;
      accumulator.waist += record.waist;
      accumulator.calories += record.calories;
      accumulator.protein += record.protein;
      return accumulator;
    },
    { weight: 0, waist: 0, calories: 0, protein: 0 }
  );

  const count = data.length;
  return {
    weight: totals.weight / count,
    waist: totals.waist / count,
    calories: totals.calories / count,
    protein: totals.protein / count,
  };
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getRecordStatus(record) {
  if (record.protein < 120) {
    return "蛋白质偏低";
  }

  if (record.calories > 2400) {
    return "热量偏高";
  }

  if (
    record.calories >= 2000 &&
    record.calories <= 2400 &&
    record.protein >= 120
  ) {
    return "比较理想";
  }

  return "继续观察";
}

function showMessage(text, type) {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  form.date.value = today;
}
