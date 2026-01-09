import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('role');
  const [roles, setRoles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleQuestions, setRoleQuestions] = useState([]);
  const [cvText, setCvText] = useState('');
  const [personalQuestions, setPersonalQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchCandidates();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`);
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Kunde inte hämta roller:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Kunde inte hämta kandidater:', err);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // === ROLL FUNCTIONS ===

  const createRole = async () => {
    if (!roleName.trim()) {
      showMessage('Ange ett rollnamn', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roleName, description: roleDescription })
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setSelectedRole(data);
        setRoleQuestions(data.questions || []);
        showMessage('Roll skapad! Granska frågorna nedan.');
        fetchRoles();
      }
    } catch (err) {
      showMessage('Något gick fel vid skapandet av rollen', 'error');
    }
    setLoading(false);
  };

  const selectExistingRole = async (role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/roles/${role.id}`);
      const data = await res.json();
      setSelectedRole(data);
      setRoleQuestions(data.questions || []);
      setRoleName(data.name);
      setRoleDescription(data.description || '');
    } catch (err) {
      showMessage('Kunde inte hämta roll', 'error');
    }
    setLoading(false);
  };

  const updateRoleQuestions = async () => {
    if (!selectedRole) return;

    try {
      await fetch(`${API_URL}/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: roleQuestions })
      });
      showMessage('Frågor uppdaterade!');
    } catch (err) {
      showMessage('Kunde inte uppdatera frågor', 'error');
    }
  };

  const deleteQuestion = (index, questionList, setQuestionList) => {
    const newList = [...questionList];
    newList.splice(index, 1);
    setQuestionList(newList);
  };

  const addQuestion = (questionList, setQuestionList) => {
    setQuestionList([...questionList, { category: 'Ny', question: '' }]);
  };

  const updateQuestion = (index, field, value, questionList, setQuestionList) => {
    const newList = [...questionList];
    newList[index] = { ...newList[index], [field]: value };
    setQuestionList(newList);
  };

  // === CV & PERSONAL QUESTIONS ===

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload-cv`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setCvText(data.cv_text);
        showMessage('CV laddat!');
      }
    } catch (err) {
      showMessage('Kunde inte läsa filen', 'error');
    }
    setLoading(false);
  };

  const generatePersonalQuestions = async () => {
    if (!cvText.trim()) {
      showMessage('Ladda upp eller klistra in CV först', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-personal-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_text: cvText,
          role_name: selectedRole?.name || '',
          role_description: selectedRole?.description || ''
        })
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setPersonalQuestions(data.questions);
        showMessage('Personliga frågor genererade!');
      }
    } catch (err) {
      showMessage('Kunde inte generera frågor', 'error');
    }
    setLoading(false);
  };

  const prepareCandidate = async () => {
    if (!selectedRole) {
      showMessage('Välj en roll först', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/prepare-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRole.id,
          cv_text: cvText,
          personal_questions: personalQuestions
        })
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setCurrentCandidate({ id: data.candidate_id });
        setAllQuestions(data.all_questions);
        setActiveTab('interview');
        showMessage('Kandidat förberedd! Gå vidare till intervjun.');
      }
    } catch (err) {
      showMessage('Kunde inte förbereda kandidat', 'error');
    }
    setLoading(false);
  };

  // === INTERVIEW & ANALYSIS ===

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setTranscript(data.transcript);
        showMessage('Ljudfil transkriberad!');
      }
    } catch (err) {
      showMessage('Kunde inte transkribera ljudfilen', 'error');
    }
    setLoading(false);
  };

  const analyzeInterview = async () => {
    if (!candidateName.trim()) {
      showMessage('Ange kandidatens namn', 'error');
      return;
    }
    if (!transcript.trim()) {
      showMessage('Ladda upp ljudfil eller skriv in transkription', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: currentCandidate.id,
          candidate_name: candidateName,
          transcript: transcript
        })
      });
      const data = await res.json();

      if (data.error) {
        showMessage(data.error, 'error');
      } else {
        setAnalysisResult(data);
        setActiveTab('results');
        fetchCandidates();
        showMessage('Analys klar!');
      }
    } catch (err) {
      showMessage('Kunde inte analysera intervjun', 'error');
    }
    setLoading(false);
  };

  // === REPORT ===

  const downloadReport = async (candidateId) => {
    try {
      const res = await fetch(`${API_URL}/report/${candidateId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intervjurapport_${candidateId}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showMessage('Kunde inte ladda ner rapporten', 'error');
    }
  };

  const viewCandidateDetail = async (candidateId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/candidates/${candidateId}`);
      const data = await res.json();
      setSelectedCandidateDetail(data);
      setActiveTab('results');
    } catch (err) {
      showMessage('Kunde inte hämta kandidatinfo', 'error');
    }
    setLoading(false);
  };

  // === RENDER ===

  const getScoreClass = (score) => {
    if (score >= 40) return 'score-high';
    if (score >= 25) return 'score-medium';
    return 'score-low';
  };

  const resetForNewCandidate = () => {
    setCvText('');
    setPersonalQuestions([]);
    setCandidateName('');
    setTranscript('');
    setAnalysisResult(null);
    setCurrentCandidate(null);
    setAllQuestions([]);
    setActiveTab('role');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Rekryteringsverktyg</h1>
      </header>

      <nav className="nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'role' ? 'active' : ''}`}
            onClick={() => setActiveTab('role')}
          >
            1. Roll & Kandidat
          </button>
          <button
            className={`nav-tab ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
            disabled={!currentCandidate}
          >
            2. Intervju
          </button>
          <button
            className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            3. Resultat
          </button>
          <button
            className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            4. Jämför
          </button>
        </div>
      </nav>

      <main className="main-content">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Arbetar...</p>
          </div>
        )}

        {/* TAB 1: ROLL & KANDIDAT */}
        {activeTab === 'role' && !loading && (
          <>
            {/* Skapa ny roll */}
            <div className="card">
              <h2 className="card-title">Skapa ny roll</h2>
              <div className="form-group">
                <label className="form-label">Rollnamn *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="T.ex. Avdelningschef Konstruktion"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rollbeskrivning</label>
                <textarea
                  className="form-textarea"
                  placeholder="Beskriv rollen, ansvarsområden, önskade kvalifikationer..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={createRole}>
                Skapa roll & generera frågor
              </button>
            </div>

            {/* Välj befintlig roll */}
            {roles.length > 0 && (
              <div className="card">
                <h2 className="card-title">Eller välj befintlig roll</h2>
                <div className="roles-grid">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
                      onClick={() => selectExistingRole(role)}
                    >
                      <div className="role-name">{role.name}</div>
                      <div className="role-description">
                        {role.description?.substring(0, 100) || 'Ingen beskrivning'}
                        {role.description?.length > 100 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rollfrågor */}
            {selectedRole && roleQuestions.length > 0 && (
              <div className="card">
                <h2 className="card-title">Intervjufrågor för {selectedRole.name}</h2>
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  Granska och redigera frågorna. Dessa används för alla kandidater till denna roll.
                </p>
                <div className="questions-list">
                  {roleQuestions.map((q, i) => (
                    <div key={i} className="question-item">
                      <div className="question-header">
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}
                            value={q.category}
                            onChange={(e) => updateQuestion(i, 'category', e.target.value, roleQuestions, setRoleQuestions)}
                            placeholder="Kategori"
                          />
                          <textarea
                            className="form-textarea"
                            style={{ minHeight: '80px' }}
                            value={q.question}
                            onChange={(e) => updateQuestion(i, 'question', e.target.value, roleQuestions, setRoleQuestions)}
                            placeholder="Fråga"
                          />
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteQuestion(i, roleQuestions, setRoleQuestions)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => addQuestion(roleQuestions, setRoleQuestions)}>
                    + Lägg till fråga
                  </button>
                  <button className="btn btn-primary" onClick={updateRoleQuestions}>
                    Spara frågor
                  </button>
                </div>
              </div>
            )}

            {/* CV Upload */}
            {selectedRole && (
              <div className="card">
                <h2 className="card-title">Ladda upp kandidatens CV</h2>
                <div className="file-upload" onClick={() => document.getElementById('cv-upload').click()}>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <p>Klicka för att välja fil (PDF, Word eller TXT)</p>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Eller klistra in CV-text direkt:</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '150px' }}
                    placeholder="Klistra in CV-text här..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                </div>

                {cvText && (
                  <button className="btn btn-primary" onClick={generatePersonalQuestions}>
                    Generera personliga frågor
                  </button>
                )}
              </div>
            )}

            {/* Personliga frågor */}
            {personalQuestions.length > 0 && (
              <div className="card">
                <h2 className="card-title">Personliga frågor (baserade på CV)</h2>
                <div className="questions-list">
                  {personalQuestions.map((q, i) => (
                    <div key={i} className="question-item">
                      <div className="question-header">
                        <div style={{ flex: 1 }}>
                          <div className="question-category">{q.category}</div>
                          <textarea
                            className="form-textarea"
                            style={{ minHeight: '60px' }}
                            value={q.question}
                            onChange={(e) => updateQuestion(i, 'question', e.target.value, personalQuestions, setPersonalQuestions)}
                          />
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteQuestion(i, personalQuestions, setPersonalQuestions)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => addQuestion(personalQuestions, setPersonalQuestions)}>
                    + Lägg till fråga
                  </button>
                  <button className="btn btn-primary" onClick={prepareCandidate}>
                    Gå vidare till intervju
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: INTERVJU */}
        {activeTab === 'interview' && !loading && (
          <>
            <div className="card">
              <h2 className="card-title">Intervjufrågor ({allQuestions.length} st)</h2>
              <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                Läs upp dessa frågor under intervjun. Ladda sedan upp ljudinspelningen efteråt.
              </p>
              <div className="questions-list">
                {allQuestions.map((q, i) => (
                  <div key={i} className="question-item">
                    <div className="question-category">{i + 1}. {q.category}</div>
                    <div className="question-text">{q.question}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Efter intervjun</h2>

              <div className="form-group">
                <label className="form-label">Kandidatens namn *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Förnamn Efternamn"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ladda upp ljudinspelning</label>
                <div className="file-upload" onClick={() => document.getElementById('audio-upload').click()}>
                  <input
                    id="audio-upload"
                    type="file"
                    accept=".mp3,.m4a,.wav,.webm,.ogg"
                    onChange={handleAudioUpload}
                  />
                  <p>Klicka för att välja ljudfil (MP3, M4A, WAV etc.)</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Eller skriv/klistra in transkription:</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '200px' }}
                  placeholder="Klistra in transkription här om du redan har en..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={analyzeInterview}>
                Analysera intervju
              </button>
            </div>
          </>
        )}

        {/* TAB 3: RESULTAT */}
        {activeTab === 'results' && !loading && (
          <>
            {(analysisResult || selectedCandidateDetail) && (
              <>
                <div className="card">
                  <div className="results-header">
                    <div>
                      <h2 className="card-title">
                        {selectedCandidateDetail?.name || candidateName}
                      </h2>
                      <p style={{ color: '#64748b' }}>
                        {selectedCandidateDetail?.role_name || selectedRole?.name}
                        {' - '}
                        {selectedCandidateDetail?.interview_date?.substring(0, 10) || new Date().toISOString().substring(0, 10)}
                      </p>
                    </div>
                    <div className="total-score">
                      {selectedCandidateDetail?.total_score || analysisResult?.total_score}
                      <span>/50</span>
                    </div>
                  </div>

                  <div className="result-section">
                    <div className="result-label">Övergripande bedömning</div>
                    <p>{(selectedCandidateDetail?.analysis || analysisResult?.analysis)?.overall_assessment}</p>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => downloadReport(selectedCandidateDetail?.id || currentCandidate?.id)}
                  >
                    Ladda ner Word-rapport
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={resetForNewCandidate}
                  >
                    Ny kandidat
                  </button>
                </div>

                <h3 style={{ margin: '1.5rem 0 1rem' }}>Frågor och bedömning</h3>
                {(selectedCandidateDetail?.analysis || analysisResult?.analysis)?.questions?.map((q, i) => (
                  <div key={i} className="question-result">
                    <div className="question-result-header">
                      <div>
                        <div className="question-category">Fråga {i + 1}</div>
                        <div className="question-text">{q.question}</div>
                      </div>
                      <div className={`question-score ${q.score >= 4 ? 'score-high' : q.score >= 3 ? 'score-medium' : 'score-low'}`}
                           style={{ color: q.score >= 4 ? '#065f46' : q.score >= 3 ? '#92400e' : '#991b1b' }}>
                        {q.score}/5
                      </div>
                    </div>
                    <div className="result-section">
                      <div className="result-label">Sammanfattning</div>
                      <p>{q.summary}</p>
                    </div>
                    <div className="result-section">
                      <div className="result-label">Bedömning</div>
                      <p>{q.assessment}</p>
                    </div>
                    {q.quote && (
                      <div className="quote">"{q.quote}"</div>
                    )}
                  </div>
                ))}

                <div className="card">
                  <h3 className="card-title">Sammanfattad transkription</h3>
                  <p>{(selectedCandidateDetail?.analysis || analysisResult?.analysis)?.summarized_transcript}</p>
                </div>
              </>
            )}

            {!analysisResult && !selectedCandidateDetail && (
              <div className="card">
                <p style={{ textAlign: 'center', color: '#64748b' }}>
                  Ingen analys att visa. Genomför en intervju först eller välj en kandidat under "Jämför".
                </p>
              </div>
            )}
          </>
        )}

        {/* TAB 4: JÄMFÖR */}
        {activeTab === 'compare' && !loading && (
          <div className="card">
            <h2 className="card-title">Alla kandidater</h2>
            {candidates.length === 0 ? (
              <p style={{ color: '#64748b' }}>Inga kandidater ännu. Genomför en intervju först.</p>
            ) : (
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>Namn</th>
                    <th>Roll</th>
                    <th>Poäng</th>
                    <th>Datum</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.filter(c => c.name).map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.role_name}</td>
                      <td>
                        <span className={`score-badge ${getScoreClass(c.total_score)}`}>
                          {c.total_score}/50
                        </span>
                      </td>
                      <td>{c.interview_date?.substring(0, 10) || '-'}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => viewCandidateDetail(c.id)}
                        >
                          Visa
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginLeft: '0.5rem' }}
                          onClick={() => downloadReport(c.id)}
                        >
                          Rapport
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
