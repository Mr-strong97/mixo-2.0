/**
 * Testimonials.js — Mixo
 * Section "Témoignages" — avis clients & coiffeurs, dans un carrousel
 * horizontal scroll-snap, navigable au doigt (mobile) ou à la souris
 * (glisser-déposer sur desktop).
 */
export const Testimonials = () => {
    const section = document.createElement('section');
    section.className = 'mixo-testimonials mixo-section mixo-section--tinted';
    section.id = 'temoignages';

    const testimonials = [
        {
            role: 'client',
            rating: 5,
            quote: 'J\'ai trouvé mon coiffeur en moins de 5 minutes et le rendez-vous a été confirmé instantanément. Je ne réserve plus que comme ça.',
            name: 'Jordan M.',
            meta: 'Client Mixo · Paris',
            avatar: '/images/mixo4.png'
        },
        {
            role: 'pro',
            rating: 5,
            quote: 'Depuis que je suis sur Mixo, mon agenda est plein et je passe beaucoup moins de temps à gérer mes rendez-vous par téléphone.',
            name: 'Yasmine R.',
            meta: 'Salon Élégance · Lille',
            avatar: null
        },
        {
            role: 'client',
            rating: 4,
            quote: 'L\'application est ultra simple : je vois les disponibilités, les tarifs et les avis avant même de réserver. Un vrai gain de temps.',
            name: 'Karim B.',
            meta: 'Client Mixo · Lyon',
            avatar: null
        },
        {
            role: 'pro',
            rating: 5,
            quote: 'Publier mes prestations a pris dix minutes et j\'ai eu mes premiers nouveaux clients dès la semaine suivante.',
            name: 'Thomas D.',
            meta: 'Barbier indépendant · Bordeaux',
            avatar: null
        },
        {
            role: 'client',
            rating: 5,
            quote: 'Les rappels automatiques m\'évitent d\'oublier mes rendez-vous, et l\'historique me permet de retrouver facilement mon coiffeur préféré.',
            name: 'Manon T.',
            meta: 'Cliente Mixo · Marseille',
            avatar: null
        },
        {
            role: 'pro',
            rating: 5,
            quote: 'L\'historique de mes clientes et leurs préférences m\'aident à personnaliser chaque prestation. La fidélisation est beaucoup plus naturelle.',
            name: 'Inès K.',
            meta: 'Studio Hair Lab · Nantes',
            avatar: null
        }
    ];

    const initials = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2);

    const renderStars = (rating) => Array.from({ length: 5 }, (_, i) =>
        `<i data-lucide="star" class="${i < rating ? 'is-filled' : ''}"></i>`
    ).join('');

    const renderAvatar = (t) => t.avatar
        ? `<span class="mixo-testimonials__avatar" style="background-image:url('${t.avatar}')"></span>`
        : `<span class="mixo-testimonials__avatar mixo-testimonials__avatar--${t.role}">${initials(t.name)}</span>`;

    section.innerHTML = `
        <div class="mixo-container">
            <div class="mixo-section-head" data-animate="fade-up">
                <h2 class="mixo-section-title">Ce que clients et coiffeurs en disent.</h2>
                <p class="mixo-section-subtitle">
                    Des milliers de rendez-vous pris chaque mois — voici quelques retours,
                    côté client comme côté professionnel.
                </p>
            </div>
        </div>

        <div class="mixo-testimonials__track" data-animate="fade-up" data-delay="100">
            ${testimonials.map((t) => `
                <article class="mixo-testimonials__card">
                    <div class="mixo-testimonials__stars">${renderStars(t.rating)}</div>
                    <p class="mixo-testimonials__quote">${t.quote}</p>
                    <div class="mixo-testimonials__author">
                        ${renderAvatar(t)}
                        <div class="mixo-testimonials__author_text">
                            <strong>${t.name}</strong>
                            <span>${t.meta}</span>
                        </div>
                        <span class="mixo-testimonials__badge mixo-testimonials__badge--${t.role}">
                            ${t.role === 'pro' ? 'Coiffeur' : 'Client'}
                        </span>
                    </div>
                </article>
            `).join('')}
        </div>
    `;

    // Glisser-déposer à la souris (desktop) — le scroll-snap natif gère le tactile.
    const track = section.querySelector('.mixo-testimonials__track');
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('is-dragging');
        startX = e.pageX;
        startScroll = track.scrollLeft;
    });

    const stopDrag = () => {
        isDown = false;
        track.classList.remove('is-dragging');
    };
    track.addEventListener('mouseleave', stopDrag);
    track.addEventListener('mouseup', stopDrag);

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        track.scrollLeft = startScroll - (e.pageX - startX) * 1.2;
    });

    return section;
};
