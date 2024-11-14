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

          // Handle special cases for BTTS and BTTS & Over 2.5 Goals
          if (question.comparisonTarget === 'btts') {
            computedAnswer = team1Goals > 0 && team2Goals > 0 ? 'Yes' : 'No';
          } else if (question.comparisonTarget === 'btts_over_2_5') {
            const totalGoals = team1Goals + team2Goals;
            computedAnswer = team1Goals > 0 && team2Goals > 0 && totalGoals > 2.5 ? 'Yes' : 'No';
          } else if (question.operator === 'sum') {
            computedAnswer = team1Goals + team2Goals;
          } else if (question.operator === 'greaterThan') {
            const totalGoals = team1Goals + team2Goals;
            computedAnswer = totalGoals > parseFloat(question.threshold) ? 'Yes' : 'No';
          } else if (question.operator === 'comparison' && question.comparisonTarget === 'teams') {
            computedAnswer = team1Goals > team2Goals ? team1Name : team2Name;
          } else if (question.operator === 'singleTeam') {
            computedAnswer = question.teamSelection === 'team1' ? team1Goals : team2Goals;
          }

          setStatResult(result);
          setAnswer(computedAnswer);
        } else {
          console.error('No goals data found for the selected period');
          setStatResult('No goals data found');
        }
      } else {
        // Handle non-goal stats
        const periodData = data.statistics.find(item => item.period === parseInt(question.period, 10));
        if (!periodData) {
          console.error('No data found for the specified period');
          setStatResult('No data found for the specified period');
          return;
        }

        const statEntry = periodData.data.find(entry => entry.text.args.includes(question.statField));
        if (statEntry) {
          let computedAnswer;

          if (question.operator === 'sum') {
            result = { team1: statEntry.team1, team2: statEntry.team2 };
            computedAnswer = Number(statEntry.team1) + Number(statEntry.team2);
          } else if (question.operator === 'greaterThan') {
            const total = Number(statEntry.team1) + Number(statEntry.team2);
            result = { team1: statEntry.team1, team2: statEntry.team2 };
            computedAnswer = total > Number(question.threshold) ? 'Yes' : 'No';
          } else if (question.operator === 'comparison' && question.comparisonTarget === 'teams') {
            result = { team1: statEntry.team1, team2: statEntry.team2 };
            computedAnswer = statEntry.team1 > statEntry.team2 ? team1Name : team2Name;
          } else if (question.operator === 'comparison' && question.comparisonTarget === 'periods') {
            const firstHalfData = data.statistics.find(item => item.period === 1);
            const secondHalfData = data.statistics.find(item => item.period === 2);

            const firstHalfEntry = firstHalfData?.data.find(entry => entry.text.args.includes(question.statField));
            const secondHalfEntry = secondHalfData?.data.find(entry => entry.text.args.includes(question.statField));

            const firstHalfTotal = firstHalfEntry ? Number(firstHalfEntry.team1) + Number(firstHalfEntry.team2) : 0;
            const secondHalfTotal = secondHalfEntry ? Number(secondHalfEntry.team1) + Number(secondHalfEntry.team2) : 0;

            result = {
              firstHalf: firstHalfTotal,
              secondHalf: secondHalfTotal
            };
            computedAnswer = firstHalfTotal > secondHalfTotal ? 'First Half' : 'Second Half';
          } else if (question.operator === 'singleTeam') {
            computedAnswer = question.teamSelection === 'team1' ? statEntry.team1 : statEntry.team2;
          }

          setStatResult(result);
          setAnswer(computedAnswer);
        } else {
          console.error('Stat field not found in period data');
          setStatResult('Stat field not found');
        }
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setStatResult('Error loading file');
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
          <div>{teamNames.team1}: {statResult.team1}</div>
          <div>{teamNames.team2}: {statResult.team2}</div>
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
