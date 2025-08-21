document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const questions = [
        { q: "What is the primary cause of the Earth's seasons?", o: ["The Earth's distance from the Sun", "The tilt of the Earth's axis", "The speed of the Earth's rotation", "Ocean currents"], a: 1, s: 'unseen', ua: null },
        { q: "Which planet is known as the 'Red Planet'?", o: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1, s: 'unseen', ua: null },
        { q: "What is the largest mammal in the world?", o: ["Elephant", "Giraffe", "Blue Whale", "Great White Shark"], a: 2, s: 'unseen', ua: null },
        { q: "What is the chemical symbol for Gold?", o: ["Ag", "Au", "Pb", "Fe"], a: 1, s: 'unseen', ua: null },
        { q: "In which year did the Titanic sink?", o: ["1905", "1912", "1918", "1923"], a: 1, s: 'unseen', ua: null },
        ...Array.from({ length: 15 }, (_, i) => ({ q: `Sample Question ${i + 6}?`, o: [`Option A${i}`, `Option B${i}`, `Option C${i}`, `Option D${i}`], a: i % 4, s: 'unseen', ua: null }))
    ];

    // --- STATE ---
    let currentQIndex = 0;
    let timerInterval;
    let timeLeft = 20 * 60;

    // --- SELECTORS ---
    const examUI = document.getElementById('aa-exam');
    const resultsPage = document.getElementById('aa-results');
    const modal = document.getElementById('aa-modal');
    const qCont = document.getElementById('aa-q-cont');
    const palette = document.getElementById('aa-palette');
    const statusEl = document.getElementById('aa-status');
    const timerEl = document.getElementById('aa-timer');
    const backBtn = document.getElementById('aa-back-btn');
    const nextBtn = document.getElementById('aa-next-btn');
    const saveBtn = document.getElementById('aa-save-btn');
    const reviewBtn = document.getElementById('aa-review-btn');
    const finishBtn = document.getElementById('aa-finish-btn');
    const cancelBtn = document.getElementById('aa-cancel-btn');
    const confirmBtn = document.getElementById('aa-confirm-btn');
    const toast = document.getElementById('aa-toast');

    // --- FUNCTIONS ---
    function renderQuestion() {
        const qData = questions[currentQIndex];
        if (qData.s === 'unseen') qData.s = 'seen';

        const optsHTML = qData.o.map((opt, i) => {
            const isChecked = qData.ua === i;
            return `
            <label class="block cursor-pointer">
                <input class="sr-only peer" name="opt" type="radio" value="${i}" ${isChecked ? 'checked' : ''}>
                <div class="aa-opt-card flex items-center p-4 rounded-lg border-2 border-transparent bg-slate-800/50">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 mr-4 font-bold">${String.fromCharCode(65 + i)}</span>
                    <span>${opt}</span>
                </div>
            </label>
        `}).join('');

        qCont.innerHTML = `
            <p class="text-[var(--text-secondary)] mb-2">Question ${currentQIndex + 1} of ${questions.length}</p>
            <h2 class="text-2xl font-bold leading-snug mb-6">${qData.q}</h2>
            <div class="space-y-4">${optsHTML}</div>
        `;
        renderPalette();
        updateNav();
    }

    function renderPalette() {
        palette.innerHTML = questions.map((q, i) => `
            <div class="aa-chip aa-${q.s} ${i === currentQIndex ? 'aa-current' : ''} flex items-center justify-center h-12 w-12 rounded-lg cursor-pointer text-white font-bold" data-index="${i}">${i + 1}</div>
        `).join('');
        palette.querySelectorAll('.aa-chip').forEach(c => c.addEventListener('click', e => navTo(parseInt(e.target.dataset.index))));
    }

    function updateNav() {
        backBtn.disabled = currentQIndex === 0;
        nextBtn.disabled = currentQIndex === questions.length - 1;
        backBtn.classList.toggle('opacity-50', backBtn.disabled);
        nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
    }

    function updateStatus() {
        const answeredCount = questions.filter(q => q.s === 'answered').length;
        statusEl.querySelector('span').textContent = `Answered ${answeredCount}/${questions.length}`;
    }

    function navTo(index) {
        if (index >= 0 && index < questions.length) {
            currentQIndex = index;
            renderQuestion();
        }
    }

    function handleSave() {
        const selected = qCont.querySelector('input[name="opt"]:checked');
        if (selected) {
            questions[currentQIndex].ua = parseInt(selected.value);
            questions[currentQIndex].s = 'answered';
            showToast();
            updateStatus();
            renderPalette();
        } else {
            const qData = questions[currentQIndex];
            if (qData.s === 'answered') {
                qData.s = 'seen';
                qData.ua = null;
                updateStatus();
                renderPalette();
            } else {
                 alert('Please select an option to save.');
            }
        }
    }

    function handleReview() {
        questions[currentQIndex].s = 'review';
        renderPalette();
    }

    function showToast() {
        toast.classList.add('aa-show');
        setTimeout(() => toast.classList.remove('aa-show'), 3000);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            if (timeLeft <= 0) finishExam();
        }, 1000);
    }

    function finishExam() {
        clearInterval(timerInterval);
        // BUG FIX: Only count answers as correct if they are saved ('answered' status)
        const correctCount = questions.filter(q => q.s === 'answered' && q.ua === q.a).length;

        document.getElementById('aa-score').textContent = `${correctCount}/${questions.length}`;
        document.getElementById('aa-correct').textContent = correctCount;
        document.getElementById('aa-wrong').textContent = questions.length - correctCount;
        examUI.classList.add('hidden');
        resultsPage.classList.remove('hidden');
        modal.classList.add('hidden');
    }

    // --- LISTENERS ---

    qCont.addEventListener('click', e => {
        const radio = e.target.closest('input[name="opt"]');
        if (!radio) return;

        const value = parseInt(radio.value);
        const qData = questions[currentQIndex];

        if (qData.ua === value) {
            radio.checked = false;
            qData.ua = null;
        } else {
            qData.ua = value;
        }
    });

    nextBtn.addEventListener('click', () => navTo(currentQIndex + 1));
    backBtn.addEventListener('click', () => navTo(currentQIndex - 1));
    saveBtn.addEventListener('click', handleSave);
    reviewBtn.addEventListener('click', handleReview);
    finishBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    confirmBtn.addEventListener('click', finishExam);

    // --- INIT ---
    renderQuestion();
    updateStatus();
    startTimer();
});
