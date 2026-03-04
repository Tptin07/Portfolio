// ============================================
// DARK/LIGHT THEME TOGGLE
// ============================================

const themeToggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Load theme from localStorage or system preference
const savedTheme =
  localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
document.body.className = savedTheme === "dark" ? "dark-theme" : "light-theme";

// Set initial icon
themeToggle.innerHTML = document.body.classList.contains("dark-theme")
  ? '<i class="fas fa-moon"></i>'
  : '<i class="fas fa-sun"></i>';

themeToggle.addEventListener("click", () => {
  themeToggle.style.animation = "none";
  setTimeout(() => {
    themeToggle.style.animation = "themeSpin 0.6s ease-in-out";
  }, 10);

  const isDark = document.body.classList.contains("dark-theme");
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
  localStorage.setItem("theme", isDark ? "light" : "dark");
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';
});

// ============================================
// LANGUAGE TOGGLE
// ============================================

const langToggle = document.getElementById("langToggle");
let currentLang = localStorage.getItem("language") || "en";

// Set initial language
updateLanguage(currentLang);
updateLangToggleStyle();

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "vi" : "en";
  localStorage.setItem("language", currentLang);
  updateLanguage(currentLang);
  updateLangToggleStyle();
});

function updateLangToggleStyle() {
  const langVI = document.querySelector(".lang-vi");
  const langEN = document.querySelector(".lang-en");

  if (currentLang === "vi") {
    langVI.classList.add("active");
    langEN.classList.remove("active");
  } else {
    langEN.classList.add("active");
    langVI.classList.remove("active");
  }
}

function updateLanguage(lang) {
  document.querySelectorAll("[data-en]").forEach((element) => {
    if (lang === "en") {
      element.textContent = element.getAttribute("data-en");
    } else {
      element.textContent = element.getAttribute("data-vi");
    }
  });

  // Update placeholder text for inputs
  document.querySelectorAll("[data-en-placeholder]").forEach((element) => {
    if (lang === "en") {
      element.placeholder = element.getAttribute("data-en-placeholder");
    } else {
      element.placeholder = element.getAttribute("data-vi-placeholder");
    }
  });

  // Update HTML content (for footer and other HTML elements)
  document.querySelectorAll("[data-vi]").forEach((element) => {
    if (!element.getAttribute("data-en")) return;

    if (lang === "vi") {
      const viText = element.getAttribute("data-vi");
      if (viText.includes("<br")) {
        element.innerHTML = viText;
      } else {
        element.textContent = viText;
      }
    } else {
      const enText = element.getAttribute("data-en");
      if (enText.includes("<br")) {
        element.innerHTML = enText;
      } else {
        element.textContent = enText;
      }
    }
  });
}

// ============================================
// SMOOTH NAVIGATION WITH SECTION TRANSITION
// ============================================

let lastSection = "";

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      // Add fade out animation to current section
      const sections = document.querySelectorAll("section");
      sections.forEach((section) => {
        if (section.offsetParent !== null) {
          section.style.animation = "fadeOutUp 0.5s ease-in forwards";
        }
      });

      // Scroll to target with delay
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth" });
        // Add fade in animation to target section
        target.style.animation = "fadeInDown 0.6s ease-out forwards";
      }, 300);
    }
  });
});

// ============================================
// NAVBAR ACTIVE LINK ON SCROLL
// ============================================

window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  // Apply section transition animations on scroll
  if (current !== lastSection) {
    lastSection = current;
    const currentSection = document.getElementById(current);
    if (currentSection) {
      currentSection.style.animation = "fadeInUp 0.8s ease-out forwards";
    }
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      entry.target.style.animation = "fadeInUp 0.6s ease-out forwards";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document
  .querySelectorAll(".service-card, .work-card, .resume-item")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "all 0.6s ease";
    observer.observe(el);
  });

// ============================================
// CONTACT FORM HANDLER
// ============================================

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const submitButton = contactForm.querySelector('button[type="submit"]');

    // Simple validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    // Disable button during submission
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(
        "http://localhost:3001/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          "Thank you! Your message has been sent successfully. I'll get back to you soon!"
        );
        contactForm.reset();
      } else {
        alert(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Error sending message. Please make sure the backend server is running on port 3001."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// ============================================
// BUTTON INTERACTIONS
// ============================================

const buttons = document.querySelectorAll(".btn");
buttons.forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Optional: Add ripple effect
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.5)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s ease-out";
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// ============================================
// ADD ANIMATIONS
// ============================================

const style = document.createElement("style");
style.textContent = `
  /* Smooth animations with GPU acceleration */
  * {
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }

  section {
    will-change: transform, opacity;
  }

  /* FadeOutUp - Section transition out */
  @keyframes fadeOutUp {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    to {
      opacity: 0;
      transform: translate3d(0, -30px, 0);
    }
  }

  /* FadeInDown - Section transition in */
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translate3d(0, -30px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  /* FadeInUp - Scroll reveal animation */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate3d(0, 30px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  /* Theme spin animation */
  @keyframes themeSpin {
    0% {
      transform: rotate3d(0, 0, 1, 0deg) scale(1);
    }
    50% {
      transform: rotate3d(0, 0, 1, 180deg) scale(1.15);
    }
    100% {
      transform: rotate3d(0, 0, 1, 360deg) scale(1);
    }
  }

  /* Ripple animation */
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
