import "../styles/List.scss";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";

const WishList = () => {
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];

  if (!user?._id) {
    return (
      <>
        <Navbar />
        <PageHero
          image="/assets/lux_cat.jpg"
          title="Your Wish List"
          subtitle="Sign in to save and view your favorite stays"
        />
        <div className="list-page">
          <EmptyState
            image="/assets/addImage.png"
            title="Sign in to see your wishlist"
            message="Create an account or log in, then tap the heart on any listing to save it here."
            actionLabel="Log in"
            actionTo="/login"
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageHero
        image="/assets/beach_cat.jpg"
        title="Your Wish List"
        subtitle={
          wishList.length
            ? `${wishList.length} saved ${wishList.length === 1 ? "stay" : "stays"}`
            : "Save places you love for your next trip"
        }
      />
      <div className="list-page">
        {wishList.length > 0 ? (
          <ListingGrid items={wishList} />
        ) : (
          <EmptyState
            image="/assets/windmill_cat.webp"
            title="Your wishlist is empty"
            message="Browse listings and tap the heart icon to save properties you want to book later."
            actionLabel="Explore stays"
            actionTo="/"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
