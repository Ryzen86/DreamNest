import InfoPage from "../components/InfoPage";

const TermsPage = () => (
  <InfoPage title="Terms and Conditions" image="/assets/modern_cat.webp">
    <p>Last updated: May 2026</p>
    <h2>Using DreamNest</h2>
    <p>
      By accessing DreamNest you agree to these terms. You must provide accurate
      information when registering and keep your account credentials secure.
    </p>
    <h2>Bookings</h2>
    <p>
      Guests are responsible for reviewing listing details, dates, and total
      price before confirming a reservation. Hosts are responsible for
      maintaining accurate listings and honoring confirmed bookings.
    </p>
    <h2>Conduct</h2>
    <ul>
      <li>No fraudulent listings or misleading photos</li>
      <li>Respect local laws and community guidelines</li>
      <li>Report safety or policy concerns to dreamnest@support.com</li>
    </ul>
    <img src="/assets/payment.png" alt="Secure payments" className="info-page_inline" />
  </InfoPage>
);

export default TermsPage;
