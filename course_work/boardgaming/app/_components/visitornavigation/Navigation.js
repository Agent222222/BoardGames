'use client';

import Link from "next/link";
import styles from "./Navigation.module.scss";
import Image from "next/image";
import logo from "@/public/cover.png";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from "react";

export default function Navigation() {
    const pathname = usePathname();
    const [currentPage, setCurrentPage] = useState(0);
    const [ulStyle, setUlStyle] = useState("nav_sec_0")

    useEffect(() => {
        if (pathname.includes("prices")) {
            setCurrentPage(1);
            setUlStyle("nav_sec_1");
        } else if (pathname.includes("gamelist")) {
            setCurrentPage(2);
            setUlStyle("nav_sec_2");
        }else if (pathname.includes("championship")) {
            setCurrentPage(3);
            setUlStyle("nav_sec_3");
        } else if (pathname.includes("login")) {
            setCurrentPage(4);
            setUlStyle("nav_sec_4");
        }else {
            setCurrentPage(0);
            setUlStyle("nav_sec_0");
        }
    }, [pathname]);

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo_sect_1}>
                <Image 
                    className={`${styles.logo_img} ${styles.type2}`} 
                    src={logo} 
                    alt="Logo" 
                />
            </Link>
            <ul className={styles[ulStyle]}>
                <li className={styles.nav_li}>
                    <Link 
                        className={`${styles.nav_link} ${currentPage > 0 ? styles.active : ''}`} 
                        href="/"
                    >
                        Main
                    </Link>
                </li>
                <li className={styles.nav_li}>
                    <Link 
                        className={`${styles.nav_link} ${currentPage > 1 ? styles.active : ''}`} 
                        href="/prices"
                    >
                        Price
                    </Link>
                </li>
                <li className={styles.nav_li}>
                    <Link 
                        className={`${styles.nav_link} ${currentPage > 2 ? styles.active : ''}`} 
                        href="/gamelist"
                    >
                        Games List
                    </Link>
                </li>
                <li className={styles.nav_li}>
                    <Link 
                        className={`${styles.nav_link} ${currentPage > 3 ? styles.active : ''}`} 
                        href="/championship"
                    >
                        Championship
                    </Link>
                </li>
                
                <li className={styles.nav_li}>
                    <Link 
                        className={`${styles.nav_link} ${currentPage > 4 ? styles.active : ''}`} 
                        href="/login"
                    >
                        SignIn/SignUp
                    </Link>
                </li>
            </ul>
        </header>
    )
}