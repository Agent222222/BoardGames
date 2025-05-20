"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/app/_components/Button";
import styles from "./Payment.scss";
import { checkAllPayments, updatePayment, setError } from "@/app/_lib/paymentsSlice.js";

export default function Payment({ booking, handleActiveClick, date }) {
    const [id, setID] = useState("");
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("");
    const [card_or_cash, setCard_or_cash] = useState(false);

    const { payments, error, isLoading } = useSelector((state) => state.payments);
    const { user } = useSelector((state) => state.account);
    const dispatch = useDispatch();

    useEffect(() => {
        if (booking) {
            dispatch(setError(""));
            dispatch(checkAllPayments(user.email, user.userId, new Date(date).getFullYear()));
        }
    }, [dispatch, booking]);

    useEffect(() => {
        if (booking && payments.length > 0) {
            const relatedPayment = payments.find((payment) => payment.payment_id === booking.payment_id);
            if (relatedPayment) {
                setID(relatedPayment.payment_id || "");
                setAmount(relatedPayment.amount || "");
                setStatus(relatedPayment.status || "");
                setCard_or_cash(relatedPayment.card_or_cash || false);
            }
        }
    }, [booking, payments]);

    function handleClick() {
        dispatch(setError(""));

        const validStatuses = ["booked", "waiting", "successful", "declined"];
        if (!validStatuses.includes(status)) {
            return dispatch(setError("Please enter a valid status"));
        }
        
        dispatch(updatePayment(user.email, user.userId, id, status, amount, card_or_cash));
        handleActiveClick(false);
    }

    return (
        <div className="authenticate">
            <div className="section7-login">
                <h2 className="main_title_caption">Payment details
                    <p className="cross" onClick={() => handleActiveClick(false)}>&times;</p>
                </h2>
                <p className="section7_consultation_description">
                    Payment details for your current booking. Booking payment can only have the following states: successful, waiting, booked, declined.
                </p>

                <p className="email">{amount}</p>

                <select className="name" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">-- Select status --</option>
                    <option value="booked">booked</option>
                    <option value="waiting">waiting</option>
                    <option value="successful">successful</option>
                    <option value="declined">declined</option>
                </select><br />

                {error && <h2 className="error">{error}</h2>}

                <div className="check_box_sec">
                    <div className="check_box_sec2">
                        <input
                            id="cons_check"
                            type="checkbox"
                            checked={card_or_cash}
                            onChange={() => setCard_or_cash(!card_or_cash)}
                            className="section7_checkbox"
                        />
                        <p className="section7_checkbox_label">
                            If customer payed by the card it should be checked, cash = unchecked.
                        </p>
                    </div>
                    <Button action={handleClick} name="button_template2">
                        <p>{isLoading ? "Loading..." : "Submit"}</p>
                    </Button>
                </div>
            </div>
        </div>
    );
}