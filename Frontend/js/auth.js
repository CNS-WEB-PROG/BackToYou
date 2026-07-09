document.addEventListener("DOMContentLoaded", () => {

    const storedName = sessionStorage.getItem("bty_name");

    if (!storedName) {
        window.location.replace("pages/login.html");
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

    if (navAuth) {
        navAuth.innerHTML = `
            <span style="font-size:0.85rem;color:var(--text-secondary);font-weight:500;">
                Hi, ${firstName}
            </span>

            <a href="dashboard.html" class="btn btn--ghost">
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

            window.location.href = "pages/login.html";
        });
    }

});