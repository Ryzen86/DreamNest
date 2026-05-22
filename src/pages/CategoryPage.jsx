import { useState, useEffect } from "react";
import "../styles/List.scss";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer"
import { apiUrl } from "../config/api";

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);
  const { category } = useParams()

  const dispatch = useDispatch()
  const listings = useSelector((state) => state.listings) || [];

  useEffect(() => {
    const getFeedListings = async () => {
      try {
        const response = await fetch(
          apiUrl(`/properties?category=${category}`),
          {
            method: "GET",
          }
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

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">{category} listings</h1>
      <div className="list">
        {listings?.map(
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
      <Footer />
    </>
  );
};

export default CategoryPage;
