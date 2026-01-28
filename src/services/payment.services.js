

import db from "../modules/index.js"
const { payment: Payments } = db;

const addPaymentDetails = async (data) => {
    try {
        const addPaymentData = await Payments(data)
        const response = addPaymentData.save()
        return response;
    } catch (error) {
        throw error
    }
}

const getAllPaymentDetails = async () => {
    try {
        const response = await Payments.find({}).exec();
        return response
    } catch (error) {
        throw error
    }
}

const isACtiveUpdate = async (_id, coursename) => {
    try {
        console.log(_id)
        const response = await Payments.updateOne(
            { _id: _id },
            { $set: { isActive: true } },
            { upsert: true }
        );
        console.log(response)
        return response
    } catch (error) {
        throw error
    }
}

const paymnetButId = async (id) => {
    try {
        const response = await Payments.find({ _id: id }).exec();
        return response
    } catch (error) {
        throw error
    }
}

const deletePaymentById = async (_id) => {
    try {
        const response = await Payments.findByIdAndDelete(_id)
        return response
    } catch (error) {
        throw error
    }
}

export {
    addPaymentDetails,
    getAllPaymentDetails,
    paymnetButId,
    deletePaymentById
}