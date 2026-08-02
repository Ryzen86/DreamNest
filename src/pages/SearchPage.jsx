import { useParams } from "react-router-dom";
import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import ListingGrid from "../components/ListingGrid";
import { apiUrl } from "../config/api";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const { search } = useParams();
  const listings = useSelector((state) => state.listings) || [];

  const dispatch = useDispatch();

  useEffect(() => {
    const getSearchListings = async () => {
      try {
        const response = await fetch(
          apiUrl(`/properties/search/${encodeURIComponent(search || "")}`),
          { method: "GET" }
        );
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          dispatch(setListings({ listings: [] }));
          return;
        }
        dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.log("Fetch Search List failed!", err.message);
        dispatch(setListings({ listings: [] }));
      } finally {
        setLoading(false);
      }
    };

    getSearchListings();
  }, [search, dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <PageHero
        image="/assets/slide.jpg"
        title={`Results for "${search}"`}
        subtitle={
          listings.length
            ? `Found ${listings.length} ${listings.length === 1 ? "match" : "matches"}`
            : "Search by city, country, or property type"
        }
      />
      <div className="list-page">
        {listings.length > 0 ? (
          <ListingGrid items={listings} />
        ) : (
          <EmptyState
            image="/assets/cave_cat.jpg"
            title="No results found"
            message={`We couldn't find listings matching "${search}". Try Miami, Amsterdam, Beachfront, or Villa.`}
            actionLabel="View all stays"
            actionTo="/"
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
