/* Market Stories v7: phone carousels advance on their own (paused on touch, hover, focus, off-screen, or reduced motion), dots follow. */
(function () {
  "use strict";
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".phone").forEach(function (ph, n) {
    var car = ph.querySelector(".ig__car"), dots = ph.querySelectorAll(".ig__dots i");
    if (!car) return;
    var count = car.children.length, held = false, seen = true;
    function at() { return Math.round(car.scrollLeft / Math.max(1, car.clientWidth)); }
    function mark() { var i = at(); dots.forEach(function (d, k) { d.classList.toggle("on", k === i); }); }
    car.addEventListener("scroll", function () { window.requestAnimationFrame(mark); }, { passive: true });
    mark();
    ["pointerdown", "mouseenter", "focusin", "touchstart"].forEach(function (e) { car.addEventListener(e, function () { held = true; }, { passive: true }); });
    car.addEventListener("mouseleave", function () { held = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(car);
    if (still) return;
    setTimeout(function () {
      setInterval(function () {
        if (held || !seen || document.hidden) return;
        var next = (at() + 1) % count;
        car.scrollTo({ left: next * car.clientWidth, behavior: next === 0 ? "auto" : "smooth" });
      }, 3200);
    }, 1200 + n * 1500);
  });
})();
