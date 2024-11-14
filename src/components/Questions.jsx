import React, { useEffect, useState  } from 'react';
import { FiMoreVertical, FiPlay } from 'react-icons/fi';
import CreateQuestion from './CreateQuestion';
import PlayQuestion from './PlayQuestion';
import axios from 'axios';
import styles from './styles/Questions.module.css';
const API_BASE_URL = 'https://autoresultingbackend-production.up.railway.app/api';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPlayPopupOpen, setIsPlayPopupOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [isPopupOpen]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAddQuestion = async (newQuestion) => {
    try {
      if (editingQuestion) {
        await axios.put(`${API_BASE_URL}/questions/${newQuestion.id}`, newQuestion);
      } else {
        newQuestion.status = 'enabled';
        await axios.post(`${API_BASE_URL}/questions`, newQuestion);
      }
      fetchQuestions();
      setIsPopupOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };
  
  

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsPopupOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
    setOpenMenuId(null);
  };

  const toggleStatus = async (question) => {
    const updatedQuestion = {
      ...question,
      status: question.status === 'enabled' ? 'disabled' : 'enabled'
    };
    await axios.put(`${API_BASE_URL}/questions/${question.id}`, updatedQuestion);
    fetchQuestions();
  };

  const handlePlay = (question) => {
    setSelectedQuestion(question);
    setIsPlayPopupOpen(true);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(`.${styles.menuContainer}`) === null) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.questionsPage}>
      <div className={styles.header}>
        <h2>Questions Setup</h2>
        <button className={styles.addButton} onClick={() => setIsPopupOpen(true)}>Create Question</button>
      </div>

      {isPopupOpen && (
        <CreateQuestion
          onClose={() => { setIsPopupOpen(false); setEditingQuestion(null); }}
          onAddQuestion={handleAddQuestion}
          editingQuestion={editingQuestion}
        />
      )}

      {isPlayPopupOpen && (
        <PlayQuestion
          question={selectedQuestion}
          onClose={() => setIsPlayPopupOpen(false)}
        />
      )}

      <table className={styles.questionsTable}>
        <thead>
          <tr>
            <th>Question Text</th>
            <th>Period</th>
            <th>Stat Field</th>
            <th>Status</th>
            <th>Action</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.id}>
              <td>{question.text}</td>
              <td>{question.period === '0' ? 'Full Time' : question.period === '1' ? 'First Half' : 'Second Half'}</td>
              <td>{question.statField}</td>
              <td>
                <span className={question.status === 'enabled' ? styles.statusEnabled : styles.statusDisabled}>
                  {question.status === 'enabled' ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td>
                <FiPlay className={styles.playIcon} onClick={() => handlePlay(question)} />
              </td>
              <td>
                <div className={styles.menuContainer}>
                  <FiMoreVertical
                    className={styles.menuIcon}
                    onClick={() => toggleMenu(question.id)}
                  />
                  {openMenuId === question.id && (
                    <div className={styles.menuDropdown}>
                      <button onClick={() => handleEdit(question)}>Edit</button>
                      <button onClick={() => handleDelete(question.id)}>Delete</button>
                      <button onClick={() => toggleStatus(question)}>
                        {question.status === 'enabled' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Questions;
