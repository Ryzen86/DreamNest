/**
 * Load Razorpay Checkout script once.
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src*="checkout.razorpay.com"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Open Razorpay checkout modal.
 * @returns {Promise<object>} Resolves with payment response on success.
 */
export const openRazorpayCheckout = ({
  keyId,
  orderId,
  amountInPaise,
  title,
  user,
  onDismiss,
}) =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }

    let settled = false;

    const options = {
      key: keyId,
      amount: amountInPaise,
      currency: "INR",
      name: "DreamNest",
      description: title || "Property booking",
      order_id: orderId,
      prefill: {
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email || "",
      },
      theme: { color: "#F8395A" },
      handler: (response) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (typeof onDismiss === "function") onDismiss();
          if (!settled) {
            settled = true;
            reject(new Error("Payment cancelled"));
          }
        },
        escape: true,
        confirm_close: true,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (resp) => {
      if (!settled) {
        settled = true;
        reject(new Error(resp.error?.description || "Payment failed"));
      }
    });
    razorpay.open();
  });
