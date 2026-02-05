let qaList = []

document.addEventListener("DOMContentLoaded", () => {
  loadQA()
  setupEventListeners()
  renderQACards()
})

function loadQA() {
  const saved = localStorage.getItem("taxiHelp")
  if (saved) {
    qaList = JSON.parse(saved)
  }
}

function setupEventListeners() {
  document.getElementById("btnAddQA").addEventListener("click", () => openQAModal())
  document.getElementById("closeQAModal").addEventListener("click", closeQAModal)
  document.getElementById("qaModalOverlay").addEventListener("click", closeQAModal)
  document.getElementById("qaForm").addEventListener("submit", saveQA)
  document.getElementById("cancelQAForm").addEventListener("click", closeQAModal)

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("qaModal").classList.contains("active")) {
      closeQAModal()
    }
  })
}

function renderQACards() {
  const container = document.getElementById("qaContainer")

  if (qaList.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay artículos. Agrega uno nuevo.</div>'
    return
  }

  container.innerHTML = qaList
    .map(
      (qa, index) => `
    <div class="qa-card">
      <div class="qa-card-header">
        <h3>${qa.question}</h3>
        <div class="qa-card-actions">
          <button class="btn-edit" data-index="${index}" title="Editar">✏️</button>
          <button class="btn-delete" data-index="${index}" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="qa-card-body">
        <p>${qa.answer}</p>
      </div>
    </div>
  `,
    )
    .join("")

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => editQA(Number.parseInt(e.target.dataset.index)))
  })

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => deleteQA(Number.parseInt(e.target.dataset.index)))
  })
}

function openQAModal(editIndex = null) {
  const modal = document.getElementById("qaModal")
  const form = document.getElementById("qaForm")
  const title = document.getElementById("qaModalTitle")
  const questionInput = document.getElementById("qaQuestion")
  const answerInput = document.getElementById("qaAnswer")

  if (editIndex !== null) {
    title.textContent = "Editar Artículo"
    questionInput.value = qaList[editIndex].question
    answerInput.value = qaList[editIndex].answer
    form.dataset.editIndex = editIndex
  } else {
    title.textContent = "Nuevo Artículo"
    form.reset()
    delete form.dataset.editIndex
  }

  modal.classList.add("active")
  document.getElementById("qaModalOverlay").classList.add("active")
}

function closeQAModal() {
  document.getElementById("qaModal").classList.remove("active")
  document.getElementById("qaModalOverlay").classList.remove("active")
  document.getElementById("qaForm").reset()
}

function saveQA(e) {
  e.preventDefault()
  const question = document.getElementById("qaQuestion").value
  const answer = document.getElementById("qaAnswer").value
  const form = e.target
  const editIndex = form.dataset.editIndex

  if (editIndex !== undefined) {
    qaList[editIndex] = { question, answer }
  } else {
    qaList.push({ question, answer })
  }

  localStorage.setItem("taxiHelp", JSON.stringify(qaList))
  closeQAModal()
  renderQACards()
}

function editQA(index) {
  openQAModal(index)
}

function deleteQA(index) {
  if (confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
    qaList.splice(index, 1)
    localStorage.setItem("taxiHelp", JSON.stringify(qaList))
    renderQACards()
  }
}
