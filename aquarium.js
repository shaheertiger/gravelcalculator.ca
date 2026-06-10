/* GravelCalculator.ca — aquarium / fish tank gravel estimator */
(function () {
  "use strict";
  var form = document.getElementById("aqua-form");
  if (!form) return;

  function num(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v >= 0 ? v : 0; }
  function set(id, t) { document.getElementById(id).textContent = t; }
  function fmt(n, dp) {
    if (!isFinite(n)) return "—";
    if (dp === undefined) dp = n >= 100 ? 0 : 1;
    return n.toLocaleString("en-CA", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var unit = document.getElementById("aq-unit").value;
    var toCm = unit === "in" ? 2.54 : 1;
    var L = num("aq-length") * toCm;
    var W = num("aq-width") * toCm;
    var D = num("aq-depth") * toCm;
    var density = parseFloat(document.getElementById("aq-density").value) || 1.6; // g/cm³

    var volCm3 = L * W * D;
    var litres = volCm3 / 1000;
    var grams = volCm3 * density;
    var kg = grams / 1000;
    var lb = kg * 2.20462262;

    set("aq-kg", fmt(kg));
    set("aq-lb", fmt(lb));
    set("aq-l", fmt(litres));
    document.getElementById("aq-results").classList.remove("hidden");
  });

  document.getElementById("aq-clear").addEventListener("click", function () {
    setTimeout(function () { document.getElementById("aq-results").classList.add("hidden"); }, 0);
  });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
