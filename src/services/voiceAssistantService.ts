// Natural Cooking Voice Assistant (Speech Synthesis & Voice Commands)

export type VoiceCommand =
  | 'next'
  | 'previous'
  | 'repeat'
  | 'start_timer'
  | 'pause_timer'
  | 'reset_timer'
  | 'toggle_ingredients'
  | 'mark_complete';

export class VoiceAssistantService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onCommandCallback: ((cmd: VoiceCommand, rawPhrase: string) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;
  
  private selectedVoiceURI: string | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.initVoices();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      // Continuous mode keeps single microphone stream open cleanly without blinking mic icon
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.toLowerCase().trim();

        if (this.onStatusCallback) {
          this.onStatusCallback(`Heard: "${transcript}"`);
        }

        this.parseCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          if (this.onStatusCallback) {
            this.onStatusCallback('Microphone access denied');
          }
        }
      };

      this.recognition.onend = () => {
        // Do NOT auto-restart in onend to eliminate rapid mic blinking loop!
        if (this.onStatusCallback && this.isListening) {
          this.onStatusCallback('Voice assistant ready');
        }
      };
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }

  public getNaturalVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  }

  public setCustomVoice(voiceURI: string) {
    this.selectedVoiceURI = voiceURI;
  }

  public getSelectedVoiceName(): string {
    const voices = this.getNaturalVoices();
    if (this.selectedVoiceURI) {
      const found = voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (found) return found.name;
    }
    return 'Default System Voice';
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  public startListening(
    onCommand: (cmd: VoiceCommand, rawPhrase: string) => void,
    onStatus?: (status: string) => void
  ) {
    if (!this.recognition) {
      if (onStatus) onStatus('Voice recognition not supported in this browser');
      return;
    }
    this.onCommandCallback = onCommand;
    this.onStatusCallback = onStatus || null;
    this.isListening = true;

    try {
      this.recognition.start();
      if (this.onStatusCallback) this.onStatusCallback('Listening for voice commands...');
    } catch (e) {
      console.warn('Recognition already active');
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.onStatusCallback) this.onStatusCallback('Voice assistant paused');
  }

  private parseCommand(phrase: string) {
    if (!this.onCommandCallback) return;

    if (phrase.includes('next') || phrase.includes('forward')) {
      this.onCommandCallback('next', phrase);
    } else if (phrase.includes('previous') || phrase.includes('back')) {
      this.onCommandCallback('previous', phrase);
    } else if (phrase.includes('repeat') || phrase.includes('read step') || phrase.includes('read step aloud') || phrase.includes('say step') || phrase.includes('speak')) {
      this.onCommandCallback('repeat', phrase);
    } else if (phrase.includes('start timer') || phrase.includes('set timer') || phrase.includes('run timer') || phrase.includes('timer start')) {
      this.onCommandCallback('start_timer', phrase);
    } else if (phrase.includes('pause timer') || phrase.includes('stop timer')) {
      this.onCommandCallback('pause_timer', phrase);
    } else if (phrase.includes('reset timer') || phrase.includes('restart timer')) {
      this.onCommandCallback('reset_timer', phrase);
    } else if (phrase.includes('ingredient') || phrase.includes('ingredients') || phrase.includes('show ingredient') || phrase.includes('view ingredient')) {
      this.onCommandCallback('toggle_ingredients', phrase);
    } else if (phrase.includes('complete') || phrase.includes('mark complete') || phrase.includes('done') || phrase.includes('finished')) {
      this.onCommandCallback('mark_complete', phrase);
    }
  }

  // Pre-process text for humanized culinary speech output
  private humanizeCulinaryText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\b(\d+)\s*g\b/gi, '$1 grams')
      .replace(/\b(\d+)\s*ml\b/gi, '$1 milliliters')
      .replace(/\b(\d+)\s*kg\b/gi, '$1 kilograms')
      .replace(/\b(\d+)\s*l\b/gi, '$1 liters')
      .replace(/\b(\d+)\s*tsp\b/gi, '$1 teaspoons')
      .replace(/\b(\d+)\s*tbsp\b/gi, '$1 tablespoons')
      .replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes')
      .replace(/°C/g, ' degrees Celsius')
      .replace(/°F/g, ' degrees Fahrenheit')
      .replace(/[\/\\]/g, ' or ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Direct Speech Output (100% Decoupled from Microphone)
  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const humanText = this.humanizeCulinaryText(text);
    if (!humanText) return;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (this.selectedVoiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const found = voices.find(v => v.voiceURI === this.selectedVoiceURI);
        if (found) {
          utterance.voice = found;
        }
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = (err) => {
          console.warn('Speech utterance error:', err);
          onEnd();
        };
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis failed:', err);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
