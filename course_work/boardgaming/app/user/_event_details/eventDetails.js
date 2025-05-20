import Button from "@/app/_components/Button";
import styles from "./EventDetails.module.scss";

export default function EventDetails({ active, booking, handleActiveClick}){
    
    return(

        <form className={`${styles.section7_login} ${active ? styles.active : null}`}>
            { booking && 
                <>
                    <h2 className={styles.main_title_caption}>
                        Date: {booking.date ? new Intl.DateTimeFormat('en-CA').format(new Date(booking.date)) : "Invalid Date"}
                        <p className={styles.cross} onClick={() => handleActiveClick(false)}>&times;</p>
                    </h2>
                    <h4 className={`${styles.main_title_caption} ${styles.secondary}`}>Time: <p>{booking.time}</p></h4>
                    <h4 className={`${styles.main_title_caption} ${styles.secondary}`}>Period: <p>{booking.period}</p></h4>
                    <h4 className={`${styles.main_title_caption} ${styles.third}`}>Game name: <p>{booking.game_name}</p></h4>
                    <div className={styles.player_list}>
                    {booking?.member_emails?.length > 0 && booking.member_emails.map(player => (
                        <p key={player} className={styles.member}>{player}</p>
                    ))}
                    </div>
                    <p className={styles.section7_consultation_description}>If you want to cancel the registration, please contact us to support@domain.com or call +380685647839 from 9am to 8pm. Sorry for the inconveniences!</p>
                </>
            }
        </form>
    );
}