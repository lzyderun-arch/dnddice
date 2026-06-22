const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const quoteForm = document.querySelector("[data-quote-form]");

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quoteForm);
    const lines = Array.from(data.entries()).map(([key, value]) => `${key}: ${value}`);
    const subject = encodeURIComponent("Wholesale RPG Dice Quote Request");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:lzyderun@gmail.com?subject=${subject}&body=${body}`;
  });
}
