import InfoPage from "../components/InfoPage";

const RefundPage = () => (
  <InfoPage title="Return and Refund Policy" image="/assets/lux_cat.jpg">
    <p>
      We want every guest to feel confident when booking on DreamNest. Refund
      eligibility depends on the host&apos;s cancellation policy and how far in
      advance you cancel.
    </p>
    <h2>Standard policy</h2>
    <ul>
      <li>Full refund if you cancel at least 7 days before check-in</li>
      <li>50% refund if you cancel 3–6 days before check-in</li>
      <li>No refund within 48 hours of check-in unless required by law</li>
    </ul>
    <h2>How to request a refund</h2>
    <p>
      Contact support at dreamnest@support.com with your booking details. We
      review requests within 2 business days and process approved refunds to
      your original payment method.
    </p>
    <img src="/assets/island_cat.webp" alt="Island getaway" className="info-page_inline" />
  </InfoPage>
);

export default RefundPage;
