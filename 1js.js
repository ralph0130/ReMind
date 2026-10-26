const IMAGE_TRANSLATIONS = {
  "about-poster": { x: 0, y: 0 },
  "outline-part-one": { x: 0, y: 0 },
  "outline-part-two": { x: 0, y: 0 },
  "about-promotion": { x: 0, y: 0 },
  "channel-art-six": { x: 0, y: 0 },
  "channel-screenshot": { x: 0, y: 0 },
  "channel-art-seven": { x: 0, y: 0 },
  "first-post": { x: 0, y: 0 },
  "website-layout": { x: 0, y: 0 },
  "promotional-design": { x: 0, y: 0 },
  "schedule-outline-one": { x: 0, y: 0 },
  "schedule-outline-two": { x: 0, y: 0 },
  "takeaway-image": { x: 0, y: 0 }
};

const FOOTER_BACKGROUND_POSITION = { x: "50%", y: "50%" };

function applyImageTranslations() {
  document.querySelectorAll("[data-image-position]").forEach(function(image) {
    const position = IMAGE_TRANSLATIONS[image.dataset.imagePosition];

    if (!position) {
      return;
    }

    image.style.setProperty("--image-translate-x", `${position.x}px`);
    image.style.setProperty("--image-translate-y", `${position.y}px`);
  });

  const footer = document.querySelector("footer");
  if (footer) {
    footer.style.setProperty("--background-image-x", FOOTER_BACKGROUND_POSITION.x);
    footer.style.setProperty("--background-image-y", FOOTER_BACKGROUND_POSITION.y);
  }
}

function showTip() {
  const tip = document.getElementById("websiteTip");
  const button = document.querySelector("[aria-controls='websiteTip']");
  if (!tip) {
    return;
  }

  tip.classList.toggle("show");
  if (button) {
    button.setAttribute("aria-expanded", String(tip.classList.contains("show")));
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  const switchButton = document.getElementById("themeSwitch");
  if (switchButton) {
    switchButton.checked = isDark;
  }
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCarouselSlide(carousel, type, requestedIndex) {
  const slideSelector = type === "about" ? "[data-about-slide]" : "[data-episode-slide]";
  const dotSelector = type === "about" ? "[data-about-dot]" : "[data-episode-dot]";
  const slides = Array.from(carousel.querySelectorAll(slideSelector));
  const dots = Array.from(carousel.querySelectorAll(dotSelector));

  if (slides.length === 0) {
    return 0;
  }

  const index = (requestedIndex + slides.length) % slides.length;

  slides.forEach(function(slide, slideIndex) {
    const isActive = slideIndex === index;
    slide.hidden = !isActive;
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.classList.toggle("is-active", isActive);
  });

  dots.forEach(function(dot, dotIndex) {
    const isActive = dotIndex === index;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });

  return index;
}

function attachCarousel(type, carousel) {
  const slides = carousel.querySelectorAll(type === "about" ? "[data-about-slide]" : "[data-episode-slide]");
  let activeIndex = 0;
  let touchStartX = 0;
  let autoAdvanceTimer;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scheduleAutoAdvance() {
    window.clearInterval(autoAdvanceTimer);

    if (prefersReducedMotion || document.hidden) {
      return;
    }

    autoAdvanceTimer = window.setInterval(function() {
      activeIndex = showCarouselSlide(carousel, type, activeIndex + 1);
    }, 5000);
  }

  function goToSlide(index) {
    activeIndex = showCarouselSlide(carousel, type, index);
    scheduleAutoAdvance();
  }

  carousel.querySelectorAll(type === "about" ? "[data-about-direction]" : "[data-episode-direction]").forEach(function(button) {
    button.addEventListener("click", function() {
      goToSlide(activeIndex + Number(button.dataset[type + "Direction"]));
    });
  });

  carousel.querySelectorAll(type === "about" ? "[data-about-dot]" : "[data-episode-dot]").forEach(function(dot) {
    dot.addEventListener("click", function() {
      goToSlide(Number(dot.dataset[type + "Dot"]));
    });
  });

  document.addEventListener("visibilitychange", scheduleAutoAdvance);

  carousel.addEventListener("touchstart", function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener("touchend", function(event) {
    const distance = event.changedTouches[0].screenX - touchStartX;

    if (Math.abs(distance) > 45) {
      goToSlide(activeIndex + (distance < 0 ? 1 : -1));
    }
  }, { passive: true });

  if (slides.length > 1) {
    scheduleAutoAdvance();
  }
}

window.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add("js-enabled");
  const themeSwitch = document.getElementById("themeSwitch");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeSwitch.checked = true;
  }

  if (themeSwitch) {
    themeSwitch.addEventListener("change", toggleTheme);
  }
  applyImageTranslations();
  document.querySelectorAll(".about-carousel").forEach(function(carousel) {
    attachCarousel("about", carousel);
  });
  document.querySelectorAll(".episode-carousel").forEach(function(carousel) {
    attachCarousel("episode", carousel);
  });

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("site-navigation");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function() {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      menu.classList.toggle("is-open", !isExpanded);
    });

    menu.querySelectorAll("a").forEach(function(link) {
      link.addEventListener("click", function() {
        menuButton.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        menuButton.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll("[data-verdict]").forEach(function(button) {
    button.addEventListener("click", function() {
      const feedback = document.querySelector("[data-verdict-feedback]");
      if (!feedback) {
        return;
      }

      const isNotGuilty = button.dataset.verdict === "not-guilty";
      feedback.textContent = isNotGuilty
        ? "Not guilty: taking a planned break can help someone recover focus. Rest is part of a sustainable study routine."
        : "Guilty? A label does not tell the whole story. Ask what Mika needs, whether the workload is manageable, and how to balance rest and responsibilities.";

      document.querySelectorAll("[data-verdict]").forEach(function(choice) {
        const isSelected = choice === button;
        choice.setAttribute("aria-pressed", String(isSelected));
        choice.classList.toggle("is-selected", isSelected);
      });
    });
  });

  window.addEventListener("scroll", function() {
    document.getElementById("navbar").style.boxShadow = window.scrollY > 50
      ? "0 5px 20px rgba(18, 59, 82, 0.10)"
      : "none";
  }, { passive: true });

  const sections = document.querySelectorAll("main > section[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        document.querySelectorAll(".nav-links a").forEach(function(link) {
          link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(function(section) {
      sectionObserver.observe(section);
    });
  }
});
