/**
 * Todos os sons do jogo são gerados na hora com a Web Audio API. Nenhum arquivo de áudio.
 * O AudioContext só é criado no primeiro gesto do jogador (regra dos navegadores).
 */
export class ProceduralSoundSynthesizer {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.echoInputNode = null;
    this.isSoundEnabled = true;
  }

  get isReady() {
    return this.audioContext !== null;
  }

  startOnFirstUserGesture() {
    if (this.audioContext) {
      this.audioContext.resume();
      return;
    }
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }
    this.audioContext = new AudioContextConstructor();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = this.isSoundEnabled ? 0.8 : 0;
    this.masterGainNode.connect(this.audioContext.destination);
    this.createCaveEcho();
    this.startAmbientDrone();
  }

  /** Eco de caverna: um delay com realimentação e um filtro que tira os agudos a cada volta. */
  createCaveEcho() {
    const { audioContext } = this;
    const delayNode = audioContext.createDelay(1);
    delayNode.delayTime.value = 0.32;
    const feedbackGainNode = audioContext.createGain();
    feedbackGainNode.gain.value = 0.42;
    const darkeningFilterNode = audioContext.createBiquadFilter();
    darkeningFilterNode.type = "lowpass";
    darkeningFilterNode.frequency.value = 1800;

    delayNode.connect(darkeningFilterNode);
    darkeningFilterNode.connect(feedbackGainNode);
    feedbackGainNode.connect(delayNode);
    darkeningFilterNode.connect(this.masterGainNode);
    this.echoInputNode = delayNode;
  }

  startAmbientDrone() {
    const { audioContext } = this;
    const droneGainNode = audioContext.createGain();
    droneGainNode.gain.value = 0.05;
    droneGainNode.connect(this.masterGainNode);
    [48, 48.7, 72.3].forEach((frequencyInHertz) => {
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.type = "sine";
      oscillatorNode.frequency.value = frequencyInHertz;
      oscillatorNode.connect(droneGainNode);
      oscillatorNode.start();
    });

    const noiseSourceNode = audioContext.createBufferSource();
    noiseSourceNode.buffer = this.createNoiseBuffer(2);
    noiseSourceNode.loop = true;
    const waterFilterNode = audioContext.createBiquadFilter();
    waterFilterNode.type = "lowpass";
    waterFilterNode.frequency.value = 260;
    const waterGainNode = audioContext.createGain();
    waterGainNode.gain.value = 0.06;
    noiseSourceNode.connect(waterFilterNode);
    waterFilterNode.connect(waterGainNode);
    waterGainNode.connect(this.masterGainNode);
    noiseSourceNode.start();
  }

  createNoiseBuffer(durationInSeconds) {
    const { audioContext } = this;
    const noiseBuffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * durationInSeconds), audioContext.sampleRate);
    const channelSamples = noiseBuffer.getChannelData(0);
    for (let sampleIndex = 0; sampleIndex < channelSamples.length; sampleIndex += 1) {
      channelSamples[sampleIndex] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  toggleSound() {
    this.isSoundEnabled = !this.isSoundEnabled;
    if (this.masterGainNode) {
      this.masterGainNode.gain.setTargetAtTime(this.isSoundEnabled ? 0.8 : 0, this.audioContext.currentTime, 0.05);
    }
  }

  suspendWhileHidden(isPageHidden) {
    if (!this.audioContext) {
      return;
    }
    if (isPageHidden) {
      this.audioContext.suspend();
    } else {
      this.audioContext.resume();
    }
  }

  /** Um tom com envelope de ataque/queda e deslize de frequência. */
  playTone({ waveType, startFrequencyInHertz, endFrequencyInHertz, durationInSeconds, peakVolume, startDelayInSeconds = 0, sendToEcho = false }) {
    if (!this.audioContext) {
      return;
    }
    const { audioContext } = this;
    const startTime = audioContext.currentTime + startDelayInSeconds;
    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.type = waveType;
    oscillatorNode.frequency.setValueAtTime(startFrequencyInHertz, startTime);
    oscillatorNode.frequency.exponentialRampToValueAtTime(endFrequencyInHertz, startTime + durationInSeconds);

    const envelopeGainNode = audioContext.createGain();
    envelopeGainNode.gain.setValueAtTime(0.0001, startTime);
    envelopeGainNode.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.01);
    envelopeGainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationInSeconds);

    oscillatorNode.connect(envelopeGainNode);
    envelopeGainNode.connect(this.masterGainNode);
    if (sendToEcho) {
      envelopeGainNode.connect(this.echoInputNode);
    }
    oscillatorNode.start(startTime);
    oscillatorNode.stop(startTime + durationInSeconds + 0.05);
  }

  playFilteredNoise({ durationInSeconds, peakVolume, filterFrequencyInHertz }) {
    if (!this.audioContext) {
      return;
    }
    const { audioContext } = this;
    const startTime = audioContext.currentTime;
    const noiseSourceNode = audioContext.createBufferSource();
    noiseSourceNode.buffer = this.createNoiseBuffer(durationInSeconds);
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = filterFrequencyInHertz;
    const envelopeGainNode = audioContext.createGain();
    envelopeGainNode.gain.setValueAtTime(peakVolume, startTime);
    envelopeGainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationInSeconds);
    noiseSourceNode.connect(filterNode);
    filterNode.connect(envelopeGainNode);
    envelopeGainNode.connect(this.masterGainNode);
    noiseSourceNode.start(startTime);
  }
}
