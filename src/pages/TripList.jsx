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
import { apiUrl } from "../config/api";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const tripList = user?.tripList || [];

  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const getTripList = async () => {
      try {
        const response = await fetch(apiUrl(`/users/${userId}/trips`), {
          method: "GET",
        });
        const data = await response.json();
        dispatch(setTripList(Array.isArray(data) ? data : []));
      } catch (err) {
        console.log("Fetch Trip List failed!", err.message);
        dispatch(setTripList([]));
      } finally {
        setLoading(false);
      }
    };

    getTripList();
  }, [userId, dispatch]);

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
      <div className="list-page">
        {tripList.length > 0 ? (
          <ListingGrid items={tripList} booking />
        ) : (
          <EmptyState
            image="/assets/desert_cat.webp"
            title="No trips booked yet"
            message="Find a stay you love, pick your dates, and confirm your booking to see it here."
            actionLabel="Browse listings"
            actionTo="/"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default TripList;
