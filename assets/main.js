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
    const lines = Array.from(data.entries())
      .filter(([, value]) => String(value).trim() !== "")
      .map(([key, value]) => `${key}: ${value}`);
    const inquiryText = [
      "Wholesale RPG Dice Quote Request",
      "",
      ...lines,
    ].join("\n");

    const subject = encodeURIComponent("Wholesale RPG Dice Quote Request");
    const body = encodeURIComponent(inquiryText);
    const emailLink = quoteForm.querySelector("[data-email-link]");
    const whatsappLink = quoteForm.querySelector("[data-whatsapp-link]");
    const preview = quoteForm.querySelector("[data-inquiry-preview]");
    const result = quoteForm.querySelector("[data-inquiry-result]");
    const copyStatus = quoteForm.querySelector("[data-copy-status]");

    if (emailLink) {
      emailLink.href = `mailto:lzyderun@gmail.com?subject=${subject}&body=${body}`;
    }

    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/8613922851014?text=${body}`;
    }

    if (preview) {
      preview.value = inquiryText;
    }

    if (copyStatus) {
      copyStatus.textContent = "";
    }

    if (result) {
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  const copyButton = quoteForm.querySelector("[data-copy-inquiry]");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const preview = quoteForm.querySelector("[data-inquiry-preview]");
      const copyStatus = quoteForm.querySelector("[data-copy-status]");
      const text = preview ? preview.value : "";

      try {
        await navigator.clipboard.writeText(text);
        if (copyStatus) {
          copyStatus.textContent = "Inquiry copied. You can paste it into email or WhatsApp.";
        }
      } catch {
        if (preview) {
          preview.select();
        }
        if (copyStatus) {
          copyStatus.textContent = "Copy failed. Select the text above and copy it manually.";
        }
      }
    });
  }
}
