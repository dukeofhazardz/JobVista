import dbClient from "../utils/db";
const User = {
    async nbUsers(req, res) {
        const userCount = await dbClient.nbUsers()
        return res.status(200).json({'Number of Users': userCount.toString()});
    }
};

export default User;