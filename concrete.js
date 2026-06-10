/* GravelCalculator.ca — concrete volume, bags & cost estimator */
(function () {
  "use strict";
  var form = document.getElementById("concrete-form");
  if (!form) return;

  var TO_M = { m: 1, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144 };
  var TO_M2 = { m2: 1, ft2: 0.09290304, yd2: 0.83612736 };
  // pre-mix bag yields in cubic feet
  var BAG_FT3 = { "80lb": 0.60, "60lb": 0.45, "40lb": 0.30, "30kg": 0.46, "25kg": 0.38 };

  function num(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v >= 0 ? v : 0; }
  function set(id, t) { document.getElementById(id).textContent = t; }
  function fmt(n, dp) {
    if (!isFinite(n)) return "—";
    if (dp === undefined) dp = n >= 100 ? 0 : n >= 10 ? 1 : 2;
    return n.toLocaleString("en-CA", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  function showShape(shape) {
    form.querySelectorAll(".shape-fields").forEach(function (el) {
      el.classList.toggle("hidden", el.getAttribute("data-cshape") !== shape);
    });
  }
  form.querySelectorAll('input[name="cshape"]').forEach(function (r) {
    r.addEventListener("change", function () { showShape(this.value); });
  });

  function volumeM3() {
    var shape = form.querySelector('input[name="cshape"]:checked').value;
    if (shape === "column") {
      var cu = document.getElementById("c-col-unit").value;
      var d = num("c-diam") * TO_M[cu];
      var h = num("c-height") * TO_M[cu];
      var r = d / 2;
      return Math.PI * r * r * h;
    }
    var tU = document.getElementById("c-thick-unit").value;
    var thick = num("c-thick") * TO_M[tU];
    if (shape === "slab") {
      var lu = document.getElementById("c-len-unit").value;
      return num("c-length") * TO_M[lu] * num("c-width") * TO_M[lu] * thick;
    }
    // area
    var au = document.getElementById("c-area-unit").value;
    return num("c-area") * TO_M2[au] * thick;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var volM3 = volumeM3();
    var waste = num("c-waste") / 100;
    volM3 = volM3 * (1 + waste);

    var volYd3 = volM3 / 0.764554858;
    var volFt3 = volM3 / 0.0283168466;
    var weightT = volM3 * 2.4; // ready-mix concrete ~2.4 t/m³

    var bagType = document.getElementById("c-bag").value;
    var bags = Math.ceil(volFt3 / BAG_FT3[bagType]);

    set("c-yd3", fmt(volYd3));
    set("c-m3", fmt(volM3));
    set("c-ft3", fmt(volFt3));
    set("c-t", fmt(weightT));
    set("c-bags", isFinite(bags) ? bags.toLocaleString("en-CA") : "—");

    var price = num("c-price");
    var wrap = document.getElementById("c-cost-wrap");
    if (price > 0) {
      var unit = document.getElementById("c-price-unit").value;
      var cost = unit === "yd3" ? volYd3 * price : unit === "m3" ? volM3 * price : bags * price;
      set("c-cost", "$" + cost.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      wrap.classList.remove("hidden");
    } else { wrap.classList.add("hidden"); }

    document.getElementById("c-results").classList.remove("hidden");
  });

  document.getElementById("c-clear").addEventListener("click", function () {
    setTimeout(function () { document.getElementById("c-results").classList.add("hidden"); showShape("slab"); }, 0);
  });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
