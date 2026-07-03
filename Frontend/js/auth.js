// Redirect to login if the user isn't logged in
const userName = sessionStorage.getItem("bty_name");
const userId = sessionStorage.getItem("bty_user_id");

if (!userName || !userId) {
    window.location.href = "pages/login.html";
}

// Make the values available everywhere
window.currentUser = {
    id: userId,
    name: userName,
    firstName: userName.split(" ")[0],
    initials: userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
};

// Update any common UI elements if they exist
document.addEventListener("DOMContentLoaded", () => {

    const navGreeting = document.querySelector(".nav__auth span");
    if (navGreeting) {
        navGreeting.textContent = `Hi, ${window.currentUser.firstName}`;
    }

    const avatar = document.querySelector(".dash-user__avatar");
    if (avatar) {
        avatar.textContent = window.currentUser.initials;
    }

    const name = document.querySelector(".dash-user__name");
    if (name) {
        name.textContent = window.currentUser.name;
    }

});