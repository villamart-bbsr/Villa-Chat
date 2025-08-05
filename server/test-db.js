import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Conversation from './models/conversation.js';

dotenv.config();

const CONNECTION_URL = process.env.CONNECTION_URL;

console.log('Testing database connection...');
console.log('Connection URL:', CONNECTION_URL);

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('✅ Connected to MongoDB successfully');
        
        // Test creating a conversation
        const testConversation = new Conversation({
            Subject: 'Test Conversation',
            UpdatedAt: new Date(),
            Attendees: [
                { label: 'Test User', value: 'test123' }
            ],
            Messages: []
        });
        
        try {
            const savedConversation = await testConversation.save();
            console.log('✅ Test conversation created successfully:', savedConversation._id);
            
            // Test retrieving conversations
            const conversations = await Conversation.find({});
            console.log(`✅ Found ${conversations.length} conversations in database`);
            
            // Clean up test data
            await Conversation.findByIdAndDelete(savedConversation._id);
            console.log('✅ Test conversation cleaned up');
            
        } catch (error) {
            console.error('❌ Error creating test conversation:', error);
        }
        
        mongoose.connection.close();
        console.log('Database connection closed');
        
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
    });
