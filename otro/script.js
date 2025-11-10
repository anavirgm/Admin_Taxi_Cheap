// Mobile Menu Toggle
const menuToggle = document.getElementById("menuToggle")
const navMobile = document.getElementById("navMobile")

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active")
  navMobile.classList.toggle("active")
})

// Close mobile menu when clicking on a link
const mobileLinks = navMobile.querySelectorAll("a")
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active")
    navMobile.classList.remove("active")
  })
})

// FAQ Toggle Functionality
function toggleFAQ(button) {
  const faqItem = button.parentElement
  const answer = faqItem.querySelector(".faq-answer")
  const icon = button.querySelector(".faq-icon")

  // Close other FAQs
  document.querySelectorAll(".faq-item").forEach((item) => {
    if (item !== faqItem) {
      item.querySelector(".faq-question").classList.remove("active")
      item.querySelector(".faq-answer").classList.remove("active")
    }
  })

  // Toggle current FAQ
  button.classList.toggle("active")
  answer.classList.toggle("active")
}

// Close mobile menu when pressing Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    menuToggle.classList.remove("active")
    navMobile.classList.remove("active")
  }
})

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href !== "#") {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  })
})

// Open first FAQ by default
document.addEventListener("DOMContentLoaded", () => {
  const firstFAQ = document.querySelector(".faq-item")
  if (firstFAQ) {
    const button = firstFAQ.querySelector(".faq-question")
    const answer = firstFAQ.querySelector(".faq-answer")
    button.classList.add("active")
    answer.classList.add("active")
  }
})
