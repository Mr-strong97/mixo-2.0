// ============================================================
//  BookingModal.js — Modal de réservation
//  Mixo · Module Services
// ============================================================

export class BookingModal {
  constructor(container) {
    this.container = container;
    this.service = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.step = 1; // 1: sélection, 2: confirmation
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay bm-overlay" id="bmOverlay" style="display:none">
        <div class="bm-modal" role="dialog" aria-modal="true" aria-labelledby="bmTitle">

          <!-- Header -->
          <div class="bm-header">
            <div class="bm-header__service" id="bmServiceInfo"></div>
            <button class="sfm-close" id="bmClose" aria-label="Fermer">
              <i data-lucide="x"></i>
            </button>
          </div>

          <!-- Steps indicator -->
          <div class="bm-steps">
            <div class="bm-step active" id="bmStep1Ind">
              <span class="bm-step__num">1</span>
              <span>Choisir un créneau</span>
            </div>
            <div class="bm-step-line"></div>
            <div class="bm-step" id="bmStep2Ind">
              <span class="bm-step__num">2</span>
              <span>Confirmer</span>
            </div>
          </div>

          <!-- Corps -->
          <div class="bm-body">

            <!-- ÉTAPE 1 : Sélection date + heure -->
            <div id="bmPanel1">
              <div class="bm-calendar-wrap">
                <div class="bm-calendar-header">
                  <button class="bm-cal-nav" id="bmPrevMonth">
                    <i data-lucide="chevron-left"></i>
                  </button>
                  <span class="bm-cal-title" id="bmCalTitle"></span>
                  <button class="bm-cal-nav" id="bmNextMonth">
                    <i data-lucide="chevron-right"></i>
                  </button>
                </div>
                <div class="bm-calendar-grid" id="bmCalGrid"></div>
              </div>

              <div class="bm-slots-wrap" id="bmSlotsWrap" style="display:none">
                <h4 class="bm-slots-title">Créneaux disponibles</h4>
                <div class="bm-slots" id="bmSlots"></div>
              </div>
            </div>

            <!-- ÉTAPE 2 : Confirmation -->
            <div id="bmPanel2" style="display:none">
              <div class="bm-recap">
                <h4>Récapitulatif de votre réservation</h4>
                <div class="bm-recap__card">
                  <div class="bm-recap__row">
                    <span><i data-lucide="scissors" style="width:15px;height:15px"></i> Service</span>
                    <strong id="rcService">—</strong>
                  </div>
                  <div class="bm-recap__row">
                    <span><i data-lucide="user" style="width:15px;height:15px"></i> Coiffeur</span>
                    <strong id="rcCoiffeur">—</strong>
                  </div>
                  <div class="bm-recap__row">
                    <span><i data-lucide="calendar" style="width:15px;height:15px"></i> Date</span>
                    <strong id="rcDate">—</strong>
                  </div>
                  <div class="bm-recap__row">
                    <span><i data-lucide="clock" style="width:15px;height:15px"></i> Heure</span>
                    <strong id="rcHeure">—</strong>
                  </div>
                  <div class="bm-recap__row">
                    <span><i data-lucide="timer" style="width:15px;height:15px"></i> Durée</span>
                    <strong id="rcDuree">—</strong>
                  </div>
                  <div class="bm-recap__divider"></div>
                  <div class="bm-recap__row bm-recap__row--total">
                    <span>Total</span>
                    <strong id="rcPrix">—</strong>
                  </div>
                </div>
                <p class="bm-recap__note">
                  <i data-lucide="info" style="width:14px;height:14px"></i>
                  Vous et le coiffeur recevrez une notification de confirmation.
                </p>
              </div>
            </div>

          </div><!-- /bm-body -->

          <!-- Footer -->
          <div class="bm-footer">
            <button type="button" class="btn-ghost" id="bmPrevStepBtn" style="display:none">
              <i data-lucide="chevron-left"></i> Retour
            </button>
            <div style="flex:1"></div>
            <button type="button" class="btn-ghost" id="bmCancelBtn">Annuler</button>
            <button type="button" class="btn-primary" id="bmNextStepBtn" disabled>
              Continuer <i data-lucide="chevron-right"></i>
            </button>
            <button type="button" class="btn-primary bm-confirm-btn" id="bmConfirmBtn" style="display:none">
              <i data-lucide="check"></i> Confirmer la réservation
            </button>
          </div>

        </div><!-- /bm-modal -->
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    this._bindEvents();
  }

  open(service) {
    this.service = service;
    this.selectedDate = null;
    this.selectedTime = null;
    this.calYear = new Date().getFullYear();
    this.calMonth = new Date().getMonth();
    this._goToStep(1);

    // Infos service
    const prix = parseFloat(service.prix).toLocaleString('fr-FR', {style:'currency',currency:'EUR'});
    document.getElementById('bmServiceInfo').innerHTML = `
      <div class="bm-service-badge">
        <strong>${service.nom_prestation}</strong>
        <span>${prix} · ${_formatDuration(service.duree_minutes)}</span>
      </div>
    `;

    document.getElementById('bmOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this._renderCalendar();
    if (window.lucide) window.lucide.createIcons();
  }

  close() {
    document.getElementById('bmOverlay').style.display = 'none';
    document.body.style.overflow = '';
  }

  _goToStep(n) {
    this.step = n;
    document.getElementById('bmPanel1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('bmPanel2').style.display = n === 2 ? 'block' : 'none';
    document.getElementById('bmStep1Ind').classList.toggle('active', n === 1);
    document.getElementById('bmStep1Ind').classList.toggle('done', n > 1);
    document.getElementById('bmStep2Ind').classList.toggle('active', n === 2);
    document.getElementById('bmPrevStepBtn').style.display = n > 1 ? 'flex' : 'none';
    document.getElementById('bmNextStepBtn').style.display = n === 1 ? 'flex' : 'none';
    document.getElementById('bmConfirmBtn').style.display = n === 2 ? 'flex' : 'none';
    if (n === 2) this._fillRecap();
    if (window.lucide) window.lucide.createIcons();
  }

  _renderCalendar() {
    const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const JOURS = ['L','M','M','J','V','S','D'];
    document.getElementById('bmCalTitle').textContent = `${MOIS[this.calMonth]} ${this.calYear}`;

    const grid = document.getElementById('bmCalGrid');
    const today = new Date(); today.setHours(0,0,0,0);

    // En-têtes jours
    let html = JOURS.map(j => `<div class="bm-cal-day-head">${j}</div>`).join('');

    const first = new Date(this.calYear, this.calMonth, 1);
    const startDay = (first.getDay() + 6) % 7; // Lundi = 0

    for (let i = 0; i < startDay; i++) html += `<div></div>`;

    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.calYear, this.calMonth, d);
      const isPast = date < today;
      const isSunday = date.getDay() === 0;
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = this.selectedDate === dateStr;

      html += `
        <button class="bm-cal-day ${isPast || isSunday ? 'disabled' : ''} ${isSelected ? 'selected' : ''}"
          data-date="${dateStr}"
          ${isPast || isSunday ? 'disabled' : ''}
          title="${isPast ? 'Date passée' : isSunday ? 'Fermé le dimanche' : ''}">
          ${d}
        </button>
      `;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.bm-cal-day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDate = btn.dataset.date;
        this._renderCalendar();
        this._loadSlots(this.selectedDate);
      });
    });
  }

  _loadSlots(date) {
    const wrap = document.getElementById('bmSlotsWrap');
    const container = document.getElementById('bmSlots');
    wrap.style.display = 'block';

    // Créneaux simulés (en prod : fetch API)
    const slots = _generateSlots(date, this.service);
    if (slots.length === 0) {
      container.innerHTML = `<p class="bm-no-slots">Aucun créneau disponible ce jour. Essayez une autre date.</p>`;
      return;
    }

    container.innerHTML = slots.map(slot => `
      <button class="bm-slot ${slot.libre ? '' : 'bm-slot--taken'}"
        data-time="${slot.time}"
        ${!slot.libre ? 'disabled' : ''}>
        ${slot.time}
        ${!slot.libre ? '<span>Pris</span>' : ''}
      </button>
    `).join('');

    container.querySelectorAll('.bm-slot:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.bm-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedTime = btn.dataset.time;
        document.getElementById('bmNextStepBtn').disabled = false;
      });
    });
  }

  _fillRecap() {
    const s = this.service;
    const dateStr = this.selectedDate;
    const dateObj = new Date(dateStr);
    const formatted = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById('rcService').textContent = s.nom_prestation;
    document.getElementById('rcCoiffeur').textContent = s.coiffeur_nom || 'Votre coiffeur';
    document.getElementById('rcDate').textContent = formatted;
    document.getElementById('rcHeure').textContent = this.selectedTime;
    document.getElementById('rcDuree').textContent = _formatDuration(s.duree_minutes);
    document.getElementById('rcPrix').textContent = parseFloat(s.prix).toLocaleString('fr-FR', {style:'currency',currency:'EUR'});
    if (window.lucide) window.lucide.createIcons();
  }

  async _confirmBooking() {
    const btn = document.getElementById('bmConfirmBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="bm-spinner"></span> Réservation…';

    try {
      const resp = await fetch('/api/rendezvous/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          service_id: this.service.id,
          coiffeur_id: this.service.coiffeur_id,
          date_heure: `${this.selectedDate}T${this.selectedTime}:00`,
        })
      });
      if (!resp.ok) throw new Error();
    } catch {/* Démo */ }

    this.close();
    window.showToast && window.showToast('Réservation confirmée ! Vous recevrez une notification.', 'success');
  }

  _bindEvents() {
    document.getElementById('bmClose').addEventListener('click', () => this.close());
    document.getElementById('bmCancelBtn').addEventListener('click', () => this.close());
    document.getElementById('bmOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) this.close();
    });

    document.getElementById('bmPrevStepBtn').addEventListener('click', () => this._goToStep(1));
    document.getElementById('bmNextStepBtn').addEventListener('click', () => {
      if (this.selectedDate && this.selectedTime) this._goToStep(2);
    });
    document.getElementById('bmConfirmBtn').addEventListener('click', () => this._confirmBooking());

    document.getElementById('bmPrevMonth').addEventListener('click', () => {
      if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
      else this.calMonth--;
      this._renderCalendar();
      if (window.lucide) window.lucide.createIcons();
    });
    document.getElementById('bmNextMonth').addEventListener('click', () => {
      if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
      else this.calMonth++;
      this._renderCalendar();
      if (window.lucide) window.lucide.createIcons();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('bmOverlay').style.display !== 'none') this.close();
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────
function _formatDuration(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`;
}

function _generateSlots(date, service) {
  const dur = parseInt(service?.duree_minutes || 30);
  const slots = [];
  const taken = []; // En prod : récupérer via API
  let hour = 9, min = 0;
  while (hour < 19) {
    const time = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    slots.push({ time, libre: !taken.includes(time) });
    min += dur;
    if (min >= 60) { hour += Math.floor(min / 60); min %= 60; }
    if (min === 0 && hour > 18) break;
  }
  return slots;
}