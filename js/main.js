/* Sonar Trails — interactions */
(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      navToggle.setAttribute(
        "aria-expanded",
        navLinks.classList.contains("open") ? "true" : "false"
      );
    });
  }

  const revealEls = document.querySelectorAll(".tour, .blog-feature, .blog-item");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const form = document.getElementById("booking-form");
  if (!form) return;

  const success = document.getElementById("form-success");
  const packageSelect = document.getElementById("package");
  const dateInput = document.getElementById("date");

  // Disallow past travel dates
  if (dateInput) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    dateInput.min = iso;
    if (!dateInput.value) {
      const soon = new Date(today);
      soon.setDate(soon.getDate() + 14);
      dateInput.value = soon.toISOString().slice(0, 10);
    }
  }

  // Prefill package from query string or hash
  const params = new URLSearchParams(window.location.search);
  const pkg = params.get("package");
  if (pkg && packageSelect) {
    const option = [...packageSelect.options].find(
      (o) => o.value.toLowerCase() === pkg.toLowerCase()
    );
    if (option) packageSelect.value = option.value;
  }

  // Commission rates by package (for owner tracking)
  const rates = {
    "Golden Fort Day": 0.12,
    "Desert Overnight": 0.15,
    "3-Day Heritage": 0.18,
    "Custom Private": 0.2,
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const priceMap = {
      "Golden Fort Day": 2499,
      "Desert Overnight": 4999,
      "3-Day Heritage": 12999,
      "Custom Private": 0,
    };

    const travelers = Math.max(1, parseInt(data.travelers || "1", 10));
    const base = priceMap[data.package] || 0;
    const estimate = base * travelers;
    const rate = rates[data.package] || 0.15;
    const commission = Math.round(estimate * rate);

    const booking = {
      ...data,
      estimate,
      commission,
      rate,
      createdAt: new Date().toISOString(),
      id: "ST-" + Date.now().toString(36).toUpperCase(),
    };

    // Store locally for the site owner / affiliate ledger
    const existing = JSON.parse(localStorage.getItem("sonar_bookings") || "[]");
    existing.push(booking);
    localStorage.setItem("sonar_bookings", JSON.stringify(existing));

    const message = [
      "Namaste! Sonar Trails booking request:",
      "",
      "ID: " + booking.id,
      "Name: " + data.name,
      "Phone: " + data.phone,
      "Email: " + (data.email || "—"),
      "Package: " + data.package,
      "Travel date: " + data.date,
      "Travelers: " + data.travelers,
      "City: " + (data.city || "—"),
      "Notes: " + (data.notes || "—"),
      estimate
        ? "Est. value: ₹" + estimate.toLocaleString("en-IN") + " | Commission (~" + Math.round(rate * 100) + "%): ₹" + commission.toLocaleString("en-IN")
        : "Custom quote requested",
    ].join("\n");

    // Update WhatsApp link — replace number after you set your business WhatsApp
    const waNumber = form.dataset.whatsapp || "919876543210";
    const waUrl =
      "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(message);

    if (success) {
      success.classList.add("show");
      success.innerHTML =
        "<strong>Booking saved — " +
        booking.id +
        "</strong><br>" +
        (estimate
          ? "Estimated tour value ₹" +
            estimate.toLocaleString("en-IN") +
            ". Your commission (~" +
            Math.round(rate * 100) +
            "%): <strong>₹" +
            commission.toLocaleString("en-IN") +
            "</strong>. "
          : "Custom package — commission on final quote. ") +
        '<a href="' +
        waUrl +
        '" target="_blank" rel="noopener">WhatsApp pe confirm karein →</a>';
    }

    form.reset();
    if (pkg && packageSelect) {
      const option = [...packageSelect.options].find(
        (o) => o.value.toLowerCase() === pkg.toLowerCase()
      );
      if (option) packageSelect.value = option.value;
    }

    // Open WhatsApp for lead handoff
    window.open(waUrl, "_blank", "noopener");
  });
})();
