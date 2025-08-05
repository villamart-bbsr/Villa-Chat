import User from '../models/user.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('name _id email');
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUsersBySearch = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        // Search users by name or email using case-insensitive regex
        const users = await User.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('name _id email').limit(10); // Limit results to 10 users
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: error.message });
    }
}
