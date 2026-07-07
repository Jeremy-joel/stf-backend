# Connecting Your Main Website to This Backend

Add these three things to your **existing** `index.html` / `script.js` (the site you already have). Do not replace your whole site — just add these pieces inside the `#donate` section.

---

## 1. Add the Flutterwave script to `index.html`

Put this line right before `</body>`, above your existing `<script src="script.js"></script>`:

```html
<script src="https://checkout.flutterwave.com/v3.js"></script>
```

## 2. Add a "Pay Online" option inside your Donate section

Inside the `.donate-card` in `index.html`, add this above or below the bank transfer details:

```html
<div class="online-donate">
  <h3>Donate Online (M-Pesa or Card)</h3>
  <form id="online-donate-form">
    <input type="text" id="od-name" placeholder="Full Name" required>
    <input type="email" id="od-email" placeholder="Email" required>
    <input type="tel" id="od-phone" placeholder="Phone (for M-Pesa)" required>
    <input type="number" id="od-amount" placeholder="Amount (KES)" required min="10">
    <button type="submit" class="btn btn-rust">Pay Now</button>
  </form>
</div>
```

## 3. Add this to the bottom of your `script.js`

Replace `YOUR_BACKEND_URL` with your real Render URL once deployed (e.g. `https://sff-backend.onrender.com`).

```javascript
const BACKEND_URL = 'YOUR_BACKEND_URL';

const onlineForm = document.getElementById('online-donate-form');
if (onlineForm) {
  onlineForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const donorName = document.getElementById('od-name').value;
    const donorEmail = document.getElementById('od-email').value;
    const donorPhone = document.getElementById('od-phone').value;
    const amount = Number(document.getElementById('od-amount').value);

    // Step 1: ask our backend to create a pending donation + get a reference
    const initRes = await fetch(`${BACKEND_URL}/api/donations/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donorName, donorEmail, donorPhone, amount, paymentMethod: 'mpesa' })
    });
    const initData = await initRes.json();

    if (!initRes.ok) {
      alert(initData.message || 'Could not start donation.');
      return;
    }

    // Step 2: open the Flutterwave popup (handles M-Pesa STK push AND card)
    FlutterwaveCheckout({
      public_key: initData.publicKey,
      tx_ref: initData.txRef,
      amount: amount,
      currency: 'KES',
      payment_options: 'mpesa, card',
      customer: { email: donorEmail, phone_number: donorPhone, name: donorName },
      customizations: {
        title: 'Save the Family Foundation',
        description: 'Donation to support vulnerable children and families'
      },
      callback: async (response) => {
        // Step 3: ask our backend to verify with Flutterwave's servers directly
        const verifyRes = await fetch(`${BACKEND_URL}/api/donations/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: response.transaction_id, txRef: initData.txRef })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          alert('Thank you! Your donation was received successfully.');
          onlineForm.reset();
        } else {
          alert(verifyData.message || 'We could not confirm your payment. Please contact us.');
        }
      },
      onclose: () => {}
    });
  });
}
```

That's it — no other changes needed to your existing site.
