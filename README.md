t# New Transaction Card

Checkout card with live payment-form sync, a 3D flip-card preview, and a POS swipe-to-pay micro-interaction. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Payment form | Card number, name, expiry, and CVV fields with live formatting | Yes — input masks and validation ticks |
| Flip-card preview | Mastercard-style card mirrors form input; flips on CVV focus | Yes — sync + flip state |
| POS pay button | Credit card swipes through a terminal, then processing and success | Yes — timed payment phases |
| Order summary | Product thumbnail, line items, and total | No — static markup |
| Paid overlay | Frosted veil and stamped "PAID" on success | No — CSS driven by `.is-payment-complete` |
| Ambient background | Soft mint and violet glow behind the checkout | No — CSS only |
| Responsive layout | Checkout stacks on narrow screens | No — CSS only |

## Quick preview

Open `index.html` in your browser. Fill in the payment fields to see the card preview update, then click **Pay $21.85** to run the swipe animation.

## Real payments — use Stripe (or similar)

This pack is a **UI and animation demo only**. It does not process card payments, store card data, or meet PCI requirements. In production, you should never collect raw card numbers in your own backend — use a trusted payment provider instead.

**Stripe** is the most common choice: it handles card security, fraud checks, and compliance for you. Your server creates a payment intent; Stripe confirms the charge; you show success or failure in your UI.

### How to use this checkout UI with Stripe

1. **Keep the layout and animations** — order summary, flip-card preview, pay button, and paid overlay from this pack.
2. **Replace the demo card fields** with [Stripe Payment Element](https://stripe.com/docs/payments/payment-element) or [Stripe Elements](https://stripe.com/docs/payments/elements) inside your payment form area. Stripe renders secure, hosted inputs so card data goes straight to Stripe, not your server.
3. **Style Stripe to match** — use Stripe’s [appearance API](https://stripe.com/docs/elements/appearance-api) so their fields sit cleanly inside `.payment-form` (borders, radius, fonts, colours).
4. **On pay click** — instead of the demo `startPayment()` flow, call your backend to create a PaymentIntent, then `stripe.confirmPayment()` (or `confirmCardPayment` with Elements). Run the swipe animation while Stripe processes.
5. **On success** — call `setCompleteState()` (or add `.is-payment-complete` to `.checkout-shell`) to trigger the paid stamp and form success styles. On failure, reset the button and show Stripe’s error message.

A minimal flow looks like this:

```
User clicks Pay → your UI plays swipe animation
                → frontend asks your server for a client secret
                → Stripe confirms the payment
                → success: show PAID overlay  |  failure: show error, reset button
```

You will need a small backend endpoint (Node, PHP, Python, etc.) to create PaymentIntents with your **secret** Stripe key. Never put secret keys in `script.js` — only the publishable key belongs in the browser.

The flip-card preview can stay as a visual mirror for demos, or you can remove it once Stripe’s fields are the source of truth. The POS pay button and success overlay work the same either way.

## Use in your own project

1. **Copy the checkout pieces you need** from `index.html` into your own checkout page: `.checkout-shell`, order summary, payment form area, flip-card preview, and `.txn-card` pay button. Copy the ambient background only if you want the demo atmosphere.
2. **Keep required IDs or update the JS.** The demo script reads the payment fields, flip-card preview, and pay button by selector. Keep those IDs/classes or update the selectors in `script.js`.
3. **Copy the CSS sections into your own stylesheet.** Start with the `:root` custom properties you want to keep, then copy the checkout shell, form, flip-card, transaction card, paid overlay, and responsive blocks. Skip page-level background/layout rules if your app already handles them.
4. **Bring over only the assets you use.** Copy `images/card-chip.png` if you keep the flip-card chip graphic. Replace it or remove that layer if your design does not need it.
5. **Wire up real payments** — see [Real payments — use Stripe (or similar)](#real-payments--use-stripe-or-similar) above. Replace `startPayment` in `script.js` with your Stripe confirm flow and call `setCompleteState()` when the charge succeeds.
6. **Adjust copy and totals** — change product details, `ORDER_TOTAL` in `script.js`, and CSS custom properties in `:root` (`--mint`, `--txn-width`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, `script.js`, and `images/` together and link them as-is. For real projects, merging the checkout markup, CSS blocks, assets, and payment hooks into your existing flow is usually cleaner.

## File structure

```
index.html       Checkout markup — form, flip card, and POS pay button
style.css        Global styles + checkout, form, flip card, and swipe animation
script.js        Form sync, flip-card state, and demo payment flow
images/          card-chip.png — chip graphic on the flip-card front
LICENSE.txt      Usage terms
```

## Customisation tips

- Pay button size is controlled by `--txn-width`, `--txn-height`, and `--txn-scale` in `:root`.
- Payment timing lives at the top of `script.js` (`SWIPE_MS`, `PROCESSING_MS`, `COMPLETE_MS`) — tweak to match your animation pace, or sync them with your Stripe request timing.
- The ambient background is optional — remove the `.ambient` divs if you don't need them.
- The order summary is static demo content. Swap the `.order-summary` block for your own cart data.
- Fonts are loaded from Google Fonts (`Lexend Deca`, `Syne`). Swap the `<link>` in `index.html` or update `font-family` in `style.css`.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
