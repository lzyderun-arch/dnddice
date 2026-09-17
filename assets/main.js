const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navDropdowns = Array.from(document.querySelectorAll(".has-dropdown"));
const mobileNavigation = window.matchMedia("(max-width: 1080px)");

function setDropdownState(dropdown, isOpen) {
  const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
  dropdown.classList.toggle("is-open", isOpen);

  if (dropdownToggle) {
    dropdownToggle.setAttribute("aria-expanded", String(isOpen));
  }
}

function closeDropdowns(exceptDropdown = null) {
  navDropdowns.forEach((dropdown) => {
    if (dropdown !== exceptDropdown) {
      setDropdownState(dropdown, false);
    }
  });
}

function closeNavigation() {
  closeDropdowns();

  if (navLinks) {
    navLinks.classList.remove("open");
  }

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
  }
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));

    if (!isOpen) {
      closeDropdowns();
    }
  });
}

navDropdowns.forEach((dropdown) => {
  const dropdownToggle = dropdown.querySelector(".dropdown-toggle");

  if (!dropdownToggle) {
    return;
  }

  dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = !dropdown.classList.contains("is-open");
    closeDropdowns(dropdown);
    setDropdownState(dropdown, shouldOpen);
  });
});

if (navLinks) {
  navLinks.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigation();
    });
  });
}

document.addEventListener("click", (event) => {
  if (nav && !nav.contains(event.target)) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const navigationWasOpen = Boolean(navLinks && navLinks.classList.contains("open"));
  closeNavigation();

  if (navigationWasOpen && navToggle) {
    navToggle.focus();
  }
});

mobileNavigation.addEventListener("change", closeNavigation);

const formsubmitForm = document.querySelector("[data-formsubmit-form]");
const GA_CALLBACK_TIMEOUT = 700;
const catalogLabels = {
  "resin-dice-wholesale-catalog": "Resin Dice Catalog",
  "metal-dice-wholesale-catalog": "Metal Dice Catalog",
  "hollow-dice-wholesale-catalog": "Hollow Dice Catalog",
  "exotic-dice-wholesale-catalog": "Exotic Dice Catalog",
};

function pagePath() {
  return window.location.pathname || "/";
}

function currentParams() {
  return new URLSearchParams(window.location.search);
}

function catalogLabel(value) {
  return catalogLabels[value] || value || "";
}

function linkText(link) {
  return (link.textContent || link.getAttribute("aria-label") || link.href || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function productSeries(link) {
  const series = link.dataset.series || link.querySelector(".catalog-series");
  return typeof series === "string" ? series : (series ? series.textContent : "");
}

function trackEvent(eventName, params = {}, callback) {
  let callbackCalled = false;

  const done = () => {
    if (callbackCalled) {
      return;
    }

    callbackCalled = true;

    if (callback) {
      callback();
    }
  };

  if (typeof window.gtag !== "function") {
    done();
    return;
  }

  window.setTimeout(done, GA_CALLBACK_TIMEOUT);

  window.gtag("event", eventName, {
    page_path: pagePath(),
    page_title: document.title,
    transport_type: "beacon",
    ...params,
    event_callback: done,
    event_timeout: GA_CALLBACK_TIMEOUT,
  });
}

function isQuoteLink(link) {
  const href = link.getAttribute("href") || "";
  return href.includes("request-a-quote");
}

function isWhatsAppLink(link) {
  const href = link.getAttribute("href") || "";
  return href.includes("wa.me/") || href.includes("whatsapp");
}

function isEmailLink(link) {
  const href = link.getAttribute("href") || "";
  return href.startsWith("mailto:");
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");

  if (!link) {
    return;
  }

  if (isQuoteLink(link)) {
    const linkUrl = new URL(link.href);
    trackEvent("quote_click", {
      link_text: linkText(link),
      link_url: link.href,
      click_type: "request_quote",
      catalog: link.dataset.catalog || catalogLabel(linkUrl.searchParams.get("catalog")),
      series: link.dataset.series || linkUrl.searchParams.get("series") || "",
      sku: link.dataset.sku || linkUrl.searchParams.get("sku") || "",
    });
    return;
  }

  if (isWhatsAppLink(link)) {
    trackEvent("whatsapp_click", {
      link_text: linkText(link),
      link_url: link.href,
      click_type: "contact_whatsapp",
      sku: link.dataset.sku || "",
      product_name: link.dataset.whatsappProduct || "",
      product_series: productSeries(link).replace(/\s+/g, " ").trim(),
    });
    return;
  }

  if (isEmailLink(link)) {
    trackEvent("email_click", {
      link_text: linkText(link),
      link_url: link.href,
      click_type: "contact_email",
    });
  }
});

function setFieldValue(selector, value) {
  const field = formsubmitForm ? formsubmitForm.querySelector(selector) : null;

  if (field && value) {
    field.value = value;
  }
}

function prefillQuoteForm() {
  if (!formsubmitForm) {
    return;
  }

  const params = currentParams();
  const catalog = params.get("catalog") || "";
  const series = params.get("series") || "";
  const sku = params.get("sku") || "";
  const source = params.get("source") || "";
  const programParam = params.get("program") || "";
  const catalogName = catalogLabel(catalog);

  if (!catalog && !series && !sku && !source && !programParam) {
    return;
  }

  setFieldValue("[data-prefill='catalog']", catalogName || catalog);
  setFieldValue("[data-prefill='series']", series);
  setFieldValue("[data-prefill='sku']", sku);

  const program = formsubmitForm.querySelector("[name='Program']");
  const programByCatalog = {
    "Resin Dice Catalog": "Resin dice catalog",
    "Metal Dice Catalog": "Metal dice catalog",
    "Hollow Dice Catalog": "Hollow dice catalog",
    "Exotic Dice Catalog": "Exotic dice catalog",
  };
  const programByParam = {
    "sample-catalog-request": "Sample kit / catalog request",
    "sample-kit": "Sample kit",
    "wholesale-dice": "Wholesale mixed dice",
    "resin-dice": "Wholesale resin dice",
    "sharp-edge": "Sharp edge resin dice",
    "liquid-core": "Liquid core dice",
    "metal-dice": "Metal dice wholesale",
    "private-label": "Private label packaging",
    "custom-rpg-dice": "Custom RPG dice",
  };

  if (program && programByCatalog[catalogName]) {
    program.value = programByCatalog[catalogName];
  } else if (program && programByParam[programParam]) {
    program.value = programByParam[programParam];
  }

  const message = formsubmitForm.querySelector("[name='Message']");
  if (message && !message.value) {
    const lines = [];

    if (catalogName) {
      lines.push(`Catalog: ${catalogName}`);
    }

    if (series) {
      lines.push(`Series: ${series}`);
    }

    if (sku) {
      lines.push(`SKU: ${sku}`);
    }

    if (programParam && programByParam[programParam]) {
      lines.push(`Program: ${programByParam[programParam]}`);
    }

    lines.push("");
    lines.push("Please quote MOQ, sample kit options, packaging choices, production lead time, and shipping assumptions for this inquiry.");
    message.value = lines.join("\n");
  }

  const context = document.querySelector("[data-quote-context]");
  const contextText = document.querySelector("[data-quote-context-text]");

  if (context && contextText) {
    const parts = [];

    if (catalogName) {
      parts.push(catalogName);
    }

    if (series) {
      parts.push(series);
    }

    if (sku) {
      parts.push(`SKU ${sku}`);
    }

    contextText.textContent = parts.length
      ? `This form is prefilled from: ${parts.join(" / ")}. Add quantity, packaging, delivery country, and launch date before submitting.`
      : "This form is prefilled from a catalog inquiry. Add SKU list, quantity, packaging, delivery country, and launch date before submitting.";
    context.hidden = false;
  }
}

prefillQuoteForm();

if (formsubmitForm) {
  const fileInput = formsubmitForm.querySelector("input[type='file']");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      const fileName = formsubmitForm.querySelector("[data-file-upload-name]");

      if (fileName) {
        fileName.textContent = file ? file.name : "No file selected";
      }

      if (!file) {
        return;
      }

      trackEvent("file_upload_select", {
        file_extension: file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "",
        file_size_kb: Math.round(file.size / 1024),
        form_name: "wholesale_quote_form",
      });
    });
  }
}

if (formsubmitForm) {
  let formSubmitTracked = false;

  formsubmitForm.addEventListener("submit", (event) => {
    const submitButton = formsubmitForm.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.textContent = "Submitting...";
      submitButton.disabled = true;
    }

    if (formSubmitTracked) {
      return;
    }

    event.preventDefault();

    trackEvent("generate_lead", {
      form_name: "wholesale_quote_form",
      form_destination: "formsubmit",
      lead_type: "wholesale_quote",
    }, () => {
      formSubmitTracked = true;
      formsubmitForm.submit();
    });
  });
}

if (pagePath().replace(/\/$/, "") === "/thank-you") {
  trackEvent("quote_thank_you_view", {
    lead_type: "wholesale_quote",
  });
}

function trackChatClick(action) {
  trackEvent("chat_click", {
    chat_provider: "tawk_to",
    chat_action: action,
    click_type: "live_chat",
  });
}

function initTawkTo() {
  if (window.__dndCustomDiceTawkLoaded) {
    return;
  }

  window.__dndCustomDiceTawkLoaded = true;
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const previousOnChatMaximized = window.Tawk_API.onChatMaximized;
  window.Tawk_API.onChatMaximized = function () {
    if (typeof previousOnChatMaximized === "function") {
      previousOnChatMaximized.apply(this, arguments);
    }

    trackChatClick("widget_maximized");
  };

  const script = document.createElement("script");
  const firstScript = document.getElementsByTagName("script")[0];

  script.async = true;
  script.src = "https://embed.tawk.to/6a4e5db1719f3a1d470d356d/1jt11rvik";
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  firstScript.parentNode.insertBefore(script, firstScript);
}

function initWhatsAppFloat() {
  if (!document.body || document.querySelector("[data-whatsapp-float]")) {
    return;
  }

  const link = document.createElement("a");

  link.className = "whatsapp-float";
  link.dataset.whatsappFloat = "true";
  link.href = "https://wa.me/8613922851014";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", "Chat with DND Custom Dice on WhatsApp");
  link.innerHTML = `
    <span class="whatsapp-float-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.59 5.93L.14 23.86l6.24-1.64a11.84 11.84 0 0 0 5.69 1.45h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.16-1.23-6.13-3.42-8.33ZM12.08 21.6h-.01a9.78 9.78 0 0 1-4.98-1.36l-.36-.21-3.7.97.99-3.61-.23-.37a9.78 9.78 0 0 1-1.5-5.18C2.29 6.44 6.68 2.05 12.09 2.05c2.62 0 5.08 1.02 6.93 2.87a9.75 9.75 0 0 1 2.87 6.94c0 5.4-4.4 9.79-9.81 9.79Z"/>
        <path d="M17.43 14.78c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.08-.3-.15-1.24-.46-2.36-1.47-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.05c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.71.63.72.23 1.38.2 1.9.12.58-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35Z"/>
      </svg>
    </span>
    <span>WhatsApp</span>
  `;

  document.body.appendChild(link);
}

initWhatsAppFloat();
initTawkTo();
