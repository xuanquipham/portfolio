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
  img.setAttribute("loading", "lazy");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      img.src = src;
      img.style.display = "block";
      img.onload = () => {
        img.classList.add("loaded");
        if (img.nextSibling && img.nextSibling.classList.contains("placeholder")) {
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
    if (li.dataset.page === section) {
      li.classList.add("active");
      li.style.backgroundColor = '#007aff';
      li.style.color = '#fff';
    } else {
      li.classList.remove("active");
      li.style.backgroundColor = '';
      li.style.color = '';
    }
  });
}

function updateAboutMe(lang) {
  const about = document.querySelector(".about-me");
  if (!about) return;

  const content = {
    fr: { title: "À propos", text: ["basé à Paris.", "Contact: xuanqui.phm@gmail.com", "Instagram: @xuxu.photo"] },
    en: { title: "About me", text: ["based in Paris.", "Contact: xuanqui.phm@gmail.com", "Instagram: @xuxu.photo"] }
  };

  about.querySelector("h2").textContent = content[lang].title;
  const ps = about.querySelectorAll("p");
  if (ps.length >= 3) {
    ps[0].textContent = content[lang].text[0];
    ps[1].innerHTML = `Contact: <a href="mailto:xuanqui.phm@gmail.com">xuanqui.phm@gmail.com</a>`;
    ps[2].innerHTML = `Instagram: <a href="https://instagram.com/xuxu.photo" target="_blank">@xuxu.photo</a>`;
  }
}

/* --- Mobile menu elements --- */
const burgerBtn = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");

/* --- DOM Ready --- */
document.addEventListener("DOMContentLoaded", () => {
  let currentLang = localStorage.getItem("lang") || "fr";
  const savedTheme = localStorage.getItem("theme") || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute("data-theme", savedTheme);

  const menuItems = document.querySelectorAll(".sidebar li");
  const themeBtn = document.getElementById("toggle-theme");
  const langBtn = document.getElementById("toggle-lang");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      updateActiveButton(item.dataset.page);
      loadGallery(item.dataset.page, currentLang);
      closeMobileMenu();
    });
  });

  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  });

  langBtn.addEventListener("click", () => {
    currentLang = currentLang === "fr" ? "en" : "fr";
    localStorage.setItem("lang", currentLang);
    const active = document.querySelector(".sidebar li.active");
    if (active) loadGallery(active.dataset.page, currentLang);
    updateAboutMe(currentLang);
  });

  initMobileMenu(currentLang);
  updateAboutMe(currentLang);
  loadGallery("street", currentLang);
  updateActiveButton("street");
});

/* --- Mobile Menu --- */
function initMobileMenu(currentLang) {
  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "auto";
  });

  mobileMenu.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      const page = li.getAttribute("data-page");
      if (page) {
        loadGallery(page, currentLang);
        updateActiveButton(page);
      }
      if (li.classList.contains("theme-toggle-mobile")) document.getElementById("toggle-theme").click();
      if (li.classList.contains("lang-toggle-mobile")) document.getElementById("toggle-lang").click();
      closeMobileMenu();
    });
  });
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  burgerBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "auto";
}

/* --- Load Gallery --- */
async function loadGallery(type, lang = "fr") {
  const gallery = document.getElementById("gallery");
  gallery.classList.add("fade-out");

  setTimeout(async () => {
    gallery.innerHTML = "";

    if (type === "zine") {
      gallery.className = "gallery zine-grid";
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
          span.style.color = document.documentElement.getAttribute("data-theme") === "dark" ? "#fff" : "#000";
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
    document.body.style.overflow = "auto";

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

        img.addEventListener("click", () => openLightboxGallery(gal.path, files, files.indexOf(file)));
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

/* --- Zine Flipbook --- */
let zineItems = [];
let currentZineIndex = 0;

function openZine(zine, lang = "fr") {
  const gallery = document.getElementById("gallery");
  gallery.className = "gallery zine-inner";
  gallery.innerHTML = "";
  document.body.style.overflow = "hidden";

  const spacerBefore = document.createElement("div");
  spacerBefore.style.flex = "0 0 50%";
  gallery.appendChild(spacerBefore);

  zineItems = [];
  currentZineIndex = 0;

  (zine.pages || []).forEach((page, i) => {
    console.log('Chargement page zine :', zine.folder + page); // debug path
    const div = document.createElement("div");
    div.className = "zine-item";
    div.style.marginTop = "120px";
    div.style.cursor = "pointer";

    const img = document.createElement("img");
    img.src = zine.folder + page;
    img.alt = zine.title ? (zine.title[lang] || zine.title.fr || "") : "";

    img.addEventListener("click", () => {
      if (i === currentZineIndex) {
        openLightboxGallery(zine.folder, zine.pages, i);
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
  enableZineNavigation(zine.pages, zine.folder);
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
  const left = Math.max(0, zineItems[currentZineIndex].offsetLeft - (zineInner.clientWidth - zineItems[currentZineIndex].clientWidth)/2);
  zineInner.scrollTo({ left, behavior: 'smooth' });
}

/* --- Lightbox --- */
let lbCurrentFiles = [];
let lbCurrentIndex = 0;
let lbCurrentFolder = "";

function openLightboxGallery(folder, files, index) {
  lbCurrentFiles = files;
  lbCurrentIndex = index;
  lbCurrentFolder = folder;

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  lbImg.src = folder + files[index];
  lb.classList.add("show");
  lb.setAttribute("aria-hidden", "false");

  updateLightboxButtons();
}

const lb = document.getElementById("lightbox");
lb.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeLightbox();
});

function closeLightbox() {
  lb.classList.remove("show");
  lb.setAttribute("aria-hidden", "true");
}

function nextLightbox() {
  if (lbCurrentIndex < lbCurrentFiles.length - 1) lbCurrentIndex++;
  else lbCurrentIndex = 0;
  document.getElementById("lightbox-img").src = lbCurrentFolder + lbCurrentFiles[lbCurrentIndex];
}

function prevLightbox() {
  if (lbCurrentIndex > 0) lbCurrentIndex--;
  else lbCurrentIndex = lbCurrentFiles.length - 1;
  document.getElementById("lightbox-img").src = lbCurrentFolder + lbCurrentFiles[lbCurrentIndex];
}

function updateLightboxButtons() {
  // ajouter des boutons ◀ / ▶ si pas déjà existants
  if (!document.getElementById("lb-prev")) {
    const prev = document.createElement("button");
    prev.id = "lb-prev";
    prev.textContent = "◀";
    prev.style.position = "absolute";
    prev.style.left = "20px";
    prev.style.top = "50%";
    prev.style.transform = "translateY(-50%)";
    prev.style.fontSize = "2em";
    prev.style.color = "white";
    prev.style.background = "transparent";
    prev.style.border = "none";
    prev.style.cursor = "pointer";
    prev.addEventListener("click", (e) => { e.stopPropagation(); prevLightbox(); });
    lb.appendChild(prev);
  }

  if (!document.getElementById("lb-next")) {
    const next = document.createElement("button");
    next.id = "lb-next";
    next.textContent = "▶";
    next.style.position = "absolute";
    next.style.right = "20px";
    next.style.top = "50%";
    next.style.transform = "translateY(-50%)";
    next.style.fontSize = "2em";
    next.style.color = "white";
    next.style.background = "transparent";
    next.style.border = "none";
    next.style.cursor = "pointer";
    next.addEventListener("click", (e) => { e.stopPropagation(); nextLightbox(); });
    lb.appendChild(next);
  }
}

/* --- Keyboard & Swipe for Lightbox --- */
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("show")) return;
  if (e.key === "ArrowRight") nextLightbox();
  else if (e.key === "ArrowLeft") prevLightbox();
  else if (e.key === "Escape") closeLightbox();
});

// Swipe support
let touchStartX = 0;
lb.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; });
lb.addEventListener("touchend", (e) => {
  let touchEndX = e.changedTouches[0].clientX;
  if (touchEndX - touchStartX > 50) prevLightbox();
  else if (touchStartX - touchEndX > 50) nextLightbox();
});

/* --- Zine navigation keyboard --- */
function enableZineNavigation(pages, folder) {
  document.onkeydown = function(e) {
    if (!zineItems.length) return;
    if (e.key === "ArrowRight" && currentZineIndex < zineItems.length - 1) {
      currentZineIndex++;
      centerActiveZine();
      updateZineDisplay();
    } else if (e.key === "ArrowLeft" && currentZineIndex > 0) {
      currentZineIndex--;
      centerActiveZine();
      updateZineDisplay();
    } else if (e.key === "Escape") closeLightbox();
  };
}
