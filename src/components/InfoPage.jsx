import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/InfoPage.scss";

const InfoPage = ({ title, image, children }) => {
  return (
    <>
      <Navbar />
      <div
        className="info-page_hero"
        style={{
          backgroundImage: `linear-gradient(rgba(36, 53, 90, 0.75), rgba(36, 53, 90, 0.75)), url(${image})`,
        }}
      >
        <h1>{title}</h1>
      </div>
      <article className="info-page_content">{children}</article>
      <Footer />
    </>
  );
};

export default InfoPage;
