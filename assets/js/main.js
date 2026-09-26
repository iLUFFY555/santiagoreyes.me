/* Santiago Reyes portfolio — interactions. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Work filters ---------- */
  var grid = document.getElementById("work-grid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
    var catBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter-cat]"));
    var count = document.getElementById("filter-count");
    var activeCat = "all";

    function setPressed(btns, btn) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cats") || "").split(" ");
        var show = activeCat === "all" || cats.indexOf(activeCat) !== -1;
        card.hidden = !show;
        if (show) shown++;
      });
      if (count) {
        count.textContent = shown === cards.length
          ? "Showing all " + cards.length + " pieces"
          : "Showing " + shown + " of " + cards.length;
      }
    }

    catBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCat = btn.getAttribute("data-filter-cat");
        setPressed(catBtns, btn);
        apply();
      });
    });
    apply();
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector("figcaption");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var idx = 0;
    var lastFocus = null;

    function open(i) {
      idx = (i + items.length) % items.length;
      var fig = items[idx].closest("figure") || items[idx];
      var img = items[idx].querySelector("img") || items[idx];
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.getAttribute("alt") || "";
      var cap = fig.querySelector("figcaption");
      lbCap.textContent = cap ? cap.textContent : "";
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
      lb.querySelector(".lb-close").focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function step(d) { open(idx + d); }

    items.forEach(function (item, i) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        open(i);
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- Contact form (mailto, no backend) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = form.getAttribute("data-recipient") || "";
      if (!to) {
        alert("Add your email address in content/site.json and rebuild to activate the form.");
        return;
      }
      var name = form.querySelector("#cf-name").value.trim();
      var email = form.querySelector("#cf-email").value.trim();
      var msg = form.querySelector("#cf-message").value.trim();
      var subject = encodeURIComponent("Portfolio inquiry from " + (name || "your website"));
      var body = encodeURIComponent(msg + "\n\n- " + name + " (" + email + ")");
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    });
  }
  /* ---------- About photo carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = root.querySelector(".carousel-dots");
    var captionEl = root.querySelector("[data-carousel-caption]");
    var countEl = root.querySelector("[data-carousel-count]");
    var index = 0;

    slides.forEach(function (_, n) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Go to photo " + (n + 1));
      d.setAttribute("aria-selected", n === 0 ? "true" : "false");
      d.addEventListener("click", function () { go(n); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function go(n) {
      index = (n + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, k) {
        d.setAttribute("aria-selected", k === index ? "true" : "false");
      });
      if (captionEl) captionEl.innerHTML = slides[index].getAttribute("data-caption");
      if (countEl) countEl.textContent = pad(index + 1) + " / " + pad(slides.length);
    }

    root.querySelector(".carousel-prev").addEventListener("click", function () { go(index - 1); });
    root.querySelector(".carousel-next").addEventListener("click", function () { go(index + 1); });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    });

    var startX = null;
    track.addEventListener("pointerdown", function (e) { startX = e.clientX; });
    track.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  });

})();
