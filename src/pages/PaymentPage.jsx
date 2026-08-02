import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { apiUrl, getAuthHeaders } from "../config/api";
import { formatINR } from "../utils/currency";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpay";
import { setLogin, setLogout } from "../redux/state";
import "../styles/PaymentPage.scss";

const BOOKING_STORAGE_KEY = "dreamnest_booking_draft";

const readStoredBooking = () => {
  try {
    const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearStoredBooking = () => {
  try {
    sessionStorage.removeItem(BOOKING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storedUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const initRef = useRef(false);

  const bookingDraft = location.state?.booking || readStoredBooking();

  const [activeUser, setActiveUser] = useState(storedUser);
  const [authToken, setAuthToken] = useState(token);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [sessionStale, setSessionStale] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [demoCard, setDemoCard] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (!storedUser?._id) {
      navigate("/login", { state: { from: "/payment", booking: bookingDraft } });
      return;
    }

    if (!bookingDraft?.listingId || !bookingDraft?.startDate || !bookingDraft?.endDate) {
      navigate("/");
      return;
    }

    try {
      sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookingDraft));
    } catch {
      /* ignore */
    }

    if (initRef.current) return;
    initRef.current = true;

    const initPayment = async () => {
      try {
        const sessionRes = await fetch(apiUrl("/auth/session"), {
          method: "POST",
          headers: getAuthHeaders(token, { "Content-Type": "application/json" }),
        });

        const sessionData = await sessionRes.json().catch(() => ({}));

        if (!sessionRes.ok) {
          setSessionStale(true);
          setError(
            sessionData.message || "Your session expired. Please log in again."
          );
          return;
        }

        dispatch(
          setLogin({ user: sessionData.user, token: sessionData.token })
        );
        setActiveUser(sessionData.user);
        setAuthToken(sessionData.token);

        const response = await fetch(apiUrl("/payments/create-order"), {
          method: "POST",
          headers: getAuthHeaders(sessionData.token, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            listingId: bookingDraft.listingId,
            startDate: bookingDraft.startDate,
            endDate: bookingDraft.endDate,
            listingTitle: bookingDraft.listingTitle,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (data.code === "SESSION_STALE") {
            setSessionStale(true);
          }
          setError(data.message || "Could not start payment");
          return;
        }

        setOrderData(data);
        setDemoCard({
          name: `${sessionData.user.firstName || ""} ${sessionData.user.lastName || ""}`.trim(),
          email: sessionData.user.email || "",
        });
      } catch (err) {
        setError("Cannot reach payment server. Is the API running on port 3002?");
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [storedUser?._id, token, bookingDraft, navigate, dispatch]);

  const handleReLogin = () => {
    dispatch(setLogout());
    navigate("/login", { state: { from: "/payment", booking: bookingDraft } });
  };

  const completeBooking = async (verifyPayload) => {
    const response = await fetch(apiUrl("/payments/verify"), {
      method: "POST",
      headers: getAuthHeaders(authToken || token, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(verifyPayload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data.code === "SESSION_STALE") {
        setSessionStale(true);
      }
      throw new Error(data.message || "Payment failed");
    }
    return data;
  };

  const handleRazorpayPay = async () => {
    setError("");
    setPaying(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error(
          "Failed to load Razorpay checkout. Check your internet connection."
        );
      }

      const response = await openRazorpayCheckout({
        keyId: orderData.keyId,
        orderId: orderData.orderId,
        amountInPaise: orderData.amountInPaise,
        title: bookingDraft.listingTitle,
        user: activeUser,
      });

      await completeBooking({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        bookingDetails: orderData.bookingDetails,
      });

      clearStoredBooking();
      navigate(`/${activeUser._id}/trips`, {
        state: {
          message: "Payment successful! Your trip is confirmed via Razorpay.",
        },
      });
    } catch (err) {
      if (err.message !== "Payment cancelled") {
        setError(err.message);
      }
      setPaying(false);
    }
  };

  const handleDemoPay = async (e) => {
    e.preventDefault();
    setError("");
    setPaying(true);

    if (!demoCard.name.trim() || !demoCard.email.trim()) {
      setError("Please enter your name and email.");
      setPaying(false);
      return;
    }

    try {
      await completeBooking({
        demoMode: true,
        bookingDetails: orderData.bookingDetails,
      });
      clearStoredBooking();
      navigate(`/${activeUser._id}/trips`, {
        state: { message: "Payment successful! Your trip is confirmed." },
      });
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loading) return <Loader />;

  if (!orderData) {
    return (
      <>
        <Navbar />
        <div className="payment-page">
          <div className="payment-page_card">
            <p className="payment-page_error">{error || "Unable to load payment."}</p>
            {sessionStale && (
              <button
                type="button"
                className="payment-page_relogin"
                onClick={handleReLogin}
              >
                Log in again
              </button>
            )}
            <Link to="/" className="payment-page_back">
              Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { amount, demoMode } = orderData;
  const nights =
    orderData.bookingDetails?.nightCount || bookingDraft.nightCount || "—";
  const pricePerNight =
    orderData.bookingDetails?.pricePerNight || bookingDraft.pricePerNight;

  return (
    <>
      <Navbar />
      <div className="payment-page">
        <div className="payment-page_card">
          <h1>Complete your booking</h1>
          <p className="payment-page_subtitle">
            {demoMode
              ? "Demo payment (add Razorpay keys for live UPI & cards)"
              : "Secure checkout powered by Razorpay · INR"}
          </p>

          <div className="payment-page_summary">
            <h2>{bookingDraft.listingTitle}</h2>
            <p>
              {bookingDraft.city}, {bookingDraft.province}
            </p>
            <hr />
            <div className="payment-page_row">
              <span>Check-in</span>
              <span>{bookingDraft.startDate}</span>
            </div>
            <div className="payment-page_row">
              <span>Check-out</span>
              <span>{bookingDraft.endDate}</span>
            </div>
            <div className="payment-page_row">
              <span>Nights</span>
              <span>{nights}</span>
            </div>
            <div className="payment-page_row">
              <span>Price per night</span>
              <span>{formatINR(pricePerNight)}</span>
            </div>
            <div className="payment-page_row payment-page_total">
              <span>Total</span>
              <span>{formatINR(amount)}</span>
            </div>
          </div>

          {error && <p className="payment-page_error">{error}</p>}

          {demoMode ? (
            <form className="payment-page_demo" onSubmit={handleDemoPay}>
              <h3>Demo Payment Gateway</h3>
              <p className="payment-page_demo-note">
                To enable <strong>Razorpay</strong>, add keys to{" "}
                <code>server/.env</code>.
              </p>
              <input
                type="text"
                placeholder="Full name"
                value={demoCard.name}
                onChange={(e) =>
                  setDemoCard({ ...demoCard, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={demoCard.email}
                onChange={(e) =>
                  setDemoCard({ ...demoCard, email: e.target.value })
                }
                required
              />
              <button type="submit" disabled={paying}>
                {paying ? "Processing..." : `Pay ${formatINR(amount)} (Demo)`}
              </button>
            </form>
          ) : (
            <div className="payment-page_razorpay">
              <div className="payment-page_razorpay-badge">
                <span className="payment-page_razorpay-logo">Razorpay</span>
                <span>Secured</span>
              </div>
              <img src="/assets/payment.png" alt="UPI, cards, net banking" />
              <ul className="payment-page_methods">
                <li>UPI (GPay, PhonePe, Paytm)</li>
                <li>Credit & Debit Cards</li>
                <li>Net Banking & Wallets</li>
              </ul>
              <p className="payment-page_test-note">
                Test mode: card <code>4111 1111 1111 1111</code> · UPI{" "}
                <code>success@razorpay</code>
              </p>
              <button
                type="button"
                className="payment-page_razorpay-btn"
                onClick={handleRazorpayPay}
                disabled={paying}
              >
                {paying
                  ? "Opening Razorpay..."
                  : `Pay ${formatINR(amount)} with Razorpay`}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
