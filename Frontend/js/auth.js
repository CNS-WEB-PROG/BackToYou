document.addEventListener("DOMContentLoaded", () => {

    const storedName = sessionStorage.getItem("bty_name");

    // auth.js is included on public pages (home, browse, report forms) as
    // well as the protected dashboard. Only dashboard.html should force a
    // logged-out visitor to the login page - everywhere else we just adjust
    // the nav bar and let guests keep browsing.
    const isDashboard = !!document.querySelector(".dash-user__name");

    // Since this script is loaded both from Frontend/index.html (depth 0)
    // and from Frontend/pages/*.html (depth 1), a single relative path to
    // login.html can't be correct from both places. Work out which one we're on.
    const inPagesFolder = window.location.pathname.includes("/pages/");
    const loginPath = inPagesFolder ? "login.html" : "pages/login.html";

    if (!storedName) {
        if (isDashboard) {
            window.location.replace(loginPath);
        }
        return;
    }

    const firstName = storedName.split(" ")[0];
    const initials = storedName
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Replace login/signup with logged-in navigation
    const navAuth = document.querySelector(".nav__auth");
    const dashboardPath = inPagesFolder ? "dashboard.html" : "pages/dashboard.html";

    if (navAuth) {
        navAuth.innerHTML = `
            <span style="font-size:0.85rem;color:var(--text-secondary);font-weight:500;">
                Hi, ${firstName}
            </span>

            <a href="${dashboardPath}" class="btn btn--ghost">
                Dashboard
            </a>

            <a href="#" id="logoutBtn" class="btn btn--ghost">
                Log out
            </a>
        `;
    }

    // Update dashboard elements if they exist
    const dashName = document.querySelector(".dash-user__name");
    if (dashName) dashName.textContent = storedName;

    const dashAvatar = document.querySelector(".dash-user__avatar");
    if (dashAvatar) dashAvatar.textContent = initials;

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async e => {

            e.preventDefault();

            try {
                await fetch("/backtoyou/Backend/api/login.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        _method: "DELETE"
                    })
                });
            } catch (err) {
                console.error(err);
            }

            sessionStorage.clear();

            window.location.href = loginPath;
        });
    }

});