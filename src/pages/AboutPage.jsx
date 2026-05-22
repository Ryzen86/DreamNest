import InfoPage from "../components/InfoPage";

const AboutPage = () => (
  <InfoPage title="About DreamNest" image="/assets/slide.jpg">
    <img src="/assets/logo.png" alt="DreamNest" className="info-page_inline" />
    <p>
      DreamNest is a full-stack rental and booking platform built with the MERN
      stack. We help travelers discover unique stays—from beachfront villas to
      countryside windmills—and give hosts the tools to list and manage their
      properties with confidence.
    </p>
    <h2>Our mission</h2>
    <p>
      Make every trip feel like home. We combine secure authentication, smart
      search, wishlists, and seamless bookings so guests and hosts can focus on
      what matters: great experiences.
    </p>
    <h2>What we offer</h2>
    <ul>
      <li>Search and filter properties by category and location</li>
      <li>Save favorites to your wishlist</li>
      <li>Book stays with clear pricing and dates</li>
      <li>Host dashboard for listings and reservations</li>
    </ul>
    <img src="/assets/beach_cat.jpg" alt="Beach stays" className="info-page_inline" />
  </InfoPage>
);

export default AboutPage;
