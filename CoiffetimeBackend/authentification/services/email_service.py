"""
authentification/services/email_service.py — MIXO
"""
from django.core.mail import send_mail
from django.conf import settings


def _html_wrapper(titre, corps, lien=None, label_btn="Continuer"):
    btn = f"""
    <a href="{lien}" style="display:inline-block;background:#1A56DB;color:#fff;
       font-weight:700;letter-spacing:2px;text-transform:uppercase;
       padding:14px 32px;border-radius:10px;text-decoration:none;font-size:0.82rem;">
       {label_btn}
    </a>""" if lien else ""
    return f"""
    <div style="font-family:'Helvetica',sans-serif;max-width:520px;margin:0 auto;
                background:#0B0F1A;padding:40px;border-radius:16px;color:#fff;">
        <h2 style="color:#1A56DB;letter-spacing:3px;text-transform:uppercase;
                   font-size:1rem;margin:0 0 20px;">MIXO</h2>
        <h3 style="color:#fff;font-size:1.1rem;margin:0 0 16px;">{titre}</h3>
        {corps}
        {btn}
        <p style="color:rgba(255,255,255,0.3);font-size:0.72rem;margin-top:28px;
                  border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
            Si vous n'êtes pas à l'origine de cette action, ignorez cet email.
        </p>
    </div>"""


def envoyer_email_verification(utilisateur, token_brut):
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    lien = f"{frontend_url}/verify-email?token={token_brut}"

    # ⚠️  En développement : le lien s'affiche ici dans le terminal
    print(f"\n{'='*60}")
    print(f"📧  EMAIL VÉRIFICATION — @{utilisateur.username}")
    print(f"🔗  LIEN : {lien}")
    print(f"{'='*60}\n")

    corps = f"""
    <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:20px;">
        Bonjour <strong>@{utilisateur.username}</strong>,<br>
        Bienvenue sur Mixo ! Cliquez ci-dessous pour vérifier votre adresse email
        et activer votre compte. Ce lien expire dans <strong>24 heures</strong>.
    </p>"""

    try:
        send_mail(
            subject="Mixo — Vérifiez votre adresse email",
            message=f"Vérifiez votre email : {lien}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@mixo.app'),
            recipient_list=[utilisateur.email],
            html_message=_html_wrapper("Vérification de votre email", corps, lien, "Vérifier mon email"),
            fail_silently=False,
        )
    except Exception as e:
        print(f"  Email non envoyé (backend console actif) : {e}")


def envoyer_email_reset_password(utilisateur, token_brut):
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    lien = f"{frontend_url}/reset-password?token={token_brut}"

    print(f"\n{'='*60}")
    print(f"  RESET MOT DE PASSE — @{utilisateur.username}")
    print(f"🔗  LIEN : {lien}")
    print(f"{'='*60}\n")

    corps = f"""
    <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:20px;">
        Bonjour <strong>@{utilisateur.username}</strong>,<br>
        Une demande de réinitialisation de mot de passe a été effectuée.
        Ce lien expire dans <strong>1 heure</strong>.
    </p>"""

    try:
        send_mail(
            subject="Mixo — Réinitialisation de mot de passe",
            message=f"Réinitialisez votre mot de passe : {lien}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@mixo.app'),
            recipient_list=[utilisateur.email],
            html_message=_html_wrapper("Réinitialisation de mot de passe", corps, lien, "Réinitialiser"),
            fail_silently=False,
        )
    except Exception as e:
        print(f"  Email reset non envoyé : {e}")


def envoyer_email_suspension(utilisateur, raison, duree=None):
    """Email envoyé à l'utilisateur lors d'une suspension."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    lien = f"{frontend_url}/compte-suspendu"

    duree_txt = f"<br>Durée : <strong>{duree}</strong>" if duree else ""

    print(f"\n{'='*60}")
    print(f"  SUSPENSION — @{utilisateur.username} | Raison : {raison}")
    print(f"{'='*60}\n")

    corps = f"""
    <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px;">
        Bonjour <strong>@{utilisateur.username}</strong>,<br>
        Votre compte Mixo a été temporairement suspendu.
    </p>
    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
                border-radius:10px;padding:16px;margin-bottom:20px;">
        <strong style="color:#EF4444;">Motif :</strong>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">{raison}</p>
        {f'<p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:0.85rem;">{duree_txt}</p>' if duree else ''}
    </div>
    <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">
        Vous pouvez soumettre une demande de réactivation en cliquant ci-dessous.
    </p>"""

    try:
        send_mail(
            subject="Mixo — Votre compte a été suspendu",
            message=f"Votre compte a été suspendu. Motif : {raison}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@mixo.app'),
            recipient_list=[utilisateur.email],
            html_message=_html_wrapper("Compte suspendu", corps, lien, "Demander une réactivation"),
            fail_silently=False,
        )
    except Exception as e:
        print(f"  Email suspension non envoyé : {e}")


def envoyer_email_bannissement(utilisateur, raison):
    """Email envoyé à l'utilisateur lors d'un bannissement définitif."""
    print(f"\n{'='*60}")
    print(f" BANNISSEMENT — @{utilisateur.username} | Raison : {raison}")
    print(f"{'='*60}\n")

    corps = f"""
    <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px;">
        Bonjour <strong>@{utilisateur.username}</strong>,<br>
        Votre compte Mixo a été définitivement banni.
    </p>
    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
                border-radius:10px;padding:16px;margin-bottom:16px;">
        <strong style="color:#EF4444;">Motif :</strong>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">{raison}</p>
    </div>
    <p style="color:rgba(255,255,255,0.4);font-size:0.82rem;">
        Cette décision est définitive. Aucune demande de réactivation n'est possible.
    </p>"""

    try:
        send_mail(
            subject="Mixo — Votre compte a été banni",
            message=f"Votre compte a été banni. Motif : {raison}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@mixo.app'),
            recipient_list=[utilisateur.email],
            html_message=_html_wrapper("Compte banni", corps),
            fail_silently=False,
        )
    except Exception as e:
        print(f"  Email bannissement non envoyé : {e}")