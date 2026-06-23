const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const formsubmitForm = document.querySelector("[data-formsubmit-form]");

if (formsubmitForm) {
  formsubmitForm.addEventListener("submit", () => {
    const submitButton = formsubmitForm.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.textContent = "Submitting...";
      submitButton.disabled = true;
    }
  });
}
