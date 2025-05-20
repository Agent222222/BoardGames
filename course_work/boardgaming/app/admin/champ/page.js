"use client";
import { useEffect, useState } from "react";
import AddMatch from "./_create_match/page";
import styles from "./Champ.module.scss";
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from "react-redux";
import { getMatches } from "@/app/_lib/matchesSlice.js";
import CheckMatch from "./_chack_match/checkMatch";

function parseStage(stage) {
    const [id, round] = stage.split(".");
    return { matchId: parseInt(id, 10), round };
}

export default function Championship() {
    const [active, setActive] = useState(false);
    const [showMatch, setShowMatch] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState({});
    const [place, setPlace] = useState("");

    const { user } = useSelector((state) => state.account);
    const { matches } = useSelector((state) => state.matches);
    const dispatch = useDispatch();

    const router = useRouter();

    useEffect(() => {
        if (user.email === "") {
            router.push("/");
        }
        if (user.access !== "manager") {
            router.push("/admin");
        }
    }, [user.email, user.access, router]);

    useEffect(() => {
        dispatch(getMatches());
    }, [dispatch]);

    const getRoundLabel = (i) => {
        return i === 0 ? "1/16" : i === 1 ? "1/8" : i === 2 ? "1/4" : i === 3 ? "1/2" : null;
    };

    return (
        <>
            {user.access === "manager" &&
                <div className={styles.bracketWrapper}>
                    <h2 className={styles.main_title}>Monopoly Championship</h2>
                    {active && <AddMatch handleActiveClick={setActive} place={place} />}
                    {showMatch && <CheckMatch active={showMatch} match={selectedMatch} handleActiveClick={setShowMatch} />}

                    <div className={styles.bracket}>
                        {/* Left Side */}
                        <div className={styles.side}>
                            {[...Array(4)].map((_, i) => (
                                <div className={styles.round} key={`left-${i}`}>
                                    {[...Array(2 ** (3 - i))].map((_, j) => {
                                        const matchId = i * 10 + j + 100;
                                        const round = getRoundLabel(i);
                                        const isFilled = matches.some((match) => {
                                            const { matchId: id, round: r } = parseStage(match.stage);
                                            return id === matchId && r === round;
                                        });

                                        return (
                                            <div
                                                className={`${styles.match} ${isFilled ? styles.filled : ""}`}
                                                key={i * 10 + j}
                                                onClick={() => {
                                                    const stage = `${matchId}.${round}`;
                                                    const matched = matches.find((match) => match.stage === stage);
                                                    if (matched) {
                                                        setSelectedMatch(matched);
                                                        setShowMatch(true);
                                                    } else {
                                                        setActive(true);
                                                    }
                                                    setPlace(stage);
                                                }}
                                            >
                                                {round}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Final */}
                        <div className={styles.final}>
                            <div className={styles.match}
                            onClick={() => {
                                const stage = `${1}.${"final"}`;
                                const matched = matches.find((match) => match.stage === stage);
                                if (matched) {
                                    setSelectedMatch(matched);
                                    setShowMatch(true);
                                } else {
                                    setActive(true);
                                }
                                setPlace(stage);
                            }}
                            >
                                Final
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className={styles.side_2}>
                            {[...Array(4)].map((_, i) => (
                                <div className={styles.round} key={`right-${i}`}>
                                    {[...Array(2 ** (3 - i))].map((_, j) => {
                                        const matchId = i * 10 + j;
                                        const round = getRoundLabel(i);
                                        const isFilled = matches.some((match) => {
                                            const { matchId: id, round: r } = parseStage(match.stage);
                                            return id === matchId && r === round;
                                        });

                                        return (
                                            <div
                                                className={`${styles.match} ${isFilled ? styles.filled : ""}`}
                                                key={i * 10 + j}
                                                onClick={() => {
                                                    const stage = `${matchId}.${round}`;
                                                    const matched = matches.find((match) => match.stage === stage);
                                                    if (matched) {
                                                        setSelectedMatch(matched);
                                                        setShowMatch(true);
                                                    } else {
                                                        setActive(true);
                                                    }
                                                    setPlace(stage);
                                                }}
                                            >
                                                {round}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        </>
    );
}