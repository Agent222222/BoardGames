"use client"
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";
import LogOut from "../../user/logout/page.js";

export default function Home() {
  const router = useRouter();

  const { user } = useSelector((state) => state.account);
  useEffect(function(){
    if(user.access === ""){
      router.push("/");
    }
  }, [user.access, router]);
  return (
    <>{user.access &&
        <LogOut/>
    }</>
  );
}
