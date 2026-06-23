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

function pagePath() {
  return window.location.pathname || "/";
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
    trackEvent("quote_click", {
      link_text: linkText(link),
      link_url: link.href,
      click_type: "request_quote",
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
