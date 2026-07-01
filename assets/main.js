const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

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
