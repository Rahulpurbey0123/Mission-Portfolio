/* ==========================================================================
   Main Application Engine
   Rahul Kumar Purbey Personal Portfolio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------------
     1. Preloader Fadeout
     ------------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hidePreloader = () => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.visibility = 'hidden';
        preloader.style.display = 'none';
      }, 300);
    };

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 300);
    } else {
      window.addEventListener('load', function () {
        setTimeout(hidePreloader, 300);
      });
    }

    // Maximum fallback hide after 1.5s
    setTimeout(hidePreloader, 1500);
  }

  /* ------------------------------------------------------------------------
     2. Navbar & Reading Progress Bar
     ------------------------------------------------------------------------ */
  const navbar = document.querySelector('.navbar');
  const progressBar = document.getElementById('reading-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Progress bar width
    if (progressBar && scrollHeight > 0) {
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = progress + '%';
    }

    // Navbar scrolled background
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Drawer Toggle
     ------------------------------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Intersection Observer for Active Nav Highlighting
     ------------------------------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navTarget = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (navTarget) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navTarget.classList.add('active');
        } else {
          navTarget.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll);

  /* ------------------------------------------------------------------------
     5. Stat Numbers Count-Up Animation
     ------------------------------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  function runStatsAnimation() {
    const statsSection = document.querySelector('.stats-grid');
    if (!statsSection || animatedStats) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      animatedStats = true;
      statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const suffix = stat.getAttribute('data-suffix') || '';
        let count = target > 1900 ? target - 30 : 0;
        const totalSteps = 30;
        const speed = (target - count) / totalSteps;

        const updateCount = () => {
          count += speed;
          if (count < target) {
            stat.textContent = Math.ceil(count) + suffix;
            setTimeout(updateCount, 30);
          } else {
            stat.textContent = target + suffix;
          }
        };
        updateCount();
      });
    }
  }

  window.addEventListener('scroll', runStatsAnimation);

  /* ------------------------------------------------------------------------
     6. Contact Form Real Email Submission (Web3Forms API + Mailto Fallback)
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
      btn.disabled = true;

      // Web3Forms Access Key for direct delivery to rahulpurbey83@gmail.com
      const accessKey = contactForm.getAttribute('data-access-key') || '';

      if (accessKey && accessKey.length > 5 && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: accessKey,
              name: name,
              email: email,
              subject: `[Portfolio] ${subject}`,
              message: message,
              from_name: `${name} (via Portfolio)`
            })
          });

          const result = await response.json();

          if (result.success) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            formStatus.textContent = "Thank you! Your message has been sent directly to Rahul's Gmail inbox (rahulpurbey83@gmail.com).";
            formStatus.className = "form-status success";
            contactForm.reset();
          } else {
            throw new Error(result.message || 'Submission failed');
          }
        } catch (err) {
          console.warn('API send failed, falling back to mailto:', err);
          triggerMailtoFallback();
        }
      } else {
        triggerMailtoFallback();
      }

      function triggerMailtoFallback() {
        const mailtoSubject = encodeURIComponent(`Portfolio Inquiry: ${subject}`);
        const mailtoBody = encodeURIComponent(
          `Hi Rahul,\n\nName: ${name}\nEmail: ${email}\n\nSubject: ${subject}\n\nMessage:\n${message}\n\nBest regards,\n${name}`
        );

        window.location.href = `mailto:rahulpurbey83@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

        btn.innerHTML = '<i class="fa-solid fa-envelope"></i> Mail App Opened!';
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        formStatus.textContent = "Your mail application opened! Please click 'Send' in your mail app to deliver your message to rahulpurbey83@gmail.com.";
        formStatus.className = "form-status success";
        contactForm.reset();
      }

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 6000);
    });
  }

  /* ------------------------------------------------------------------------
     7. Initialize External AOS Library if available
     ------------------------------------------------------------------------ */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });
  }
});
