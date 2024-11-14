const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5001;
app.use(cors());
app.use(express.json());

const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

// Utility function to read questions from the file
const readQuestionsFromFile = () => {
  try {
    const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading questions:', err);
    return [];
  }
};

// Utility function to write questions to the file
const writeQuestionsToFile = (questions) => {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error('Error saving questions:', err);
  }
};

// Get all questions
app.get('/api/questions', (req, res) => {
  try {
    const questions = readQuestionsFromFile();
    res.json(questions);
  } catch (err) {
    console.error('Error reading questions:', err);
    res.status(500).json({ error: 'Error reading questions' });
  }
});

// Save a new question or update an existing one
app.post('/api/questions', (req, res) => {
  const newQuestion = req.body;

  try {
    const questions = readQuestionsFromFile();
    questions.push(newQuestion);
    writeQuestionsToFile(questions);
    res.json({ message: 'Question saved successfully' });
  } catch (err) {
    console.error('Error saving question:', err);
    res.status(500).json({ error: 'Error saving question' });
  }
});

// Update an existing question by ID
app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const updatedQuestion = req.body;

  try {
    let questions = readQuestionsFromFile();
    const questionIndex = questions.findIndex(q => q.id.toString() === questionId.toString());

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update the question
    questions[questionIndex] = { ...questions[questionIndex], ...updatedQuestion };
    writeQuestionsToFile(questions);

    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Error updating question' });
  }
});


// Delete a question by ID
app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;

  try {
    let questions = readQuestionsFromFile();
    const updatedQuestions = questions.filter(q => q.id.toString() !== questionId.toString());

    if (updatedQuestions.length === questions.length) {
      return res.status(404).json({ error: 'Question not found' });
    }

    writeQuestionsToFile(updatedQuestions);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Error deleting question' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
