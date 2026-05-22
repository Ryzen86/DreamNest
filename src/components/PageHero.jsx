import "../styles/PageHero.scss";

const PageHero = ({ image, title, subtitle }) => {
  return (
    <div
      className="page-hero"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${image})` }}
    >
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default PageHero;
