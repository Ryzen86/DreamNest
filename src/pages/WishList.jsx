import { useEffect, useRef, useState } from "react";
import "../styles/List.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import Loader from "../components/Loader";
import { apiUrl, getAuthHeaders } from "../config/api";
import { setLogin } from "../redux/state";
import { useParams } from "react-router-dom";

const WishList = () => {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const wishList = user?.wishList || [];
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(Boolean(user?._id && token));
  const [error, setError] = useState("");
  const refreshed = useRef(false);

  useEffect(() => {
    if (!user?._id || !token) {
      setLoading(false);
      return;
    }

    if (routeUserId && routeUserId !== user._id) {
      setError("You can only view your own wishlist.");
      setLoading(false);
      return;
    }

    if (refreshed.current) {
      setLoading(false);
      return;
    }
    refreshed.current = true;

    const refreshWishList = async () => {
      try {
        setError("");
        const response = await fetch(apiUrl("/auth/session"), {
          method: "POST",
          headers: getAuthHeaders(token, { "Content-Type": "application/json" }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.message || "Failed to refresh wishlist.");
          return;
        }
        dispatch(setLogin({ user: data.user, token: data.token }));
      } catch (err) {
        console.log("Wishlist refresh failed", err.message);
        setError("Cannot reach the API server.");
      } finally {
        setLoading(false);
      }
    };

    refreshWishList();
  }, [user?._id, token, routeUserId, dispatch]);

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

  if (loading) return <Loader />;

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
      {error && (
        <p className="list-success" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
      <div className="list-page">
        {!error && wishList.length > 0 ? (
          <ListingGrid items={wishList} />
        ) : !error ? (
          <EmptyState
            image="/assets/windmill_cat.webp"
            title="Your wishlist is empty"
            message="Browse listings and tap the heart icon to save properties you want to book later."
            actionLabel="Explore stays"
            actionTo="/"
          />
        ) : null}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
