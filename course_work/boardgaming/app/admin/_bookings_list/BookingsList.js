"use client"
import styles from "./BookingsList.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { deleteBooking } from "@/app/_lib/bookingsSlice.js";
import Button from "@/app/_components/Button";
import Payment from "../_change_payment/payment";

export default function Bookings({ user, active, tableId, date, handleListClick, handleActiveClick}){
    const { bookings } = useSelector((state) => state.bookings);
    const dispatch = useDispatch();
    
    const [bookingList, setBookingList] = useState([]);
    const [showPayment, setShowPayment] = useState(false); 
    const [selectedBooking, setSelectedBooking] = useState({});

    useEffect(() => {
        const filteredBookings = bookings.filter(
            b => {
                const bookingDate = new Date(b.date);
                bookingDate.setDate(bookingDate.getDate() + 1);
                const bookingDateOnly = bookingDate.toISOString().split("T")[0]; 
                return b.table_id === tableId && bookingDateOnly === date && b.time;
            }
        );
        setBookingList(filteredBookings);
    }, [bookings, tableId, date]);

    function handleDelete(id){
        handleActiveClick(false);
        dispatch(deleteBooking(user.email, user.userId, id));
    }

    function handlePayment(booking){
        setShowPayment(true);
        setSelectedBooking(booking);
    }
    
    return(

        <form className={`${styles.section7_login} ${active ? styles.active : null}`}>
            <h2 className={styles.main_title_caption}>
                Table: {tableId}
                <p className={styles.cross} onClick={() => handleActiveClick(false)}>&times;</p>
            </h2>
            {showPayment && <Payment booking={selectedBooking} handleActiveClick={setShowPayment} date={date}/>}
            <div className={styles.list}>
                {bookingList.map((booking) => {
                    return (
                        <div key={booking.booking_id} className={styles.booking} onClick={(e) => handleListClick(booking, e)}>
                            <h4 className={styles.secondary}>Time: <p>{booking.time}</p></h4>
                            <h4 className={styles.secondary}>Period: <p>{booking.period}</p></h4>
                            <h4 className={styles.secondary}>Game name: <p>{booking.game_name}</p></h4>
                            <h4 className={styles.secondary}>Amount of players: <p>{booking.players_amount}</p></h4>
                            <Button 
                                name={"button_template2"} 
                                width={100}
                                height={50}
                                action={() => handleDelete(booking.booking_id)}
                            >
                                Delete
                            </Button>
                            <Button 
                                name={"button_template2"} 
                                width={120}
                                height={50}
                                action={() => handlePayment(booking)}
                            >
                                Change Payment
                            </Button>
                        </div>
                    );
                })}
            </div>
        </form>
    );
}