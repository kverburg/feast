import React, { useState, useEffect } from 'react';
import { Recipe } from '../types/recipe';
import { voiceAssistant, VoiceCommand } from '../services/voiceAssistantService';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Timer, Users, Layers, CheckCircle2, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare } from 'lucide-react';

interface CookModeModalProps {
  recipe: Recipe;
  initialServings: number;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({
  recipe,
  initialServings,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [servings, setServings] = useState(initialServings || recipe.servings || 4);
  const [showIngredientsDrawer, setShowIngredientsDrawer] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Voice Assistant States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [lastCommandFeedback, setLastCommandFeedback] = useState<string>('');

  // Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const steps = recipe.instructions || [];
  const currentStep = steps[currentStepIndex];
  const scaleRatio = servings / (recipe.servings || 1);

  // Toggle current step speech playback ON / OFF
  const toggleCurrentStepSpeech = () => {
    if (isSpeaking || voiceAssistant.isSpeaking()) {
      voiceAssistant.stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!currentStep) return;
      const textToSpeak = `Step ${currentStep.stepNumber}. ${currentStep.text}`;
      setIsSpeaking(true);
      voiceAssistant.speak(textToSpeak, () => setIsSpeaking(false));
    }
  };

  // Auto-read on step change if auto-read enabled
  useEffect(() => {
    if (isAutoRead && currentStep && currentStepIndex > 0) {
      if (!currentStep) return;
      const textToSpeak = `Step ${currentStep.stepNumber}. ${currentStep.text}`;
      setIsSpeaking(true);
      voiceAssistant.speak(textToSpeak, () => setIsSpeaking(false));
    }
  }, [currentStepIndex]);

  // Clean up speech & voice on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.stopListening();
      voiceAssistant.stopSpeaking();
    };
  }, []);

  // Active timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
      voiceAssistant.speak('Timer finished!');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Reset timer when step changes
  useEffect(() => {
    if (currentStep?.timerMinutes) {
      setTimerSecondsLeft(currentStep.timerMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex]);

  // Voice Command Handler Callback
  const handleVoiceCommand = (cmd: VoiceCommand, phrase: string) => {
    setLastCommandFeedback(`Recognized: "${phrase}"`);
    setTimeout(() => setLastCommandFeedback(''), 3000);

    switch (cmd) {
      case 'next':
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
        break;
      case 'previous':
        if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
        }
        break;
      case 'repeat':
        toggleCurrentStepSpeech();
        break;
      case 'start_timer':
        setIsTimerRunning(true);
        voiceAssistant.speak('Timer started');
        break;
      case 'pause_timer':
        setIsTimerRunning(false);
        voiceAssistant.speak('Timer paused');
        break;
      case 'reset_timer':
        setIsTimerRunning(false);
        if (currentStep?.timerMinutes) {
          setTimerSecondsLeft(currentStep.timerMinutes * 60);
        }
        voiceAssistant.speak('Timer reset');
        break;
      case 'toggle_ingredients':
        setShowIngredientsDrawer(prev => !prev);
        break;
      case 'mark_complete':
        setCompletedSteps(prev => ({ ...prev, [currentStepIndex]: true }));
        voiceAssistant.speak('Step marked complete');
        break;
    }
  };

  const toggleVoiceAssistant = () => {
    if (isVoiceActive) {
      voiceAssistant.stopListening();
      setIsVoiceActive(false);
      setVoiceStatus('Voice Assistant Turned Off');
    } else {
      voiceAssistant.startListening(handleVoiceCommand, (status) => setVoiceStatus(status));
      setIsVoiceActive(true);
      voiceAssistant.speak('Voice assistant ready. Say next step, set timer, or repeat.');
    }
  };

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const formatTimerTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cook-mode-overlay">
      {/* Top Bar */}
      <div className="cook-mode-topbar">
        <div className="cook-mode-title-info">
          <span className="cook-mode-badge">COOK MODE</span>
          <h2 className="cook-mode-recipe-title">{recipe.title}</h2>
        </div>

        <div className="cook-mode-top-actions">
          {/* Hands-free Voice Toggle Button */}
          <button
            className={`btn btn-sm voice-toggle-btn ${isVoiceActive ? 'active' : ''}`}
            onClick={toggleVoiceAssistant}
            title={isVoiceActive ? 'Voice Assistant Active (Click to Turn Off)' : 'Turn On Hands-free Voice Assistant'}
          >
            {isVoiceActive ? <Mic size={18} className="mic-pulse" /> : <MicOff size={18} />}
            <span>{isVoiceActive ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {/* Read Step / Stop Speaking Toggle */}
          <button
            className={`btn btn-secondary btn-sm ${isSpeaking ? 'speaking active' : ''}`}
            onClick={toggleCurrentStepSpeech}
            title={isSpeaking ? 'Stop Speaking' : 'Read Current Step Aloud'}
          >
            {isSpeaking ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} />}
            <span>{isSpeaking ? 'Stop' : 'Read Step'}</span>
          </button>

          {/* Servings Scaler */}
          <div className="cook-mode-scaler">
            <Users size={16} color="var(--accent-primary)" />
            <button className="cook-scale-btn" onClick={() => setServings(Math.max(1, servings - 1))}>-</button>
            <span className="cook-scale-val">{servings} portions</span>
            <button className="cook-scale-btn" onClick={() => setServings(servings + 1)}>+</button>
          </div>

          <button
            className={`btn btn-secondary btn-sm ${showIngredientsDrawer ? 'active' : ''}`}
            onClick={() => setShowIngredientsDrawer(!showIngredientsDrawer)}
          >
            <Layers size={16} />
            <span>{showIngredientsDrawer ? 'Hide Ingredients' : 'View Ingredients'}</span>
          </button>

          <button className="btn btn-secondary btn-icon" onClick={onClose} title="Exit Cook Mode">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Voice Assistant Live Status Bar */}
      {isVoiceActive && (
        <div className="voice-status-bar">
          <div className="voice-indicator">
            <span className="mic-wave"></span>
            <span>Listening for commands: <strong>"Next Step"</strong>, <strong>"Set Timer"</strong>, <strong>"Repeat"</strong>, <strong>"Mark Complete"</strong></span>
          </div>

          <div className="voice-controls-right">
            {/* Natural Voice Selector */}
            <div className="voice-selector-box">
              <span className="voice-label">Voice:</span>
              <select
                className="voice-select"
                onChange={(e) => voiceAssistant.setCustomVoice(e.target.value)}
                defaultValue=""
              >
                <option value="">{voiceAssistant.getSelectedVoiceName()}</option>
                {voiceAssistant.getNaturalVoices().map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {lastCommandFeedback && (
              <div className="voice-feedback-badge">
                <Sparkles size={14} />
                <span>{lastCommandFeedback}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Screen Layout */}
      <div className="cook-mode-body">
        {/* Ingredients Drawer (Collapsible) */}
        {showIngredientsDrawer && (
          <div className="cook-ingredients-drawer card">
            <div className="drawer-header">
              <h3><Layers size={18} color="var(--accent-primary)" /> Ingredients Reference</h3>
              <span className="badge">{servings} Portions</span>
            </div>

            <div className="drawer-sections">
              {recipe.ingredientSections?.map((sec) => (
                <div key={sec.id} className="drawer-sec">
                  <h4 className="drawer-sec-title">{sec.title}</h4>
                  <ul className="drawer-ing-list">
                    {sec.items.map((item) => {
                      const scaledAmt = (item.amount || 0) * scaleRatio;
                      return (
                        <li key={item.id} className="drawer-ing-item">
                          <span className="drawer-ing-amt">
                            {parseFloat(scaledAmt.toFixed(2))} {item.unit}
                          </span>
                          <span>{item.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Spotlight */}
        <div className="cook-step-spotlight">
          {currentStep ? (
            <div className="step-card-active card">
              <div className="step-top-row">
                <span className="step-giant-number">Step {currentStep.stepNumber} of {steps.length}</span>
                
                <div className="step-actions-group">
                  <button
                    className={`btn btn-outline btn-sm speak-step-btn ${isSpeaking ? 'active' : ''}`}
                    onClick={toggleCurrentStepSpeech}
                    title={isSpeaking ? 'Stop Speaking' : 'Speak Step Aloud'}
                  >
                    {isSpeaking ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} />}
                    <span>{isSpeaking ? 'Stop' : 'Speak'}</span>
                  </button>

                  <button
                    className={`step-check-btn ${completedSteps[currentStepIndex] ? 'done' : ''}`}
                    onClick={() => toggleStepCompleted(currentStepIndex)}
                  >
                    <CheckCircle2 size={22} />
                    <span>{completedSteps[currentStepIndex] ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>
              </div>

              <div className="step-main-text">
                <p>{currentStep.text}</p>
              </div>

              {/* Timer Block */}
              {timerSecondsLeft !== null && (
                <div className="cook-timer-box card">
                  <div className="timer-display">
                    <Timer size={28} color="var(--accent-primary)" />
                    <span className="timer-clock">{formatTimerTime(timerSecondsLeft)}</span>
                  </div>

                  <div className="timer-controls">
                    {!isTimerRunning ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setIsTimerRunning(true)}>
                        <Play size={16} fill="#ffffff" /> Start Timer
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => setIsTimerRunning(false)}>
                        <Pause size={16} /> Pause
                      </button>
                    )}

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft((currentStep.timerMinutes || 5) * 60);
                      }}
                    >
                      <RotateCcw size={16} /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="step-card-active card">
              <h2>You're all done! Bon Appétit! 🍕</h2>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="cook-step-nav">
            <button
              className="btn btn-secondary btn-nav-step"
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
            >
              <ChevronLeft size={22} />
              <span>Previous Step</span>
            </button>

            <div className="step-dots">
              {steps.map((s, idx) => (
                <span
                  key={s.id}
                  className={`dot ${idx === currentStepIndex ? 'active' : ''} ${completedSteps[idx] ? 'completed' : ''}`}
                  onClick={() => setCurrentStepIndex(idx)}
                />
              ))}
            </div>

            <button
              className="btn btn-primary btn-nav-step"
              disabled={currentStepIndex >= steps.length - 1}
              onClick={handleNextStep}
            >
              <span>Next Step</span>
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cook-mode-overlay {
          position: fixed;
          inset: 0;
          background: #090a0f;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          color: #f3f4f6;
          animation: fadeIn 0.25s ease;
        }
        .cook-mode-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.5rem;
          background: #12151e;
          border-bottom: 1px solid #232838;
        }
        .cook-mode-title-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .cook-mode-badge {
          background: var(--accent-gradient);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }
        .cook-mode-recipe-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .cook-mode-top-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .voice-toggle-btn {
          background: #1a1e2b;
          border: 1px solid #2e3548;
          color: #9ca3af;
        }
        .voice-toggle-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px var(--accent-glow);
        }
        .mic-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .voice-status-bar {
          background: #181d2c;
          border-bottom: 1px solid #2e3548;
          padding: 0.45rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--accent-primary);
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .voice-controls-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .voice-selector-box {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .voice-label {
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.78rem;
        }
        .voice-select {
          background: #12151e;
          border: 1px solid #2e3548;
          color: #ffffff;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.78rem;
          outline: none;
          cursor: pointer;
          max-width: 200px;
        }
        .voice-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mic-wave {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .voice-feedback-badge {
          background: var(--badge-bg);
          color: var(--accent-primary);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }
        .cook-mode-scaler {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1a1e2b;
          border: 1px solid #2e3548;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
        }
        .cook-scale-btn {
          width: 24px;
          height: 24px;
          background: #282f42;
          border: none;
          color: #ffffff;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
        }
        .cook-scale-val {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .cook-mode-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .cook-ingredients-drawer {
          width: 320px;
          background: #141722;
          border-right: 1px solid #232838;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-radius: 0;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-sections {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .drawer-sec-title {
          font-size: 0.92rem;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }
        .drawer-ing-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.88rem;
        }
        .drawer-ing-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          background: #1c202e;
          border-radius: 6px;
        }
        .drawer-ing-amt {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .cook-step-spotlight {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .step-card-active {
          padding: 2.5rem;
          background: #141722;
          border: 1px solid #282f42;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .step-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .step-giant-number {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step-actions-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .step-check-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1d2232;
          border: 1px solid #2e3548;
          color: #9ca3af;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.85rem;
        }
        .step-check-btn.done {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: #10b981;
        }
        .step-main-text p {
          font-size: 1.5rem;
          line-height: 1.6;
          font-weight: 500;
          color: #f3f4f6;
        }
        .cook-timer-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #1c202e;
          border: 1px solid #2e3548;
        }
        .timer-display {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .timer-clock {
          font-family: monospace;
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        .timer-controls {
          display: flex;
          gap: 0.5rem;
        }
        .cook-step-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
        }
        .btn-nav-step {
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
        }
        .step-dots {
          display: flex;
          gap: 0.5rem;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          background: #282f42;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dot.active {
          background: var(--accent-primary);
          transform: scale(1.3);
        }
        .dot.completed {
          background: #10b981;
        }
      `}</style>
    </div>
  );
};
