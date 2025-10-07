export interface EmailTemplate {
  to: string;
  userName: string;
  subject: string;
  contractInfo?: {
    type: string;
    amount: number;
    expirationDate: string;
    remainingDays?: number;
  };
}

export class EmailService {
  static sendEmail(template: 'expiration' | 'renewal' | 'deposit' | 'withdrawal' | 'welcome' | 'info', data: EmailTemplate) {
    let emailBody = '';
    let emailSubject = data.subject;

    switch (template) {
      case 'expiration':
        emailBody = `Estimado/a ${data.userName},

Su contrato "${data.contractInfo?.type || 'N/A'}" está próximo a vencer.

Detalles del contrato:
- Tipo: ${data.contractInfo?.type || 'N/A'}
- Monto: $${data.contractInfo?.amount?.toLocaleString() || 'N/A'}
- Fecha de vencimiento: ${data.contractInfo?.expirationDate ? new Date(data.contractInfo.expirationDate).toLocaleDateString() : 'N/A'}
- Días restantes: ${data.contractInfo?.remainingDays || 'N/A'}

Por favor, póngase en contacto con nosotros para renovar o gestionar su contrato.

Saludos cordiales,
Equipo de Administración`;
        break;

      case 'renewal':
        emailBody = `Estimado/a ${data.userName},

Le recordamos que su contrato "${data.contractInfo?.type || 'N/A'}" requiere renovación.

Detalles del contrato:
- Tipo: ${data.contractInfo?.type || 'N/A'}
- Monto: $${data.contractInfo?.amount?.toLocaleString() || 'N/A'}
- Fecha de vencimiento: ${data.contractInfo?.expirationDate ? new Date(data.contractInfo.expirationDate).toLocaleDateString() : 'N/A'}

¿Le gustaría renovar su contrato? Por favor, responda a este email para coordinar la renovación.

Saludos cordiales,
Equipo de Administración`;
        break;

      case 'welcome':
        emailBody = `Estimado/a ${data.userName},

Bienvenido/a a nuestro sistema de gestión de contratos.

Este es un mensaje personalizado desde el Panel de Administración.

Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.

Saludos cordiales,
Equipo de Administración`;
        break;

      case 'deposit':
        emailBody = `Estimado/a ${data.userName},

Hemos recibido su solicitud de depósito.

Por favor, proporcione los detalles adicionales necesarios para procesar su solicitud.

Saludos cordiales,
Equipo de Administración`;
        break;

      case 'withdrawal':
        emailBody = `Estimado/a ${data.userName},

Hemos recibido su solicitud de retiro.

Por favor, proporcione los detalles adicionales necesarios para procesar su solicitud.

Saludos cordiales,
Equipo de Administración`;
        break;

      case 'info':
        emailBody = `Estimado/a ${data.userName},

Información de su contrato:

Detalles del contrato:
- Tipo: ${data.contractInfo?.type || 'N/A'}
- Monto: $${data.contractInfo?.amount?.toLocaleString() || 'N/A'}
- Fecha de vencimiento: ${data.contractInfo?.expirationDate ? new Date(data.contractInfo.expirationDate).toLocaleDateString() : 'N/A'}
- Días restantes: ${data.contractInfo?.remainingDays || 'N/A'}

Si tiene alguna pregunta sobre su contrato, no dude en contactarnos.

Saludos cordiales,
Equipo de Administración`;
        break;
    }

    // Crear el enlace mailto
    const mailtoLink = `mailto:${data.to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Abrir el cliente de email
    window.open(mailtoLink);
    
    // También copiar al portapapeles como respaldo
    const emailText = `Para: ${data.to}\nAsunto: ${emailSubject}\n\n${emailBody}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailText).then(() => {
        console.log('Email copiado al portapapeles');
      }).catch(err => {
        console.error('Error copiando al portapapeles:', err);
      });
    }
  }
}
