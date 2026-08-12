/**
 * CoiffeurProfilPage.js — MIXO
 * Page publique d'un coiffeur : profil complet, services, avis, horaires.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { ServiceCard } from '../../components/servicesComponents/ServiceCard.js';
import { ReservationSecuriseeCard } from '../../components/servicesComponents/ReservationSecuriseeCard.js';
import { RatingStarsBar } from '../../components/avisComponents/RatingStarsBar.js';
import { AvisCard } from '../../components/avisComponents/AvisCard.js';
import { ServiceAPI } from '../../api/ServiceAPI.js';
import { AvisAPI } from '../../api/AvisAPI.js';
import { ProfilUtilisateur, api } from '../../api/axiosConfig.js';
import { showToast } from '../../utils/toast.js';
import { attachLiveRefresh } from '../../utils/liveRefresh.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/avisStyles/Avis.css';
import '../../styles/profilStyles/CoiffeurProfilPage.css';

export const CoiffeurProfilPage = ({ username = '', id = '' } = {}) => {
    const page = document.createElement('div');
    page.className = 'cpp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'cpp-main';
    main.innerHTML = `<div class="cpp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const state = {
        profil: null,
        services: [],
        avis: [],
        avisStats: { note_moyenne: 0, total: 0, repartition: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        horaires: [],
        exceptions: [],
        loading: true,
        error: null,
    };

    const fetchSafe = async (promise) => {
        try {
            return await promise;
        } catch (error) {
            return { __error: error };
        }
    };

    const loadData = async () => {
        const profilRes = await fetchSafe(ProfilUtilisateur.getUserProfile('coiffeur', id));

        if (profilRes.__error) {
            const status = profilRes.__error?.response?.status;
            if (status && status !== 404) {
                state.error = "Profil introuvable ou inaccessible.";
                state.loading = false;
                render();
                return false;
            }

            state.profil = createFallbackProfil(id, username);
            state.loading = false;
            render();
            return false;
        } else {
            state.profil = profilRes;
        }

        const [servicesRes, avisRes, horairesRes, exceptionsRes] = await Promise.all([
            fetchSafe(ServiceAPI.getServices({ coiffeur_id: id, page_size: 8 })),
            fetchSafe(AvisAPI.getAvisCoiffeur(id)),
            fetchSafe(api.get(`planning/planning/${id}/`).then(r => r.data)),
            fetchSafe(api.get(`planning/disponibilites/${id}/`).then(r => r.data)),
        ]);

        if (servicesRes && !servicesRes.__error) {
            state.services = Array.isArray(servicesRes)
                ? servicesRes
                : Array.isArray(servicesRes.resultats)
                    ? servicesRes.resultats
                    : Array.isArray(servicesRes.results)
                        ? servicesRes.results
                        : [];
        }

        if (avisRes && !avisRes.__error) {
            state.avis = Array.isArray(avisRes.avis) ? avisRes.avis : [];
            state.avisStats = avisRes.stats || state.avisStats;
        }

        if (horairesRes && !horairesRes.__error) {
            state.horaires = Array.isArray(horairesRes) ? horairesRes : [];
        }

        if (exceptionsRes && !exceptionsRes.__error) {
            state.exceptions = Array.isArray(exceptionsRes) ? exceptionsRes : [];
        }

        state.loading = false;
        render();
        return true;
    };

    const render = () => {
        if (state.loading) {
            main.innerHTML = `<div class="cpp-loader"><div class="mxo-spinner"></div></div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        if (state.error) {
            main.innerHTML = `
                <div class="cpp-error">
                    <i data-lucide="alert-triangle"></i>
                    <h1>Profil indisponible</h1>
                    <p>${escapeHtml(state.error)}</p>
                    <button class="cpp-btn cpp-btn-primary" id="cpp-back-error" type="button">Retour au catalogue</button>
                </div>`;
            main.querySelector('#cpp-back-error')?.addEventListener('click', () => window.navigate?.('/services'));
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const profil = state.profil || {};
        const user = profil.utilisateur || {};
        const displayName = user.username || username || 'Coiffeur';
        const initials = displayName.substring(0, 2).toUpperCase();
        const noteMoyenne = Number(state.avisStats?.note_moyenne || profil.note_moyenne || 0);
        const totalAvis = Number(state.avisStats?.total || 0);
        const specialite = profil.specialite || 'Coiffeur professionnel';
        const bio = profil.bio || 'Ce professionnel n’a pas encore publié de description détaillée.';
        const email = user.email || 'Non renseigné';
        const telephone = profil.telephone || 'Non renseigné';
        const adresse = profil.adresse || 'Non renseignée';
        const membresDepuis = user.date_joined ? new Date(user.date_joined).getFullYear() : null;
        const langues = 'Français';

        main.innerHTML = `
            <div class="cpp-shell">
                <section class="cpp-hero">
                    <div class="cpp-hero-top">
                        <button class="cpp-back-btn" id="cpp-back" type="button" aria-label="Retour">
                            <i data-lucide="arrow-left"></i>
                        </button>
                        <div class="cpp-hero-main">
                            <div class="cpp-avatar">${escapeHtml(initials)}</div>
                            <div class="cpp-identity">
                                <h1 class="cpp-title">${escapeHtml(displayName)}</h1>
                                <div class="cpp-hero-meta">
                                    <span class="cpp-rating">
                                        <i data-lucide="star" class="cpp-star"></i>
                                        ${formatNote(noteMoyenne)} (${totalAvis} avis)
                                    </span>
                                    ${profil.est_verifie ? `<span class="cpp-pill cpp-pill-success"><i data-lucide="badge-check"></i> Maître Artisan Certifié</span>` : `<span class="cpp-pill cpp-pill-warn"><i data-lucide="shield-alert"></i> Profil en cours de vérification</span>`}
                                </div>
                            </div>
                        </div>
                        <div class="cpp-hero-actions">
                            <button class="cpp-btn cpp-btn-primary" id="cpp-scroll-services" type="button"><i data-lucide="scissors"></i> Voir les prestations</button>
                            <button class="cpp-btn cpp-btn-ghost" id="cpp-scroll-avis" type="button"><i data-lucide="message-square"></i> Lire les avis</button>
                            <button class="cpp-btn cpp-btn-share" id="cpp-share" type="button"><i data-lucide="share-2"></i> Partager</button>
                        </div>
                    </div>

                    <div class="cpp-hero-grid">
                        <article class="cpp-about-card">
                            <div class="cpp-card-head">
                                <span class="cpp-card-label">Présentation</span>
                                <span class="cpp-card-chip">${escapeHtml(specialite)}</span>
                            </div>
                            <p class="cpp-about-text">${escapeHtml(bio)}</p>
                            <div class="cpp-about-meta">
                                <span><i data-lucide="globe"></i> ${escapeHtml(langues)}</span>
                                <span><i data-lucide="phone"></i> ${escapeHtml(telephone)}</span>
                                <span><i data-lucide="mail"></i> ${escapeHtml(email)}</span>
                                <span><i data-lucide="map-pin"></i> ${escapeHtml(adresse)}</span>
                                ${membresDepuis ? `<span><i data-lucide="calendar-days"></i> Sur la plateforme depuis ${membresDepuis}</span>` : ''}
                            </div>
                        </article>

                        <div class="cpp-stats-grid">
                            ${statCard('Services', state.services.length, 'scissors', 'cpp-stat-blue')}
                            ${statCard('Avis', totalAvis, 'star', 'cpp-stat-amber')}
                            ${statCard('Note', formatNote(noteMoyenne), 'badge-check', 'cpp-stat-green')}
                            ${statCard('Disponibilité', state.horaires.length ? 'Active' : 'Non renseignée', 'clock-3', 'cpp-stat-slate')}
                        </div>
                    </div>
                </section>

                <div class="cpp-layout">
                    <div class="cpp-content">
                        <section class="cpp-section" id="cpp-services-section">
                            <div class="cpp-section-header">
                                <div>
                                    <h2 class="cpp-section-title">Services réservables</h2>
                                </div>
                                <span class="cpp-section-count">${state.services.length} prestation${state.services.length > 1 ? 's' : ''}</span>
                            </div>
                            <div class="cpp-service-grid">
                                ${state.services.length
                                    ? ''
                                    : `<div class="cpp-empty-block"><i data-lucide="scissors"></i><p>Aucune prestation disponible pour le moment.</p></div>`
                                }
                            </div>
                        </section>

                        <section class="cpp-section" id="cpp-avis-section">
                            <div class="cpp-section-header">
                                <div>
                                    <h2 class="cpp-section-title">Avis clients</h2>
                                </div>
                                <span class="cpp-section-count">${totalAvis} retour${totalAvis > 1 ? 's' : ''}</span>
                            </div>
                            <div class="cpp-rating-panel">
                                ${RatingStarsBar(state.avisStats)}
                            </div>
                            <div class="cpp-avis-list">
                                ${state.avis.length
                                    ? ''
                                    : `<div class="cpp-empty-block"><i data-lucide="message-square"></i><p>Aucun avis publié pour le moment.</p></div>`
                                }
                            </div>
                        </section>

                        <section class="cpp-section">
                            <div class="cpp-section-header">
                                <div>
                                    <h2 class="cpp-section-title">Horaires hebdomadaires</h2>
                                </div>
                                <span class="cpp-section-count">${state.horaires.length} créneau${state.horaires.length > 1 ? 'x' : ''}</span>
                            </div>
                            <div class="cpp-schedule-grid">
                                ${buildScheduleCards(state.horaires)}
                            </div>
                        </section>

                        <section class="cpp-section">
                            <div class="cpp-section-header">
                                <div>
                                    <h2 class="cpp-section-title">Disponibilités à venir</h2>
                                </div>
                                <span class="cpp-section-count">${state.exceptions.length} événement${state.exceptions.length > 1 ? 's' : ''}</span>
                            </div>
                            <div class="cpp-exception-list">
                                ${buildExceptions(state.exceptions)}
                            </div>
                        </section>
                    </div>

                    <aside class="cpp-sidebar">
                        ${ReservationSecuriseeCard("Annulation gratuite jusqu'à 24h avant.")}

                        <article class="cpp-side-card">
                            <div class="cpp-side-head">
                                <span class="cpp-card-label">Coordonnées</span>
                                ${profil.est_verifie ? `<span class="cpp-pill cpp-pill-success"><i data-lucide="badge-check"></i> Vérifié</span>` : ''}
                            </div>
                            <div class="cpp-contact-list">
                                <div class="cpp-contact-row"><i data-lucide="phone"></i><span>${escapeHtml(telephone)}</span></div>
                                <div class="cpp-contact-row"><i data-lucide="mail"></i><span>${escapeHtml(email)}</span></div>
                                <div class="cpp-contact-row"><i data-lucide="map-pin"></i><span>${escapeHtml(adresse)}</span></div>
                            </div>
                        </article>

                        <article class="cpp-side-card">
                            <div class="cpp-side-head">
                                <span class="cpp-card-label">Accès rapide</span>
                            </div>
                            <div class="cpp-side-actions">
                                <button class="cpp-btn cpp-btn-primary" id="cpp-side-services" type="button"><i data-lucide="scissors"></i> Réserver une prestation</button>
                                <button class="cpp-btn cpp-btn-ghost" id="cpp-side-avis" type="button"><i data-lucide="message-square"></i> Voir les avis</button>
                            </div>
                        </article>
                    </aside>
                </div>
            </div>
        `;

        const serviceGrid = main.querySelector('.cpp-service-grid');
        if (state.services.length) {
            state.services.forEach(service => serviceGrid.appendChild(ServiceCard(service)));
        }

        const avisList = main.querySelector('.cpp-avis-list');
        if (state.avis.length) {
            state.avis.forEach(a => avisList.appendChild(AvisCard(a)));
        }

        main.querySelector('#cpp-back')?.addEventListener('click', () => {
            if (window.history.length > 1) window.history.back();
            else window.navigate?.('/services');
        });
        main.querySelector('#cpp-scroll-services')?.addEventListener('click', () => scrollToSection('cpp-services-section'));
        main.querySelector('#cpp-scroll-avis')?.addEventListener('click', () => scrollToSection('cpp-avis-section'));
        main.querySelector('#cpp-side-services')?.addEventListener('click', () => scrollToSection('cpp-services-section'));
        main.querySelector('#cpp-side-avis')?.addEventListener('click', () => scrollToSection('cpp-avis-section'));
        main.querySelector('#cpp-share')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast('🔗 Lien copié dans le presse-papiers !');
            } catch {
                showToast('Impossible de copier le lien.');
            }
        });

        if (username && user.username && username !== user.username && !window.location.pathname.startsWith('/profil/')) {
            window.history.replaceState({}, '', `/profil/${user.username}/${id}`);
        }

        if (window.lucide) window.lucide.createIcons();
    };

    window.addEventListener('mixo:profile-updated', loadData);
    const previousCleanup = window.__mixoPageCleanup;
    window.__mixoPageCleanup = () => {
        window.removeEventListener('mixo:profile-updated', loadData);
        if (typeof previousCleanup === 'function') previousCleanup();
    };
    attachLiveRefresh(loadData, { intervalMs: 15000, stopWhenFalse: true });
    return page;
};

function createFallbackProfil(id, username) {
    return {
        utilisateur: {
            id,
            username: username || 'Coiffeur',
            email: '',
            first_name: '',
            last_name: '',
            statut: '',
            date_joined: null,
        },
        specialite: '',
        bio: '',
        sexe: '',
        telephone: '',
        adresse: '',
        note_moyenne: 0,
        est_verifie: false,
    };
}

function buildScheduleCards(horaires = []) {
    const jours = [
        { val: 0, label: 'Lundi' },
        { val: 1, label: 'Mardi' },
        { val: 2, label: 'Mercredi' },
        { val: 3, label: 'Jeudi' },
        { val: 4, label: 'Vendredi' },
        { val: 5, label: 'Samedi' },
        { val: 6, label: 'Dimanche' },
    ];

    return jours.map(jour => {
        const items = horaires.filter(h => h.jour_semaine === jour.val);
        return `
            <article class="cpp-day-card">
                <span class="cpp-day-name">${jour.label}</span>
                <div class="cpp-day-slots">
                    ${items.length
                        ? items.map(h => `<span class="cpp-day-slot ${h.actif ? '' : 'is-muted'}">${formatTime(h.heure_debut)} - ${formatTime(h.heure_fin)}</span>`).join('')
                        : `<span class="cpp-day-slot is-muted">Fermé</span>`
                    }
                </div>
            </article>`;
    }).join('');
}

function buildExceptions(exceptions = []) {
    if (!exceptions.length) {
        return `<div class="cpp-empty-block"><i data-lucide="calendar-x"></i><p>Aucune exception programmée.</p></div>`;
    }

    return exceptions.slice(0, 6).map(exc => {
        const dateFormatted = new Date(exc.date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });

        return `
            <article class="cpp-exception-card ${exc.disponible ? 'is-open' : 'is-closed'}">
                <div class="cpp-exception-icon">
                    <i data-lucide="${exc.disponible ? 'door-open' : 'door-closed'}"></i>
                </div>
                <div class="cpp-exception-content">
                    <span class="cpp-exception-date">${dateFormatted}</span>
                    <span class="cpp-exception-label">${escapeHtml(exc.categorie_label || exc.categorie)}</span>
                    ${exc.motif ? `<p class="cpp-exception-motif">${escapeHtml(exc.motif)}</p>` : ''}
                </div>
                <span class="cpp-exception-badge">${exc.disponible ? 'Ouvert' : 'Indisponible'}</span>
            </article>`;
    }).join('');
}

function statCard(label, value, icon, variant = '') {
    return `
        <article class="cpp-stat-card ${variant}">
            <div class="cpp-stat-copy">
                <span class="cpp-stat-label">${escapeHtml(label)}</span>
                <span class="cpp-stat-value">${escapeHtml(String(value))}</span>
            </div>
            <div class="cpp-stat-icon"><i data-lucide="${icon}"></i></div>
        </article>`;
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatNote(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return '0.0';
    return n.toFixed(1);
}

function formatTime(value) {
    return String(value || '').slice(0, 5);
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
