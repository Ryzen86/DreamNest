import { useState, useEffect } from "react";
import "../styles/List.scss";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { getCategoryImage } from "../data";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import { apiUrl } from "../config/api";

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const dispatch = useDispatch();
  const listings = useSelector((state) => state.listings) || [];

  useEffect(() => {
    const getFeedListings = async () => {
      try {
        const response = await fetch(
          apiUrl(`/properties?category=${category}`),
          { method: "GET" }
        );
        const data = await response.json();
        dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.log("Fetch Listings Failed", err.message);
        dispatch(setListings({ listings: [] }));
      } finally {
        setLoading(false);
      }
    };

    getFeedListings();
  }, [category, dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <PageHero
        image={getCategoryImage(category)}
        title={`${category} stays`}
        subtitle={
          listings.length
            ? `${listings.length} ${listings.length === 1 ? "property" : "properties"} available`
            : "Discover unique places in this category"
        }
      />
      <div className="list-page">
        {listings.length > 0 ? (
          <ListingGrid items={listings} />
        ) : (
          <EmptyState
            image={getCategoryImage(category)}
            title={`No ${category} listings yet`}
            message="Try another category or check back soon as hosts add new properties."
            actionLabel="Back to home"
            actionTo="/"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;
