"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { BarChart } from "@mui/x-charts/BarChart";
import styles from "./Statistic.module.scss";
import { checkAdminBookings } from "@/app/_lib/bookingsSlice.js";
import { checkAllPayments } from "@/app/_lib/paymentsSlice.js";
import { LineChart, PieChart } from "@mui/x-charts";

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.account);
    const { payments } = useSelector((state) => state.payments);
    const { bookings } = useSelector((state) => state.bookings);

    const [selectedDate, setSelectedDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [month, setMonth] = useState("");

    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [cardPercentage, setCardPercentage] = useState(0);
    const [yearIncome, setYearIncome] = useState(0);

    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
    const [dailyRegistrations, setDailyRegistrations] = useState([]);
    const [popularGames, setPopularGames] = useState([]);

    useEffect(() => {
        if (user.email === "") {
        router.push("/");
        }
        if(user.access !== "manager"){
            router.push("/admin");
        }
    }, [user.access, user.email, router]);

    useEffect(() => {
        dispatch(checkAdminBookings(user.email, user.userId, new Date(selectedDate).getFullYear()));
        dispatch(checkAllPayments(user.email, user.userId, new Date(selectedDate).getFullYear()));
    }, [dispatch, selectedDate, user]);

    useEffect(() => {
        if (payments.length > 0 && bookings.length > 0) {
        // Log bookings data structure for debugging
            console.log("Bookings Data:", bookings);

        const currentDate = new Date(selectedDate);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        setMonth(currentMonth);

        let monthIncome = 0;
        let yearTotal = 0;
        let cardCount = 0;
        let totalPayments = 0;

        const incomeByMonth = Array(12).fill(0);

        payments.forEach((payment) => {
            if (payment.status !== "successful") return;

            // Find related booking for this payment
            const relatedBooking = bookings.find(
                (booking) => booking.payment_id === payment.payment_id 
            );

            console.log(
                `Related Booking for Payment ${payment.payment_id}: ${JSON.stringify(relatedBooking)}`
            );

            if (!relatedBooking) return;

            // Assuming the booking has a `date` field which is a string that can be parsed into a Date object
            const bookingDate = new Date(relatedBooking.date);
            const year = bookingDate.getFullYear();
            const month = bookingDate.getMonth();

            const amount = Number(payment.amount || 0);

            if (year === currentYear) {
                yearTotal += amount;
                incomeByMonth[month] += amount;

            if (month === currentMonth) {
                monthIncome += amount;
            }

            // Check for card payments
            if (payment.card_or_cash === true) cardCount++;
                totalPayments++;
            }
        });

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const registrationsByDay = Array(daysInMonth).fill(0);

        // Count registrations for each day
        bookings.forEach((booking) => {
            const bookingDate = new Date(booking.date);
            const bookingYear = bookingDate.getFullYear();
            const bookingMonth = bookingDate.getMonth();

            if (bookingYear === currentYear && bookingMonth === currentMonth) {
                const day = bookingDate.getDate(); // 1 to 31
                registrationsByDay[day - 1] += 1;
            }
        });

        const gameCountMap = {};

        bookings.forEach((booking) => {
            const bookingDate = new Date(booking.date);
            const bookingYear = bookingDate.getFullYear();

            if (bookingYear === currentYear) {
                const gameName = booking.game_name; // Adjust key as needed
                if (gameName) {
                    gameCountMap[gameName] = (gameCountMap[gameName] || 0) + 1;
                }
            }
        });

        const sortedGames = Object.entries(gameCountMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count], index) => ({
                id: index,
                value: count,
                label: name
            }));

        setPopularGames(sortedGames);
        setDailyRegistrations(registrationsByDay);
        setMonthlyIncome(monthIncome);
        setYearIncome(yearTotal);
        setCardPercentage(totalPayments ? ((cardCount / totalPayments) * 100).toFixed(2) : 0);
        setMonthlyRevenueData(incomeByMonth);

        } else {
            console.log("No payments or bookings found.");
        }
    }, [payments, bookings, selectedDate]);

    const handleDateClick = (value) => {
        setSelectedDate(value);
    };

    return (
        <>{user.access === "manager" &&
            <div className={styles.container}>
                <div className={styles.summed_part}>
                    <h2 className={styles.main_title} >Statistics</h2>
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
                    <h4 className={styles.secondary}>
                        Total revenue for current month: <p>{monthlyIncome} $</p>
                    </h4>
                    <h4 className={styles.secondary}>
                        Card payments percentage: <p>{cardPercentage} %</p>
                    </h4>
                    <h4 className={styles.secondary}>
                        Year income: <p>{yearIncome} $</p>
                    </h4>
                </div>
                <div className={styles.charts}>
                    <h4 className={styles.tit}>
                        Revenue for selected year
                    </h4>
                    <LineChart
                        height={190}
                        width={500}
                        xAxis={[{ 
                            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                        }]}
                        series={[{ 
                            data: monthlyRevenueData,
                            area: true,
                            baseline: 'min',
                            color: 'rgb(0, 223, 129)',
                        }]}
                    />
                    <h4 className={styles.tit}>
                        Registrations for chosen month
                    </h4>
                    <BarChart
                        series={[{ data: dailyRegistrations, color: 'rgb(0, 223, 129)', }]}
                        height={200}
                        xAxis={[{
                            data: Array.from({ length: dailyRegistrations.length }, (_, i) => (i + 1).toString())
                        }]}
                    />
                    {popularGames.length > 0 ? (
                        <>
                            <h4 className={styles.tit}>
                                Top 5 most popular games
                            </h4>
                            <PieChart
                                series={[
                                    {
                                        data: popularGames.map((game, index) => ({
                                            ...game,
                                            id: index,
                                            color: [
                                                'rgb(0, 223, 129)',
                                                ' rgb(17, 126, 57)',
                                                'rgb(3, 98, 76)',
                                                ' rgb(44, 194, 149)',
                                                'rgb(3, 34, 33)'
                                            ][index % 5] // cycle colors if more than 5
                                        }))
                                    }
                                ]}
                                width={250}
                                height={250}
                            />
                        </>
                        
                    ) : (
                        <p>No game data available for selected year.</p>
                    )}
                </div>
            </div>
        }</>
        
    );
}