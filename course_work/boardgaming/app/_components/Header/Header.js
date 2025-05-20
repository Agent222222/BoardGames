"use client"
import Navigation from "../visitornavigation/Navigation.js"
import UserNavigation from "../usernavigation/UserNavigation.js"
import AdminNavigation from "../adminnavigation/AdminNavigation.js"
import { usePathname } from "next/navigation.js";
import { useSelector } from "react-redux";
import ManagerNavigation from "../../_components/managernavigation/ManagerNavigation.js"

export default function Header() {
    const pathname = usePathname();
    const { user } = useSelector((state) => state.account);

    return (
        <header>
            {
                pathname.includes("user") ? <UserNavigation/> :
                pathname.includes("admin") ? (user.access === "manager"? 
                    <ManagerNavigation/> : 
                    <AdminNavigation/>
                ) : <Navigation/>
            }
        </header>
    )
}

