# AI Chatbot Backend

This is the backend for an AI Chatbot application, built with Node.js, Express, and MongoDB.

## Setup

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```
    PORT=4000
    MONGO_URI=mongodb+srv://pasken:meetjimmy@courseai.y20tb.mongodb.net/version001?retryWrites=true&w=majority&appName=CourseAI
    JWT_SECRET=pasken_jwt_secret
    AI_API_KEY=your_ai_api_key_here
   ```

   Replace `pasken_jwt_secret` with a strong, unique secret key, and `your_ai_api_key_here` with your actual AI API key.

4. Start the server:

   ```
   npm start
   ```

   For development with auto-restart on file changes:

   ```
   npm run dev
   ```

## API Endpoints

- POST `/api/users/register`: Register a new user
- POST `/api/users/login`: Login a user
- GET `/api/users/profile`: Get user profile (protected)
- PUT `/api/users/profile`: Update user profile (protected)
- PUT `/api/users/preferences`: Update user preferences (protected)

- POST `/api/conversations`: Create a new conversation (protected)
- GET `/api/conversations`: Get all conversations for a user (protected)
- GET `/api/conversations/:id`: Get a specific conversation (protected)
- POST `/api/conversations/:id/messages`: Add a message to a conversation (protected)
- DELETE `/api/conversations/:id`: Delete a conversation (protected)

- POST `/api/ai/generate`: Generate AI response (protected)
- GET `/api/ai/model-info`: Get AI model information (protected)
- GET `/api/ai/usage`: Get API usage statistics (protected)

## License

This project is licensed under the MIT License.
