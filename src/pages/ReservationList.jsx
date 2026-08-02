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
import { apiUrl, getAuthHeaders } from "../config/api";
import { useParams } from "react-router-dom";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const userId = user?._id;
  const reservationList = user?.reservationList || [];
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    if (routeUserId && routeUserId !== userId) {
      setError("You can only view your own reservations.");
      setLoading(false);
      return;
    }

    const getReservationList = async () => {
      try {
        setError("");
        const response = await fetch(apiUrl(`/users/${userId}/reservations`), {
          method: "GET",
          headers: getAuthHeaders(token),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.message || "Failed to load reservations.");
          dispatch(setReservationList([]));
          return;
        }
        dispatch(setReservationList(Array.isArray(data) ? data : []));
      } catch (err) {
        console.log("Fetch Reservation List failed!", err.message);
        setError("Cannot reach the API server.");
        dispatch(setReservationList([]));
      } finally {
        setLoading(false);
      }
    };

    getReservationList();
  }, [userId, token, routeUserId, dispatch]);

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
      {error && <p className="list-success" style={{ color: "#c0392b" }}>{error}</p>}
      <div className="list-page">
        {!error && reservationList.length > 0 ? (
          <ListingGrid items={reservationList} booking />
        ) : !error ? (
          <EmptyState
            image="/assets/arctic_cat.webp"
            title="No reservations yet"
            message="When guests book your properties, their stays will show up here. List a property to start hosting."
            actionLabel="Create a listing"
            actionTo="/create-listing"
          />
        ) : null}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
