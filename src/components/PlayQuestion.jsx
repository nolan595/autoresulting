import React, { useState, useEffect } from 'react';
import styles from './styles/PlayQuestion.module.css';

const PlayQuestion = ({ question, onClose }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [statResult, setStatResult] = useState(null);
  const [teamNames, setTeamNames] = useState({ team1: 'Home Team', team2: 'Away Team' });
  const [answer, setAnswer] = useState('');

  // Load available files for selection
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/data/files.json');
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error('Error loading files:', error);
      }
    };
    fetchFiles();
  }, []);

  const getStatValue = (statistics, type, period) => {
    const periodData = statistics.find(item => item.period === parseInt(period, 10));
    if (!periodData) return { team1: 0, team2: 0 };

    const statEntry = periodData.data.find(entry => entry.text.args.includes(type));
    return statEntry ? { team1: parseInt(statEntry.team1) || 0, team2: parseInt(statEntry.team2) || 0 } : { team1: 0, team2: 0 };
  };

  const handleLoadFile = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/data/${selectedFile}`);
      const data = await response.json();

      const team1Name = data.team1?.name || 'Home Team';
      const team2Name = data.team2?.name || 'Away Team';
      setTeamNames({ team1: team1Name, team2: team2Name });

      let result;
      let computedAnswer;

      // Handle goals-specific questions
      if (question.statField === 'scores') {
        const scoreType = question.period === '0' ? 6 : parseInt(question.period);
        const scoreData = data.scores.find(score => score.type === scoreType);

        if (scoreData) {
          const team1Goals = scoreData.team1;
          const team2Goals = scoreData.team2;
          result = { team1: team1Goals, team2: team2Goals };

          if (question.comparisonTarget === 'btts') {
            computedAnswer = (team1Goals > 0 && team2Goals > 0) ? 'Yes' : 'No';
          } else if (question.comparisonTarget === 'btts_over_2_5') {
            const totalGoals = team1Goals + team2Goals;
            computedAnswer = (team1Goals > 0 && team2Goals > 0 && totalGoals > 2.5) ? 'Yes' : 'No';
          } else if (question.comparisonTarget === 'periods') {
            const firstHalf = data.scores.find(score => score.type === 1);
            const secondHalf = data.scores.find(score => score.type === 2);

            const firstHalfGoals = firstHalf ? firstHalf.team1 + firstHalf.team2 : 0;
            const secondHalfGoals = secondHalf ? secondHalf.team1 + secondHalf.team2 : 0;

            result = { firstHalf: firstHalfGoals, secondHalf: secondHalfGoals };
            if (firstHalfGoals > secondHalfGoals) {
              computedAnswer = 'First Half';
            } else if (secondHalfGoals > firstHalfGoals) {
              computedAnswer = 'Second Half';
            } else {
              computedAnswer = 'Draw';
            }

            if (question.comparisonTarget === 'btts') {
              computedAnswer = team1Goals > 0 && team2Goals > 0 ? 'Yes' : 'No';
            } else if (question.comparisonTarget === 'btts_over_2_5') {
              const totalGoals = team1Goals + team2Goals;
              computedAnswer = team1Goals > 0 && team2Goals > 0 && totalGoals > 2.5 ? 'Yes' : 'No';
            }
            else  if (question.comparisonTarget === 'btts') {
              computedAnswer = team1Goals > 0 && team2Goals > 0 ? 'Yes' : 'No';
            } else if (question.comparisonTarget === 'btts_over_2_5') {
              const totalGoals = team1Goals + team2Goals;
              computedAnswer = team1Goals > 0 && team2Goals > 0 && totalGoals > 2.5 ? 'Yes' : 'No';
            }
          } else if (question.operator === 'sum') {
            computedAnswer = team1Goals + team2Goals;
          } else if (question.operator === 'greaterThan') {
            const totalGoals = team1Goals + team2Goals;
            computedAnswer = totalGoals > parseFloat(question.threshold) ? 'Yes' : 'No';
          } else if (question.operator === 'comparison' && question.comparisonTarget === 'teams') {
            if (team1Goals > team2Goals) {
              computedAnswer = team1Name;
            } else if (team2Goals > team1Goals) {
              computedAnswer = team2Name;
            } else {
              computedAnswer = 'Draw';
            }
          } else if (question.operator === 'singleTeam') {
            computedAnswer = question.teamSelection === 'team1' ? team1Goals : team2Goals;
          }

          setStatResult(result);
          setAnswer(computedAnswer);
        } else {
          setStatResult({ team1: 0, team2: 0 });
          setAnswer('No');
        }
      } else {
        // Handle non-goal stats
        const statData = getStatValue(data.statistics, question.statField, question.period);
        result = statData;

        if (question.comparisonTarget === 'periods') {
          const firstHalfData = getStatValue(data.statistics, question.statField, 1);
          const secondHalfData = getStatValue(data.statistics, question.statField, 2);

          const firstHalfTotal = firstHalfData.team1 + firstHalfData.team2;
          const secondHalfTotal = secondHalfData.team1 + secondHalfData.team2;

          result = { firstHalf: firstHalfTotal, secondHalf: secondHalfTotal };

          if (firstHalfTotal > secondHalfTotal) {
            computedAnswer = 'First Half';
          } else if (secondHalfTotal > firstHalfTotal) {
            computedAnswer = 'Second Half';
          } else {
            computedAnswer = 'Draw';
          }
        } else if (question.operator === 'sum') {
          computedAnswer = statData.team1 + statData.team2;
        } else if (question.operator === 'greaterThan') {
          const total = statData.team1 + statData.team2;
          computedAnswer = total > Number(question.threshold) ? 'Yes' : 'No';
        } else if (question.operator === 'comparison' && question.comparisonTarget === 'teams') {
          if (statData.team1 > statData.team2) {
            computedAnswer = team1Name;
          } else if (statData.team2 > statData.team1) {
            computedAnswer = team2Name;
          } else {
            computedAnswer = 'Draw';
          }
        } else if (question.operator === 'singleTeam') {
          computedAnswer = question.teamSelection === 'team1' ? statData.team1 : statData.team2;
        }

        setStatResult(result);
        setAnswer(computedAnswer);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setStatResult({ team1: 0, team2: 0 });
    }
  };

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupHeader}>
        <h3 className={styles.popupTitle}>Execute Question</h3>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
      </div>

      <select
        className={styles.dropdown}
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
      >
        <option value="">Select a file</option>
        {files.map((file, index) => (
          <option key={index} value={file}>{file}</option>
        ))}
      </select>

      <button className={styles.executeButton} onClick={handleLoadFile}>Execute</button>

      {statResult && (
  <div className={styles.resultContainer}>
    <h4 className={styles.resultTitle}>Result:</h4>
    {question.comparisonTarget === 'periods' ? (
      <>
        <div>First Half: {statResult.firstHalf} </div>
        <div>Second Half: {statResult.secondHalf} </div>
      </>
    ) : (
      <>
        <div>{teamNames.team1}: {statResult.team1}</div>
        <div>{teamNames.team2}: {statResult.team2}</div>
      </>
    )}
    {answer && (
      <div className={styles.answerContainer}>
        <h4 className={styles.answerTitle}>Answer:</h4>
        <p className={styles.answerValue}>{answer}</p>
      </div>
    )}
  </div>
)}

      <button className={styles.cancelButton} onClick={onClose}>Close</button>
    </div>
  );
};

export default PlayQuestion;
