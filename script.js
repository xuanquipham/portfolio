/* --- Configuration --- */
const GALLERIES = {
  street: { path: "images/street/" },
  voyage: { path: "images/voyage/" },
  portrait: { path: "images/portrait/" },
  concert: { path: "images/concert/" },
  zines: [
    { folder: "images/zines/zine1/" }
  ]
};

/* --- Helpers --- */
function createPlaceholder() {
  const ph = document.createElement("div");
  ph.className = "placeholder";
  return ph;
}

function lazyLoad(img, src) {
  // If browser supports native lazy loading, set attribute as a hint
  img.setAttribute("loading", "lazy");

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      img.src = src;
      img.style.display = "block";
      img.onload = () => {
        img.classList.add("loaded");
        if (img.nextSibling && img.nextSibling.classList && img.nextSibling.classList.contains("placeholder")) {
          img.nextSibling.remove();
        }
      };
      obs.disconnect();
    });
  }, { rootMargin: "200px 0px" });
  obs.observe(img);
}

function updateActiveButton(section) {
  document.querySelectorAll('.sidebar li').forEach(li => {
    if(li.dataset.page === section) {
      li.style.backgroundColor = '#007aff';
      li.style.color = '#fff';
      li.classList.add("active");
    } else {
      li.style.backgroundColor = '';
      li.style.color = '';
      li.classList.remove("active");
    }
  });
}

function updateAboutMe(lang) {
  const about = document.querySelector(".about-me");
  if (!about) return;

  const content = {
    fr: {
      title: "À propos",
      text: [
        "basé à Paris.",
        "Contact: xuanqui.phm@gmail.com",
        "Instagram: @xuxu.photo"
      ]
    },
    en: {
      title: "About me",
      text: [
        "based in Paris.",
        "Contact: xuanqui.phm@gmail.com",
        "Instagram: @xuxu.photo"
      ]
    }
  };

  about.querySelector("h2").textContent = content[lang].title;
  const ps = about.querySelectorAll("p");
  if (ps.length >= 3) {
    ps[0].textContent = content[lang].text[0];
    ps[1].innerHTML = `Contact: <a href="mailto:xuanqui.phm@gmail.com">xuanqui.phm@gmail.com</a>`;
    ps[2].innerHTML = `Instagram: <a href="https://instagram.com/xuxu.photo" target="_blank">@xuxu.photo</a>`;
  }
}

/* --- Mobile menu elements (burger + mobile menu) --- */
const burgerBtn = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");

/* --- DOM Ready --- */
document.addEventListener("DOMContentLoaded", () => {
  let currentLang = localStorage.getItem("lang") || "fr";

  /* 🔧 Correction : charger le thème sauvegardé (ou détecter préférences) */
  const savedTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute("data-theme", savedTheme);

  const menuItems = document.querySelectorAll(".sidebar li");
  const themeBtn = document.getElementById("toggle-theme");
  const langBtn = document.getElementById("toggle-lang");

  /* Sidebar click handlers */
  menuItems.forEach((item) =>
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      updateActiveButton(item.dataset.page);
      loadGallery(item.dataset.page, currentLang);
      // If mobile menu open, close it
      closeMobileMenu();
    })
  );

  /* Theme toggle */
  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  });

  /* Language toggle */
  langBtn.addEventListener("click", () => {
    currentLang = currentLang === "fr" ? "en" : "fr";
    localStorage.setItem("lang", currentLang);

    const active = document.querySelector(".sidebar li.active");
    if (active) loadGallery(active.dataset.page, currentLang);
    updateAboutMe(currentLang);
  });

  /* Mobile menu toggles (burger + mobile menu items) */
  initMobileMenu(currentLang);

  updateAboutMe(currentLang);
  loadGallery("street", currentLang);
  updateActiveButton("street");
});

/* --- Mobile menu logic & helpers --- */
function initMobileMenu(currentLang) {
  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "auto";
  });

  // Handle clicks on mobile menu items
  mobileMenu.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", (e) => {
      const page = li.getAttribute("data-page");

      // Page items
      if (page) {
        loadGallery(page, currentLang);
        // reflect active on sidebar (if visible)
        updateActiveButton(page);
      }

      // Special mobile actions
      if (li.classList.contains("theme-toggle-mobile")) {
        const themeBtn = document.getElementById("toggle-theme");
        if (themeBtn) themeBtn.click();
      }
      if (li.classList.contains("lang-toggle-mobile")) {
        const langBtn = document.getElementById("toggle-lang");
        if (langBtn) langBtn.click();
        // update language state for subsequent loads
        currentLang = localStorage.getItem("lang") || currentLang;
      }

      // Close menu
      closeMobileMenu();
    });
  });
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "auto";
}

/* --- Load Gallery --- */
async function loadGallery(type, lang = "fr") {
  const gallery = document.getElementById("gallery");

  // add fade-out for smooth transition
  gallery.classList.add("fade-out");

  setTimeout(async () => {
    gallery.innerHTML = "";

    // ZINE (cover list) mode
    if (type === "zine") {
      gallery.className = "gallery zine-grid";
      gallery.style.overflowY = "hidden";
      document.body.style.overflow = "hidden";

      for (const zineConfig of GALLERIES.zines) {
        try {
          const res = await fetch(zineConfig.folder + "index.json");
          const data = await res.json();

          const div = document.createElement("div");
          div.className = "zine-item";
          div.style.display = "flex";
          div.style.flexDirection = "column";
          div.style.alignItems = "center";

          const img = document.createElement("img");
          img.src = zineConfig.folder + data.cover;
          img.alt = data.title ? (data.title[lang] || data.title.fr || "") : "";
          div.appendChild(img);

          const span = document.createElement("span");
          span.textContent = (data.title && (data.title[lang] || data.title.fr)) || "Zine";
          span.style.marginTop = "8px";
          span.style.color =
            document.documentElement.getAttribute("data-theme") === "dark"
              ? getComputedStyle(document.documentElement).getPropertyValue("--accent-text") || "white"
              : getComputedStyle(document.documentElement).getPropertyValue("--accent") || "black";
          div.appendChild(span);

          div.addEventListener("click", () => openZine({ ...data, folder: zineConfig.folder }, lang));
          gallery.appendChild(div);
        } catch (e) {
          console.error("Erreur chargement zine", zineConfig.folder, e);
        }
      }

      gallery.classList.remove("fade-out");
      gallery.classList.add("fade-in");
      setTimeout(() => gallery.classList.remove("fade-in"), 300);
      return;
    }

    // Standard galleries
    gallery.className = "gallery grid";
    gallery.style.overflowY = "auto";
    document.body.style.overflow = "auto"; // restore scrolling

    const gal = GALLERIES[type];
    if (!gal) return;

    try {
      const res = await fetch(`${gal.path}index.json`);
      const files = await res.json();

      files.forEach(file => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-item";

        const img = document.createElement("img");
        img.alt = file || type;
        lazyLoad(img, gal.path + file);
        wrapper.appendChild(img);

        wrapper.appendChild(createPlaceholder());
        img.addEventListener("click", () => openLightbox(gal.path + file));

        gallery.appendChild(wrapper);
      });
    } catch (e) {
      console.error("Erreur chargement galerie", e);
    }

    gallery.classList.remove("fade-out");
    gallery.classList.add("fade-in");
    setTimeout(() => gallery.classList.remove("fade-in"), 300);
  }, 300);
}

/* --- Flipbook Zine --- */
let zineItems = [];
let currentZineIndex = 0;

function openZine(zine, lang = "fr") {
  const gallery = document.getElementById("gallery");
  gallery.className = "gallery zine-inner";
  gallery.innerHTML = "";
  document.body.style.overflow = "hidden";

  // spacer to center first
  const spacerBefore = document.createElement("div");
  spacerBefore.style.flex = "0 0 50%";
  gallery.appendChild(spacerBefore);

  zineItems = [];
  currentZineIndex = 0;

  (zine.pages || []).forEach((page, i) => {
    const div = document.createElement("div");
    div.className = "zine-item";
    div.style.marginTop = "120px";
    div.style.cursor = "pointer";

    const img = document.createElement("img");
    img.src = zine.folder + page;
    img.alt = zine.title ? (zine.title[lang] || zine.title.fr || "") : "";

    img.addEventListener("click", () => {
      if (i === currentZineIndex) {
        openLightbox(img.src);
      } else {
        currentZineIndex = i;
        updateZineDisplay();
      }
    });

    div.appendChild(img);
    gallery.appendChild(div);
    zineItems.push(div);
  });

  const spacerAfter = document.createElement("div");
  spacerAfter.style.flex = "0 0 50%";
  gallery.appendChild(spacerAfter);

  updateZineDisplay(true);
  enableKeyboardNavigation();
  enableMouseAndTouchNavigation();
}

function updateZineDisplay(initial = false) {
  zineItems.forEach((item, i) => {
    if (i === currentZineIndex) {
      item.style.opacity = "1";
      item.style.transform = "scale(1)";
    } else if (i === currentZineIndex - 1 || i === currentZineIndex + 1) {
      item.style.opacity = "0.6";
      item.style.transform = "scale(0.85)";
    } else {
      item.style.opacity = "0.3";
      item.style.transform = "scale(0.7)";
    }
    item.style.display = "flex";
  });

  centerActiveZine();
}

function centerActiveZine() {
  const zineInner = document.querySelector(".gallery.zine-inner");
  if (!zineInner || !zineItems[currentZineIndex]) return;

  const left = Math.max(0, zineItems[currentZineIndex].offsetLeft - (zineInner.clientWidth - zineItems[currentZineIndex].clientWidth) / 2);
  zineInner.scrollTo({ left, behavior: 'smooth' });
}

function enableKeyboardNavigation() {
  document.onkeydown = function (e) {
    if (!zineItems.length) return;
    if (e.key === "ArrowRight" && currentZineIndex < zineItems.length - 1) {
      currentZineIndex++;
      centerActiveZine();
      updateZineDisplay();
    } else if (e.key === "ArrowLeft" && currentZineIndex > 0) {
      currentZineIndex--;
      centerActiveZine();
      updateZineDisplay();
    } else if (e.key === "Escape") {
      // close lightbox if open
      const lb = document.getElementById("lightbox");
      if (lb && lb.classList.contains("show")) lb.classList.remove("show");
    }
  };
}

function enableMouseAndTouchNavigation() {
  const zineInner = document.querySelector(".gallery.zine-inner");
  if (!zineInner) return;

  let isDown = false, startX, scrollLeft;

  zineInner.onmousedown = (e) => {
    isDown = true;
    startX = e.pageX - zineInner.offsetLeft;
    scrollLeft = zineInner.scrollLeft;
  };
  zineInner.onmouseleave = zineInner.onmouseup = () => {
    if (isDown) updateCurrentFromCenter();
    isDown = false;
  };
  zineInner.onmousemove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    zineInner.scrollLeft = scrollLeft - (e.pageX - startX) * 1.5;
  };

  zineInner.ontouchstart = (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = zineInner.scrollLeft;
  };
  zineInner.ontouchend = () => {
    updateCurrentFromCenter();
  };
  zineInner.ontouchmove = (e) => {
    zineInner.scrollLeft = scrollLeft - (e.touches[0].pageX - startX);
  };

  function updateCurrentFromCenter() {
    const center = zineInner.scrollLeft + zineInner.clientWidth / 2;
    let closestIdx = 0;
    let minDist = Infinity;
    zineItems.forEach((item, i) => {
      const itemCenter = item.offsetLeft + item.clientWidth / 2;
      const dist = Math.abs(center - itemCenter);
      if (dist < minDist) { minDist = dist; closestIdx = i; }
    });
    currentZineIndex = closestIdx;
    updateZineDisplay();
  }
}

/* --- Lightbox --- */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  lbImg.src = src;
  lb.classList.add("show");
  lb.setAttribute("aria-hidden", "false");
}

document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove("show");
    e.currentTarget.setAttribute("aria-hidden", "true");
  }
});
