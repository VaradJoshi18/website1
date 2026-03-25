const body = document.body;
const header = document.getElementById("siteHeader");
const nav = document.getElementById("siteNav");
const navToggle = document.getElementById("navToggle");
const loader = document.getElementById("pageLoader");

const setScrolledHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const toggleMenu = () => {
  if (!nav || !navToggle) return;
  const open = nav.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", open);
  navToggle.setAttribute("aria-expanded", String(open));
  body.classList.toggle("menu-open", open);
};

const closeMenu = () => {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.classList.remove("is-active");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
};

if (navToggle) {
  navToggle.addEventListener("click", toggleMenu);
}

if (nav) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

window.addEventListener("scroll", setScrolledHeader, { passive: true });
setScrolledHeader();

window.addEventListener("load", () => {
  if (loader) {
    setTimeout(() => loader.classList.add("is-hidden"), 450);
  }
});

const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    revealObserver.observe(element);
  });
}

const counterElements = document.querySelectorAll("[data-counter]");
if (counterElements.length) {
  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || 0);
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterElements.forEach((counter) => counterObserver.observe(counter));
}

const slides = Array.from(document.querySelectorAll(".testimonial-slide"));
const dotsWrap = document.getElementById("sliderDots");

if (slides.length && dotsWrap) {
  let activeIndex = 0;
  let sliderTimer;

  const dots = slides.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
    button.addEventListener("click", () => {
      activeIndex = index;
      updateSlider();
      restartSlider();
    });
    dotsWrap.appendChild(button);
    return button;
  });

  const updateSlider = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
      dots[index].classList.toggle("is-active", index === activeIndex);
    });
  };

  const restartSlider = () => {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => {
      activeIndex = (activeIndex + 1) % slides.length;
      updateSlider();
    }, 5000);
  };

  updateSlider();
  restartSlider();
}

const parallaxTarget = document.querySelector("[data-parallax]");
if (parallaxTarget) {
  const applyParallax = () => {
    const offset = window.scrollY * 0.18;
    parallaxTarget.style.transform = `scale(1.08) translateY(${offset}px)`;
  };

  window.addEventListener("scroll", applyParallax, { passive: true });
  applyParallax();
}

