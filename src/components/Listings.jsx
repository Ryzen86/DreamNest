import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import EmptyState from "./EmptyState";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import { apiUrl } from "../config/api";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");

  const listings = useSelector((state) => state.listings) || [];
  const location = useLocation();

  useEffect(() => {
    const getFeedListings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          selectedCategory !== "All"
            ? apiUrl(
                `/properties?category=${encodeURIComponent(selectedCategory)}`
              )
            : apiUrl("/properties"),
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.log("Fetch Listings Failed", err.message);
        dispatch(setListings({ listings: [] }));
        setError(
          "Cannot load listings. Start the API server on port 3002, then refresh."
        );
      } finally {
        setLoading(false);
      }
    };

    getFeedListings();
  }, [selectedCategory, dispatch, location.key]);

  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${category.label === selectedCategory ? "selected" : ""}`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState
          image="/assets/slide.jpg"
          title="Could not load listings"
          message={error}
          actionLabel="Refresh page"
          actionTo="/"
        />
      ) : listings.length === 0 ? (
        <EmptyState
          image="/assets/beach_cat.jpg"
          title="No listings available"
          message="Start the API server and run npm run seed in the server folder, then refresh."
          actionLabel="Try again"
          actionTo="/"
        />
      ) : (
        <div className="listings">
          {listings.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default Listings;
