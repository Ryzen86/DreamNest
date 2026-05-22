import { Link } from "react-router-dom";
import "../styles/EmptyState.scss";

const EmptyState = ({
  image = "/assets/slide.jpg",
  title = "Nothing here yet",
  message = "Check back later or explore other stays on DreamNest.",
  actionLabel,
  actionTo = "/",
}) => {
  return (
    <div className="empty-state">
      <img src={image} alt="" className="empty-state_image" />
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && (
        <Link to={actionTo} className="empty-state_btn">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
