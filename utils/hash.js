import bcrypt from "bcrypt";

export const hashPassword = async (password) => {

    if (!password) {
        throw new Error("Password is required");
    }

    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const isPasswordValid = async (password, hashedPassword) => {

    if (!password || !hashedPassword) {
        throw new Error("Senha e hash são obrigatórios para verificação.");
    }

    return await bcrypt.compare(password, hashedPassword);
}