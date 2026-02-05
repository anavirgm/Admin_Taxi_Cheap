export async function loadSidebar(activeMenu) {
    const response = await fetch("/public/components/sidebar.html");
    const sidebarHTML = await response.text();

    document.getElementById("sidebarContainer").innerHTML = sidebarHTML;

    if (activeMenu) {
        const activeLink = document.querySelector(
            `.sidebar a[data-menu="${activeMenu}"]`
        );
        if (activeLink) activeLink.classList.add("active");
    }

    initSidebarEvents();
}

function initSidebarEvents() {
    const menuToggle = document.getElementById("menuToggle");
    const closeSidebar = document.getElementById("closeSidebar");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarToggleDesktop = document.getElementById("sidebarToggleDesktop");

    menuToggle?.addEventListener("click", () => {
        sidebar.classList.add("active");
        sidebarOverlay.classList.add("active");
    });

    closeSidebar?.addEventListener("click", () => {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
    });

    sidebarOverlay?.addEventListener("click", () => {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
    });

    sidebarToggleDesktop?.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
}
