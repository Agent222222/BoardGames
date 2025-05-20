const express = require("express");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const loggedUsers = {}; // for storing only users that are logged locally on their devices and then check it user email exist and match the created sessionId

app.get("/games", async (req, res) => {
    const client = new Client({
        host: "localhost",
        user: "visitor_user",
        port: 5432,
        password: "1111",
        database: "BoardGames",
    });

    try {
        await client.connect();
        const result = await client.query("SELECT * FROM public.game");
        await client.end();

        res.json(result.rows);
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/game_create", async (req, res) => {
    const { email, userId, game_name, status, players, goal, rules } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        loggedUser.access !== "manager"
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    if (!game_name || !status || !players || !goal || !rules) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        const insertQuery = `
            INSERT INTO public.game (game_name, status, rules, players, goal)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const result = await client.query(insertQuery, [game_name, status, rules, players, goal]);

        await client.end();

        res.status(201).json({
            success: true,
            message: "Game created successfully.",
            game: result.rows[0]
        });

    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/game_delete", async (req, res) => {
    const { email, userId, game_id } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        loggedUser.access !== "manager"
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    if (!game_id) {
        return res.status(400).json({ error: "Missing game_id in request body." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // Step 1: Check for future bookings using this game_id
        const now = new Date().toISOString(); // ISO format for timestamp comparison

        const checkQuery = `
            SELECT * FROM public.booking 
            WHERE game_id = $1 AND (date::timestamp + time::time) > $2
        `;
        const checkResult = await client.query(checkQuery, [game_id, now]);

        if (checkResult.rows.length > 0) {
            await client.end();
            return res.status(400).json({ error: "Cannot delete game: future bookings exist." });
        }

        // Step 2: Delete the game
        const deleteQuery = `DELETE FROM public.game WHERE game_id = $1`;
        await client.query(deleteQuery, [game_id]);

        await client.end();
        res.json({ success: true, message: "Game deleted successfully." });

    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/matches", async (req, res) => {
    const client = new Client({
        host: "localhost",
        user: "visitor_user",
        port: 5432,
        password: "1111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        const result = await client.query(`
            SELECT 
                mc.play_id,
                mc.date,
                mc.time,
                mc.stage,
                mc.winner_id AS winner_email,
                g.players_amount,
                ARRAY_AGG(m.email) AS player_emails,
                ARRAY_AGG(pl.full_name) AS player_names
            FROM monopoly_championship mc
            JOIN "group" g ON mc.group_id = g.group_id
            JOIN members_list m ON m.group_id = g.group_id
            JOIN player pl ON pl.email = m.email
            GROUP BY mc.play_id, mc.date, mc.time, mc.stage, mc.winner_id, g.players_amount
            ORDER BY mc.date DESC, mc.time DESC;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching matches:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        await client.end();
    }
});

app.post("/match_create", async (req, res) => {
    const { email, userId, playerCount, players, winner, date, time, stage } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        loggedUser.access !== "manager"
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    console.log("Received data:", { playerCount, players, winner, date, time, stage });

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();
        console.log("DB connected");

        await client.query("BEGIN");

        // Step 1: Ensure players exist
        for (const player of players) {
            const { email, full_name, phone } = player;
            console.log(`Checking/creating player: ${email}`);
            const checkPlayer = await client.query("SELECT 1 FROM player WHERE email = $1", [email]);
            if (checkPlayer.rowCount === 0) {
                await client.query(
                    "INSERT INTO player (email, full_name, phone) VALUES ($1, $2, $3)",
                    [email, full_name, phone]
                );
                console.log(`Inserted player: ${email}`);
            }
        }

        // Step 2: Create new group
        const groupRes = await client.query(
            "INSERT INTO public.group (players_amount, is_full) VALUES ($1, $2) RETURNING group_id",
            [playerCount, true]
        );
        const groupId = groupRes.rows[0].group_id;
        console.log("Created group:", groupId);

        // Step 3: Add players to members_list
        for (const player of players) {
            await client.query(
                "INSERT INTO members_list (group_id, email) VALUES ($1, $2)",
                [groupId, player.email]
            );
            console.log(`Added ${player.email} to group ${groupId}`);
        }

        // Step 4: Insert into monopoly_championship
        const gameId = 1; // Hardcoded
        console.log("Inserting championship record:", {
            groupId,
            winner,
            gameId,
            stage,
            date,
            time,
        });

        await client.query(
            `INSERT INTO monopoly_championship (group_id, winner_id, game_id, stage, date, time)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [groupId, winner, gameId, stage, date, time]
        );

        await client.query("COMMIT");
        console.log("Match successfully created");
        res.json({ message: "Match created successfully" });

    } catch (err) {
        console.error("Match creation failed:", err);
        try {
            await client.query("ROLLBACK");
        } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
        }
        res.status(500).json({ error: err.message });
    } finally {
        try {
            await client.end();
            console.log("DB connection closed");
        } catch (endErr) {
            console.error("Failed to close DB connection:", endErr);
        }
    }
});

app.post("/tables", async (req, res) => {
    const { email, userId} = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        (loggedUser.access !== "manager" && loggedUser.access !== "employee")
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();
        const result = await client.query("SELECT * FROM public.table");
        await client.end();

        res.json(result.rows);
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/register", async (req, res) => {
    const { email, name, phone, password } = req.body;
    const client = new Client({
        host: "localhost",
        user: "visitor_user",
        port: 5432,
        password: "1111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        const playerCheck = await client.query("SELECT * FROM player WHERE email = $1", [email]);
        if (playerCheck.rows.length === 0) {
            // Insert new player
            await client.query("INSERT INTO player (email, full_name, phone) VALUES ($1, $2, $3)", [email, name, phone]);
        }

        // Check if account already exists
        const accountCheck = await client.query("SELECT * FROM account WHERE player_email = $1", [email]);
        if (accountCheck.rows.length > 0) {
            await client.end();
            return res.status(400).json({ error: "Account already exists" });
        }

        // Create account
        await client.query("INSERT INTO account (password, player_email) VALUES ($1, $2)", [password, email]);

        const newAccount = await client.query("SELECT * FROM account WHERE player_email = $1", [email]);

        await client.end();
        res.json("registered");
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const client = new Client({
        host: "localhost",
        user: "visitor_user",
        port: 5432,
        password: "1111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // Check if account with correct password exists
        const accountRes = await client.query(
            "SELECT * FROM account WHERE player_email = $1 AND password = $2",
            [email, password]
        );

        if (accountRes.rows.length === 0) {
            await client.end();
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Get player info
        const playerRes = await client.query("SELECT * FROM player WHERE email = $1", [email]);
        const adminRes = await client.query("SELECT access_type FROM admin WHERE admin_id = $1", [accountRes.rows[0].account_id]);
        
        const access = adminRes.rows.length > 0 ? adminRes.rows[0].access_type : "user";

        // ✅ Generate a unique ID based on timestamp and a random component
        const sessionId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        // ✅ Log the user session
        loggedUsers[email] = {
            id: sessionId,
            access: access
        };

        await client.end();
        res.json({
            ...accountRes.rows[0],
            name: playerRes.rows[0].full_name,
            phone: playerRes.rows[0].phone,
            access: adminRes.rows.length > 0 ? adminRes.rows[0].access_type : null,
            userId: sessionId
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/logout", (req, res) => {
    const { email, userId } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId
    ) {
        return res.status(403).json({ error: "Invalid credentials. Logout failed." });
    }

    // Remove user from the loggedUsers list
    delete loggedUsers[email];

    res.json({ message: "Logout successful." });
});

app.put("/update_user", async (req, res) => {
    const { email, userId, name, phone, password } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId 
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "user1",
        port: 5432,
        password: "11111",
        database: "BoardGames",
    });

    try {
    await client.connect();

      // Update player info
    await client.query(
        "UPDATE player SET full_name = $1, phone = $2 WHERE email = $3",
        [name, phone, email]
    );

      // Update account password
    await client.query(
        "UPDATE account SET password = $1 WHERE player_email = $2",
        [password, email]
    );

    await client.end();

    res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Update error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/bookings", async (req, res) => {
    const {email, userId } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId 
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "user1",
        port: 5432,
        password: "11111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // Отримуємо всі group_id для користувача
        const groupResult = await client.query(
            `SELECT DISTINCT group_id FROM public.members_list WHERE email = $1`,
            [email]
        );
        const groupIds = groupResult.rows.map(row => row.group_id);

        if (groupIds.length === 0) {
            await client.end();
            return res.json({ bookings: [], groups: [] });
        }

        // Бронювання для цих груп
        const bookingResult = await client.query(`
            SELECT 
                b.booking_id,
                b.date,
                b.time,
                b.period,
                b.table_id,
                g.game_name,
                gr.group_id,
                gr.players_amount,
                gr.is_full,
                (
                    SELECT array_agg(ml.email)
                    FROM public.members_list ml
                    WHERE ml.group_id = gr.group_id
                ) AS member_emails
            FROM public.booking b
            JOIN public.game g ON b.game_id = g.game_id
            JOIN public."group" gr ON b.group_id = gr.group_id
            WHERE b.group_id = ANY($1::int[])
            ORDER BY b.date DESC, b.time DESC
        `, [groupIds]);
        await client.end();

        res.json({
            bookings: bookingResult.rows
        });
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/bookings_admin", async (req, res) => {
    const {email, userId, year } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        (loggedUser.access !== "manager" && loggedUser.access !== "employee")
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // ВСІ бронювання за вказаний рік
        const bookingResult = await client.query(`
            SELECT 
                b.booking_id,
                b.date,
                b.time,
                b.period,
                b.table_id,
                b.payment_id,
                g.game_name,
                gr.group_id,
                gr.players_amount,
                gr.is_full,
                (
                    SELECT array_agg(ml.email)
                    FROM public.members_list ml
                    WHERE ml.group_id = gr.group_id
                ) AS member_emails
            FROM public.booking b
            JOIN public.game g ON b.game_id = g.game_id
            JOIN public."group" gr ON b.group_id = gr.group_id
            WHERE EXTRACT(YEAR FROM b.date) = $1
            ORDER BY b.date DESC, b.time DESC
        `, [year]);
        await client.end();

        res.json({
            bookings: bookingResult.rows
        });
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/create_booking", async (req, res) => {
    const { email, userId, date, time, period, game, players } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId 
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "user1",
        port: 5432,
        password: "11111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // Get game_id from game name
        const gameRes = await client.query(
            "SELECT game_id FROM public.game WHERE game_name = $1",
            [game]
        );

        if (gameRes.rows.length === 0) {
            throw new Error(`Game "${game}" not found.`);
        }
        const gameId = gameRes.rows[0].game_id;
        
        //Ensure all players exist or create them
        for (const player of players.slice(1)) {
            const { email, name, phone } = player;
        
            const existingPlayer = await client.query(
                "SELECT * FROM public.player WHERE email = $1",
                [email]
            );
        
            const parsedPhone = parseInt(phone, 10);
        
            if (isNaN(parsedPhone)) {
                throw new Error(`Invalid phone number for ${email}`);
            }
        
            if (existingPlayer.rows.length === 0) {
                await client.query(
                    "INSERT INTO public.player (email, full_name, phone) VALUES ($1, $2, $3)",
                    [email, name, parsedPhone]
                );
            }
        }

        // Create a new group
        const groupRes = await client.query(
            `INSERT INTO public.group (players_amount, is_full)
            VALUES ($1, $2)
            RETURNING group_id`,
            [2, true] // temporary minimum valid value to pass CHECK constraint
        );
        
        const groupId = groupRes.rows[0].group_id;

        //period conevrsion
        const periodHours = parseInt(period, 10);
        if (isNaN(periodHours) || periodHours <= 0) {
            throw new Error("Invalid period value");
        }
        const periodTime = `${String(periodHours).padStart(2, "0")}:00:00`;

        // Add the actual user (booking creator) to the group first
        await client.query(
            "INSERT INTO public.members_list (group_id, email) VALUES ($1, $2)",
            [groupId, email]
        );

        // Then add the rest of the valid players, skipping the first (empty) one
        for (const player of players.slice(1)) {
            await client.query(
                "INSERT INTO public.members_list (group_id, email) VALUES ($1, $2)",
                [groupId, player.email]
            );
        }

        // Try to book a table
        const tablesRes = await client.query("SELECT table_id FROM public.table");
        const tableIds = tablesRes.rows.map(row => row.table_id);

        let bookingCreated = false;
        let errorMessage = "All tables are taken or booking failed.";

        for (const tableId of tableIds) {
            try {
                await client.query(
                    `INSERT INTO public.booking 
                    (date, time, period, table_id, game_id, group_id, payment_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [date, time, periodTime, tableId, gameId, groupId, 0]
                );

                bookingCreated = true;
                break;
            } catch (err) {
                // Continue trying next table
                console.warn(`Table ${tableId} failed:`, err.message);
            }
        }

        await client.end();

        if (!bookingCreated) {
            return res.status(400).json({ error: errorMessage });
        }

        res.status(201).json({ message: "Booking created successfully." });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/booking_delete", async (req, res) => {
    const { email, userId, id } = req.body; // booking_id

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        (loggedUser.access !== "manager" && loggedUser.access !== "employee")
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        // 1. Get related group_id and payment_id from the booking
        const bookingCheck = await client.query(
            `SELECT group_id, payment_id FROM public.booking WHERE booking_id = $1`,
            [id]
        );

        if (bookingCheck.rows.length === 0) {
            await client.end();
            return res.status(404).json({ error: "Booking not found" });
        }

        const { group_id, payment_id } = bookingCheck.rows[0];

        // 2. Delete the booking
        await client.query(`DELETE FROM public.booking WHERE booking_id = $1`, [id]);

        // 3. Delete the payment
        await client.query(`DELETE FROM public.payment WHERE payment_id = $1`, [payment_id]);

        // 4. Delete related members_list rows
        await client.query(`DELETE FROM public.members_list WHERE group_id = $1`, [group_id]);

        // 5. Delete the group
        await client.query(`DELETE FROM public."group" WHERE group_id = $1`, [group_id]);

        await client.end();
        res.json({ success: true, message: "Booking and related records deleted successfully." });
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/checkAll_payments", async (req, res) => {
    const { email, userId, year } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        (loggedUser.access !== "manager" && loggedUser.access !== "employee")
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1",
        port: 5432,
        password: "1111111",
        database: "BoardGames",
    });

    try {
        await client.connect();

        const result = await client.query(`
            SELECT DISTINCT
                p.payment_id,
                p.amount,
                p.status,
                p.card_or_cash
            FROM public.payment p
            JOIN public.booking b ON p.payment_id = b.payment_id
            WHERE EXTRACT(YEAR FROM b.date) = $1
        `, [year]);

        await client.end();
        res.json(result.rows);
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Failed to retrieve payments" });
    }
});

app.put("/update_payment", async (req, res) => {
    const { email, userId, payment_id, status, amount, card_or_cash } = req.body;

    const loggedUser = loggedUsers[email];
    if (
        !loggedUser || 
        loggedUser.id !== userId || 
        (loggedUser.access !== "manager" && loggedUser.access !== "employee")
    ) {
        return res.status(403).json({ error: "Unauthorized: Invalid credentials or insufficient access." });
    }

    const client = new Client({
        host: "localhost",
        user: "manager1", 
        port: 5432,
        password: "1111111", 
        database: "BoardGames",
    });

    try {
        await client.connect();

        await client.query(
            "UPDATE payment SET status = $1, amount = $2, card_or_cash = $3 WHERE payment_id = $4",
            [status, amount, card_or_cash, payment_id]
        );

        await client.end();

        res.json({ message: "Payment updated successfully" });
    } catch (err) {
        console.error("Payment update error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});

