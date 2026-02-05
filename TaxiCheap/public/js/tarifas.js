let currentRates = {
  baseRate: 2.5,
  perKmRate: 1.5,
  perMinuteRate: 0.3,
  nightSurge: 25,
  peakSurge: 30,
}

// Load rates from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  loadRates()
  setupEventListeners()
})

function loadRates() {
  const savedRates = localStorage.getItem("taxiRates")
  if (savedRates) {
    currentRates = JSON.parse(savedRates)
  }
  displayRates()
}

function displayRates() {
  document.getElementById("baseRate").textContent = `$${currentRates.baseRate.toFixed(2)}`
  document.getElementById("perKmRate").textContent = `$${currentRates.perKmRate.toFixed(2)}`
  document.getElementById("perMinuteRate").textContent = `$${currentRates.perMinuteRate.toFixed(2)}`
  document.getElementById("nightSurge").textContent = `${currentRates.nightSurge}%`
  document.getElementById("peakSurge").textContent = `${currentRates.peakSurge}%`
}

function setupEventListeners() {
  const btnEditRates = document.getElementById("btnEditRates")
  const closeEditModal = document.getElementById("closeEditModal")
  const btnCancelEdit = document.getElementById("btnCancelEdit")
  const ratesForm = document.getElementById("ratesForm")
  const editModalOverlay = document.getElementById("editModalOverlay")
  const editRatesModal = document.getElementById("editRatesModal")

  btnEditRates.addEventListener("click", openEditModal)
  closeEditModal.addEventListener("click", closeEditModal)
  btnCancelEdit.addEventListener("click", closeEditModal)
  editModalOverlay.addEventListener("click", closeEditModal)
  ratesForm.addEventListener("submit", saveRates)

  // Close modal with ESC key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editRatesModal.classList.contains("active")) {
      closeEditRatesModal()
    }
  })
}

function openEditModal() {
  const editRatesModal = document.getElementById("editRatesModal")
  const editModalOverlay = document.getElementById("editModalOverlay")

  // Fill form with current values
  document.getElementById("inputBaseRate").value = currentRates.baseRate
  document.getElementById("inputPerKmRate").value = currentRates.perKmRate
  document.getElementById("inputPerMinuteRate").value = currentRates.perMinuteRate
  document.getElementById("inputNightSurge").value = currentRates.nightSurge
  document.getElementById("inputPeakSurge").value = currentRates.peakSurge

  editRatesModal.classList.add("active")
  editModalOverlay.classList.add("active")
}

function closeEditRatesModal() {
  const editRatesModal = document.getElementById("editRatesModal")
  const editModalOverlay = document.getElementById("editModalOverlay")

  editRatesModal.classList.remove("active")
  editModalOverlay.classList.remove("active")
}

document.getElementById("closeEditModal").addEventListener("click", closeEditRatesModal)
document.getElementById("btnCancelEdit").addEventListener("click", closeEditRatesModal)
document.getElementById("editModalOverlay").addEventListener("click", closeEditRatesModal)

function saveRates(event) {
  event.preventDefault()

  currentRates = {
    baseRate: Number.parseFloat(document.getElementById("inputBaseRate").value),
    perKmRate: Number.parseFloat(document.getElementById("inputPerKmRate").value),
    perMinuteRate: Number.parseFloat(document.getElementById("inputPerMinuteRate").value),
    nightSurge: Number.parseInt(document.getElementById("inputNightSurge").value),
    peakSurge: Number.parseInt(document.getElementById("inputPeakSurge").value),
  }

  localStorage.setItem("taxiRates", JSON.stringify(currentRates))
  displayRates()
  closeEditRatesModal()

  alert("Tarifas actualizadas exitosamente")
}
