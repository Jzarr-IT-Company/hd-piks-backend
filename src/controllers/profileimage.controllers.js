
const image = async (req, res) => {
    try {
        console.log(req.file)
        return res.status(200).json({ status: 200, message: "success" })
    } catch (error) {
        return res.status(200).json({ status: 500, message: "internal error", errormessage: error.message })
    }
}



export {
    image
}