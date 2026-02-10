import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import subCatgoryCollectionRoutes from "./routes/subCatgoryCollection.routes.js";

const app = express();

app.use(express.json());

// mount all routes
app.use(subCatgoryCollectionRoutes);
// or, if you use a prefix:
// app.use('/api', subCatgoryCollectionRoutes);

export default app;