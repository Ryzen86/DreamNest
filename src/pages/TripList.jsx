import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import { apiUrl, getAuthHeaders } from "../config/api";
import { useLocation, useParams } from "react-router-dom";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const userId = user?._id;
  const tripList = user?.tripList || [];
  const location = useLocation();
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    if (routeUserId && routeUserId !== userId) {
      setError("You can only view your own trips.");
      setLoading(false);
      return;
    }

    const getTripList = async () => {
      try {
        setError("");
        const response = await fetch(apiUrl(`/users/${userId}/trips`), {
          method: "GET",
          headers: getAuthHeaders(token),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.message || "Failed to load trips.");
          dispatch(setTripList([]));
          return;
        }
        dispatch(setTripList(Array.isArray(data) ? data : []));
      } catch (err) {
        console.log("Fetch Trip List failed!", err.message);
        setError("Cannot reach the API server.");
        dispatch(setTripList([]));
      } finally {
        setLoading(false);
      }
    };

    getTripList();
  }, [userId, token, routeUserId, dispatch]);

  if (!userId) {
    return (
      <>
        <Navbar />
        <PageHero
          image="/assets/island_cat.webp"
          title="Your Trip List"
          subtitle="All the adventures you've booked in one place"
        />
        <div className="list-page">
          <EmptyState
            image="/assets/skiing_cat.jpg"
            title="Sign in to see your trips"
            message="Log in to view upcoming and past bookings you've made on DreamNest."
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
        image="/assets/lake_cat.webp"
        title="Your Trip List"
        subtitle={
          tripList.length
            ? `${tripList.length} booked ${tripList.length === 1 ? "trip" : "trips"}`
            : "Your next getaway starts here"
        }
      />
      {successMessage && <p className="list-success">{successMessage}</p>}
      {error && <p className="list-success" style={{ color: "#c0392b" }}>{error}</p>}
      <div className="list-page">
        {!error && tripList.length > 0 ? (
          <ListingGrid items={tripList} booking />
        ) : !error ? (
          <EmptyState
            image="/assets/desert_cat.webp"
            title="No trips booked yet"
            message="Find a stay you love, pick your dates, and confirm your booking to see it here."
            actionLabel="Browse listings"
            actionTo="/"
          />
        ) : null}
      </div>
      <Footer />
    </>
  );
};

export default TripList;
