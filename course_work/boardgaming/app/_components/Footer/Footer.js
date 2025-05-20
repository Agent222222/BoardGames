'use client';
import styles from "./Footer.scss";
import Image from "next/image";
import instagram from "@/public/instagram.png";
import facebook from "@/public/facebook.png";
import logo from "@/public/logo.svg";
import Button from "../Button";
import { useRouter } from 'next/navigation';
import store from "@/app/_general_state/store";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSelector, useDispatch } from "react-redux";
import { checkAdminBookings } from "@/app/_lib/bookingsSlice";
import { checkAllPayments } from "@/app/_lib/paymentsSlice";
import { getGames } from "@/app/_lib/gameSlice";
import { useState } from "react";

export default function Footer() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.account);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date().toISOString().split("T")[0];
        return today;
    });

    function handleNav() {
        router.push('/prices');
    }

    function handleAdmin(){
        router.push('/admin');
    }

    function handleStatistics(){
        router.push('/admin/statistic');
    }

    const handleExport = async () => {
        try {
            await Promise.all([
                dispatch(checkAdminBookings(user.email, user.userId, new Date(selectedDate).getFullYear())),
                dispatch(checkAllPayments(user.email, user.userId, new Date(selectedDate).getFullYear())),
                dispatch(getGames()),
            ]);
    
            const state = store.getState();
            const bookings = state.bookings.bookings;
            const payments = state.payments.payments;
            const games = state.game.games;
    
            // Proceed with data export
            const combinedData = bookings.map((booking) => {
                const payment = payments.find(p => Number(p.payment_id) === Number(booking.payment_id));
                const game = games.find(g => g.game_name === booking.game_name);
    
                return {
                    BookingID: booking.booking_id,
                    Date: new Date(booking.date).toLocaleDateString(),
                    Time: booking.time,
                    Duration: booking.period,
                    TableID: booking.table_id,
                    GameName: booking.game_name,
                    GameStatus: game?.status || "N/A",
                    GroupID: booking.group_id,
                    PlayersCount: booking.players_amount,
                    IsFull: booking.is_full ? "Yes" : "No",
                    Members: booking.member_emails.join(", "),
                    PaymentAmount: payment?.amount ?? "N/A",
                    PaymentStatus: payment?.status ?? "N/A",
                    PaidWithCard: payment ? (payment.card_or_cash ? "Card" : "Cash") : "N/A",
                };
            });
    
            const worksheet = XLSX.utils.json_to_sheet(combinedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "bookings_data.xlsx");
        } catch (err) {
            console.error("Failed to export bookings", err);
            alert("There was an error fetching the data. Please try again.");
        }
    };

    return (
        <footer>
            <div className={`${"footer_section1"} ${user.access ==="manager"? "" : "sect_1"}`}>
                <Image className="footer_logo_img" src={logo} width={200} height={200} alt=""/>
                <p className="part0-footer">Solution designed and builded by the SimpleStudent company for all your needs</p>
            </div>
            {user.access === "manager" && 
                <div className="footer_section5">
                    <Button 
                        name={"button_template1"} 
                        width={200}
                        action={handleExport}
                    >
                        Export bookings
                    </Button>
                </div>
            }
            {user.access  && 
                <>
                    <div className="footer_section2">
                        <Button 
                            name={"button_template1"} 
                            width={200}
                            action={handleAdmin}
                        >
                            Admin
                        </Button>
                        {user.access === "manager" && 
                            <Button 
                                name={"button_template1"} 
                                width={200}
                                action={handleStatistics}
                            >
                                Statistics
                            </Button>
                        }
                    </div>
                </>
            }
            <div className="footer_section">
                <h3>News</h3>
                <p className="part1-footer" >About us</p>
                <p className="part1-footer" >Teems of Servise</p>
                <p className="part1-footer" >Priacy Policy</p>
            </div>
            <div className="footer_section">
                <h3>Explore our prices</h3>
                <div className="footer_subsc-section">
                    <Button action={handleNav} name={"button_template1"} width={"200px"}>Calculate</Button>
                </div>
                <div className="contact_img_section">
                <a href="https://www.instagram.com/" target="_blank" rel="noopener referrer">
                    <Image className="footer_contact_img" src={instagram} alt="Instagram" />
                </a>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener referrer">
                    <Image className="footer_contact_img" src={facebook} alt="Facebook" />
                </a>
                </div>
            </div>
        </footer>
    )
}

