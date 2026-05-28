/* -------------------------------------------------------------
 * DEV.LIVRE - Controlador de Interatividade JavaScript
 * Funcionalidades: Trilha Interativa, Filtros e Code Playground
 * ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar Trilha
    initRoadmap();

    // 2. Inicializar Filtros de Cursos
    initCourseFilters();

    // 3. Inicializar Playground de Código
    initPlayground();
});

/* ==========================================================================
   1. TRILHA INTERATIVA (ROADMAP)
   ========================================================================== */

let completedSteps = [];
const TOTAL_STEPS = 5;

function initRoadmap() {
    // Carregar progresso salvo no localStorage
    const saved = localStorage.getItem("dev-livre-progress");
    if (saved) {
        try {
            completedSteps = JSON.parse(saved);
        } catch (e) {
            completedSteps = [];
        }
    }

    // Atualizar UI com os passos já concluídos
    completedSteps.forEach(stepNum => {
        const stepElement = document.querySelector(`.roadmap-step[data-step="${stepNum}"]`);
        if (stepElement) {
            stepElement.classList.add("completed");
        }
    });

    updateProgress();
}

// Expande ou recolhe um cartão de passo
function expandStep(stepNumber) {
    const allStepCards = document.querySelectorAll(".step-card");
    const targetCard = document.querySelector(`.roadmap-step[data-step="${stepNumber}"] .step-card`);

    if (!targetCard) return;

    const isExpanded = targetCard.classList.contains("expanded");

    // Fecha todos os cartões (estilo acordeão para facilitar a leitura no celular)
    allStepCards.forEach(card => card.classList.remove("expanded"));

    // Se o clicado não estava expandido, expande ele
    if (!isExpanded) {
        targetCard.classList.add("expanded");
        
        // Rolar suavemente para o passo aberto em celulares
        setTimeout(() => {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

// Marca/Desmarca um passo como concluído
function toggleStep(stepNumber) {
    const stepElement = document.querySelector(`.roadmap-step[data-step="${stepNumber}"]`);
    if (!stepElement) return;

    const stepIndex = completedSteps.indexOf(stepNumber);

    if (stepIndex > -1) {
        // Desmarcar
        completedSteps.splice(stepIndex, 1);
        stepElement.classList.remove("completed");
    } else {
        // Marcar
        completedSteps.push(stepNumber);
        stepElement.classList.add("completed");
        
        // Se concluiu, recolhe o acordeão após um pequeno delay para feedback visual
        setTimeout(() => {
            const card = stepElement.querySelector(".step-card");
            if (card) card.classList.remove("expanded");
        }, 800);
    }

    // Salvar progresso
    localStorage.setItem("dev-livre-progress", JSON.stringify(completedSteps));

    // Atualizar barra de progresso
    updateProgress();
}

// Atualiza a barra e o texto de progresso
function updateProgress() {
    const percent = Math.round((completedSteps.length / TOTAL_STEPS) * 100);
    
    const progressBar = document.getElementById("progress-bar");
    const progressPercent = document.getElementById("progress-percent");
    const progressTips = document.getElementById("progress-tips");

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.innerText = `${percent}%`;

    // Atualizar mensagens motivacionais baseadas no progresso
    if (progressTips) {
        if (percent === 0) {
            progressTips.innerHTML = "💡 Clique nos passos abaixo para ler e começar sua jornada!";
        } else if (percent < 50) {
            progressTips.innerHTML = "⚡ Excelente começo! Continue avançando, passo a passo.";
        } else if (percent < 100) {
            progressTips.innerHTML = "🚀 Você está na metade do caminho! Quase lá!";
        } else {
            progressTips.innerHTML = "🎉 <strong>Parabéns! Você completou toda a trilha!</strong> Compartilhe o Dev.livre com amigos que também querem aprender!";
        }
    }
}

// Tornar as funções globais para usar nos onclicks do HTML
window.toggleStep = toggleStep;
window.expandStep = expandStep;


/* ==========================================================================
   2. FILTRO DE CURSOS E VÍDEOS
   ========================================================================== */

function initCourseFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const courseCards = document.querySelectorAll(".course-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Atualizar botão ativo
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            // Filtrar cartões
            courseCards.forEach(card => {
                const tags = card.getAttribute("data-tags").split(" ");
                
                if (filterValue === "all" || tags.includes(filterValue)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}


/* ==========================================================================
   3. MINI PLAYGROUND DE HTML/CSS
   ========================================================================== */

const templates = {
    button: `<button style="background-color: #546745; color: #F7F6E3; padding: 14px 28px; border: 3px solid #4E351E; border-radius: 12px; font-family: sans-serif; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 4px 4px 0px #4E351E; transition: all 0.1s;">
   Clique em Mim!
</button>

<p style="color: #4E351E; font-family: sans-serif; margin-top: 15px;">
   Você pode mudar esse texto ou a cor do botão acima!
</p>`,

    text: `<h1 style="color: #4E351E; font-family: serif; font-size: 28px; margin-bottom: 8px;">
   Olá, quebrada! 👋
</h1>

<p style="color: #6C5234; font-family: sans-serif; font-size: 16px; line-height: 1.5;">
   Este é o seu primeiro código HTML/CSS sendo renderizado diretamente na tela do seu celular!
</p>`,

    emoji: `<div style="text-align: center; padding: 10px;">
   <div style="font-size: 50px; display: inline-block; animation: bounce 1.5s infinite alternate; margin-bottom: 10px;">
      🚀
   </div>
   <p style="font-weight: bold; color: #546745; font-family: sans-serif;">
      Programação te leva longe!
   </p>
</div>

<style>
@keyframes bounce {
   from { transform: translateY(0); }
   to { transform: translateY(-15px); }
}
</style>`
};

function initPlayground() {
    updatePlaygroundPreview();
}

function updatePlaygroundPreview() {
    const codeArea = document.getElementById("playground-code");
    const previewContainer = document.getElementById("playground-preview");

    if (!codeArea || !previewContainer) return;

    const userCode = codeArea.value;

    // Injeta com segurança local
    previewContainer.innerHTML = userCode;
}

function loadPlaygroundTemplate(type) {
    const codeArea = document.getElementById("playground-code");
    const tabButtons = document.querySelectorAll(".playground-tabs .tab-btn");

    if (!codeArea || !templates[type]) return;

    // Atualizar classe ativa das abas
    tabButtons.forEach(btn => {
        if (btn.getAttribute("onclick").includes(type)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Carregar código no editor e atualizar o preview
    codeArea.value = templates[type];
    updatePlaygroundPreview();
}

// Tornar globais para uso nos eventos inline
window.updatePlaygroundPreview = updatePlaygroundPreview;
window.loadPlaygroundTemplate = loadPlaygroundTemplate;
