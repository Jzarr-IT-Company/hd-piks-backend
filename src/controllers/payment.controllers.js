import Stripe from "stripe";
import { addPaymentDetails, deletePaymentById, getAllPaymentDetails, paymnetButId } from "../services/payment.services.js";

const payment = async (req, res) => {
    const { amount } = req.body; // Amount in PKR

    try {
        // 5590 4902 2754 2386
        // 04 / 29
        // 662
        // 5590 4902 3115 1224
        // Convert amount from PKR to cents (assuming 1 PKR = 100 cents)
        const amountInCents = amount * 100;

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'pkr',
            payment_method_types: ['card'],
            // Additional settings (optional)
            description: 'Payment for selected courses'
        });

        return res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const addPaymentDetail = async (req, res) => {
    try {
        const { image, email, phone, amount, name, coursesname, id, paymenttype, promocode
        } = req.body;
        const data = {
            image, email, phone, amount, name, coursesname, id, paymenttype, promocode
        }
        const response = await addPaymentDetails(data);
        return res.status(200).json({ status: 200, message: "success", response });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

const getPaymentDetail = async (req, res) => {
    try {
        const response = await getAllPaymentDetails()
        return res.status(200).json({ status: 200, message: "success", response });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const jazzcash = async (req, res) => {
    try {
        return res.status(200).json({ status: 200, message: "success" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateIsActive = async (req, res) => {
    try {
        const { id, coursename } = req.body;
        console.log(coursename)
        const response = await isACtiveUpdate(id, coursename);
        if (!response) return res.status(400).json({ status: 400, message: "not update yet" })
        return res.status(200).json({ status: 200, message: "Success", response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "INTERNAL ERROR", errormessage: error.message })
    }
}

const paymentDetailGetByID = async (req, res) => {
    try {
        const { id } = req.body;
        const response = await paymnetButId(id)
        return res.status(200).json({ status: 200, message: "Success", response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "INTERNAL ERROR", errormessage: error.message })
    }
}

const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await deletePaymentById(id)
        return res.status(200).json({ status: 200, message: "Success", response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "INTERNAL ERROR", errormessage: error.message })
    }
}

export {
    payment,
    addPaymentDetail,
    jazzcash,
    getPaymentDetail,
    updateIsActive,
    paymentDetailGetByID,
    deletePayment
}


