document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("searchBtn").addEventListener("click", () => {
    alert("Search functionality is not implemented in this demo.");
  });
});
