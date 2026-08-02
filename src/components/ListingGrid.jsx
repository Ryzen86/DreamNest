import ListingCard from "./ListingCard";

const ListingGrid = ({ items, booking = false }) => {
  if (!items?.length) return null;

  return (
    <div className="list">
      {items.map((item) => {
        if (booking) {
          const listing =
            item.listingId && typeof item.listingId === "object"
              ? item.listingId
              : null;

          if (!listing?._id) {
            return (
              <div key={item._id || Math.random()} className="listing-card">
                <h3>Listing unavailable</h3>
                <p>
                  {item.startDate} - {item.endDate}
                </p>
              </div>
            );
          }

          return (
            <ListingCard
              key={item._id || listing._id}
              listingId={listing._id}
              creator={item.hostId}
              listingPhotoPaths={listing.listingPhotoPaths}
              city={listing.city}
              province={listing.province}
              country={listing.country}
              category={listing.category}
              startDate={item.startDate}
              endDate={item.endDate}
              totalPrice={item.totalPrice}
              booking={true}
            />
          );
        }

        const {
          _id,
          creator,
          listingPhotoPaths,
          city,
          province,
          country,
          category,
          type,
          price,
        } = item;

        if (!_id) return null;

        return (
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
        );
      })}
    </div>
  );
};

export default ListingGrid;
