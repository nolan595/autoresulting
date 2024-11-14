import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from './styles/CreateQuestion.module.css';

const statsFields = [
  { value: "scores", label: "Goals" },
  { value: "stats.football.match.ball_possesion", label: "Ball Possession" },
  { value: "stats.football.match.shots", label: "Total Shots" },
  { value: "stats.football.match.shots_on_goal", label: "Shots on Target" },
  { value: "stats.football.match.shots_off_goal", label: "Shots off Target" },
  { value: "stats.football.match.free_kicks", label: "Free Kicks" },
  { value: "stats.football.match.corner_kicks", label: "Corner Kicks" },
  { value: "stats.football.match.offsides", label: "Offsides" },
  { value: "stats.football.match.throw_ins", label: "Throw-Ins" },
  { value: "stats.football.match.goalkeeper_saves", label: "Goalkeeper Saves" },
  { value: "stats.football.match.goal_kicks", label: "Goal Kicks" },
  { value: "stats.football.match.fouls", label: "Fouls Committed" },
  { value: "stats.football.match.red_cards", label: "Red Cards" },
  { value: "stats.football.match.yellow_cards", label: "Yellow Cards" },
  { value: "stats.football.match.dangerous_attacks", label: "Dangerous Attacks" },
  { value: "stats.football.match.attacks", label: "Total Attacks" },
  { value: "stats.football.match.penalties", label: "Penalties" },
  { value: "stats.football.match.shots_blocked", label: "Shots Blocked" },
  { value: "stats.football.match.injuries", label: "Injuries" }
];

const periods = [
  { value: '', label: "Select Period" },
  { value: 0, label: "Full Time" },
  { value: 1, label: "First Half" },
  { value: 2, label: "Second Half" }
];

const goalPeriods = [
  { value: '', label: "Select Period" },
  { value: 6, label: "Full Time" },
  { value: 1, label: "First Half" },
  { value: 2, label: "Second Half" }
];

const operators = [
  { value: 'sum', label: 'Sum' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'greaterThan', label: 'Greater Than (Yes/No)' },
  { value: 'singleTeam', label: 'Single Team Value' }
];

const comparisonTargets = [
  { value: 'teams', label: 'Teams' },
  { value: 'periods', label: 'Periods' },
  { value: 'btts', label: 'Both Teams to Score' },
  { value: 'btts_over_2_5', label: 'BTTS & Over 2.5 Goals' }
];

const CreateQuestion = ({ onClose, onAddQuestion, editingQuestion }) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedStat, setSelectedStat] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [threshold, setThreshold] = useState('');
  const [comparisonTarget, setComparisonTarget] = useState('');
  const [teamSelection, setTeamSelection] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.text);
      setSelectedStat(statsFields.find(stat => stat.value === editingQuestion.statField));
      setSelectedPeriod(editingQuestion.period);
      setSelectedOperator(editingQuestion.operator);
      setThreshold(editingQuestion.threshold || '');
      setComparisonTarget(editingQuestion.comparisonTarget || '');
      setTeamSelection(editingQuestion.teamSelection || '');
    }
  }, [editingQuestion]);

  const handleSubmit = async () => {
    if (
      !questionText.trim() ||
      !selectedStat ||
      selectedPeriod === '' ||
      selectedOperator === ''
    ) {
      alert("Please fill in all fields");
      return;
    }

    const newQuestion = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      text: questionText,
      statField: selectedStat.value,
      period: selectedPeriod,
      operator: selectedOperator,
      comparisonTarget: selectedOperator === 'comparison' ? comparisonTarget : '',
      threshold,
      teamSelection,
      status: 'enabled'
    };

    try {
      if (editingQuestion) {
        await axios.put(`http://localhost:5001/api/questions/${newQuestion.id}`, newQuestion);
      } else {
        await axios.post('http://localhost:5001/api/questions', newQuestion);
      }
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <h3>{editingQuestion ? "Edit Question" : "Create a New Question"}</h3>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question text"
          className={styles.input}
        />

        {/* Updated Dropdown for Stat Field */}
        <Select
          options={statsFields}
          value={selectedStat}
          onChange={(option) => setSelectedStat(option)}
          placeholder="Select Stat Field"
          isClearable
          className={styles.select}
        />

        {/* Period Selection Based on Selected Stat */}
        <select
  value={selectedPeriod}
  onChange={(e) => setSelectedPeriod(e.target.value)}
  className={styles.select}
>
  {(selectedStat?.value === 'scores' ? goalPeriods : periods).map((period) => (
    <option key={period.value} value={period.value}>
      {period.label}
    </option>
  ))}
</select>





        <select
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
          className={styles.select}
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {selectedOperator === 'greaterThan' && (
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Enter threshold"
            className={styles.input}
          />
        )}

{selectedOperator === 'comparison' && selectedStat?.value === 'scores' && (
  <select
    value={comparisonTarget}
    onChange={(e) => setComparisonTarget(e.target.value)}
    className={styles.select}
  >
    {comparisonTargets.map((target) => (
      <option key={target.value} value={target.value}>{target.label}</option>
    ))}
  </select>
)}


        <button onClick={handleSubmit} className={styles.buttonPrimary}>
          {editingQuestion ? "Save Changes" : "Add Question"}
        </button>
        <button onClick={onClose} className={styles.buttonSecondary}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateQuestion;
