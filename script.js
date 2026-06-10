/* GravelCalculator.ca — gravel volume, weight & cost estimator */
(function () {
  "use strict";

  // Length conversion factors to metres
  var TO_M = { m: 1, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144 };
  // Area conversion factors to square metres
  var TO_M2 = { m2: 1, ft2: 0.09290304, yd2: 0.83612736 };

  var form = document.getElementById("gravel-form");
  if (!form) return;

  var shapeRadios = form.querySelectorAll('input[name="shape"]');
  var densitySel = document.getElementById("density");
  var customRow = document.getElementById("custom-density-row");
  var results = document.getElementById("results");

  function showShape(shape) {
    form.querySelectorAll(".shape-fields").forEach(function (el) {
      el.classList.toggle("hidden", el.getAttribute("data-shape") !== shape);
    });
  }

  shapeRadios.forEach(function (r) {
    r.addEventListener("change", function () { showShape(this.value); });
  });

  densitySel.addEventListener("change", function () {
    customRow.classList.toggle("hidden", this.value !== "custom");
  });

  function num(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isFinite(v) && v >= 0 ? v : 0;
  }

  // Returns area in m² based on the selected shape
  function getAreaM2() {
    var shape = form.querySelector('input[name="shape"]:checked').value;
    if (shape === "area") {
      var unit = document.getElementById("area-unit").value;
      return num("total-area") * TO_M2[unit];
    }
    if (shape === "rect") {
      var lu = document.getElementById("length-unit").value;
      var L = num("rect-length") * TO_M[lu];
      var W = num("rect-width") * TO_M[lu];
      return L * W;
    }
    // circle
    var cu = document.getElementById("circle-unit").value;
    var d = num("circle-d") * TO_M[cu];
    var radius = d / 2;
    return Math.PI * radius * radius;
  }

  function getDepthM() {
    var u = document.getElementById("depth-unit").value;
    return num("depth") * TO_M[u];
  }

  function getDensity() {
    if (densitySel.value === "custom") return num("custom-density");
    return parseFloat(densitySel.value) || 0;
  }

  function fmt(n, dp) {
    if (!isFinite(n)) return "—";
    if (dp === undefined) dp = n >= 100 ? 0 : n >= 10 ? 1 : 2;
    return n.toLocaleString("en-CA", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  function setText(id, txt) { document.getElementById(id).textContent = txt; }

  function calculate(e) {
    if (e) e.preventDefault();

    var areaM2 = getAreaM2();
    var depthM = getDepthM();
    var density = getDensity(); // t/m³

    var volM3 = areaM2 * depthM;
    var volYd3 = volM3 / 0.764554858;
    var volFt3 = volM3 / 0.0283168466;

    var weightT = volM3 * density;     // tonnes
    var weightKg = weightT * 1000;
    var weightLb = weightKg * 2.20462262;

    setText("r-volume-m3", fmt(volM3));
    setText("r-volume-yd3", fmt(volYd3));
    setText("r-volume-ft3", fmt(volFt3));
    setText("r-weight-t", fmt(weightT));
    setText("r-weight-kg", fmt(weightKg, 0));
    setText("r-weight-lb", fmt(weightLb, 0));

    // Cost
    var price = num("price");
    var costWrap = document.getElementById("r-cost-wrap");
    if (price > 0) {
      var unit = document.getElementById("price-unit").value;
      var cost;
      if (unit === "t") cost = weightT * price;
      else if (unit === "kg") cost = weightKg * price;
      else if (unit === "m3") cost = volM3 * price;
      else cost = volYd3 * price; // yd3
      setText("r-cost", "$" + cost.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      costWrap.classList.remove("hidden");
    } else {
      costWrap.classList.add("hidden");
    }

    results.classList.remove("hidden");
    if (areaM2 > 0 && depthM > 0) {
      results.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  form.addEventListener("submit", calculate);

  document.getElementById("clear-btn").addEventListener("click", function () {
    setTimeout(function () {
      results.classList.add("hidden");
      customRow.classList.add("hidden");
      showShape("area");
    }, 0);
  });

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
