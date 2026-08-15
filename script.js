/**
 * New Transaction Card
 * Live payment-form sync, flip-card preview, and demo POS swipe flow
 * for the checkout in index.html.
 */

(function () {
  "use strict";

  /* ==========================================================
     DOM REFS
     ========================================================== */
  const txnCard           = document.getElementById("txnCard");
  const checkoutShell     = document.getElementById("checkoutShell");
  const flipCard          = document.getElementById("flipCard");
  const paymentForm       = document.getElementById("paymentForm");
  const formNumber        = document.getElementById("formNumber");
  const formName          = document.getElementById("formName");
  const formExpiry        = document.getElementById("formExpiry");
  const formCvv           = document.getElementById("formCvv");
  const cardDisplayNumber = document.getElementById("cardDisplayNumber");
  const cardDisplayExpiry = document.getElementById("cardDisplayExpiry");
  const cardDisplayName   = document.getElementById("cardDisplayName");
  const cardDisplayCvv    = document.getElementById("cardDisplayCvv");
  const txnAmount         = document.getElementById("txnAmount");
  const txnLabel          = document.getElementById("txnLabel");
  const txnDots           = document.getElementById("txnDots");

  /* ==========================================================
     CONFIG — keep ORDER_TOTAL in sync with your markup
     ========================================================== */
  const ORDER_TOTAL  = "$21.85";
  const PAY_LABEL    = `Pay ${ORDER_TOTAL}`;
  const SWIPE_MS     = 1300;
  const PROCESSING_MS = 2500;
  const COMPLETE_MS  = 2500;

  const defaults = {
    number: "9759 2484 5269 6576",
    expiry: "1 2 / 2 4",
    name: "JOHN SMITH",
    cvv: "***",
  };

  let paymentPhase = "idle";
  let phaseTimer = null;
  let resetTimer = null;
  let dotsTimer = null;

  /* ==========================================================
     INPUT FORMATTERS
     Auto-spacing for card number and expiry; caret stays put.
     ========================================================== */
  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }

  function formatDisplayExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (!digits) return { text: defaults.expiry, empty: true };

    const month = digits.slice(0, 2).split("").join(" ");
    if (digits.length <= 2) {
      return { text: month, empty: false };
    }

    const year = digits.slice(2, 4).split("").join(" ");
    return { text: `${month} / ${year}`, empty: false };
  }

  function bindFormattedInput(input, formatter) {
    if (!input) return;

    input.addEventListener("input", () => {
      const start = input.selectionStart;
      const before = input.value;
      input.value = formatter(before);

      const digitsBefore = before.slice(0, start).replace(/\D/g, "").length;
      let nextPos = 0;
      let seenDigits = 0;

      for (let i = 0; i < input.value.length; i += 1) {
        if (/\d/.test(input.value[i])) seenDigits += 1;
        nextPos = i + 1;
        if (seenDigits >= digitsBefore) break;
      }

      input.setSelectionRange(nextPos, nextPos);
      syncCardPreview();
    });
  }

  /* ==========================================================
     VALIDATION — green ticks on each filled field
     ========================================================== */
  function isValidCardNumber(value) {
    return value.replace(/\D/g, "").length === 16;
  }

  function isValidName(value) {
    const trimmed = value.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\s'.-]+$/.test(trimmed);
  }

  function isValidExpiry(value) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 4) return false;

    const month = Number.parseInt(digits.slice(0, 2), 10);
    return month >= 1 && month <= 12;
  }

  function isValidCvv(value) {
    return /^\d{3}$/.test(value);
  }

  function syncFieldValidationState() {
    const fields = [
      [formNumber, isValidCardNumber],
      [formName, isValidName],
      [formExpiry, isValidExpiry],
      [formCvv, isValidCvv],
    ];

    fields.forEach(([field, validate]) => {
      const wrapper = field?.closest(".payment-form__field");
      if (!wrapper) return;
      wrapper.classList.toggle("is-valid", validate(field.value));
    });
  }

  /* ==========================================================
     CARD PREVIEW — flip-card mirrors live form input
     ========================================================== */
  function setDisplay(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function syncCardPreview() {
    const number = formNumber?.value.trim() ?? "";
    const name = formName?.value.trim() ?? "";
    const expiry = formExpiry?.value.trim() ?? "";
    const cvv = formCvv?.value.trim() ?? "";

    setDisplay(cardDisplayNumber, number || defaults.number);

    const expiryDisplay = formatDisplayExpiry(expiry);
    setDisplay(
      cardDisplayExpiry,
      expiry ? expiryDisplay.text : defaults.expiry
    );

    setDisplay(
      cardDisplayName,
      (name || defaults.name).toUpperCase()
    );

    setDisplay(cardDisplayCvv, cvv || defaults.cvv);
    syncFieldValidationState();
  }

  /* ==========================================================
     PAYMENT FLOW — demo swipe → processing → complete → reset
     Replace startPayment with your own charge handler.
     ========================================================== */
  function clearPaymentTimers() {
    if (phaseTimer) {
      clearTimeout(phaseTimer);
      phaseTimer = null;
    }

    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }

    if (dotsTimer) {
      clearInterval(dotsTimer);
      dotsTimer = null;
    }
  }

  function startDots() {
    if (!txnDots) return;

    let step = 0;
    txnDots.textContent = ".";

    dotsTimer = setInterval(() => {
      step = (step + 1) % 3;
      txnDots.textContent = ".".repeat(step + 1);
    }, 380);
  }

  function clearFormSuccess() {
    paymentForm?.classList.remove("is-success");
  }

  function markFormSuccess() {
    if (!paymentForm) return;

    syncFieldValidationState();
    paymentForm.classList.add("is-success");
  }

  function clearFlipPaymentState() {
    flipCard?.classList.remove("is-locked", "is-payment-processing");
  }

  function clearShellPaymentState() {
    checkoutShell?.classList.remove("is-payment-complete");
  }

  function resetPayment() {
    if (!txnCard) return;

    clearPaymentTimers();
    paymentPhase = "idle";

    txnCard.classList.remove("is-active", "is-processing", "is-complete", "is-busy");

    clearFlipPaymentState();
    clearShellPaymentState();
    clearFormSuccess();

    if (txnAmount) txnAmount.textContent = "$";
    if (txnLabel) txnLabel.textContent = PAY_LABEL;
    if (txnDots) txnDots.textContent = "";
  }

  function setProcessingState() {
    if (!txnCard || paymentPhase !== "swiping") return;

    paymentPhase = "processing";
    txnCard.classList.add("is-processing");

    flipCard?.classList.remove("is-flipped");
    flipCard?.classList.add("is-payment-processing");

    if (txnLabel) txnLabel.textContent = "Processing...";
    if (txnAmount) txnAmount.textContent = ORDER_TOTAL;
    startDots();

    phaseTimer = setTimeout(setCompleteState, PROCESSING_MS);
  }

  function setCompleteState() {
    if (!txnCard || paymentPhase !== "processing") return;

    paymentPhase = "complete";
    txnCard.classList.remove("is-processing");
    txnCard.classList.add("is-complete");

    flipCard?.classList.remove("is-payment-processing");
    flipCard?.classList.remove("is-flipped");
    checkoutShell?.classList.add("is-payment-complete");
    markFormSuccess();

    if (txnLabel) txnLabel.textContent = "Payment complete";
    if (txnAmount) txnAmount.textContent = "APPROVED";
    if (txnDots) txnDots.textContent = "";

    resetTimer = setTimeout(resetPayment, COMPLETE_MS);
  }

  function startPayment() {
    if (!txnCard || paymentPhase !== "idle") return;

    clearPaymentTimers();
    clearFormSuccess();
    paymentPhase = "swiping";

    flipCard?.classList.remove("is-flipped");
    clearShellPaymentState();
    flipCard?.classList.add("is-locked");

    txnCard.classList.add("is-active", "is-busy");
    if (txnAmount) txnAmount.textContent = ORDER_TOTAL;
    if (txnLabel) txnLabel.textContent = "Swiping...";

    phaseTimer = setTimeout(setProcessingState, SWIPE_MS);
  }

  /* ==========================================================
     FLIP CARD — manual flip on click; auto-flip on CVV focus
     ========================================================== */
  function bindFlipCard() {
    if (!flipCard) return;

    flipCard.addEventListener("click", () => {
      if (paymentPhase !== "idle") return;
      flipCard.classList.toggle("is-flipped");
    });

    flipCard.addEventListener("keydown", (event) => {
      if (paymentPhase !== "idle") return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flipCard.classList.toggle("is-flipped");
      }
    });
  }

  /* ==========================================================
     EVENT BINDINGS
     ========================================================== */
  bindFormattedInput(formNumber, formatCardNumber);
  bindFormattedInput(formExpiry, formatExpiry);

  if (formName) {
    formName.addEventListener("input", () => {
      formName.value = formName.value.toUpperCase();
      syncCardPreview();
    });
  }

  if (formCvv) {
    formCvv.addEventListener("input", () => {
      formCvv.value = formCvv.value.replace(/\D/g, "").slice(0, 3);
      syncCardPreview();
    });

    formCvv.addEventListener("focus", () => {
      if (paymentPhase !== "idle") return;
      flipCard?.classList.add("is-flipped");
    });
  }

  [formNumber, formName, formExpiry].forEach((field) => {
    field?.addEventListener("focus", () => {
      if (paymentPhase !== "idle") return;
      flipCard?.classList.remove("is-flipped");
    });
  });

  if (txnCard) {
    txnCard.addEventListener("click", startPayment);
  }

  bindFlipCard();

  document.addEventListener("pointerdown", (event) => {
    if (txnCard && !txnCard.contains(event.target) && paymentPhase === "idle") {
      resetPayment();
    }

    if (
      flipCard &&
      paymentPhase === "idle" &&
      !flipCard.contains(event.target) &&
      !event.target.closest(".payment-form")
    ) {
      flipCard.classList.remove("is-flipped");
    }
  });

  /* ==========================================================
     INIT
     ========================================================== */
  syncCardPreview();
})();
