import mongoose from "mongoose";
import usersModule from "./users.module.js";
import tokenModule from "./token.module.js";
import paymentModule from "./payment.module.js";
import imagesModule from "./images.modue.js";
import likeModule from "./like.module.js";
import collectionsModule from "./collections.module.js";
import creatorsModule from "./creators.module.js";
import categoryModule from "./category.js";
import subCategoryCollectionModule from "./subCategoryCollection.module.js";
const db = {}

db.mongoose = mongoose,
    db.users = usersModule,
    db.token = tokenModule,
    db.payment = paymentModule,
    db.images = imagesModule,
    db.likes = likeModule,
    db.collections = collectionsModule,
    db.creators = creatorsModule,
    db.categories = categoryModule,
    db.subCategoryCollections = subCategoryCollectionModule

export default db
