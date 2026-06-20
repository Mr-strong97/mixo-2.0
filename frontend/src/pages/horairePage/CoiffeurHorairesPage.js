/**
 * CoiffeurHorairesPage.js — MIXO
 * Espace Coiffeur — Horaires & Disponibilités
 * URL : /coiffeur/horaires
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { WeekScheduleGrid }  from '../../components/horaireComponents/WeekScheduleGrid.js';
import { DayScheduleRow }    from '../../components/horaireComponents/DayScheduleRow.js';
import { ExceptionCard }     from '../../components/horaireComponents/ExceptionCard.js';
import { AddExceptionModal } from '../../components/horaireComponents/AddExceptionModal.js';
import { HoraireAPI }        from '../../api/HoraireAPI.js';
import { DisponibiliteAPI }  from '../../api/DisponibiliteAPI.js';
import { requireRole }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';
import { confirmDialog }     from '../../utils/confirmDialog.js';

import '../../styles/horaireStyles/Horaires.css';

export const CoiffeurHorairesPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'hrp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'hrp-main';
    main.innerHTML = `<div class="hrp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let horaires = [];
    let exceptions = [];

    const render = () => {
        main.innerHTML = `
            <div class="hrp-header">
                <h1>Horaires & Disponibilités</h1>
                <p>Définissez vos créneaux d'ouverture et signalez vos indisponibilités.</p>
            </div>

            <section class="hrp-section">
                <h2 class="hrp-section-title"><i data-lucide="calendar-clock"></i> Planning hebdomadaire</h2>
                <div id="hrp-grid"></div>
            </section>

            <section class="hrp-section">
                <div class="hrp-section-header">
                    <h2 class="hrp-section-title"><i data-lucide="calendar-x"></i> Exceptions à venir</h2>
                    <button class="hrp-btn-add" id="hrp-add-exception" type="button">
                        <i data-lucide="plus"></i> Ajouter une exception
                    </button>
                </div>
                <div id="hrp-exceptions"></div>
            </section>
        `;

        main.querySelector('#hrp-grid').appendChild(
            WeekScheduleGrid(horaires, {
                onAdd:    (jour) => openSlotModal(jour, null),
                onEdit:   (h)    => openSlotModal(h.jour_semaine, h),
                onDelete: (h)    => confirmerSuppressionCreneau(h),
            })
        );

        const excContainer = main.querySelector('#hrp-exceptions');
        if (!exceptions.length) {
            excContainer.innerHTML = `<p class="hrp-empty">Aucune exception programmée.</p>`;
        } else {
            exceptions.forEach(exc => excContainer.appendChild(ExceptionCard(exc, confirmerSuppressionException)));
        }

        main.querySelector('#hrp-add-exception').addEventListener('click', openExceptionModal);

        if (window.lucide) window.lucide.createIcons();
    };

    const charger = async () => {
        try {
            [horaires, exceptions] = await Promise.all([
                HoraireAPI.getMesHoraires(),
                DisponibiliteAPI.getMesExceptions(new Date().toISOString().split('T')[0]),
            ]);
            render();
        } catch {
            main.innerHTML = `<div class="hrp-error"><i data-lucide="alert-triangle"></i><p>Erreur de chargement.</p></div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const openSlotModal = (jour, horaireExistant) => {
        document.body.appendChild(
            DayScheduleRow(jour, horaireExistant, async (payload) => {
                if (horaireExistant) {
                    await HoraireAPI.modifierHoraire(horaireExistant.id, payload);
                    showToast('✅ Créneau modifié.');
                } else {
                    await HoraireAPI.creerHoraire(payload);
                    showToast('✅ Créneau ajouté.');
                }
                await charger();
            }, () => {})
        );
    };

    const openExceptionModal = () => {
        document.body.appendChild(
            AddExceptionModal(async (payload) => {
                await DisponibiliteAPI.creerException(payload);
                showToast('✅ Exception ajoutée.');
                await charger();
            }, () => {})
        );
    };

    const confirmerSuppressionCreneau = (horaire) => {
        confirmDialog('Supprimer ce créneau ?', 'Cette action est irréversible.').then((ok) => {
            if (!ok) return;
            HoraireAPI.supprimerHoraire(horaire.id)
                .then(() => { showToast('🗑 Créneau supprimé.'); charger(); })
                .catch(() => showToast('❌ Erreur lors de la suppression.'));
        });
    };

    const confirmerSuppressionException = (exception) => {
        confirmDialog('Supprimer cette exception ?', 'Cette action est irréversible.').then((ok) => {
            if (!ok) return;
            DisponibiliteAPI.supprimerException(exception.id)
                .then(() => { showToast('🗑 Exception supprimée.'); charger(); })
                .catch(() => showToast('❌ Erreur lors de la suppression.'));
        });
    };

    charger();
    return page;
};
