/**
 * Footer.js — MIXO
 * Barre horizontale bas de page.
 * Chaque lien ouvre une modal Bootstrap avec le contenu correspondant.
 */

const MODALS = {
    confidentialite: {
        titre: 'Politique de confidentialité',
        contenu: `
            <p><strong>Mixo</strong> s'engage à protéger vos données personnelles conformément au RGPD.</p>
            <h6 class="mt-3 fw-bold">Données collectées</h6>
            <p>Nom d'utilisateur, adresse email, rôle, historique de rendez-vous.</p>
            <h6 class="mt-3 fw-bold">Utilisation</h6>
            <p>Vos données sont utilisées uniquement pour le fonctionnement de la plateforme. Elles ne sont jamais vendues à des tiers.</p>
            <h6 class="mt-3 fw-bold">Vos droits</h6>
            <p>Accès, rectification, suppression : contactez-nous à <a href="mailto:privacy@mixo.app">privacy@mixo.app</a>.</p>
            <h6 class="mt-3 fw-bold">Conservation</h6>
            <p>Les données sont conservées pendant 3 ans après la dernière activité sur le compte.</p>
        `
    },
    conditions: {
        titre: "Conditions d'utilisation",
        contenu: `
            <p>En utilisant <strong>Mixo</strong>, vous acceptez les conditions suivantes.</p>
            <h6 class="mt-3 fw-bold">Utilisation de la plateforme</h6>
            <p>Mixo est réservé aux particuliers et professionnels de la coiffure. Toute utilisation frauduleuse entraîne la suspension du compte.</p>
            <h6 class="mt-3 fw-bold">Rendez-vous</h6>
            <p>Tout rendez-vous non annulé 24h à l'avance peut entraîner des frais.</p>
            <h6 class="mt-3 fw-bold">Contenu</h6>
            <p>Les avis publiés doivent être honnêtes et respectueux. Mixo se réserve le droit de supprimer tout contenu inapproprié.</p>
            <h6 class="mt-3 fw-bold">Modifications</h6>
            <p>Ces conditions peuvent être mises à jour. Les utilisateurs seront informés par email.</p>
        `
    },
    contact: {
        titre: 'Nous contacter',
        contenu: `
            <div class="d-flex flex-column gap-3">
                <div class="d-flex align-items-center gap-3 p-3 rounded" style="background:#F0F7FF;border:1px solid #DBEAFE;">
                    <i data-lucide="map-pin" style="color:#0A66C2;width:20px;height:20px;flex-shrink:0;"></i>
                    <div>
                        <div class="fw-semibold" style="font-size:0.88rem;">Adresse</div>
                        <div style="font-size:0.82rem;color:#62676B;">Kinshasa, République Démocratique du Congo</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3 p-3 rounded" style="background:#F0F7FF;border:1px solid #DBEAFE;">
                    <i data-lucide="phone" style="color:#0A66C2;width:20px;height:20px;flex-shrink:0;"></i>
                    <div>
                        <div class="fw-semibold" style="font-size:0.88rem;">Téléphone</div>
                        <div style="font-size:0.82rem;color:#62676B;">+243 99 307 1476</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3 p-3 rounded" style="background:#F0F7FF;border:1px solid #DBEAFE;">
                    <i data-lucide="mail" style="color:#0A66C2;width:20px;height:20px;flex-shrink:0;"></i>
                    <div>
                        <div class="fw-semibold" style="font-size:0.88rem;">Email</div>
                        <a href="mailto:contact@mixo.app" style="font-size:0.82rem;color:#0A66C2;">contact@mixo.app</a>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2 mt-2">
                    <span style="font-size:0.82rem;color:#62676B;">Réseaux :</span>
                    ${['instagram','facebook','github','youtube'].map(n => `
                        <div class="nf-social" title="${n}">
                            <i data-lucide="${n}" style="width:16px;height:16px;"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `
    },
    support: {
        titre: 'Support & Aide',
        contenu: `
            <p>Notre équipe est disponible pour vous aider du lundi au vendredi, de 8h à 18h.</p>
            <h6 class="mt-3 fw-bold">Questions fréquentes</h6>
            <div class="accordion accordion-flush" id="faq">
                ${[
                    ['Comment annuler un rendez-vous ?', 'Rendez-vous dans votre espace client → Historique → sélectionnez le rendez-vous → Annuler.'],
                    ['Comment changer mon mot de passe ?', 'Paramètres → Sécurité → Modifier le mot de passe.'],
                    ['Mon compte est suspendu, que faire ?', 'Consultez la page Compte suspendu et soumettez une demande de réactivation.'],
                ].map((faq, i) => `
                    <div class="accordion-item border-0 mb-1">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed py-2 px-3 rounded" style="font-size:0.84rem;background:#F8FAFC;"
                                    type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}">
                                ${faq[0]}
                            </button>
                        </h2>
                        <div id="faq${i}" class="accordion-collapse collapse" data-bs-parent="#faq">
                            <div class="accordion-body py-2 px-3" style="font-size:0.82rem;color:#62676B;">${faq[1]}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3 p-3 rounded" style="background:#F0F7FF;border:1px solid #DBEAFE;">
                <p style="font-size:0.84rem;margin:0;">Besoin d'aide supplémentaire ?
                    <a href="mailto:support@mixo.app" style="color:#0A66C2;font-weight:600;">support@mixo.app</a>
                </p>
            </div>
        `
    }
};

export const Footer = () => {
    const footer = document.createElement('footer');
    footer.className = 'nf-footer';

    footer.innerHTML = `
        <!-- Barre principale -->
        <div class="nf-bar">
            <div class="nf-bar-inner">
                <span class="nf-brand">MIXO</span>
                <span class="nf-copy">© 2026 MIXO — Style Premium</span>
                <nav class="nf-links">
                    <button class="nf-link" data-modal="confidentialite">Confidentialité</button>
                    <span class="nf-sep">·</span>
                    <button class="nf-link" data-modal="conditions">Conditions</button>
                    <span class="nf-sep">·</span>
                    <button class="nf-link" data-modal="contact">Contact</button>
                    <span class="nf-sep">·</span>
                    <button class="nf-link" data-modal="support">Support</button>
                </nav>
            </div>
        </div>

        <!-- Modals Bootstrap -->
        ${Object.entries(MODALS).map(([key, m]) => `
        <div class="modal fade" id="modal-${key}" tabindex="-1" aria-labelledby="modal-${key}-label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content" style="border-radius:16px;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
                    <div class="modal-header" style="border-bottom:1px solid #F0F4F9;padding:20px 24px;">
                        <h5 class="modal-title fw-bold" id="modal-${key}-label" style="font-family:'Montserrat',sans-serif;color:#1A1D20;">
                            ${m.titre}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body" style="padding:24px;font-size:0.88rem;color:#475569;line-height:1.7;">
                        ${m.contenu}
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #F0F4F9;padding:14px 24px;">
                        <button type="button" class="btn btn-sm" data-bs-dismiss="modal"
                            style="background:#0A66C2;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-weight:600;">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `).join('')}
    `;

    // Ouvrir les modals au clic sur les liens
    footer.querySelectorAll('.nf-link[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.modal;
            const el  = footer.querySelector(`#modal-${key}`);
            if (!el) return;
            // Bootstrap Modal
            if (window.bootstrap?.Modal) {
                new window.bootstrap.Modal(el).show();
                setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 100);
            } else {
                // Fallback sans Bootstrap : affichage inline simple
                el.style.display = 'flex';
                el.classList.add('show');
                el.style.backgroundColor = 'rgba(0,0,0,0.5)';
                el.querySelectorAll('[data-bs-dismiss="modal"]').forEach(b => {
                    b.addEventListener('click', () => { el.style.display = 'none'; });
                });
            }
        });
    });

    // Boutons sociaux
    footer.querySelectorAll('.nf-social').forEach(s => {
        s.addEventListener('click', () => {});
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return footer;
};

export default Footer;
