import "../styles/List.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import { apiUrl } from "../config/api";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const propertyList = user?.propertyList || [];

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const getPropertyList = async () => {
      try {
        const response = await fetch(apiUrl(`/users/${user._id}/properties`), {
          method: "GET",
        });
        const data = await response.json();
        dispatch(setPropertyList(Array.isArray(data) ? data : []));
      } catch (err) {
        console.log("Fetch all properties failed", err.message);
        dispatch(setPropertyList([]));
      } finally {
        setLoading(false);
      }
    };

    getPropertyList();
  }, [user?._id, dispatch]);

  if (!user?._id) {
    return (
      <>
        <Navbar />
        <PageHero
          image="/assets/modern_cat.webp"
          title="Your Property List"
          subtitle="List your space and welcome guests from around the world"
        />
        <div className="list-page">
          <EmptyState
            image="/assets/uploadPhoto.png"
            title="Become a host"
            message="Log in to view and manage the properties you have listed on DreamNest."
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
        image="/assets/countryside_cat.webp"
        title="Your Property List"
        subtitle={
          propertyList.length
            ? `Managing ${propertyList.length} ${propertyList.length === 1 ? "listing" : "listings"}`
            : "Share your space with travelers"
        }
      />
      <div className="list-page">
        {propertyList.length > 0 ? (
          <ListingGrid items={propertyList} />
        ) : (
          <EmptyState
            image="/assets/camping_cat.jpg"
            title="No listings yet"
            message="You haven't published any properties. Create your first listing with photos, amenities, and pricing."
            actionLabel="Create a listing"
            actionTo="/create-listing"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default PropertyList;
