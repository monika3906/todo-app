import e from "express";
import { collectionName, connection } from "./dbconfig.js";
import cors from "cors";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = e();

app.use(e.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());


// =========================
// LOGIN
// =========================

app.post("/login", async (req, resp) => {

    const userData = req.body;

    if (userData.email && userData.password) {

        const db = await connection();
        const collection = await db.collection("users");

        const result = await collection.findOne({
            email: userData.email,
            password: userData.password
        });

        if (result) {

            jwt.sign(
                {
                    email: userData.email
                },
                "Google",
                { expiresIn: "5d" },
                (error, token) => {

                    resp.send({
                        success: true,
                        msg: "login done",
                        token
                    });

                }
            );

        } else {

            resp.send({
                success: false,
                msg: "User not found"
            });

        }

    } else {

        resp.send({
            success: false,
            msg: "login not done"
        });

    }

});


// =========================
// SIGNUP
// =========================

app.post("/signup", async (req, resp) => {

    const userData = req.body;

    if (userData.email && userData.password) {

        const db = await connection();
        const collection = await db.collection("users");

        const result = await collection.insertOne(userData);

        if (result) {

            jwt.sign(
                {
                    email: userData.email
                },
                "Google",
                { expiresIn: "5d" },
                (error, token) => {

                    resp.send({
                        success: true,
                        msg: "signup done",
                        token
                    });

                }
            );

        }

    } else {

        resp.send({
            success: false,
            msg: "signup not done"
        });

    }

});


// =========================
// ADD TASK
// =========================

app.post("/add-task", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const result = await collection.insertOne({
        ...req.body,
        userEmail: req.user.email
    });

    if (result) {

        resp.send({
            message: "new task added",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "task not added",
            success: false
        });

    }

});


// =========================
// GET ALL TASKS OF CURRENT USER
// =========================

app.get("/tasks", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const result = await collection
        .find({
            userEmail: req.user.email
        })
        .toArray();

    if (result) {

        resp.send({
            message: "task list fetched",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "error try after sometime",
            success: false
        });

    }

});


// =========================
// GET SINGLE TASK
// =========================

app.get("/task/:id", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const id = req.params.id;

    const result = await collection.findOne({
        _id: new ObjectId(id),
        userEmail: req.user.email
    });

    if (result) {

        resp.send({
            message: "task fetched",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "task not found",
            success: false
        });

    }

});


// =========================
// UPDATE TASK
// =========================

app.put("/update-task", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const { _id, userEmail, ...fields } = req.body;

    const update = {
        $set: fields
    };

    const result = await collection.updateOne(
        {
            _id: new ObjectId(_id),
            userEmail: req.user.email
        },
        update
    );

    if (result.modifiedCount > 0) {

        resp.send({
            message: "task data updated",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "task not found or no changes made",
            success: false
        });

    }

});


// =========================
// DELETE SINGLE TASK
// =========================

app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const id = req.params.id;

    const result = await collection.deleteOne({
        _id: new ObjectId(id),
        userEmail: req.user.email
    });

    if (result.deletedCount > 0) {

        resp.send({
            message: "task deleted",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "task not found",
            success: false
        });

    }

});


// =========================
// DELETE MULTIPLE TASKS
// =========================

app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {

    const db = await connection();
    const collection = await db.collection(collectionName);

    const ids = req.body;

    const deleteTaskIds = ids.map(
        (item) => new ObjectId(item)
    );

    const result = await collection.deleteMany({
        _id: {
            $in: deleteTaskIds
        },
        userEmail: req.user.email
    });

    if (result.deletedCount > 0) {

        resp.send({
            message: "tasks deleted",
            success: true,
            result
        });

    } else {

        resp.send({
            message: "tasks not found",
            success: false
        });

    }

});


// =========================
// JWT VERIFY MIDDLEWARE
// =========================

function verifyJWTToken(req, resp, next) {

    const token = req.cookies["token"];

    console.log("TOKEN FROM COOKIE:", token);

    if (!token) {

        return resp.status(401).send({
            msg: "token missing",
            success: false
        });

    }

    jwt.verify(
        token,
        "Google",
        (error, decoded) => {

            console.log("JWT ERROR:", error);

            if (error) {

                return resp.status(401).send({
                    msg: "invalid token",
                    success: false
                });

            }

            // Store logged-in user information
            req.user = decoded;

            next();
        }
    );

}


// =========================
// START SERVER
// =========================

app.listen(3200, () => {
    console.log("Server running on port 3200");
});