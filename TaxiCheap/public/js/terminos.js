let originalContent = ""
let hasChanges = false

document.addEventListener("DOMContentLoaded", () => {
  loadTerms()
  setupEditorEventListeners()
  setupToolbarButtons()
})

function loadTerms() {
  const savedTerms = localStorage.getItem("taxiTerms")
  const editor = document.getElementById("termsEditor")

  if (savedTerms) {
    editor.innerHTML = savedTerms
  }
  originalContent = editor.innerHTML
  hideAutoSaveIndicator()
}

function setupEditorEventListeners() {
  const editor = document.getElementById("termsEditor")

  editor.addEventListener("input", () => {
    hasChanges = true
    showAutoSaveIndicator()
  })

  document.getElementById("btnSaveTerms").addEventListener("click", saveTerms)
  document.getElementById("btnPreviewTerms").addEventListener("click", previewTerms)
  document.getElementById("btnResetTerms").addEventListener("click", resetTerms)
}

function setupToolbarButtons() {
  document.getElementById("boldBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("bold", false, null)
    updateToolbarState()
  })

  document.getElementById("italicBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("italic", false, null)
    updateToolbarState()
  })

  document.getElementById("underlineBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("underline", false, null)
    updateToolbarState()
  })

  document.getElementById("ulBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("insertUnorderedList", false, null)
  })

  document.getElementById("olBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("insertOrderedList", false, null)
  })

  document.getElementById("h1Btn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("formatBlock", false, "<h1>")
  })

  document.getElementById("h2Btn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("formatBlock", false, "<h2>")
  })

  document.getElementById("h3Btn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("formatBlock", false, "<h3>")
  })

  document.getElementById("clearBtn").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("removeFormat", false, null)
  })
}

function updateToolbarState() {
  document.getElementById("boldBtn").classList.toggle("active", document.queryCommandState("bold"))
  document.getElementById("italicBtn").classList.toggle("active", document.queryCommandState("italic"))
  document.getElementById("underlineBtn").classList.toggle("active", document.queryCommandState("underline"))
}

function saveTerms() {
  const editor = document.getElementById("termsEditor")
  const content = editor.innerHTML

  localStorage.setItem("taxiTerms", content)
  originalContent = content
  hasChanges = false
  hideAutoSaveIndicator()

  alert("Términos y condiciones guardados exitosamente")
}

function resetTerms() {
  if (hasChanges) {
    if (confirm("¿Descartar los cambios sin guardar?")) {
      document.getElementById("termsEditor").innerHTML = originalContent
      hasChanges = false
      hideAutoSaveIndicator()
    }
  }
}

function previewTerms() {
  const editor = document.getElementById("termsEditor")
  const content = editor.innerHTML
  const previewContent = document.getElementById("previewContent")

  previewContent.innerHTML = content

  const previewModal = document.getElementById("previewModal")
  const previewModalOverlay = document.getElementById("previewModalOverlay")

  previewModal.classList.add("active")
  previewModalOverlay.classList.add("active")
}

document.getElementById("closePreviewModal").addEventListener("click", () => {
  document.getElementById("previewModal").classList.remove("active")
  document.getElementById("previewModalOverlay").classList.remove("active")
})

document.getElementById("previewModalOverlay").addEventListener("click", () => {
  document.getElementById("previewModal").classList.remove("active")
  document.getElementById("previewModalOverlay").classList.remove("active")
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.getElementById("previewModal").classList.contains("active")) {
    document.getElementById("previewModal").classList.remove("active")
    document.getElementById("previewModalOverlay").classList.remove("active")
  }
})

function showAutoSaveIndicator() {
  const indicator = document.getElementById("autoSaveIndicator")
  indicator.classList.remove("saved")
  indicator.classList.add("show")
}

function hideAutoSaveIndicator() {
  const indicator = document.getElementById("autoSaveIndicator")
  indicator.classList.add("saved")
  indicator.textContent = "Todos los cambios guardados"
  setTimeout(() => {
    indicator.classList.remove("show")
    indicator.textContent = "Cambios pendientes de guardar"
  }, 3000)
}
