/* ==========================================================================
   Typed Text Animation Wrapper & Pure Fallback Engine
   Cycles through developer titles gracefully
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const targetEl = document.querySelector('.typed-text');
  if (!targetEl) return;

  const roles = [
    "Computer Science Student",
    "AI & Machine Learning Enthusiast",
    "Data Science Enthusiast",
    "Full Stack Developer"
  ];

  // If external Typed.js library is present, use it
  if (typeof Typed !== 'undefined') {
    new Typed('.typed-text', {
      strings: roles,
      typeSpeed: 60,
      backSpeed: 35,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    });
  } else {
    // High-performance native fallback engine
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseTime = 2000;

    function typeEffect() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        targetEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        targetEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        nextSpeed = pauseTime;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        nextSpeed = 500;
      }

      setTimeout(typeEffect, nextSpeed);
    }

    typeEffect();
  }
});
