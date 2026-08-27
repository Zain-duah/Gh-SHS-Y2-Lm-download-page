

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#app-search");
    const filterButtons = document.querySelectorAll(".filter-button");
    const appCards = document.querySelectorAll(".app-card");
    const noResults = document.querySelector("#no-results");

    const modal = document.querySelector("#download-modal");
    const modalTitle = document.querySelector("#modal-title");
    const modalMessage = document.querySelector("#modal-message");
    const modalClose = document.querySelector(".modal-close");
    const downloadButtons = document.querySelectorAll(".download-button");
    const downloadStatus = document.querySelector("#download-status");

    const mobileMenuButton = document.querySelector("#menu-btn");
    const mainNav = document.querySelector("#main-nav");

    let activeFilter = "all";
    let downloadTimeoutId = null;

    function filterApps() {
        const query = (searchInput?.value || "").trim().toLowerCase();
        let visibleCount = 0;

        appCards.forEach(card => {
            const searchText = (card.dataset.search || card.textContent).toLowerCase();
            const year = card.dataset.year || "";

            const matchesSearch = !query || searchText.includes(query);
            const matchesFilter =
                activeFilter === "all" || year === activeFilter;

            const visible = matchesSearch && matchesFilter;

            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }
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

    function triggerFileDownload(url, filename) {
        if (!url) return;
        const link = document.createElement("a");
        link.href = url;
        if (filename) link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function openModal(appName = "ZINICH LM", downloadUrl = "") {
        if (!modal) return;

        if (modalTitle) {
            modalTitle.textContent = `Preparing ${appName}`;
        }

        if (modalMessage) {
            modalMessage.textContent = "Please wait while the download is prepared.";
        }

        if (downloadStatus) {
            downloadStatus.textContent = "Preparing...";
        }

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        if (downloadTimeoutId) {
            window.clearTimeout(downloadTimeoutId);
        }

        downloadTimeoutId = window.setTimeout(() => {
            if (downloadStatus) {
                downloadStatus.textContent = "Download ready.";
            }
            if (modalMessage) {
                modalMessage.textContent = `${appName} is downloading now.`;
            }

            triggerFileDownload(downloadUrl, downloadUrl.split("/").pop());
        }, 900);
    }

    function closeModal() {
        if (!modal) return;

        if (downloadTimeoutId) {
            window.clearTimeout(downloadTimeoutId);
            downloadTimeoutId = null;
        }

        modal.hidden = true;
        document.body.style.overflow = "";
    }

    downloadButtons.forEach(button => {
        button.addEventListener("click", event => {
            const card = event.currentTarget.closest(".app-card");
            const appName =
                button.dataset.name ||
                card?.querySelector("h3")?.textContent?.trim() ||
                "ZINICH LM";
            const downloadUrl = button.dataset.download || "";

            openModal(appName, downloadUrl);
        });
    });

    modalClose?.addEventListener("click", closeModal);

    modal?.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal && !modal.hidden) {
            closeModal();
        }
    });

    mobileMenuButton?.addEventListener("click", () => {
        if (!mainNav) return;

        const isOpen = mainNav.classList.toggle("mobile-open");
        mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("mobile-open");
            mobileMenuButton?.setAttribute("aria-expanded", "false");
        });
    });

    filterApps();
});
