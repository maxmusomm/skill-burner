const { getDB } = require('./db');

// User management functions
const createOrUpdateUser = async (userData) => {
    try {
        const usersCollection = getDB().collection('users');
        const { email, name, image } = userData;

        // Check if user exists by email only
        const existingUser = await usersCollection.findOne({ email });

        const currentTime = new Date();

        if (existingUser) {
            // Update existing user's last login and any changed data
            const updateData = {
                name,
                image,
                lastLogin: currentTime
            };

            const result = await usersCollection.updateOne(
                { _id: existingUser._id },
                { $set: updateData }
            );

            console.log('User updated:', result);
            return { ...existingUser, ...updateData };
        } else {
            // Create new user
            const newUser = {
                email,
                name,
                image,
                createdDate: currentTime,
                lastLogin: currentTime
            };

            const result = await usersCollection.insertOne(newUser);
            console.log('New user created:', result);
            return { ...newUser, _id: result.insertedId };
        }
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};

module.exports = { createOrUpdateUser };
