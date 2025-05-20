import Footer from "./_components/Footer/Footer"
import Header from "./_components/Header/Header"
import ReduxProvider from "./_general_state/Provider";
import styles from "./Main.module.scss";

export const metadata = {
    title: {
            template: "%s of BoardGaming",
            default: "BoardGaming",
        },
    description: 'Small boarding games rent business.',
    icons: {
        icon: '/default.png',
    },   // we can also do not write here icon and just name the picture icon.png inside of the public folder
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ReduxProvider>
                    <Header/>
                    <main className={styles.main}>
                        {children}
                    </main>
                    <Footer/>
                </ReduxProvider>
            </body>
        </html>
    )
}