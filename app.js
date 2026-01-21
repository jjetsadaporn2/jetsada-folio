(() => {
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const dotsWrap = document.getElementById("dots");
  const progressBar = document.getElementById("progressBar");
  const yearEl = document.getElementById("year");

  const btnStartOver = document.getElementById("btnStartOver");
  const btnCopyLink = document.getElementById("btnCopyLink");
  const modal = document.getElementById("activityModal");
  const modalTitle = document.getElementById("activityModalTitle");
  const modalDesc = document.getElementById("activityModalDesc");
  const modalImage = document.getElementById("activityModalImage");
  const modalThumbs = document.getElementById("activityModalThumbs");
  const modalClose = modal && modal.querySelector(".modal-close");
  const modalPrev = modal && modal.querySelector(".modal-nav.prev");
  const modalNext = modal && modal.querySelector(".modal-nav.next");

  const total = slides.length;
  let index = 0;
  let isLock = false;
  let modalIndex = 0;
  let currentActivity = null;

  const activitiesData = [
    {
      id: "act1",
      type: "activity",
      title: "กิจกรรม: Team Building 2025 in Toyota",
      subtitle: "บทบาท: Internship",
      year: "ปี: 2025",
      description: "ทำงานเป็นทีม ฝึกการแก้สถานการณ์หน้างาน ",
      images: ["../images/ac1.png", "../images/ac2.png", "../images/ac3.png", "../images/ac4.png"],
    },
    {
      id: "act2",
      type: "activity",
      title: "กิจกรรม: เข้าร่วมแข่งขันทักษะวิชาชีพ",
      subtitle: "บทบาท: นักศึกษา",
      year: "ปี: 2025",
      description: "คอยบรรยายเกี่ยวกับการเรียนในแผนก และ สอนให้รู้จักกับ AI ว่าสามารถนำไปใช้ร่วมกับงานอะไรได้บ้าง",
      images: ["../images/ac8.png", "../images/ac9.png"],
    },
    {
      id: "act3",
      type: "activity",
      title: "กิจกรรม: รับเกียรติบัตรเกียรตินิยม",
      subtitle: "บทบาท: นักศึกษา",
      year: "ปี: 2024",
      description: "--",
      images: ["../images/ac6.png"],
    } 
  ];
  const awardsData = [
    {
      id: "award1",
      type: "award",
      title: "Certificate",
      description: "Power BI Training",
      images: ["../images/cer1.png"],
    },
    {
      id: "award2",
      type: "award",
      title: "Certificate",
      description: "เข้าค่ายคณิตศาสตร์ที่ม.บูรพา",
      images: ["../images/cer2.png"],
    },
    {
      id: "award3",
      type: "award",
      title: "Certificate",
      description: "ใบ Certificate ของวิทยาลัยอีเทค",
      images: ["../images/cer3.png"],
    },
    {
      id: "award4",
      type: "award",
      title: "",
      description: "",
      images: ["../images/cer4.jpg"],
    },
  ];
  const itemMap = new Map([...activitiesData, ...awardsData].map((a) => [a.id, a]));

  // ---------- Helpers ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const isModalOpen = () => modal && modal.classList.contains("is-open");

  function setModalImage(i) {
    if (!currentActivity || !modalImage) return;
    const images = currentActivity.images;
    const next = (i + images.length) % images.length;
    modalIndex = next;
    modalImage.src = `png/${images[modalIndex]}`;
    modalImage.alt = `${currentActivity.title} ${modalIndex + 1}`;

    if (modalThumbs) {
      const thumbs = Array.from(modalThumbs.querySelectorAll(".modal-thumb"));
      thumbs.forEach((t, idx) => t.classList.toggle("is-active", idx === modalIndex));
    }
  }

  function renderThumbs(images) {
    if (!modalThumbs) return;
    modalThumbs.innerHTML = "";
    images.forEach((name, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "modal-thumb";
      if (idx === modalIndex) btn.classList.add("is-active");

      const img = document.createElement("img");
      img.src = `png/${name}`;
      img.alt = `${currentActivity.title} ${idx + 1}`;
      btn.appendChild(img);

      btn.addEventListener("click", () => setModalImage(idx));
      modalThumbs.appendChild(btn);
    });
  }

  function openModalById(id) {
    if (!modal) return;
    const data = itemMap.get(id);
    if (!data) return;

    currentActivity = data;
    modalIndex = 0;
    if (modal) modal.dataset.type = data.type || "activity";

    if (data.type === "award") {
      modalTitle && (modalTitle.textContent = "");
      modalDesc && (modalDesc.textContent = "");
    } else {
      const meta = [data.subtitle, data.year].filter(Boolean).join(" • ");
      const desc = data.description ? ` — ${data.description}` : "";
      modalTitle && (modalTitle.textContent = data.title || "");
      modalDesc && (modalDesc.textContent = meta ? `${meta}${desc}` : data.description || "");
    }
    renderThumbs(data.images);
    setModalImage(0);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    currentActivity = null;
  }

  function setActive(i, { pushHash = true } = {}) {
    index = clamp(i, 0, total - 1);

    slides.forEach((s, idx) => {
      s.classList.toggle("is-active", idx === index);
    });

    // Move deck
    deck.style.transform = `translateX(${-index * 100}vw)`;

    // Progress
    const pct = ((index + 1) / total) * 100;
    progressBar.style.width = `${pct}%`;

    // Dots
    const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === index));

    // Button state
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === total - 1;

    // Update hash (#/1..#/9)
    if (pushHash) {
      history.replaceState(null, "", `#/` + (index + 1));
    }

    // Small lock to avoid rapid scroll spam
    isLock = true;
    window.setTimeout(() => (isLock = false), 420);
  }

  function goNext() { setActive(index + 1); }
  function goPrev() { setActive(index - 1); }

  // ---------- Dots ----------
  function buildDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((s, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.title = `${idx + 1}: ${s.dataset.title || "หน้า"}`;
      b.setAttribute("aria-label", `ไปหน้า ${idx + 1} ${s.dataset.title || ""}`);
      b.addEventListener("click", () => setActive(idx));
      dotsWrap.appendChild(b);
    });
  }

  // ---------- Keyboard ----------
  function onKey(e) {
    if (isModalOpen()) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setModalImage(modalIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setModalImage(modalIndex - 1);
      }
      return;
    }

    if (isLock) return;

    const keysNext = ["ArrowRight", "ArrowDown", "PageDown", " "];
    const keysPrev = ["ArrowLeft", "ArrowUp", "PageUp"];

    if (keysNext.includes(e.key)) {
      e.preventDefault();
      goNext();
    } else if (keysPrev.includes(e.key)) {
      e.preventDefault();
      goPrev();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(total - 1);
    }
  }

  // ---------- Wheel (Scroll) ----------
  let wheelAcc = 0;
  function onWheel(e) {
    // Trackpad sometimes sends small deltas; accumulate.
    if (isLock) return;

    wheelAcc += e.deltaY;

    const threshold = 80;
    if (Math.abs(wheelAcc) > threshold) {
      if (wheelAcc > 0) goNext();
      else goPrev();
      wheelAcc = 0;
    }
  }

  // ---------- Touch (Swipe) ----------
  let touchStartX = 0;
  let touchStartY = 0;
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }
  function onTouchEnd(e) {
    if (isLock) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    // prefer horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    } else if (Math.abs(dy) > 55) {
      // allow vertical swipe too
      if (dy < 0) goNext();
      else goPrev();
    }
  }

  // ---------- Hash routing ----------
  function readHash() {
    const m = (location.hash || "").match(/#\/(\d+)/);
    if (!m) return 0;
    const n = parseInt(m[1], 10);
    if (Number.isNaN(n)) return 0;
    return clamp(n - 1, 0, total - 1);
  }

  // ---------- Extra buttons ----------
  async function copyLink() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      btnCopyLink.textContent = "คัดลอกแล้ว ✓";
      setTimeout(() => (btnCopyLink.textContent = "คัดลอกลิงก์หน้านี้"), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      btnCopyLink.textContent = "คัดลอกแล้ว ✓";
      setTimeout(() => (btnCopyLink.textContent = "คัดลอกลิงก์หน้านี้"), 1200);
    }
  }

  // ---------- Init ----------
  buildDots();
  yearEl && (yearEl.textContent = new Date().getFullYear());

  btnPrev.addEventListener("click", goPrev);
  btnNext.addEventListener("click", goNext);

  btnStartOver && btnStartOver.addEventListener("click", () => setActive(0));
  btnCopyLink && btnCopyLink.addEventListener("click", copyLink);

  const activityButtons = Array.from(document.querySelectorAll(".activity-btn"));
  activityButtons.forEach((btn) => {
    const card = btn.closest(".activity-card");
    if (!card) return;
    const id = card.dataset.item;
    btn.addEventListener("click", () => openModalById(id));
  });

  modalClose && modalClose.addEventListener("click", closeModal);
  modalPrev && modalPrev.addEventListener("click", () => setModalImage(modalIndex - 1));
  modalNext && modalNext.addEventListener("click", () => setModalImage(modalIndex + 1));
  modal && modal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.matches("[data-modal-close]")) closeModal();
  });

  window.addEventListener("keydown", onKey, { passive: false });
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  window.addEventListener("hashchange", () => setActive(readHash(), { pushHash: false }));

  // Start at hash or 0
  setActive(readHash(), { pushHash: true });
})();
