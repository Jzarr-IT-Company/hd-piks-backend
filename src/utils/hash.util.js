import bcrypt from "bcrypt";


const hashPassword=async(password)=>{
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash
    } catch (error) {
        throw error
    }
}

const compareHash = async (plainText, hashedText) => {
    const isCompared = await bcrypt.compare(plainText, hashedText)
    return isCompared
}

export {
    hashPassword,
    compareHash
}
