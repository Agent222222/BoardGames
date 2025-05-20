"use client"
import styles from "./User.module.scss";
import Button from "../_components/Button";
import EventDetails from "./_event_details/eventDetails.js";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' 
import interactionPlugin from "@fullcalendar/interaction"
import Loading from "@/app/loading.js";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { checkBookings } from "../_lib/bookingsSlice.js";


export default function Home() {
  const [date, setDate] = useState("");
  const [active, setActive] = useState(false); // for the add_booking
  const [showbooking, setShowbooking] = useState(false); // for the booking details
  const [selectedBooking, setSelectedBooking] = useState({});

  const { user } = useSelector((state) => state.account);
  const { bookings, bookingIsLoading } = useSelector((state) => state.bookings);

  const dispatch = useDispatch();

  const router = useRouter();
  useEffect(function(){
    if(user.email === ""){
      router.push("/");
    }

    dispatch(checkBookings(user));
  }, [user, router, dispatch]);

  const currentDate = new Date().toISOString().split('T')[0];

  //pop up windows

  const handleDateClick = (arg) => {
    if(!showbooking){
      if(arg.dateStr<currentDate){
        alert("Please choose the today or later date.");
      }else{
        setDate(arg.dateStr);
        setActive(true);
      }
    }
    
  }

  function bookingClick(info) {
    if(!active){
      const clickedDate = info.event.start.toISOString().split("T")[0];
  
      const foundBooking = bookings.find((booking) => {
        const bookingDate = new Date(booking.date).toISOString().split("T")[0];
        return clickedDate === bookingDate;
      });
    
      if (foundBooking) {
        setSelectedBooking(foundBooking);
        setShowbooking(true);
      }
    }
  }

  if (bookingIsLoading) return <Loading />;
  
  return (
    <div className={styles.container}>
      {user.email &&
        <>
          <div className={styles.container_title}>User: <h2 className={styles.container_title_name}>{user.name}</h2></div>
          <Alert active={active} date={date} handleActiveClick={setActive}/>
          <EventDetails active={showbooking} booking={selectedBooking} handleActiveClick={setShowbooking} />
          <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            events={bookings.map((booking) => ({
              title: `Registration ${booking.time}`,
              date: booking.date,
            }))}
            eventClick={(info) => bookingClick(info)}
            eventContent={renderEventContent}
            eventClassNames={() => styles.custom_style}
            dateClick={handleDateClick}
            initialView="dayGridMonth"
            weekends={false}
          />
        </>
      }
    </div>
  );
}

function Alert({active, date, handleActiveClick}){
  const router = useRouter();
  
  function handleClick() {
    router.replace(`/user/add_booking?date=${encodeURIComponent(date)}`);
    handleActiveClick(false);
  }

  return(
    <form className={`${styles.section7_login} ${active ? styles.active : null}`}>
        <h2 className={styles.main_title_caption}>{date} <p className={styles.cross} onClick={() => handleActiveClick(false)}>&times;</p></h2>
        <p className={styles.section7_consultation_description}>If you want to add a booking for this day, please click the Continue button to proceed with the booking registration.</p>
        
        <div className={styles.check_box_sec}>
            <Button 
                name={"button_template2"} 
                width={490}
                height={60}
                action={handleClick}
            >
              Continue
            </Button>
        </div>
        
    </form>
  );
}


function renderEventContent(eventInfo) {
  return(
    <>
      <h3>{eventInfo.event.title}</h3>
    </>
  )
}
