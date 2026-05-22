import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import { apiUrl } from "../config/api";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const reservationList = user?.reservationList || [];

  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const getReservationList = async () => {
      try {
        const response = await fetch(apiUrl(`/users/${userId}/reservations`), {
          method: "GET",
        });
        const data = await response.json();
        dispatch(setReservationList(Array.isArray(data) ? data : []));
      } catch (err) {
        console.log("Fetch Reservation List failed!", err.message);
        dispatch(setReservationList([]));
      } finally {
        setLoading(false);
      }
    };

    getReservationList();
  }, [userId, dispatch]);

  if (!userId) {
    return (
      <>
        <Navbar />
        <PageHero
          image="/assets/castle_cat.webp"
          title="Your Reservation List"
          subtitle="Manage bookings guests have made at your properties"
        />
        <div className="list-page">
          <EmptyState
            image="/assets/barn_cat.jpg"
            title="Sign in as a host"
            message="Log in with your host account to see reservations for your listings."
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
        image="/assets/pool_cat.jpg"
        title="Your Reservation List"
        subtitle={
          reservationList.length
            ? `${reservationList.length} guest ${reservationList.length === 1 ? "reservation" : "reservations"}`
            : "Guests who book your listings appear here"
        }
      />
      <div className="list-page">
        {reservationList.length > 0 ? (
          <ListingGrid items={reservationList} booking />
        ) : (
          <EmptyState
            image="/assets/arctic_cat.webp"
            title="No reservations yet"
            message="When guests book your properties, their stays will show up here. List a property to start hosting."
            actionLabel="Create a listing"
            actionTo="/create-listing"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
