let power = 10; // watts
let rate = 8; // ₹/unit
let carbonFactor = 0.82; // kg CO2 per kWh

// Energy logs
let h1Energy = 0;
let h2Energy = 0;
let h1Hourly = Array(24).fill(0);
let h2Hourly = Array(24).fill(0);

// Status trackers
let h1Start, h2Start;

// House 1
function enterHouse1() {
  document.getElementById("status1").innerText = "Present";
  document.getElementById("light1").innerText = "ON";
  h1Start = new Date();
}

function leaveHouse1() {
  document.getElementById("status1").innerText = "Empty";
  document.getElementById("light1").innerText = "ON ❌ (Wastage)";

  let end = new Date();
  let mins = (end - h1Start) / 60000;
  let energy = (power * (mins / 60)) / 1000;
  h1Energy += energy;
  let hour = end.getHours();
  h1Hourly[hour] += energy;

  updateUI();
}

// House 2
function enterHouse2() {
  document.getElementById("status2").innerText = "Present";
  document.getElementById("light2").innerText = "ON";
  h2Start = new Date();
}

function leaveHouse2() {
  document.getElementById("status2").innerText = "Empty";
  document.getElementById("light2").innerText = "OFF ✅ (AI Controlled)";

  let end = new Date();
  let mins = (end - h2Start) / 60000;
  let energy = (power * (mins / 60)) / 1000;
  h2Energy += energy;
  let hour = end.getHours();
  h2Hourly[hour] += energy;

  updateUI();
}

// Manual Mode
function manualUpdate() {
  let before = parseFloat(document.getElementById("manualBefore").value);
  let after = parseFloat(document.getElementById("manualAfter").value);
  h1Energy = before;
  h2Energy = after;
  updateUI();
}

// Update dashboard
function updateUI() {
  document.getElementById("energy1").innerText = h1Energy.toFixed(4);
  document.getElementById("energy2").innerText = h2Energy.toFixed(4);

  let cost1 = h1Energy * rate;
  let cost2 = h2Energy * rate;
  document.getElementById("cost1").innerText = cost1.toFixed(2);
  document.getElementById("cost2").innerText = cost2.toFixed(2);

  let savedE = h1Energy - h2Energy;
  let savedM = cost1 - cost2;
  let carbon = savedE * carbonFactor;

  document.getElementById("savedEnergy").innerText = savedE.toFixed(4);
  document.getElementById("savedMoney").innerText = savedM.toFixed(2);
  document.getElementById("carbon").innerText = carbon.toFixed(2);

  updateChart(h1Energy, h2Energy);
}

// Chart.js
let ctx = document.getElementById("chart");
let myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Without AI', 'With AI'],
    datasets: [{
      label: 'Energy (kWh)',
      data: [0,0],
      backgroundColor: ['#ff7675', '#55efc4']
    }]
  }
});
function updateChart(b, a){
  myChart.data.datasets[0].data = [b,a];
  myChart.update();
}



// PDF Report
function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("⚡ AI Carbon Analyser Report", 20, 20);
  let date = new Date().toLocaleString();
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 20, 30);

  doc.text("🏠 House 1 – Without AI", 20, 45);
  doc.text(`Energy Used: ${h1Energy.toFixed(4)} kWh`, 20, 52);
  doc.text(`Cost: ₹${(h1Energy*rate).toFixed(2)}`, 20, 59);

  doc.text("🏠 House 2 – With AI", 20, 74);
  doc.text(`Energy Used: ${h2Energy.toFixed(4)} kWh`, 20, 81);
  doc.text(`Cost: ₹${(h2Energy*rate).toFixed(2)}`, 20, 88);

  let savedE = h1Energy - h2Energy;
  let savedM = (h1Energy*rate) - (h2Energy*rate);
  let carbon = savedE * carbonFactor;

  doc.text("📊 Summary", 20, 103);
  doc.text(`Energy Saved: ${savedE.toFixed(4)} kWh`, 20, 110);
  doc.text(`Money Saved: ₹${savedM.toFixed(2)}`, 20, 117);
  doc.text(`Carbon Reduced: ${carbon.toFixed(2)} kg CO₂`, 20, 124);

  doc.save("AI_Carbon_Analyser_Report.pdf");
}
