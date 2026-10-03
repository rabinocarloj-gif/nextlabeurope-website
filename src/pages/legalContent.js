// Testi legali del sito. Per modificarli basta cambiare le frasi qui sotto.
// Ogni sezione: { h: titolo, p: [paragrafi], ul: [elenco puntato] }

export const UPDATED = { it: '3 ottobre 2026', en: '3 October 2026' };

const ORG_IT = 'Next Lab Europe APS, Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, Scala A, Piano Secondo, 48022 Lugo (RA) – C.F. 92105040395 – Repertorio RUNTS n. 178511';
const ORG_EN = 'Next Lab Europe APS, Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, Scala A, Piano Secondo, 48022 Lugo (RA), Italy – Tax code 92105040395 – RUNTS registration no. 178511';

export const privacy = {
  it: {
    title: 'Informativa sulla privacy',
    intro: "Questa informativa spiega come Next Lab Europe APS tratta i dati personali di chi visita il sito www.nextlabeurope.eu, di chi ci scrive e di chi chiede di aderire all'associazione, ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003.",
    sections: [
      { h: '1. Titolare del trattamento', p: [ORG_IT + '.', 'Per qualsiasi questione relativa ai tuoi dati puoi scrivere a info@nextlabeurope.eu.'] },
      { h: '2. Quali dati trattiamo', ul: [
        "Dati di navigazione: quando visiti il sito, i server del fornitore di hosting registrano automaticamente alcuni dati tecnici (indirizzo IP, data e ora della richiesta, pagina visitata, tipo di browser e dispositivo). Servono solo al funzionamento e alla sicurezza del sito. Non usiamo strumenti di statistica né cookie di profilazione (vedi la Cookie Policy).",
        "Dati che ci invii volontariamente: nome, indirizzo email, oggetto e testo del messaggio quando usi il modulo contatti o scrivi a info@nextlabeurope.eu.",
        "Dati per l'adesione all'associazione: i dati richiesti nella domanda di adesione (dati anagrafici, codice fiscale, recapiti, firma) e, per chi presta attività di volontariato, i dati necessari all'iscrizione nel registro dei volontari e alla relativa copertura assicurativa.",
      ] },
      { h: '3. Perché li trattiamo e su quale base giuridica', ul: [
        "Far funzionare il sito e proteggerlo da abusi: legittimo interesse del Titolare (art. 6.1.f GDPR).",
        "Rispondere alle tue richieste di informazioni o di collaborazione: esecuzione di misure richieste dall'interessato (art. 6.1.b GDPR).",
        "Valutare la domanda di adesione e gestire il rapporto associativo (libro soci, quote, convocazioni e comunicazioni ai soci, registro dei volontari, assicurazione dei volontari): esecuzione del rapporto associativo (art. 6.1.b GDPR) e adempimento di obblighi di legge previsti per gli Enti del Terzo Settore dal D.Lgs. 117/2017 (art. 6.1.c GDPR).",
        "Adempiere a obblighi amministrativi, contabili e fiscali: obbligo di legge (art. 6.1.c GDPR).",
        "Accertare, esercitare o difendere un diritto in sede giudiziaria: legittimo interesse del Titolare (art. 6.1.f GDPR).",
      ] },
      { h: '4. È obbligatorio fornire i dati?', p: ["Fornire i dati di contatto è facoltativo, ma senza di essi non possiamo risponderti. I dati richiesti nella domanda di adesione sono necessari: senza di essi non è possibile valutare la domanda né iscriverti all'associazione."] },
      { h: '5. Come trattiamo i dati', p: ["I dati sono trattati con strumenti informatici e, per la documentazione cartacea, con modalità manuali, adottando misure tecniche e organizzative adeguate a proteggerli da accessi non autorizzati, perdita o distruzione. Vi accedono solo i componenti degli organi dell'associazione e le persone da essa incaricate, nei limiti di quanto necessario. Non effettuiamo profilazione né decisioni automatizzate."] },
      { h: '6. A chi possono essere comunicati', p: ['I dati non vengono venduti né diffusi. Possono essere trattati, per conto dell\'associazione e solo per le finalità indicate, da:'], ul: [
        'Vercel Inc. (hosting del sito);',
        'Aruba S.p.A. (servizio di posta elettronica);',
        'Google (servizio Google Drive, per l\'archiviazione dei documenti associativi);',
        'consulenti amministrativi e fiscali dell\'associazione;',
        'la compagnia assicurativa che copre i volontari, limitatamente ai dati necessari;',
        'autorità ed enti pubblici, quando previsto dalla legge (per esempio in relazione al RUNTS).',
      ] },
      { h: '7. Trasferimento dei dati fuori dall\'Unione Europea', p: ["Alcuni fornitori (Vercel Inc. e Google) hanno sede negli Stati Uniti o possono trattare dati in tale Paese. Il trasferimento avviene sulla base della decisione di adeguatezza della Commissione Europea relativa all'EU-U.S. Data Privacy Framework, al quale tali fornitori aderiscono, o, in alternativa, delle Clausole Contrattuali Standard approvate dalla Commissione."] },
      { h: '8. Per quanto tempo li conserviamo', ul: [
        'Dati di navigazione: per il tempo tecnico previsto dal fornitore di hosting per il funzionamento e la sicurezza del servizio.',
        "Messaggi e richieste di contatto: 12 mesi dall'ultima comunicazione, salvo che la richiesta dia origine a un rapporto con l'associazione.",
        'Domande di adesione non accolte: 12 mesi dalla decisione.',
        "Dati di soci e volontari: per tutta la durata del rapporto associativo e per 10 anni dalla sua cessazione, per adempiere agli obblighi di legge e tutelare i diritti dell'associazione.",
        'Documentazione amministrativa e contabile: 10 anni, come previsto dalla legge.',
      ], p2: ['Trascorsi questi termini, i dati vengono cancellati o resi anonimi.'] },
      { h: '9. I tuoi diritti', p: ['In qualsiasi momento puoi chiedere di:'], ul: [
        'accedere ai tuoi dati e riceverne copia (art. 15);',
        'correggerli o completarli (art. 16);',
        'cancellarli, quando ne ricorrono i presupposti (art. 17);',
        'limitarne il trattamento (art. 18);',
        'riceverli in un formato strutturato o trasferirli ad altro titolare (art. 20);',
        'opporti al trattamento basato sul legittimo interesse (art. 21);',
        'revocare il consenso, se prestato, senza pregiudicare la liceità del trattamento precedente.',
      ], p2: ["Per esercitare i tuoi diritti scrivi a info@nextlabeurope.eu: risponderemo entro un mese. Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it)."] },
      { h: '10. Modifiche a questa informativa', p: ["L'informativa può essere aggiornata, per esempio in caso di nuove attività o di modifiche normative. La versione in vigore è sempre pubblicata su questa pagina, con la data dell'ultimo aggiornamento."] },
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro: 'This notice explains how Next Lab Europe APS processes the personal data of visitors to www.nextlabeurope.eu, of people who contact us and of people who apply to join the association, in accordance with Articles 13 and 14 of Regulation (EU) 2016/679 (GDPR) and Italian Legislative Decree 196/2003.',
    sections: [
      { h: '1. Data Controller', p: [ORG_EN + '.', 'For any question about your data, you can write to info@nextlabeurope.eu.'] },
      { h: '2. What data we process', ul: [
        'Browsing data: when you visit the site, the hosting provider\'s servers automatically record some technical data (IP address, date and time of the request, page visited, browser and device type). It is used only to run and secure the site. We do not use analytics tools or profiling cookies (see the Cookie Policy).',
        'Data you send us voluntarily: name, email address, subject and message when you use the contact form or write to info@nextlabeurope.eu.',
        'Membership data: the data requested in the membership application (personal details, tax code, contact details, signature) and, for volunteers, the data needed for the volunteer register and the related insurance cover.',
      ] },
      { h: '3. Why we process it and on what legal basis', ul: [
        'Running the site and protecting it from abuse: legitimate interest of the Controller (Art. 6.1.f GDPR).',
        'Answering your requests for information or collaboration: steps taken at the request of the data subject (Art. 6.1.b GDPR).',
        'Assessing membership applications and managing the membership relationship (members\' register, fees, meetings and communications to members, volunteer register, volunteer insurance): performance of the membership relationship (Art. 6.1.b GDPR) and compliance with the legal obligations of Third Sector Entities under Italian Legislative Decree 117/2017 (Art. 6.1.c GDPR).',
        'Complying with administrative, accounting and tax obligations: legal obligation (Art. 6.1.c GDPR).',
        'Establishing, exercising or defending legal claims: legitimate interest of the Controller (Art. 6.1.f GDPR).',
      ] },
      { h: '4. Is providing data mandatory?', p: ['Providing contact data is optional, but without it we cannot reply to you. The data requested in the membership application is necessary: without it we cannot assess the application or register you as a member.'] },
      { h: '5. How we process data', p: ['Data is processed electronically and, for paper documents, manually, with appropriate technical and organisational measures to protect it from unauthorised access, loss or destruction. Only members of the association\'s bodies and people authorised by it have access, as far as necessary. We do not carry out profiling or automated decision-making.'] },
      { h: '6. Who may receive the data', p: ['Data is never sold or made public. It may be processed on behalf of the association, and only for the purposes above, by:'], ul: [
        'Vercel Inc. (website hosting);',
        'Aruba S.p.A. (email service);',
        'Google (Google Drive, for storing association documents);',
        'the association\'s administrative and tax advisers;',
        'the insurance company covering volunteers, limited to the data required;',
        'public authorities and bodies, where required by law (for example in relation to the RUNTS register).',
      ] },
      { h: '7. Transfers outside the European Union', p: ['Some providers (Vercel Inc. and Google) are based in, or may process data in, the United States. Transfers rely on the European Commission\'s adequacy decision for the EU-U.S. Data Privacy Framework, to which these providers adhere, or alternatively on the Standard Contractual Clauses approved by the Commission.'] },
      { h: '8. How long we keep data', ul: [
        'Browsing data: for the technical period set by the hosting provider to run and secure the service.',
        'Messages and contact requests: 12 months from the last communication, unless the request leads to a relationship with the association.',
        'Membership applications not accepted: 12 months from the decision.',
        'Members\' and volunteers\' data: for the whole duration of the membership and for 10 years after it ends, to meet legal obligations and protect the association\'s rights.',
        'Administrative and accounting records: 10 years, as required by law.',
      ], p2: ['After these periods, data is deleted or anonymised.'] },
      { h: '9. Your rights', p: ['At any time you may ask to:'], ul: [
        'access your data and receive a copy (Art. 15);',
        'correct or complete it (Art. 16);',
        'have it erased, where the conditions apply (Art. 17);',
        'restrict its processing (Art. 18);',
        'receive it in a structured format or have it transferred to another controller (Art. 20);',
        'object to processing based on legitimate interest (Art. 21);',
        'withdraw consent, where given, without affecting the lawfulness of prior processing.',
      ], p2: ['To exercise your rights, write to info@nextlabeurope.eu: we will reply within one month. You also have the right to lodge a complaint with the Italian Data Protection Authority (www.garanteprivacy.it).'] },
      { h: '10. Changes to this notice', p: ['This notice may be updated, for example when new activities start or the law changes. The current version is always published on this page, with the date of the last update.'] },
    ],
  },
};

export const cookie = {
  it: {
    title: 'Cookie Policy',
    intro: "Questa pagina spiega quali cookie e strumenti simili utilizza il sito www.nextlabeurope.eu, in conformità alle Linee guida del Garante per la protezione dei dati personali del 10 giugno 2021.",
    sections: [
      { h: '1. Cosa sono i cookie', p: ['I cookie sono piccoli file di testo che un sito può salvare sul dispositivo di chi lo visita, per farlo funzionare o per raccogliere informazioni sulla navigazione. Esistono cookie tecnici, necessari al funzionamento del sito, e cookie di profilazione o di statistica, che richiedono il consenso dell\'utente.'] },
      { h: '2. Cookie utilizzati da questo sito', p: ['Questo sito non installa cookie di profilazione, cookie di statistica né cookie di terze parti, e non utilizza strumenti di tracciamento come Google Analytics o pixel dei social network.', 'Caratteri tipografici e immagini sono ospitati direttamente sul nostro sito: la tua navigazione non viene comunicata a servizi esterni di terze parti.', 'Per questo motivo il sito non mostra un banner per la raccolta del consenso, che la normativa richiede solo in presenza di cookie o strumenti diversi da quelli tecnici.'] },
      { h: '3. Dati tecnici di navigazione', p: ["Come avviene per qualsiasi sito web, il fornitore di hosting (Vercel Inc.) registra alcuni dati tecnici delle richieste, come l'indirizzo IP, per garantire il funzionamento e la sicurezza del servizio. Questi dati non vengono usati per profilarti. Maggiori dettagli sono nell'Informativa sulla privacy."] },
      { h: '4. Come gestire i cookie dal browser', p: ['Puoi comunque decidere in ogni momento di bloccare o cancellare i cookie dalle impostazioni del tuo browser (per esempio Chrome, Firefox, Safari o Edge, nella sezione dedicata a privacy e sicurezza).'] },
      { h: '5. Modifiche', p: ['Se in futuro il sito dovesse utilizzare cookie o strumenti diversi da quelli tecnici, questa pagina verrà aggiornata e, quando richiesto dalla legge, ti verrà chiesto il consenso prima di attivarli.', 'Per qualsiasi informazione puoi scrivere a info@nextlabeurope.eu.'] },
    ],
  },
  en: {
    title: 'Cookie Policy',
    intro: 'This page explains which cookies and similar tools are used by www.nextlabeurope.eu, in accordance with the Guidelines of the Italian Data Protection Authority of 10 June 2021.',
    sections: [
      { h: '1. What cookies are', p: ['Cookies are small text files that a website can store on a visitor\'s device, to make it work or to collect information about browsing. There are technical cookies, needed for the site to work, and profiling or analytics cookies, which require the user\'s consent.'] },
      { h: '2. Cookies used by this site', p: ['This site does not set profiling cookies, analytics cookies or third-party cookies, and does not use tracking tools such as Google Analytics or social media pixels.', 'Fonts and images are hosted directly on our site: your browsing is not shared with external third-party services.', 'For this reason the site does not show a consent banner, which the law requires only when cookies or tools other than technical ones are used.'] },
      { h: '3. Technical browsing data', p: ['As with any website, the hosting provider (Vercel Inc.) records some technical data about requests, such as the IP address, to ensure the service works and is secure. This data is not used to profile you. More details are in the Privacy Policy.'] },
      { h: '4. Managing cookies in your browser', p: ['You can block or delete cookies at any time in your browser settings (for example Chrome, Firefox, Safari or Edge, under privacy and security).'] },
      { h: '5. Changes', p: ['If in the future the site uses cookies or tools other than technical ones, this page will be updated and, where required by law, your consent will be requested before they are activated.', 'For any information, write to info@nextlabeurope.eu.'] },
    ],
  },
};
