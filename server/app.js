const express = require('express');
const cors = require('cors');
const OpenAI = require("openai");
require('dotenv').config();

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuestions(topic, numberOfQuestions) {
    const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic}. For each question, provide one correct answer and three incorrect answers. Format the response as a JSON array of objects with the following structure: { "question": "...", "correct_answer": "...", "incorrect_answers": ["...", "...", "..."], "all_answers": ["...", "...", "...", "..."] }.`;
    console.log("entered");
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates quiz questions." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });
        
        
        const content = response.choices[0].message.content;
        console.log("Raw content:", content);
        
        // Try to extract JSON from the content
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
            console.log("Extracted JSON string:", jsonString);
            
            try {
                const generatedQuestions = JSON.parse(jsonString);
                return generatedQuestions;
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                return null;
            }
        } else {
            console.error("No valid JSON found in the response");
            return null;
        }
    } catch (error) {
        console.error("Error generating questions:", error);
        return null;
    }
}

app.get('/api/welcome', (req, res) => {
    res.send("Welcome to the backend, if you see this, it means we are live");
});

app.post('/api/course-schedule', async (req, res) => {
    try {
        const { topic, level, time_period } = req.body;
        // Implement course schedule logic here
        res.json({ message: "Course schedule endpoint" });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/edit-resource', (req, res) => {
    console.log("entered 8080 to edit the resource");

    try {
        const { resource, timeSlot, weekNum, dayNum, resourceId, conversationHistory } = req.body;

        console.log('Received edit-resource request:', {
            resource,
            timeSlot,
            weekNum,
            dayNum,
            resourceId
        });

        const updatedResource = {
            id: resourceId,
            link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "Updated resource"
        };

        res.json(updatedResource);
    } catch (error) {
        console.error('Error in edit-resource:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/get-quiz', async (req, res) => {
    try {
        const { topic, number_of_questions } = req.body;
        const questions = await generateQuestions(topic, number_of_questions);

        if (questions) {
            res.json(questions);
        } else {
            res.status(500).json({ error: 'Failed to generate questions' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});