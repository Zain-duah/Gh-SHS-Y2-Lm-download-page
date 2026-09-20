document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("#app-search");
  const filterButtons = document.querySelectorAll(".filter-button");
  const appCards = document.querySelectorAll(".app-card");
  const noResults = document.querySelector("#no-results");

  const modal = document.querySelector("#download-modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalMessage = document.querySelector("#modal-message");
  const modalClose = document.querySelector(".modal-close");
  const modalDownloadLink = document.querySelector("#modal-download-link");
  const downloadStatus = document.querySelector("#download-status");
  const downloadButtons = document.querySelectorAll(".download-button");

  const mobileMenuButton = document.querySelector("#menu-btn");
  const mainNav = document.querySelector("#main-nav");

  let activeFilter = "all";
  let downloadTimeoutId = null;
  let lastFocusedElement = null;

  function filterApps() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    appCards.forEach(card => {
      const searchText = (card.dataset.search || card.textContent || "").toLowerCase();
      const year = card.dataset.year || "";
      const visible = (!query || searchText.includes(query)) &&
                      (activeFilter === "all" || year === activeFilter);

      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  function openModal(appName, downloadUrl) {
    if (!modal || !downloadUrl) return;

    lastFocusedElement = document.activeElement;

    if (modalTitle) modalTitle.textContent = `Preparing ${appName}`;
    if (modalMessage) modalMessage.textContent = "Your APK is ready. The browser will open the download shortly.";
    if (downloadStatus) downloadStatus.textContent = "Preparing…";

    if (modalDownloadLink) {
      modalDownloadLink.hidden = true;
      modalDownloadLink.href = downloadUrl;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose?.focus();

    clearTimeout(downloadTimeoutId);

    downloadTimeoutId = window.setTimeout(() => {
      if (downloadStatus) downloadStatus.textContent = "Opening APK download…";
      if (modalMessage) modalMessage.textContent =
        "If the download does not start automatically, use the button below.";

      if (modalDownloadLink) {
        modalDownloadLink.hidden = false;
        modalDownloadLink.focus();
      }

      // GitHub Release assets are cross-origin. A normal browser link is
      // more reliable than the download attribute and avoids pretending
      // that JavaScript can report the actual APK download progress.
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    }, 900);
  }

  function closeModal() {
    if (!modal) return;
    clearTimeout(downloadTimeoutId);
    downloadTimeoutId = null;
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocusedElement?.focus?.();
  }

  searchInput?.addEventListener("input", filterApps);

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter || "all";
      filterApps();
    });
  });

  downloadButtons.forEach(button => {
    button.addEventListener("click", event => {
      if (button.disabled) return;

      const card = event.currentTarget.closest(".app-card");
      const appName =
        button.dataset.name ||
        card?.querySelector("h3")?.textContent?.trim() ||
        "ZINICH LM";

      const downloadUrl = button.dataset.download || "";
      if (!downloadUrl) return;

      openModal(appName, downloadUrl);
    });
  });

  modalClose?.addEventListener("click", closeModal);

  modal?.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  mobileMenuButton?.addEventListener("click", () => {
    if (!mainNav) return;
    const isOpen = mainNav.classList.toggle("mobile-open");
    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
    mobileMenuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mainNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("mobile-open");
      mobileMenuButton?.setAttribute("aria-expanded", "false");
      mobileMenuButton?.setAttribute("aria-label", "Open menu");
    });
  });

  filterApps();
});
