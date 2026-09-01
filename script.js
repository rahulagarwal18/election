/**
 * Royal Campaign Engine - Rupesh Bharadwaj (Ward 5, Beawar)
 * Includes:
 * 1. Supabase Cloud Database Integration for Grievances & Supporters
 * 2. "Jeetenge" (Mission Raniganj - B Praak) 50% Volume Song Player
 * 3. 09 September 2026 Election Countdown Timer
 * 4. Input Sanitization & Anti-XSS Form Handlers
 * 5. Instant Autoplay on Load & First Interaction
 * 6. Confetti Cannon
 */

/* =========================================================================
   0. SECURE SERVERLESS CLOUD SYNC (ZERO KEYS IN FRONTEND)
   ========================================================================= */

// Defensive HTML / Input Sanitizer
function sanitizeInput(str, maxLen = 200) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .slice(0, maxLen);
}

function initSupabase() {
  // Serverless API backend handles cloud sync securely via process.env
  console.log('🛡️ Secure serverless backend routing initialized.');
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  }

  initSupabase();
  initElectionCountdown();
  initSupporterCounter();
  initAudioPlayer();
});

/* =========================================================================
   1. ELECTION COUNTDOWN TIMER (09 SEPTEMBER 2026)
   ========================================================================= */

function initElectionCountdown() {
  const electionDate = new Date('September 9, 2026 08:00:00 GMT+05:30').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = electionDate - now;

    if (distance < 0) {
      document.getElementById('timerDays').textContent = '00';
      document.getElementById('timerHours').textContent = '00';
      document.getElementById('timerMins').textContent = '00';
      document.getElementById('timerSecs').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('timerDays');
    const hEl = document.getElementById('timerHours');
    const mEl = document.getElementById('timerMins');
    const sEl = document.getElementById('timerSecs');

    if (dEl) dEl.textContent = days < 10 ? '0' + days : days;
    if (hEl) hEl.textContent = hours < 10 ? '0' + hours : hours;
    if (mEl) mEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    if (sEl) sEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* =========================================================================
   2. ORIGINAL "JEETENGE" VOCAL SONG PLAYER (SET TO 50% VOLUME)
   ========================================================================= */

let isPlaying = false;
let userManuallyPaused = false;
const audioEl = document.getElementById('campaignAudioElement');

function initAudioPlayer() {
  if (!audioEl) return;
  audioEl.volume = 0.50; // 50% Volume

  const triggerEvents = ['scroll', 'touchmove', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'wheel', 'keydown', 'click'];

  function cleanupAutoplayListeners() {
    triggerEvents.forEach(evt => {
      window.removeEventListener(evt, attemptAutoplay, { passive: true });
      document.removeEventListener(evt, attemptAutoplay, { passive: true });
      document.body.removeEventListener(evt, attemptAutoplay, { passive: true });
    });
  }

  function attemptAutoplay(e) {
    if (userManuallyPaused) {
      cleanupAutoplayListeners();
      return;
    }

    if (audioEl && audioEl.paused && !isPlaying) {
      audioEl.volume = 0.50;
      const p = audioEl.play();
      if (p !== undefined) {
        p.then(() => {
          isPlaying = true;
          updateAudioUI(true);
          cleanupAutoplayListeners();
        }).catch(() => {
          // Retry on next user gesture
        });
      }
    }
  }

  // 1. Initial attempt
  attemptAutoplay();

  // 2. Gesture listeners for unlocking autoplay
  triggerEvents.forEach(evt => {
    window.addEventListener(evt, attemptAutoplay, { passive: true });
    document.addEventListener(evt, attemptAutoplay, { passive: true });
    document.body.addEventListener(evt, attemptAutoplay, { passive: true });
  });

  audioEl.addEventListener('play', () => {
    isPlaying = true;
    updateAudioUI(true);
  });
  
  audioEl.addEventListener('pause', () => {
    isPlaying = false;
    updateAudioUI(false);
  });
}

function toggleAudioPlayback(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  if (!audioEl) return;
  
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  if (!audioEl) return;
  userManuallyPaused = false;
  audioEl.volume = 0.50; // 50% Volume
  
  const playPromise = audioEl.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isPlaying = true;
      updateAudioUI(true);
    }).catch(err => {
      console.log('Playback error:', err);
      isPlaying = false;
      updateAudioUI(false);
    });
  }
}

function pauseAudio() {
  if (!audioEl) return;
  userManuallyPaused = true;
  audioEl.pause();
  isPlaying = false;
  updateAudioUI(false);
}

function updateAudioUI(playing) {
  isPlaying = playing;
  const eq = document.getElementById('equalizerVisualizer');
  if (eq) {
    if (playing) eq.classList.add('eq-active');
    else eq.classList.remove('eq-active');
  }

  const floatingPlayIcon = document.getElementById('floatingPlayIcon');
  if (floatingPlayIcon) {
    floatingPlayIcon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* =========================================================================
   3. SECURE FORM RESPONSE STORAGE (SANITIZED)
   ========================================================================= */

function getStoredGrievances() {
  const data = localStorage.getItem('beawar_w5_grievances');
  return data ? JSON.parse(data) : [];
}

function getStoredSupporters() {
  const data = localStorage.getItem('beawar_w5_supporters_list');
  return data ? JSON.parse(data) : [];
}

// 1. Handle Citizen Grievance Submission (Validated & Sanitized)
function handleGrievanceSubmit(e) {
  e.preventDefault();
  
  const rawName = document.getElementById('gName').value;
  const rawPhone = document.getElementById('gPhone').value;
  const rawArea = document.getElementById('gArea').value;
  const rawType = document.getElementById('gType').value;
  const rawDetail = document.getElementById('gDetail').value;

  const name = sanitizeInput(rawName, 50);
  const phone = sanitizeInput(rawPhone, 15).replace(/[^0-9+]/g, '');
  const area = sanitizeInput(rawArea, 80);
  const type = sanitizeInput(rawType, 50);
  const detail = sanitizeInput(rawDetail, 500);

  if (!name || !phone || !area || !detail) {
    alert('कृपया सभी आवश्यक विवरण सही से भरें।');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const newGrievance = { date: dateStr, name, phone, area, type, detail, status: 'लंबित' };
  
  // 1. Save locally for instant offline feedback
  const list = getStoredGrievances();
  list.unshift(newGrievance);
  localStorage.setItem('beawar_w5_grievances', JSON.stringify(list));

  // 2. Sync to Serverless Cloud API (reading process.env securely)
  fetch('/api/submit-grievance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      phone: phone,
      area: area,
      problem_type: type,
      detail: detail
    })
  }).then(res => res.json()).then(data => {
    console.log('✅ Grievance synced via secure serverless API:', data);
  }).catch(err => {
    console.warn('Backend API deferred (saved locally):', err);
  });

  const form = document.getElementById('grievanceForm');
  const alertBox = document.getElementById('grievanceSuccess');

  if (form && alertBox) {
    form.reset();
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 7000);
  }
}

// 2. Handle Supporter Pledge Submission (Validated & Sanitized)
function submitPledgeSupport() {
  const nameInput = document.getElementById('supporterNameInput');
  const areaInput = document.getElementById('supporterAreaInput');
  const successBox = document.getElementById('pledgeSuccessBox');
  const successText = document.getElementById('pledgeSuccessText');

  const rawName = nameInput ? nameInput.value : '';
  const rawArea = areaInput ? areaInput.value : '';

  const name = sanitizeInput(rawName, 50);
  const area = sanitizeInput(rawArea, 80);

  if (name) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Save locally
    const list = getStoredSupporters();
    list.unshift({ date: dateStr, name, area: area || 'वार्ड नं. 5' });
    localStorage.setItem('beawar_w5_supporters_list', JSON.stringify(list));

    // Sync to Serverless Cloud API (reading process.env securely)
    fetch('/api/submit-supporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        area: area || 'वार्ड नं. 5'
      })
    }).then(res => res.json()).then(data => {
      console.log('✅ Supporter synced via secure serverless API:', data);
    }).catch(err => {
      console.warn('Backend API deferred (saved locally):', err);
    });

    if (nameInput) nameInput.value = '';
    if (areaInput) areaInput.value = '';
  }

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#ea580c', '#fbbf24', '#16a34a', '#ffffff', '#dc2626']
    });
  }

  if (!isPlaying) {
    playAudio();
  }

  if (successBox) {
    successBox.classList.remove('hidden');
    if (name) {
      successText.textContent = `हार्दिक आभार ${name} जी${area ? ' (' + area + ')' : ''}! वार्ड नं. 5 के विकास में आपका साथ अनमोल है।`;
    }
  }

  incrementCounter();
}

/* =========================================================================
   4. SUPPORTER COUNTER
   ========================================================================= */

const BASE_COUNT = 1248;

function initSupporterCounter() {
  const count = localStorage.getItem('beawar_w5_count') || BASE_COUNT;
  updateCounterDisplay(count);
}

function incrementCounter() {
  let count = parseInt(localStorage.getItem('beawar_w5_count') || BASE_COUNT, 10);
  count += 1;
  localStorage.setItem('beawar_w5_count', count.toString());
  updateCounterDisplay(count);
}

function updateCounterDisplay(num) {
  const el = document.getElementById('heroSupporterCount');
  if (el) el.textContent = parseInt(num, 10).toLocaleString('en-IN');
}

function triggerPledgeSupport() {
  const section = document.getElementById('pledge-support');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    const nameInput = document.getElementById('supporterNameInput');
    if (nameInput) nameInput.focus();
  }
}
