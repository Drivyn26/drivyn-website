/* ════════════════════════════════════════
   THREE.JS — PARTICLE NETWORK BACKGROUND
════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 80);

  /* ── PARTICLES ── */
  const PARTICLE_COUNT = 120;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 120;
    const z = (Math.random() - 0.5) * 60;
    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    velocities.push({
      x: (Math.random() - 0.5) * 0.04,
      y: (Math.random() - 0.5) * 0.04,
      z: (Math.random() - 0.5) * 0.02
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x7c3aed,
    size: 0.55,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ── CONNECTION LINES ── */
  const MAX_CONNECTIONS = 200;
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const lineMat = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.1 })
  );
  scene.add(lineMat);

  /* ── FLOATING GEOMETRY SHAPES ── */
  const shapes = [];
  const shapeGeos = [
    new THREE.IcosahedronGeometry(4, 0),
    new THREE.OctahedronGeometry(3, 0),
    new THREE.TetrahedronGeometry(3, 0),
    new THREE.IcosahedronGeometry(2.5, 0),
  ];
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.14 });

  const shapePositions = [
    [-45, 30, -20], [50, -20, -30], [-60, -35, -10], [40, 40, -25]
  ];

  shapeGeos.forEach((g, i) => {
    const mesh = new THREE.Mesh(g, wireMat.clone());
    mesh.position.set(...shapePositions[i]);
    mesh.userData = { rotX: Math.random() * 0.003, rotY: Math.random() * 0.005, rotZ: Math.random() * 0.002 };
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* ── SCROLL + MOUSE PARALLAX ── */
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ── ANIMATE ── */
  const pos = geo.attributes.position;
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    // move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos.array[i * 3]     += velocities[i].x;
      pos.array[i * 3 + 1] += velocities[i].y;
      pos.array[i * 3 + 2] += velocities[i].z;

      // wrap bounds
      if (pos.array[i * 3] > 80)  pos.array[i * 3] = -80;
      if (pos.array[i * 3] < -80) pos.array[i * 3] = 80;
      if (pos.array[i * 3 + 1] > 60)  pos.array[i * 3 + 1] = -60;
      if (pos.array[i * 3 + 1] < -60) pos.array[i * 3 + 1] = 60;
    }
    pos.needsUpdate = true;

    // draw connection lines
    if (frame % 2 === 0) {
      let connCount = 0;
      const lp = lineGeo.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT && connCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && connCount < MAX_CONNECTIONS; j++) {
          const dx = pos.array[i*3] - pos.array[j*3];
          const dy = pos.array[i*3+1] - pos.array[j*3+1];
          const dz = pos.array[i*3+2] - pos.array[j*3+2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < 20) {
            lp[connCount*6]   = pos.array[i*3];
            lp[connCount*6+1] = pos.array[i*3+1];
            lp[connCount*6+2] = pos.array[i*3+2];
            lp[connCount*6+3] = pos.array[j*3];
            lp[connCount*6+4] = pos.array[j*3+1];
            lp[connCount*6+5] = pos.array[j*3+2];
            connCount++;
          }
        }
      }
      lineGeo.setDrawRange(0, connCount * 2);
      lineGeo.attributes.position.needsUpdate = true;
    }

    // rotate shapes
    shapes.forEach(s => {
      s.rotation.x += s.userData.rotX;
      s.rotation.y += s.userData.rotY;
      s.rotation.z += s.userData.rotZ;
    });

    // camera parallax
    camera.position.x += (mouseX * 8 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 6 - camera.position.y) * 0.03;
    camera.position.z = 80 - scrollY * 0.015;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ════════════════════════════════════════
   NAV
════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ════════════════════════════════════════
   HERO CARD 3D TILT
════════════════════════════════════════ */
const heroCard = document.getElementById('hero-card');
if (heroCard) {
  heroCard.parentElement.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroCard.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
  });
  heroCard.parentElement.addEventListener('mouseleave', () => {
    heroCard.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  });
}

/* ════════════════════════════════════════
   DASH BAR FILL ON LOAD
════════════════════════════════════════ */
setTimeout(() => {
  const fill = document.getElementById('dash-fill');
  if (fill) fill.style.width = '78%';
}, 800);

/* ════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ════════════════════════════════════════
   COUNT-UP ANIMATION
════════════════════════════════════════ */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const step = dur / target;
  let cur = 0;
  const timer = setInterval(() => {
    cur = Math.min(cur + Math.ceil(target / 60), target);
    el.textContent = cur + suffix;
    if (cur >= target) clearInterval(timer);
  }, step);
}

const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-stats, .result-card').forEach(el => countObs.observe(el));

/* ════════════════════════════════════════
   FAQ ACCORDION
════════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-body').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      const body = item.querySelector('.faq-body');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

/* ════════════════════════════════════════
   SMOOTH SCROLL
════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ════════════════════════════════════════
   PRICING FEATURE ACCORDIONS
════════════════════════════════════════ */
document.querySelectorAll('.pricing-feature-header').forEach(header => {
  header.addEventListener('click', () => {
    const row = header.parentElement;
    const body = row.querySelector('.pricing-feature-body');
    const isOpen = row.classList.contains('open');

    // close all
    document.querySelectorAll('.pricing-feature-row').forEach(r => {
      r.classList.remove('open');
      r.querySelector('.pricing-feature-body').style.maxHeight = null;
    });

    if (!isOpen) {
      row.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

/* Upsell accordions */
document.querySelectorAll('.upsell-header').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.parentElement;
    const body = card.querySelector('.upsell-body');
    const isOpen = card.classList.contains('open');
    card.classList.toggle('open', !isOpen);
    body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
  });
});

/* ════════════════════════════════════════
   MONTHLY / ANNUAL TOGGLE
════════════════════════════════════════ */
const billingToggle = document.getElementById('billing-toggle');
const priceNum      = document.getElementById('price-num');
const pricePer      = document.getElementById('price-per');
const annualNote    = document.getElementById('annual-note');
const lblMonthly    = document.getElementById('lbl-monthly');
const lblAnnual     = document.getElementById('lbl-annual');

if (billingToggle) {
  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;
    if (isAnnual) {
      priceNum.textContent = '2,970';
      pricePer.textContent = '/yr  ·  cancel anytime';
      annualNote.classList.add('show');
      lblMonthly.classList.remove('active');
      lblAnnual.classList.add('active');
    } else {
      priceNum.textContent = '297';
      pricePer.textContent = '/mo  ·  cancel anytime';
      annualNote.classList.remove('show');
      lblMonthly.classList.add('active');
      lblAnnual.classList.remove('active');
    }
  });
}

/* ══════════════════════════════════
   NEVER MISS A CALL CALCULATOR
══════════════════════════════════ */
(function() {
  const callsSlider = document.getElementById('calls-slider');
  const jobSlider   = document.getElementById('job-slider');
  const closeSlider = document.getElementById('close-slider');
  if (!callsSlider) return;

  const RECEPTIONIST_ANNUAL = 52000; // ~$40K salary + payroll taxes, benefits, vacation
  const WORK_DAYS_PER_MONTH = 22;

  function setSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
  }

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-CA');
  }

  function updateCalc() {
    const calls    = parseInt(callsSlider.value);
    const jobVal   = parseInt(jobSlider.value);
    const closeRate = parseInt(closeSlider.value) / 100;

    document.getElementById('calls-display').textContent = calls;
    document.getElementById('job-display').textContent   = jobVal.toLocaleString('en-CA');
    document.getElementById('close-display').textContent = parseInt(closeSlider.value);

    setSliderFill(callsSlider);
    setSliderFill(jobSlider);
    setSliderFill(closeSlider);

    const monthly = Math.round(calls * WORK_DAYS_PER_MONTH * closeRate * jobVal);
    const annual  = monthly * 12;
    const saved   = annual + RECEPTIONIST_ANNUAL;

    document.getElementById('monthly-val').textContent = fmt(monthly);
    document.getElementById('annual-val').textContent  = fmt(annual);
    document.getElementById('saved-val').textContent   = fmt(saved);
  }

  callsSlider.addEventListener('input', updateCalc);
  jobSlider.addEventListener('input', updateCalc);
  closeSlider.addEventListener('input', updateCalc);
  updateCalc(); // init
})();
