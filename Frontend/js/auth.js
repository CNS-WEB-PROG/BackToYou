// Redirect to login if the user isn't logged in
const userName = sessionStorage.getItem("bty_name");
const userId = sessionStorage.getItem("bty_user_id");

if (!userName || !userId) {
    window.location.href = "pages/login.html";
}
