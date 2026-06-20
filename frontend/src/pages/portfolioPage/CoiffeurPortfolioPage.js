/**
 * CoiffeurPortfolioPage.js — MIXO
 * Espace Coiffeur — Portfolio / Galerie
 * URL : /coiffeur/portfolio
 */
import { Navbar }              from '../../components/navbars/Navbar.js';
import { Footer }              from '../../components/Footer.js';
import { PortfolioGrid }       from '../../components/portfolioComponents/PortfolioGrid.js';
import { PortfolioUploadZone } from '../../components/portfolioComponents/PortfolioUploadZone.js';
import { PortfolioLightbox }   from '../../components/portfolioComponents/PortfolioLightbox.js';
import { PortfolioAPI }        from '../../api/PortfolioAPI.js';
import { requireRole }         from '../../utils/AuthGuard.js';
import { showToast }           from '../../utils/toast.js';
import { confirmDialog }       from '../../utils/confirmDialog.js';

import '../../styles/portfolioStyles/Portfolio.css';

export const CoiffeurPortfolioPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'pfp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'pfp-main';
    main.innerHTML = `<div class="pfp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let medias = [];

    const render = () => {
        main.innerHTML = `
            <div class="pfp-header">
                <h1>Mon Portfolio</h1>
                <p>Montrez vos plus belles réalisations à vos futurs clients (${medias.length}/30).</p>
            </div>
            <div id="pfp-upload"></div>
            <div id="pfp-grid"></div>
        `;

        main.querySelector('#pfp-upload').appendChild(PortfolioUploadZone(handleFilesSelected));
        main.querySelector('#pfp-grid').appendChild(
            PortfolioGrid(medias, {
                onView:       (m) => PortfolioLightbox(medias, medias.findIndex(x => x.id === m.id)),
                onToggleAvant:(m) => toggleAvant(m),
                onDelete:     (m) => confirmerSuppression(m),
                onReorder:    (ids) => reordonner(ids),
            })
        );
    };

    const charger = async () => {
        try {
            medias = await PortfolioAPI.getMonPortfolio();
            render();
        } catch {
            main.innerHTML = `<div class="pfp-error"><i data-lucide="alert-triangle"></i><p>Erreur de chargement du portfolio.</p></div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const handleFilesSelected = async (files) => {
        showToast(`⏳ Envoi de ${files.length} fichier(s)…`);
        for (const file of Array.from(files)) {
            try {
                await PortfolioAPI.ajouterMedia(file);
            } catch (e) {
                showToast(`❌ Échec pour ${file.name} : ${e.response?.data?.error || e.message}`);
            }
        }
        showToast('✅ Galerie mise à jour !');
        charger();
    };

    const toggleAvant = async (media) => {
        try {
            await PortfolioAPI.modifierMedia(media.id, { mis_en_avant: !media.mis_en_avant });
            charger();
        } catch {
            showToast('❌ Erreur lors de la mise à jour.');
        }
    };

    const confirmerSuppression = (media) => {
        confirmDialog('Supprimer cette réalisation ?', 'Cette action est irréversible.').then((ok) => {
            if (!ok) return;
            PortfolioAPI.supprimerMedia(media.id)
                .then(() => { showToast('🗑 Réalisation supprimée.'); charger(); })
                .catch(() => showToast('❌ Erreur lors de la suppression.'));
        });
    };

    const reordonner = async (ids) => {
        try {
            await PortfolioAPI.reordonner(ids);
            charger();
        } catch {
            showToast('❌ Erreur lors du réordonnancement.');
        }
    };

    charger();
    return page;
};
