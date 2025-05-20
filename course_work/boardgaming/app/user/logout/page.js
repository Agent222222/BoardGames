"use client"
import Button from "@/app/_components/Button";
import styles from "./Logout.scss";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../../_lib/accountSlice.js"; 


export default function LogOut() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.account);
  useEffect(function(){
    if(user.email === ""){
      router.push("/");
    }
  }, [user.email, router]);

  function handleClick() {
    dispatch(userLogout(user));
    router.replace('/');
  }

  return (
    <>
      {user.email && 
        <form id="sect7-log" className="section7-login">
          <h2 className="section7-consultation main-title-caption">Log out </h2>
          <p className="section7-consultation-description">Please confirm that you really want to log out of your account, as in this case, you will need to sign in one more time to get to this interface.</p>
          
          <div className="check_box_sec">
              <Button 
                  name={"button_template2"} 
                  width={490}
                  action={handleClick}
              >
                Log out
              </Button>
          </div>
          
      </form>
      }
    </>
    
  );
}
