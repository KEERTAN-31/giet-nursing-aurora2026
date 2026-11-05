/**
 * AURORA 2026 - Freshers' Party Interactive Web Application
 * School of Nursing, GIET University Gunupur
 * Theme: Medical Teal & Nursing Heartbeat Aesthetic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentStep: 1,
    name: '',
    rollNo: '',
    meal: '',
    soundEnabled: true
  };

  // Sound Synthesizer via Web Audio API (Medical Heartbeat & Chimes)
  const audioCtx = (function () {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return AudioContext ? new AudioContext() : null;
  })();

  function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play suppressed:', e);
    }
  }

  // Heartbeat pulse sound effect (Lub-Dub)
  function playHeartbeatSound() {
    playTone(120, 0.08, 'sine', 0.22);
    setTimeout(() => {
      playTone(95, 0.12, 'sine', 0.25);
    }, 140);
  }

  function playClickSound() {
    playTone(620, 0.06, 'triangle', 0.12);
  }

  function playNextSound() {
    playHeartbeatSound();
  }

  function playFanfareSound() {
    if (!state.soundEnabled || !audioCtx) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.35, 'triangle', 0.15);
      }, idx * 100);
    });
  }

  // DOM Elements
  const stepElements = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
  };

  const progressSegments = document.querySelectorAll('.progress-segment');

  // Page 1 Elements
  const btnStart = document.getElementById('btn-start');

  // Page 2 Elements
  const inputName = document.getElementById('junior-name');
  const btnContinueName = document.getElementById('btn-continue-name');
  const errorName = document.getElementById('error-name');

  // Page 3 Elements
  const inputRoll = document.getElementById('junior-roll');
  const btnContinueRoll = document.getElementById('btn-continue-roll');
  const btnBackRoll = document.getElementById('btn-back-roll');
  const errorRoll = document.getElementById('error-roll');

  // Page 4 Elements
  const cardVeg = document.getElementById('food-card-veg');
  const cardNonVeg = document.getElementById('food-card-nonveg');
  const btnContinueFood = document.getElementById('btn-continue-food');
  const btnBackFood = document.getElementById('btn-back-food');
  const errorFood = document.getElementById('error-food');

  // Page 5 Elements
  const passAttendeeName = document.getElementById('pass-attendee-name');
  const passRollNo = document.getElementById('pass-roll-no');
  const passMealBadge = document.getElementById('pass-meal-badge');
  const btnDownloadPass = document.getElementById('btn-download-pass');
  const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
  const btnRegisterAnother = document.getElementById('btn-register-another');
  const posterFrame = document.getElementById('poster-frame');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');

  // Step Navigation Engine
  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 5) return;
    
    // Hide all steps
    Object.keys(stepElements).forEach(key => {
      if (stepElements[key]) {
        stepElements[key].classList.remove('current');
      }
    });

    // Show target step
    state.currentStep = stepNumber;
    if (stepElements[stepNumber]) {
      stepElements[stepNumber].classList.add('current');
    }

    // Update Progress Bar
    progressSegments.forEach((segment, idx) => {
      if (idx < stepNumber) {
        segment.classList.add('active');
      } else {
        segment.classList.remove('active');
      }
    });

    // Step-specific activations
    if (stepNumber === 2) {
      setTimeout(() => inputName.focus(), 200);
    } else if (stepNumber === 3) {
      setTimeout(() => inputRoll.focus(), 200);
    } else if (stepNumber === 5) {
      onArrivalAtFinale();
    }
  }

  // Handle Finale Reveal
  function onArrivalAtFinale() {
    // Populate Personalized Pass
    passAttendeeName.textContent = state.name;
    passRollNo.textContent = state.rollNo.toUpperCase();

    if (state.meal === 'Veg') {
      passMealBadge.className = 'pass-diet-pill veg';
      passMealBadge.innerHTML = '🟢 Pure Veg Meal';
    } else {
      passMealBadge.className = 'pass-diet-pill nonveg';
      passMealBadge.innerHTML = '🍗 Non-Veg Feast';
    }

    // Save Attendee to Local Storage for Organizer Tracking
    saveAttendeeRecord({
      name: state.name,
      rollNo: state.rollNo.toUpperCase(),
      meal: state.meal,
      registeredAt: new Date().toLocaleString()
    });

    // Sound and Confetti!
    playFanfareSound();
    if (typeof window.triggerConfetti === 'function') {
      window.triggerConfetti();
    }
  }

  // Storage Helper
  function saveAttendeeRecord(record) {
    try {
      const existing = JSON.parse(localStorage.getItem('aurora_freshers_guests') || '[]');
      const existingIndex = existing.findIndex(item => item.rollNo === record.rollNo);
      if (existingIndex >= 0) {
        existing[existingIndex] = record;
      } else {
        existing.push(record);
      }
      localStorage.setItem('aurora_freshers_guests', JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Event Listeners: Step 1 (Start)
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      playHeartbeatSound();
      goToStep(2);
    });
  }

  // Event Listeners: Step 2 (Name)
  function validateName() {
    const val = inputName.value.trim();
    if (!val) {
      errorName.style.display = 'block';
      inputName.classList.add('error');
      return false;
    }
    errorName.style.display = 'none';
    inputName.classList.remove('error');
    state.name = val;
    return true;
  }

  if (inputName) {
    inputName.addEventListener('input', () => {
      if (inputName.value.trim()) {
        errorName.style.display = 'none';
        inputName.classList.remove('error');
      }
    });

    inputName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnContinueName.click();
      }
    });
  }

  if (btnContinueName) {
    btnContinueName.addEventListener('click', () => {
      if (validateName()) {
        playNextSound();
        goToStep(3);
      } else {
        playTone(280, 0.15, 'sawtooth', 0.15);
      }
    });
  }

  // Event Listeners: Step 3 (Roll Number)
  function validateRoll() {
    const val = inputRoll.value.trim();
    if (!val) {
      errorRoll.style.display = 'block';
      inputRoll.classList.add('error');
      return false;
    }
    errorRoll.style.display = 'none';
    inputRoll.classList.remove('error');
    state.rollNo = val;
    return true;
  }

  if (inputRoll) {
    inputRoll.addEventListener('input', () => {
      if (inputRoll.value.trim()) {
        errorRoll.style.display = 'none';
        inputRoll.classList.remove('error');
      }
    });

    inputRoll.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnContinueRoll.click();
      }
    });
  }

  if (btnContinueRoll) {
    btnContinueRoll.addEventListener('click', () => {
      if (validateRoll()) {
        playNextSound();
        goToStep(4);
      } else {
        playTone(280, 0.15, 'sawtooth', 0.15);
      }
    });
  }

  if (btnBackRoll) {
    btnBackRoll.addEventListener('click', () => {
      playClickSound();
      goToStep(2);
    });
  }

  // Event Listeners: Step 4 (Veg / Non-Veg)
  function selectMeal(choice) {
    state.meal = choice;
    playClickSound();
    errorFood.style.display = 'none';

    if (choice === 'Veg') {
      cardVeg.classList.add('selected-veg');
      cardNonVeg.classList.remove('selected-nonveg');
    } else {
      cardNonVeg.classList.add('selected-nonveg');
      cardVeg.classList.remove('selected-veg');
    }

    btnContinueFood.removeAttribute('disabled');
  }

  if (cardVeg) {
    cardVeg.addEventListener('click', () => selectMeal('Veg'));
  }

  if (cardNonVeg) {
    cardNonVeg.addEventListener('click', () => selectMeal('Non-Veg'));
  }

  if (btnContinueFood) {
    btnContinueFood.addEventListener('click', () => {
      if (!state.meal) {
        errorFood.style.display = 'block';
        playTone(280, 0.15, 'sawtooth', 0.15);
        return;
      }
      playHeartbeatSound();
      goToStep(5);
    });
  }

  if (btnBackFood) {
    btnBackFood.addEventListener('click', () => {
      playClickSound();
      goToStep(3);
    });
  }

  // Event Listeners: Step 5 (Finale Actions)
  if (btnDownloadPass) {
    btnDownloadPass.addEventListener('click', () => {
      generateTicketDownload(state.name, state.rollNo, state.meal);
    });
  }

  if (btnShareWhatsapp) {
    btnShareWhatsapp.addEventListener('click', () => {
      const shareText = `👩‍⚕️ *SCHOOL OF NURSING • GIET UNIVERSITY* 🩺\n*FRESHERS' PARTY 2026 - AURORA*\n\nHey buddy! I just claimed my official VIP pass!\n👤 Name: ${state.name}\n🔢 Roll No: ${state.rollNo}\n🍽️ Meal: ${state.meal}\n\n📅 *Date:* 6th Nov 2026, 10:00 AM\n📍 *Venue:* Mechanical Auditorium\n\nBe There...! ✨`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    });
  }

  if (btnRegisterAnother) {
    btnRegisterAnother.addEventListener('click', () => {
      playClickSound();
      state.name = '';
      state.rollNo = '';
      state.meal = '';
      inputName.value = '';
      inputRoll.value = '';
      cardVeg.classList.remove('selected-veg');
      cardNonVeg.classList.remove('selected-nonveg');
      btnContinueFood.setAttribute('disabled', 'true');
      goToStep(1);
    });
  }

  if (posterFrame && lightboxModal) {
    posterFrame.addEventListener('click', () => {
      lightboxModal.classList.add('open');
    });

    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
      }
    });
  }

  // VIP Ticket Canvas Rendering Engine (Medical Teal & Nursing VIP Aesthetic)
  function generateTicketDownload(name, rollNo, meal) {
    const canvas = document.createElement('canvas');
    canvas.width = 820;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    // Deep Hospital Slate & Teal Background
    const bgGrad = ctx.createLinearGradient(0, 0, 820, 420);
    bgGrad.addColorStop(0, '#041624');
    bgGrad.addColorStop(1, '#082f42');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 820, 420);

    // Medical Cyan Frame
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 788, 388);

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, 776, 376);

    // Decorative Ticket Stub Dashed Line
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 2;
    ctx.moveTo(580, 20);
    ctx.lineTo(580, 400);
    ctx.stroke();
    ctx.setLineDash([]);

    // Header: GIET University School of Nursing
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 15px sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('GIET UNIVERSITY GUNUPUR • SCHOOL OF NURSING 🩺', 50, 58);

    // Title: FRESHERS\' PARTY AURORA 2026
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText("Freshers' Party AURORA 2026", 50, 102);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText("Official Nursing VIP Entry Pass", 50, 130);

    // Junior Name Field
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('NURSING JUNIOR / GUEST:', 50, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(name.toUpperCase(), 50, 212);

    // Roll No & Meal Fields
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ROLL NUMBER:', 50, 264);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(rollNo.toUpperCase(), 50, 290);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('MEAL PREFERENCE:', 260, 264);

    ctx.fillStyle = meal === 'Veg' ? '#10b981' : '#f43f5e';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(meal.toUpperCase(), 260, 290);

    // Event Info Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('📅 Date: 6/11/2026 (10:00 AM)  |  📍 Venue: Mechanical Auditorium', 50, 360);

    // Ticket Stub Right Section (Medical Cross & Pass Code)
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('AURORA', 700, 105);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('2026', 700, 128);

    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fillRect(610, 160, 180, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('PASS CODE:', 700, 215);
    ctx.font = 'bold 16px monospace';
    ctx.fillText('NURSE-' + Math.floor(1000 + Math.random() * 9000), 700, 245);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'italic 13px Georgia, serif';
    ctx.fillText('Be There...!', 700, 355);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Nursing_Freshers_Pass_${name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Floating Ambient Nursing Particles (🩺, 💊, ➕, 💓, ✨)
  function initAmbientNursingParticles() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const ICONS = ['🩺', '💊', '➕', '🩹', '💓', '✨', '👩‍⚕️'];
    const particles = [];
    const count = Math.min(width > 600 ? 28 : 16, 28);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        fontSize: Math.random() * 10 + 14,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.4,
        alpha: Math.random() * 0.45 + 0.15,
        alphaSpeed: (Math.random() - 0.5) * 0.012
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.65 || p.alpha < 0.12) p.alphaSpeed = -p.alphaSpeed;
        if (p.y < -30) {
          p.y = height + 30;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = `${p.fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.icon, p.x, p.y);
        ctx.restore();
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientNursingParticles();
  });

})();
