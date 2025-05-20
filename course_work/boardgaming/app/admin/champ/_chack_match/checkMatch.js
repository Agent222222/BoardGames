import Button from "@/app/_components/Button";
import styles from "./CheckMatch.module.scss";

export default function CheckMatch({ active, match, handleActiveClick}){
    
    return(

        <form className={`${styles.section7_login} ${active ? styles.active : null}`}>
            { match && 
                <>
                    <h2 className={styles.main_title_caption}>
                        Date: {match.date ? new Intl.DateTimeFormat('en-CA').format(new Date(match.date)) : "Invalid Date"}
                        <p className={styles.cross} onClick={() => handleActiveClick(false)}>&times;</p>
                    </h2>
                    <h4 className={`${styles.main_title_caption} ${styles.secondary}`}>Time: <p>{match.time}</p></h4>
                    <h4 className={`${styles.main_title_caption} ${styles.secondary}`}>Winner: <p>{match.winner_email}</p></h4>
                    <h4 className={`${styles.main_title_caption} ${styles.third}`}>Game name: <p>Monopoly</p></h4>
                    <div className={styles.player_list}>
                    {match?.player_emails?.length > 0 && match.player_emails.map(player => (
                        <p key={player} className={styles.member}>{player}</p>
                    ))}
                    </div>
                </>
            }
        </form>
    );
}