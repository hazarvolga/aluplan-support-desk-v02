/**
 * Aluplan Email Templates
 * Pure HTML — no external template engine needed.
 * All templates follow the same branded layout.
 */

const BRAND_COLOR = '#0EA5E9'; // Sky-500
const LOGO_TEXT = 'Aluplan Destek';

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">${LOGO_TEXT}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Bu e-posta Aluplan Destek sistemi tarafından otomatik gönderilmiştir.<br/>
                Yanıt vermek için talep portalını kullanın.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#334155;line-height:1.6;">${text}</p>`;
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 10px;background:${color};color:#fff;border-radius:6px;font-size:13px;font-weight:600;">${text}</span>`;
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${label}</a>`;
}

function ticketMeta(ticketNumber: string, subject: string, priority: string): string {
  const priorityColors: Record<string, string> = {
    LOW: '#64748b', MEDIUM: '#f59e0b', HIGH: '#ef4444', URGENT: '#dc2626',
  };
  return `
    <div style="background:#f8fafc;border-left:4px solid ${BRAND_COLOR};border-radius:4px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Talep Numarası</p>
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0f172a;">${ticketNumber}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#334155;">${subject}</p>
      ${badge(priority, priorityColors[priority] ?? '#64748b')}
    </div>`;
}

// ─── TEMPLATE EXPORTS ────────────────────────────────────────

export function ticketCreated(data: {
  customerName: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  portalUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `[${data.ticketNumber}] Talebiniz alındı`,
    html: layout('Talebiniz Alındı', `
      ${h1('Talebiniz başarıyla alındı.')}
      ${p(`Merhaba ${data.customerName},`)}
      ${p('Destek talebiniz sistemimize kaydedilmiştir. Ekibimiz en kısa sürede size dönüş yapacaktır.')}
      ${ticketMeta(data.ticketNumber, data.subject, data.priority)}
      ${button(data.portalUrl, 'Talebi Görüntüle')}
    `),
  };
}

export function ticketAssigned(data: {
  agentName: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  customerName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `[${data.ticketNumber}] Atanan Talep: ${data.subject}`,
    html: layout('Talep Atandı', `
      ${h1('Talep size atandı.')}
      ${p(`Merhaba ${data.agentName},`)}
      ${p(`<b>${data.customerName}</b> tarafından oluşturulan aşağıdaki talep size atanmıştır.`)}
      ${ticketMeta(data.ticketNumber, data.subject, data.priority)}
      ${button(data.portalUrl, 'Talebi Yönet')}
    `),
  };
}

export function slaBreachWarning(data: {
  recipientName: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  breachType: 'response' | 'resolve';
  minutesOverdue: number;
  portalUrl: string;
}): { subject: string; html: string } {
  const type = data.breachType === 'response' ? 'Yanıt SLA İhlali' : 'Çözüm SLA İhlali';
  return {
    subject: `🚨 [${data.ticketNumber}] ${type}`,
    html: layout(type, `
      ${h1(`⚠️ SLA İhlali: ${type}`)}
      ${p(`Merhaba ${data.recipientName},`)}
      ${p(`Aşağıdaki talep için ${data.breachType === 'response' ? 'yanıt' : 'çözüm'} SLA süresi <b>${data.minutesOverdue} dakika</b> önce geçmiştir.`)}
      ${ticketMeta(data.ticketNumber, data.subject, data.priority)}
      ${button(data.portalUrl, 'Hemen Müdahale Et')}
    `),
  };
}

export function ticketResolved(data: {
  customerName: string;
  ticketNumber: string;
  subject: string;
  portalUrl: string;
  feedbackUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `[${data.ticketNumber}] Talebiniz çözüldü`,
    html: layout('Talebiniz Çözüldü', `
      ${h1('Talebiniz çözüme kavuşturuldu.')}
      ${p(`Merhaba ${data.customerName},`)}
      ${p(`<b>${data.ticketNumber}</b> numaralı talebiniz çözüldü olarak işaretlenmiştir. 5 gün içinde geri bildirim yapmazsanız talep otomatik kapanacaktır.`)}
      ${p('Memnun kalmadıysanız talebi yeniden açabilirsiniz.')}
      ${button(data.portalUrl, 'Talebi Görüntüle')}
      <a href="${data.feedbackUrl}" style="display:inline-block;margin-top:12px;margin-left:12px;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Değerlendirme Yap</a>
    `),
  };
}

export function newMessage(data: {
  recipientName: string;
  senderName: string;
  ticketNumber: string;
  messagePreview: string;
  portalUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `[${data.ticketNumber}] Yeni mesaj`,
    html: layout('Yeni Mesaj', `
      ${h1('Taleple ilgili yeni bir mesaj var.')}
      ${p(`Merhaba ${data.recipientName},`)}
      ${p(`<b>${data.senderName}</b> mesaj gönderdi:`)}
      <blockquote style="margin:16px 0;padding:12px 16px;background:#f1f5f9;border-left:4px solid #cbd5e1;border-radius:4px;color:#475569;font-style:italic;">${data.messagePreview}</blockquote>
      ${button(data.portalUrl, 'Talebi Görüntüle')}
    `),
  };
}

export function passwordReset(data: {
  recipientName: string;
  newPassword: string;
  portalUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Aluplan Destek - Yeni Şifreniz Oluşturuldu`,
    html: layout('Şifre Sıfırlama', `
      ${h1('Şifreniz başarıyla sıfırlandı.')}
      ${p(`Merhaba ${data.recipientName},`)}
      ${p(`Destek portalı hesabınız için yeni bilgisayar ekranlı bir şifre oluşturduk. Güvenliğiniz için sisteme giriş yaptıktan sonra şifrenizi değiştirmenizi öneririz.`)}
      <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:4px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Geçici Şifreniz</p>
        <p style="margin:0;font-size:24px;font-family:monospace;font-weight:700;letter-spacing:2px;color:#0f172a;">${data.newPassword}</p>
      </div>
      ${button(data.portalUrl, 'Giriş Yap')}
    `),
  };
}
