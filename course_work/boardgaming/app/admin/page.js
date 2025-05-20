"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from "react-redux";
import { getGames } from "@/app/_lib/gameSlice.js"; 
import { getTables } from "@/app/_lib/tableSlice.js"; 
import { checkAdminBookings, resetBookings } from "../_lib/bookingsSlice.js";
import styles from "./Admin.module.scss";
import EventDetails from "../user/_event_details/eventDetails.js";
import Bookings from "./_bookings_list/BookingsList.js";
import Loading from "@/app/loading.js";

export default function Home() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [showAllBookings, setShowAllBookings] = useState(false); 
  const [shownearestbooking, setShowNearestbooking] = useState(false); // for the booking details
  const [selectedBooking, setSelectedBooking] = useState({});
  const [selectedTable, setSelectedTable] = useState(0);

  const { user } = useSelector((state) => state.account);
  const { tables } = useSelector((state) => state.tables);
  const { bookings, bookingIsLoading} = useSelector((state) => state.bookings);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.email) {
      router.push("/");
      return;
    }
    
    
    dispatch(getGames());
    dispatch(getTables(user.email, user.userId));
    if (user.access) {
      dispatch(checkAdminBookings(user.email, user.userId, new Date(selectedDate).getFullYear()));
    }
  }, [user, router, dispatch, selectedDate]);

  const getNearestBooking = (tableId) => {
    if (!selectedDate) return null;
  
    const filteredBookings = bookings
      .filter(b => {
        // Ensure b.date is parsed correctly as Date object
        const bookingDate = new Date(b.date);
        bookingDate.setDate(bookingDate.getDate() + 1);
        const bookingDateOnly = bookingDate.toISOString().split("T")[0]; 
        return b.table_id === tableId && bookingDateOnly === selectedDate && b.time;
      })
      .sort((a, b) => {
        // Convert time to seconds for sorting
        const [ah, am, as = 0] = a.time.split(":").map(Number);
        const [bh, bm, bs = 0] = b.time.split(":").map(Number);
  
        const aTimeInSeconds = ah * 3600 + am * 60 + as;
        const bTimeInSeconds = bh * 3600 + bm * 60 + bs;
  
        return aTimeInSeconds - bTimeInSeconds;
      });
  
    return filteredBookings[0] || null;
  };

  const handleListClick = (booking, e) => {
    setSelectedBooking(booking);
    if(e.target.value !== ""){
      setShowNearestbooking(true); 
    }
  };

  const handleClick = (booking) => {
    const clickedDate = booking.date;
    setSelectedBooking(booking);
    setShowNearestbooking(true);
  };

  const handleAllClick = (tableId) => {
    setSelectedTable(tableId);
    setShowAllBookings(true);
  };

  const handleDateClick = (value) =>{
    setSelectedDate(value);
  }

  if (bookingIsLoading) return <Loading />;

  return (
    <div className={styles.container}>
      {user.access && 
      <>
        <h2 className={styles.main_title}>Tables List</h2>
        {user.access === "manager" &&
          <div className={styles.datePickerContainer}>
            <label htmlFor="datePicker">Date: </label>
          
            <input
              id="datePicker"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateClick(e.target.value)}
              className={styles.datePicker}
            />
          
        </div>
        }
        <div className={styles.tableGrid}>
          {tables.map(table => {
            const booking = getNearestBooking(table.table_id);
            if(table.status === true){
              return (
                <div key={table.table_id} className={styles.tableItem}>
                  <div className={`${styles.tableOval} ${booking ? styles.active : null}`} onClick={() => handleAllClick(table.table_id)}>Table {table.table_id}</div>
                  <div className={styles.tableDetails}>
                    <p className={styles.tableState}>{table.state}</p>
                    {booking ? (
                      <div className={styles.bookingBox} onClick={() => handleClick(booking)}>
                        {booking.time}
                      </div>
                    ) : (
                      <div className={styles.bookingBoxEmpty}>No upcoming</div>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <EventDetails 
          active={shownearestbooking} 
          booking={selectedBooking} 
          handleActiveClick={setShowNearestbooking} 
        />
        <Bookings
          user={user}
          active={showAllBookings}
          tableId={selectedTable}
          date={selectedDate}
          handleListClick={handleListClick} 
          handleActiveClick={setShowAllBookings}
        />
        </>
      }
    </div>
  );
}